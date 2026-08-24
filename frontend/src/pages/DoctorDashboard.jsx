import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import client from '../api/client';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
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

    fetchAppointments();
  }, []);

  const todayAppointments = appointments.filter((item) => item.date === new Date().toISOString().slice(0, 10));
  const upcoming = appointments.filter((item) => ['booked', 'confirmed', 'on_hold'].includes(item.status));
  const completed = appointments.filter((item) => item.status === 'completed');
  const totalPatients = new Set(appointments.map((item) => item.patientId?._id).filter(Boolean)).size;

  return (
    <AppShell title="Doctor Dashboard" subtitle="Review patients, appointments, and clinical follow-ups for today.">
      {loading ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">Loading dashboard...</div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Today's appointments</p><p className="mt-2 text-3xl font-bold text-slate-900">{todayAppointments.length}</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Upcoming</p><p className="mt-2 text-3xl font-bold text-slate-900">{upcoming.length}</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Completed</p><p className="mt-2 text-3xl font-bold text-slate-900">{completed.length}</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Patients</p><p className="mt-2 text-3xl font-bold text-slate-900">{totalPatients}</p></div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Appointment queue</h2>
              <Link to="/doctor/appointments" className="text-sm font-medium text-blue-700 hover:text-blue-600">View all</Link>
            </div>
            <div className="overflow-x-auto">
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
                  {appointments.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-slate-500">No appointments available.</td></tr>
                  ) : (
                    appointments.slice(0, 5).map((appointment) => (
                      <tr key={appointment._id} className="border-t border-slate-200">
                        <td className="px-4 py-3">{appointment.patientId?.name || 'Patient'}</td>
                        <td className="px-4 py-3">{appointment.date}</td>
                        <td className="px-4 py-3">{appointment.slotTime}</td>
                        <td className="px-4 py-3">{appointment.reason || 'Not specified'}</td>
                        <td className="px-4 py-3"><span className="rounded-full bg-slate-200 px-2 py-1 text-xs uppercase">{appointment.status}</span></td>
                        <td className="px-4 py-3"><Link to={`/doctor/appointments/${appointment._id}`} className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-500">View</Link></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
