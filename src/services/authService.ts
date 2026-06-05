import { supabase } from './supabase';
import { staffInviteService } from './staffInviteService';
import { appPath } from '../utils/appUrl';
import type { User } from '../types';

const STAFF_ROLES = ['admin', 'editor', 'operador'] as const;

export function isStaffRole(role?: string): boolean {
  return !!role && (STAFF_ROLES as readonly string[]).includes(role);
}

// ============================================
// SERVICIO DE AUTENTICACIÓN
// ============================================

export const authService = {
  async register(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: appPath('/auth/callback'),
      },
    });
    if (error) throw error;
    return data;
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    await authService.syncProfileAfterAuth(data.user?.id, data.user?.email);
    return data;
  },

  async loginWithGoogle(redirectPath = '/auth/callback') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: appPath(redirectPath),
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) throw error;
    return data;
  },

  async loginWithGoogleAdmin() {
    return authService.loginWithGoogle('/auth/callback?mode=admin');
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data as User;
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async changePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: appPath('/reset-password'),
    });
    if (error) throw error;
  },

  /** Tras OAuth o login: aplicar invitación staff y devolver perfil actualizado */
  async syncProfileAfterAuth(userId?: string, email?: string | null): Promise<User | null> {
    if (!userId || !email) return null;

    await staffInviteService.applyInviteForUser(userId, email);
    return authService.getUserProfile(userId);
  },

  /** Verifica si el email puede entrar al panel admin */
  async canAccessAdminPanel(email: string): Promise<boolean> {
    const normalized = email.trim().toLowerCase();

    // Comparación case-insensitive para evitar bloquear por diferencias de casing
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .ilike('email', normalized)
      .maybeSingle();



    if (profile && isStaffRole(profile.role)) return true;

    const invite = await staffInviteService.getPendingInviteByEmail(normalized);
    return !!invite;
  },

  needsProfileCompletion(profile: User | null, authEmail?: string | null): boolean {
    if (!profile) return true;
    const name = (profile.full_name || '').trim();
    if (!name || name === authEmail) return true;
    return false;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Solo sincronizar invitaciones en login/registro, no en cada refresco de token
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          await authService.syncProfileAfterAuth(session.user.id, session.user.email);
        }
        const profile = await authService.getUserProfile(session.user.id);
        callback(profile);
      } else {
        callback(null);
      }
    });
  },
};
