import { useState, useEffect } from 'react';
import { orderService, type Order } from '../../../services';
import type { OrderStatus } from '../../../services/orderService';
import '../Products/AdminProducts.css';
import './AdminOrders.css';

const statusOptions: OrderStatus[] = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

const statusConfig: Record<OrderStatus, { label: string; cls: string; icon: string }> = {
  pendiente:  { label: 'Pendiente',  cls: 'status-pending',    icon: 'fa-solid fa-clock' },
  procesando: { label: 'Procesando', cls: 'status-processing', icon: 'fa-solid fa-gear' },
  enviado:    { label: 'Enviado',    cls: 'status-shipping',   icon: 'fa-solid fa-truck' },
  entregado:  { label: 'Entregado',  cls: 'status-delivered',  icon: 'fa-solid fa-circle-check' },
  cancelado:  { label: 'Cancelado',  cls: 'status-cancelled',  icon: 'fa-solid fa-circle-xmark' },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'todos'>('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pendiente');
  const [orderPage, setOrderPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await orderService.getAllOrders(orderPage, 20, filterStatus === 'todos' ? undefined : filterStatus);
        if (!cancelled) {
          setOrders(res.data);
          setTotalPages(res.totalPages);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar pedidos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [filterStatus, orderPage]);

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    (o.user as { full_name?: string })?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    try {
      await orderService.updateOrderStatus(selectedOrder.id, newStatus);
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
      setSelectedOrder(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al actualizar estado');
    }
  };

  return (
    <div className="admin-orders">
      <div className="page-header">
        <div>
          <h1>Gestión de Pedidos</h1>
          <p>{loading ? '…' : `${orders.length} pedidos en total`}</p>
        </div>
        <div className="orders-summary">
          {statusOptions.map(s => {
            const sc = statusConfig[s];
            return (
              <span key={s} className={`summary-chip ${sc?.cls ?? ''}`}>
                <i className={sc?.icon ?? ''} /> {orders.filter(o => o.status === s).length} {sc?.label.toLowerCase() ?? s}
              </span>
            );
          })}
        </div>
      </div>

      {error && <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      <div className="filters-bar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="text" placeholder="Buscar por ID o cliente…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          <button className={`filter-tab ${filterStatus === 'todos' ? 'active' : ''}`} onClick={() => { setFilterStatus('todos'); setOrderPage(1); }}>Todos</button>
          {statusOptions.map(s => (
            <button key={s} className={`filter-tab ${filterStatus === s ? 'active' : ''}`} onClick={() => { setFilterStatus(s); setOrderPage(1); }}>
              <i className={statusConfig[s]?.icon ?? ''} /> {statusConfig[s]?.label ?? ''}
            </button>
          ))}
        </div>
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Artículos</th><th>Total</th><th>Pago</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="empty-row">Cargando pedidos…</td></tr>
              ) : filtered.map(order => {
                const sc = statusConfig[order.status]!;
                const user = order.user as { full_name?: string; email?: string } | undefined;
                return (
                  <tr key={order.id}>
                    <td><strong className="order-id">{order.order_number}</strong></td>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">{(user?.full_name || '?').charAt(0)}</div>
                        <div>
                          <div className="customer-name">{user?.full_name || '—'}</div>
                          <div className="customer-email">{user?.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>{order.items?.length || 0} art.</td>
                    <td><strong>${order.total.toFixed(2)}</strong></td>
                    <td><span className="payment-badge">{order.payment_method}</span></td>
                    <td>
                      <span className={`status-pill ${sc?.cls ?? ''}`}><i className={sc?.icon ?? ''} /> {sc?.label ?? ''}</span>
                    </td>
                    <td>
                      <button className="btn-icon view" onClick={() => { setSelectedOrder(order); setNewStatus(order.status); }} title="Ver / Cambiar estado">
                        <i className="fa-solid fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="empty-row">No se encontraron pedidos</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn-page" disabled={orderPage === 1} onClick={() => setOrderPage(p => Math.max(1, p - 1))}>Anterior</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`btn-page ${p === orderPage ? 'active' : ''}`} onClick={() => setOrderPage(p)}>{p}</button>
            ))}
            <button className="btn-page" disabled={orderPage === totalPages} onClick={() => setOrderPage(p => Math.min(totalPages, p + 1))}>Siguiente</button>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-box order-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pedido {selectedOrder.order_number}</h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="order-detail-grid">
                <div className="detail-section">
                  <h4>Cliente</h4>
                  <p><strong>{(selectedOrder.user as { full_name?: string })?.full_name || '—'}</strong></p>
                  <p>{(selectedOrder.user as { email?: string })?.email || '—'}</p>
                </div>
                <div className="detail-section">
                  <h4>Información del Pedido</h4>
                  <p>Fecha: <strong>{new Date(selectedOrder.created_at).toLocaleDateString('es-MX')}</strong></p>
                  <p>Artículos: <strong>{selectedOrder.items?.length || 0}</strong></p>
                  <p>Total: <strong>${selectedOrder.total.toFixed(2)}</strong></p>
                  <p>Pago: <strong>{selectedOrder.payment_method}</strong> · {selectedOrder.payment_status}</p>
                </div>
              </div>
              <div className="status-update-section">
                <h4>Actualizar Estado</h4>
                <div className="status-options">
                  {statusOptions.map(s => (
                    <label key={s} className={`status-option ${newStatus === s ? 'selected' : ''}`}>
                      <input type="radio" name="status" value={s} checked={newStatus === s} onChange={() => setNewStatus(s)} />
                      <i className={statusConfig[s]?.icon ?? ''}></i>
                      <span>{statusConfig[s]?.label ?? ''}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedOrder(null)}>Cerrar</button>
              <button className="btn-primary" onClick={handleStatusUpdate}><i className="fa-solid fa-floppy-disk"></i> Actualizar Estado</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
