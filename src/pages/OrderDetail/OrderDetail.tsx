import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { invoiceService } from '../../services/invoiceService';
import { useAuth } from '../../contexts/AuthContext';
import Seo from '../../components/seo/Seo';
import type { Order } from '../../types';
import type { Invoice } from '../../services/invoiceService';
import './OrderDetail.css';

// ============================================================
// ORDER DETAIL — conectado a Supabase + descarga de factura
// ============================================================

const statusConfig: Record<string, { label: string; class: string; icon: string }> = {
  pendiente:   { label: 'Pendiente',   class: 'pending',    icon: '⏳' },
  procesando:  { label: 'Procesando',  class: 'processing', icon: '⚙️' },
  enviado:     { label: 'Enviado',     class: 'shipping',   icon: '🚚' },
  entregado:   { label: 'Entregado',   class: 'delivered',  icon: '✅' },
  cancelado:   { label: 'Cancelado',   class: 'cancelled',  icon: '❌' },
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder]     = useState<Order | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    const orderId = parseInt(id);
    if (isNaN(orderId)) { navigate('/orders'); return; }

    setLoading(true);
    Promise.all([
      orderService.getOrderById(orderId),
      invoiceService.getByOrderId(orderId),
    ])
      .then(([orderData, invoiceData]) => {
        if (!orderData) { setError('Pedido no encontrado'); return; }
        // Verificar que el pedido pertenece al usuario (o es staff)
        if (orderData.user_id !== user.id) { navigate('/orders'); return; }
        setOrder(orderData);
        setInvoice(invoiceData);
      })
      .catch(() => setError('Error al cargar el pedido'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
          <p>Cargando pedido…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-detail-page">
        <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
          <p>{error || 'Pedido no encontrado'}</p>
          <Link to="/orders">Volver a Mis Pedidos</Link>
        </div>
      </div>
    );
  }

  const sc = statusConfig[order.status] || { label: order.status, class: '', icon: '📋' };
  const addr = order.shipping_address as {
    full_name?: string; address?: string; city?: string;
    state?: string; zip_code?: string; phone?: string;
  };

  return (
    <div className="order-detail-page">
      <Seo title={`Pedido #${order.order_number}`} robots="noindex" />

      {/* Breadcrumb */}
      <section className="breadcrumb-section">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Inicio</Link><span>/</span>
            <Link to="/orders">Mis Pedidos</Link><span>/</span>
            <span>#{order.order_number}</span>
          </div>
        </div>
      </section>

      <section className="order-detail-content">
        <div className="container">
          {/* Header */}
          <div className="order-detail-header">
            <div>
              <h1>Pedido #{order.order_number}</h1>
              <p>Realizado el {new Date(order.created_at).toLocaleDateString('es-MX', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}</p>
            </div>
            <span className={`order-status-badge ${sc.class}`}>{sc.icon} {sc.label}</span>
          </div>

          <div className="order-detail-layout">
            {/* Columna izquierda */}
            <div className="order-detail-main">

              {/* Items del pedido */}
              <div className="detail-card">
                <h3>Productos ({order.items?.length ?? 0})</h3>
                <div className="order-items-list">
                  {(order.items || []).map(item => (
                    <div key={item.id} className="order-item-row">
                      <img
                        src={item.product?.images?.[0] || '/images/products/placeholder.jpg'}
                        alt={item.product?.name || 'Producto'}
                        onError={e => (e.currentTarget.src = '/images/products/placeholder.jpg')}
                      />
                      <div className="order-item-info">
                        {item.product ? (
                          <Link to={`/product/${item.product_id}`} className="order-item-name">
                            {item.product.name}
                          </Link>
                        ) : (
                          <span className="order-item-name">Producto #{item.product_id}</span>
                        )}
                        <span className="order-item-qty">Cantidad: {item.quantity}</span>
                        <span className="order-item-sku">${item.unit_price.toFixed(2)} c/u</span>
                      </div>
                      <div className="order-item-price">
                        <strong>${item.total_price.toFixed(2)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estado de envío */}
              <div className="detail-card">
                <h3>Estado del Pedido</h3>
                <div className="order-timeline">
                  {(['pendiente', 'procesando', 'enviado', 'entregado'] as const).map((step, i) => {
                    const stepOrder = ['pendiente', 'procesando', 'enviado', 'entregado'];
                    const currentIdx = stepOrder.indexOf(order.status);
                    const done = i <= currentIdx && order.status !== 'cancelado';
                    return (
                      <div key={step} className={`timeline-step ${done ? 'done' : ''}`}>
                        <div className="timeline-icon">{statusConfig[step].icon}</div>
                        <div className="timeline-info">
                          <strong>{statusConfig[step].label}</strong>
                        </div>
                        {i < 3 && <div className="timeline-line"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="order-detail-sidebar">

              {/* Resumen */}
              <div className="detail-card">
                <h3>Resumen del Pedido</h3>
                <div className="order-summary-rows">
                  <div className="summary-row"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                  {order.shipping_cost > 0 && (
                    <div className="summary-row"><span>Envío</span><span>${order.shipping_cost.toFixed(2)}</span></div>
                  )}
                  {order.shipping_cost === 0 && (
                    <div className="summary-row"><span>Envío</span><span className="free-text">Gratis</span></div>
                  )}
                  {order.tax > 0 && (
                    <div className="summary-row"><span>IVA</span><span>${order.tax.toFixed(2)}</span></div>
                  )}
                  {order.discount > 0 && (
                    <div className="summary-row"><span>Descuento</span><span>-${order.discount.toFixed(2)}</span></div>
                  )}
                  <div className="summary-divider"></div>
                  <div className="summary-row total-row">
                    <span>Total</span><strong>${order.total.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Método de pago */}
              <div className="detail-card">
                <h3>Pago</h3>
                <div className="payment-info">
                  <span className="payment-icon">💳</span>
                  <div>
                    <p style={{ textTransform: 'capitalize' }}>{order.payment_method}</p>
                    <p className="card-last4" style={{
                      color: order.payment_status === 'pagado' ? '#22c55e' : '#f59e0b'
                    }}>
                      {order.payment_status === 'pagado' ? '✅ Pagado' :
                       order.payment_status === 'fallido' ? '❌ Fallido' : '⏳ Pendiente'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dirección */}
              {addr && (
                <div className="detail-card">
                  <h3>Dirección de Entrega</h3>
                  <div className="address-info">
                    {addr.full_name && <p><strong>{addr.full_name}</strong></p>}
                    {addr.address && <p>{addr.address}</p>}
                    <p>{[addr.city, addr.state, addr.zip_code].filter(Boolean).join(', ')}</p>
                    {addr.phone && <p>{addr.phone}</p>}
                  </div>
                </div>
              )}

              {/* Factura */}
              <div className="detail-card">
                <h3>Factura</h3>
                {invoice ? (
                  <div>
                    <p><small>#{invoice.invoice_number}</small></p>
                    {invoice.pdf_url ? (
                      <a
                        href={invoice.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-action-secondary"
                        style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 8 }}
                      >
                        📥 Descargar Factura PDF
                      </a>
                    ) : (
                      <p style={{ color: '#888', fontSize: 13 }}>PDF en procesamiento…</p>
                    )}
                  </div>
                ) : (
                  <p style={{ color: '#888', fontSize: 13 }}>
                    {order.payment_status === 'pagado'
                      ? 'Factura en generación…'
                      : 'La factura se generará al confirmar el pago.'}
                  </p>
                )}
              </div>

              {/* Acciones */}
              <div className="order-detail-actions">
                <button className="btn-action-secondary" onClick={() => window.print()}>
                  🖨️ Imprimir Pedido
                </button>
                <Link to="/orders" className="btn-action-link">← Volver a Mis Pedidos</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderDetail;
