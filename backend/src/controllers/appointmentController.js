const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const { generateDoctorSlots } = require('../services/slotService');
const { askLLM } = require('../services/llmService');
const { queueNotification } = require('../services/notificationService');
const { createCalendarEvent } = require('../services/calendarService');

const searchDoctors = async (req, res, next) => {
  try {
    const { specialization } = req.query;
    const filter = specialization ? { specialization: { $regex: specialization, $options: 'i' } } : {};
    const doctors = await Doctor.find(filter).populate('userId', 'name email phone');
    res.json(doctors);
  } catch (error) {
    next(error);
  }
};

const getAvailableSlots = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const { date } = req.query;
    const slots = await generateDoctorSlots(doctorId, date);
    res.json({ date, slots });
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, slotTime, reason, notes } = req.body;
    const patientId = req.user._id;

    if (!doctorId || !date || !slotTime) {
      return res.status(400).json({ message: 'Doctor, date and time are required' });
    }

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: 'Reason for visit is required' });
    }

    if (!/\d{4}-\d{2}-\d{2}/.test(date)) {
      return res.status(400).json({ message: 'Date must be valid in YYYY-MM-DD format' });
    }

    const doctor = await Doctor.findById(doctorId).populate('userId', 'name email');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (!doctor.isActive) return res.status(400).json({ message: 'Doctor is currently inactive' });

    const selectedDay = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
    const allowedDays = (doctor.availableDays || []).map((day) => String(day).trim());
    if (allowedDays.length && !allowedDays.includes(selectedDay)) {
      return res.status(400).json({ message: 'Doctor is not available on this day.' });
    }

    const availableSlots = await generateDoctorSlots(doctorId, date);
    const requestedSlot = availableSlots.find((slot) => slot.time === slotTime || slot.label === slotTime);
    if (!requestedSlot || !requestedSlot.available) {
      return res.status(400).json({ message: 'Selected time slot is not available.' });
    }

    const existing = await Appointment.findOne({ doctorId, date, slotTime, status: { $ne: 'cancelled' } });
    if (existing) {
      return res.status(409).json({ message: 'This slot has already been booked' });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { doctorId, date, slotTime, status: { $ne: 'cancelled' } },
      {
        $setOnInsert: {
          doctorId,
          patientId,
          date,
          slotTime,
          reason: reason || '',
          notes: notes || '',
          status: 'booked',
          holdUntil: new Date(Date.now() + 2 * 60 * 1000),
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    if (!appointment || !appointment._id) {
      return res.status(409).json({ message: 'Slot unavailable; another request booked it first' });
    }

    const patient = await User.findById(patientId).select('name email');

    try {
      const event = await createCalendarEvent({
        summary: `Appointment with ${doctor.userId.name}`,
        description: `Healthcare appointment for ${patient.name}`,
        startTime: new Date(`${date}T${slotTime}:00Z`).toISOString(),
        endTime: new Date(new Date(`${date}T${slotTime}:00Z`).getTime() + (doctor.slotDuration || 30) * 60 * 1000).toISOString(),
        email: patient.email,
      });

      if (event && event.status === 'synced') {
        appointment.googleEventId = event.eventId || '';
        appointment.calendarSyncStatus = 'synced';
      } else if (event && event.status === 'failed') {
        appointment.calendarSyncStatus = 'failed';
        console.error('Appointment created successfully but Google Calendar sync failed:', event.message);
      } else {
        appointment.calendarSyncStatus = 'skipped';
      }

      await appointment.save();
    } catch (error) {
      console.error('Calendar sync handler failed after appointment creation:', error.message || error);
      appointment.calendarSyncStatus = 'failed';
      await appointment.save();
    }

    await queueNotification({
      userId: patientId,
      appointmentId: appointment._id,
      type: 'booking_confirmation',
      payload: {
        email: patient.email,
        subject: 'Appointment booked successfully',
        text: `Hi ${patient.name}, your appointment is booked with ${doctor.userId.name} on ${date} at ${slotTime}.`,
      },
    });

    res.status(201).json({ appointment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Slot already reserved by another patient' });
    }
    next(error);
  }
};

const holdSlot = async (req, res, next) => {
  try {
    const { doctorId, date, slotTime } = req.body;
    const appointment = await Appointment.findOne({ doctorId, date, slotTime, status: { $ne: 'cancelled' } });
    if (!appointment) return res.status(404).json({ message: 'Slot not found' });

    appointment.holdUntil = new Date(Date.now() + 2 * 60 * 1000);
    appointment.status = 'on_hold';
    await appointment.save();

    res.json({ message: 'Slot held for 2 minutes', holdUntil: appointment.holdUntil });
  } catch (error) {
    next(error);
  }
};

const submitSymptomForm = async (req, res, next) => {
  try {
    const { appointmentId, symptoms, symptomsDuration, severity, currentMedications, allergies, additionalNotes } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not allowed to submit notes for this appointment' });
    }

    const payload = {
      symptoms,
      symptomsDuration,
      severity,
      currentMedications,
      allergies,
      additionalNotes,
    };

    const preVisitResult = await askLLM(`Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Symptoms: ${symptoms}`, 'previsit');
    appointment.symptomSummary = JSON.stringify(payload);
    appointment.preVisitSummary = preVisitResult.fallback ? { urgency: 'Medium', chiefComplaint: 'Not available', suggestedQuestions: ['Please review notes manually.'] } : preVisitResult.data;
    appointment.status = 'confirmed';
    await appointment.save();

    res.json({ appointment });
  } catch (error) {
    next(error);
  }
};

const getPatientAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email phone' } })
      .sort({ date: 1, slotTime: 1 });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email phone' } })
      .populate('patientId', 'name email phone');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const isDoctor = appointment.doctorId && appointment.doctorId.userId && appointment.doctorId.userId._id.toString() === req.user._id.toString();
    const isPatient = appointment.patientId && appointment.patientId._id.toString() === req.user._id.toString();
    if (!isDoctor && !isPatient && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }

    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.patientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }
    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Completed appointments cannot be cancelled' });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (error) {
    next(error);
  }
};

const doctorAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'name email phone dateOfBirth gender address emergencyContact')
      .sort({ date: 1, slotTime: 1 });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

const submitClinicalSummary = async (req, res, next) => {
  try {
    const { appointmentId, diagnosis, clinicalNotes, prescription, prescriptionFrequency, followUpDate, recommendations } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to complete this consultation' });
    }

    if (req.user.role !== 'admin' && appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'You can only complete appointments assigned to your clinic' });
    }

    const summaryResult = await askLLM(`Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: ${clinicalNotes}`, 'postvisit');
    appointment.diagnosis = diagnosis || '';
    appointment.clinicalNotes = clinicalNotes || '';
    appointment.prescription = prescription || '';
    appointment.prescriptionFrequency = prescriptionFrequency || appointment.prescriptionFrequency || '';
    appointment.followUpDate = followUpDate || '';
    appointment.recommendations = recommendations || '';
    appointment.doctorNotes = clinicalNotes || '';
    appointment.postVisitSummary = summaryResult.fallback ? 'Summary unavailable — please review notes manually.' : JSON.stringify(summaryResult.data);
    appointment.status = 'completed';
    appointment.nextMedicationReminderAt = appointment.prescriptionFrequency ? new Date(Date.now() + 30 * 60 * 1000) : null;
    await appointment.save();

    if (appointment.prescription) {
      const medicationName = String(appointment.prescription).split(/\r?\n|;|,|\./)[0]?.trim() || 'Medication';
      const medicationRecord = await Prescription.findOne({ appointmentId: appointment._id });
      const prescriptionPayload = {
        appointmentId: appointment._id,
        patientId: appointment.patientId,
        medicationName,
        dosage: appointment.prescription.includes(' - ') ? appointment.prescription.split(' - ')[1]?.trim() || 'As directed' : 'As directed',
        frequency: appointment.prescriptionFrequency || 'once daily',
        duration: appointment.followUpDate ? `Until ${appointment.followUpDate}` : '7 days',
        notes: appointment.recommendations || appointment.clinicalNotes || '',
      };

      if (medicationRecord) {
        Object.assign(medicationRecord, prescriptionPayload);
        await medicationRecord.save();
      } else {
        await Prescription.create(prescriptionPayload);
      }
    }

    res.json({ appointment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchDoctors,
  getAvailableSlots,
  createAppointment,
  holdSlot,
  submitSymptomForm,
  getPatientAppointments,
  getAppointmentById,
  cancelAppointment,
  doctorAppointments,
  submitClinicalSummary,
};
