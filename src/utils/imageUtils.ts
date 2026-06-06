import type { Product } from '../types';

/**
 * Obtiene la URL correcta para una imagen de producto, manejando tanto URLs absolutas 
 * como rutas relativas de Supabase Storage.
 * 
 * @param product - El producto del cual obtener la imagen
 * @returns URL pública válida de la imagen
 */
const getSupabaseBaseUrl = () =>
  import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '') ||
  'https://ccfhpovymmqgjtyybfpw.supabase.co';

const normalizeStoragePath = (imagePath: string): string => {
  const cleanPath = imagePath.trim();

  if (!cleanPath) return '';

  if (/^https?:\/\//i.test(cleanPath)) return cleanPath;

  if (cleanPath.startsWith('/storage/v1/object/public/')) {
    return `${getSupabaseBaseUrl()}${cleanPath}`;
  }

  if (cleanPath.startsWith('storage/v1/object/public/')) {
    return `${getSupabaseBaseUrl()}/${cleanPath}`;
  }

  if (cleanPath.startsWith('object/public/')) {
    return `${getSupabaseBaseUrl()}/storage/v1/${cleanPath}`;
  }

  if (cleanPath.startsWith('public/')) {
    return `${getSupabaseBaseUrl()}/storage/v1/object/${cleanPath}`;
  }

  return `${getSupabaseBaseUrl()}/storage/v1/object/public/${cleanPath.replace(/^\//, '')}`;
};

export const getProductImageUrl = (product: Product): string => {
  if (!product.images || product.images.length === 0) {
    return '/images/products/placeholder.jpg';
  }

  return normalizeStoragePath(product.images[0]);
};

/**
 * Obtiene un array de URLs de imágenes para un producto
 * 
 * @param product - El producto del cual obtener las imágenes
 * @returns Array de URLs públicas válidas de las imágenes
 */
export const getProductImagesUrls = (product: Product): string[] => {
  if (!product.images || product.images.length === 0) {
    return ['/images/products/placeholder.jpg'];
  }

  return product.images.map(imageUrl => normalizeStoragePath(imageUrl));
};

/**
 * Convierte una ruta de imagen (relative or absolute) a una URL absoluta pública de Supabase Storage.
 * Si la entrada ya es una URL absoluta, la devuelve sin cambios.
 * @param imagePath - Ruta o URL de la imagen
 * @returns URL pública absoluta
 */
export const getImageUrlFromPath = (imagePath: string): string => {
  if (!imagePath) {
    return '/images/products/placeholder.jpg';
  }

  return normalizeStoragePath(imagePath);
};