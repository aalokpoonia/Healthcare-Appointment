const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Prescription = require('../models/Prescription');
const { queueNotification } = require('../services/notificationService');

function getFrequencyTimes(frequency) {
  switch (frequency) {
    case 'once daily':
      return ['09:00'];
    case 'twice daily':
      return ['08:00', '20:00'];
    case 'three times daily':
      return ['08:00', '13:00', '20:00'];
    default:
      return [];
  }
}

function getNextMedicationReminderAt(frequency, fromDate = new Date()) {
  const times = getFrequencyTimes(frequency);
  if (!times.length) return null;

  let earliest = null;
  for (const time of times) {
    const candidate = new Date(fromDate);
    const [hour, minute] = time.split(':').map(Number);
    candidate.setHours(hour, minute, 0, 0);

    if (candidate > fromDate) {
      earliest = candidate;
      break;
    }
  }

  if (!earliest) {
    const nextDay = new Date(fromDate);
    nextDay.setHours(0, 0, 0, 0);
    nextDay.setDate(nextDay.getDate() + 1);
    const [hour, minute] = times[0].split(':').map(Number);
    nextDay.setHours(hour, minute, 0, 0);
    earliest = nextDay;
  }

  return earliest;
}

function startReminderJob() {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const appointments = await Appointment.find({ status: 'booked' });
      for (const appointment of appointments) {
        const patient = await User.findById(appointment.patientId).select('email name');
        const doctor = await Doctor.findById(appointment.doctorId).populate('userId', 'name email');
        if (!patient || !doctor) continue;

        const payload = {
          email: patient.email,
          subject: 'Appointment reminder',
          text: `Hello ${patient.name}, this is a reminder for your appointment with ${doctor.userId.name} on ${appointment.date} at ${appointment.slotTime}.`,
          html: `<p>Hello ${patient.name},</p><p>This is a reminder for your appointment with ${doctor.userId.name} on ${appointment.date} at ${appointment.slotTime}.</p>`,
        };

        await queueNotification({
          userId: patient._id,
          appointmentId: appointment._id,
          type: 'reminder',
          payload,
        });
      }

      const prescriptions = await Prescription.find();
      for (const prescription of prescriptions) {
        const appointment = await Appointment.findById(prescription.appointmentId);
        if (!appointment || !appointment.prescriptionFrequency || !appointment.prescription) continue;

        const dueAt = appointment.nextMedicationReminderAt || getNextMedicationReminderAt(appointment.prescriptionFrequency, new Date());
        const now = new Date();
        if (!dueAt || now < dueAt) continue;

        const patient = await User.findById(appointment.patientId).select('email name');
        if (!patient) continue;

        await queueNotification({
          userId: patient._id,
          appointmentId: appointment._id,
          type: 'medication_reminder',
          payload: {
            email: patient.email,
            subject: 'Medication reminder',
            text: `Hello ${patient.name}, this is a medication reminder for: ${appointment.prescription}. Please follow the prescribed schedule (${appointment.prescriptionFrequency}).`,
            html: `<p>Hello ${patient.name},</p><p>This is a medication reminder for: ${appointment.prescription}</p><p>Schedule: ${appointment.prescriptionFrequency}</p>`,
          },
        });

        appointment.nextMedicationReminderAt = getNextMedicationReminderAt(appointment.prescriptionFrequency, now);
        await appointment.save();
      }
    } catch (error) {
      console.error('Reminder job error:', error.message);
    }
  }, { noOverlap: true });

  console.log('Reminder job started');
}

module.exports = { startReminderJob, getFrequencyTimes, getNextMedicationReminderAt };
