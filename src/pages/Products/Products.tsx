import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useCmsSection } from '../../hooks/useCmsSection';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import type { Product } from '../../types';
import { getProductImageUrl } from '../../utils/imageUtils';
import Seo from '../../components/seo/Seo';
import './Products.css';

const Products = () => {
  const { section: cms } = useCmsSection('products_intro');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Leer filtros desde la URL
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch   = searchParams.get('search')   || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange]             = useState({ min: 0, max: 10000 });
  const [appliedPrice, setAppliedPrice]         = useState({ min: 0, max: 10000 });
  const [searchInput, setSearchInput]           = useState(initialSearch);
  const [viewMode, setViewMode]                 = useState('grid'); // grid or list

  // Hooks de datos
  const { categories, loading: catLoading } = useCategories(true);
  const {
    products,
    total,
    page,
    totalPages,
    loading,
    error,
    filters,
    updateFilters,
    changePage,
  } = useProducts({
    category: initialCategory !== 'all' ? initialCategory : undefined,
    search:   initialSearch || undefined,
    sortBy:   'newest',
    page:     1,
    limit:    12,
  });

  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Sincronizar filtro de categoría con la URL
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    setSelectedCategory(cat);
    updateFilters({ category: cat !== 'all' ? cat : undefined, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    const params = new URLSearchParams(searchParams);
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    navigate(`/products?${params.toString()}`);
  };

  const handleApplyPrice = () => {
    setAppliedPrice(priceRange);
    updateFilters({ minPrice: priceRange.min, maxPrice: priceRange.max, page: 1 });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined, page: 1 });
  };

  const handleSort = (sortBy: string) => {
    updateFilters({ sortBy: sortBy as typeof filters.sortBy, page: 1 });
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const handleToggleWishlist = (product: Product) => {
    toggleWishlist(product);
  };



  const calculateDiscountedPrice = (price: number, oldPrice?: number | null) => {
    if (!oldPrice || oldPrice <= price) return null;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  // Categorías para el sidebar (con "Todas")
  const allCategories = [
    { id: 0, slug: 'all', name: 'Todas las Categorías', count: total },
    ...categories.map(c => ({ id: c.id, slug: c.slug, name: c.name, count: 0 })),
  ];

  return (
    <div className="products-page">
      <Seo
        title={selectedCategory !== 'all'
          ? `${categories.find(c => c.slug === selectedCategory)?.name ?? selectedCategory} — Productos`
          : 'Todos los Productos'}
        description={`Explora nuestra colección de productos${selectedCategory !== 'all' ? ` en la categoría ${selectedCategory}` : ''}. Filtros por precio, categoría y calificación.`}
        canonicalUrl={`/products${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`}
      />
      <div className="container">
        {(cms?.title || cms?.description) && (
          <div className="products-page-intro" style={{ marginBottom: 24, paddingTop: 16 }}>
            {cms?.subtitle && <span style={{ color: '#004ec3', fontWeight: 600, fontSize: 13 }}>{cms.subtitle}</span>}
            {cms?.title && <h1 style={{ margin: '8px 0', fontSize: 28 }}>{cms.title}</h1>}
            {cms?.description && <p style={{ color: '#666', margin: 0 }}>{cms.description}</p>}
          </div>
        )}
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <span>Productos</span>
          {selectedCategory !== 'all' && (
            <>
              <span>/</span>
              <span>{categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}</span>
            </>
          )}
        </div>

        <div className="products-row">
          {/* ===== SIDEBAR ===== */}
          <div className="products-sidebar">

              {/* Búsqueda */}
              <div className="filter-section">
                <h3 className="filter-title">Buscar</h3>
                <form onSubmit={handleSearch} className="search-filter">
                  <input
                    type="text"
                    placeholder="Buscar productos…"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                  />
                  <button type="submit" className="btn-search-filter">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </form>
              </div>

              {/* Categorías */}
              <div className="filter-section">
                <h3 className="filter-title">Categorías</h3>
                {catLoading ? (
                  <p className="loading-text">Cargando…</p>
                ) : (
                  <ul className="category-list">
                    {allCategories.map(cat => (
                      <li key={cat.slug}>
                        <label className="category-item">
                          <input
                            type="radio"
                            name="category"
                            value={cat.slug}
                            checked={selectedCategory === cat.slug}
                            onChange={() => handleCategoryChange(cat.slug)}
                          />
                          <span>{cat.name}</span>
                          {cat.slug === 'all' && (
                            <span className="count">({total})</span>
                          )}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Rango de Precio */}
              <div className="filter-section">
                <h3 className="filter-title">Rango de Precio</h3>
                <div className="price-range">
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={e => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={e => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    />
                  </div>
                  <button className="btn-apply-filter" onClick={handleApplyPrice}>Aplicar</button>
                  {(appliedPrice.min > 0 || appliedPrice.max < 10000) && (
                    <button
                      className="btn-clear-filter"
                      onClick={() => {
                        setPriceRange({ min: 0, max: 10000 });
                        setAppliedPrice({ min: 0, max: 10000 });
                        updateFilters({ minPrice: undefined, maxPrice: undefined });
                      }}
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              {/* Calificación */}
              <div className="filter-section">
                <h3 className="filter-title">Calificación</h3>
                <ul className="rating-list">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <li key={rating}>
                      <label className="rating-item">
                        <input
                          type="radio"
                          name="rating"
                          onChange={() => updateFilters({ rating, page: 1 })}
                          checked={filters.rating === rating}
                        />
                        <span className="stars">
                          {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                        </span>
                        <span>y más</span>
                      </label>
                    </li>
                  ))}
                  {filters.rating && (
                    <li>
                      <button className="btn-clear-filter" onClick={() => updateFilters({ rating: undefined })}>
                        Limpiar
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              {/* Solo en stock */}
              <div className="filter-section">
                <label className="stock-filter">
                  <input
                    type="checkbox"
                    checked={!!filters.inStock}
                    onChange={e => updateFilters({ inStock: e.target.checked || undefined })}
                  />
                  <span>Solo productos en stock</span>
                </label>
              </div>
          </div>

          {/* ===== GRID DE PRODUCTOS ===== */}
          <div className="products-col">
            {/* Toolbar */}
            <div className="products-toolbar">
                <div className="toolbar-left">
                    {loading ? (
                        <p className="results-count">Cargando productos…</p>
                    ) : (
                        <p className="results-count">
                            Mostrando <strong>{products.length}</strong> de <strong>{total}</strong> productos
                        </p>
                    )}
                </div>
                <div className="toolbar-right">
                    <div className="view-toggle">
                        <label>Ver como:</label>
                        <div className="view-options">
                            <button
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Vista de cuadrícula"
                            >
                                <i className="fa-solid fa-th-large"></i>
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title="Vista de lista"
                            >
                                <i className="fa-solid fa-bars"></i>
                            </button>
                        </div>
                    </div>
                    <div className="sort-wrapper">
                        <label>Ordenar por:</label>
                        <select
                            value={filters.sortBy || 'newest'}
                            onChange={e => handleSort(e.target.value)}
                            className="sort-select"
                        >
                            <option value="newest">Más recientes</option>
                            <option value="price_asc">Precio: Menor a Mayor</option>
                            <option value="price_desc">Precio: Mayor a Menor</option>
                            <option value="rating">Mejor calificados</option>
                            <option value="popular">Más populares</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
              <div className="products-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <p>{error}</p>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="products-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card-product skeleton">
                    <div className="skeleton-img"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text short"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Sin resultados */}
            {!loading && !error && products.length === 0 && (
              <div className="no-products">
                <i className="fa-solid fa-box-open"></i>
                <h3>No se encontraron productos</h3>
                <p>Intenta con otros filtros o categorías.</p>
                <button
                  className="btn-reset-filters"
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange({ min: 0, max: 10000 });
                    setAppliedPrice({ min: 0, max: 10000 });
                    setSearchInput('');
                    navigate('/products');
                  }}
                >
                  Limpiar todos los filtros
                </button>
              </div>
            )}

            {/* Grid */}
            {!loading && products.length > 0 && (
              <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {products.map(product => {
                  const discountPct = calculateDiscountedPrice(product.price, product.old_price);
                  const inCart      = isInCart(product.id);
                  const inWishlist  = isInWishlist(product.id);

                  return (
                    <div key={product.id} className="card-product">
                      {discountPct && (
                        <div className="product-badge">-{discountPct}%</div>
                      )}
                      {product.stock === 0 && (
                        <div className="product-badge out-of-stock">Agotado</div>
                      )}

                      <div className="card-product-wrapper">
                         <Link to={`/product/${product.id}`} className="product-img">
                           <img
                             src={getProductImageUrl(product)}
                             alt={product.name}
                             className="img-product"
                             loading="lazy"
                             onError={e => {
                               (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg';
                             }}
                           />
                        </Link>
                        <ul className="list-product-btn top-0 end-0">
                          <li>
                            <button
                              className={`btn-icon-action hover-tooltip tooltip-left add-to-cart ${inCart ? 'active' : ''}`}
                              title={inCart ? 'En el carrito' : 'Agregar al Carrito'}
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                            >
                              <i className="fa-solid fa-cart-shopping"></i>
                              <span className="tooltip">{inCart ? 'En el carrito' : 'Add to Cart'}</span>
                            </button>
                          </li>
                          <li className="wishlist">
                            <button
                              className={`btn-icon-action hover-tooltip tooltip-left ${inWishlist ? 'active' : ''}`}
                              title={inWishlist ? 'Quitar de Wishlist' : 'Agregar a Wishlist'}
                              onClick={() => handleToggleWishlist(product)}
                            >
                              <i className={`fa-${inWishlist ? 'solid' : 'regular'} fa-heart`}></i>
                              <span className="tooltip">{inWishlist ? 'Remove Wishlist' : 'Add to Wishlist'}</span>
                            </button>
                          </li>
                          <li>
                            <Link
                              to={`/product/${product.id}`}
                              className="btn-icon-action hover-tooltip tooltip-left quickview"
                              title="Ver detalle"
                            >
                              <i className="fa-solid fa-eye"></i>
                              <span className="tooltip">Quick View</span>
                            </Link>
                          </li>
                        </ul>
                      </div>

                      <div className="card-product-info">
                        <div className="box-title">
                          <div>
                            {product.category && (
                              <p className="product-tag">{product.category.name}</p>
                            )}
                            <h4 className="name-product">
                              <Link to={`/product/${product.id}`}>{product.name}</Link>
                            </h4>
                          </div>
                          <div className="price-wrap">
                            {product.old_price && product.old_price > product.price ? (
                              <>
                                <span className="price-text old-price">${product.old_price.toFixed(2)}</span>
                                <span className="price-text text-primary">${product.price.toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="price-text">${product.price.toFixed(2)}</span>
                            )}
                          </div>
                        </div>

                        {product.rating !== undefined && (
                          <div className="star-review flex-wrap">
                            <ul className="list-star">
                              {Array.from({ length: 5 }, (_, i) => (
                                <li key={i}>
                                  <i className={
                                    i < Math.floor(product.rating!)
                                      ? 'fa-solid fa-star'
                                      : i < product.rating!
                                        ? 'fa-solid fa-star-half-stroke'
                                        : 'fa-regular fa-star'
                                  }></i>
                                </li>
                              ))}
                            </ul>
                            {product.reviews_count !== undefined && (
                              <span className="caption text-main-2">({product.reviews_count})</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="card-product-btn">
                        <button
                          className={`btn-add-cart tf-btn btn-line w-100 ${inCart ? 'in-cart' : ''}`}
                          disabled={product.stock === 0}
                          onClick={() => handleAddToCart(product)}
                        >
                          {product.stock === 0
                            ? 'Agotado'
                            : inCart
                              ? '✓ En el Carrito'
                              : 'Agregar al Carrito'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn-page"
                  disabled={page <= 1}
                  onClick={() => changePage(page - 1)}
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`btn-page ${p === page ? 'active' : ''}`}
                    onClick={() => changePage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="btn-page"
                  disabled={page >= totalPages}
                  onClick={() => changePage(page + 1)}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>  {/* /products-row */}
      </div>    {/* /container */}
    </div>      {/* /products-page */}
  );
};

export default Products;