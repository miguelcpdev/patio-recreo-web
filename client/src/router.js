import { createRouter, createWebHistory } from 'vue-router';
import { applySeo, breadcrumb } from './seo.js';

const routes = [
  {
    path: '/', component: () => import('./views/HomeView.vue'),
    meta: { title: 'El Patio de mi Recreo | Tu Centro de Ocio en Narón', description: 'El Patio de Mi Recreo: 2.000 m² de ocio en Narón con eventos, cultura, deporte y turismo. Celebra cumpleaños y experiencias únicas en Galicia.' }
  },
  {
    path: '/instalaciones', component: () => import('./views/FacilitiesView.vue'),
    meta: { title: 'Instalaciones en Narón | El Patio de mi Recreo', description: 'Interior completo, zona cafetería y pista: 2.000 m² seguros para cumpleaños, eventos y ratos en familia en Narón.', crumb: 'Instalaciones' }
  },
  {
    path: '/alquiler', component: () => import('./views/RentalsView.vue'),
    meta: { title: 'Alquiler de hinchables y atracciones en Narón | El Patio de mi Recreo', description: 'Alquila food truck, hinchables, atracciones, fotomatón, karaoke y mobiliario para tu evento dentro o fuera de nuestras instalaciones.', crumb: 'Alquiler' }
  },
  {
    path: '/cumpleanos-infantiles', component: () => import('./views/BirthdaysView.vue'),
    meta: { title: 'Cumpleaños infantiles en Narón | El Patio de mi Recreo', description: 'Cumpleaños infantiles desde 300 € hasta 15 niñ@s: espacio exclusivo, ocio y merienda. Reserva fecha y calcula tu presupuesto online.', crumb: 'Cumpleaños infantiles' }
  },
  {
    path: '/eventos', component: () => import('./views/EventsView.vue'),
    meta: { title: 'Eventos en Narón: privados, programados y externos | El Patio de mi Recreo', description: 'Bodas, comuniones, cenas baile, monólogos, conciertos y campamentos. Aforo de hasta 500 personas sentadas. Reserva tus entradas.', crumb: 'Eventos' }
  },
  {
    path: '/sobre-nosotros', component: () => import('./views/AboutView.vue'),
    meta: { title: 'Conócenos | El Patio de mi Recreo', description: 'La historia y la filosofía de El Patio de Mi Recreo: ocio, cultura, deporte y turismo para todas las edades en Narón.', crumb: 'Conócenos' }
  },
  {
    path: '/contacto', component: () => import('./views/ContactView.vue'),
    meta: { title: 'Contacto | El Patio de mi Recreo', description: 'Llámanos al 691 79 39 56 o escríbenos. Av. Arrieiros, 15540 Narón, A Coruña.', crumb: 'Contacto' }
  },
  { path: '/aviso-legal', component: () => import('./views/LegalView.vue'), props: { doc: 'aviso-legal' }, meta: { title: 'Aviso legal | El Patio de mi Recreo', description: 'Aviso legal de El Patio de mi recreo de Narón, S.L.', noindex: true } },
  { path: '/politica-privacidad', component: () => import('./views/LegalView.vue'), props: { doc: 'privacidad' }, meta: { title: 'Política de privacidad | El Patio de mi Recreo', description: 'Cómo tratamos tus datos personales.', noindex: true } },
  { path: '/politica-cookies', component: () => import('./views/LegalView.vue'), props: { doc: 'cookies' }, meta: { title: 'Política de cookies | El Patio de mi Recreo', description: 'Información sobre las cookies que usamos.', noindex: true } },
  { path: '/declaracion-accesibilidad', component: () => import('./views/LegalView.vue'), props: { doc: 'accesibilidad' }, meta: { title: 'Declaración de accesibilidad | El Patio de mi Recreo', description: 'Compromiso de accesibilidad de este sitio web.', noindex: true } },
  { path: '/admin', component: () => import('./views/AdminView.vue'), meta: { title: 'Panel | El Patio de mi Recreo', description: 'Panel de administración', noindex: true, admin: true } },
  { path: '/:pathMatch(.*)*', component: () => import('./views/NotFoundView.vue'), meta: { title: 'Página no encontrada', description: 'La página no existe.', noindex: true } }
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, _from, saved) => saved || (to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 })
});

router.afterEach((to) => {
  const { title, description, crumb, noindex } = to.meta;
  const jsonld = crumb ? [breadcrumb([{ name: 'Inicio', path: '/' }, { name: crumb, path: to.path }])] : [];
  applySeo({ title, description, path: to.path === '/' ? '/' : to.path, jsonld });
  let robots = document.head.querySelector('meta[name="robots"]');
  if (noindex) {
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex, nofollow';
  } else robots?.remove();
});
