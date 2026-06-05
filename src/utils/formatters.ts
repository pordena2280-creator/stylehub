// ============================================================
// FORMATEADORES Y UTILIDADES
// ============================================================

/**
 * Formatear número a moneda MXN (Peso Mexicano)
 */
export const formatCurrency = (amount: number, currency = 'MXN', locale = 'es-MX'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Formatear número con separador de miles
 */
export const formatNumber = (num: number, decimals = 0): string => {
  return num.toLocaleString('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Formatear fecha a string legible
 */
export const formatDate = (date: Date | string, locale = 'es-MX'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formatear fecha y hora
 */
export const formatDateTime = (date: Date | string, locale = 'es-MX'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatear tiempo relativo (ej: "hace 2 horas")
 */
export const formatTimeAgo = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  const intervals: { label: string; seconds: number }[] = [
    { label: 'año', seconds: 31536000 },
    { label: 'mes', seconds: 2592000 },
    { label: 'semana', seconds: 604800 },
    { label: 'día', seconds: 86400 },
    { label: 'hora', seconds: 3600 },
    { label: 'minuto', seconds: 60 },
  ];
  
  for (const { label, seconds: sec } of intervals) {
    const interval = Math.floor(seconds / sec);
    if (interval >= 1) {
      return `hace ${interval} ${label}${interval > 1 ? 's' : ''}`;
    }
  }
  
  return 'hace unos segundos';
};

/**
 * Formatear teléfono (México): +52 (XX) XXXX-XXXX
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `+52 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('52')) {
    return `+52 (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
  }
  
  return phone;
};

/**
 * Formatear código postal (México): XXXXX
 */
export const formatZipCode = (zip: string): string => {
  return zip.replace(/\D/g, '').slice(0, 5);
};

/**
 * Truncar texto con ellipsis
 */
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}...`;
};

/**
 * Capitalizar primera letra
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Convertir a slug (url-friendly)
 */
export const toSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Ocultar datos sensibles (tarjeta, email)
 */
export const maskSensitive = (value: string, showFirst = 4, showLast = 4): string => {
  if (value.length <= showFirst + showLast) return value;
  const masked = '*'.repeat(Math.max(1, value.length - showFirst - showLast));
  return value.slice(0, showFirst) + masked + value.slice(-showLast);
};

/**
 * Formatear número de tarjeta: XXXX XXXX XXXX XXXX
 */
export const formatCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  return cleaned.replace(/(\d{4})/g, '$1 ').trim();
};

/**
 * Formatear SKU
 */
export const formatSKU = (sku: string): string => {
  return sku.toUpperCase().replace(/\s+/g, '-');
};

/**
 * Obtener iniciales de un nombre
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Formatear porcentaje
 */
export const formatPercent = (value: number, decimals = 0): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Formatear peso/tamaño de archivo
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Formatear duración en milisegundos a string legible
 */
export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
};
