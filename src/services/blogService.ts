import { supabase } from './supabase';
import type { BlogPost, PaginatedResponse } from '../types';

// ============================================
// SERVICIO DE BLOG
// ============================================

export const blogService = {
  // Obtener posts publicados con paginación
  async getPosts(page = 1, limit = 6, category?: string): Promise<PaginatedResponse<BlogPost>> {
    let query = supabase
      .from('blog_posts')
      .select('*, author:profiles(full_name, avatar_url)', { count: 'exact' })
      .eq('status', 'publicado')
      .order('published_at', { ascending: false });

    if (category) query = query.eq('category', category);

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: (data as BlogPost[]) || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  // Obtener post por slug
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, author:profiles(full_name, avatar_url)')
      .eq('slug', slug)
      .eq('status', 'publicado')
      .single();
    if (error) return null;

    // Incrementar vistas
    await supabase
      .from('blog_posts')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', data.id);

    return data as BlogPost;
  },

  // Obtener post por ID (admin)
  async getPostById(id: number): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as BlogPost;
  },

  // Obtener todos los posts (admin)
  async getAllPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as BlogPost[]) || [];
  },

  // Crear post (admin)
  async createPost(post: Omit<BlogPost, 'id' | 'created_at' | 'views' | 'comments_count'>): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({ ...post, views: 0, comments_count: 0 })
      .select()
      .single();
    if (error) throw error;
    return data as BlogPost;
  },

  // Actualizar post (admin)
  async updatePost(id: number, updates: Partial<BlogPost>): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as BlogPost;
  },

  // Eliminar post (admin)
  async deletePost(id: number): Promise<void> {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
  },

  // Posts recientes para sidebar
  async getRecentPosts(limit = 3): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, image_url, published_at')
      .eq('status', 'publicado')
      .order('published_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as BlogPost[]) || [];
  },
};
