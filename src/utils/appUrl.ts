/**
 * Origen de la app para OAuth, emails y Stripe.
 * En producción define VITE_APP_URL=https://tudominio.com
 */
export function getAppOrigin(): string {
  const envUrl = import.meta.env.VITE_APP_URL as string | undefined;
  if (envUrl?.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

export function appPath(path: string): string {
  const origin = getAppOrigin();
  const p = path.startsWith('/') ? path : `/${path}`;
  return origin ? `${origin}${p}` : p;
}
