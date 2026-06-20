import { useEffect } from 'react';

const SITE = 'Nến Thơm ABC';

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// Client-side SEO: title + description + Open Graph tags.
// (Đủ cho title/meta vì Google render JS; muốn SEO mạnh hơn cần SSR — xem README.)
export default function useSeo({ title, description, image, type = 'website' } = {}) {
  useEffect(() => {
    const full = title ? `${title} | ${SITE}` : SITE;
    document.title = full;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    if (image) setMeta('property', 'og:image', image);
  }, [title, description, image, type]);
}
