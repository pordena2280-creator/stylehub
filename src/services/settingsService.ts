import { supabase } from './supabase';
import type { User } from '../types';

export interface StoreSettings {
  id: number;
  store_name: string;
  store_description?: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  store_city: string;
  store_state: string;
  store_zip_code: string;
  store_country: string;
  store_logo_url?: string;
  store_favicon_url?: string;
  currency: string;
  tax_rate: number;
  free_shipping_threshold: number;
  default_shipping_cost: number;
  allow_guest_checkout: boolean;
  require_account_order: boolean;
  order_number_prefix: string;
  maintenance_mode: boolean;
  maintenance_message?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  whatsapp_number?: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  updated_at?: string;
}

export interface PaymentMethodSettings {
  id: number;
  method: 'stripe' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  is_active: boolean;
  title: string;
  description?: string;
  config: Record<string, any>;
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

export interface ShippingZone {
  id: number;
  name: string;
  countries: string[];
  states?: string[];
  zip_codes?: string[];
  shipping_methods: ShippingMethod[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ShippingMethod {
  id: number;
  name: string;
  description?: string;
  cost: number;
  free_over: number;
  min_days: number;
  max_days: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

export interface TaxRule {
  id: number;
  name: string;
  description?: string;
  rate: number;
  applies_to: 'all' | 'specific_products' | 'specific_categories';
  product_ids?: number[];
  category_ids?: number[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export const settingsService = {
  async getStoreSettings(): Promise<StoreSettings | null> {
    const { data, error } = await supabase.from('store_settings').select('*').single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as StoreSettings || null;
  },

  async updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const { data, error } = await supabase.from('store_settings').upsert({ ...settings, updated_at: new Date().toISOString() }, { onConflict: 'id' }).select().single();
    if (error) throw error;
    return data as StoreSettings;
  },

  async getPaymentMethods(): Promise<PaymentMethodSettings[]> {
    try {
      const { data, error } = await supabase.from('payment_methods').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      return (data as PaymentMethodSettings[]) || [];
     } catch {
       return [{ id: 1, method: 'stripe', title: 'Tarjeta (Stripe)', is_active: true, config: {}, sort_order: 0, created_at: new Date().toISOString() }];
     }
  },

  async updatePaymentMethod(id: number, method: Partial<PaymentMethodSettings>): Promise<PaymentMethodSettings> {
    const { data, error } = await supabase.from('payment_methods').update({ ...method, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data as PaymentMethodSettings;
  },

  async getShippingZones(): Promise<ShippingZone[]> {
    try {
      const { data, error } = await supabase.from('shipping_zones').select('*, shipping_methods:shipping_methods(*)').order('name', { ascending: true });
      if (error) throw error;
      return (data as ShippingZone[]) || [];
    } catch {
      return [];
    }
  },

  async updateShippingZone(id: number, zone: Partial<ShippingZone>): Promise<ShippingZone> {
    const { data, error } = await supabase.from('shipping_zones').update({ ...zone, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data as ShippingZone;
  },

  async getTaxRules(): Promise<TaxRule[]> {
    try {
      const { data, error } = await supabase.from('tax_rules').select('*').order('name', { ascending: true });
      if (error) throw error;
      return (data as TaxRule[]) || [];
    } catch {
      return [];
    }
  },

  async updateTaxRule(id: number, rule: Partial<TaxRule>): Promise<TaxRule> {
    const { data, error } = await supabase.from('tax_rules').update({ ...rule, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data as TaxRule;
  }
};