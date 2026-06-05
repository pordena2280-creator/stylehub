import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../../services';
import './Auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await authService.changePassword(password);
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña');
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
              <h1>Nueva contraseña</h1>
              <p>Elige una contraseña segura para tu cuenta</p>
            </div>
            {error && (
              <div className="auth-error">
                <i className="fa-solid fa-circle-exclamation" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="password">Nueva contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm">Confirmar contraseña</label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Guardando…' : 'Guardar contraseña'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
