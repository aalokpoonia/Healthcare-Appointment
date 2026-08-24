import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLinks = {
  patient: [
    { label: 'Dashboard', to: '/patient' },
    { label: 'Doctors', to: '/doctors' },
    { label: 'Appointments', to: '/appointments' },
    { label: 'Book Appointment', to: '/book' },
    { label: 'Symptoms', to: '/symptoms' },
    { label: 'Visit Summary', to: '/summary' },
    { label: 'Profile', to: '/profile' },
  ],
  doctor: [
    { label: 'Dashboard', to: '/doctor' },
    { label: 'Appointments', to: '/doctor/appointments' },
    { label: 'Patients', to: '/doctor/patients' },
    { label: 'Profile', to: '/profile' },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin' },
    { label: 'Doctors', to: '/admin/doctors' },
    { label: 'Patients', to: '/admin/patients' },
    { label: 'Appointments', to: '/admin/appointments' },
  ],
};

export default function AppShell({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <div>{children}</div>;
  }

  const links = roleLinks[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <nav className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to={`/${user.role}`} className="text-lg font-bold tracking-tight text-slate-900">CareConnect</Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 font-medium transition ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-slate-900 px-3 py-2 font-medium text-white transition hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <header className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            {title && <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>}
            {subtitle && <p className="mt-2 text-sm text-slate-600 sm:text-base">{subtitle}</p>}
          </header>
        )}
        {children}
      </main>
    </div>
  );
}
