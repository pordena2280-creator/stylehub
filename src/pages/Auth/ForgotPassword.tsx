import { Link } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../../services';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await authService.resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el correo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-section" style={{ maxWidth: 480, margin: '0 auto' }}>
          <div className="auth-form-container">
            <div className="auth-header">
              <h1>Recuperar contraseña</h1>
              <p>Te enviaremos un enlace para restablecer tu contraseña</p>
            </div>

            {error && (
              <div className="auth-error">
                <i className="fa-solid fa-circle-exclamation" />
                <span>{error}</span>
              </div>
            )}

            {sent ? (
              <div className="auth-success-inline">
                <i className="fa-solid fa-envelope-circle-check" />
                <p>
                  Si existe una cuenta con <strong>{email}</strong>, recibirás un correo con instrucciones.
                </p>
                <Link to="/login" className="btn-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 16 }}>
                  Volver al login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <div className="input-with-icon">
                    <i className="fa-regular fa-envelope" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Enviando…' : 'Enviar enlace'}
                </button>
              </form>
            )}

            <div className="auth-footer">
              <p>
                <Link to="/login">← Volver al inicio de sesión</Link>
              </p>
              <p className="admin-link-hint">
                <Link to="/admin/login">Acceso administrador</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
