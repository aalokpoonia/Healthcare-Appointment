import { useEffect, useState } from 'react';
import client from '../api/client';
import AppShell from '../components/AppShell';

export default function DoctorPatientPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const { data } = await client.get('/admin/patients');
        setPatients(data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load patients.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return (
    <AppShell title="Patients" subtitle="View the patient list and recent referral information.">
      {loading ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">Loading patients...</div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : patients.length === 0 ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">No patients available.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient._id} className="border-t border-slate-200">
                  <td className="px-4 py-3">{patient.name}</td>
                  <td className="px-4 py-3">{patient.email}</td>
                  <td className="px-4 py-3">{patient.phone || 'N/A'}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
