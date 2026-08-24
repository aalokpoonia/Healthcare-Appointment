const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const connectDB = require('../config/db');

dotenv.config();

const doctorProfiles = [
  {
    name: 'Dr. Meera Sharma',
    email: 'doctor.demo@example.com',
    password: 'Doctor@123',
    phone: '9876543210',
    specialization: 'General Physician',
    qualification: 'MBBS, MD (General Medicine)',
    experience: 12,
    consultationFee: 600,
    hospitalName: 'CareConnect Clinic',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    bio: 'General physician focused on preventive care, chronic disease monitoring, and treatment planning.',
  },
  {
    name: 'Dr. Arjun Nair',
    email: 'cardio.demo@example.com',
    password: 'Doctor@123',
    phone: '9876543211',
    specialization: 'Cardiologist',
    qualification: 'MBBS, DM (Cardiology)',
    experience: 15,
    consultationFee: 900,
    hospitalName: 'City Heart Centre',
    availableDays: ['Mon', 'Tue', 'Wed', 'Fri'],
    bio: 'Cardiologist managing hypertension, rhythm disorders, and heart health follow-up plans.',
  },
  {
    name: 'Dr. Kavya Iyer',
    email: 'derma.demo@example.com',
    password: 'Doctor@123',
    phone: '9876543212',
    specialization: 'Dermatologist',
    qualification: 'MBBS, MD (Dermatology)',
    experience: 9,
    consultationFee: 750,
    hospitalName: 'SkinWell Dermatology',
    availableDays: ['Tue', 'Wed', 'Thu', 'Sat'],
    bio: 'Dermatology consultations for skin health, allergies, and preventive skincare guidance.',
  },
  {
    name: 'Dr. Rohan Patil',
    email: 'ortho.demo@example.com',
    password: 'Doctor@123',
    phone: '9876543213',
    specialization: 'Orthopedic',
    qualification: 'MBBS, MS (Orthopedics)',
    experience: 11,
    consultationFee: 850,
    hospitalName: 'Motive Ortho Care',
    availableDays: ['Mon', 'Wed', 'Thu', 'Fri'],
    bio: 'Orthopedic consultation for musculoskeletal pain, mobility issues, and post-injury care.',
  },
  {
    name: 'Dr. Sana Khan',
    email: 'pediatrics.demo@example.com',
    password: 'Doctor@123',
    phone: '9876543214',
    specialization: 'Pediatrician',
    qualification: 'MBBS, MD (Pediatrics)',
    experience: 10,
    consultationFee: 650,
    hospitalName: 'BrightCare Pediatrics',
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat'],
    bio: 'Pediatric consultations covering child wellness, immunization planning, and common ailments.',
  },
];

const patientProfiles = [
  {
    name: 'Aarav Verma',
    email: 'patient.demo@example.com',
    password: 'Patient@123',
    phone: '9988776655',
    dateOfBirth: '1998-05-14',
    gender: 'Male',
    address: 'H.No. 21, Green Park, Bengaluru',
    emergencyContact: 'Mother - 9988776611',
  },
  {
    name: 'Priya Nair',
    email: 'priya.demo@example.com',
    password: 'Patient@123',
    phone: '9988776656',
    dateOfBirth: '1996-08-10',
    gender: 'Female',
    address: '12th Cross, Koramangala, Bengaluru',
    emergencyContact: 'Brother - 9988776622',
  },
];

const adminProfile = {
  name: 'Admin User',
  email: 'admin.demo@example.com',
  password: 'Admin@123',
  phone: '9000000001',
};

async function createUserFromProfile(profile, role) {
  const existing = await User.findOne({ email: profile.email });
  if (existing) return existing;

  const user = await User.create({
    name: profile.name,
    email: profile.email,
    password: profile.password,
    phone: profile.phone || '',
    role,
  });

  if (role === 'patient') {
    await Patient.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        address: profile.address || '',
        emergencyContact: profile.emergencyContact || '',
      },
      { upsert: true, new: true }
    );
  }

  if (role === 'doctor') {
    await Doctor.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        specialization: profile.specialization,
        qualification: profile.qualification,
        experience: profile.experience,
        consultationFee: profile.consultationFee,
        hospitalName: profile.hospitalName,
        availableDays: profile.availableDays,
        workingHours: { start: '09:00', end: '17:00' },
        slotDuration: 30,
        bio: profile.bio,
        isActive: true,
      },
      { upsert: true, new: true }
    );
  }

  return user;
}

async function seedDatabase() {
  await connectDB();

  await Appointment.deleteMany({});

  const adminUser = await createUserFromProfile(adminProfile, 'admin');
  console.log('Seeded admin:', adminUser.email);

  for (const patient of patientProfiles) {
    const user = await createUserFromProfile(patient, 'patient');
    console.log('Seeded patient:', user.email);
  }

  for (const doctor of doctorProfiles) {
    const user = await createUserFromProfile(doctor, 'doctor');
    console.log('Seeded doctor:', user.email);
  }

  await mongoose.disconnect();
  console.log('Demo data seed completed.');
}

seedDatabase().catch((error) => {
  console.error('Seed error:', error);
  process.exit(1);
});
