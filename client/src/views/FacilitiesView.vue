<script setup>
import PageHero from '../components/PageHero.vue';

const zones = [
  { title: 'Interior completo', img: 'instalaciones-interior', alt: 'Interior completo del local: nave diáfana con futbolines, hinchable y zona de mesas', text: 'Nuestro espacio principal, pensado para una gran variedad de eventos, con áreas de ocio y entretenimiento para todas las edades.', items: ['Futbolines y air hockey', 'Karaoke y juegos de mesa', 'Aforo de hasta 500 personas sentadas'] },
  { title: 'Zona cafetería', img: 'instalaciones-cafeteria', alt: 'Zona cafetería con mesas, sombrillas y barra', text: 'Un rincón cómodo y acogedor para descansar mientras los niños juegan.', items: ['Ambiente tranquilo', 'Visibilidad de las zonas de juego', 'Ideal para padres y familias'] },
  { title: 'Zona pista', img: 'instalaciones-pista', alt: 'Pista deportiva cubierta con porterías y suelo rojo y negro', text: 'Perfecta para actividades dinámicas: carreras de scooters, juegos en equipo y deporte.', items: ['Pista de fútbol de 13 × 20 m', 'Canasta y red de vóley', 'Scooters eléctricos y atracciones'] }
];

const gallery = [
  { img: 'galeria-futbolin', alt: 'Futbolín en la zona de la pista' },
  { img: 'galeria-billar', alt: 'Mesa de billar de madera' },
  { img: 'galeria-scooters', alt: 'Scooters eléctricos de colores listos para usar' },
  { img: 'galeria-banquete', alt: 'Sala preparada para un banquete con mesas largas' },
  { img: 'galeria-zona-chill', alt: 'Zona de descanso con palés y vegetación' },
  { img: 'galeria-mesas-evento', alt: 'Mesas redondas montadas para un evento' }
];
</script>

<template>
  <PageHero eyebrow="Instalaciones" title="Instalaciones pensadas para tu diversión" lead="Espacios amplios y seguros para disfrutar de eventos, cumpleaños o simplemente un buen rato con amigos y familia." />

  <section class="section">
    <div class="container grid" style="gap: 4rem">
      <article v-for="(z, i) in zones" :key="z.title" class="grid grid--2 zone" :class="{ 'zone--flip': i % 2 }">
        <img class="photo-cutout" :src="`/images/${z.img}.webp`" width="960" height="559" :alt="z.alt" loading="lazy" />
        <div>
          <h2>{{ z.title }}</h2>
          <p class="lead">{{ z.text }}</p>
          <ul class="feature-list"><li v-for="it in z.items" :key="it">{{ it }}</li></ul>
        </div>
      </article>
    </div>
  </section>

  <section class="section section--white">
    <div class="container">
      <div class="center" style="margin-bottom: 2rem">
        <span class="eyebrow">Galería</span>
        <h2>Echa un vistazo</h2>
      </div>
      <div class="gallery">
        <img v-for="g in gallery" :key="g.img" :src="`/images/${g.img}.webp`" width="500" height="500" :alt="g.alt" loading="lazy" />
      </div>
    </div>
  </section>

  <section class="section section--ink center">
    <div class="container">
      <h2>¿Quieres venir a verlo?</h2>
      <p class="lead">Reserva tu visita o consúltanos disponibilidad.</p>
      <RouterLink class="btn btn--light" to="/contacto">Contactar</RouterLink>
    </div>
  </section>
</template>
