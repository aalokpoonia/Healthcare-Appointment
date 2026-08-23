const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

function parseTimeToMinutes(value) {
  const [hour, minute] = String(value).split(':').map(Number);
  return hour * 60 + minute;
}

function toTimeString(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

async function generateDoctorSlots(doctorId, dateString) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const startMinutes = parseTimeToMinutes(doctor.workingHours.start);
  const endMinutes = parseTimeToMinutes(doctor.workingHours.end);
  const duration = Number(doctor.slotDuration) || 30;

  if (endMinutes <= startMinutes) return [];

  const busy = await Appointment.find({ doctorId, date: dateString, status: { $ne: 'cancelled' } }).select('slotTime');
  const busySet = new Set(busy.map((slot) => slot.slotTime));

  const slots = [];
  for (let t = startMinutes; t + duration <= endMinutes; t += duration) {
    const slotTime = toTimeString(t);
    if ((doctor.leaveDays || []).includes(dateString)) continue;
    if (!busySet.has(slotTime)) slots.push(slotTime);
  }

  return slots;
}

module.exports = { generateDoctorSlots, parseTimeToMinutes, toTimeString };
