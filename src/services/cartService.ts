import { supabase } from './supabase';
import type { CartItem } from '../types';

// ============================================
// SERVICIO DE CARRITO (Supabase + localStorage)
// ============================================
// El carrito se guarda en localStorage para usuarios no autenticados
// y se sincroniza con Supabase cuando el usuario inicia sesión.

const CART_KEY = 'ecommerce_cart';

// ---- Carrito local (sin sesión) ----
export const localCartService = {
  getCart(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveCart(items: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  },

  addItem(item: CartItem): CartItem[] {
    const cart = localCartService.getCart();
    const existing = cart.find(i => i.product_id === item.product_id);
    let updated: CartItem[];
    if (existing) {
      updated = cart.map(i =>
        i.product_id === item.product_id
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      updated = [...cart, item];
    }
    localCartService.saveCart(updated);
    return updated;
  },

  removeItem(productId: number): CartItem[] {
    const updated = localCartService.getCart().filter(i => i.product_id !== productId);
    localCartService.saveCart(updated);
    return updated;
  },

  updateQuantity(productId: number, quantity: number): CartItem[] {
    const updated = localCartService.getCart().map(i =>
      i.product_id === productId ? { ...i, quantity } : i
    );
    localCartService.saveCart(updated);
    return updated;
  },

  clearCart(): void {
    localStorage.removeItem(CART_KEY);
  },
};

// ---- Carrito en Supabase (con sesión) ----
export const cartService = {
  // Obtener carrito del usuario
  async getCart(userId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId);
    if (error) throw error;
    return (data as CartItem[]) || [];
  },

  // Agregar o actualizar item
  async upsertItem(userId: string, productId: number, quantity: number, price: number): Promise<void> {
    const { error } = await supabase.from('cart_items').upsert(
      { user_id: userId, product_id: productId, quantity, price },
      { onConflict: 'user_id,product_id' }
    );
    if (error) throw error;
  },

  // Actualizar cantidad
  async updateQuantity(userId: string, productId: number, quantity: number): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
  },

  // Eliminar item
  async removeItem(userId: string, productId: number): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
  },

  // Vaciar carrito
  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
    if (error) throw error;
  },

  // Sincronizar carrito local con Supabase al iniciar sesión
  async syncLocalCart(userId: string): Promise<void> {
    const localItems = localCartService.getCart();
    if (localItems.length === 0) return;

    const upserts = localItems.map(item => ({
      user_id: userId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error } = await supabase
      .from('cart_items')
      .upsert(upserts, { onConflict: 'user_id,product_id' });

    if (!error) localCartService.clearCart();
  },
};
