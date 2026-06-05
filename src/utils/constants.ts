// ============================================================
// CONSTANTES DE LA APLICACIÓN
// ============================================================

/**
 * COLORES Y TEMAS
 */
export const COLORS = {
  primary: '#ff3d3d',
  primaryDark: '#D80027',
  secondary: '#004ec3',
  secondaryDark: '#0038a3',
  gray: '#333e48',
  grayLight: '#909090',
  grayLighter: '#f5f5f5',
  grayBorder: '#e1e1e1',
  white: '#fff',
  success: '#27ae60',
  warning: '#f39c12',
  error: '#e74c3c',
  info: '#3498db',
} as const;

/**
 * ESTADOS DE PEDIDOS
 */
export const ORDER_STATUS = {
  pending: 'pendiente',
  processing: 'procesando',
  shipped: 'enviado',
  delivered: 'entregado',
  cancelled: 'cancelado',
  refunded: 'reembolsado',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente de Pago',
  procesando: 'Procesando',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  reembolsado: 'Reembolsado',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pendiente: COLORS.warning,
  procesando: COLORS.info,
  enviado: COLORS.secondary,
  entregado: COLORS.success,
  cancelado: COLORS.error,
  reembolsado: COLORS.grayLight,
};

/**
 * ESTADOS DE PRODUCTOS
 */
export const PRODUCT_STATUS = {
  active: 'activo',
  inactive: 'inactivo',
  outOfStock: 'agotado',
} as const;

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  agotado: 'Agotado',
};

/**
 * ROLES DE USUARIO
 */
export const USER_ROLES = {
  customer: 'cliente',
  admin: 'admin',
  editor: 'editor',
  operator: 'operador',
} as const;

export const USER_ROLE_LABELS: Record<string, string> = {
  cliente: 'Cliente',
  admin: 'Administrador',
  editor: 'Editor',
  operador: 'Operador',
};

/**
 * MÉTODOS DE PAGO
 */
export const PAYMENT_METHODS = {
  stripe: 'stripe',
  transfer: 'transfer',
  cash: 'efectivo',
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  stripe: 'Tarjeta de Crédito (Stripe)',
  transfer: 'Transferencia Bancaria',
  efectivo: 'Efectivo',
};

/**
 * MONEDAS
 */
export const CURRENCIES = {
  MXN: 'Peso Mexicano',
  USD: 'Dólar Estadounidense',
  EUR: 'Euro',
} as const;

/**
 * PAÍS
 */
export const COUNTRIES = [
  { code: 'MX', name: 'México' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'CA', name: 'Canadá' },
  { code: 'ES', name: 'España' },
] as const;

/**
 * ESTADOS MEXICANOS
 */
export const MEXICAN_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
  'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán',
  'Zacatecas',
] as const;

/**
 * CATEGORÍA DE PRODUCTOS
 */
export const PRODUCT_CATEGORIES = {
  electronics: 'Electrónica',
  clothing: 'Ropa',
  books: 'Libros',
  home: 'Hogar',
  sports: 'Deportes',
  toys: 'Juguetes',
  food: 'Alimentos',
  beauty: 'Belleza',
} as const;

/**
 * TIPOS DE CUPONES
 */
export const COUPON_TYPES = {
  percentage: 'percentage',
  fixed: 'fixed',
} as const;

export const COUPON_TYPE_LABELS: Record<string, string> = {
  percentage: 'Porcentaje (%)',
  fixed: 'Monto Fijo ($)',
};

/**
 * CONFIGURACIÓN DE PAGINACIÓN
 */
export const PAGINATION = {
  defaultPageSize: 12,
  pageSizeOptions: [12, 24, 36, 48],
  defaultPage: 1,
} as const;

/**
 * LÍMITES Y VALIDACIONES
 */
export const LIMITS = {
  minPrice: 0,
  maxPrice: 999999,
  minStock: 0,
  maxStock: 999999,
  minProductNameLength: 3,
  maxProductNameLength: 255,
  minDescriptionLength: 10,
  maxDescriptionLength: 5000,
  minPasswordLength: 8,
  maxPasswordLength: 128,
  minPhoneLength: 10,
  maxPhoneLength: 20,
  maxImageSizeMB: 5,
  maxImageDimensions: 4000,
  maxCategoryNameLength: 100,
  maxReviewLength: 1000,
} as const;

/**
 * CONFIGURACIÓN DE ENVÍO
 */
export const SHIPPING = {
  baseCost: 100,
  freeShippingThreshold: 500,
  estimatedDays: 3,
  insuranceCost: 50,
} as const;

/**
 * CONFIGURACIÓN DE IMPUESTOS
 */
export const TAX_RATE = 0.16; // 16% IVA (México)

/**
 * URLS DE API Y SERVICIOS EXTERNOS
 */
export const API_ENDPOINTS = {
  stripe: 'https://api.stripe.com',
  supabase: import.meta.env.VITE_SUPABASE_URL || 'https://ccfhpovymmqgjtyybfpw.supabase.co',
} as const;

/**
 * TIMEOUTS Y DURACIONES
 */
export const TIMEOUTS = {
  apiRequest: 30000, // 30 segundos
  debounce: 300,
  toast: 5000,
  sessionRefresh: 3600000, // 1 hora
} as const;

/**
 * EXPRESIONES REGULARES
 */
export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\d{10}$/,
  zipCode: /^\d{5}$/,
  url: /^https?:\/\/.+/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  hex: /^#(?:[0-9a-f]{3}){1,2}$/i,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
} as const;

/**
 * CONFIGURACIÓN LOCAL
 */
export const APP_CONFIG = {
  name: 'TechStore',
  version: '1.0.0',
  language: 'es-MX',
  timezone: 'America/Mexico_City',
  debug: import.meta.env.DEV,
} as const;

/**
 * FILTRO DE BÚSQUEDA
 */
export const SEARCH_FILTERS = {
  categoryFilter: true,
  priceFilter: true,
  ratingFilter: true,
  stockFilter: true,
  sortOptions: ['newest', 'price_asc', 'price_desc', 'rating', 'popular'],
} as const;
