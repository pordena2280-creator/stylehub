import { supabase } from './supabase';
import type { Order, OrderStatus, PaginatedResponse } from '../types';

// Re-export para que el panel admin pueda importar OrderStatus desde este módulo
export type { OrderStatus } from '../types';

// ============================================
// SERVICIO DE PEDIDOS
// ============================================

export const orderService = {
  // Obtener pedidos del usuario actual
  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Order[]) || [];
  },

  // Obtener pedido por ID
  async getOrderById(id: number): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(*)), user:profiles(*)')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as Order;
  },

  // Obtener pedido por número de orden
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(*))')
      .eq('order_number', orderNumber)
      .single();
    if (error) return null;
    return data as Order;
  },
  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'order_number'>): Promise<Order> {
    // Generar número de orden único
    const orderNumber = `ORD-${Date.now()}`;

    // Extraer 'items' del payload: los ítems van en la tabla order_items,
    // no en orders. Insertar 'items' directamente causaría PGRST204.
    const { items, ...orderFields } = orderData;

    const { data, error } = await supabase
      .from('orders')
      .insert({ ...orderFields, order_number: orderNumber })
      .select()
      .single();
    if (error) throw error;
    return data as Order;
  },

// Actualizar estado del pedido (admin)
   async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
     const { data, error } = await supabase
       .from('orders')
       .update({ status, updated_at: new Date().toISOString() })
       .eq('id', id)
       .select()
       .single();
     if (error) throw error;
     return data as Order;
   },

  // Actualizar pedido (para pago exitoso)
  async updateOrder(id: number, updates: Partial<Omit<Order, 'id' | 'created_at' | 'order_number'>>): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  // Cancelar pedido (usuario)
  async cancelOrder(id: number, userId: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelado', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .in('status', ['pendiente', 'procesando']);
    if (error) throw error;
  },

  // Obtener todos los pedidos (admin) con paginación
  async getAllOrders(page = 1, limit = 20, status?: OrderStatus): Promise<PaginatedResponse<Order>> {
    let query = supabase
      .from('orders')
      .select('*, user:profiles(full_name, phone, role), items:order_items(*, product:products(*))', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: (data as Order[]) || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  // Estadísticas de ventas (admin)
  async getSalesStats() {
    const { data, error } = await supabase
      .from('orders')
      .select('total, status', { count: 'exact' })
      .neq('status', 'cancelado');
    if (error) throw error;

    const orders = data || [];
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const delivered = orders.filter(o => o.status === 'entregado').length;

    return { totalRevenue, totalOrders, delivered };
  },
};
