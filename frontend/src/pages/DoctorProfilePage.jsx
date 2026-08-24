import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import AppShell from '../components/AppShell';

export default function DoctorProfilePage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const { data } = await client.get(`/appointments/doctors`);
        const selected = data.find((item) => item._id === id);
        if (!selected) {
          setError('Doctor profile not found.');
          return;
        }
        setDoctor(selected);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load doctor profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  return (
    <AppShell title="Doctor profile" subtitle="Review qualifications and consultation details before booking.">
      {loading ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">Loading doctor profile...</div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : doctor ? (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">{doctor.userId?.name || 'Doctor'}</h2>
            <p className="mt-2 text-lg font-medium text-blue-700">{doctor.specialization}</p>
            <p className="mt-4 text-slate-600">{doctor.bio || 'Providing evidence-based consultations and follow-up care.'}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm text-slate-600">
              <div className="rounded border border-slate-200 p-3"><span className="font-semibold text-slate-800">Qualification:</span> {doctor.qualification || 'Not specified'}</div>
              <div className="rounded border border-slate-200 p-3"><span className="font-semibold text-slate-800">Experience:</span> {doctor.experience || 0} years</div>
              <div className="rounded border border-slate-200 p-3"><span className="font-semibold text-slate-800">Consultation fee:</span> ₹{doctor.consultationFee || 500}</div>
              <div className="rounded border border-slate-200 p-3"><span className="font-semibold text-slate-800">Availability:</span> {doctor.availableDays?.join(', ') || 'Mon-Fri'}</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Consultation details</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li><span className="font-semibold text-slate-800">Email:</span> {doctor.userId?.email || 'N/A'}</li>
              <li><span className="font-semibold text-slate-800">Phone:</span> {doctor.userId?.phone || 'N/A'}</li>
              <li><span className="font-semibold text-slate-800">Hospital:</span> {doctor.hospitalName || 'Clinic care facility'}</li>
              <li><span className="font-semibold text-slate-800">Working hours:</span> {doctor.workingHours?.start || '09:00'} - {doctor.workingHours?.end || '17:00'}</li>
            </ul>
            <Link to={`/book?doctorId=${doctor._id}`} className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
              Book with this doctor
            </Link>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
