import { useState } from 'react';

// ============================================
// HOOK: localStorage con estado reactivo
// ============================================

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('useLocalStorage error:', error);
    }
  };

  const removeValue = () => {
    localStorage.removeItem(key);
    setStoredValue(initialValue);
  };

  return [storedValue, setValue, removeValue] as const;
};
