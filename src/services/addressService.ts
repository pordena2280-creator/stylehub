import { supabase } from './supabase';
import type { Address } from '../types';

// ============================================
// SERVICIO DE DIRECCIONES
// ============================================

export const addressService = {
  // Obtener direcciones del usuario
  async getUserAddresses(userId: string): Promise<Address[]> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
    if (error) throw error;
    return (data as Address[]) || [];
  },

  // Crear dirección
  async createAddress(address: Omit<Address, 'id'>): Promise<Address> {
    // Si es default, quitar default de las demás
    if (address.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', address.user_id);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert(address)
      .select()
      .single();
    if (error) throw error;
    return data as Address;
  },

  // Actualizar dirección
  async updateAddress(id: number, userId: string, updates: Partial<Address>): Promise<Address> {
    if (updates.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as Address;
  },

  // Eliminar dirección
  async deleteAddress(id: number, userId: string): Promise<void> {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
  },

  // Establecer como predeterminada
  async setDefaultAddress(id: number, userId: string): Promise<void> {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);

    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
  },
};
