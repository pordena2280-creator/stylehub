import { supabase } from './supabase';
import type { PaginatedResponse } from '../types';

// ============================================================
// TIPOS DE FACTURA
// ============================================================

export interface Invoice {
  id: number;
  order_id: number;
  invoice_number: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  pdf_url?: string | null;
  status: 'emitida' | 'enviada' | 'cancelada';
  issued_at: string;
  sent_at?: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// SERVICIO DE FACTURACIÓN
// ============================================================

export const invoiceService = {

  // Obtener factura por ID de orden
  async getByOrderId(orderId: number): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();
    if (error) return null;
    return data as Invoice | null;
  },

  // Obtener factura por ID
  async getById(id: number): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as Invoice;
  },

  // Crear factura para una orden
  async createInvoice(orderId: number, amounts: {
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total: number;
  }): Promise<Invoice> {
    const invoiceNumber = `FAC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(orderId).padStart(6, '0')}`;
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        order_id: orderId,
        invoice_number: invoiceNumber,
        ...amounts,
        status: 'emitida',
      })
      .select()
      .single();
    if (error) throw error;
    return data as Invoice;
  },

  // Actualizar factura (ej: añadir pdf_url o cambiar estado)
  async updateInvoice(id: number, updates: Partial<Omit<Invoice, 'id' | 'created_at'>>): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Invoice;
  },

  // Listar facturas (admin) con paginación
  async listInvoices(page = 1, limit = 20): Promise<PaginatedResponse<Invoice>> {
    const from = (page - 1) * limit;
    const { data, error, count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .order('issued_at', { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw error;
    return {
      data: (data as Invoice[]) || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },
};
