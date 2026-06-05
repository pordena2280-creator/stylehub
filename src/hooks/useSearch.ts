import { useState, useCallback } from 'react';
import { productService } from '../services';
import { useDebounce } from './useDebounce';
import type { Product } from '../types';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 350);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setResults([]); return; }
    try {
      setLoading(true);
      const data = await productService.searchProducts(q, 8);
      setResults(data);
      setOpen(true);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  // Auto-search when debounced query changes
  useState(() => { search(debouncedQuery); });

  const handleChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) { setResults([]); setOpen(false); }
  };

  const clear = () => { setQuery(''); setResults([]); setOpen(false); };

  return { query, results, loading, open, setOpen, handleChange, clear, search };
};
