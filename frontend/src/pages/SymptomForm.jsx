import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import client from '../api/client';

export default function SymptomForm() {
  const [appointments, setAppointments] = useState([]);
  const [appointmentId, setAppointmentId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [symptomsDuration, setSymptomsDuration] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [currentMedications, setCurrentMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await client.get('/appointments/me');
        setAppointments(data || []);
        const firstUpcoming = (data || []).find((item) => ['booked', 'confirmed', 'on_hold'].includes(item.status));
        if (firstUpcoming) setAppointmentId(firstUpcoming._id);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await client.post('/appointments/symptoms', {
        appointmentId,
        symptoms,
        symptomsDuration,
        severity,
        currentMedications,
        allergies,
        additionalNotes,
      });
      setResponse(res.data.appointment.preVisitSummary);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit symptom form.');
    }
  };

  return (
    <AppShell title="Pre-Visit Symptom Form" subtitle="Share relevant symptoms before your consultation to help the doctor prepare.">
      {loading ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">Loading appointments...</div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Appointment</span>
              <select value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2">
                <option value="">Select appointment</option>
                {appointments.map((item) => (
                  <option key={item._id} value={item._id}>{item.doctorId?.userId?.name || 'Doctor'} • {item.date} • {item.slotTime}</option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Main symptoms</span>
              <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={5} className="w-full rounded border border-slate-300 px-3 py-2" placeholder="Describe the symptoms you are experiencing." />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Duration</span>
              <input value={symptomsDuration} onChange={(e) => setSymptomsDuration(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" placeholder="e.g. 3 days" />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Severity</span>
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Current medications</span>
              <textarea value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)} rows={3} className="w-full rounded border border-slate-300 px-3 py-2" placeholder="List any medicines being used currently." />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Allergies</span>
              <textarea value={allergies} onChange={(e) => setAllergies(e.target.value)} rows={3} className="w-full rounded border border-slate-300 px-3 py-2" placeholder="Mention any known allergies or reactions." />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Additional notes</span>
              <textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows={3} className="w-full rounded border border-slate-300 px-3 py-2" placeholder="Any additional details the doctor should know." />
            </label>
          </div>

          <button type="submit" className="mt-6 rounded bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-500">Submit symptoms</button>

          {response && (
            <div className="mt-6 rounded border border-slate-200 bg-slate-50 p-4">
              <h2 className="mb-2 text-lg font-bold text-slate-900">Suggested doctor questions</h2>
              <pre className="whitespace-pre-wrap text-sm text-slate-700">{JSON.stringify(response, null, 2)}</pre>
            </div>
          )}
        </form>
      )}
    </AppShell>
  );
}
