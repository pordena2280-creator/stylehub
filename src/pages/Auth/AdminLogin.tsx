import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const {
    login,
    loginWithGoogleAdmin,
    isAuthenticated,
    loading,
    error,
    clearError,
    isAdmin,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && (isAdmin || true)) {
      // AuthCallback y Protected admin ya se encargan del control.
      // Redirigimos a /admin para evitar doble login.
      navigate('/admin', { replace: true });
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    clearError();
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      // Redirección la hace AuthCallback/ProtectedRoute según rol.
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAdmin = async () => {
    setSubmitting(true);
    try {
      clearError();
      await loginWithGoogleAdmin();
      // Supabase redirige automáticamente a /auth/callback?mode=admin
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-content">
          {/* Left Side - Image */}
          <div className="auth-image">
            <div className="image-overlay">
              <h2>Panel de Administrador</h2>
              <p>Inicia sesión para acceder al panel de control de tu tienda</p>
              <div className="features-list">
                <div className="feature-item">
                  <i className="icon-check"></i>
                  <span>Gestión de productos</span>
                </div>
                <div className="feature-item">
                  <i className="icon-check"></i>
                  <span>Control de inventario</span>
                </div>
                <div className="feature-item">
                  <i className="icon-check"></i>
                  <span>Reportes y analíticas</span>
                </div>
                <div className="feature-item">
                  <i className="icon-check"></i>
                  <span>Administración de usuarios</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="auth-form-section">
            <div className="auth-form-container">
              <div className="auth-header">
                <h1>Acceso de Administrador</h1>
                <p>Ingresa tus credenciales de administrador</p>
              </div>

              {error && (
                <div className="auth-error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-with-icon">
                    <i className="icon-mail"></i>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="admin@tu-tienda.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Contraseña</label>
                  <div className="input-with-icon">
                    <i className="icon-lock"></i>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleInputChange}
                    />
                    <span>Recordarme</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-link">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Iniciando sesión…' : 'Iniciar Sesión como Admin'}
                </button>
              </form>

              <div className="divider">
                <span>O continúa con</span>
              </div>

              <div className="social-login">
                <button
                  type="button"
                  className="social-btn google"
                  onClick={handleGoogleAdmin}
                  disabled={submitting}
                >
                  <i className="icon-google"></i>
                  Google
                </button>
              </div>

              <div className="auth-footer">
                <p>
                  ¿No tienes una cuenta de administrador?{' '}
                  <Link to="/register" target="_blank" rel="noopener noreferrer">
                    Solicita acceso aquí
                  </Link>
                </p>
                <p>
                  ¿Eres un cliente?{' '}
                  <Link to="/login">Ingresa como cliente</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

