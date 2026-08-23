const Doctor = require('../models/Doctor');

const getDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', 'name email phone');
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOneAndUpdate({ userId: req.user._id }, req.body, { new: true }).populate('userId', 'name email phone');
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDoctorProfile, updateDoctorProfile };
