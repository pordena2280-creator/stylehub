import { supabase } from './supabase';

// ============================================================
// TIPOS
// ============================================================
export interface CmsSection {
  id: string;
  section_key: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  image_url?: string | null;
  button_text?: string | null;
  button_url?: string | null;
  order_index?: number;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface CmsListItem {
  id: number;
  section_key: string;
  item_key?: string;
  title?: string | null;
  content?: string | null;
  metadata?: Record<string, unknown>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// CMS SERVICE — Gestión de contenido dinámico
// ============================================================
export const cmsService = {
  /**
   * Obtener todas las secciones de CMS
   */
  async getAll(): Promise<CmsSection[]> {
    const { data, error } = await supabase
      .from('cms_content')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) throw error;
    return (data as CmsSection[]) || [];
  },

  /**
   * Obtener sección de CMS por key
   */
  async getByKey(sectionKey: string): Promise<CmsSection | null> {
    const { data, error } = await supabase
      .from('cms_content')
      .select('*')
      .eq('section_key', sectionKey)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    return data as CmsSection | null;
  },

  async getByKeyAny(sectionKey: string): Promise<CmsSection | null> {
    const { data, error } = await supabase
      .from('cms_content')
      .select('*')
      .eq('section_key', sectionKey)
      .maybeSingle();
    if (error) throw error;
    return data as CmsSection | null;
  },

  /**
   * Obtener todas las secciones (incluyendo inactivas)
   */
  async getAllIncludeInactive(): Promise<CmsSection[]> {
    const { data, error } = await supabase
      .from('cms_content')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) throw error;
    return (data as CmsSection[]) || [];
  },

  /**
   * Crear o actualizar una sección CMS
   */
  async upsertSection(section: Partial<CmsSection> & { section_key: string }): Promise<CmsSection> {
    const { data, error } = await supabase
      .from('cms_content')
      .upsert(
        { ...section, updated_at: new Date().toISOString() },
        { onConflict: 'section_key' }
      )
      .select()
      .single();
    if (error) throw error;
    return data as CmsSection;
  },

  /**
   * Actualizar una sección específica
   */
  async updateSection(sectionKey: string, updates: Partial<CmsSection>): Promise<CmsSection> {
    const { data, error } = await supabase
      .from('cms_content')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('section_key', sectionKey)
      .select()
      .single();
    if (error) throw error;
    return data as CmsSection;
  },

  /**
   * Cambiar estado activo/inactivo
   */
  async toggleActive(sectionKey: string): Promise<CmsSection> {
    const current = await this.getByKeyAny(sectionKey);
    if (!current) {
      return this.upsertSection({ section_key: sectionKey, is_active: true });
    }
    return this.updateSection(sectionKey, { is_active: !current.is_active });
  },

  /**
   * Borrar contenido (mantiene la sección pero vacía)
   */
  async clearSection(sectionKey: string): Promise<CmsSection> {
    return this.updateSection(sectionKey, {
      title: null,
      subtitle: null,
      description: null,
      image_url: null,
      button_text: null,
      button_url: null,
    });
  },

  /**
    * Obtener list items por sección (FAQ, social_links, footer_links, trust_badges)
    */
  async getListItems(sectionKey: string): Promise<CmsListItem[]> {
    const { data, error } = await supabase
      .from('cms_list_items')
      .select('*')
      .eq('section_key', sectionKey)
      .order('id', { ascending: true });
    if (error) throw error;
    return (data as CmsListItem[]) || [];
  },

  /**
    * Crear o actualizar un list item
    */
  async upsertListItem(item: Partial<CmsListItem> & { section_key: string }): Promise<CmsListItem> {
    // Si tiene id → actualizar; si no → insertar nuevo
    if (item.id) {
      const { data, error } = await supabase
        .from('cms_list_items')
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq('id', item.id)
        .select()
        .single();
      if (error) throw error;
      return data as CmsListItem;
    } else {
      const { id: _id, ...insertData } = item as any;
      const { data, error } = await supabase
        .from('cms_list_items')
        .insert({ ...insertData, created_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data as CmsListItem;
    }
  },

  /**
    * Eliminar un list item
    */
  async deleteListItem(id: number): Promise<void> {
    const { error } = await supabase.from('cms_list_items').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Suscribirse a cambios en tiempo real
   * Devuelve función para desuscribirse
   * 
   * Usa un nombre de canal único por suscripción para evitar el error
   * "cannot add postgres_changes callbacks after subscribe()" en React 18 StrictMode.
   */
  subscribeToChanges(callback: (section: CmsSection) => void) {
    // Canal único por instancia — evita colisión con StrictMode double-mount
    const channelName = `cms_content_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cms_content' },
        payload => {
          if (payload.new) callback(payload.new as CmsSection);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};


