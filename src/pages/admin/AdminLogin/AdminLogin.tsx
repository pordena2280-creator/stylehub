import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const {
    login,
    loginWithGoogleAdmin,
    isAuthenticated,
    isStaff,
    loading,
    error,
    clearError,
    needsProfileCompletion,
  } = useAuth();
  const [formData, setFormData]         = useState({ email: '', password: '' });
  const [submitting, setSubmitting]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accessError, setAccessError]   = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (isStaff) {
        if (needsProfileCompletion) {
          navigate('/completar-perfil?mode=admin', { replace: true });
        } else {
          navigate('/admin', { replace: true });
        }
      } else {
        setAccessError('Tu cuenta no tiene permisos de administración. El dueño debe asignarte un rol o invitarte por correo.');
      }
    }
  }, [isAuthenticated, isStaff, loading, navigate, needsProfileCompletion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    setAccessError(null);
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAccessError(null);
    try {
      const allowed = await authService.canAccessAdminPanel(formData.email);
      if (!allowed) {
        setAccessError('Este correo no está autorizado. Crea una invitación en Usuarios → Invitar personal.');
        return;
      }
      await login(formData.email, formData.password);
    } catch {
      // Error en contexto
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    clearError();
    setAccessError(null);
    try {
      await loginWithGoogleAdmin();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo iniciar con Google';
      setAccessError(msg.includes('Unsupported provider') ? 'Google no está habilitado en Supabase. Usa email y contraseña.' : msg);
    }
  };

  const displayError = accessError || error;

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <div className="admin-login-header">
          <div className="admin-login-logo">
            <i className="fa-solid fa-shield-halved" />
          </div>
          <h1>Panel TechStore</h1>
          <p>Acceso para administradores y equipo autorizado</p>
        </div>

        {displayError && (
          <div className="admin-login-error">
            <i className="fa-solid fa-triangle-exclamation" />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="admin-email">Correo corporativo</label>
            <input
              id="admin-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@empresa.com"
              autoComplete="email"
              required
              autoFocus
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">Contraseña</label>
            <div className="admin-input-toggle">
              <input
                id="admin-password"
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
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label="Mostrar contraseña"
              >
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          <button type="submit" className="admin-login-btn" disabled={submitting}>
            {submitting ? (
              <><span className="spinner-sm" /> Verificando…</>
            ) : (
              <><i className="fa-solid fa-right-to-bracket" /> Entrar al panel</>
            )}
          </button>
        </form>

        <div className="admin-login-divider">
          <span>o</span>
        </div>

        <button type="button" className="admin-google-btn" onClick={handleGoogle}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="admin-login-footer">
          <Link to="/" className="back-to-store">
            <i className="fa-solid fa-arrow-left" /> Volver a la tienda
          </Link>
          <Link to="/forgot-password" className="forgot-admin">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="admin-security-badge">
          <i className="fa-solid fa-lock" />
          <span>Solo correos invitados o con rol de equipo</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
