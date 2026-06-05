import { supabase } from './supabase';
import type { Category } from '../types';

// ============================================
// SERVICIO DE CATEGORÍAS
// ============================================

export const categoryService = {
  // Obtener todas las categorías activas
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'activa')
      .order('name');
    if (error) throw error;
    return (data as Category[]) || [];
  },

  // Obtener todas (admin)
  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return (data as Category[]) || [];
  },

  // Obtener categoría por slug
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) return null;
    return data as Category;
  },

  // Crear categoría (admin)
  async createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  },

  // Actualizar categoría (admin)
  async updateCategory(id: number, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  },

  // Eliminar categoría (admin)
  async deleteCategory(id: number): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },
};
