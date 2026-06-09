// useSEO — sets <title>, <meta description>, <link rel="canonical">,
// and Open Graph tags dynamically per page.
// All tags are restored/removed cleanly when the component unmounts.

import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
  structuredData?: object | object[];
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function removeScript(id: string) {
  document.getElementById(id)?.remove();
}

function setStructuredData(id: string, data: object | object[]) {
  removeScript(id);
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(Array.isArray(data) ? data : [data]);
  document.head.appendChild(script);
}

export function useSEO({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = 'https://globaltime-pi.vercel.app/og-image.png',
  noindex = false,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    const prevTitle = document.title;

    document.title = title;

    setMeta('description', description);
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    setLink('canonical', canonical);

    // Open Graph
    setMeta('og:title',       ogTitle       ?? title,       'property');
    setMeta('og:description', ogDescription ?? description, 'property');
    setMeta('og:url',         canonical,                    'property');
    setMeta('og:image',       ogImage,                      'property');
    setMeta('og:image:width',  '1200',                      'property');
    setMeta('og:image:height', '630',                       'property');
    setMeta('og:image:type',   'image/png',                 'property');

    // Twitter
    setMeta('twitter:title',       ogTitle       ?? title,       'name');
    setMeta('twitter:description', ogDescription ?? description, 'name');
    setMeta('twitter:image',       ogImage,                      'name');
    setMeta('twitter:image:alt',   ogTitle ?? title,             'name');

    if (structuredData) {
      setStructuredData('page-ld-json', structuredData);
    }

    return () => {
      document.title = prevTitle;
      removeScript('page-ld-json');
    };
  }, [title, description, canonical, ogTitle, ogDescription, ogImage, noindex]);
}
