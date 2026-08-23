import { useEffect, useState } from 'react';
import client from '../api/client';

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    client.get('/appointments/doctors').then((res) => setDoctors(res.data)).catch(() => setDoctors([]));
  }, []);

  const fetchSlots = async () => {
    if (!selectedDoctor || !date) return;
    const res = await client.get(`/appointments/doctors/${selectedDoctor}/slots?date=${date}`);
    setSlots(res.data.slots || []);
  };

  const book = async (slotTime) => {
    try {
      const res = await client.post('/appointments/book', { doctorId: selectedDoctor, date, slotTime });
      setMessage(`Booked ${res.data.appointment.slotTime} on ${res.data.appointment.date}`);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Book Appointment</h1>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} className="border rounded p-2">
          <option value="">Select doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>{doctor.userId?.name} - {doctor.specialization}</option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded p-2" />
      </div>
      <button onClick={fetchSlots} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">Check slots</button>
      <div className="grid md:grid-cols-4 gap-3">
        {slots.map((slot) => (
          <button key={slot} onClick={() => book(slot)} className="border border-slate-200 rounded p-3 hover:bg-slate-100">{slot}</button>
        ))}
      </div>
      {message && <p className="mt-4 text-green-700">{message}</p>}
    </div>
  );
}
