import { useState } from 'react';
import client from '../api/client';

export default function SymptomForm() {
  const [appointmentId, setAppointmentId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await client.post('/appointments/symptoms', { appointmentId, symptoms });
    setResponse(res.data.appointment.preVisitSummary);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Pre-Visit Symptom Form</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border rounded p-2" value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} placeholder="Appointment ID" />
        <textarea className="w-full border rounded p-2 h-40" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Describe your symptoms" />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Submit</button>
      </form>
      {response && (
        <div className="mt-6 border rounded p-4">
          <h2 className="text-xl font-bold mb-2">Suggested doctor questions</h2>
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
