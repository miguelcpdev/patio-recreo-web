<script setup>
import PageHero from '../components/PageHero.vue';

const zones = [
  { title: 'Interior completo', img: 'interior-sala', text: 'Nuestro espacio principal, pensado para una gran variedad de eventos, con áreas de ocio y entretenimiento para todas las edades.', c1: '#ff5a5f', c2: '#ffa24d', items: ['Futbolines y air hockey', 'Karaoke y juegos de mesa', 'Aforo de hasta 500 personas sentadas'] },
  { title: 'Zona cafetería', text: 'Un rincón cómodo y acogedor para descansar mientras los niños juegan.', c1: '#2ec4b6', c2: '#1b8a9c', items: ['Ambiente tranquilo', 'Visibilidad de las zonas de juego', 'Ideal para padres y familias'] },
  { title: 'Zona pista', text: 'Perfecta para actividades dinámicas: carreras de scooters, juegos en equipo y deporte.', c1: '#6c5ce7', c2: '#a29bfe', items: ['Pista de fútbol de 13 × 20 m', 'Canasta y red de vóley', 'Scooters eléctricos y atracciones'] }
];
</script>

<template>
  <PageHero eyebrow="Instalaciones" title="Instalaciones pensadas para tu diversión" lead="Espacios amplios y seguros para disfrutar de eventos, cumpleaños o simplemente un buen rato con amigos y familia." />
  <section class="section">
    <div class="container grid" style="gap: 3rem">
      <article v-for="(z, i) in zones" :key="z.title" class="grid grid--2" style="align-items: center">
        <img v-if="z.img" class="photo" :style="{ order: i % 2 ? 2 : 0, maxWidth: '260px', margin: '0 auto', borderRadius: '50%' }" :src="`/images/${z.img}.webp`" width="240" height="240" :alt="`Foto de ${z.title.toLowerCase()}`" loading="lazy" />
        <div v-else class="tile" :style="{ '--c1': z.c1, '--c2': z.c2, order: i % 2 ? 2 : 0 }">{{ z.title }}</div>
        <div>
          <h2>{{ z.title }}</h2>
          <p class="lead">{{ z.text }}</p>
          <ul class="feature-list"><li v-for="it in z.items" :key="it">{{ it }}</li></ul>
        </div>
      </article>
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
