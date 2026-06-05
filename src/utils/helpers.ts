// ============================================================
// HELPERS Y FUNCIONES AUXILIARES
// ============================================================

/**
 * Esperar X milisegundos (útil para testing o debounce)
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Debounce function para limitar ejecución de funciones
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
let timeoutId: ReturnType<typeof setTimeout> | undefined;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle function para limitar frecuencia de ejecución
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let lastRun = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun >= limit) {
      fn(...args);
      lastRun = now;
    }
  };
};

/**
 * Generar UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Generar ID aleatorio corto (para session ids, etc)
 */
export const generateShortId = (length: number = 8): string => {
  return Math.random().toString(36).substring(2, 2 + length);
};

/**
 * Deep clone de objetos/arrays
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * Merge de objetos (shallow)
 */
export const mergeObjects = <T extends Record<string, any>>(
  ...objects: Partial<T>[]
): T => {
  return Object.assign({}, ...objects) as T;
};

/**
 * Filtrar propiedades vacías de un objeto
 */
export const filterEmptyProps = <T extends Record<string, any>>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined && value !== '')
  ) as Partial<T>;
};

/**
 * Obtener diferencia entre dos objetos
 */
export const getDiff = <T extends Record<string, any>>(obj1: T, obj2: T): Partial<T> => {
  const diff = {} as Partial<T>;
  for (const key in obj2) {
    if (obj1[key] !== obj2[key]) {
      diff[key] = obj2[key];
    }
  }
  return diff;
};

/**
 * Agrupar array por propiedad
 */
export const groupBy = <T extends Record<string, any>>(
  array: T[],
  key: keyof T
): Record<string, T[]> => {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

/**
 * Ordenar array de objetos
 */
export const sortBy = <T extends Record<string, any>>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Eliminar duplicados de array
 */
export const removeDuplicates = <T>(array: T[], key?: (item: T) => any): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const identifier = key ? key(item) : item;
    if (seen.has(identifier)) return false;
    seen.add(identifier);
    return true;
  });
};

/**
 * Paginación de array
 */
export const paginate = <T>(
  array: T[],
  page: number,
  pageSize: number
): { items: T[]; total: number; pages: number; currentPage: number } => {
  const total = array.length;
  const pages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    items: array.slice(start, end),
    total,
    pages,
    currentPage: page,
  };
};

/**
 * Buscar en array de objetos (simple)
 */
export const search = <T extends Record<string, any>>(
  array: T[],
  query: string,
  fields: (keyof T)[]
): T[] => {
  const q = query.toLowerCase();
  return array.filter(item =>
    fields.some(field =>
      String(item[field]).toLowerCase().includes(q)
    )
  );
};

/**
 * Flatten array anidado
 */
export const flatten = <T>(array: Array<T | T[]>): T[] => {
  return array.reduce<T[]>((acc, item) => {
    if (Array.isArray(item)) {
      acc.push(...flatten(item));
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
};

/**
 * Convertir array a objeto (key-value)
 */
export const arrayToObject = <T extends Record<string, any>>(
  array: T[],
  key: keyof T
): Record<string, T> => {
  return array.reduce((acc, item) => {
    acc[String(item[key])] = item;
    return acc;
  }, {} as Record<string, T>);
};

/**
 * Crear rango de números
 */
export const range = (start: number, end: number, step: number = 1): number[] => {
  const result = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
};

/**
 * Comparar dos arrays (ignorar orden)
 */
export const arraysEqual = <T>(arr1: T[], arr2: T[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((val, idx) => val === sorted2[idx]);
};

/**
 * Sumar valores de array de objetos
 */
export const sum = <T extends Record<string, any>>(
  array: T[],
  key: keyof T
): number => {
  return array.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);
};

/**
 * Calcular promedio
 */
export const average = <T extends Record<string, any>>(
  array: T[],
  key: keyof T
): number => {
  if (array.length === 0) return 0;
  return sum(array, key) / array.length;
};

/**
 * Encontrar min y max
 */
export const minmax = <T extends Record<string, any>>(
  array: T[],
  key: keyof T
): { min: number; max: number } => {
  const values = array.map(item => Number(item[key]));
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
};

/**
 * Copiar texto al clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback para navegadores antiguos
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
};

/**
 * Descargar archivo
 */
export const downloadFile = (content: string, filename: string, type: string = 'text/plain'): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Parsear query string
 */
export const parseQueryString = (queryString: string): Record<string, string> => {
  const params = new URLSearchParams(queryString);
  const obj: Record<string, string> = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

/**
 * Crear query string desde objeto
 */
export const createQueryString = (obj: Record<string, any>): string => {
  return Object.entries(obj)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
};

/**
 * Hacer request con retry
 */
export const fetchWithRetry = async (
  url: string,
  options?: RequestInit,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<Response> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status === 429 || response.status >= 500) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(delay * Math.pow(2, i)); // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded');
};

/**
 * Validar contraseña fuerte
 */
export const isStrongPassword = (password: string): { strong: boolean; score: number } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;
  
  return { strong: score >= 4, score };
};
