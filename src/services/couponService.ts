import { supabase } from './supabase';
import type { Coupon as AppCoupon } from '../types';


export interface CouponCreate {
  code: string;
  discount: number; // porcentaje (10 = 10%) o monto fijo según type
  type: 'percentage' | 'fixed';
  description?: string;
  starts_at?: string; // ISO date
  ends_at?: string; // ISO date
  usage_limit?: number; // límite total de usos
  usage_limit_per_user?: number; // límite por usuario
  min_purchase_amount?: number; // monto mínimo para aplicar
  applicable_to?: 'all' | 'specific_products' | 'specific_categories';
  product_ids?: number[]; // si applicable_to es 'specific_products'
  category_ids?: number[]; // si applicable_to es 'specific_categories'
  is_active: boolean;
}

export interface Coupon extends CouponCreate {
  id: number;
  created_at: string;
  updated_at?: string;
  times_used: number;
}

export const couponService = {
  // Obtener todos los cupones (admin)
  async getAllCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data as Coupon[]) || [];
  },

  // Obtener cupón por código (para validación en checkout)
  async getCouponByCode(code: string): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();
    
    if (error) return null;
    return data as Coupon;
  },

  // Obtener cupón por ID
  async getCouponById(id: number): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data as Coupon;
  },

  // Crear nuevo cupón
  async createCoupon(couponData: CouponCreate): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        ...couponData,
        code: couponData.code.toUpperCase(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        times_used: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Coupon;
  },

  // Actualizar cupón existente
  async updateCoupon(id: number, couponData: Partial<CouponCreate>): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons')
      .update({
        ...couponData,
        code: couponData.code ? couponData.code.toUpperCase() : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Coupon;
  },

  // Eliminar cupón
  async deleteCoupon(id: number): Promise<void> {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Validar si un cupón puede ser usado
  async validateCoupon(
    code: string, 
    userId: string | null, 
    cartTotal: number,
    cartItems: { product_id: number; category_id: number }[] = []
  ): Promise<{ valid: true; coupon: Coupon } | { valid: false; reason: string }> {
    const coupon = await this.getCouponByCode(code);
    if (!coupon) {
      return { valid: false, reason: 'Cupón no encontrado' };
    }

    // Verificar si está activo
    if (!coupon.is_active) {
      return { valid: false, reason: 'Cupón no está activo' };
    }

    // Verificar fechas
    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return { valid: false, reason: 'Cupón aún no está activo' };
    }
    if (coupon.ends_at && new Date(coupon.ends_at) < now) {
      return { valid: false, reason: 'Cupón ha expirado' };
    }

    // Verificar límite de usos
    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return { valid: false, reason: 'Cupón ha alcanzado su límite de usos' };
    }

    // Verificar límite por usuario
    if (userId && coupon.usage_limit_per_user) {
      // En una implementación real, verificaríamos cuántas veces el usuario ha usado este cupón
      // Por ahora asumimos que pasa esta validación
    }

    // Verificar monto mínimo de compra
    if (coupon.min_purchase_amount && cartTotal < coupon.min_purchase_amount) {
      return { valid: false, reason: `Monto mínimo de compra: ${coupon.min_purchase_amount}` };
    }

    // Verificar aplicabilidad a productos/categorías específicas
    if (coupon.applicable_to === 'specific_products' && coupon.product_ids) {
      const hasApplicableProduct = cartItems.some(item => 
        coupon.product_ids!.includes(item.product_id)
      );
      if (!hasApplicableProduct) {
        return { valid: false, reason: 'Cupón no aplicable a los productos en el carrito' };
      }
    }

    if (coupon.applicable_to === 'specific_categories' && coupon.category_ids) {
      const hasApplicableCategory = cartItems.some(item => 
        coupon.category_ids!.includes(item.category_id)
      );
      if (!hasApplicableCategory) {
        return { valid: false, reason: 'Cupón no aplicable a las categorías en el carrito' };
      }
    }

    return { valid: true, coupon };
  },

  // Calcular descuento
  calculateDiscount(coupon: Coupon, cartTotal: number): number {
    if (coupon.type === 'percentage') {
      return Math.min(cartTotal * (coupon.discount / 100), cartTotal);
    } else { // fixed
      return Math.min(coupon.discount, cartTotal);
    }
  },

  // Incrementar contador de usos
  async incrementUsage(id: number): Promise<void> {
    const { data: couponRow, error: couponFetchError } = await supabase
      .from('coupons')
      .select('times_used')
      .eq('id', id)
      .maybeSingle();

    if (couponFetchError) throw couponFetchError;

    const times_used = couponRow?.times_used ?? 0;

    const { error } = await supabase
      .from('coupons')
      .update({ 
        times_used: times_used + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
  }
};