import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import AppShell from '../components/AppShell';

const statusClass = {
  pending: 'bg-amber-100 text-amber-800',
  booked: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-sky-100 text-sky-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
  on_hold: 'bg-slate-200 text-slate-700',
};

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctorAppointments = async () => {
      try {
        setLoading(true);
        const { data } = await client.get('/appointments/doctor');
        setAppointments(data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorAppointments();
  }, []);

  return (
    <AppShell title="Today's Appointments" subtitle="Review patient visits and complete consultations.">
      {loading ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">Loading appointments...</div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">No appointments scheduled.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Patient</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="border-t border-slate-200">
                  <td className="px-4 py-3">{appointment.patientId?.name || 'Patient'}</td>
                  <td className="px-4 py-3">{appointment.date}</td>
                  <td className="px-4 py-3">{appointment.slotTime}</td>
                  <td className="px-4 py-3">{appointment.reason || 'Not specified'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass[appointment.status] || 'bg-slate-200 text-slate-700'}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/doctor/appointments/${appointment._id}`} className="rounded bg-teal-700 px-3 py-1.5 text-white hover:bg-teal-600">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
