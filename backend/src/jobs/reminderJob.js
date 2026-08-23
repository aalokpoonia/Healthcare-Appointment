const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { queueNotification } = require('../services/notificationService');

function startReminderJob() {
  cron.schedule('*/5 * * * *', async () => {
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
    } catch (error) {
      console.error('Reminder job error:', error.message);
    }
  });

  console.log('Reminder job started');
}

module.exports = { startReminderJob };
