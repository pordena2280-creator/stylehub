import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services';

// ============================================================
// HOOK: Categorías con React Query
// ============================================================

export const useCategories = (onlyActive = true) => {
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories', onlyActive],
    queryFn: () => onlyActive
      ? categoryService.getCategories()
      : categoryService.getAllCategories(),
    staleTime: 10 * 60 * 1000,  // 10 min — cambian con menos frecuencia
  });

  return {
    categories,
    loading: isLoading,
    error:   error instanceof Error ? error.message : null,
  };
};
