import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './AdminLayout.css';

const menuItems = [
  { path: '/admin',               icon: 'fa-solid fa-chart-line',    label: 'Dashboard',      exact: true },
  { path: '/admin/products',      icon: 'fa-solid fa-box',           label: 'Productos' },
  { path: '/admin/categories',    icon: 'fa-solid fa-tags',          label: 'Categorías' },
  { path: '/admin/orders',        icon: 'fa-solid fa-cart-shopping', label: 'Pedidos' },
  { path: '/admin/users',         icon: 'fa-solid fa-users',         label: 'Usuarios' },
  { path: '/admin/roles',         icon: 'fa-solid fa-user-tag',      label: 'Roles' },
  { path: '/admin/coupons',       icon: 'fa-solid fa-tag',           label: 'Cupones' },
  { path: '/admin/reports',       icon: 'fa-solid fa-chart-bar',     label: 'Reportes' },
  { path: '/admin/settings',      icon: 'fa-solid fa-gear',          label: 'Configuración' },
  { path: '/admin/loyalty',       icon: 'fa-solid fa-gem',           label: 'Lealtad' },
  { path: '/admin/notifications', icon: 'fa-solid fa-bell',          label: 'Notificaciones' },
  { path: '/admin/affiliates',    icon: 'fa-solid fa-network-wired', label: 'Afiliados' },
  { path: '/admin/reviews',       icon: 'fa-solid fa-comment',       label: 'Reseñas' },
  { path: '/admin/blog',          icon: 'fa-solid fa-newspaper',     label: 'Blog' },
  { path: '/admin/banners',       icon: 'fa-solid fa-image',         label: 'Banners' },
  { path: '/admin/cms',           icon: 'fa-solid fa-pen-to-square', label: 'CMS Páginas' },
];

// Paths visibles por rol. 'admin' ve todo. '*' = todos los paths.
const menuByRole: Record<string, string[] | '*'> = {
  admin:    '*',
  editor:   ['/admin', '/admin/products', '/admin/categories', '/admin/reviews', '/admin/blog', '/admin/banners', '/admin/cms'],
  operador: ['/admin', '/admin/orders', '/admin/users', '/admin/reports'],
};

const getVisibleMenu = (role?: string) => {
  if (!role) return [];
  const allowed = menuByRole[role];
  if (!allowed) return [];
  if (allowed === '*') return menuItems;
  return menuItems.filter(item => (allowed as string[]).includes(item.path));
};

const breadcrumbMap: Record<string, string> = {
  '/admin':            'Dashboard',
  '/admin/products':   'Productos',
  '/admin/categories': 'Categorías',
  '/admin/orders':     'Pedidos',
  '/admin/users':      'Usuarios',
  '/admin/roles':      'Roles',
  '/admin/coupons':    'Cupones',
  '/admin/reports':    'Reportes',
  '/admin/settings':   'Configuración',
  '/admin/loyalty':    'Lealtad',
  '/admin/notifications': 'Notificaciones',
  '/admin/affiliates': 'Afiliados',
  '/admin/reviews':    'Reseñas',
  '/admin/blog':       'Blog',
  '/admin/banners':    'Banners',
  '/admin/cms':        'CMS Páginas',
};

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  operador: 'Operador',
  cliente: 'Cliente',
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isStaff, user, loading, logout } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isStaff) return <Navigate to="/" replace />;

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const visibleMenu = getVisibleMenu(user?.role);

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const currentPage = Object.entries(breadcrumbMap).find(([key]) =>
    location.pathname === key || location.pathname.startsWith(key + '/')
  )?.[1] || 'Admin';

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

      {/* ===== SIDEBAR ===== */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/admin" className="sidebar-logo">
            <i className="fa-solid fa-store sidebar-logo-icon"></i>
            {sidebarOpen && <span className="sidebar-logo-text">StyleHub Admin</span>}
          </Link>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Colapsar' : 'Expandir'}
          >
            <i className={`fa-solid ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">{sidebarOpen && 'MENÚ PRINCIPAL'}</div>
          {visibleMenu.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
              title={!sidebarOpen ? item.label : ''}
            >
              <i className={`${item.icon} nav-item-icon`}></i>
              {sidebarOpen && <span className="nav-item-label">{item.label}</span>}
              {sidebarOpen && isActive(item.path, item.exact) && (
                <span className="nav-item-dot"></span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-divider"></div>
          <Link
            to="/"
            className="sidebar-nav-item"
            title={!sidebarOpen ? 'Ver Tienda' : ''}
          >
            <i className="fa-solid fa-shop nav-item-icon"></i>
            {sidebarOpen && <span className="nav-item-label">Ver Tienda</span>}
          </Link>
          <button
            className="sidebar-nav-item logout-item"
            onClick={handleLogout}
            title={!sidebarOpen ? 'Cerrar Sesión' : ''}
          >
            <i className="fa-solid fa-right-from-bracket nav-item-icon"></i>
            {sidebarOpen && <span className="nav-item-label">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div className="admin-main">

        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fa-solid fa-list"></i>
            </button>
            <div className="topbar-breadcrumb">
              <span className="breadcrumb-home">
                <i className="fa-solid fa-house"></i>
              </span>
              <i className="fa-solid fa-chevron-right breadcrumb-sep"></i>
              <span className="breadcrumb-current">{currentPage}</span>
            </div>
          </div>

          <div className="topbar-right">
            <button className="topbar-icon-btn" title="Notificaciones">
              <i className="fa-regular fa-bell"></i>
              <span className="notif-badge">3</span>
            </button>
            <button className="topbar-icon-btn" title="Mensajes">
              <i className="fa-regular fa-envelope"></i>
            </button>
            <div className="topbar-user">
              <div className="topbar-avatar">
                <i className="fa-solid fa-user-tie"></i>
              </div>
              <div className="topbar-user-info">
                <span className="topbar-user-name">{user?.full_name || user?.email || 'Usuario'}</span>
                <span className="topbar-user-role">{roleLabels[user?.role || ''] || 'Equipo'}</span>
              </div>
              <i className="fa-solid fa-chevron-down topbar-chevron"></i>
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
