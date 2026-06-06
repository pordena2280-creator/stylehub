import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCmsSection } from '../../hooks/useCmsSection';
import Seo from '../../components/seo/Seo';
import './FAQ.css';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  { id: 1,  question: '¿Cuál es el tiempo de envío?',             answer: 'El tiempo de envío estándar es de 3-5 días hábiles. Para envíos express, el tiempo es de 1-2 días hábiles. Los pedidos realizados antes de las 2:00 PM se procesan el mismo día.',                                                                                                                                    category: 'shipping' },
  { id: 2,  question: '¿Ofrecen envío gratis?',                   answer: 'Sí, ofrecemos envío gratis en todos los pedidos superiores a $100. Para pedidos menores, el costo de envío es de $9.99.',                                                                                                                                                                                                  category: 'shipping' },
  { id: 3,  question: '¿Puedo rastrear mi pedido?',               answer: 'Sí, una vez que tu pedido sea enviado, recibirás un correo electrónico con el número de seguimiento. Puedes rastrear tu pedido en tiempo real desde tu cuenta o usando el enlace proporcionado.',                                                                                                                          category: 'shipping' },
  { id: 4,  question: '¿Realizan envíos internacionales?',        answer: 'Actualmente realizamos envíos a México, Estados Unidos, España, Colombia y Argentina. Los tiempos y costos varían según el destino. Consulta las tarifas en el proceso de checkout.',                                                                                                                                      category: 'shipping' },
  { id: 5,  question: '¿Cuál es la política de devoluciones?',    answer: 'Aceptamos devoluciones dentro de los 30 días posteriores a la compra. El producto debe estar en su estado original, sin usar y con el empaque original. Los gastos de envío de devolución corren por cuenta del cliente, excepto en casos de productos defectuosos.',                                                      category: 'returns'  },
  { id: 6,  question: '¿Cómo inicio una devolución?',             answer: 'Para iniciar una devolución, inicia sesión en tu cuenta, ve a "Mis Pedidos", selecciona el pedido y haz clic en "Solicitar Devolución". Nuestro equipo te contactará en 24 horas con las instrucciones.',                                                                                                                 category: 'returns'  },
  { id: 7,  question: '¿Cuándo recibiré mi reembolso?',           answer: 'Una vez que recibamos y procesemos tu devolución, el reembolso se procesará en 5-7 días hábiles. El tiempo que tarde en reflejarse en tu cuenta depende de tu banco o procesador de pagos.',                                                                                                                              category: 'returns'  },
  { id: 8,  question: '¿Qué métodos de pago aceptan?',            answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), PayPal, y transferencias bancarias. Todos los pagos son procesados de forma segura con encriptación SSL.',                                                                                                                                    category: 'payment'  },
  { id: 9,  question: '¿Es seguro comprar en su sitio?',          answer: 'Sí, utilizamos encriptación SSL de 256 bits para proteger toda la información de pago. Nunca almacenamos información completa de tarjetas de crédito en nuestros servidores. Cumplimos con el estándar PCI DSS.',                                                                                                          category: 'payment'  },
  { id: 10, question: '¿Puedo pagar en cuotas?',                  answer: 'Sí, ofrecemos planes de pago en cuotas para compras superiores a $200. Las opciones disponibles son 3, 6 o 12 cuotas sin interés con tarjetas participantes.',                                                                                                                                                            category: 'payment'  },
  { id: 11, question: '¿Los productos tienen garantía?',          answer: 'Sí, todos nuestros productos vienen con garantía del fabricante. La duración varía según el producto, generalmente de 1 a 3 años. Además, ofrecemos garantía extendida opcional.',                                                                                                                                         category: 'products' },
  { id: 12, question: '¿Los productos son nuevos?',               answer: 'Todos nuestros productos son completamente nuevos y vienen en su empaque original sellado. Si ofrecemos productos reacondicionados, están claramente marcados como tales con su precio diferenciado.',                                                                                                                      category: 'products' },
  { id: 13, question: '¿Tienen tienda física?',                   answer: 'Actualmente operamos solo en línea, lo que nos permite ofrecer mejores precios. Sin embargo, tenemos un centro de atención al cliente donde puedes recoger tus pedidos con cita previa.',                                                                                                                                  category: 'products' },
  { id: 14, question: '¿Cómo creo una cuenta?',                   answer: 'Haz clic en "Iniciar Sesión" en la parte superior de la página, luego selecciona "Crear Cuenta". Solo necesitas tu email y crear una contraseña. También puedes registrarte con Google.',                                                                                                                                 category: 'account'  },
  { id: 15, question: '¿Olvidé mi contraseña, qué hago?',         answer: 'En la página de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?". Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña en minutos.',                                                                                                                                                        category: 'account'  },
  { id: 16, question: '¿Puedo cambiar mi dirección de envío?',    answer: 'Sí, puedes actualizar tu dirección de envío desde tu perfil en cualquier momento. Si ya realizaste un pedido, contáctanos inmediatamente para actualizar la dirección antes del envío.',                                                                                                                                   category: 'account'  },
];

const categories = [
  { id: 'all',      name: 'Todas',         icon: 'fa-solid fa-list',          count: faqData.length },
  { id: 'shipping', name: 'Envíos',        icon: 'fa-solid fa-truck',       count: faqData.filter(f => f.category === 'shipping').length },
  { id: 'returns',  name: 'Devoluciones',  icon: 'fa-solid fa-arrow-rotate-left', count: faqData.filter(f => f.category === 'returns').length  },
  { id: 'payment',  name: 'Pagos',         icon: 'fa-solid fa-credit-card',   count: faqData.filter(f => f.category === 'payment').length  },
  { id: 'products', name: 'Productos',     icon: 'fa-solid fa-box',           count: faqData.filter(f => f.category === 'products').length },
  { id: 'account',  name: 'Mi Cuenta',     icon: 'fa-solid fa-user',          count: faqData.filter(f => f.category === 'account').length  },
];

const FAQ = () => {
  const { section: cms } = useCmsSection('faq_intro');
  const [activeId, setActiveId]             = useState<number | null>(null);
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const toggle = (id: number) => setActiveId(activeId === id ? null : id);

  const filtered = faqData.filter(faq => {
    const matchCat    = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="faq-page">
      <Seo
        title="Preguntas Frecuentes"
        description="Respuestas sobre envíos, devoluciones, pagos, productos y tu cuenta en StyleHub."
        canonicalUrl="/faq"
      />

      {/* ===== BREADCRUMB ===== */}
      <section className="breadcrumb-section">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Inicio</Link>
            <i className="fa-solid fa-chevron-right breadcrumb-sep"></i>
            <span>Preguntas Frecuentes</span>
          </div>
        </div>
      </section>

      {/* ===== HERO ===== */}
      <section className="faq-hero">
        <div className="container">
          <div className="faq-hero-inner">
            <div className="faq-hero-icon">
              <i className="fa-solid fa-circle-question"></i>
            </div>
            <h1>{cms?.title || 'Preguntas Frecuentes'}</h1>
            <p>{cms?.description || 'Encuentra respuestas rápidas a las dudas más comunes sobre nuestros productos y servicios'}</p>
            <form className="faq-search-form" onSubmit={e => e.preventDefault()}>
              <i className="fa-solid fa-magnifying-glass faq-search-icon"></i>
              <input
                type="text"
                placeholder="Buscar preguntas..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button type="button" className="faq-search-clear" onClick={() => setSearchTerm('')}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="faq-categories-section">
        <div className="container">
          <div className="faq-categories-grid">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`faq-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="faq-cat-icon">
                  <i className={cat.icon}></i>
                </span>
                <span className="faq-cat-name">{cat.name}</span>
                <span className="faq-cat-count">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ LIST ===== */}
      <section className="faq-content-section">
        <div className="container">
          <div className="faq-layout">

            {/* Sidebar info */}
            <aside className="faq-sidebar">
              <div className="faq-sidebar-card">
                <div className="faq-sidebar-icon">
                  <i className="fa-solid fa-headset"></i>
                </div>
                <h3>¿Necesitas más ayuda?</h3>
                <p>Nuestro equipo de soporte está disponible 24/7 para ayudarte.</p>
                <Link to="/contact" className="faq-sidebar-btn">
                  <i className="fa-solid fa-envelope"></i> Contáctanos
                </Link>
                <a href="tel:+18001234567" className="faq-sidebar-btn outline">
                  <i className="fa-solid fa-phone"></i> +1 (800) 123-4567
                </a>
              </div>

              <div className="faq-sidebar-card">
                <h4>Categorías</h4>
                <ul className="faq-sidebar-cats">
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <button
                        className={selectedCategory === cat.id ? 'active' : ''}
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        <i className={cat.icon}></i>
                        <span>{cat.name}</span>
                        <span className="cat-num">{cat.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Accordion */}
            <div className="faq-main">
              {searchTerm && (
                <p className="faq-results-info">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para "<strong>{searchTerm}</strong>"
                </p>
              )}

              {filtered.length > 0 ? (
                <div className="faq-accordion">
                  {filtered.map((faq, idx) => (
                    <div
                      key={faq.id}
                      className={`faq-item ${activeId === faq.id ? 'open' : ''}`}
                    >
                      <button
                        className="faq-question"
                        onClick={() => toggle(faq.id)}
                        aria-expanded={activeId === faq.id}
                      >
                        <span className="faq-num">{String(idx + 1).padStart(2, '0')}</span>
                        <span className="faq-q-text">{faq.question}</span>
                        <span className="faq-chevron">
                          <i className="fa-solid fa-chevron-down"></i>
                        </span>
                      </button>
                      <div className="faq-answer">
                        <div className="faq-answer-inner">
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="faq-empty">
                  <i className="fa-solid fa-circle-question fa-3x"></i>
                  <h3>No se encontraron resultados</h3>
                  <p>Intenta con otras palabras o selecciona una categoría diferente.</p>
                  <button className="faq-reset-btn" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
                    <i className="fa-solid fa-rotate-right"></i> Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA BOTTOM ===== */}
      <section className="faq-cta">
        <div className="container">
          <div className="faq-cta-inner">
            <div className="faq-cta-icon">
              <i className="fa-solid fa-comments"></i>
            </div>
            <div className="faq-cta-text">
              <h2>¿No encontraste lo que buscabas?</h2>
              <p>Nuestro equipo de soporte está listo para ayudarte en cualquier momento</p>
            </div>
            <div className="faq-cta-actions">
              <Link to="/contact" className="faq-cta-btn primary">
                <i className="fa-solid fa-paper-plane"></i> Enviar mensaje
              </Link>
              <a href="tel:+18001234567" className="faq-cta-btn outline">
                <i className="fa-solid fa-phone"></i> Llamar ahora
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default FAQ;
