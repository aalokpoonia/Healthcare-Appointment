const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET || 'change-me',
    {
      expiresIn: '7d',
    }
  );
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  dateOfBirth: user.dateOfBirth || '',
  gender: user.gender || '',
  address: user.address || '',
  emergencyContact: user.emergencyContact || '',
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : '';
    const selectedRole = 'patient';

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      phone: cleanPhone,
      role: selectedRole,
    });

    if (selectedRole === 'patient') {
      try {
        await Patient.create({ userId: user._id });
      } catch (patientError) {
        console.error('Patient creation error:', patientError);
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({
          message: 'User created but patient profile could not be created',
          error: patientError.message,
        });
      }
    }

    return res.status(201).json({
      message: 'Registration successful',
      token: createToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({
      message: 'Registration failed',
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatched = await user.matchPassword(password);
    if (!passwordMatched) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      message: 'Login successful',
      token: createToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const patientProfile = user.role === 'patient' ? await Patient.findOne({ userId: user._id }) : null;
    return res.json({ user: sanitizeUser(user), patientProfile });
  } catch (error) {
    console.error('GET ME ERROR:', error);
    return res.status(500).json({ message: 'Unable to get current user', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const patientProfile = user.role === 'patient' ? await Patient.findOne({ userId: user._id }) : null;
    return res.json({ user: sanitizeUser(user), patientProfile });
  } catch (error) {
    console.error('PROFILE ERROR:', error);
    return res.status(500).json({ message: 'Profile fetch failed', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const allowedFields = ['name', 'phone', 'dateOfBirth', 'gender', 'address', 'emergencyContact'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.phone !== undefined) user.phone = req.body.phone.trim();
    if (req.body.address !== undefined) user.address = req.body.address.trim();
    if (req.body.emergencyContact !== undefined) user.emergencyContact = req.body.emergencyContact.trim();

    await user.save();

    if (user.role === 'patient') {
      const patientProfile = await Patient.findOne({ userId: user._id });
      if (!patientProfile) {
        await Patient.create({ userId: user._id });
      }
    }

    return res.json({
      message: 'Profile updated successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);
    return res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getProfile,
  updateProfile,
};