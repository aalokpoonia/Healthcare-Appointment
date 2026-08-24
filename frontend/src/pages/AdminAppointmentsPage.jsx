import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import AppShell from '../components/AppShell';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const { data } = await client.get('/admin/appointments');
        setAppointments(data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appointment) => statusFilter === 'all' || appointment.status === statusFilter);

  return (
    <AppShell title="Appointments" subtitle="Monitor all appointments across the healthcare platform.">
      <div className="mb-4 flex justify-end">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded border border-slate-300 bg-white px-3 py-2">
          <option value="all">All statuses</option>
          <option value="booked">Booked</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">Loading appointments...</div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">No appointments found for the selected filter.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Patient</th>
                <th className="px-4 py-3 font-semibold">Doctor</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment._id} className="border-t border-slate-200">
                  <td className="px-4 py-3">{appointment.patientId?.name || 'Patient'}</td>
                  <td className="px-4 py-3">{appointment.doctorId?.userId?.name || 'Doctor'}</td>
                  <td className="px-4 py-3">{appointment.date}</td>
                  <td className="px-4 py-3">{appointment.slotTime}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-slate-200 px-2 py-1 text-xs uppercase">{appointment.status}</span></td>
                  <td className="px-4 py-3">
                    <Link to={`/appointments/${appointment._id}`} className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-500">View</Link>
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
