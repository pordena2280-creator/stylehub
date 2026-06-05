import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services';
import './Auth.css';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [accessError, setAccessError] = useState<string | null>(null);
  const isAdminMode = params.get('mode') === 'admin';

  useEffect(() => {
    let cancelled = false;

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const finish = async () => {
      // Algunos navegadores (Tracking Prevention / partición de storage) pueden
      // retrasar el acceso a cookies/storage => reintentos para evitar quedar en blanco/verificando.
      const maxAttempts = 5;
      const delayMs = 400;

      let session = await authService.getSession();
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (session?.user) break;
        if (cancelled) return;
        await sleep(delayMs);
        session = await authService.getSession();
      }

      if (!session?.user) {
        if (!cancelled) {
          setAccessError('No se pudo completar la sesión. Intenta iniciar sesión nuevamente (o usa email/contraseña).');
        }
        return;
      }

      const profile = await authService.syncProfileAfterAuth(
        session.user.id,
        session.user.email
      );

      if (isAdminMode) {
        const allowed = await authService.canAccessAdminPanel(session.user.email || '');
        if (!allowed) {
          if (!cancelled) {
            setAccessError('Este correo no está autorizado para el panel. Pide al dueño que te invite en Usuarios.');
            await authService.logout();
          }
          return;
        }
        if (authService.needsProfileCompletion(profile, session.user.email)) {
          if (!cancelled) navigate('/completar-perfil?mode=admin', { replace: true });
          return;
        }
        if (!cancelled) navigate('/admin', { replace: true });
        return;
      }

      if (authService.needsProfileCompletion(profile, session.user.email)) {
        if (!cancelled) navigate('/completar-perfil', { replace: true });
        return;
      }

      const role = profile?.role;
      if (!cancelled) {
        navigate(role === 'admin' || role === 'editor' || role === 'operador' ? '/admin' : '/', { replace: true });
      }
    };

    finish();
    return () => { cancelled = true; };
  }, [isAdminMode, navigate]);

  if (accessError) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-form-container" style={{ maxWidth: 480, margin: '40px auto' }}>
            <div className="auth-error">
              <i className="fa-solid fa-circle-exclamation" />
              <span>{accessError}</span>
            </div>
            <Link to="/admin/login" className="btn-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 16 }}>
              Volver al login admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ textAlign: 'center', padding: 48 }}>
        <span className="spinner-sm" style={{ width: 32, height: 32, display: 'inline-block' }} />
        <p style={{ marginTop: 16 }}>Completando inicio de sesión…</p>
      </div>
    </div>
  );
};

export default AuthCallback;
