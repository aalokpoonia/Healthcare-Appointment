const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');

const createToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'change-me', { expiresIn: '7d' });

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role = 'patient' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, phone, role });

    if (role === 'patient') {
      await Patient.create({ userId: user._id });
    }

    res.status(201).json({
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { registerUser, loginUser, getMe };
