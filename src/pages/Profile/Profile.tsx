import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import './Profile.css';
import { useAuth } from '../../contexts';
import { useOrders } from '../../hooks/useOrders';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

   const [formData, setFormData] = useState({
     firstName: user?.full_name?.split(' ')[0] || '',
     lastName: user?.full_name?.split(' ').slice(1).join(' ') || '',
     email: user?.email || '',
     phone: user?.phone || '',
     currentPassword: '',
     newPassword: '',
     confirmPassword: '',
   });

  const { orders, loading: ordersLoading, error: ordersError } = useOrders();

  const recentOrders = useMemo(() => {
    return orders.map((o) => ({
      id: String(o.order_number ?? o.id),
      date: o.created_at ? new Date(o.created_at).toLocaleDateString('es-MX') : '',
      status: o.status,
      paymentStatus: o.payment_status,
      total: o.total ?? 0,
      items: o.items?.length ?? 0,
    }));
  }, [orders]);

  const [addresses] = useState([
    {
      id: 1,
      type: 'Principal',
      name: '—',
      address: '—',
      city: '—',
      state: '—',
      zipCode: '—',
      phone: '—',
      isDefault: true,
    },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para actualizar el perfil
    // Por ahora solo simulamos éxito
    alert('Perfil actualizado correctamente');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    // Aquí iría la lógica para cambiar la contraseña
    alert('Contraseña cambiada correctamente');
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'entregado':
        return 'delivered';
case 'en_tránsito':
        case 'en tránsito':
        case 'en-transito':
        case 'procesando':
          return 'shipping';
      default:
        return '';
    }
  };

  const getPaymentStatusClass = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'pagado':
        return 'paid';
      case 'pendiente':
        return 'pending';
      case 'fallido':
        return 'failed';
      case 'reembolsado':
        return 'refunded';
      default:
        return '';
    }
  };

  return (
    <div className="profile-page">
      {/* Breadcrumb */}
      <section className="breadcrumb-section">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Inicio</Link>
            <span>/</span>
            <span>Mi Cuenta</span>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="profile-content">
        <div className="container">
          <div className="profile-layout">
            {/* Sidebar */}
            <aside className="profile-sidebar">
              <div className="user-info">
                <div className="user-avatar">
                  <img src="/images/avatar/user.jpg" alt="Usuario" />
                  <button className="btn-edit-avatar">
                    <i className="fa-solid fa-camera"></i>
                  </button>
                </div>
                 <h3>
                   {user?.full_name}
                 </h3>
                <p>{user?.email}</p>
              </div>

              <nav className="profile-nav">
                <button
                  className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="fa-solid fa-user"></i>
                  <span>Mi Perfil</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <i className="fa-solid fa-bag-shopping"></i>
                  <span>Mis Pedidos</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('addresses')}
                >
                  <i className="fa-solid fa-location-dot"></i>
                  <span>Direcciones</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >
                  <i className="fa-solid fa-lock"></i>
                  <span>Cambiar Contraseña</span>
                </button>
                <Link to="/wishlist" className="nav-item">
                  <i className="fa-solid fa-heart"></i>
                  <span>Lista de Deseos</span>
                </Link>
                <button className="nav-item logout">
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <span>Cerrar Sesión</span>
                </button>
              </nav>
            </aside>

            {/* Main Content */}
            <div className="profile-main">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="tab-content">
                  <h2>Información Personal</h2>
                  <form onSubmit={handleProfileUpdate} className="profile-form">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Nombre</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Apellido</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Teléfono</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-save">
                      Guardar Cambios
                    </button>
                  </form>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="tab-content">
                  <h2>Mis Pedidos</h2>

                  {ordersLoading ? (
                    <p>Cargando pedidos…</p>
                  ) : ordersError ? (
                    <p>Error al cargar pedidos</p>
                  ) : (
                    <div className="orders-list">
                      {recentOrders.length === 0 ? (
                        <p>No tienes pedidos todavía.</p>
                      ) : (
                        recentOrders.map((order) => (
                          <div key={order.id} className="order-card">
                             <div className="order-header">
                               <div className="order-info">
                                 <h3>{order.id}</h3>
                                 <span className="order-date">{order.date}</span>
                               </div>
                               <div className="order-statuses">
                                 <span className={`order-status ${getStatusClass(order.status)}`}>
                                   {order.status}
                                 </span>
                                 <span className={`payment-status ${getPaymentStatusClass(order.paymentStatus)}`}>
                                   {order.paymentStatus}
                                 </span>
                               </div>
                             </div>

                            <div className="order-details">
                              <div className="detail-item">
                                <span className="label">Total:</span>
                                <span className="value">${order.total.toFixed(2)}</span>
                              </div>
                              <div className="detail-item">
                                <span className="label">Productos:</span>
                                <span className="value">{order.items} artículos</span>
                              </div>
                            </div>

                            <div className="order-actions">
                              <Link to={`/orders/${order.id}`} className="btn-view">
                                Ver Detalles
                              </Link>
                              {order.status === 'entregado' && (
                                <button className="btn-reorder">Volver a Comprar</button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>Mis Direcciones</h2>
                    <button className="btn-add">
                      <i className="fa-solid fa-plus"></i>
                      Agregar Dirección
                    </button>
                  </div>
                  <div className="addresses-grid">
                    {addresses.map((address) => (
                      <div key={address.id} className="address-card">
                        {address.isDefault && <span className="default-badge">Principal</span>}
                        <h3>{address.type}</h3>
                        <div className="address-info">
                          <p>
                            <strong>{address.name}</strong>
                          </p>
                          <p>{address.address}</p>
                          <p>
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p>{address.phone}</p>
                        </div>
                        <div className="address-actions">
                          <button className="btn-edit">
                            <i className="fa-solid fa-edit"></i>
                            Editar
                          </button>
                          <button className="btn-delete">
                            <i className="fa-solid fa-trash"></i>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div className="tab-content">
                  <h2>Cambiar Contraseña</h2>
                  <form onSubmit={handlePasswordChange} className="password-form">
                    <div className="form-group">
                      <label>Contraseña Actual</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          required
                        />
                    </div>
                    <div className="form-group">
                      <label>Nueva Contraseña</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        minLength={8}
                        required
                      />
                      <small>Mínimo 8 caracteres</small>
                    </div>
                    <div className="form-group">
                      <label>Confirmar Nueva Contraseña</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-save">
                      Cambiar Contraseña
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;

