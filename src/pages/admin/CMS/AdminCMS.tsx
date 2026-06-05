import { useEffect, useMemo, useState } from 'react';
import { cmsService, type CmsSection, type CmsListItem } from '../../../services/cmsService';
import ImageUploader from '../../../components/ui/ImageUploader/ImageUploader';
import '../Products/AdminProducts.css';
import './AdminCMS.css';

const CMS_LISTSECTIONS = [
  { section_key: 'faq', label: 'FAQ — Preguntas', group: 'Listas', description: 'Preguntas frecuentes editables' },
  { section_key: 'social_links', label: 'Redes Sociales', group: 'Listas', description: 'Enlaces para footer de redes sociales' },
];

const CMS_SECTION_DEFINITIONS = [
  { section_key: 'header_topbar', label: 'Header — Topbar', group: 'Global', description: 'Teléfono, email y promoción superior', order_index: 0 },
  { section_key: 'header_brand', label: 'Header — Marca', group: 'Global', description: 'Nombre de la tienda y tagline', order_index: 1 },
  { section_key: 'home_hero', label: 'Inicio — Hero', group: 'Inicio', description: 'Banner principal con CTA e imagen', order_index: 0 },
  { section_key: 'home_newsletter', label: 'Inicio — Newsletter', group: 'Inicio', description: 'Texto para el formulario de suscripción', order_index: 1 },
  { section_key: 'products_intro', label: 'Productos — Intro', group: 'Productos', description: 'Título y descripción de la página de productos', order_index: 0 },
  { section_key: 'categories_intro', label: 'Categorías — Intro', group: 'Categorías', description: 'Encabezado de la página de categorías', order_index: 0 },
  { section_key: 'blog_intro', label: 'Blog — Intro', group: 'Blog', description: 'Texto introductorio para el blog', order_index: 0 },
  { section_key: 'faq_intro', label: 'FAQ — Intro', group: 'FAQ', description: 'Encabezado para preguntas frecuentes', order_index: 0 },
  { section_key: 'contact_hero', label: 'Contacto — Hero', group: 'Contacto', description: 'Banner superior de contacto con CTA', order_index: 0 },
  { section_key: 'about_hero', label: 'Acerca de — Hero', group: 'Acerca de', description: 'Texto principal de la página Acerca de', order_index: 0 },
  { section_key: 'footer_about', label: 'Footer — Acerca de', group: 'Footer', description: 'Texto de presentación en el pie de página', order_index: 0 },
  { section_key: 'footer_contact', label: 'Footer — Contacto', group: 'Footer', description: 'Teléfono y email de contacto del pie de página', order_index: 1 },
  { section_key: 'footer_newsletter', label: 'Footer — Newsletter', group: 'Footer', description: 'Texto para el formulario de newsletter', order_index: 2 },
  { section_key: 'footer_payment_methods', label: 'Footer — Medios de pago', group: 'Footer', description: 'Texto y datos de métodos de pago aceptados', order_index: 3 },
  ...CMS_LISTSECTIONS.map(ls => ({ ...ls, order_index: 0 })),
];

const SECTION_PREVIEW_LABELS: Record<string, string> = {
  header_topbar: 'Topbar',
  header_brand: 'Marca',
  home_hero: 'Hero principal',
  home_newsletter: 'Newsletter',
  products_intro: 'Intro productos',
  categories_intro: 'Intro categorías',
  blog_intro: 'Intro blog',
  faq_intro: 'Intro FAQ',
  contact_hero: 'Contacto hero',
  about_hero: 'Acerca de hero',
  footer_about: 'Footer acerca de',
  footer_contact: 'Footer contacto',
  footer_newsletter: 'Footer newsletter',
  footer_payment_methods: 'Footer pagos',
  faq: 'FAQ — Preguntas',
  social_links: 'Redes Sociales',
};

type EditorMode = 'section' | 'list';

const AdminCMS = () => {
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [listItems, setListItems] = useState<CmsListItem[]>([]);
  const [selected, setSelected] = useState<CmsSection | null>(null);
  const [selectedListSection, setSelectedListSection] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('section');
  const [form, setForm] = useState<Partial<CmsSection>>({});
  const [listForm, setListForm] = useState<Partial<CmsListItem>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const groups = useMemo(() => {
    return CMS_SECTION_DEFINITIONS.reduce<Record<string, CmsSection[]>>((acc, definition) => {
      const section = sections.find(s => s.section_key === definition.section_key) ?? {
        id: definition.section_key,
        section_key: definition.section_key,
        title: '',
        subtitle: '',
        description: '',
        image_url: null,
        button_text: '',
        button_url: '',
        order_index: definition.order_index,
        is_active: false,
        metadata: {},
      };
      if (!acc[definition.group]) acc[definition.group] = [];
      acc[definition.group].push(section);
      return acc;
    }, {});
  }, [sections]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await cmsService.getAll();
      setSections(
        CMS_SECTION_DEFINITIONS.map(definition => (
          data.find(item => item.section_key === definition.section_key) ?? {
            id: definition.section_key,
            section_key: definition.section_key,
            title: '',
            subtitle: '',
            description: '',
            image_url: null,
            button_text: '',
            button_url: '',
            order_index: definition.order_index,
            is_active: true,
            metadata: {},
          }
        ))
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar CMS');
    } finally {
      setLoading(false);
    }
  };

  const loadListItems = async (sectionKey: string) => {
    setLoading(true);
    try {
      const items = await cmsService.getListItems(sectionKey);
      setListItems(items);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (editorMode === 'list' && selectedListSection) {
      loadListItems(selectedListSection);
    }
  }, [editorMode, selectedListSection]);

  useEffect(() => {
    if (editorMode === 'section' && !selected && sections.length > 0) {
      selectSection(sections[0]!);
    }
  }, [sections, editorMode]);

  const selectSection = (s: CmsSection) => {
    setSelected(s);
    setForm({ ...s });
    setEditorMode('section');
    setSuccess(null);
    setError(null);
  };

  const selectListSection = (sectionKey: string) => {
    setSelectedListSection(sectionKey);
    setEditorMode('list');
    setSelected(null);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await cmsService.upsertSection({
        section_key: selected.section_key,
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        image_url: form.image_url,
        button_text: form.button_text,
        button_url: form.button_url,
        is_active: form.is_active ?? selected.is_active,
        order_index: selected.order_index,
      });
      setSections(prev => prev.map(s => s.section_key === updated.section_key ? updated : s));
      setSelected(updated);
      setSuccess('Contenido guardado con éxito. Se reflejará en el sitio inmediatamente si ya está activo.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const cleared = await cmsService.clearSection(selected.section_key);
      setSections(prev => prev.map(s => s.section_key === cleared.section_key ? cleared : s));
      setSelected(cleared);
      setForm({ ...cleared });
      setSuccess('Sección limpiada. Puedes volver a escribir el contenido desde cero.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al limpiar la sección');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await cmsService.toggleActive(selected.section_key);
      setSections(prev => prev.map(s => s.section_key === updated.section_key ? updated : s));
      setSelected(updated);
      setForm({ ...form, is_active: updated.is_active });
      setSuccess(`Sección ${updated.is_active ? 'activada' : 'desactivada'} correctamente.`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cambiar estado');
    } finally {
      setSaving(false);
    }
  };

  const handleListSave = async () => {
    if (!selectedListSection) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await cmsService.upsertListItem({
        section_key: selectedListSection,
        title: listForm.title,
        content: listForm.content,
        is_active: listForm.is_active ?? true,
      } as any);
      setListItems(prev => [...prev, updated]);
      setListForm({});
      setSuccess('Item agregado correctamente');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar item');
    } finally {
      setSaving(false);
    }
  };

  const handleListDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este item?')) return;
    try {
      await cmsService.deleteListItem(id);
      setListItems(prev => prev.filter(item => item.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar item');
    }
  };

  const isListSection = (sectionKey: string) => {
    return CMS_LISTSECTIONS.some(ls => ls.section_key === sectionKey);
  };

  return (
    <div className="admin-cms">
      <div className="page-header">
        <div>
          <h1>CMS — Contenido dinámico del cliente</h1>
          <p>Gestiona el header, hero, textos, imágenes y listas desde un solo panel.</p>
        </div>
      </div>

      {error && <div className="admin-error">{error} <button type="button" onClick={() => setError(null)}>✕</button></div>}
      {success && <div className="admin-cms-success">{success}</div>}

      <div className="cms-layout">
        <aside className="cms-sidebar">
          {loading && <p>Cargando…</p>}
          {!loading && Object.entries(groups).map(([group, items]) => (
            <div className="cms-group" key={group}>
              <div className="cms-group-title">{group}</div>
              {items.map(item => (
                <button
                  key={item.section_key}
                  type="button"
                  className={`cms-nav-item ${editorMode === 'section' && selected?.section_key === item.section_key ? 'active' : ''} ${editorMode === 'list' && selectedListSection === item.section_key ? 'active' : ''}`}
                  onClick={() => isListSection(item.section_key) ? selectListSection(item.section_key) : selectSection(item)}
                >
                  {SECTION_PREVIEW_LABELS[item.section_key] || item.section_key}
                  <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
                    {item.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        {editorMode === 'section' && selected && (
          <div className="cms-editor">
            <div className="editor-header">
              <div>
                <h2>{SECTION_PREVIEW_LABELS[selected.section_key] || selected.section_key}</h2>
                <p className="editor-subtitle">{CMS_SECTION_DEFINITIONS.find(item => item.section_key === selected.section_key)?.description}</p>
              </div>
              <div className="editor-meta">
                <span className={`status-badge ${selected.is_active ? 'active' : 'inactive'}`}>
                  {selected.is_active ? 'Activo' : 'Inactivo'}
                </span>
                <span className="section-key">{selected.section_key}</span>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group full">
                <label>Título</label>
                <input type="text" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group full">
                <label>Subtítulo</label>
                <input type="text" value={form.subtitle || ''} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
              </div>
              <div className="form-group full">
                <label>Descripción</label>
                <textarea rows={5} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Texto del botón</label>
                <input type="text" value={form.button_text || ''} onChange={e => setForm({ ...form, button_text: e.target.value })} />
              </div>
              <div className="form-group">
                <label>URL del botón</label>
                <input type="text" value={form.button_url || ''} onChange={e => setForm({ ...form, button_url: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="check-label">
                  <input type="checkbox" checked={form.is_active ?? selected.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                  <span>Sección activa</span>
                </label>
              </div>
            </div>

            <div className="cms-image-block">
              <ImageUploader currentUrl={form.image_url} bucket="banner-images" folder="cms" label="Imagen de la sección (opcional)" onUpload={url => setForm({ ...form, image_url: url || null })} />
            </div>

            <div className="cms-preview-card">
              <h3>Vista previa rápida</h3>
              <p><strong>Título:</strong> {form.title || 'Sin título'}</p>
              <p><strong>Subtítulo:</strong> {form.subtitle || 'Sin subtítulo'}</p>
              <p><strong>Descripción:</strong> {form.description || 'Sin descripción'}</p>
              {form.image_url && (<div className="preview-image"><img src={form.image_url} alt={form.title || selected.section_key} /></div>)}
            </div>

            <div className="cms-actions">
              <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleToggleActive} disabled={saving}>
                {selected.is_active ? 'Desactivar sección' : 'Activar sección'}
              </button>
              <button type="button" className="btn-tertiary" onClick={handleClear} disabled={saving}>
                Limpiar contenido
              </button>
            </div>
          </div>
        )}

        {editorMode === 'list' && selectedListSection && (
          <div className="cms-editor">
            <div className="editor-header">
              <div>
                <h2>{SECTION_PREVIEW_LABELS[selectedListSection] || selectedListSection}</h2>
                <p className="editor-subtitle">Gestiona los items de {selectedListSection}</p>
              </div>
            </div>

            <div className="list-items-table">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Contenido</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {listItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.title || '—'}</td>
                      <td>{item.content || '—'}</td>
                      <td><span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>{item.is_active ? 'Activo' : 'Inactivo'}</span></td>
                      <td>
                        <button className="btn-icon delete" onClick={() => handleListDelete(item.id)} title="Eliminar">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {listItems.length === 0 && (
                    <tr><td colSpan={4} className="empty-row">No hay items. Agrega uno abajo.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="list-item-form">
              <h3>Agregar nuevo item</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Título</label>
                  <input type="text" value={listForm.title || ''} onChange={e => setListForm({ ...listForm, title: e.target.value })} placeholder="Ej: ¿Cómo devuelvo un producto?" />
                </div>
                <div className="form-group full">
                  <label>Contenido</label>
                  <textarea rows={3} value={listForm.content || ''} onChange={e => setListForm({ ...listForm, content: e.target.value })} placeholder="Texto de respuesta o URL..." />
                </div>
              </div>
              <button className="btn-primary" onClick={handleListSave} disabled={saving}>
                {saving ? 'Guardando…' : 'Agregar Item'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCMS;