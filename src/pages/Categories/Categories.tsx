import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../../services';
import { useCmsSection } from '../../hooks/useCmsSection';
import Seo from '../../components/seo/Seo';
import type { Category } from '../../types';
import { getImageUrlFromPath } from '../../utils/imageUtils';
import './Categories.css';

// Mapa de iconos de FontAwesome por slug (fallback visual)
const CATEGORY_COLORS: Record<string, string> = {
  ropa: '#FF7A59',
  calzado: '#4ECDC4',
  accesorios: '#DDA0DD',
  electronica: '#45B7D1',
  hogar: '#96CEB4',
  smartphones: '#FF6B6B',
  laptops: '#4ECDC4',
  auriculares: '#45B7D1',
  smartwatch: '#96CEB4',
  tablets: '#FFEAA7',
  gaming: '#98D8C8',
  fotografia: '#F7DC6F',
};

const Categories = () => {
  const { section: cms } = useCmsSection('categories_intro');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await categoryService.getCategories();
        if (!cancelled) setCategories(data);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar categorías');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="categories-page">
      <Seo
        title="Categorías"
        description="Explora todas las categorías de StyleHub. Encuentra productos por tipo, desde smartphones hasta audio."
        canonicalUrl="/categories"
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Categorías', url: '/categories' },
        ]}
      />
      {/* ===== HERO BANNER ===== */}
      <div className="categories-hero">
        <div className="categories-hero-bg" />
        <div className="categories-hero-content container">
          <p className="categories-hero-sub">{cms?.subtitle || 'Explora nuestra tienda'}</p>
          <h1 className="categories-hero-title">{cms?.title || 'Todas las Categorías'}</h1>
          <p className="categories-hero-desc">
            {cms?.description || 'Encuentra exactamente lo que buscas navegando por nuestras categorías de tecnología.'}
          </p>
          {/* Buscador de categorías */}
          <div className="categories-search-wrap">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="text"
              placeholder="Buscar categoría…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="cat-search-clear" onClick={() => setSearch('')}>
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== BREADCRUMB ===== */}
      <div className="categories-breadcrumb">
        <div className="container">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <span>Categorías</span>
        </div>
      </div>

      {/* ===== GRID ===== */}
      <div className="categories-body container">

        {/* Estado de carga */}
        {loading && (
          <div className="cat-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="cat-card cat-card-skeleton">
                <div className="cat-card-img-wrap skeleton-box" />
                <div className="cat-card-body">
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="cat-error">
            <i className="fa-solid fa-circle-exclamation" />
            <p>{error}</p>
          </div>
        )}

        {/* Sin resultados */}
        {!loading && !error && filtered.length === 0 && (
          <div className="cat-empty">
            <i className="fa-solid fa-folder-open" />
            <h3>No se encontraron categorías</h3>
            {search && (
              <button className="btn-reset-cat" onClick={() => setSearch('')}>
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}

        {/* Grid de categorías */}
        {!loading && filtered.length > 0 && (
          <>
            <p className="cat-count">
              {search
                ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} para "${search}"`
                : `${filtered.length} categoría${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`}
            </p>
            <div className="cat-grid">
              {filtered.map(cat => {
                const accentColor = CATEGORY_COLORS[cat.slug] || '#ff3d3d';
                return (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.slug}`}
                    className="cat-card"
                    style={{ '--cat-accent': accentColor } as React.CSSProperties}
                  >
                    {/* Imagen o gradiente de color */}
                    <div className="cat-card-img-wrap">
                      {cat.image_url ? (
                        <img
                          src={getImageUrlFromPath(cat.image_url || '')}
                          alt={cat.name}
                          className="cat-card-img"
                          onError={e => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`cat-card-icon-fallback ${cat.image_url ? 'hidden' : ''}`}>
                        <i className={cat.icon || 'fa-solid fa-tag'} />
                      </div>
                      <div className="cat-card-overlay" />
                    </div>

                    {/* Contenido */}
                    <div className="cat-card-body">
                      <div className="cat-card-icon-small">
                        <i className={cat.icon || 'fa-solid fa-tag'} />
                      </div>
                      <h3 className="cat-card-name">{cat.name}</h3>
                      {cat.description && (
                        <p className="cat-card-desc">{cat.description}</p>
                      )}
                      <div className="cat-card-cta">
                        Ver productos
                        <i className="fa-solid fa-arrow-right" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* CTA bottom */}
        {!loading && !error && (
          <div className="categories-cta-section">
            <div className="categories-cta-box">
              <i className="fa-solid fa-layer-group" />
              <div>
                <h3>¿No encuentras lo que buscas?</h3>
                <p>Explora todos nuestros productos sin filtros de categoría.</p>
              </div>
              <Link to="/products" className="btn-cta-all">
                Ver todos los productos
                <i className="fa-solid fa-arrow-right" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
