import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import client from '../api/client';

const defaultSlotState = { time: '', reason: '', notes: '' };

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [form, setForm] = useState({ reason: '', notes: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const doctorId = searchParams.get('doctorId');
    if (doctorId) {
      setSelectedDoctor(doctorId);
    }
  }, [searchParams]);

  const selectedDoctorInfo = useMemo(
    () => doctors.find((doctor) => doctor._id === selectedDoctor) || null,
    [selectedDoctor, doctors]
  );

  useEffect(() => {
    client.get('/appointments/doctors').then((res) => setDoctors(res.data || [])).catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor || !date) {
        setSlots([]);
        setSelectedSlot('');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const res = await client.get(`/appointments/doctors/${selectedDoctor}/slots?date=${date}`);
        const nextSlots = Array.isArray(res.data.slots) ? res.data.slots : [];
        setSlots(nextSlots);
        setSelectedSlot('');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load available slots.');
        setSlots([]);
        setSelectedSlot('');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDoctor, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoctor || !date || !selectedSlot || !form.reason.trim()) {
      setError('Please select a doctor, date, time slot, and reason for visit.');
      return;
    }

    setConfirming(true);
    setError('');
    setMessage('');

    try {
      const res = await client.post('/appointments/book', {
        doctorId: selectedDoctor,
        date,
        slotTime: selectedSlot,
        reason: form.reason,
        notes: form.notes,
      });

      setMessage('Appointment booked successfully.');
      setForm({ reason: '', notes: '' });
      setSelectedSlot('');
      setConfirming(false);
      setSlots((prev) => prev.map((slot) => (slot.time === selectedSlot ? { ...slot, available: false } : slot)));
      return res;
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed.');
      setConfirming(false);
    }
  };

  return (
    <AppShell title="Book Appointment" subtitle="Choose a doctor, available date, and a suitable time slot.">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.45fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Doctor details</h2>
          {selectedDoctorInfo ? (
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div>
                <p className="text-lg font-semibold text-slate-900">{selectedDoctorInfo.userId?.name || 'Doctor'}</p>
                <p className="text-sm text-teal-700">{selectedDoctorInfo.specialization}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p><span className="font-semibold text-slate-700">Qualification:</span> {selectedDoctorInfo.qualification || 'Not specified'}</p>
                <p className="mt-1"><span className="font-semibold text-slate-700">Experience:</span> {selectedDoctorInfo.experience || 0} years</p>
                <p className="mt-1"><span className="font-semibold text-slate-700">Consultation fee:</span> ₹{selectedDoctorInfo.consultationFee || 500}</p>
                <p className="mt-1"><span className="font-semibold text-slate-700">Availability:</span> {selectedDoctorInfo.availableDays?.join(', ') || 'Mon - Fri'}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Select a doctor to view their details.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Select doctor</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-600"
              >
                <option value="">Choose a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.userId?.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Choose date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Selected time</label>
              <input
                type="text"
                value={selectedSlot ? selectedSlot : 'Not selected'}
                readOnly
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-slate-700">Available time slots</p>
            {selectedDoctor && date ? (
              loading ? (
                <p className="text-sm text-slate-500">Loading time slots...</p>
              ) : slots.length === 0 ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Doctor is not available on this day.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-4">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => slot.available && setSelectedSlot(slot.time)}
                      disabled={!slot.available}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        !slot.available
                          ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                          : selectedSlot === slot.time
                            ? 'border-teal-600 bg-teal-600 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-500 hover:bg-teal-50'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )
            ) : (
              <p className="text-sm text-slate-500">Choose a doctor and date to view available slots.</p>
            )}
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Reason for visit</label>
              <input
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-600"
                placeholder="Brief reason for consultation"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Additional notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-600"
                placeholder="Any details the doctor should know"
              />
            </div>
          </div>

          {(selectedDoctorInfo || selectedSlot || form.reason || date) && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-base font-semibold text-slate-900">Appointment summary</h3>
              <dl className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between gap-3"><dt>Doctor</dt><dd className="font-medium text-slate-800">{selectedDoctorInfo?.userId?.name || 'Not selected'}</dd></div>
                <div className="flex justify-between gap-3"><dt>Specialization</dt><dd className="font-medium text-slate-800">{selectedDoctorInfo?.specialization || 'Not selected'}</dd></div>
                <div className="flex justify-between gap-3"><dt>Date</dt><dd className="font-medium text-slate-800">{date || 'Not selected'}</dd></div>
                <div className="flex justify-between gap-3"><dt>Time</dt><dd className="font-medium text-slate-800">{selectedSlot || 'Not selected'}</dd></div>
                <div className="flex justify-between gap-3"><dt>Reason</dt><dd className="font-medium text-slate-800">{form.reason || 'Not entered'}</dd></div>
              </dl>
            </div>
          )}

          {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {message && <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" disabled={confirming} className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-600 disabled:opacity-60">
              {confirming ? 'Confirming...' : 'Confirm Appointment'}
            </button>
            {message && (
              <a href="/appointments" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                View Appointment
              </a>
            )}
          </div>
        </form>
      </div>
    </AppShell>
  );
}
