import { supabase } from './supabase';

// ============================================
// SERVICIO DE STORAGE (Imágenes)
// ============================================

export const storageService = {
  // Subir imagen de producto (única)
  async uploadProductImage(file: File, productId: number): Promise<string> {
    const ext = file.name.split('.').pop();
    const fileName = `${productId}-${Date.now()}.${ext}`;
    const path = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true });

    if (error) throw error;
    return storageService.getPublicUrl('product-images', path);
  },

  // Subir múltiples imágenes de producto
  async uploadProductImages(files: File[], productId: number): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const ext = file.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}-${index}.${ext}`;
      const path = `products/${fileName}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: true });

      if (error) throw error;
      return storageService.getPublicUrl('product-images', path);
    });

    const urls = await Promise.all(uploadPromises);
    return urls;
  },

  // Subir imagen de categoría
  async uploadCategoryImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const fileName = `cat-${Date.now()}.${ext}`;
    const path = `categories/${fileName}`;

    const { error } = await supabase.storage
      .from('category-images')
      .upload(path, file, { upsert: true });

    if (error) throw error;
    return storageService.getPublicUrl('category-images', path);
  },

  // Subir imagen de blog
  async uploadBlogImage(file: File, postId: number): Promise<string> {
    const ext = file.name.split('.').pop();
    const fileName = `${postId}-${Date.now()}.${ext}`;
    const path = `blog/${fileName}`;

    const { error } = await supabase.storage
      .from('blog-images')
      .upload(path, file, { upsert: true });

    if (error) throw error;
    return storageService.getPublicUrl('blog-images', path);
  },

  // Subir imagen de banner
  async uploadBannerImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const fileName = `banner-${Date.now()}.${ext}`;
    const path = `banners/${fileName}`;

    const { error } = await supabase.storage
      .from('banner-images')
      .upload(path, file, { upsert: true });

    if (error) throw error;
    return storageService.getPublicUrl('banner-images', path);
  },

  // Subir avatar de usuario
  async uploadAvatar(file: File, userId: string): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `avatars/${userId}.${ext}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (error) throw error;
    return storageService.getPublicUrl('avatars', path);
  },

  // Obtener URL pública de un archivo
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // Eliminar archivo
  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },
};
