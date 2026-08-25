import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';

function parseSummary(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ diagnosis: '', clinicalNotes: '', prescription: '', prescriptionFrequency: 'once daily', followUpDate: '' });
  const [submitMessage, setSubmitMessage] = useState('');

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const { data } = await client.get(`/appointments/${id}`);
      setAppointment(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load appointment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const symptomData = useMemo(() => {
    if (!appointment?.symptomSummary) return null;
    return parseSummary(appointment.symptomSummary);
  }, [appointment]);

  const summaryData = useMemo(() => {
    if (!appointment?.postVisitSummary) return null;
    return parseSummary(appointment.postVisitSummary);
  }, [appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitMessage('');
      const res = await client.post('/appointments/summary', { appointmentId: appointment._id, ...form });
      setAppointment((prev) => ({ ...prev, ...res.data.appointment }));
      setSubmitMessage('Consultation completed successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to complete consultation.');
    }
  };

  if (loading) {
    return <AppShell title="Appointment details" subtitle="Loading appointment information..."><div className="rounded border border-slate-200 bg-white p-6 text-slate-600">Loading appointment details...</div></AppShell>;
  }

  if (error) {
    return <AppShell title="Appointment details"><div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div></AppShell>;
  }

  if (!appointment) {
    return <AppShell title="Appointment details"><div className="rounded border border-slate-200 bg-white p-6 text-slate-600">Appointment not found.</div></AppShell>;
  }

  const doctorName = appointment.doctorId?.userId?.name || 'Doctor';
  const patientName = appointment.patientId?.name || 'Patient';
  const isDoctorView = user?.role === 'doctor';

  return (
    <AppShell title="Appointment" subtitle="Detailed visit information and consultation summary.">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Appointment</h2>
          <dl className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="flex justify-between gap-3 border-b border-slate-100 pb-2"><dt>Doctor</dt><dd className="font-medium text-slate-900">{doctorName}</dd></div>
            <div className="flex justify-between gap-3 border-b border-slate-100 pb-2"><dt>Patient</dt><dd className="font-medium text-slate-900">{patientName}</dd></div>
            <div className="flex justify-between gap-3 border-b border-slate-100 pb-2"><dt>Date</dt><dd className="font-medium text-slate-900">{appointment.date}</dd></div>
            <div className="flex justify-between gap-3 border-b border-slate-100 pb-2"><dt>Time</dt><dd className="font-medium text-slate-900">{appointment.slotTime}</dd></div>
            <div className="flex justify-between gap-3 border-b border-slate-100 pb-2"><dt>Reason</dt><dd className="font-medium text-slate-900">{appointment.reason || 'Not specified'}</dd></div>
            <div className="flex justify-between gap-3"><dt>Status</dt><dd className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium uppercase text-slate-700">{appointment.status}</dd></div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Pre-Visit Information</h2>
          {symptomData ? (
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-800">Symptoms:</span> {symptomData.symptoms || 'Not provided'}</p>
              <p><span className="font-semibold text-slate-800">Duration:</span> {symptomData.symptomsDuration || 'Not provided'}</p>
              <p><span className="font-semibold text-slate-800">Severity:</span> {symptomData.severity || 'Not provided'}</p>
              <p><span className="font-semibold text-slate-800">Medications:</span> {symptomData.currentMedications || 'None provided'}</p>
              <p><span className="font-semibold text-slate-800">Allergies:</span> {symptomData.allergies || 'None provided'}</p>
              <p><span className="font-semibold text-slate-800">Notes:</span> {symptomData.additionalNotes || 'No additional notes'}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No pre-visit symptom details have been submitted for this appointment yet.</p>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Consultation</h2>
        {appointment.status === 'completed' ? (
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-800">Diagnosis:</span> {appointment.diagnosis || 'Not provided'}</p>
            <p><span className="font-semibold text-slate-800">Clinical Notes:</span> {appointment.clinicalNotes || 'Not provided'}</p>
            <p><span className="font-semibold text-slate-800">Prescription:</span> {appointment.prescription || 'Not provided'}</p>
            <p><span className="font-semibold text-slate-800">Follow-up Date:</span> {appointment.followUpDate || 'Not provided'}</p>
            {summaryData && <p><span className="font-semibold text-slate-800">Patient Summary:</span> {typeof summaryData === 'string' ? summaryData : JSON.stringify(summaryData)}</p>}
          </div>
        ) : isDoctorView ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {submitMessage && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{submitMessage}</div>}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-slate-700">Diagnosis</span>
                <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="w-full rounded border border-slate-300 p-2.5" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-slate-700">Clinical notes</span>
                <textarea value={form.clinicalNotes} onChange={(e) => setForm({ ...form, clinicalNotes: e.target.value })} rows={4} className="w-full rounded border border-slate-300 p-2.5" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-slate-700">Prescription</span>
                <textarea value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })} rows={3} className="w-full rounded border border-slate-300 p-2.5" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Medication frequency</span>
                <select value={form.prescriptionFrequency} onChange={(e) => setForm({ ...form, prescriptionFrequency: e.target.value })} className="w-full rounded border border-slate-300 p-2.5">
                  <option value="once daily">Once daily</option>
                  <option value="twice daily">Twice daily</option>
                  <option value="three times daily">Three times daily</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Follow-up date</span>
                <input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} className="w-full rounded border border-slate-300 p-2.5" />
              </label>
            </div>
            <button type="submit" className="rounded bg-green-600 px-4 py-2.5 font-medium text-white hover:bg-green-500">Complete consultation</button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Consultation is still pending. Once the doctor completes it, details will appear here.</p>
        )}
      </section>

      <div className="mt-6 flex gap-3">
        <Link to={user?.role === 'doctor' ? '/doctor/appointments' : '/appointments'} className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Back</Link>
      </div>
    </AppShell>
  );
}
