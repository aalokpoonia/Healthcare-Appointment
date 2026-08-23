import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Patient Dashboard</h1>
      <p className="mb-6">Welcome, {user?.name}</p>
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/book" className="bg-blue-600 text-white p-4 rounded shadow">Book Appointment</Link>
        <Link to="/symptoms" className="bg-green-600 text-white p-4 rounded shadow">Pre-Visit Symptom Form</Link>
        <Link to="/summary" className="bg-slate-700 text-white p-4 rounded shadow">Visit Summary</Link>
      </div>
    </div>
  );
}
