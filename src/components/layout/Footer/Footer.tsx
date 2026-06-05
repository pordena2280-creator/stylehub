import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCmsSection } from '../../../hooks/useCmsSection';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { section: aboutCms } = useCmsSection('footer_about');
  const { section: contactCms } = useCmsSection('footer_contact');
  const { section: newsletterCms } = useCmsSection('footer_newsletter');
  const { section: paymentCms } = useCmsSection('footer_payment_methods');

  const footerDescription = aboutCms?.description ||
    'Tu tienda de tecnología de confianza. Los mejores productos electrónicos con garantía y envío rápido.';
  const footerContactPhone = contactCms?.title || '+1 (800) 123-4567';
  const footerContactEmail = contactCms?.subtitle || 'soporte@tienda.com';
  const newsletterTitle = newsletterCms?.title || 'Newsletter';
  const newsletterDescription = newsletterCms?.description ||
    'Suscríbete y recibe ofertas exclusivas, novedades y descuentos especiales.';
  const paymentDescription = paymentCms?.description || 'Aceptamos VISA, Mastercard, PayPal y más.';

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="site-footer">
      {/* Benefits Bar */}
      <div className="footer-benefits">
        <div className="footer-container">
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fa-solid fa-truck fa-lg"></i>
              </div>
              <div>
                <h4>Envío Gratis</h4>
                <p>En pedidos mayores a $100</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fa-solid fa-arrow-rotate-left fa-lg"></i>
              </div>
              <div>
                <h4>Devolución Gratis</h4>
                <p>30 días de garantía</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fa-solid fa-shield-halved fa-lg"></i>
              </div>
              <div>
                <h4>Pago Seguro</h4>
                <p>100% protegido y encriptado</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fa-solid fa-headset fa-lg"></i>
              </div>
              <div>
                <h4>Soporte 24/7</h4>
                <p>Siempre disponibles para ti</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-grid">

            {/* Brand Column */}
            <div className="footer-col footer-brand">
              <Link to="/" className="footer-logo">
                <div className="footer-logo-mark">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="8" fill="#0ea5e9"/>
                    <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="footer-logo-text">TechStore</span>
              </Link>
              <p className="footer-desc">
                Tu tienda de tecnología de confianza. Los mejores productos electrónicos con garantía y envío rápido.
              </p>
              <ul className="footer-contact-list">
                <li>
                  <i className="fa-solid fa-location-dot"></i>
                  <span>Av. Tecnología 123, Ciudad de México</span>
                </li>
                <li>
                  <i className="fa-solid fa-phone"></i>
                  <a href="tel:+18001234567">+1 (800) 123-4567</a>
                </li>
                <li>
                  <i className="fa-regular fa-envelope"></i>
                  <a href="mailto:soporte@tienda.com">soporte@tienda.com</a>
                </li>
              </ul>
            </div>

            {/* Info Column */}
            <div className="footer-col">
              <h3 className="footer-col-title">Información</h3>
              <ul className="footer-links">
                <li><Link to="/about">Acerca de Nosotros</Link></li>
                <li><Link to="/contact">Contacto</Link></li>
                <li><Link to="/faq">Preguntas Frecuentes</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><a href="#">Términos y Condiciones</a></li>
                <li><a href="#">Política de Privacidad</a></li>
              </ul>
            </div>

            {/* Account Column */}
            <div className="footer-col">
              <h3 className="footer-col-title">Mi Cuenta</h3>
              <ul className="footer-links">
                <li><Link to="/profile">Mi Perfil</Link></li>
                <li><Link to="/orders">Mis Pedidos</Link></li>
                <li><Link to="/wishlist">Lista de Deseos</Link></li>
                <li><Link to="/cart">Carrito</Link></li>
                <li><Link to="/compare">Comparar Productos</Link></li>
                <li><Link to="/login">Iniciar Sesión</Link></li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="footer-col">
              <h3 className="footer-col-title">Newsletter</h3>
              <p className="footer-newsletter-desc">
                Suscríbete y recibe ofertas exclusivas, novedades y descuentos especiales.
              </p>
              {subscribed ? (
                <div className="newsletter-success">
                  <i className="fa-solid fa-circle-check"></i>
                  ¡Gracias por suscribirte!
                </div>
              ) : (
                <form className="newsletter-form" onSubmit={handleNewsletter}>
                  <input
                    type="email"
                    placeholder="Tu correo electrónico"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit">
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </form>
              )}

              {/* Social Links */}
              <div className="footer-social">
                <a href="#" className="social-link facebook" aria-label="Facebook">
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
                <a href="#" className="social-link twitter" aria-label="Twitter / X">
                  <i className="fa-brands fa-x-twitter"></i>
                </a>
                <a href="#" className="social-link instagram" aria-label="Instagram">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="#" className="social-link youtube" aria-label="YouTube">
                  <i className="fa-brands fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-inner">
            <p className="footer-copyright">
              © {new Date().getFullYear()} TechStore. Todos los derechos reservados.
            </p>
            <div className="footer-payment-methods">
              <div className="payment-icons">
                <img src="/images/payment/visa.svg" alt="VISA" className="payment-icon-img" />
                <img src="/images/payment/master.svg" alt="Mastercard" className="payment-icon-img" />
                <img src="/images/payment/paypal.svg" alt="PayPal" className="payment-icon-img" />
                <img src="/images/payment/discover.svg" alt="AMEX" className="payment-icon-img" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
