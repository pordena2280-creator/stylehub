import { useState, useEffect } from 'react';

// ============================================
// HOOK: Debounce para búsquedas
// ============================================

export const useDebounce = <T>(value: T, delay = 400): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

