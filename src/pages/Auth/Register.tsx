import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

// ============================================================
// REGISTRO DE CLIENTE — conectado a Supabase + Google OAuth
// ============================================================

const Register = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, isAuthenticated, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', acceptTerms: false,
  });
  const [submitting, setSubmitting]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [localError, setLocalError]     = useState<string | null>(null);
  const [success, setSuccess]           = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    clearError();
    setLocalError(null);
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }
    if (formData.password.length < 8) {
      setLocalError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!formData.acceptTerms) {
      setLocalError('Debes aceptar los términos y condiciones');
      return;
    }

    setSubmitting(true);
    try {
      await register(
        formData.email,
        formData.password,
        `${formData.firstName} ${formData.lastName}`.trim()
      );
      setSuccess(true);
    } catch {
      // Error manejado en contexto
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      clearError();
      setLocalError(null);
      await loginWithGoogle();
    } catch {
      // Error manejado en contexto
    }
  };

  const displayError = localError || error;

  // Pantalla de éxito — confirmar email
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-success-card">
            <div className="success-icon">
              <i className="fa-solid fa-envelope-circle-check"></i>
            </div>
            <h2>¡Revisa tu email!</h2>
            <p>
              Enviamos un enlace de confirmación a <strong>{formData.email}</strong>.
              Haz clic en el enlace para activar tu cuenta.
            </p>
            <Link to="/login" className="btn-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Ir al Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-content">

          {/* Panel izquierdo */}
          <div className="auth-image">
            <div className="image-overlay">
              <div className="auth-brand">
                <i className="fa-solid fa-store"></i>
                <span>StyleHub</span>
              </div>
              <h2>¡Únete a Nosotros!</h2>
              <p>Crea tu cuenta y descubre un mundo de productos increíbles</p>
              <div className="features-list">
                {[
                  'Registro rápido y fácil',
                  'Ofertas exclusivas para miembros',
                  'Envío gratis en tu primera compra',
                  'Programa de puntos y recompensas',
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
                <h1>Crear Cuenta</h1>
                <p>Completa el formulario para registrarte</p>
              </div>

              {displayError && (
                <div className="auth-error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{displayError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">Nombre</label>
                    <input
                      id="firstName" type="text" name="firstName"
                      value={formData.firstName} onChange={handleChange}
                      placeholder="Juan" autoComplete="given-name" required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Apellido</label>
                    <input
                      id="lastName" type="text" name="lastName"
                      value={formData.lastName} onChange={handleChange}
                      placeholder="Pérez" autoComplete="family-name" required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-email">Email</label>
                  <div className="input-with-icon">
                    <i className="fa-regular fa-envelope"></i>
                    <input
                      id="reg-email" type="email" name="email"
                      value={formData.email} onChange={handleChange}
                      placeholder="tu@email.com" autoComplete="email" required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-password">Contraseña</label>
                  <div className="input-with-icon input-with-toggle">
                    <i className="fa-solid fa-lock"></i>
                    <input
                      id="reg-password" type={showPassword ? 'text' : 'password'}
                      name="password" value={formData.password} onChange={handleChange}
                      placeholder="Mínimo 8 caracteres" autoComplete="new-password"
                      minLength={8} required
                    />
                    <button type="button" className="toggle-password" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                      <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {/* Indicador de fortaleza */}
                  {formData.password && (
                    <div className="password-strength">
                      <div className={`strength-bar ${
                        formData.password.length >= 12 ? 'strong'
                        : formData.password.length >= 8 ? 'medium'
                        : 'weak'
                      }`}></div>
                      <span>{
                        formData.password.length >= 12 ? 'Contraseña fuerte'
                        : formData.password.length >= 8 ? 'Contraseña aceptable'
                        : 'Contraseña débil'
                      }</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                  <div className="input-with-icon input-with-toggle">
                    <i className="fa-solid fa-lock"></i>
                    <input
                      id="confirmPassword" type={showConfirm ? 'text' : 'password'}
                      name="confirmPassword" value={formData.confirmPassword}
                      onChange={handleChange} placeholder="Repite tu contraseña"
                      autoComplete="new-password" required
                    />
                    <button type="button" className="toggle-password" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                      <i className={`fa-regular ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <small className="field-error">Las contraseñas no coinciden</small>
                  )}
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox" name="acceptTerms"
                      checked={formData.acceptTerms} onChange={handleChange} required
                    />
                    <span>
                      Acepto los{' '}
                      <Link to="/terms">términos y condiciones</Link> y la{' '}
                      <Link to="/privacy">política de privacidad</Link>
                    </span>
                  </label>
                </div>

                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? (
                    <><span className="spinner-sm"></span> Creando cuenta…</>
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>
              </form>

              <div className="divider"><span>O regístrate con</span></div>

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
                  ¿Ya tienes una cuenta?{' '}
                  <Link to="/login">Inicia sesión aquí</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
