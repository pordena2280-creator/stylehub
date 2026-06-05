import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService, isStaffRole, cartService } from '../services';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGoogleAdmin: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  isAdmin: boolean;
  isStaff: boolean;
  isAuthenticated: boolean;
  needsProfileCompletion: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Timeout de seguridad: si Supabase no dispara onAuthStateChange en 5s
    // (sin conexión, sesión expirada, etc.), bajamos loading igual.
    const timeout = setTimeout(() => setLoading(false), 5000);

    const { data: { subscription } } = authService.onAuthStateChange((profile) => {
      clearTimeout(timeout);
      setUser(profile);
      setLoading(false);
      if (profile) {
        cartService.syncLocalCart(profile.id).catch(console.error);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await authService.login(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(translateAuthError(msg));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      setLoading(true);
      await authService.register(email, password, fullName);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrarse';
      setError(translateAuthError(msg));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err: unknown) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      await authService.loginWithGoogle('/auth/callback');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error con Google';
      setError(msg);
      throw err;
    }
  };

  const loginWithGoogleAdmin = async () => {
    try {
      setError(null);
      await authService.loginWithGoogleAdmin();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error con Google';
      setError(msg);
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const updated = await authService.updateProfile(user.id, updates);
      setUser(updated as User);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(msg);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const needsProfileCompletion = user
    ? authService.needsProfileCompletion(user, user.email)
    : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        loginWithGoogle,
        loginWithGoogleAdmin,
        updateProfile,
        clearError,
        isAdmin: user?.role === 'admin',
        isStaff: isStaffRole(user?.role),
        isAuthenticated: !!user,
        needsProfileCompletion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

function translateAuthError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos';
  if (msg.includes('Email not confirmed')) return 'Confirma tu email antes de iniciar sesión';
  if (msg.includes('User already registered')) return 'Este email ya está registrado';
  if (msg.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres';
  if (msg.includes('Unable to validate email')) return 'Email inválido';
  return msg;
}
