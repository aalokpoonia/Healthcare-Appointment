import { useEffect, useState } from 'react';
import client from '../api/client';
import AppShell from '../components/AppShell';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  specialization: '',
  qualification: '',
  experience: '',
  consultationFee: '',
  hospitalName: '',
  availableDays: 'Mon,Tue,Wed,Thu,Fri',
  bio: '',
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(initialForm);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await client.get('/admin/doctors');
      setDoctors(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      setError('');
      setSuccess('');
      await client.post('/admin/doctors', {
        ...form,
        availableDays: form.availableDays.split(',').map((day) => day.trim()).filter(Boolean),
        experience: Number(form.experience) || 0,
        consultationFee: Number(form.consultationFee) || 500,
      });
      setSuccess('Doctor added successfully.');
      setForm(initialForm);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add doctor.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleStatus = async (doctorId, currentStatus) => {
    try {
      await client.patch(`/admin/doctors/${doctorId}/status`);
      setDoctors((prev) => prev.map((doctor) => doctor._id === doctorId ? { ...doctor, isActive: !currentStatus } : doctor));
      setSuccess('Doctor status updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update status.');
    }
  };

  return (
    <AppShell title="Doctor management" subtitle="Add, activate, or deactivate doctors in the system.">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Doctor list</h2>
          {loading ? (
            <div className="text-slate-600">Loading doctors...</div>
          ) : doctors.length === 0 ? (
            <div className="text-slate-600">No doctors found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Name</th>
                    <th className="px-3 py-2 font-semibold">Specialty</th>
                    <th className="px-3 py-2 font-semibold">Experience</th>
                    <th className="px-3 py-2 font-semibold">Fee</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor._id} className="border-t border-slate-200">
                      <td className="px-3 py-2">{doctor.userId?.name || 'Doctor'}</td>
                      <td className="px-3 py-2">{doctor.specialization}</td>
                      <td className="px-3 py-2">{doctor.experience || 0} yrs</td>
                      <td className="px-3 py-2">₹{doctor.consultationFee || 500}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${doctor.isActive === false ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {doctor.isActive === false ? 'Inactive' : 'Active'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <button type="button" onClick={() => toggleStatus(doctor._id, doctor.isActive)} className="rounded bg-slate-700 px-2 py-1 text-xs text-white hover:bg-slate-600">
                          {doctor.isActive === false ? 'Activate' : 'Deactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Add new doctor</h2>
          {error && <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {success && <div className="mb-3 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

          <div className="grid gap-3">
            <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="rounded border border-slate-300 p-2" placeholder="Full name" />
            <input value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="rounded border border-slate-300 p-2" placeholder="Email" />
            <input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className="rounded border border-slate-300 p-2" placeholder="Phone" />
            <input value={form.specialization} onChange={(e) => handleChange('specialization', e.target.value)} className="rounded border border-slate-300 p-2" placeholder="Specialization" />
            <input value={form.qualification} onChange={(e) => handleChange('qualification', e.target.value)} className="rounded border border-slate-300 p-2" placeholder="Qualification" />
            <input value={form.experience} onChange={(e) => handleChange('experience', e.target.value)} className="rounded border border-slate-300 p-2" placeholder="Experience (years)" />
            <input value={form.consultationFee} onChange={(e) => handleChange('consultationFee', e.target.value)} className="rounded border border-slate-300 p-2" placeholder="Consultation fee" />
            <input value={form.hospitalName} onChange={(e) => handleChange('hospitalName', e.target.value)} className="rounded border border-slate-300 p-2" placeholder="Hospital name" />
            <input value={form.availableDays} onChange={(e) => handleChange('availableDays', e.target.value)} className="rounded border border-slate-300 p-2" placeholder="Available days e.g. Mon,Tue,Wed" />
            <textarea value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} rows={4} className="rounded border border-slate-300 p-2" placeholder="Short bio" />
            <button type="submit" disabled={submitLoading} className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-60">
              {submitLoading ? 'Saving...' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
