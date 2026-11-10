import { SITE } from './site.js';

function setMeta(name, content, attr = 'name') {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Actualiza title, description, canonical, Open Graph y JSON-LD. */
export function applySeo({ title, description, path = '/', jsonld = [] }) {
  const url = SITE.url + path;
  document.title = title;
  setMeta('description', description);
  setMeta('og:title', title, 'property');
  setMeta('og:description', description, 'property');
  setMeta('og:url', url, 'property');
  setMeta('og:type', 'website', 'property');
  setMeta('og:image', `${SITE.url}/images/local-eventos.webp`, 'property');
  setMeta('og:locale', 'es_ES', 'property');
  setMeta('twitter:card', 'summary');

  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;

  document.head.querySelectorAll('script[data-jsonld]').forEach((n) => n.remove());
  for (const data of [businessSchema(), ...jsonld]) {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.dataset.jsonld = '';
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }
}

export function businessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EntertainmentBusiness',
    '@id': `${SITE.url}/#business`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: `${SITE.url}/images/logo.png`,
    image: [`${SITE.url}/images/local-eventos.webp`, `${SITE.url}/images/instalaciones-interior.webp`],
    telephone: SITE.phoneIntl,
    email: SITE.email,
    description: 'Centro de ocio de 2.000 m² en Narón con cumpleaños infantiles, eventos, alquiler de atracciones y equipamiento.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      postalCode: SITE.address.postalCode,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country
    },
    areaServed: ['Narón', 'Ferrol', 'A Coruña'],
    priceRange: '€€'
  };
}

export const breadcrumb = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: SITE.url + it.path
  }))
});

export const faqSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer }
  }))
});

export const eventSchema = (ev) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: ev.title,
  description: ev.description,
  startDate: ev.startsAt,
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: SITE.name,
    address: { '@type': 'PostalAddress', streetAddress: SITE.address.street, addressLocality: SITE.address.city, postalCode: SITE.address.postalCode, addressCountry: 'ES' }
  },
  offers: {
    '@type': 'Offer',
    price: (ev.priceCents / 100).toFixed(2),
    priceCurrency: 'EUR',
    availability: ev.remaining > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    url: `${SITE.url}/eventos#${ev.slug}`
  },
  organizer: { '@type': 'Organization', name: SITE.legalName, url: SITE.url }
});
