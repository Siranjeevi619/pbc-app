import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Engagements from './pages/Engagements';
import FirmLedger from './pages/FirmLedger';
import Samples from './pages/Samples';
import AutomationCenter from './pages/AutomationCenter';
import Letters from './pages/Letters';
import ClientPortal from './pages/ClientPortal';

function Home() {
  const { user } = useAuth();
  if (user?.role === 'client') return <Navigate to="/portal" replace />;
  return <Navigate to="/engagements" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/portal" element={<ProtectedRoute roles={['client']}><ClientPortal /></ProtectedRoute>} />
      <Route path="/engagements" element={<ProtectedRoute roles={['auditor', 'partner', 'admin']}><Engagements /></ProtectedRoute>} />
      <Route path="/engagements/:engagementId/ledger" element={<ProtectedRoute roles={['auditor', 'partner', 'admin']}><FirmLedger /></ProtectedRoute>} />
      <Route path="/engagements/:engagementId/samples" element={<ProtectedRoute roles={['auditor', 'partner', 'admin']}><Samples /></ProtectedRoute>} />
      <Route path="/engagements/:engagementId/automation" element={<ProtectedRoute roles={['auditor', 'partner', 'admin']}><AutomationCenter /></ProtectedRoute>} />
      <Route path="/engagements/:engagementId/letters" element={<ProtectedRoute roles={['auditor', 'partner', 'admin']}><Letters /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
