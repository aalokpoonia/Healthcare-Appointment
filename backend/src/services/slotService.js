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

function toDisplayTime(value) {
  const [hours, minutes] = String(value).split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function getDayName(dateString) {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return '';
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

async function generateDoctorSlots(doctorId, dateString) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const selectedDay = getDayName(dateString);
  const availableDays = (doctor.availableDays || []).map((day) => String(day).trim());

  if (selectedDay && availableDays.length > 0 && !availableDays.includes(selectedDay)) {
    return [];
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
    slots.push({
      time: slotTime,
      label: toDisplayTime(slotTime),
      available: !busySet.has(slotTime),
    });
  }

  return slots;
}

module.exports = { generateDoctorSlots, parseTimeToMinutes, toTimeString, toDisplayTime, getDayName };
