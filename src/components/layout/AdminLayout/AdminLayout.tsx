import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: 'fa-solid fa-th', exact: true },
    { path: '/admin/products', label: 'Productos', icon: 'fa-solid fa-box' },
    { path: '/admin/categories', label: 'Categorías', icon: 'fa-solid fa-tag' },
    { path: '/admin/orders', label: 'Pedidos', icon: 'fa-solid fa-cart-shopping' },
    { path: '/admin/users', label: 'Usuarios', icon: 'fa-solid fa-users' },
    { path: '/admin/blog', label: 'Blog', icon: 'fa-solid fa-pen' },
    { path: '/admin/banners', label: 'Banners', icon: 'fa-solid fa-image' },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/admin" className="sidebar-logo">
            <i className="fa-solid fa-cart-shopping"></i>
            {sidebarOpen && <span>TechStore Admin</span>}
          </Link>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className={`fa-solid fa-${sidebarOpen ? 'chevron-left' : 'chevron-right'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
              title={!sidebarOpen ? item.label : ''}
            >
              <i className={item.icon}></i>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="nav-item" title={!sidebarOpen ? 'Ver Tienda' : ''}>
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
            {sidebarOpen && <span>Ver Tienda</span>}
          </Link>
          <button className="nav-item logout" onClick={handleLogout} title={!sidebarOpen ? 'Cerrar Sesión' : ''}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className="fa-solid fa-bars-staggered"></i>
          </button>
          <div className="topbar-right">
            <button className="topbar-btn">
              <i className="fa-solid fa-bell"></i>
              <span className="badge">3</span>
            </button>
            <div className="admin-user">
              <img src="/images/avatar/admin.jpg" alt="Admin" className="admin-avatar" />
              <div className="admin-info">
                <span className="admin-name">Administrador</span>
                <span className="admin-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
