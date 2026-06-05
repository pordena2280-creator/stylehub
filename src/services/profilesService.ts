import { supabase } from './supabase';
import type { User } from '../types';

// ============================================
// SERVICIO DE PERFILES (users públicos)
// ============================================

export const profilesService = {
  // Obtener todos los perfiles (admin)
  async getAllProfiles(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as User[]) || [];
  },

  // Obtener perfil por ID
  async getProfileById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as User;
  },

  // Actualizar rol de un usuario (admin)
  async updateRole(userId: string, role: 'cliente' | 'admin' | 'editor' | 'operador'): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as User;
  },

  // Obtener estadísticas de usuarios
  async getStats() {
    const { data: all, error } = await supabase
      .from('profiles')
      .select('role, created_at');
    if (error) throw error;

    const total = all?.length || 0;
    const admins = all?.filter(u => u.role === 'admin').length || 0;
    const editors = all?.filter(u => u.role === 'editor').length || 0;
    const operadores = all?.filter(u => u.role === 'operador').length || 0;
    const clients = all?.filter(u => u.role === 'cliente').length || 0;

    // Últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = all?.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length || 0;

    return { total, admins, editors, operadores, clients, recent };
  },
};
