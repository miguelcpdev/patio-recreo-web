<script setup>
import { ref, onMounted } from 'vue';
import PageHero from '../components/PageHero.vue';
import { api } from '../api.js';

const testimonials = ref([]);
onMounted(async () => (testimonials.value = await api('/testimonials').catch(() => [])));
</script>

<template>
  <PageHero eyebrow="Conócenos" title="La inspiración detrás de El Patio de Mi Recreo" lead="Nuestra pasión por crear experiencias inolvidables." />
  <section class="section">
    <div class="container grid grid--2">
      <div class="prose">
        <h2>Nuestra historia</h2>
        <p>La idea surgió de un deseo compartido: ofrecer un lugar donde la diversión y el aprendizaje se fusionaran en experiencias inolvidables. Inspirados por la comunidad y la pasión por el ocio, el turismo, la cultura y el deporte, convertimos ese sueño en realidad.</p>
        <p>Creemos en la conexión humana y en celebrar la vida a través del entretenimiento. Buscamos un espacio inclusivo donde personas de todas las edades y orígenes puedan reunirse, aprender y celebrar.</p>
        <p>Trabajamos para ofrecer actividades emocionantes, eventos únicos y un ambiente acogedor que refleja nuestra pasión por el ocio y la cultura.</p>
      </div>
      <div class="card card--tint">
        <h2>Nuestro equipo, tu sonrisa</h2>
        <p>Detrás de cada experiencia hay un equipo apasionado y comprometido: desde expertos en eventos hasta instructores dedicados. Nuestra diversidad es nuestra fuerza, y nos une una visión común: que tu sonrisa sea nuestra mayor recompensa.</p>
      </div>
    </div>
  </section>
  <section v-if="testimonials.length" class="section section--white">
    <div class="container">
      <h2 class="center">Qué opinan nuestros clientes</h2>
      <div class="grid grid--3" style="margin-top: 1.5rem">
        <figure v-for="t in testimonials" :key="t.id" class="card" style="margin: 0">
          <div class="stars" :aria-label="`${t.rating} de 5`">{{ '★'.repeat(t.rating) }}</div>
          <blockquote class="quote" style="margin: .5rem 0">“{{ t.text }}”</blockquote>
          <figcaption class="muted">— {{ t.author }}</figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
