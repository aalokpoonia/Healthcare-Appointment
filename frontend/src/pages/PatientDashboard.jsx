import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await client.get('/appointments/me');
        setAppointments(data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const upcoming = appointments.filter((item) => ['booked', 'confirmed', 'on_hold'].includes(item.status));
  const completed = appointments.filter((item) => item.status === 'completed');
  const cancelled = appointments.filter((item) => item.status === 'cancelled');
  const nextAppointment = upcoming[0] || null;

  return (
    <AppShell title="Patient Dashboard" subtitle={`Welcome back, ${user?.name}. Here is your care overview.`}>
      {loading ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">Loading dashboard...</div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Upcoming</p><p className="mt-2 text-3xl font-bold text-slate-900">{upcoming.length}</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Completed</p><p className="mt-2 text-3xl font-bold text-slate-900">{completed.length}</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Cancelled</p><p className="mt-2 text-3xl font-bold text-slate-900">{cancelled.length}</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total</p><p className="mt-2 text-3xl font-bold text-slate-900">{appointments.length}</p></div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Upcoming appointment</h2>
              {nextAppointment ? (
                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <p className="text-lg font-semibold text-slate-900">{nextAppointment.doctorId?.userId?.name || 'Doctor'}</p>
                  <p className="text-sm text-slate-600">{nextAppointment.doctorId?.specialization || 'General consultation'}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-700">
                    <span>{nextAppointment.date}</span>
                    <span>{nextAppointment.slotTime}</span>
                    <span className="rounded-full bg-white px-2 py-1 text-xs uppercase">{nextAppointment.status}</span>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No upcoming appointments. Book a consultation to get started.</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Quick actions</h2>
              <div className="mt-4 grid gap-3">
                <Link to="/book" className="rounded bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-blue-500">Book Appointment</Link>
                <Link to="/doctors" className="rounded bg-slate-800 px-4 py-3 text-center text-sm font-medium text-white hover:bg-slate-700">Browse Doctors</Link>
                <Link to="/appointments" className="rounded bg-green-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-green-500">My Appointments</Link>
                <Link to="/profile" className="rounded bg-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-800 hover:bg-slate-300">Edit Profile</Link>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Recent appointments</h2>
            <div className="mt-4 space-y-3">
              {appointments.length === 0 ? (
                <p className="text-sm text-slate-500">No appointment history yet.</p>
              ) : (
                appointments.slice(0, 4).map((appointment) => (
                  <div key={appointment._id} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{appointment.doctorId?.userId?.name || 'Doctor'}</p>
                      <p className="text-sm text-slate-600">{appointment.date} • {appointment.slotTime}</p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-xs uppercase text-slate-700">{appointment.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
