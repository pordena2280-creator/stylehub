import { supabase } from './supabase';
import type { Product, ProductFilters, PaginatedResponse } from '../types';

// ============================================
// SERVICIO DE PRODUCTOS
// ============================================

export const productService = {
  // Obtener productos (admin) con filtros y paginación server-side
  async getProductsAdmin(filters: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 20, search, status } = filters;

    let query = supabase
      .from('products')
      .select(`
        *, 
        category:categories(*),
        product_variants:product_variants(*) 
      `, { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (status && status !== 'todos') {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: (data as Product[]) || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  // Obtener productos con filtros y paginación (público - solo activos)
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const {
      category,
      minPrice,
      maxPrice,
      rating,
      inStock,
      search,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = filters;

    let query = supabase
      .from('products')
      .select(`
        *, 
        category:categories(*),
        product_variants:product_variants(*) 
      `, { count: 'exact' })
      .eq('status', 'activo');

    // Filtro por categoría: primero buscar el category_id por slug
    if (category) {
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();
      
      // Si hay error en la búsqueda de categoría (ej: categoría no existe), 
      // no aplicamos filtro de categoría pero no fallamos la consulta completa
      if (!catError && catData) {
        query = query.eq('category_id', catData.id);
      }
    }

    if (minPrice !== undefined) query = query.gte('price', minPrice);
    if (maxPrice !== undefined) query = query.lte('price', maxPrice);
    if (rating)   query = query.gte('rating', rating);
    if (inStock)  query = query.gt('stock', 0);
    if (search)   query = query.ilike('name', `%${search}%`);

    // Ordenamiento
    switch (sortBy) {
      case 'price_asc':  query = query.order('price', { ascending: true });          break;
      case 'price_desc': query = query.order('price', { ascending: false });         break;
      case 'rating':     query = query.order('rating', { ascending: false });        break;
      case 'popular':    query = query.order('reviews_count', { ascending: false }); break;
      default:           query = query.order('created_at', { ascending: false });
    }

    // Paginación
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: (data as Product[]) || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  // Obtener producto por ID
  async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as Product;
  },

  // Obtener producto por slug
  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .single();
    if (error) return null;
    return data as Product;
  },

  // Obtener productos destacados
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('featured', true)
      .eq('status', 'activo')
      .limit(limit);
    if (error) throw error;
    return (data as Product[]) || [];
  },

  // Obtener productos relacionados (misma categoría)
  async getRelatedProducts(productId: number, categoryId: number, limit = 4): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('category_id', categoryId)
      .neq('id', productId)
      .eq('status', 'activo')
      .limit(limit);
    if (error) throw error;
    return (data as Product[]) || [];
  },

  // Crear producto (admin)
  async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { data, error } = await supabase
      .from('products')
      .insert({ ...product, slug })
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  // Actualizar producto (admin)
  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  // Eliminar producto (admin)
  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // Buscar productos (autocomplete)
  async searchProducts(query: string, limit = 10): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, images, slug')
      .ilike('name', `%${query}%`)
      .eq('status', 'activo')
      .limit(limit);
    if (error) throw error;
    return (data as Product[]) || [];
  },
};
