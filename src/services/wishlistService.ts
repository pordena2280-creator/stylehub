import { supabase } from './supabase';
import type { WishlistItem } from '../types';

// ============================================
// SERVICIO DE WISHLIST
// ============================================

const WISHLIST_KEY = 'ecommerce_wishlist';

// ---- Wishlist local (sin sesión) ----
export const localWishlistService = {
  getIds(): number[] {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  toggle(productId: number): number[] {
    const ids = localWishlistService.getIds();
    const updated = ids.includes(productId)
      ? ids.filter(id => id !== productId)
      : [...ids, productId];
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    return updated;
  },

  isInWishlist(productId: number): boolean {
    return localWishlistService.getIds().includes(productId);
  },

  clear(): void {
    localStorage.removeItem(WISHLIST_KEY);
  },
};

// ---- Wishlist en Supabase (con sesión) ----
export const wishlistService = {
  // Obtener wishlist del usuario
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    const { data, error } = await supabase
      .from('wishlist')
      .select('*, product:products(*)')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });
    if (error) throw error;
    return (data as WishlistItem[]) || [];
  },

  // Agregar a wishlist
  async addToWishlist(userId: string, productId: number): Promise<void> {
    const { error } = await supabase.from('wishlist').insert({
      user_id: userId,
      product_id: productId,
      added_at: new Date().toISOString(),
    });
    if (error) throw error;
  },

  // Quitar de wishlist
  async removeFromWishlist(userId: string, productId: number): Promise<void> {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
  },

  // Toggle wishlist
  async toggleWishlist(userId: string, productId: number): Promise<boolean> {
    const { data } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (data) {
      await wishlistService.removeFromWishlist(userId, productId);
      return false;
    } else {
      await wishlistService.addToWishlist(userId, productId);
      return true;
    }
  },

  // Verificar si está en wishlist
  async isInWishlist(userId: string, productId: number): Promise<boolean> {
    const { data } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();
    return !!data;
  },

  // Vaciar wishlist
  async clearWishlist(userId: string): Promise<void> {
    const { error } = await supabase.from('wishlist').delete().eq('user_id', userId);
    if (error) throw error;
  },
};
