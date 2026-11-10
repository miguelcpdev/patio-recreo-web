export const SITE = {
  name: 'El Patio de mi Recreo',
  legalName: 'El Patio de mi recreo de Narón, S.L.',
  url: 'https://elpatiodemirecreo.com',
  phone: '691 79 39 56',
  phoneIntl: '+34691793956',
  email: 'elpatiodemirecreo@hotmail.com',
  address: { street: 'Av. Arrieiros', postalCode: '15540', city: 'Narón', region: 'A Coruña', country: 'ES' },
  addressLine: 'Av. Arrieiros, 15540 Narón, A Coruña',
  whatsapp: 'https://wa.me/34691793956',
  mapsQuery: 'Av. Arrieiros, 15540 Narón, A Coruña'
};

export const NAV = [
  { to: '/', label: 'Inicio' },
  { to: '/instalaciones', label: 'Instalaciones' },
  { to: '/alquiler', label: 'Alquiler' },
  { to: '/cumpleanos-infantiles', label: 'Cumpleaños' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/sobre-nosotros', label: 'Conócenos' },
  { to: '/contacto', label: 'Contacto' }
];

export const eur = (cents) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
