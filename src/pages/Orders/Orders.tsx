import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Orders.css';

const Orders = () => {
  const [filterStatus, setFilterStatus] = useState('todos');
  const [search, setSearch] = useState('');

  const orders = [
    {
      id: 'ORD-2024-089',
      date: '17 May, 2024',
      status: 'entregado',
      total: 1299.99,
      items: [
        { name: 'Smartphone Pro Max 256GB', qty: 1, price: 1299.99, image: '/images/products/product-1.jpg' }
      ]
    },
    {
      id: 'ORD-2024-088',
      date: '10 May, 2024',
      status: 'en tránsito',
      total: 899.98,
      items: [
        { name: 'Auriculares Inalámbricos Premium', qty: 2, price: 299.99, image: '/images/products/product-3.jpg' },
        { name: 'Cargador Rápido 65W', qty: 1, price: 299.99, image: '/images/products/product-7.jpg' }
      ]
    },
    {
      id: 'ORD-2024-085',
      date: '5 May, 2024',
      status: 'procesando',
      total: 1899.99,
      items: [
        { name: 'Laptop Gaming Ultra 16GB RAM', qty: 1, price: 1899.99, image: '/images/products/product-2.jpg' }
      ]
    },
    {
      id: 'ORD-2024-080',
      date: '28 Abr, 2024',
      status: 'entregado',
      total: 449.99,
      items: [
        { name: 'Smartwatch Deportivo GPS', qty: 1, price: 449.99, image: '/images/products/product-4.jpg' }
      ]
    },
    {
      id: 'ORD-2024-075',
      date: '20 Abr, 2024',
      status: 'cancelado',
      total: 299.99,
      items: [
        { name: 'Auriculares Inalámbricos Premium', qty: 1, price: 299.99, image: '/images/products/product-3.jpg' }
      ]
    },
  ];

  const statusConfig: Record<string, { label: string; class: string; icon: string }> = {
    'procesando': { label: 'Procesando', class: 'processing', icon: '⚙️' },
    'en tránsito': { label: 'En Tránsito', class: 'shipping', icon: '🚚' },
    'entregado': { label: 'Entregado', class: 'delivered', icon: '✅' },
    'cancelado': { label: 'Cancelado', class: 'cancelled', icon: '❌' },
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'todos' || o.status === filterStatus;
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="orders-page">
      {/* Breadcrumb */}
      <section className="breadcrumb-section">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Inicio</Link>
            <span>/</span>
            <Link to="/profile">Mi Cuenta</Link>
            <span>/</span>
            <span>Mis Pedidos</span>
          </div>
        </div>
      </section>

      <section className="orders-content">
        <div className="container">
          <div className="orders-header">
            <h1>Mis Pedidos</h1>
            <p>{orders.length} pedidos realizados</p>
          </div>

          {/* Filters */}
          <div className="orders-filters">
            <div className="search-order">
              <input
                type="text"
                placeholder="Buscar por número de pedido..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="status-filters">
              {['todos', 'procesando', 'en tránsito', 'entregado', 'cancelado'].map(s => (
                <button
                  key={s}
                  className={`status-filter-btn ${filterStatus === s ? 'active' : ''}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s === 'todos' ? 'Todos' : statusConfig[s]?.icon + ' ' + statusConfig[s]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filtered.length === 0 ? (
            <div className="empty-orders">
              <span className="empty-icon">📦</span>
              <h2>No se encontraron pedidos</h2>
              <p>Intenta con otros filtros o realiza tu primera compra</p>
              <Link to="/products" className="btn-shop">Ir a la Tienda</Link>
            </div>
          ) : (
            <div className="orders-list">
              {filtered.map(order => {
                const sc = statusConfig[order.status]!;
                return (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <div className="order-id-section">
                        <h3>Pedido #{order.id}</h3>
                        <span className="order-date">📅 {order.date}</span>
                      </div>
                      <span className={`order-status-badge ${sc.class}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>

                    <div className="order-items-preview">
                      {order.items.map((item, i) => (
                        <div key={i} className="order-item-preview">
                          <img src={item.image} alt={item.name} onError={e => (e.currentTarget.src = 'https://via.placeholder.com/60')} />
                          <div className="item-preview-info">
                            <span className="item-preview-name">{item.name}</span>
                            <span className="item-preview-qty">Cantidad: {item.qty}</span>
                          </div>
                          <span className="item-preview-price">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-footer">
                      <div className="order-total">
                        <span>Total del pedido:</span>
                        <strong>${order.total.toFixed(2)}</strong>
                      </div>
                      <div className="order-card-actions">
                        <Link to={`/orders/${order.id}`} className="btn-view-order">
                          Ver Detalles
                        </Link>
                        {order.status === 'entregado' && (
                          <button className="btn-reorder">🔄 Volver a Comprar</button>
                        )}
                        {order.status === 'procesando' && (
                          <button className="btn-cancel-order">Cancelar Pedido</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Orders;
