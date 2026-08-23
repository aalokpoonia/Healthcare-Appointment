import { useState } from 'react';
import client from '../api/client';

export default function VisitSummary() {
  const [appointmentId, setAppointmentId] = useState('');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [summary, setSummary] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await client.post('/appointments/summary', { appointmentId, notes, prescription });
    setSummary(res.data.appointment.postVisitSummary);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Post-Visit Summary</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border rounded p-2" value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} placeholder="Appointment ID" />
        <textarea className="w-full border rounded p-2 h-36" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Clinical notes" />
        <textarea className="w-full border rounded p-2 h-24" value={prescription} onChange={(e) => setPrescription(e.target.value)} placeholder="Prescription details" />
        <button className="bg-purple-600 text-white px-4 py-2 rounded">Generate summary</button>
      </form>
      {summary && <div className="mt-6 border rounded p-4"><pre className="whitespace-pre-wrap text-sm">{summary}</pre></div>}
    </div>
  );
}
