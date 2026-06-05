import { supabase } from './supabase';
import type { Review } from '../types';

// ============================================
// SERVICIO DE RESEÑAS
// ============================================

export const reviewService = {
  // Obtener reseñas de un producto
  async getProductReviews(productId: number): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, user:profiles(full_name, avatar_url)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Review[]) || [];
  },

  // Crear reseña
  async createReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();
    if (error) throw error;
    return data as Review;
  },

  // Actualizar reseña
  async updateReview(id: number, updates: Partial<Review>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Review;
  },

  // Eliminar reseña
  async deleteReview(id: number): Promise<void> {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
  },

  // Verificar si el usuario ya reseñó el producto
  async hasUserReviewed(userId: string, productId: number): Promise<boolean> {
    const { data } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();
    return !!data;
  },
};
