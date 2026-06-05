import type { Product } from '../types';

/**
 * Obtiene la URL correcta para una imagen de producto, manejando tanto URLs absolutas 
 * como rutas relativas de Supabase Storage.
 * 
 * @param product - El producto del cual obtener la imagen
 * @returns URL pública válida de la imagen
 */
export const getProductImageUrl = (product: Product): string => {
  // Si no hay imágenes o el array está vacío, devolver placeholder
  if (!product.images || product.images.length === 0) {
    return '/images/products/placeholder.jpg';
  }

  // Tomar la primera imagen
  const imageUrl = product.images[0];

  // Si la URL ya es absoluta (http:// o https://), devolverla tal cual
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Si es una ruta relativa de Supabase Storage, construir la URL completa
  // Nota: El proyecto de Supabase es: ccfhpovymmqgjtyybfpw (debe coincidir con .env)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '') || 
                      'https://ccfhpovymmqgjtyybfpw.supabase.co';

  if (imageUrl.startsWith('/storage/v1/object/public/')) {
    return `${supabaseUrl}${imageUrl}`;
  }

  // Si es solo un nombre de archivo o ruta relativa al bucket
  if (!imageUrl.startsWith('http')) {
    return `${supabaseUrl}/storage/v1/object/public/product-images/${imageUrl}`;
  }

  // Por defecto, devolver la URL tal como está (por si acaso)
  return imageUrl;
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

  return product.images.map(imageUrl => {
    // Si la URL ya es absoluta, devolverla tal cual
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Construir URL completa de Supabase Storage
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '') || 
                        'https://ccfhpovymmqgjtyybfpw.supabase.co';

    if (imageUrl.startsWith('/storage/v1/object/public/')) {
      return `${supabaseUrl}${imageUrl}`;
    }

    // Si es solo un nombre de archivo o ruta relativa al bucket
    if (!imageUrl.startsWith('http')) {
      return `${supabaseUrl}/storage/v1/object/public/product-images/${imageUrl}`;
    }

    return imageUrl;
  });
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
  // Si ya es una URL absoluta, devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '') || 
                      'https://ccfhpovymmqgjtyybfpw.supabase.co';
  if (imagePath.startsWith('/storage/v1/object/public/')) {
    return `${supabaseUrl}${imagePath}`;
  }
  // Asumimos que es una ruta relativa al bucket de producto-imagenes
  return `${supabaseUrl}/storage/v1/object/public/product-images/${imagePath}`;
};