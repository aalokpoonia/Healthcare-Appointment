import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookAppointment from './pages/BookAppointment';
import SymptomForm from './pages/SymptomForm';
import VisitSummary from './pages/VisitSummary';
import DoctorsPage from './pages/DoctorsPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import AppointmentsPage from './pages/AppointmentsPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage';
import ProfilePage from './pages/ProfilePage';
import DoctorAppointmentsPage from './pages/DoctorAppointmentsPage';
import DoctorPatientPage from './pages/DoctorPatientPage';
import AdminDoctorsPage from './pages/AdminDoctorsPage';
import AdminPatientsPage from './pages/AdminPatientsPage';
import AdminAppointmentsPage from './pages/AdminAppointmentsPage';

function RootNavigation() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${user.role}`} replace />} />
      <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
      <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

      <Route path="/doctors" element={<ProtectedRoute allowedRoles={['patient']}><DoctorsPage /></ProtectedRoute>} />
      <Route path="/doctors/:id" element={<ProtectedRoute allowedRoles={['patient']}><DoctorProfilePage /></ProtectedRoute>} />
      <Route path="/book" element={<ProtectedRoute allowedRoles={['patient']}><BookAppointment /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute allowedRoles={['patient']}><AppointmentsPage /></ProtectedRoute>} />
      <Route path="/appointments/:id" element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}><AppointmentDetailPage /></ProtectedRoute>} />
      <Route path="/symptoms" element={<ProtectedRoute allowedRoles={['patient']}><SymptomForm /></ProtectedRoute>} />
      <Route path="/summary" element={<ProtectedRoute allowedRoles={['patient']}><VisitSummary /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}><ProfilePage /></ProtectedRoute>} />

      <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointmentsPage /></ProtectedRoute>} />
      <Route path="/doctor/appointments/:id" element={<ProtectedRoute allowedRoles={['doctor']}><AppointmentDetailPage /></ProtectedRoute>} />
      <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPatientPage /></ProtectedRoute>} />

      <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><AdminDoctorsPage /></ProtectedRoute>} />
      <Route path="/admin/patients" element={<ProtectedRoute allowedRoles={['admin']}><AdminPatientsPage /></ProtectedRoute>} />
      <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><AdminAppointmentsPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={`/${user.role}`} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RootNavigation />
      </BrowserRouter>
    </AuthProvider>
  );
}
