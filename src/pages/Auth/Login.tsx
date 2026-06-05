import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

// ============================================================
// LOGIN DE CLIENTE — conectado a Supabase + Google OAuth
// ============================================================

const Login = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { login, loginWithGoogle, isAuthenticated, isAdmin, isStaff, loading, error, clearError, needsProfileCompletion } = useAuth();

  const from = (location.state as { from?: string })?.from || '/';

  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (needsProfileCompletion) {
        navigate('/completar-perfil', { replace: true });
        return;
      }
      navigate(isStaff || isAdmin ? '/admin' : from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, isStaff, needsProfileCompletion, loading, navigate, from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    clearError();
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      // La redirección la maneja el useEffect de arriba
    } catch {
      // El error ya está en el contexto
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      clearError();
      await loginWithGoogle();
      // Supabase redirige automáticamente via OAuth
    } catch {
      // Error manejado en contexto
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-content">

          {/* Panel izquierdo */}
          <div className="auth-image">
            <div className="image-overlay">
              <div className="auth-brand">
                <i className="fa-solid fa-store"></i>
                <span>TechStore</span>
              </div>
              <h2>¡Bienvenido de nuevo!</h2>
              <p>Inicia sesión para acceder a tu cuenta y disfrutar de todos nuestros beneficios</p>
              <div className="features-list">
                {[
                  'Seguimiento de pedidos en tiempo real',
                  'Lista de deseos personalizada',
                  'Ofertas exclusivas para miembros',
                  'Historial de compras completo',
                ].map(f => (
                  <div key={f} className="feature-item">
                    <i className="fa-solid fa-check"></i>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel derecho */}
          <div className="auth-form-section">
            <div className="auth-form-container">
              <div className="auth-header">
                <h1>Iniciar Sesión</h1>
                <p>Ingresa tus credenciales para acceder a tu cuenta</p>
              </div>

              {/* Error global */}
              {error && (
                <div className="auth-error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <div className="input-with-icon">
                    <i className="fa-regular fa-envelope"></i>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <div className="input-with-icon input-with-toggle">
                    <i className="fa-solid fa-lock"></i>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(v => !v)}
                      tabIndex={-1}
                    >
                      <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleChange}
                    />
                    <span>Recordarme</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-link">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? (
                    <><span className="spinner-sm"></span> Iniciando sesión…</>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </form>

              <div className="divider"><span>O continúa con</span></div>

              <div className="social-login">
                <button type="button" className="social-btn google" onClick={handleGoogle}>
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Google
                </button>
              </div>

              <div className="auth-footer">
                <p>
                  ¿No tienes una cuenta?{' '}
                  <Link to="/register">Regístrate aquí</Link>
                </p>
                <p className="admin-link-hint">
                  ¿Eres administrador?{' '}
                  <Link to="/admin/login">Acceso Admin</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
