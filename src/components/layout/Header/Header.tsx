import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCmsSection } from '../../../hooks/useCmsSection';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import './Header.css';

const navLinks = [
  { to: '/',         label: 'Inicio',     exact: true },
  { to: '/products', label: 'Productos' },
  { to: '/categories', label: 'Categorías' },
  { to: '/about',    label: 'Acerca de' },
  { to: '/blog',     label: 'Blog' },
  { to: '/faq',      label: 'FAQ' },
  { to: '/contact',  label: 'Contacto' },
];

const Header = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled,    setScrolled]    = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { section: topbarCms } = useCmsSection('header_topbar');
  const { section: brandCms } = useCmsSection('header_brand');

  const topbarPhone = topbarCms?.title || '+1 (800) 123-4567';
  const topbarEmail = topbarCms?.subtitle || 'soporte@tienda.com';
  const topbarPromo = topbarCms?.description || 'Envío gratis en pedidos mayores a $100';
  const brandName = brandCms?.title || 'StyleHub';
  const brandTagline = brandCms?.subtitle || 'Tu tienda de confianza';

  const { items } = useCart();
  const { isAuthenticated } = useAuth();

  const cartCount = items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const isLoggedIn = isAuthenticated;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const isActive = (to: string, exact = false) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <>
      {/* ===== TOP BAR ===== */}
      <div className="header-topbar">
        <div className="topbar-container">
          <div className="topbar-left">
            <span className="topbar-item">
              <i className="fa-solid fa-phone"></i>
              <a href={`tel:${topbarPhone.replace(/[^+\d]/g, '')}`}>{topbarPhone}</a>
            </span>
            <span className="topbar-divider">|</span>
            <span className="topbar-item">
              <i className="fa-regular fa-envelope"></i>
              <a href={`mailto:${topbarEmail}`}>{topbarEmail}</a>
            </span>
            <span className="topbar-divider">|</span>
            <span className="topbar-item topbar-promo">
              <i className="fa-solid fa-truck"></i>
              {topbarPromo}
            </span>
          </div>
          <div className="topbar-right">
            <select className="topbar-select">
              <option>MXN — Peso Mexicano</option>
              <option>USD — Dólar</option>
              <option>EUR — Euro</option>
            </select>
            <select className="topbar-select">
              <option>Español</option>
              <option>English</option>
            </select>
            <span className="topbar-divider">|</span>
            {isLoggedIn ? (
              <Link to="/profile" className="topbar-link">
                <i className="fa-regular fa-user"></i> Mi cuenta
              </Link>
            ) : (
              <>
                <Link to="/login"    className="topbar-link">Iniciar sesión</Link>
                <span className="topbar-divider">|</span>
                <Link to="/register" className="topbar-link">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== MAIN HEADER ===== */}
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">

          {/* Logo */}
          <Link to="/" className="header-logo">
            <div className="logo-mark">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <rect width="34" height="34" rx="6" fill="#ff3d3d"/>
                <path d="M9 11h16M9 17h11M9 23h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="logo-copy">
              <span className="logo-text">{brandName}</span>
              <span className="logo-tagline">{brandTagline}</span>
            </div>
          </Link>

          {/* Search — desktop */}
          <form className="header-search" onSubmit={handleSearch}>
            <select className="search-category">
              <option value="">Todas las categorías</option>
              <option value="smartphones">Smartphones</option>
              <option value="laptops">Laptops</option>
              <option value="tablets">Tablets</option>
              <option value="audio">Audio</option>
              <option value="wearables">Wearables</option>
              <option value="camaras">Cámaras</option>
              <option value="accesorios">Accesorios</option>
            </select>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="Buscar">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>

          {/* Actions */}
          <div className="header-actions">
            {/* Search — mobile */}
            <button
              className="action-btn mobile-search-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Buscar"
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="action-btn" aria-label="Lista de deseos">
              <i className="fa-regular fa-heart"></i>
            </Link>

            {/* Account */}
            <Link to={isLoggedIn ? '/profile' : '/login'} className="action-btn" aria-label="Mi cuenta">
              <i className="fa-regular fa-user"></i>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="action-btn" aria-label="Carrito">
              <i className="fa-solid fa-cart-shopping"></i>
              {cartCount > 0 && <span className="action-badge cart-badge">{cartCount}</span>}
            </Link>

            {/* Hamburger */}
            <button
              className={`hamburger ${mobileOpen ? 'open' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menú"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="mobile-search-bar">
            <form onSubmit={handleSearch}>
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ===== NAVBAR ===== */}
      <nav className={`site-navbar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="navbar-container">
          <ul className="nav-list">
            {navLinks.map(link => (
              <li key={link.to} className="nav-item">
                <Link
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`nav-link ${isActive(link.to, link.exact) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar-extra">
            <Link to="/compare" className="navbar-extra-link" onClick={() => setMobileOpen(false)}>
              <i className="fa-solid fa-code-compare"></i>
              Comparar
            </Link>
            <Link to="/admin" className="navbar-extra-link admin-link" onClick={() => setMobileOpen(false)}>
              <i className="fa-solid fa-gauge"></i>
              Admin
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;