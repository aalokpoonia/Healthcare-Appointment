const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    slotTime: { type: String, required: true },
    reason: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['booked', 'on_hold', 'confirmed', 'completed', 'cancelled', 'flagged'],
      default: 'booked',
    },
    symptomSummary: { type: String, default: '' },
    preVisitSummary: { type: Object, default: {} },
    diagnosis: { type: String, default: '' },
    clinicalNotes: { type: String, default: '' },
    postVisitSummary: { type: String, default: '' },
    doctorNotes: { type: String, default: '' },
    prescription: { type: String, default: '' },
    prescriptionFrequency: { type: String, enum: ['once daily', 'twice daily', 'three times daily'], default: '' },
    followUpDate: { type: String, default: '' },
    recommendations: { type: String, default: '' },
    holdUntil: { type: Date, default: null },
    nextMedicationReminderAt: { type: Date, default: null },
    googleEventId: { type: String, default: '' },
    calendarSyncStatus: { type: String, default: 'pending' },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, date: 1, slotTime: 1 }, { unique: true });
appointmentSchema.index({ holdUntil: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Appointment', appointmentSchema);
