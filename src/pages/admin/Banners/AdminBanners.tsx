import { useState, useEffect } from 'react';
import { bannerService, type Banner } from '../../../services';
import ImageUploader from '../../../components/ui/ImageUploader/ImageUploader';
import '../Products/AdminProducts.css';
import './AdminBanners.css';

const emptyBanner = { title: '', subtitle: '', image_url: '', link: '', position: 'hero' as Banner['position'], status: 'activo' as Banner['status'], order: 1 };

const positionConfig: Record<string, { label: string; icon: string }> = {
  hero:    { label: 'Hero (Principal)', icon: 'fa-solid fa-panorama' },
  promo:   { label: 'Promo',           icon: 'fa-solid fa-bullhorn' },
  sidebar: { label: 'Sidebar',         icon: 'fa-solid fa-sidebar' },
};

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterPosition, setFilterPosition] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyBanner);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await bannerService.getAllBanners();
        if (!cancelled) setBanners(data);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar banners');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = banners.filter(b => filterPosition === 'todos' || b.position === filterPosition);

  const openCreate = () => { setEditingBanner(null); setFormData(emptyBanner); setShowModal(true); };
  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({ title: banner.title, subtitle: banner.subtitle || '', image_url: banner.image_url, link: banner.link, position: banner.position, status: banner.status, order: banner.order });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title) return;
    setSaving(true);
    try {
      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, formData);
      } else {
        await bannerService.createBanner(formData);
      }
      const data = await bannerService.getAllBanners();
      setBanners(data);
      setShowModal(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await bannerService.deleteBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar banner');
    }
    setDeleteConfirm(null);
  };

  const toggleStatus = async (id: number) => {
    try {
      await bannerService.toggleStatus(id, banners.find(b => b.id === id)?.status || 'activo');
      const data = await bannerService.getAllBanners();
      setBanners(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cambiar estado');
    }
  };

  return (
    <div className="admin-banners">
      <div className="page-header">
        <div>
          <h1>Gestión de Banners</h1>
          <p>{loading ? '…' : `${banners.length} banners en total`}</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <i className="fa-solid fa-plus"></i> Nuevo Banner
        </button>
      </div>

      {error && <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      <div className="filters-bar">
        <div className="filter-tabs">
          <button className={`filter-tab ${filterPosition === 'todos' ? 'active' : ''}`} onClick={() => setFilterPosition('todos')}>Todos</button>
          {Object.entries(positionConfig).map(([key, val]) => (
            <button key={key} className={`filter-tab ${filterPosition === key ? 'active' : ''}`} onClick={() => setFilterPosition(key)}>
              <i className={val.icon}></i> {val.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><p>Cargando banners…</p></div>
      ) : (
        <div className="banners-grid">
          {filtered.map(banner => (
            <div key={banner.id} className={`banner-card ${banner.status === 'inactivo' ? 'inactive' : ''}`}>
              <div className="banner-image-wrap">
                <img src={banner.image_url} alt={banner.title} onError={e => (e.currentTarget.src = 'https://placehold.co/400x200/f5f5f5/909090?text=Banner')} />
                <div className="banner-overlay">
                  <span className="banner-position-tag"><i className={positionConfig[banner.position]?.icon ?? 'fa-solid fa-image'}></i> {banner.position}</span>
                  <span className="banner-order-tag"><i className="fa-solid fa-sort"></i> {banner.order}</span>
                </div>
              </div>
              <div className="banner-info">
                <h3>{banner.title}</h3>
                <p>{banner.subtitle}</p>
                <a href={banner.link} className="banner-link" target="_blank" rel="noreferrer">
                  <i className="fa-solid fa-link"></i> {banner.link}
                </a>
              </div>
              <div className="banner-actions">
                <label className="toggle-switch" title={banner.status === 'activo' ? 'Desactivar' : 'Activar'}>
                  <input type="checkbox" checked={banner.status === 'activo'} onChange={() => toggleStatus(banner.id)} />
                  <span className="toggle-slider"></span>
                </label>
                <span className={`status-pill ${banner.status === 'activo' ? 'status-active' : 'status-inactive'}`}>{banner.status}</span>
                <div className="action-btns">
                  <button className="btn-icon edit" onClick={() => openEdit(banner)} title="Editar"><i className="fa-solid fa-pen"></i></button>
                  <button className="btn-icon delete" onClick={() => setDeleteConfirm(banner.id)} title="Eliminar"><i className="fa-solid fa-trash"></i></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBanner ? 'Editar Banner' : 'Nuevo Banner'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group full">
                  <label>Título *</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Título del banner" />
                </div>
                <div className="form-group full">
                  <label>Subtítulo</label>
                  <input type="text" value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} placeholder="Texto secundario" />
                </div>
                 <div className="form-group full">
                   <label>Imagen</label>
                   <ImageUploader
                     currentUrl={formData.image_url}
                     bucket="banner-images"
                     folder="banners"
                     label="Imagen del banner"
                     onUpload={(url) => setFormData({ ...formData, image_url: url })}
                     maxSizeMB={8}
                   />
                 </div>
                <div className="form-group full">
                  <label>Enlace (Link)</label>
                  <input type="text" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} placeholder="/products" />
                </div>
                <div className="form-group">
                  <label>Posición</label>
                  <select value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value as Banner['position'] })}>
                    <option value="hero">Hero (Principal)</option>
                    <option value="promo">Promo</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Orden</label>
                  <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })} min="1" />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as Banner['status'] })}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : editingBanner ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm !== null && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
            <h3>¿Eliminar banner?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}><i className="fa-solid fa-trash"></i> Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
