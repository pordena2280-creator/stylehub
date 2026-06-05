import { z } from 'zod';

// ============================================
// VALIDADORES ZOD — TechStore
// ============================================

// ===== AUTH =====
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'Mínimo 6 caracteres'),
  remember: z.boolean().optional(),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'Mínimo 3 caracteres')
    .max(80, 'Máximo 80 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),
  password: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Ingresa tu contraseña actual'),
  newPassword: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string().min(1, 'Confirma la nueva contraseña'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// ===== PERFIL =====
export const profileSchema = z.object({
  full_name: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(80, 'Máximo 80 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .optional()
    .refine(val => !val || /^[\d\s\+\-\(\)]{7,20}$/.test(val), {
      message: 'Teléfono inválido',
    }),
});

// ===== DIRECCIÓN =====
export const addressSchema = z.object({
  type: z.string().min(1, 'El tipo es requerido'),
  full_name: z.string().min(3, 'Nombre requerido'),
  phone: z.string().min(7, 'Teléfono requerido'),
  address: z.string().min(5, 'Dirección requerida'),
  city: z.string().min(2, 'Ciudad requerida'),
  state: z.string().min(2, 'Estado requerido'),
  zip_code: z.string().min(4, 'Código postal requerido'),
  country: z.string().min(2, 'País requerido'),
  is_default: z.boolean().optional(),
});

// ===== CHECKOUT =====
export const checkoutSchema = z.object({
  // Envío
  firstName: z.string().min(2, 'Nombre requerido'),
  lastName: z.string().min(2, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'Teléfono requerido'),
  address: z.string().min(5, 'Dirección requerida'),
  city: z.string().min(2, 'Ciudad requerida'),
  state: z.string().min(2, 'Estado requerido'),
  zipCode: z.string().min(4, 'Código postal requerido'),
  country: z.string().min(2, 'País requerido'),
  // Pago
  paymentMethod: z.enum(['card', 'paypal', 'transfer']),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  orderNotes: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
});

// ===== PRODUCTO (admin) =====
export const productSchema = z.object({
  name: z.string().min(3, 'Nombre requerido (mín. 3 caracteres)').max(200),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  old_price: z.number().min(0).optional().nullable(),
  sku: z.string().min(2, 'SKU requerido'),
  stock: z.number().int().min(0, 'Stock no puede ser negativo'),
  status: z.enum(['activo', 'inactivo', 'agotado']),
  category_id: z.number().optional().nullable(),
  images: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});

// ===== CATEGORÍA (admin) =====
export const categorySchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  status: z.enum(['activa', 'inactiva']),
});

// ===== RESEÑA =====
export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Selecciona una calificación').max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres').max(1000),
});

// ===== BLOG POST (admin) =====
export const blogPostSchema = z.object({
  title: z.string().min(5, 'Título requerido (mín. 5 caracteres)').max(200),
  slug: z.string().optional(),
  excerpt: z.string().max(300).optional(),
  content: z.string().min(20, 'El contenido es requerido'),
  category: z.string().min(1, 'Categoría requerida'),
  image_url: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
  status: z.enum(['publicado', 'borrador', 'archivado']),
});

// ===== NEWSLETTER =====
export const newsletterSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
});

// ===== CONTACTO =====
export const contactSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  subject: z.string().min(3, 'Asunto requerido'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(2000),
});

// ===== TIPOS INFERIDOS =====
export type LoginFormData       = z.infer<typeof loginSchema>;
export type RegisterFormData    = z.infer<typeof registerSchema>;
export type ProfileFormData     = z.infer<typeof profileSchema>;
export type AddressFormData     = z.infer<typeof addressSchema>;
export type CheckoutFormData    = z.infer<typeof checkoutSchema>;
export type ProductFormData     = z.infer<typeof productSchema>;
export type CategoryFormData    = z.infer<typeof categorySchema>;
export type ReviewFormData      = z.infer<typeof reviewSchema>;
export type BlogPostFormData    = z.infer<typeof blogPostSchema>;
export type ContactFormData     = z.infer<typeof contactSchema>;
