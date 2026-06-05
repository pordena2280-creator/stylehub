import { useState, useEffect } from 'react';
import { blogService, type BlogPost } from '../../../services';
import ImageUploader from '../../../components/ui/ImageUploader/ImageUploader';
import '../Products/AdminProducts.css';
import './AdminBlog.css';

const emptyPost = { title: '', category: '', excerpt: '', content: '', image_url: '', status: 'borrador' as BlogPost['status'], author_id: '', slug: '' };

const statusIcon: Record<string, string> = {
  publicado: 'fa-solid fa-circle-check',
  borrador:  'fa-solid fa-pen-to-square',
  archivado: 'fa-solid fa-box-archive',
};

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | BlogPost['status']>('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState(emptyPost);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await blogService.getAllPosts();
        if (!cancelled) setPosts(data);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar artículos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'todos' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openCreate = () => { setEditingPost(null); setFormData(emptyPost); setShowModal(true); };
const openEdit = (post: BlogPost) => {
     setEditingPost(post);
     setFormData({ 
       title: post.title, 
       category: post.category, 
       excerpt: post.excerpt || '', 
       content: post.content, 
       image_url: post.image_url || '', 
       status: post.status, 
       author_id: post.author_id,
       slug: post.slug
     });
     setShowModal(true);
   };

  const handleSave = async () => {
    if (!formData.title) return;
    setSaving(true);
    try {
      if (editingPost) {
        await blogService.updatePost(editingPost.id, formData);
      } else {
        await blogService.createPost(formData);
      }
      const data = await blogService.getAllPosts();
      setPosts(data);
      setShowModal(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar artículo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await blogService.deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar artículo');
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="admin-blog">
      <div className="page-header">
        <div>
          <h1>Gestión de Blog</h1>
          <p>{loading ? '…' : `${posts.length} artículos en total`}</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <i className="fa-solid fa-plus"></i> Nuevo Artículo
        </button>
      </div>

      {error && <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      <div className="filters-bar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="text" placeholder="Buscar artículo…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {(['todos', 'publicado', 'borrador', 'archivado'] as const).map(s => (
            <button key={s} className={`filter-tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
              {s !== 'todos' && <i className={statusIcon[s]}></i>} {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="blog-posts-list">
        {loading ? (
          <div className="empty-state"><p>Cargando artículos…</p></div>
        ) : filtered.map(post => (
          <div key={post.id} className={`blog-post-row ${post.status === 'archivado' ? 'archived' : ''}`}>
            <img src={post.image_url || '/images/blog/blog-default.jpg'} alt={post.title} className="post-thumb" onError={e => (e.currentTarget.src = 'https://placehold.co/100x70/f5f5f5/909090?text=Blog')} />
            <div className="post-info">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-excerpt">{post.excerpt || 'Sin extracto'}</p>
              <div className="post-meta">
                <span><i className="fa-solid fa-tag"></i> {post.category || '—'}</span>
                <span><i className="fa-regular fa-calendar"></i> {post.published_at ? new Date(post.published_at).toLocaleDateString('es-MX') : '—'}</span>
                <span><i className="fa-regular fa-eye"></i> {post.views.toLocaleString()} vistas</span>
                <span><i className="fa-regular fa-comment"></i> {post.comments_count} comentarios</span>
              </div>
            </div>
            <div className="post-actions">
              <span className={`status-pill ${post.status === 'publicado' ? 'status-active' : post.status === 'borrador' ? 'status-processing' : 'status-inactive'}`}>
                <i className={statusIcon[post.status]}></i> {post.status}
              </span>
              <div className="action-btns">
                <button className="btn-icon edit" onClick={() => openEdit(post)} title="Editar"><i className="fa-solid fa-pen"></i></button>
                <button className="btn-icon delete" onClick={() => setDeleteConfirm(post.id)} title="Eliminar"><i className="fa-solid fa-trash"></i></button>
              </div>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <i className="fa-solid fa-newspaper fa-2x" style={{ color: '#e1e1e1', marginBottom: 12 }}></i>
            <p>No se encontraron artículos</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPost ? 'Editar Artículo' : 'Nuevo Artículo'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group full">
                  <label>Título *</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Título del artículo" />
                </div>
                <div className="form-group">
                  <label>Autor ID (UUID)</label>
                  <input type="text" value={formData.author_id} onChange={e => setFormData({ ...formData, author_id: e.target.value })} placeholder="UUID del autor" />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    <option value="">Seleccionar…</option>
                    {['Tecnología', 'Guías', 'Gaming', 'Productividad', 'Comparativas', 'Seguridad'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as BlogPost['status'] })}>
                    <option value="borrador">Borrador</option>
                    <option value="publicado">Publicado</option>
                    <option value="archivado">Archivado</option>
                  </select>
                </div>
               <div className="form-group full">
                   <label>Imagen</label>
                   <ImageUploader
                     currentUrl={formData.image_url}
                     bucket="blog-images"
                     folder="blog"
                     label="Imagen del artículo"
                     onUpload={(url) => setFormData({ ...formData, image_url: url })}
                     maxSizeMB={8}
                   />
                 </div>
                <div className="form-group full">
                  <label>Extracto</label>
                  <textarea value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} rows={2} placeholder="Breve descripción…" />
                </div>
                <div className="form-group full">
                  <label>Contenido</label>
                  <textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} rows={6} placeholder="Contenido del artículo…" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : editingPost ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm !== null && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
            <h3>¿Eliminar artículo?</h3>
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

export default AdminBlog;
