const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dateOfBirth: { type: Date },
    bloodGroup: { type: String, default: '' },
    allergies: [{ type: String }],
    medicalHistory: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
