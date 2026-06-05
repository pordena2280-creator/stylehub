import { supabase } from './supabase';
import type { Order, Product, User } from '../types';

export interface SalesReport {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  period: string;
}

export interface TopProduct {
  product: Product;
  unitsSold: number;
  revenue: number;
}

export interface RecentOrder {
  order: Order;
  customer: Pick<User, 'full_name' | 'email'>;
}

export interface InventoryAlert {
  product: Product;
  stock: number;
  threshold: number;
}

export const reportsService = {
  // Obtener reporte de ventas por período
  async getSalesReport(period: '7d' | '30d' | '90d' | 'ytd' = '30d'): Promise<SalesReport> {
    // Calcular fecha de inicio basada en el período
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case 'ytd':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
    }

    // Obtener órdenes del período
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total, created_at, payment_status')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('payment_status', 'pagado');

    if (error) throw error;

    const totalOrders = orders?.length || 0;
    const totalSales = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      totalSales,
      totalOrders,
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      period
    };
  },

  // Obtener productos más vendidos
  async getTopProducts(limit = 10): Promise<TopProduct[]> {
    // Obtener todos los items de órdenes pagadas
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        unit_price,
        product:products(id, name, price, images, slug),
        order:orders(id, payment_status)
      `)
      .eq('order.payment_status', 'pagado');

    if (error) throw error;

    // Agrupar por producto
    const productStats: Record<number, { 
      product: Product; 
      unitsSold: number; 
      revenue: number 
    }> = {};

    orderItems?.forEach(item => {
      const product = (Array.isArray((item as any).product)
        ? (item as any).product[0]
        : (item as any).product) as Product | undefined;

      if (!product?.id) return;

      const productId = product.id;
      if (!productStats[productId]) {
        productStats[productId] = {
          product,
          unitsSold: 0,
          revenue: 0
        };
      }

      productStats[productId].unitsSold += item.quantity;
      productStats[productId].revenue += item.quantity * (item.unit_price || 0);
    });

    // Convertir a array y ordenar por unidades vendidas
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, limit);

    return topProducts;
  },

  // Obtener órdenes recientes
  async getRecentOrders(limit = 5): Promise<RecentOrder[]> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:profiles(id, full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (orders || []).map(order => ({
      order,
      customer: {
        full_name: order.user?.full_name || '',
        email: order.user?.email || ''
      }
    }));
  },

  // Obtener alertas de inventario (productos con stock bajo)
  async getInventoryAlerts(threshold = 5): Promise<InventoryAlert[]> {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .lt('stock', threshold)
      .eq('status', 'activo');

    if (error) throw error;

    return (products || []).map(product => ({
      product,
      stock: product.stock,
      threshold
    }));
  },

// Obtener métricas de conversión (simplificado - solo con datos de orders y profiles)
  async getConversionMetrics() {
    // Usar perfiles y órdenes para calcular conversión sin tabla page_visits
    const [profilesRes, ordersRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('payment_status', 'pagado')
    ]);

    const visitorCount = profilesRes.count ?? 0;
    const orderCount = ordersRes.count ?? 0;
    const conversionRate = visitorCount > 0 ? (orderCount / visitorCount) * 100 : 0;

    return {
      visitors: visitorCount,
      orders: orderCount,
      conversionRate: Number(conversionRate.toFixed(2))
    };
  }
};