// ============================================================
// UTILIDADES CENTRALIZADAS — Re-exportar todos los módulos
// ============================================================

// Formateadores
export * from './formatters';

// Validadores
export * from './validators';

// Constantes
export * from './constants';

// Helpers y funciones auxiliares
export * from './helpers';

// App URL utilities (si existen)
export * from './appUrl';

export const formatDateTime = (dateStr: string): string => {

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

export const formatDateShort = (dateStr: string): string => {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

export const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Ahora mismo';
  if (mins < 60)  return `Hace ${mins} min`;
  if (hours < 24) return `Hace ${hours} h`;
  if (days < 7)   return `Hace ${days} días`;
  return formatDateShort(dateStr);
};

// ===== SLUGIFY =====
export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // quitar acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

// ===== TRUNCAR TEXTO =====
export const truncate = (text: string, maxLength: number): string =>
  text.length <= maxLength ? text : text.slice(0, maxLength).trimEnd() + '…';

// ===== DESCUENTO =====
export const calcDiscount = (price: number, oldPrice: number): number =>
  Math.round(((oldPrice - price) / oldPrice) * 100);

// ===== RATING STARS =====
export const getRatingStars = (rating: number): { full: number; half: boolean; empty: number } => {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return { full, half, empty };
};

// ===== VALIDAR EMAIL =====
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ===== GENERAR SKU =====
export const generateSKU = (name: string): string => {
  const words = name.toUpperCase().split(' ').slice(0, 3);
  const abbr  = words.map(w => w.slice(0, 3)).join('-');
  const rand  = Math.floor(Math.random() * 900 + 100);
  return `${abbr}-${rand}`;
};

// ===== NÚMERO DE ORDEN =====
export const generateOrderNumber = (): string => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `ORD-${y}${m}${d}-${rand}`;
};

// ===== CLASES CSS CONDICIONALES =====
export const cx = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ');

// ===== SCROLL TO TOP =====
export const scrollToTop = (smooth = true): void => {
  window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
};

// ===== SCROLL TO ELEMENT =====
export const scrollToElement = (id: string): void => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ===== STORAGE HELPERS =====
export const storage = {
  get: <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : fallback;
    } catch { return fallback; }
  },
  set: <T>(key: string, value: T): void => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  },
  remove: (key: string): void => {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  },
};

// ===== DEBOUNCE FUNCTION =====
export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// ===== CAPITALIZE =====
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// ===== RANGE =====
export const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

// ===== CHUNK ARRAY =====
export const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

// ===== UNIQUE BY KEY =====
export const uniqueBy = <T>(arr: T[], key: keyof T): T[] => {
  const seen = new Set();
  return arr.filter(item => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
};

// ===== SORT BY KEY =====
export const sortBy = <T>(arr: T[], key: keyof T, dir: 'asc' | 'desc' = 'asc'): T[] =>
  [...arr].sort((a, b) => {
    if (a[key] < b[key]) return dir === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return dir === 'asc' ? 1 : -1;
    return 0;
  });

// ===== COPY TO CLIPBOARD =====
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// ===== IMAGEN FALLBACK =====
export const getImageFallback = (type: 'product' | 'blog' | 'avatar' = 'product'): string => {
  const fallbacks = {
    product: 'https://placehold.co/400x400/f5f5f5/909090?text=Producto',
    blog:    'https://placehold.co/800x400/f5f5f5/909090?text=Blog',
    avatar:  'https://placehold.co/100x100/333e48/ffffff?text=U',
  };
  return fallbacks[type];
};
