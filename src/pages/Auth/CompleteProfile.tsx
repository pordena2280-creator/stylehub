import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services';
import './Auth.css';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, updateProfile, isStaff, loading } = useAuth();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    authService.getSession().then(s => {
      if (!s) navigate('/login', { replace: true });
      setSessionChecked(true);
    });
  }, [navigate]);
  const isAdminMode = params.get('mode') === 'admin';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Ingresa tu nombre completo');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updateProfile({ full_name: fullName.trim(), phone: phone.trim() || undefined });
      if (isAdminMode || isStaff) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  if (!sessionChecked || loading) {
    return (
      <div className="auth-page">
        <div className="auth-container" style={{ textAlign: 'center', padding: 48 }}>Cargando…</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-section" style={{ maxWidth: 480, margin: '0 auto' }}>
          <div className="auth-form-container">
            <div className="auth-header">
              <h1>Completa tu perfil</h1>
              <p>Es tu primera vez con <strong>{user.email}</strong>. Cuéntanos cómo te llamas.</p>
            </div>
            {error && (
              <div className="auth-error">
                <i className="fa-solid fa-circle-exclamation" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="fullName">Nombre completo *</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Teléfono (opcional)</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Guardando…' : 'Continuar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
