import { supabase } from './supabase';
import type { Banner } from '../types';

// DB usa sort_order; el front usa order
function mapBanner(row: Record<string, unknown>): Banner {
  return {
    id: row.id as number,
    title: row.title as string,
    subtitle: (row.subtitle as string) || undefined,
    image_url: row.image_url as string,
    link: (row.link as string) || '/',
    position: row.position as Banner['position'],
    status: row.status as Banner['status'],
    order: (row.sort_order ?? row.order ?? 0) as number,
    created_at: row.created_at as string,
  };
}

function toDbPayload(banner: Partial<Banner>): Record<string, unknown> {
  const { order, ...rest } = banner;
  const payload: Record<string, unknown> = { ...rest };
  if (order !== undefined) payload.sort_order = order;
  return payload;
}

export const bannerService = {
  async getBannersByPosition(position: Banner['position']): Promise<Banner[]> {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('position', position)
      .eq('status', 'activo')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return ((data || []) as Record<string, unknown>[]).map(mapBanner);
  },

  async getAllBanners(): Promise<Banner[]> {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('position')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return ((data || []) as Record<string, unknown>[]).map(mapBanner);
  },

  async createBanner(banner: Omit<Banner, 'id' | 'created_at'>): Promise<Banner> {
    const { data, error } = await supabase
      .from('banners')
      .insert(toDbPayload(banner))
      .select()
      .single();
    if (error) throw error;
    return mapBanner(data as Record<string, unknown>);
  },

  async updateBanner(id: number, updates: Partial<Banner>): Promise<Banner> {
    const { data, error } = await supabase
      .from('banners')
      .update(toDbPayload(updates))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapBanner(data as Record<string, unknown>);
  },

  async deleteBanner(id: number): Promise<void> {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) throw error;
  },

  async toggleStatus(id: number, currentStatus: Banner['status']): Promise<void> {
    const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
    const { error } = await supabase.from('banners').update({ status: newStatus }).eq('id', id);
    if (error) throw error;
  },
};
