import { useState, useEffect, useCallback } from 'react';
import { productService } from '../../../services';
import { categoryService } from '../../../services';
import type { Product, Category } from '../../../types';
import ImageUploader from '../../../components/ui/ImageUploader/ImageUploader';
import { getProductImageUrl, getImageUrlFromPath } from '../../../utils/imageUtils';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts]         = useState<Product[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [total, setTotal]               = useState(0);
  const [showModal, setShowModal]       = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Lista de URLs de imágenes (puede estar vacía)
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '', description: '', price: 0, old_price: 0, sku: '',
    stock: 0, status: 'activo' as Product['status'],
    rating: 0, reviews_count: 0, featured: false,
    category_id: null as number | null,
  });

  // ── Cargar productos y categorías con paginación server-side ──
  const loadProducts = useCallback(async (page = 1, searchVal = '', statusVal = 'todos') => {
    setLoading(true);
    try {
      const prodRes = await productService.getProductsAdmin({
        page,
        limit: 20,
        search: searchVal || undefined,
        status: statusVal === 'todos' ? undefined : statusVal,
      });
      setProducts(prodRes.data);
      setTotal(prodRes.total);
      setCurrentPage(prodRes.page);
      setTotalPages(prodRes.totalPages);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const catRes = await categoryService.getAllCategories();
      if (!cancelled) setCategories(catRes);
    };
    init();
  }, []);

  useEffect(() => {
    loadProducts(currentPage, search, filterStatus);
  }, [loadProducts, currentPage, search, filterStatus]);

  // ── Abrir modal crear ──────────────────────────────────────
  const openCreate = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: 0, old_price: 0, sku: '', stock: 0, status: 'activo', rating: 0, reviews_count: 0, featured: false, category_id: null });
    setImageUrls([]);
    setShowModal(true);
  };

  // ── Abrir modal editar ─────────────────────────────────────
  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, description: product.description || '',
      price: product.price, old_price: product.old_price || 0,
      sku: product.sku, stock: product.stock, status: product.status,
      rating: product.rating || 0, reviews_count: product.reviews_count || 0,
      featured: product.featured || false, category_id: product.category_id || null,
    });
     // Las imágenes vienen como array de strings, posiblemente vacío
     setImageUrls((product.images || []).map(getImageUrlFromPath));
    setShowModal(true);
  };

  // ── Guardar ────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.name || !formData.sku) {
      setError('El nombre y el SKU son obligatorios.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        old_price: formData.old_price || null,
        images: imageUrls.filter(url => url !== ''), // Solo guardar URLs no vacías
      };
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload);
      } else {
        await productService.createProduct(payload as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
      }
      loadProducts(currentPage, search, filterStatus);
      setShowModal(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar producto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await productService.deleteProduct(id);
      loadProducts(currentPage, search, filterStatus);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar producto');
    }
  };

  // Callback del ImageUploader — actualiza la URL en el índice dado
  const handleImageUploadedAt = (index: number, url: string) => {
    setImageUrls(prev => {
      const next = [...prev];
      // Aseguramos que el array tenga suficiente longitud
      while (next.length <= index) next.push('');
      next[index] = url;
      return next;
    });
  };

  const getStatusClass = (status: string) => {
    if (status === 'activo')   return 'status-active';
    if (status === 'inactivo') return 'status-inactive';
    return 'status-out';
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="admin-products">
      <div className="page-header">
        <div>
          <h1>Gestión de Productos</h1>
          <p>{loading ? '…' : `${total} productos en total`}</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <i className="fa-solid fa-plus" /> Nuevo Producto
        </button>
      </div>

      {error && (
        <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>
      )}

      <div className="filters-bar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass search-icon" />
          <input type="text" placeholder="Buscar por nombre o SKU..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {['todos', 'activo', 'inactivo', 'agotado'].map(s => (
            <button key={s} className={`filter-tab ${filterStatus === s ? 'active' : ''}`} onClick={() => { setFilterStatus(s); setCurrentPage(1); }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th><th>SKU</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="empty-row">Cargando productos…</td></tr>
              ) : products.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className="product-cell">
                       {product.images?.[0] ? (
                         <img src={getImageUrlFromPath(product.images[0])} alt={product.name} className="product-thumb" onError={e => { e.currentTarget.src = '/images/products/placeholder.jpg'; }} />
                       ) : (
                         <div className="product-thumb-placeholder"><i className="fa-solid fa-image" /></div>
                       )}
                      <span className="product-name">{product.name}</span>
                    </div>
                  </td>
                  <td><code className="sku-code">{product.sku}</code></td>
                  <td>{product.category?.name || '—'}</td>
                  <td><strong>${product.price.toFixed(2)}</strong></td>
                  <td>
                    <span className={`stock-num ${product.stock === 0 ? 'zero' : product.stock < 15 ? 'low' : 'ok'}`}>{product.stock}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${getStatusClass(product.status)}`}>{product.status}</span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon edit" onClick={() => openEdit(product)} title="Editar"><i className="fa-solid fa-pen" /></button>
                      <button className="btn-icon delete" onClick={() => handleDelete(product.id)} title="Eliminar"><i className="fa-solid fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 && (
                <tr><td colSpan={7} className="empty-row">No se encontraron productos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination-bar">
          <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
            <i className="fa-solid fa-chevron-left"></i> Anterior
          </button>
          <span className="pagination-info">Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
            Siguiente <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* ── MODAL ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box modal-box-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-two-col">
                {/* Columna izquierda — formulario */}
                <div className="modal-form-col">
                  <div className="form-grid-2">
                    <div className="form-group full">
                      <label>Nombre del Producto *</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: iPhone 15 Pro Max" />
                    </div>
                    <div className="form-group">
                      <label>SKU *</label>
                      <input type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="Ej: IPH15PM-256" />
                    </div>
                    <div className="form-group">
                      <label>Categoría</label>
                      <select value={formData.category_id ?? ''} onChange={e => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })}>
                        <option value="">Sin categoría</option>
                        {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Precio ($)</label>
                      <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} min="0" step="0.01" />
                    </div>
                    <div className="form-group">
                      <label>Precio Anterior ($)</label>
                      <input type="number" value={formData.old_price} onChange={e => setFormData({ ...formData, old_price: parseFloat(e.target.value) || 0 })} min="0" step="0.01" />
                    </div>
                    <div className="form-group">
                      <label>Stock</label>
                      <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} min="0" />
                    </div>
                    <div className="form-group">
                      <label>Estado</label>
                      <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as Product['status'] })}>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="agotado">Agotado</option>
                      </select>
                    </div>
                    <div className="form-group featured-check">
                      <label className="check-label">
                        <input type="checkbox" checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} />
                        <span>Producto destacado</span>
                      </label>
                    </div>
                    <div className="form-group full">
                      <label>Descripción</label>
                      <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Descripción del producto…" />
                    </div>
                  </div>
                </div>

                {/* Columna derecha — galería de imágenes */}
                <div className="modal-img-col">
                  <div className="product-images-upload-grid">
                    {imageUrls.map((url, index) => (
                      <ImageUploader
                        key={index}
                        currentUrl={url}
                        bucket="product-images"
                        folder="products"
                        label={`Imagen ${index + 1}`}
                        onUpload={(uploadedUrl) => handleImageUploadedAt(index, uploadedUrl)}
                        maxSizeMB={8}
                      />
                    ))}
                    {/* Botón para agregar una nueva imagen */}
                    <div className="add-image-slot">
                      <ImageUploader
                        currentUrl={null}
                        bucket="product-images"
                        folder="products"
                        label="Agregar otra imagen"
                        onUpload={(uploadedUrl) => handleImageUploadedAt(imageUrls.length, uploadedUrl)}
                        maxSizeMB={8}
                      />
                    </div>
                  </div>
                  {imageUrls.length > 0 && (
                    <p className="img-url-hint">
                      <i className="fa-solid fa-link" /> {imageUrls.filter(url => url !== '').length} imágenes guardadas en Supabase Storage
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;