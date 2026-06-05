import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService, productService, categoryService } from '../../../services';
import { loyaltyService } from '../../../services/loyaltyService';
import { notificationService } from '../../../services/notificationService';
import { affiliateService } from '../../../services/affiliateService';
import { reviewService } from '../../../services/reviewService';
import type { Order, Product, Category } from '../../../types';
import type { LoyaltyProgram, UserLoyalty } from '../../../services/loyaltyService';
import type { AffiliateProgram, Affiliate } from '../../../services/affiliateService';
import type { Review } from '../../../types';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState([
    { label: 'Ventas Totales', value: '$0', change: '—', up: true,  icon: 'fa-solid fa-dollar-sign',  color: 'green'  },
    { label: 'Pedidos',        value: '0',   change: '—', up: true,  icon: 'fa-solid fa-cart-shopping', color: 'blue'   },
    { label: 'Clientes',       value: '0',   change: '—', up: true,  icon: 'fa-solid fa-users',        color: 'purple' },
    { label: 'Productos',      value: '0',   change: '—', up: false, icon: 'fa-solid fa-box',          color: 'orange' },
    { label: 'Puntos Lealtad', value: '0',   change: '—', up: true,  icon: 'fa-solid fa-gem',          color: 'pink'   },
    { label: 'Notificaciones', value: '0',   change: '—', up: false, icon: 'fa-solid fa-bell',         color: 'orange' },
    { label: 'Afiliados Activos', value: '0', change: '—', up: true,  icon: 'fa-solid fa-network-wired', color: 'green'  },
    { label: 'Reseñas Pendientes', value: '0', change: '—', up: false, icon: 'fa-solid fa-comment',     color: 'orange' }
  ]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loyaltyStats, setLoyaltyStats] = useState<{ points_balance: number; total_users: number }>({ points_balance: 0, total_users: 0 });
  const [notificationStats, setNotificationStats] = useState<{ pending: number; sent: number; failed: number; delivered: number; read: number }>({ pending: 0, sent: 0, failed: 0, delivered: 0, read: 0 });
  const [affiliateStats, setAffiliateStats] = useState<{ total: number; active: number; earnings: number }>({ total: 0, active: 0, earnings: 0 });
  const [reviewStats, setReviewStats] = useState<{ total: number; pending: number; approved: number }>({ total: 0, pending: 0, approved: 0 });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // Load all data in parallel
        const [
          salesRes,
          ordersRes,
          productsRes,
          categoriesRes,
          notificationRes,
        ] = await Promise.all([
          orderService.getSalesStats(),
          orderService.getAllOrders(1, 25),
          productService.getProducts({ limit: 100 }),
          categoryService.getAllCategories(),
          notificationService.getNotificationStats().catch(() => ({ pending: 0, sent: 0, failed: 0, delivered: 0, read: 0 })),
        ]);

        // Valores por defecto para módulos opcionales (tablas pueden no existir aún)
        const loyaltyRes   = { points_balance: 0, total_users: 0 };
        const affiliateRes = { total: 0, active: 0, earnings: 0 };
        const reviewRes    = { total: 0, pending: 0, approved: 0 };

        if (cancelled) return;

        const totalRevenue = salesRes.totalRevenue;
        const totalOrders  = salesRes.totalOrders;
        const delivered    = salesRes.delivered;

        setStats([
          { label: 'Ventas Totales', value: `$${totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`, change: '+reales', up: true,  icon: 'fa-solid fa-dollar-sign',  color: 'green'  },
          { label: 'Pedidos',        value: totalOrders.toString(),         change: `(${delivered} entregados)`, up: true, icon: 'fa-solid fa-cart-shopping', color: 'blue'   },
          { label: 'Clientes (perfiles)', value: '-',  change: '',   up: true,  icon: 'fa-solid fa-users',        color: 'purple' },
          { label: 'Productos',      value: productsRes.total.toString(),   change: '',   up: false, icon: 'fa-solid fa-box',          color: 'orange' },
          { label: 'Puntos Lealtad', value: `${loyaltyRes.points_balance.toLocaleString()}`, change: '', up: true, icon: 'fa-solid fa-gem', color: 'pink' },
          { label: 'Notificaciones', value: `${notificationRes.pending + notificationRes.sent + notificationRes.delivered + notificationRes.read}`, change: '', up: false, icon: 'fa-solid fa-bell', color: 'orange' },
          { label: 'Afiliados Activos', value: `${affiliateRes.active}`, change: '', up: true, icon: 'fa-solid fa-network-wired', color: 'green' },
          { label: 'Reseñas Pendientes', value: `${reviewRes.pending}`, change: '', up: false, icon: 'fa-solid fa-comment', color: 'orange' }
        ]);

        const orders = ordersRes.data.slice(0, 8);
        setRecentOrders(orders);

        // top products by reviews_count
        const sorted = [...productsRes.data].sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0)).slice(0, 5);
        setTopProducts(sorted);

        setCategories(categoriesRes);
        
        setLoyaltyStats(loyaltyRes);
        setNotificationStats(notificationRes);
        setAffiliateStats(affiliateRes);
        setReviewStats(reviewRes);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

   const getStatusClass = (status: string) => {
     const map: Record<string, string> = {
       entregado: 'status-delivered', enviado: 'status-shipping', procesando: 'status-processing',
       cancelado: 'status-cancelled', pendiente: 'status-pending',
     };
     return map[status] || '';
   };

   const getPaymentStatusClass = (paymentStatus: string) => {
     switch (paymentStatus) {
       case 'pagado':
         return 'payment-paid';
       case 'pendiente':
         return 'payment-pending';
       case 'fallido':
         return 'payment-failed';
       case 'reembolsado':
         return 'payment-refunded';
       default:
         return '';
     }
   };

  const getCategoryColor = (_name: string, index: number) => {
    const colors = ['#ff3d3d', '#004ec3', '#22c55e', '#FCB500', '#94a3b8'];
    return colors[index % colors.length];
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Bienvenido de vuelta, Administrador</p>
        </div>
      </div>

      {error && <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon-wrap"><i className={stat.icon}></i></div>
            <div className="stat-info">
              <p className="stat-label">{stat.label}</p>
              <h2 className="stat-value">{loading ? '…' : stat.value}</h2>
              {stat.change !== '—' && <span className={`stat-change ${stat.up ? 'up' : 'down'}`}><i className={`fa-solid ${stat.up ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i> {stat.change}</span>}
            </div>
          </div>
        ))}
      </div>

       {/* Charts Row */}
       <div className="charts-row">
         {/* Recent Orders */}
         <div className="chart-card">
           <div className="card-header">
             <h3><i className="fa-solid fa-clock-rotate-left"></i> Pedidos Recientes</h3>
             <Link to="/admin/orders" className="view-all">Ver todos <i className="fa-solid fa-arrow-right"></i></Link>
           </div>
           <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Pago</th>
                  </tr>
                </thead>
               <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="empty-row">Cargando…</td></tr>
                  ) : recentOrders.map(order => (
                    <tr key={order.id}>
                      <td><Link to={`/admin/orders`} className="order-link">{order.order_number}</Link></td>
                      <td>{(order.user as { full_name?: string })?.full_name || '—'}</td>
                      <td>{new Date(order.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td><strong>${order.total.toFixed(2)}</strong></td>
                      <td><span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span></td>
                      <td><span className={`payment-badge ${getPaymentStatusClass(order.payment_status)}`}>{order.payment_status}</span></td>
                    </tr>
                 ))}
                  {!loading && recentOrders.length === 0 && (
                    <tr><td colSpan={6} className="empty-row">Sin pedidos aún</td></tr>
                  )}
               </tbody>
             </table>
           </div>
         </div>

         {/* Top Products */}
         <div className="chart-card small">
           <div className="card-header">
             <h3><i className="fa-solid fa-trophy"></i> Más Vendidos</h3>
             <Link to="/admin/products" className="view-all">Ver todos <i className="fa-solid fa-arrow-right"></i></Link>
           </div>
           <div className="table-wrapper">
             <table className="admin-table">
               <thead>
                 <tr><th>Producto</th><th>Reseñas</th><th>Precio</th><th>Stock</th></tr>
               </thead>
               <tbody>
                 {loading ? (
                   <tr><td colSpan={4} className="empty-row">Cargando…</td></tr>
                 ) : topProducts.map(product => (
                   <tr key={product.id}>
                     <td className="product-name-cell">{product.name}</td>
                     <td>{product.reviews_count}</td>
                     <td><strong>${product.price.toFixed(2)}</strong></td>
                     <td>
                       <span className={`stock-badge ${product.stock < 20 ? 'low' : 'ok'}`}>{product.stock}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>

         {/* Loyalty Points */}
         <div className="chart-card small">
           <div className="card-header">
             <h3><i className="fa-solid fa-gem"></i> Puntos de Lealtad</h3>
             <Link to="/admin/loyalty" className="view-all">Ver todos <i className="fa-solid fa-arrow-right"></i></Link>
           </div>
           <div className="table-wrapper">
             <table className="admin-table">
               <thead>
                 <tr><th>Usuarios</th><th>Puntos Totales</th><th>Promedio</th></tr>
               </thead>
               <tbody>
                 {loading ? (
                   <tr><td colSpan={3} className="empty-row">Cargando…</td></tr>
                 ) : (
                   <tr>
                     <td>{loyaltyStats.total_users}</td>
                     <td>{loyaltyStats.points_balance.toLocaleString()}</td>
                     <td>{loyaltyStats.total_users > 0 ? (loyaltyStats.points_balance / loyaltyStats.total_users).toFixed(0) : '0'}</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
         </div>

         {/* Notifications */}
         <div className="chart-card small">
           <div className="card-header">
             <h3><i className="fa-solid fa-bell"></i> Notificaciones</h3>
             <Link to="/admin/notifications" className="view-all">Ver todos <i className="fa-solid fa-arrow-right"></i></Link>
           </div>
           <div className="table-wrapper">
             <table className="admin-table">
               <thead>
                 <tr><th>Pendientes</th><th>Enviadas</th><th>Fallidas</th><th>Entregadas</th></tr>
               </thead>
               <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="empty-row">Cargando…</td></tr>
                  ) : (
                    <tr>
                      <td>{notificationStats.pending}</td>
                      <td>{notificationStats.sent}</td>
                      <td>{notificationStats.failed}</td>
                      <td>{notificationStats.delivered}</td>
                    </tr>
                  )}
                 </tbody>
              </table>
           </div>
         </div>

         {/* Affiliates */}
         <div className="chart-card small">
           <div className="card-header">
             <h3><i className="fa-solid fa-network-wired"></i> Afiliados</h3>
             <Link to="/admin/affiliates" className="view-all">Ver todos <i className="fa-solid fa-arrow-right"></i></Link>
           </div>
           <div className="table-wrapper">
             <table className="admin-table">
               <thead>
                 <tr><th>Total</th><th>Activos</th><th>Comisiones ($)</th></tr>
               </thead>
               <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="empty-row">Cargando…</td></tr>
                  ) : (
                    <tr>
                      <td>{affiliateStats.total}</td>
                      <td>{affiliateStats.active}</td>
                      <td>${affiliateStats.earnings.toFixed(2)}</td>
                    </tr>
                  )}
                 </tbody>
              </table>
           </div>
         </div>

         {/* Reviews */}
         <div className="chart-card small">
           <div className="card-header">
             <h3><i className="fa-solid fa-comment"></i> Reseñas</h3>
             <Link to="/admin/reviews" className="view-all">Ver todos <i className="fa-solid fa-arrow-right"></i></Link>
           </div>
           <div className="table-wrapper">
             <table className="admin-table">
               <thead>
                 <tr><th>Total</th><th>Pendientes</th><th>Aprobadas</th></tr>
               </thead>
               <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="empty-row">Cargando…</td></tr>
                  ) : (
                    <tr>
                      <td>{reviewStats.total}</td>
                      <td>{reviewStats.pending}</td>
                      <td>{reviewStats.approved}</td>
                    </tr>
                  )}
               </tbody>
             </table>
           </div>
         </div>
       </div>

       {/* Category Distribution */}
       {!loading && categories.length > 0 && (
         <div className="charts-row">
           <div className="chart-card">
             <div className="card-header">
               <h3><i className="fa-solid fa-chart-pie"></i> Por Categoría</h3>
             </div>
<div className="category-stats">
                {categories.map((cat, i) => {
                  const max = Math.max(...categories.map(c => 0)); // No reviews_count in Category
                  const pct = 5; // Default percentage since we don't have reviews_count
                  return (
                    <div key={cat.id} className="category-row">
                      <div className="cat-info">
                        <span className="cat-dot" style={{ background: getCategoryColor(cat.name, i) }}></span>
                        <span className="cat-name">{cat.name}</span>
                      </div>
                      <div className="cat-bar-wrap">
                        <div className="cat-bar" style={{ width: `${pct}%`, background: getCategoryColor(cat.name, i) }}></div>
                      </div>
                      <span className="cat-pct">Productos</span>
                    </div>
                  );
                })}
              </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default AdminDashboard;
