import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productService } from '../services';
import type { Product, ProductFilters } from '../types';

// ============================================================
// HOOK: Lista de productos con filtros y paginación
// ============================================================

export const useProducts = (initialFilters: ProductFilters = {}) => {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
  };

  const changePage = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const resetFilters = () => setFilters(initialFilters);

  return {
    products:   data?.data ?? [],
    total:      data?.total ?? 0,
    page:       data?.page ?? 1,
    totalPages: data?.totalPages ?? 0,
    loading:    isLoading,
    error:      error instanceof Error ? error.message : null,
    filters,
    updateFilters,
    changePage,
    resetFilters,
    refetch,
  };
};

// ============================================================
// HOOK: Producto individual
// ============================================================

export const useProduct = (id: number | null) => {
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    product: product ?? null,
    loading: isLoading,
    error:   error instanceof Error ? error.message : null,
  };
};

// ============================================================
// HOOK: Productos destacados
// ============================================================

export const useFeaturedProducts = (limit = 8) => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['featured-products', limit],
    queryFn: () => productService.getFeaturedProducts(limit),
    staleTime: 5 * 60 * 1000,
  });

  return { products: products as Product[], loading: isLoading };
};
