import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCmsSection } from '../../hooks/useCmsSection';
import { useBanners } from '../../hooks/useBanners';
import { useCategories } from '../../hooks/useCategories';
import { useFeaturedProducts } from '../../hooks/useProducts';
import { useCart } from '../../contexts/CartContext';
import { blogService } from '../../services/blogService';
import type { BlogPost, Product } from '../../types';
import { getImageUrlFromPath, getProductImageUrl } from '../../utils/imageUtils';
import Seo from '../../components/seo/Seo';
import './Home.css';

const Home = () => {
  const { section: heroCms }        = useCmsSection('home_hero');
  const { section: newsletterCms }  = useCmsSection('home_newsletter');
  const { banners: heroBanners }    = useBanners('hero');
  const { categories }              = useCategories(true);
  // 8 productos destacados para "Los Más Vendidos"
  // Los primeros 4 también se usan en la sección Flash Deals
  const { products: featuredProducts, loading: featuredLoading } = useFeaturedProducts(8);
  const { addToCart } = useCart();

  // Contador regresivo para Flash Deals (1 día = 86400 s)
  const [flashCount, setFlashCount] = useState<number>(86400);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const id = setInterval(() => setFlashCount(prev => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadRecentPosts = async () => {
      try {
        const data = await blogService.getRecentPosts(3);
        if (!cancelled) setRecentPosts(data);
      } catch {
        if (!cancelled) setRecentPosts([]);
      }
    };
    loadRecentPosts();
    return () => { cancelled = true; };
  }, []);

  const days  = Math.floor(flashCount / 86400);
  const hours = Math.floor((flashCount % 86400) / 3600);
  const mins  = Math.floor((flashCount % 3600) / 60);
  const secs  = flashCount % 60;

  const heroImage =
    heroCms?.image_url ||
    heroBanners[0]?.image_url ||
    '/images/banner/banner-3.jpg';

  // Los primeros 4 productos destacados se usan como Flash Deals
  const flashDeals = featuredProducts.slice(0, 4);

  return (
    <>
      <Seo
        title={heroCms?.title ? `${heroCms.title} | StyleHub` : 'StyleHub — E-Commerce Profesional'}
        description={heroCms?.description || 'Descubre los mejores productos con envío gratis y garantía extendida.'}
        imageUrl={heroImage}
      />

      <div className="home-page">

        {/* ── 1. HERO ─────────────────────────────────────────────── */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-inner">
              <div className="hero-content">
                <span className="hero-badge">{heroCms?.subtitle || '¡NUEVA COLECCIÓN!'}</span>
                <h1 className="hero-title">
                  {heroCms?.title || <>Descubre <span>Nuestra</span> Tienda</>}
                </h1>
                <p className="hero-desc">
                  {heroCms?.description || 'Descubre los mejores productos con envío gratis y garantía extendida.'}
                </p>
                <div className="hero-actions">
                  <Link to={heroCms?.button_url || '/products'} className="hero-btn-primary">
                    {heroCms?.button_text || 'Comprar Ahora'} <i className="icon icon-cart" />
                  </Link>
                  <Link to="/products" className="hero-btn-outline">
                    Ver Catálogo <i className="icon icon-arrow-right" />
                  </Link>
                </div>
                <div className="hero-stats">
                  <div><span className="hero-stat-num">10K+</span><span className="hero-stat-label">Productos</span></div>
                  <div><span className="hero-stat-num">2 000+</span><span className="hero-stat-label">Marcas</span></div>
                  <div><span className="hero-stat-num">&gt;100K</span><span className="hero-stat-label">Clientes felices</span></div>
                </div>
              </div>
              <div className="hero-image-wrap">
                <img
                  src={heroImage}
                  alt="Hero Tienda"
                  fetchPriority="high"
                  loading="eager"
                />
                <span className="hero-badge-float">
                  <i className="fa-solid fa-fire"></i>
                  <div><strong>Oferta limitada</strong><span>Hasta −60% hoy</span></div>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. BENEFITS BAR ─────────────────────────────────────── */}
        <section className="features-bar">
          <div className="container">
            <div className="features-bar-grid">
              <div className="feature-bar-item">
                <div className="feature-bar-icon"><i className="fa-solid fa-truck"></i></div>
                <div className="feature-bar-text"><strong>Envíos en 24h</strong><span>En pedidos superiores a $50</span></div>
              </div>
              <div className="feature-bar-item">
                <div className="feature-bar-icon"><i className="fa-solid fa-arrow-rotate-left"></i></div>
                <div className="feature-bar-text"><strong>Devoluciones 30 días</strong><span>Sin preguntas · sin complicaciones</span></div>
              </div>
              <div className="feature-bar-item">
                <div className="feature-bar-icon"><i className="fa-solid fa-shield-halved"></i></div>
                <div className="feature-bar-text"><strong>Garantía 2 años</strong><span>Cobertura completa en todos los productos</span></div>
              </div>
              <div className="feature-bar-item">
                <div className="feature-bar-icon"><i className="fa-solid fa-circle-check"></i></div>
                <div className="feature-bar-text"><strong>Pago seguro 100%</strong><span>Protegemos cada transacción</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. CATEGORÍAS POPULARES ─────────────────────────────── */}
        <section className="categories-section">
          <div className="container">
            <div className="section-header-row">
              <h2>Categorías Populares</h2>
              <p className="hero-desc">Explora nuestras categorías más vendidas</p>
            </div>
            <div className="categories-grid">
              {categories.slice(0, 6).map(cat => (
                <Link to={`/products?category=${cat.slug}`} key={cat.id} className="category-card">
                  {cat.image_url ? (
                    <img src={getImageUrlFromPath(cat.image_url || '')} alt={cat.name} className="category-card-img"
                      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    <span className="category-card-icon"><i className={cat.icon || 'fa-solid fa-tag'} /></span>
                  )}
                  <span className="category-card-name">{cat.name}</span>
                  <span className="category-card-count">{cat.description?.slice(0, 24) || 'Ver productos'}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. LOS MÁS VENDIDOS ─────────────────────────────────── */}
        <section className="products-section">
          <div className="container">
            <div className="section-header-row">
              <div className="tf-section-heading">
                <h2 className="tf-heading-title">Los Más Vendidos</h2>
                <p className="tf-heading-desc">Los productos más populares de la temporada</p>
              </div>
              <Link to="/products" className="view-all-link">
                Ver todo <i className="fa-solid fa-arrow-up-right-from-square"></i>
              </Link>
            </div>
            <div className="products-grid-4">
              {featuredLoading && <p style={{ gridColumn: '1/-1' }}>Cargando productos…</p>}
              {!featuredLoading && featuredProducts.length === 0 && (
                <p style={{ gridColumn: '1/-1' }}>No hay productos destacados aún.</p>
              )}
              {featuredProducts.map((product: Product) => {
                const img = getProductImageUrl(product);
                const discount = product.old_price && product.old_price > product.price
                  ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;
                const rating = product.rating || 0;
                return (
                  <div key={product.id} className="product-card-home">
                    {discount > 0 && <div className="product-card-badge sale">-{discount}%</div>}
                    <div className="product-card-img">
                      <Link to={`/product/${product.id}`}>
                        <img src={img} alt={product.name}
                          onError={e => (e.currentTarget.src = '/images/products/placeholder.jpg')} />
                      </Link>
                    </div>
                    <div className="product-card-body">
                      <p className="product-card-cat">{product.category?.name || 'Producto'}</p>
                      <Link to={`/product/${product.id}`} className="product-card-name">{product.name}</Link>
                      <div className="product-card-rating">
                        <span className="product-card-stars">
                          {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
                        </span>
                        <span className="product-card-reviews">({product.reviews_count || 0} reseñas)</span>
                      </div>
                      <div className="product-card-price">
                        {product.old_price && product.old_price > product.price ? (
                          <><span className="price-old">${product.old_price.toFixed(2)}</span>
                          <span className="price-sale">${product.price.toFixed(2)}</span></>
                        ) : (
                          <span className="price-current">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="product-card-btn">
                      <button type="button" onClick={() => addToCart(product, 1)}>
                        Agregar al Carrito <i className="fa-solid fa-cart-shopping" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 5. ARTÍCULOS RECIENTES / CMS ─────────────────────── */}
        {recentPosts.length > 0 && (
          <section className="recent-posts-section">
            <div className="container">
              <div className="section-header-row">
                <div>
                  <h2 className="tf-heading-title">Artículos recientes</h2>
                  <p className="tf-heading-desc">Contenido dinámico del blog gestionado desde el panel Admin.</p>
                </div>
                <Link to="/blog" className="view-all-link">Ver blog <i className="fa-solid fa-arrow-right"></i></Link>
              </div>
              <div className="recent-posts-grid">
                {recentPosts.map(post => (
                  <article key={post.id} className="recent-post-card surface-card">
                    <Link to={`/blog/${post.id}`} className="recent-post-image-wrap">
                      <img src={post.image_url || '/images/blog/blog-1.jpg'} alt={post.title} />
                    </Link>
                    <div className="recent-post-content">
                      <p className="recent-post-category">{post.category || 'Blog'}</p>
                      <Link to={`/blog/${post.id}`} className="recent-post-title">{post.title}</Link>
                      <p className="recent-post-excerpt">{post.excerpt || 'Nuevo contenido publicado desde Admin → Blog.'}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 6. BANNER PROMOCIONAL ───────────────────────────────── */}
        <section className="promo-section">
          <div className="container">
            <div className="promo-grid">
              <div className="promo-card">
                <img src="/images/banner/banner-14.jpg" alt="Promo Audio" />
                <div className="promo-card-content">
                  <p className="promo-card-tag">Nueva Colección</p>
                  <h3 className="promo-card-title">Hasta −60% en<br />equipos de audio</h3>
                  <Link to="/products" className="promo-card-btn">Comprar ahora <i className="fa-solid fa-arrow-up-right-from-square"></i></Link>
                </div>
              </div>
              <div className="promo-card">
                <img src="/images/banner/banner-16.jpg" alt="Promo Smartwatch" />
                <div className="promo-card-content">
                  <p className="promo-card-tag">Oferta Limitada</p>
                  <h3 className="promo-card-title">Smartwatch con<br />40% de descuento</h3>
                  <Link to="/products" className="promo-card-btn">Ver oferta <i className="fa-solid fa-eye"></i></Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. FLASH DEALS — conectados a productos reales ─────── */}
        {flashDeals.length > 0 && (
          <section className="flash-deals-section">
            <div className="container">
              <div className="tf-section-heading">
                <div>
                  <h2 className="tf-heading-title">
                    <i className="fa-solid fa-fire" style={{ color: '#ff3d3d' }}></i> Ofertas Flash
                  </h2>
                  <p className="tf-heading-desc">Precios exclusivos por tiempo limitado</p>
                </div>
                <Link to="/products" className="view-all-link">
                  Ver todo <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </Link>
              </div>
              <div className="flash-deals-grid">
                {/* Timer */}
                <div className="flash-timer-box">
                  <div className="flash-timer-label">Termina en:</div>
                  <div className="flash-timer-row">
                    <div className="flash-timer-unit"><strong>{String(days).padStart(2,'0')}</strong><span>Días</span></div>
                    <div className="flash-timer-unit"><strong>{String(hours).padStart(2,'0')}</strong><span>Hrs</span></div>
                    <div className="flash-timer-unit"><strong>{String(mins).padStart(2,'0')}</strong><span>Min</span></div>
                    <div className="flash-timer-unit"><strong>{String(secs).padStart(2,'0')}</strong><span>Seg</span></div>
                  </div>
                </div>
                {/* Deal cards — datos reales de Supabase */}
                <div className="products-grid-4" style={{ gap: '16px' }}>
                  {flashDeals.map(product => {
                    const discount = product.old_price && product.old_price > product.price
                      ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;
                    return (
                      <div key={product.id} className="flash-deal-card">
                        <div className="flash-deal-img">
                          <img
                            src={getProductImageUrl(product)}
                            alt={product.name}
                            onError={e => (e.currentTarget.src = '/images/products/placeholder.jpg')}
                          />
                          {discount > 0 && <span className="flash-deal-badge">−{discount}%</span>}
                        </div>
                        <div className="flash-deal-body">
                          <p className="flash-deal-name">{product.name}</p>
                          <div className="flash-deal-meta">
                            <span className="flash-deal-price">${product.price.toFixed(2)}</span>
                            <button className="flash-deal-btn" onClick={() => addToCart(product, 1)}>
                              Comprar <i className="fa-solid fa-cart-shopping"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 8. MARCAS ───────────────────────────────────────────── */}
        <section className="brands-section">
          <div className="container">
            <div className="section-header-row">
              <h2>Nuestras Marcas</h2>
              <p className="hero-desc">Trabajamos con las marcas líderes del mercado</p>
            </div>
            <div className="brands-grid">
              {[
                { name: 'Apple',    fa: 'fa-brands', icon: 'fa-apple' },
                { name: 'Samsung',  fa: 'fa-solid',  icon: 'fa-mobile-screen' },
                { name: 'Sony',     fa: 'fa-solid',  icon: 'fa-headphones' },
                { name: 'LG',       fa: 'fa-solid',  icon: 'fa-tv' },
                { name: 'Bose',     fa: 'fa-solid',  icon: 'fa-music' },
                { name: 'Dell',     fa: 'fa-solid',  icon: 'fa-laptop' },
                { name: 'HP',       fa: 'fa-solid',  icon: 'fa-laptop' },
                { name: 'Canon',    fa: 'fa-solid',  icon: 'fa-camera' },
                { name: 'Nintendo', fa: 'fa-solid',  icon: 'fa-gamepad' },
                { name: 'Logitech', fa: 'fa-solid',  icon: 'fa-mouse' },
                { name: 'JBL',      fa: 'fa-solid',  icon: 'fa-music' },
                { name: 'Xiaomi',   fa: 'fa-solid',  icon: 'fa-mobile-screen' },
              ].map((brand, i) => (
                <Link to="/products" key={i} className="brand-card">
                  <span className="brand-card-logo"><i className={`${brand.fa} ${brand.icon}`}></i></span>
                  <span className="brand-card-name">{brand.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. NEWSLETTER ───────────────────────────────────────── */}
        <section className="newsletter-section">
          <div className="container">
            <div className="newsletter-inner">
              <div className="newsletter-text">
                <h2>{newsletterCms?.title || 'Descuentos exclusivos'}</h2>
                <p>{newsletterCms?.description || 'Regístrate y recibe descuentos exclusivos y promociones personalizadas.'}</p>
              </div>
              <div className="newsletter-form-wrap">
                <form onSubmit={e => e.preventDefault()}>
                  <input type="email" placeholder="Ingresa tu email" required />
                  <button type="submit">Suscribirse <i className="fa-solid fa-arrow-right"></i></button>
                </form>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default Home;
