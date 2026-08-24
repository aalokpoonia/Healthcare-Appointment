const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true },
    qualification: { type: String, default: '' },
    experience: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 500 },
    hospitalName: { type: String, default: '' },
    availableDays: [{ type: String }],
    workingHours: {
      start: { type: String, required: true, default: '09:00' },
      end: { type: String, required: true, default: '17:00' },
    },
    slotDuration: { type: Number, default: 30 },
    leaveDays: [{ type: String }],
    bio: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
