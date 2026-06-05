import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, needsProfileCompletion } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <span className="spinner-sm" style={{ width: 28, height: 28, display: 'inline-block' }} />
        <p style={{ marginTop: 12 }}>Cargando…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (needsProfileCompletion) {
    return <Navigate to="/completar-perfil" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
