import { useQuery } from '@tanstack/react-query';
import { bannerService } from '../services/bannerService';
import type { Banner } from '../types';

// ============================================================
// HOOK: Banners por posición con React Query
// ============================================================

export function useBanners(position: Banner['position']) {
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners', position],
    queryFn: () => bannerService.getBannersByPosition(position),
    staleTime: 10 * 60 * 1000,
  });

  return { banners: banners as Banner[], loading: isLoading };
}
