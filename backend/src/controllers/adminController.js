const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { queueNotification } = require('../services/notificationService');

const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'name email phone');
    res.json(doctors);
  } catch (error) {
    next(error);
  }
};

const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      qualification,
      experience,
      consultationFee,
      hospitalName,
      availableDays,
      workingHours,
      slotDuration,
      bio,
      isActive,
    } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'doctor',
    });

    const doctor = await Doctor.create({
      userId: user._id,
      specialization,
      qualification: qualification || '',
      experience: Number(experience) || 0,
      consultationFee: Number(consultationFee) || 500,
      hospitalName: hospitalName || '',
      availableDays: Array.isArray(availableDays) ? availableDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      workingHours: workingHours || { start: '09:00', end: '17:00' },
      slotDuration: slotDuration || 30,
      bio: bio || '',
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ doctor, user });
  } catch (error) {
    next(error);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('userId', 'name email');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    await User.findByIdAndDelete(doctor.userId);
    await doctor.deleteOne();
    res.json({ message: 'Doctor removed' });
  } catch (error) {
    next(error);
  }
};

const markDoctorLeave = async (req, res, next) => {
  try {
    const { date } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    doctor.leaveDays = doctor.leaveDays || [];
    if (!doctor.leaveDays.includes(date)) doctor.leaveDays.push(date);
    await doctor.save();

    const bookings = await Appointment.find({ doctorId: doctor._id, date, status: { $ne: 'cancelled' } });
    for (const item of bookings) {
      item.status = 'flagged';
      await item.save();

      const patient = await User.findById(item.patientId).select('email name');
      if (patient) {
        await queueNotification({
          userId: patient._id,
          appointmentId: item._id,
          type: 'cancellation',
          payload: {
            email: patient.email,
            subject: 'Appointment cancelled due to doctor leave',
            text: `Hello ${patient.name}, your appointment on ${item.date} has been cancelled because the doctor has marked leave.`,
          },
        });
      }
    }

    res.json({ message: 'Doctor leave recorded and affected appointments flagged', bookings: bookings.length });
  } catch (error) {
    next(error);
  }
};

const getAdminStats = async (req, res, next) => {
  try {
    const [totalPatients, totalDoctors, todayAppointments, completedAppointments] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments({ date: new Date().toISOString().slice(0, 10) }),
      Appointment.countDocuments({ status: 'completed' }),
    ]);

    res.json({
      totalPatients,
      totalDoctors,
      todayAppointments,
      completedAppointments,
    });
  } catch (error) {
    next(error);
  }
};

const getPatients = async (req, res, next) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password').sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    next(error);
  }
};

const getAppointmentsForAdmin = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email phone')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email phone' }, select: 'specialization qualification consultationFee isActive userId' })
      .sort({ date: 1, slotTime: 1 });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

const toggleDoctorStatus = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    doctor.isActive = !doctor.isActive;
    await doctor.save();

    res.json({ message: `Doctor ${doctor.isActive ? 'activated' : 'deactivated'} successfully`, doctor });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  markDoctorLeave,
  getAdminStats,
  getPatients,
  getAppointmentsForAdmin,
  toggleDoctorStatus,
};
