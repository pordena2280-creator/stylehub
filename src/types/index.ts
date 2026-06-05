// ============================================
// TIPOS GLOBALES DEL SISTEMA E-COMMERCE
// ============================================

// ===== AUTH =====
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'cliente' | 'admin' | 'editor' | 'operador';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// ===== CATEGORIES =====
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string | null;
  images?: string[];          // galería de imágenes adicionales
  parent_id?: number | null;
  sort_order?: number;
  status: 'activa' | 'inactiva';
  created_at: string;
}

// ===== PRODUCTS =====
export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number; // precio base
  old_price?: number | null;
  sku: string;
  stock: number; // stock total
  status: 'activo' | 'inactivo' | 'agotado';
  category_id?: number | null;
  category?: Category;
  images: string[];
  rating?: number;
  reviews_count?: number;
  featured?: boolean;
  variants?: ProductVariant[]; // variantes del producto (tallas, colores, etc.)
  created_at: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string; // SKU específico de la variante
  name: string; // nombre de la variante (ej: "Talla M - Rojo")
  attributes: Record<string, string>; // ej: { size: "M", color: "Rojo" }
  price: number; // precio de la variante (puede diferir del base)
  old_price?: number | null;
  stock: number; // stock específico de esta variante
  status: 'activo' | 'inactivo' | 'agotado';
  images?: string[]; // imágenes específicas de la variante (opcional)
  created_at: string;
  updated_at?: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

// ===== CART =====
export interface CartItem {
  id: number;
  user_id: string;
  session_id?: string;
  product_id: number;
  product: Product;
  quantity: number;
  price: number; // Price at time of adding to cart
  created_at: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  coupon?: Coupon | null;
}

export interface Coupon {
  id: number;
  code: string;
  discount: number; // porcentaje (10 = 10%) o monto fijo según type
  type: 'percentage' | 'fixed';
  description?: string;
  starts_at?: string; // ISO date
  ends_at?: string; // ISO date
  usage_limit?: number; // límite total de usos
  usage_limit_per_user?: number; // límite por usuario
  min_purchase_amount?: number; // monto mínimo para aplicar
  applicable_to?: 'all' | 'specific_products' | 'specific_categories';
  product_ids?: number[]; // si applicable_to es 'specific_products'
  category_ids?: number[]; // si applicable_to es 'specific_categories'
  is_active: boolean;
  times_used: number;
  created_at: string;
  updated_at?: string;
}

// ===== WISHLIST =====
export interface WishlistItem {
  id: number;
  product_id: number;
  product: Product;
  added_at: string;
}

// ===== ADDRESSES =====
export interface Address {
  id: number;
  user_id: string;
  type: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

// ===== ORDERS =====
export type OrderStatus = 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
export type PaymentMethod = 'tarjeta' | 'paypal' | 'transferencia';
export type PaymentStatus = 'pendiente' | 'pagado' | 'fallido' | 'reembolsado';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: string;
  user?: User;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  shipping_address: Address;
  items: OrderItem[];
  notes?: string;
  created_at: string;
  updated_at?: string;
}

// ===== REVIEWS =====
export interface Review {
  id: number;
  product_id: number;
  user_id: string;
  user?: Pick<User, 'full_name' | 'avatar_url'>;
  rating: number;
  title?: string;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
}

// ===== LOYALTY PROGRAM =====
export interface LoyaltyProgram {
  id: number;
  name: string;
  description?: string;
  points_per_purchase: number; // Points earned per unit of currency spent
  points_per_social_share: number;
  points_per_review: number;
  points_per_referral: number;
  points_expiry_days: number; // 0 = never expire
  minimum_points_for_redemption: number;
  redemption_rate: number; // Points needed for 1 unit of currency (e.g., 100 points = $1)
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserLoyalty {
  id: number;
  user_id: string;
  points_balance: number;
  points_pending: number; // Points earned but not yet available (e.g., for return period)
  points_lifetime_earned: number;
  points_lifetime_redeemed: number;
  last_activity_date: string;
  created_at: string;
  updated_at?: string;
}

export interface LoyaltyTransaction {
  id: number;
  user_id: string;
  points: number; // Positive for earning, negative for redemption
  transaction_type: 'purchase' | 'social_share' | 'review' | 'referral' | 'redemption' | 'adjustment' | 'expiry';
  description: string;
  related_id?: number; // ID of related entity (order, review, etc.)
  related_type?: string; // Type of related entity
  expires_at?: string; // Points expiration date
  created_at: string;
}

// ===== NOTIFICATIONS =====
export interface NotificationTemplate {
  id: number;
  name: string;
  description?: string;
  subject: string; // For email/SMS
  body: string; // Template content with placeholders
  type: 'email' | 'sms' | 'push' | 'in_app';
  is_active: boolean;
  variables: string[]; // List of available template variables (e.g., ['{customer_name}', '{order_number}'])
  created_at: string;
  updated_at?: string;
}

export interface Notification {
  id: number;
  user_id: string;
  template_id: number;
  recipient: string; // Email, phone number, or device token
  subject?: string; // For email notifications
  body: string; // Rendered content
  type: 'email' | 'sms' | 'push' | 'in_app';
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'read';
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  error_message?: string;
  metadata: Record<string, any>; // Additional data (order ID, etc.)
  created_at: string;
}

export interface NotificationSettings {
  id: number;
  email_from: string;
  email_from_name: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  sms_provider?: string; // 'twilio', 'nexmo', etc.
  sms_from?: string;
  push_provider?: string; // 'firebase', 'onesignal', etc.
  push_config?: Record<string, any>;
  is_email_enabled: boolean;
  is_sms_enabled: boolean;
  is_push_enabled: boolean;
  created_at: string;
  updated_at?: string;
}

// ===== AFFILIATE PROGRAM =====
export interface AffiliateProgram {
  id: number;
  name: string;
  description?: string;
  commission_type: 'percentage' | 'fixed'; // Percentage of sale or fixed amount
  commission_value: number; // Percentage (e.g., 5 for 5%) or fixed amount
  cookie_duration_days: number; // How long affiliate cookie lasts
  minimum_payout: number; // Minimum earnings before payout
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Affiliate {
  id: number;
  user_id: string; // The affiliate (referrer)
  affiliate_code: string; // Unique code for tracking
  commission_earned: number; // Total commission earned
  commission_paid: number; // Total commission paid out
  commission_pending: number; // Commission earned but not yet payable
  referral_count: number; // Number of people referred
  conversion_count: number; // Number of referred people who made a purchase
  is_active: boolean;
  joined_at: string;
  last_active_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface Referral {
  id: number;
  affiliate_id: number; // The affiliate who referred
  referred_user_id: string; // The user who was referred
  referred_email: string; // Email of referred user (for tracking if they don't have account yet)
  referred_at: string; // When the referral happened
  referred_order_id?: number; // Order ID if referral resulted in purchase
  commission_amount: number; // Commission earned from this referral
  commission_status: 'pending' | 'approved' | 'paid' | 'rejected'; // Commission status
  created_at: string;
  updated_at?: string;
}

// ===== BLOG =====
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image_url?: string;
  category: string;
  author_id?: string;
  author?: Pick<User, 'full_name' | 'avatar_url'>;
  status: 'publicado' | 'borrador' | 'archivado';
  views?: number;
  comments_count?: number;
  published_at?: string;
  created_at: string;
  updated_at?: string;
}

// ===== BANNERS =====
export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link: string;
  position: 'hero' | 'promo' | 'sidebar';
  status: 'activo' | 'inactivo';
  order: number;
  created_at: string;
}

// ===== API RESPONSES =====
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// TIPOS — PASARELA DE PAGOS STRIPE
// ============================================

/** Respuesta de la Edge Function create-checkout-session */
export interface StripeSessionResponse {
  id:    string;
  url?:  string;
}

/** Cuerpo enviado a la Edge Function create-checkout-session */
export interface CreateCheckoutBody {
  items: CheckoutItemFrontend[];
  customer_email?: string;
  metadata?:      Record<string, string>;
  success_url?:   string;
  cancel_url?:    string;
}

/** Ítem del carrito enviado a Stripe (precios en moneda, no centavos) */
export interface CheckoutItemFrontend {
  name:        string;
  description?: string;
  image?:      string;
  price:       number;
  quantity:    number;
}

/** Respuesta de la Edge Function verify-payment */
export interface VerifyPaymentResponse {
  paid:      boolean;
  orderId?:  string;
  amount?:   number;
  status?:   string;
  email?:    string;
}

/** Evento entrante del webhook de Stripe (sólo campos usados) */
export interface StripeWebhookEvent<T = unknown> {
  id:         string;
  type:       string;
  created:    number;
  data:       { object: T };
  apiVersion: string;
}

/** Sesión de Stripe (campos relevantes extraídos) */
export interface StripeCheckoutSession {
  id:                 string;
  payment_status:     string;
  amount_total:       number | null;
  metadata:           Record<string, string>;
  customer_details?:  { email?: string } | null;
}

// ============================================
// TIPOS — SUPABASE DB (genéricos)
// ============================================
export interface Database {
  public: {
    Tables: {
      profiles:    { Row: Pick<User, 'id'|'email'|'full_name'|'phone'|'avatar_url'|'role'|'created_at'> };
      categories:  { Row: Category };
      products:    { Row: Product };
      orders:      { Row: Order };
      order_items: { Row: OrderItem };
      cart_items:  { Row: CartItem };

      wishlists:   { Row: WishlistItem };
      addresses:   { Row: Address };
      reviews:     { Row: Review };
      blog_posts:  { Row: BlogPost };
      banners:     { Row: Banner };
    };
  };
}
