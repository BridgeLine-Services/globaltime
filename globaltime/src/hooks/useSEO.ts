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

function getMeta(name: string, attr: 'name' | 'property' = 'name'): string {
  return document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)?.content ?? '';
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
    const prevDescription    = getMeta('description');
    const prevRobots         = getMeta('robots');
    const prevCanonical      = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? '';
    const prevOgTitle        = getMeta('og:title',       'property');
    const prevOgDescription  = getMeta('og:description', 'property');
    const prevOgUrl          = getMeta('og:url',         'property');
    const prevOgImage        = getMeta('og:image',       'property');
    const prevTwitterTitle   = getMeta('twitter:title');
    const prevTwitterDesc    = getMeta('twitter:description');
    const prevTwitterImage   = getMeta('twitter:image');
    const prevTwitterAlt     = getMeta('twitter:image:alt');

    document.title = title;

    setMeta('description', description);
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    setLink('canonical', canonical);

    // Open Graph
    setMeta('og:title',        ogTitle       ?? title,       'property');
    setMeta('og:description',  ogDescription ?? description, 'property');
    setMeta('og:url',          canonical,                    'property');
    setMeta('og:image',        ogImage,                      'property');
    setMeta('og:image:width',  '1200',                       'property');
    setMeta('og:image:height', '630',                        'property');
    setMeta('og:image:type',   'image/png',                  'property');

    // Twitter / X
    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:title',       ogTitle       ?? title);
    setMeta('twitter:description', ogDescription ?? description);
    setMeta('twitter:image',       ogImage);
    setMeta('twitter:image:alt',   ogTitle ?? title);

    if (structuredData) {
      setStructuredData('page-ld-json', structuredData);
    }

    return () => {
      document.title = prevTitle;
      if (prevDescription)   setMeta('description',    prevDescription);
      if (prevRobots)        setMeta('robots',          prevRobots);
      if (prevCanonical)     setLink('canonical',       prevCanonical);
      if (prevOgTitle)       setMeta('og:title',        prevOgTitle,       'property');
      if (prevOgDescription) setMeta('og:description',  prevOgDescription, 'property');
      if (prevOgUrl)         setMeta('og:url',          prevOgUrl,         'property');
      if (prevOgImage)       setMeta('og:image',        prevOgImage,       'property');
      if (prevTwitterTitle)  setMeta('twitter:title',   prevTwitterTitle);
      if (prevTwitterDesc)   setMeta('twitter:description', prevTwitterDesc);
      if (prevTwitterImage)  setMeta('twitter:image',   prevTwitterImage);
      if (prevTwitterAlt)    setMeta('twitter:image:alt', prevTwitterAlt);
      removeScript('page-ld-json');
    };
  }, [title, description, canonical, ogTitle, ogDescription, ogImage, noindex]);
}
