import { useState, useEffect } from 'react';
import { orderService } from '../services';
import { useAuth } from '../contexts';
import type { Order, OrderStatus } from '../types';

// ============================================
// HOOK: Pedidos del usuario
// ============================================

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getUserOrders(user.id);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [user]);

  const cancelOrder = async (orderId: number) => {
    if (!user) return;
    try {
      await orderService.cancelOrder(orderId, user.id);
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: 'cancelado' as OrderStatus } : o
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar pedido');
    }
  };

  return { orders, loading, error, cancelOrder, refetch: fetchOrders };
};

// ============================================
// HOOK: Pedido individual
// ============================================

export const useOrder = (id: number | null) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orderService.getOrderById(id)
      .then(setOrder)
      .catch(err => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, [id]);

  return { order, loading, error };
};
