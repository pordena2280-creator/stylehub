// ============================================================
// VALIDADORES Y FORMATEADORES
// ============================================================

/**
 * Validar email
 */
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validar teléfono (México: 10 dígitos)
 */
export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

/**
 * Validar código postal (México: 5 dígitos)
 */
export const validateZipCode = (zip: string): boolean => {
  return /^\d{5}$/.test(zip.trim());
};

/**
 * Validar contraseña (mín 8 caracteres, 1 mayúscula, 1 número)
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener mayúscula');
  }
  if (!/\d/.test(password)) {
    errors.push('Debe contener número');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Debe contener símbolo especial (!@#$%^&*)');
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Validar que los campos requeridos no estén vacíos
 */
export const validateRequired = (fields: Record<string, any>): { valid: boolean; missing: string[] } => {
  const missing = Object.entries(fields)
    .filter(([_, value]) => !value || (typeof value === 'string' && !value.trim()))
    .map(([key]) => key);
  
  return { valid: missing.length === 0, missing };
};

/**
 * Validar número de tarjeta (Luhn algorithm)
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Validar formato de URL
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validar nombre (solo letras y espacios)
 */
export const validateName = (name: string, minLength = 2): boolean => {
  return /^[a-záéíóúñ\s]{2,}$/i.test(name) && name.length >= minLength;
};

/**
 * Validar dirección (permite números, letras, puntuación común)
 */
export const validateAddress = (address: string): boolean => {
  return address.trim().length >= 5 && /^[a-záéíóúñ0-9\s,#.-]{5,}$/i.test(address);
};

/**
 * Validar ciudad/estado
 */
export const validateCity = (city: string): boolean => {
  return /^[a-záéíóúñ\s]{2,}$/i.test(city) && city.length >= 2;
};

/**
 * Validar rango de precio
 */
export const validatePriceRange = (min: number, max: number): boolean => {
  return min >= 0 && max >= 0 && min <= max;
};
