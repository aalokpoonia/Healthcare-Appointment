import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import client from '../api/client';

const statusClass = {
  pending: 'bg-amber-100 text-amber-800',
  booked: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-sky-100 text-sky-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
  on_hold: 'bg-slate-200 text-slate-700',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelId, setCancelId] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const { data } = await client.get('/appointments/me');
        setAppointments(data || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const upcoming = useMemo(
    () => appointments.filter((item) => item.status && ['booked', 'confirmed', 'on_hold', 'pending'].includes(item.status)),
    [appointments]
  );
  const past = useMemo(
    () => appointments.filter((item) => item.status && ['completed', 'cancelled'].includes(item.status)),
    [appointments]
  );

  const cancelAppointment = async (id) => {
    try {
      await client.patch(`/appointments/${id}/cancel`);
      setAppointments((prev) => prev.map((item) => (item._id === id ? { ...item, status: 'cancelled' } : item)));
      setCancelId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to cancel appointment.');
    }
  };

  const renderList = (items, title, emptyText) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 text-xl font-bold text-slate-900">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {items.map((appointment) => (
            <div key={appointment._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-800">{appointment.doctorId?.userId?.name || 'Doctor'}</p>
                  <p className="text-sm text-slate-600">{appointment.doctorId?.specialization || 'General consultation'}</p>
                </div>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[appointment.status] || 'bg-slate-100 text-slate-700'}`}>
                  {appointment.status || 'Pending'}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-1 text-sm text-slate-600 sm:flex-row sm:justify-between">
                <p>{appointment.date}</p>
                <p>{appointment.slotTime}</p>
              </div>

              <p className="mt-3 text-sm text-slate-600"><span className="font-semibold text-slate-700">Reason:</span> {appointment.reason || 'Not specified'}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link to={`/appointments/${appointment._id}`} className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
                  {appointment.status === 'completed' ? 'View Summary' : 'View Details'}
                </Link>

                {['booked', 'confirmed', 'on_hold', 'pending'].includes(appointment.status) && (
                  <button type="button" onClick={() => setCancelId(appointment._id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100">
                    Cancel
                  </button>
                )}
              </div>

              {cancelId === appointment._id && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <p className="font-medium">Are you sure you want to cancel this appointment?</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => cancelAppointment(appointment._id)} className="rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-500">
                      Cancel Appointment
                    </button>
                    <button type="button" onClick={() => setCancelId('')} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50">
                      Keep Appointment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <AppShell title="My Appointments" subtitle="Track consultations, upcoming visits, and completed follow-ups.">
      {loading ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">Loading appointments...</div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : (
        <div className="space-y-6">
          {renderList(upcoming, 'Upcoming', 'No upcoming appointments.')}
          {renderList(past, 'Past Appointments', 'No past appointments yet.')}
        </div>
      )}
    </AppShell>
  );
}
