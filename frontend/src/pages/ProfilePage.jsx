import { useEffect, useState } from 'react';
import client from '../api/client';
import AppShell from '../components/AppShell';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  emergencyContact: '',
};

export default function ProfilePage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await client.get('/auth/profile');
        const profile = data.user || {};
        setForm({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          dateOfBirth: profile.dateOfBirth || '',
          gender: profile.gender || '',
          address: profile.address || '',
          emergencyContact: profile.emergencyContact || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await client.put('/auth/profile', form);
      setSuccess('Profile saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="Profile" subtitle="Update your basic medical and contact information.">
      {loading ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">Loading profile...</div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {success && <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Full Name</span>
              <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
              <input value={form.email || ''} readOnly className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500" />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Phone</span>
              <input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Date of Birth</span>
              <input type="date" value={form.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Gender</span>
              <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Emergency Contact</span>
              <input value={form.emergencyContact} onChange={(e) => handleChange('emergencyContact', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Address</span>
            <textarea value={form.address} onChange={(e) => handleChange('address', e.target.value)} rows={4} className="w-full rounded border border-slate-300 px-3 py-2" />
          </label>

          <div className="mt-6 flex justify-end">
            <button type="submit" disabled={saving} className="rounded bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </AppShell>
  );
}
