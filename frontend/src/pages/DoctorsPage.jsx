import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import AppShell from '../components/AppShell';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('all');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const { data } = await client.get('/appointments/doctors');
        setDoctors(data || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load doctors.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const specialties = useMemo(() => {
    const set = new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean));
    return [...set].sort();
  }, [doctors]);

  const filteredDoctors = doctors.filter((doctor) => {
    const fullName = doctor.userId?.name || '';
    const matchesSearch =
      !search || fullName.toLowerCase().includes(search.toLowerCase()) || doctor.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = specialty === 'all' || doctor.specialization === specialty;
    return matchesSearch && matchesSpecialty && doctor.isActive !== false;
  });

  return (
    <AppShell title="Find a doctor" subtitle="Browse available specialists and choose the right consultation slot.">
      <div className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          placeholder="Search by doctor or specialty"
        />
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
        >
          <option value="all">All specialties</option>
          {specialties.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">Loading doctors...</div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : filteredDoctors.length === 0 ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">No doctors match your current filters.</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{doctor.userId?.name || 'Doctor'}</h2>
                  <p className="text-sm text-blue-700">{doctor.specialization}</p>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Available</span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-700">Qualification:</span> {doctor.qualification || 'Not specified'}</p>
                <p><span className="font-semibold text-slate-700">Experience:</span> {doctor.experience || 0} years</p>
                <p><span className="font-semibold text-slate-700">Consultation fee:</span> ₹{doctor.consultationFee || 500}</p>
                <p><span className="font-semibold text-slate-700">Availability:</span> {doctor.availableDays?.join(', ') || 'Mon-Fri'}</p>
              </div>

              <p className="mt-4 text-sm text-slate-600">{doctor.bio || 'General consultation care and follow-up support.'}</p>

              <div className="mt-5 flex gap-3">
                <Link to={`/doctors/${doctor._id}`} className="flex-1 rounded bg-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-800 hover:bg-slate-300">
                  View Profile
                </Link>
                <Link to={`/book?doctorId=${doctor._id}`} className="flex-1 rounded bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-500">
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
