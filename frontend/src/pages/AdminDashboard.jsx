import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import client from '../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, todayAppointments: 0, completedAppointments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await client.get('/admin/stats');
        setStats(data || {});
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load admin statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AppShell title="Admin Dashboard" subtitle="Monitor care operations and doctor availability across the platform.">
      {loading ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">Loading admin overview...</div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total patients</p><p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalPatients || 0}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total doctors</p><p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalDoctors || 0}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Today's appointments</p><p className="mt-2 text-3xl font-bold text-slate-900">{stats.todayAppointments || 0}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Completed</p><p className="mt-2 text-3xl font-bold text-slate-900">{stats.completedAppointments || 0}</p></div>
        </div>
      )}
    </AppShell>
  );
}
