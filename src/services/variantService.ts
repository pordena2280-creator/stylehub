import { supabase } from './supabase';
import type { ProductVariant } from '../types';

export const variantService = {
  // Obtener todas las variantes de un producto
  async getVariantsByProductId(productId: number): Promise<ProductVariant[]> {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return (data as ProductVariant[]) || [];
  },

  // Obtener variante por ID
  async getVariantById(id: number): Promise<ProductVariant | null> {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data as ProductVariant;
  },

  // Crear nueva variante
  async createVariant(variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .insert({
        ...variant,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as ProductVariant;
  },

  // Actualizar variante existente
  async updateVariant(id: number, updates: Partial<ProductVariant>): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProductVariant;
  },

  // Eliminar variante
  async deleteVariant(id: number): Promise<void> {
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Obtener variantes con stock disponible
  async getAvailableVariants(productId: number): Promise<ProductVariant[]> {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .gt('stock', 0)
      .eq('status', 'activo')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return (data as ProductVariant[]) || [];
  }
};