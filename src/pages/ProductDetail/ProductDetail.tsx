import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import type { Product } from '../../types';
import { getProductImageUrl, getProductImagesUrls } from '../../utils/imageUtils';
import Seo from '../../components/seo/Seo';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || '0');
  const navigate = useNavigate();

  const [product, setProduct]             = useState<Product | null>(null);
  const [relatedProducts, setRelated]     = useState<Product[]>([]);
  const [quantity, setQuantity]           = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab]         = useState('description');
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [showLightbox, setShowLightbox]   = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { addToCart, isInCart }           = useCart();
  const { toggleWishlist, isInWishlist }  = useWishlist();

  // Cargar producto
  useEffect(() => {
    if (isNaN(productId) || productId === 0) {
      navigate('/products');
      return;
    }
    setLoading(true);
    setError(null);
    setSelectedImage(0);

    productService.getProductById(productId)
      .then(async (data) => {
        if (!data) { setError('Producto no encontrado'); return; }
        setProduct(data);
        if (data.category_id) {
          const rel = await productService.getRelatedProducts(data.id, data.category_id, 4);
          setRelated(rel);
        }
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Error al cargar producto'))
      .finally(() => setLoading(false));
  }, [productId, navigate]);

  // Teclado para lightbox
  const handleKey = useCallback((e: KeyboardEvent) => {
    const total = product?.images?.length || 1;
    if (e.key === 'Escape') { setShowLightbox(false); return; }
    if (e.key === 'ArrowRight') { setLightboxIndex(prev => (prev + 1) % total); return; }
    if (e.key === 'ArrowLeft')  { setLightboxIndex(prev => (prev - 1 + total) % total); }
  }, [product]);

  useEffect(() => {
    if (!showLightbox) return undefined;
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showLightbox, handleKey]);

  useEffect(() => {
    if (!showLightbox) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showLightbox]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="product-skeleton">
            <div className="skeleton-gallery"></div>
            <div className="skeleton-info">
              <div className="skeleton-line w-60"></div>
              <div className="skeleton-line w-40"></div>
              <div className="skeleton-line w-80"></div>
              <div className="skeleton-line w-30"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="error-message">
            <i className="fa-solid fa-circle-exclamation"></i>
            <p>{error || 'Producto no encontrado'}</p>
            <button onClick={() => navigate('/products')}>Volver a Productos</button>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images?.length
    ? getProductImagesUrls(product)
    : ['/images/products/placeholder.jpg'];

  const inCart  = isInCart(product.id);
  const inWish  = isInWishlist(product.id);
  const inStock = product.stock > 0;
  const discountPct = product.old_price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : null;

  return (
    <div className="product-detail-page">
      <Seo
        title={product.name}
        description={product.description || `${product.name} — disponible en StyleHub. ${product.stock > 0 ? 'En stock.' : 'Agotado.'}`}
        imageUrl={images[0]}
        canonicalUrl={`/product/${product.id}`}
        ogType="product"
        product={{
          price: product.price,
          currency: 'MXN',
          sku: product.sku,
          availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
          rating: product.rating,
          reviewCount: product.reviews_count,
          brand: product.category?.name,
        }}
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Productos', url: '/products' },
          ...(product.category ? [{ name: product.category.name, url: `/products?category=${product.category.slug}` }] : []),
          { name: product.name, url: `/product/${product.id}` },
        ]}
      />
      {/* Breadcrumb */}
      <section className="breadcrumb-section">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Inicio</Link><span>/</span>
            <Link to="/products">Productos</Link>
            {product.category && (
              <><span>/</span>
              <Link to={`/products?category=${product.category.slug}`}>{product.category.name}</Link></>
            )}
            <span>/</span><span>{product.name}</span>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="product-main">
        <div className="container">
          <div className="product-layout">

            {/* Galería */}
            <div className="product-gallery">
              <div className="main-image" onClick={() => { setShowLightbox(true); setLightboxIndex(selectedImage); }}>
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  width={600}
                  height={600}
                  onError={e => { (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg'; }}
                  style={{ cursor: 'pointer', objectFit: 'contain', width: '100%', aspectRatio: '1/1' }}
                />
                {discountPct && <div className="badge-discount">-{discountPct}%</div>}
                {!inStock   && <div className="badge-out-of-stock">Agotado</div>}
              </div>
              {images.length > 1 && (
                <div className="thumbnail-list">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      className={`thumbnail ${selectedImage === i ? 'active' : ''}`}
                      onClick={() => setSelectedImage(i)}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        width={80}
                        height={80}
                        onError={e => { (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg'; }}
                        style={{ objectFit: 'cover', width: 80, height: 80 }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="product-info">
              {product.category && (
                <Link to={`/products?category=${product.category.slug}`} className="product-category-link">
                  {product.category.name}
                </Link>
              )}
              <h1 className="product-title">{product.name}</h1>

              {product.rating !== undefined && (
                <div className="product-meta">
                  <div className="rating">
                    <div className="stars">
                      {Array.from({ length: 5 }, (_, i) => (
                        <i key={i} className={
                          i < Math.floor(product.rating!)
                            ? 'fa-solid fa-star'
                            : i < product.rating!
                              ? 'fa-solid fa-star-half-stroke'
                              : 'fa-regular fa-star'
                        } />
                      ))}
                    </div>
                    <span className="rating-text">{product.rating} ({product.reviews_count || 0} reseñas)</span>
                  </div>
                  <span className="sku">SKU: {product.sku}</span>
                </div>
              )}

              <div className="product-price">
                <span className="current-price">${product.price.toFixed(2)}</span>
                {product.old_price && product.old_price > product.price && (
                  <span className="old-price">${product.old_price.toFixed(2)}</span>
                )}
                {discountPct && <span className="discount-badge">Ahorras {discountPct}%</span>}
              </div>

              {product.description && <p className="product-description">{product.description}</p>}

              <div className="stock-info">
                {inStock ? (
                  <span className="in-stock"><i className="fa-solid fa-circle-check"></i> En Stock ({product.stock} disponibles)</span>
                ) : (
                  <span className="out-of-stock"><i className="fa-solid fa-circle-xmark"></i> Agotado</span>
                )}
              </div>

              <div className="product-actions">
                <div className="quantity-selector">
                  <button onClick={() => setQuantity(q => Math.max(q - 1, 1))} disabled={quantity <= 1}>−</button>
                  <input type="number" value={quantity} readOnly min={1} max={product.stock || 99} />
                  <button onClick={() => setQuantity(q => Math.min(q + 1, product.stock || 99))} disabled={quantity >= (product.stock || 99)}>+</button>
                </div>
                <button
                  className={`btn-add-to-cart ${inCart ? 'in-cart' : ''}`}
                  disabled={!inStock}
                  onClick={() => addToCart(product, quantity)}
                >
                  <i className="fa-solid fa-cart-shopping"></i>
                  {inCart ? 'En el Carrito' : 'Agregar al Carrito'}
                </button>
                <button
                  className={`btn-wishlist ${inWish ? 'active' : ''}`}
                  onClick={() => toggleWishlist(product)}
                  title={inWish ? 'Quitar de Wishlist' : 'Agregar a Wishlist'}
                >
                  <i className={`fa-${inWish ? 'solid' : 'regular'} fa-heart`}></i>
                </button>
              </div>

              <div className="product-benefits">
                <div className="benefit-item"><i className="fa-solid fa-truck"></i><div><strong>Envío Gratis</strong><span>En pedidos superiores a $100</span></div></div>
                <div className="benefit-item"><i className="fa-solid fa-rotate-left"></i><div><strong>Devolución Gratis</strong><span>30 días de garantía</span></div></div>
                <div className="benefit-item"><i className="fa-solid fa-shield-halved"></i><div><strong>Pago Seguro</strong><span>Procesado por Stripe</span></div></div>
              </div>

              <div className="product-share">
                <span>Compartir:</span>
                <div className="share-buttons">
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" className="share-btn facebook"><i className="fa-brands fa-facebook-f"></i></a>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.name)}`} target="_blank" rel="noreferrer" className="share-btn twitter"><i className="fa-brands fa-x-twitter"></i></a>
                  <a href={`https://wa.me/?text=${encodeURIComponent(product.name + ' ' + window.location.href)}`} target="_blank" rel="noreferrer" className="share-btn whatsapp"><i className="fa-brands fa-whatsapp"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {showLightbox && (
        <div className="lightbox-overlay" role="dialog" aria-modal="true" onClick={() => setShowLightbox(false)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setShowLightbox(false)} aria-label="Cerrar">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="lightbox-image-container">
              <img
                src={images[lightboxIndex]}
                alt={`${product.name} — imagen ${lightboxIndex + 1}`}
                loading="eager"
                onError={e => { (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg'; }}
              />
              {images.length > 1 && (
                <>
                  <button className="lightbox-nav left" aria-label="Imagen anterior"
                    onClick={() => setLightboxIndex(prev => (prev - 1 + images.length) % images.length)}>
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button className="lightbox-nav right" aria-label="Imagen siguiente"
                    onClick={() => setLightboxIndex(prev => (prev + 1) % images.length)}>
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </>
              )}
            </div>
            <p className="lightbox-counter">{lightboxIndex + 1} / {images.length}</p>
          </div>
        </div>
      )}

      {/* TABS */}
      <section className="product-details-tabs">
        <div className="container">
          <div className="tabs-header">
            {[
              { key: 'description',    label: 'Descripción' },
              { key: 'specifications', label: 'Especificaciones' },
              { key: 'reviews',        label: `Reseñas (${product.reviews_count || 0})` },
            ].map(tab => (
              <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="tabs-content">
            {activeTab === 'description' && (
              <div className="tab-panel"><h3>Descripción del Producto</h3><p>{product.description || 'Sin descripción disponible.'}</p></div>
            )}
            {activeTab === 'specifications' && (
              <div className="tab-panel"><h3>Especificaciones Técnicas</h3><p className="no-specs">No hay especificaciones técnicas disponibles.</p></div>
            )}
            {activeTab === 'reviews' && (
              <div className="tab-panel">
                {!product.reviews_count || product.reviews_count === 0 ? (
                  <div className="no-reviews"><i className="fa-regular fa-comment"></i><p>Aún no hay reseñas. Sé el primero en escribir una.</p></div>
                ) : (
                  <div className="reviews-summary">
                    <div className="rating-score">
                      <span className="score">{product.rating}</span>
                      <span className="total-reviews">Basado en {product.reviews_count} reseñas</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PRODUCTOS RELACIONADOS — usa getProductImageUrl para URLs correctas */}
      {relatedProducts.length > 0 && (
        <section className="related-products">
          <div className="container">
            <h2 className="section-title">Productos Relacionados</h2>
            <div className="products-grid">
              {relatedProducts.map(rel => (
                <div key={rel.id} className="card-product">
                  <Link to={`/product/${rel.id}`} className="product-img">
                    <img
                      src={getProductImageUrl(rel)}
                      alt={rel.name}
                      loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg'; }}
                    />
                  </Link>
                  <div className="card-product-info">
                    <h4 className="name-product"><Link to={`/product/${rel.id}`}>{rel.name}</Link></h4>
                    <div className="price-wrap">
                      {rel.old_price && rel.old_price > rel.price && (
                        <span className="price-text old-price">${rel.old_price.toFixed(2)}</span>
                      )}
                      <span className="price-text">${rel.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="card-product-btn">
                    <button
                      className="btn-add-cart tf-btn btn-line w-100"
                      disabled={rel.stock === 0}
                      onClick={() => addToCart(rel, 1)}
                    >
                      {rel.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
