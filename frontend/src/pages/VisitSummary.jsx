import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import client from '../api/client';

export default function VisitSummary() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await client.get('/appointments/me');
        setAppointments(data || []);
        const completed = (data || []).find((item) => item.status === 'completed');
        if (completed) setSelectedAppointment(completed._id);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load appointment summaries.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    const active = appointments.find((item) => item._id === selectedAppointment);
    if (!active) {
      setSummary('');
      return;
    }

    if (active.status === 'completed') {
      setSummary(active.postVisitSummary || 'No summary available yet.');
    } else {
      setSummary('Your consultation is still pending. Once the doctor completes the appointment, the summary will appear here.');
    }
  }, [appointments, selectedAppointment]);

  return (
    <AppShell title="Visit Summary" subtitle="Review the latest consultation summary and follow-up instructions.">
      {loading ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">Loading visit summary...</div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Select appointment</span>
            <select value={selectedAppointment} onChange={(e) => setSelectedAppointment(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2">
              <option value="">Select appointment</option>
              {appointments.map((item) => (
                <option key={item._id} value={item._id}>{item.doctorId?.userId?.name || 'Doctor'} • {item.date} • {item.slotTime}</option>
              ))}
            </select>
          </label>

          {error && <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          {summary && (
            <div className="mt-6 rounded border border-slate-200 bg-slate-50 p-4">
              <h2 className="mb-2 text-lg font-bold text-slate-900">Summary</h2>
              <pre className="whitespace-pre-wrap text-sm text-slate-700">{summary}</pre>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
