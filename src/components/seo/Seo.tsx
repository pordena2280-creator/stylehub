import { useEffect } from 'react';

// ============================================================
// COMPONENTE SEO — maneja <head> via DOM directo (sin dependencias)
// Soporta: title, description, Open Graph, Twitter Cards,
//          canonical, robots, JSON-LD (Product, BreadcrumbList)
// ============================================================

export interface SeoBreadcrumb {
  name: string;
  url: string;
}

export interface SeoProductData {
  price: number;
  currency?: string;
  sku?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: number;
  reviewCount?: number;
  brand?: string;
}

export type SeoProps = {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  imageUrl?: string;
  ogType?: 'website' | 'product' | 'article';
  robots?: string;
  /** Datos de producto para JSON-LD Product schema */
  product?: SeoProductData;
  /** Breadcrumbs para JSON-LD BreadcrumbList */
  breadcrumbs?: SeoBreadcrumb[];
};

    const APP_URL = import.meta.env.VITE_APP_URL || 'https://stylehub-2.vercel.app';

// Helpers para manipular el <head> sin dependencias externas
const setMeta = (selector: string, attr: string, value: string) => {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    const [attrName, attrVal] = selector.replace(/[\[\]']/g, '').split('=');
    el.setAttribute(attrName, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const setLink = (rel: string, href: string) => {
  let el = document.head.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const setJsonLd = (id: string, data: object) => {
  let el = document.head.querySelector(`script#${id}`) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
};

const removeJsonLd = (id: string) => {
  const el = document.head.querySelector(`script#${id}`);
  if (el) el.remove();
};

export default function Seo({
  title,
  description,
  canonicalUrl,
  imageUrl,
  ogType = 'website',
  robots = 'index,follow',
  product,
  breadcrumbs,
}: SeoProps) {
  useEffect(() => {
    const siteTitle = 'StyleHub';
    const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} — E-Commerce Profesional`;
    const canonical = canonicalUrl || window.location.href;
    const image = imageUrl || `${APP_URL}/images/og-default.jpg`;

    // Title
    document.title = fullTitle;

    // Basic meta
    if (description) setMeta("meta[name='description']", 'content', description);
    setMeta("meta[name='robots']", 'content', robots);

    // Open Graph
    setMeta("meta[property='og:title']",       'content', fullTitle);
    setMeta("meta[property='og:type']",         'content', ogType);
    setMeta("meta[property='og:url']",          'content', canonical);
    setMeta("meta[property='og:image']",        'content', image);
    setMeta("meta[property='og:site_name']",    'content', siteTitle);
    if (description) setMeta("meta[property='og:description']", 'content', description);

    // Twitter Cards
    setMeta("meta[name='twitter:card']",        'content', 'summary_large_image');
    setMeta("meta[name='twitter:title']",       'content', fullTitle);
    setMeta("meta[name='twitter:image']",       'content', image);
    if (description) setMeta("meta[name='twitter:description']", 'content', description);

    // Canonical
    setLink('canonical', canonical);

    // JSON-LD: Product schema
    if (product) {
      setJsonLd('ld-product', {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: title,
        description,
        image,
        sku: product.sku,
        brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency || 'MXN',
          availability: `https://schema.org/${product.availability || 'InStock'}`,
          url: canonical,
        },
        aggregateRating: product.rating && product.reviewCount ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
        } : undefined,
      });
    } else {
      removeJsonLd('ld-product');
    }

    // JSON-LD: BreadcrumbList
    if (breadcrumbs && breadcrumbs.length > 0) {
      setJsonLd('ld-breadcrumb', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: crumb.name,
          item: crumb.url.startsWith('http') ? crumb.url : `${APP_URL}${crumb.url}`,
        })),
      });
    } else {
      removeJsonLd('ld-breadcrumb');
    }
  }, [title, description, canonicalUrl, imageUrl, ogType, robots, product, breadcrumbs]);

  return null;
}
