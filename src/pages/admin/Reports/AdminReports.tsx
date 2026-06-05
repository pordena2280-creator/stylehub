import { useState, useEffect } from 'react';
import { reportsService } from '../../../services';
import type { SalesReport, TopProduct, RecentOrder, InventoryAlert } from '../../../services/reportsService';
import { getProductImageUrl } from '../../../utils/imageUtils';

const AdminReports = () => {
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [conversionMetrics, setConversionMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');

  useEffect(() => {
    let cancelled = false;
    const loadReports = async () => {
      setLoading(true);
      setError(null);
      try {
        // Cargar todos los reportes en paralelo
        const [
          salesData,
          topProductsData,
          recentOrdersData,
          inventoryAlertsData,
          conversionData
        ] = await Promise.all([
          reportsService.getSalesReport(selectedPeriod),
          reportsService.getTopProducts(10),
          reportsService.getRecentOrders(5),
          reportsService.getInventoryAlerts(),
          reportsService.getConversionMetrics()
        ]);

        if (!cancelled) {
          setSalesReport(salesData);
          setTopProducts(topProductsData);
          setRecentOrders(recentOrdersData);
          setInventoryAlerts(inventoryAlertsData);
          setConversionMetrics(conversionData);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar reportes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadReports();
    return () => { cancelled = true; };
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <div className="admin-reports">
      <div className="page-header">
        <div>
          <h1>Reportes y Analíticas</h1>
          <p>Obtén insights sobre el rendimiento de tu tienda</p>
        </div>
        <div className="period-selector">
          <label>Período: </label>
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as any)}>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="ytd">Año actual</option>
          </select>
        </div>
      </div>

      {error && <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      {loading ? (
        <div className="loading-placeholder">
          <div className="grid-placeholder">
            <div className="placeholder-item"></div>
            <div className="placeholder-item"></div>
            <div className="placeholder-item"></div>
            <div className="placeholder-item"></div>
            <div className="placeholder-item"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Métricas principales */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <i className="fa-solid fa-dollar-sign"></i>
                <span>Ventas Totales</span>
              </div>
              <div className="metric-value">{salesReport ? formatCurrency(salesReport.totalSales) : '$0'}</div>
              <div className="metric-subtext">
                {salesReport ? `${salesReport.totalOrders} órdenes` : '0 órdenes'}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <i className="fa-solid fa-cart-shopping"></i>
                <span>Promedio por Orden</span>
              </div>
              <div className="metric-value">{salesReport ? formatCurrency(salesReport.averageOrderValue) : '$0'}</div>
              <div className="metric-subtext">Valor promedio</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <i className="fa-solid fa-chart-line"></i>
                <span>Tasa de Conversión</span>
              </div>
              <div className="metric-value">
                {conversionMetrics ? `${conversionMetrics.conversionRate}%` : '0%'}
              </div>
              <div className="metric-subtext">
                {conversionMetrics ? 
                  `${conversionMetrics.orders} de ${conversionMetrics.visitors} visitas` : 
                  '0 de 0 visitas'}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>Alertas de Inventario</span>
              </div>
              <div className="metric-value">{inventoryAlerts.length}</div>
              <div className="metric-subtext">Productos con stock bajo</div>
            </div>
          </div>

          {/* Gráficos y tablas */}
          <div className="reports-content">
            <div className="report-section">
              <h2>Productos Más Vendidos</h2>
              {topProducts.length > 0 ? (
                <div className="products-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Unidades Vendidas</th>
                        <th>Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product, index) => (
                        <tr key={index}>
                          <td>
                             <div className="product-info">
                               <img 
                                 src={getProductImageUrl(product.product)} 
                                 alt={product.product.name} 
                                 className="product-img-sm"
                               />
                               <span>{product.product.name}</span>
                             </div>
                          </td>
                          <td>{product.unitsSold}</td>
                          <td>{formatCurrency(product.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No hay datos de ventas disponibles</p>
              )}
            </div>

            <div className="report-section">
              <h2>Órdenes Recientes</h2>
              {recentOrders.length > 0 ? (
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, index) => (
                        <tr key={index}>
                          <td>#{order.order.order_number}</td>
                          <td>{order.customer.full_name}</td>
                          <td>{new Date(order.order.created_at).toLocaleDateString()}</td>
                          <td>{formatCurrency(order.order.total)}</td>
                          <td>
                            <span className={`status-badge ${order.order.payment_status}`}>
                              {order.order.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No hay órdenes recientes</p>
              )}
            </div>

            <div className="report-section">
              <h2>Alertas de Inventario</h2>
              {inventoryAlerts.length > 0 ? (
                <div className="inventory-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Stock Actual</th>
                        <th>Umbral</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryAlerts.map((alert, index) => (
                        <tr key={index}>
                          <td>{alert.product.name}</td>
                          <td>
                            <span className={`stock-alert ${alert.stock <= alert.threshold / 2 ? 'critical' : 'warning'}`}>
                              {alert.stock}
                            </span>
                          </td>
                          <td>{alert.threshold}</td>
                          <td>
                            <button
                              className="btn-sm btn-outline"
                              onClick={() => {
                                // alert nombra colisión con InventoryAlert (string[] en tipos)
                                window.alert(`Reabastecer ${alert.product.name}`);
                              }}
                            >
                              Reabastecer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No hay alertas de inventario</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReports;