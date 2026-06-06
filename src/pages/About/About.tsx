import { Link } from 'react-router-dom';
import { useCmsSection } from '../../hooks/useCmsSection';
import Seo from '../../components/seo/Seo';
import './About.css';

const team = [
  { name: 'Juan Pérez',    role: 'CEO & Fundador',              initial: 'J', bio: 'Visionario con 15 años de experiencia en tecnología y comercio electrónico.' },
  { name: 'María García',  role: 'Directora de Operaciones',    initial: 'M', bio: 'Experta en logística y gestión de cadena de suministro a nivel internacional.' },
  { name: 'Carlos López',  role: 'Gerente de Ventas',           initial: 'C', bio: 'Especialista en estrategias de ventas y desarrollo de mercados emergentes.' },
  { name: 'Ana Martínez',  role: 'Jefa de Atención al Cliente', initial: 'A', bio: 'Apasionada por crear experiencias de cliente excepcionales y memorables.' },
];

const values = [
  { icon: 'fa-solid fa-medal',        title: 'Calidad',      desc: 'Ofrecemos solo productos de las mejores marcas con garantía de calidad certificada.' },
  { icon: 'fa-solid fa-handshake',    title: 'Confianza',    desc: 'Construimos relaciones duraderas basadas en la transparencia y honestidad.' },
  { icon: 'fa-solid fa-lightbulb',    title: 'Innovación',   desc: 'Siempre buscamos las últimas tendencias y tecnologías para nuestros clientes.' },
  { icon: 'fa-solid fa-heart',        title: 'Compromiso',   desc: 'Nos comprometemos con la satisfacción total de cada uno de nuestros clientes.' },
];

const whyUs = [
  { icon: 'fa-solid fa-truck',          title: 'Envío Gratis',         desc: 'En todos los pedidos superiores a $100. Entrega rápida y segura.' },
  { icon: 'fa-solid fa-shield-halved', title: 'Garantía Extendida',   desc: 'Todos nuestros productos tienen garantía de fábrica de 1 a 3 años.' },
  { icon: 'fa-solid fa-headset',       title: 'Soporte 24/7',         desc: 'Estamos disponibles para ayudarte en cualquier momento del día.' },
  { icon: 'fa-solid fa-arrow-rotate-left', title: 'Devoluciones Fáciles', desc: '30 días para devoluciones sin preguntas ni complicaciones.' },
];

const About = () => {
  const { section: cms } = useCmsSection('about_hero');

  return (
    <div className="about-page">
      <Seo
        title="Acerca de Nosotros"
        description="Conoce a StyleHub — tu tienda de tecnología de confianza desde 2020. Misión, valores y equipo."
        canonicalUrl="/about"
      />

      {/* Breadcrumb */}
      <section className="breadcrumb-section">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Inicio</Link>
            <i className="fa-solid fa-chevron-right breadcrumb-sep"></i>
            <span>Acerca de Nosotros</span>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-inner">
            <div className="about-hero-content">
              <span className="about-hero-tag">
                <i className="fa-solid fa-store"></i> {cms?.subtitle || 'Desde 2020'}
              </span>
              <h1>{cms?.title || 'Tu tienda de tecnología de confianza'}</h1>
              <p>
                {cms?.description || 'Somos una empresa dedicada a ofrecer los mejores productos tecnológicos con la mejor calidad y servicio al cliente.'}
              </p>
              <div className="about-hero-actions">
                <Link to={cms?.button_url || '/products'} className="about-btn-primary">
                  <i className="fa-solid fa-bag-shopping"></i> {cms?.button_text || 'Ver Productos'}
                </Link>
                <Link to="/contact" className="about-btn-outline">
                  <i className="fa-solid fa-envelope"></i> Contáctanos
                </Link>
              </div>
            </div>
            <div className="about-hero-img">
              <img src={cms?.image_url || '/images/banner/banner-3.jpg'} alt="Acerca de StyleHub" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Clientes Satisfechos</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5K+</span>
              <span className="stat-label">Productos Vendidos</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Marcas Asociadas</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">4.8</span>
              <span className="stat-label">Calificación Promedio</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-card-icon">
                <i className="fa-solid fa-bullseye"></i>
              </div>
              <h2>Nuestra Misión</h2>
              <p>
                Proporcionar productos tecnológicos de alta calidad a precios accesibles,
                garantizando la satisfacción del cliente a través de un servicio excepcional
                y una experiencia de compra sin complicaciones.
              </p>
            </div>
            <div className="mission-card">
              <div className="mission-card-icon">
                <i className="fa-solid fa-eye"></i>
              </div>
              <h2>Nuestra Visión</h2>
              <p>
                Ser la tienda de tecnología líder en el mercado, reconocida por nuestra
                innovación, calidad de productos y compromiso con la satisfacción del cliente,
                expandiendo nuestro alcance a nivel nacional e internacional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="values-section">
        <div className="container">
          <div className="section-title-center">
            <h2>Nuestros Valores</h2>
            <p>Los principios que guían nuestro trabajo diario</p>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-icon">
                  <i className={v.icon}></i>
                </div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="team-section">
        <div className="container">
          <div className="section-title-center">
            <h2>Nuestro Equipo</h2>
            <p>Conoce a las personas detrás de nuestra empresa</p>
          </div>
          <div className="team-grid">
            {team.map((member, i) => (
              <div key={i} className="team-card">
                <div className="team-avatar-placeholder">{member.initial}</div>
                <h4>{member.name}</h4>
                <p className="team-card-role">{member.role}</p>
                <p className="team-card-bio">{member.bio}</p>
                <div className="team-social">
                  <a href="#" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
                  <a href="#" aria-label="Twitter"><i className="fa-brands fa-x-twitter"></i></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="why-section">
        <div className="container">
          <div className="why-grid">
            <div className="why-image">
              <img src="/images/banner/banner-4.jpg" alt="Por qué elegirnos" />
            </div>
            <div>
              <div className="section-title-center" style={{ textAlign: 'left', marginBottom: 24 }}>
                <h2>¿Por Qué Elegirnos?</h2>
                <p>Razones para confiar en nosotros</p>
              </div>
              <div className="why-list">
                {whyUs.map((item, i) => (
                  <div key={i} className="why-item">
                    <div className="why-item-icon">
                      <i className={item.icon}></i>
                    </div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
