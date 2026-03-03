import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ManageVehicles from './pages/ManageVehicles';
import ManageUsers from './pages/ManageUsers';
import BreakdownReports from './pages/BreakdownReports';
import UserDashboard from './pages/UserDashboard';
import ReportBreakdown from './pages/ReportBreakdown';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/vehicles" element={
            <ProtectedRoute adminOnly><ManageVehicles /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>
          } />
          <Route path="/admin/breakdowns" element={
            <ProtectedRoute adminOnly><BreakdownReports /></ProtectedRoute>
          } />

          {/* User Routes */}
          <Route path="/user/dashboard" element={
            <ProtectedRoute><UserDashboard /></ProtectedRoute>
          } />
          <Route path="/user/report" element={
            <ProtectedRoute><ReportBreakdown /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
