import { useState, useEffect } from 'react';
import { categoryService } from '../../../services';
import type { Category } from '../../../types';
import ImageUploader from '../../../components/ui/ImageUploader/ImageUploader';
import './AdminCategories.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '', slug: '', description: '',
    icon: 'fa-solid fa-tag',
    sort_order: 0,
    status: 'activa' as Category['status'],
  });
  // imagen gestionada por separado para el uploader
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await categoryService.getAllCategories();
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
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingCat(null);
    setFormData({ name: '', slug: '', description: '', icon: 'fa-solid fa-tag', sort_order: 0, status: 'activa' });
    setImageUrl('');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name, slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || 'fa-solid fa-tag',
      sort_order: cat.sort_order || 0,
      status: cat.status,
    });
    setImageUrl(cat.image_url || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name) { setError('El nombre es obligatorio.'); return; }
    setSaving(true);
    setError(null);
    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const payload = {
        name: formData.name,
        slug,
        description: formData.description,
        icon: formData.icon,
        image_url: imageUrl || null,
        sort_order: formData.sort_order,
        status: formData.status,
      };
      if (editingCat) {
        await categoryService.updateCategory(editingCat.id, payload);
      } else {
        await categoryService.createCategory(payload);
      }
      const data = await categoryService.getAllCategories();
      setCategories(data);
      setShowModal(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar categoría');
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="admin-categories">
      <div className="page-header">
        <div>
          <h1>Gestión de Categorías</h1>
          <p>{loading ? '…' : `${categories.length} categorías en total`}</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <i className="fa-solid fa-plus" /> Nueva Categoría
        </button>
      </div>

      {error && (
        <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>
      )}

      <div className="filters-bar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass search-icon" />
          <input
            type="text"
            placeholder="Buscar categoría…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Grid de tarjetas ── */}
      <div className="categories-grid">
        {loading ? (
          <div className="empty-state"><p>Cargando categorías…</p></div>
        ) : filtered.map(cat => (
          <div key={cat.id} className={`category-card ${cat.status === 'inactiva' ? 'inactive' : ''}`}>
            {/* Imagen de la categoría */}
            {cat.image_url && (
              <div className="cat-card-img-preview">
                <img src={cat.image_url} alt={cat.name} onError={e => { (e.currentTarget.parentElement!.style.display = 'none'); }} />
              </div>
            )}
            <div className="cat-card-header">
              <div className="cat-card-icon-wrap">
                <i className={cat.icon || 'fa-solid fa-tag'} />
              </div>
              <span className={`status-pill ${cat.status === 'activa' ? 'status-active' : 'status-inactive'}`}>
                {cat.status}
              </span>
            </div>
            <h3 className="cat-card-name">{cat.name}</h3>
            <p className="cat-card-desc">{cat.description || 'Sin descripción'}</p>
            <div className="cat-card-meta">
              <code className="cat-slug">/{cat.slug}</code>
            </div>
            <div className="cat-card-actions">
              <button className="btn-icon edit" onClick={() => openEdit(cat)} title="Editar">
                <i className="fa-solid fa-pen" />
              </button>
              <button className="btn-icon delete" onClick={() => setDeleteConfirm(cat.id)} title="Eliminar">
                <i className="fa-solid fa-trash" />
              </button>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="empty-state"><p>No se encontraron categorías</p></div>
        )}
      </div>

      {/* ── MODAL crear / editar ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box cat-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCat ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="modal-body">
              <div className="cat-modal-grid">
                {/* Formulario */}
                <div className="form-grid-2">
                  <div className="form-group full">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Smartphones"
                    />
                  </div>
                  <div className="form-group">
                    <label>Slug (URL)</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="smartphones"
                    />
                  </div>
                  <div className="form-group">
                    <label>Clase de icono (FontAwesome)</label>
                    <div className="icon-preview-row">
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="fa-solid fa-tag"
                      />
                      <span className="icon-preview"><i className={formData.icon || 'fa-solid fa-tag'} /></span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Orden</label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  <div className="form-group full">
                    <label>Descripción</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Descripción de la categoría…"
                    />
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as Category['status'] })}
                    >
                      <option value="activa">Activa</option>
                      <option value="inactiva">Inactiva</option>
                    </select>
                  </div>
                </div>

                {/* Imagen con uploader real */}
                <div className="cat-modal-img-col">
                  <ImageUploader
                    currentUrl={imageUrl || null}
                    bucket="category-images"
                    folder="categories"
                    label="Imagen de la categoría"
                    onUpload={url => setImageUrl(url)}
                    maxSizeMB={5}
                  />
                  {imageUrl && (
                    <p className="img-url-hint">
                      <i className="fa-solid fa-link" /> Guardada en Supabase Storage
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : editingCat ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmación eliminar ── */}
      {deleteConfirm !== null && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon"><i className="fa-solid fa-triangle-exclamation" /></div>
            <h3>¿Eliminar categoría?</h3>
            <p>Los productos asociados quedarán sin categoría.</p>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
