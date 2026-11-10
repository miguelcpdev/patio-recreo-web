<script setup>
import ContactForm from '../components/ContactForm.vue';
import FaqList from '../components/FaqList.vue';
import MapEmbed from '../components/MapEmbed.vue';
import { SITE } from '../site.js';

const reasons = [
  '2.000 m² de instalaciones equipadas',
  'Experiencias únicas en Galicia',
  'Diseño de eventos a medida',
  'Especialistas en cumpleaños infantiles',
  'Plataforma de venta de entradas'
];
const eventTypes = [
  { title: 'Eventos privados', text: 'Cumpleaños, bodas, bautizos, comuniones, despedidas y team building en un espacio solo para ti.', c1: '#ff5a5f', c2: '#ffa24d' },
  { title: 'Eventos programados', text: 'Cenas baile, monólogos, conciertos, ferias, deporte y campamentos durante todo el año.', c1: '#2ec4b6', c2: '#1b8a9c' },
  { title: 'Eventos externos', text: 'Llevamos la diversión a parques, espacios públicos o donde tú elijas.', c1: '#6c5ce7', c2: '#a29bfe' }
];
</script>

<template>
  <section class="hero">
    <div class="container">
      <span class="eyebrow">Centro de ocio en Narón</span>
      <h1>El Patio de Mi Recreo:<br /><span>tu centro de ocio en Narón</span></h1>
      <p class="lead" style="max-width: 56ch">
        Descubre la diversión en un espacio de 2.000 m² dedicados al ocio, la cultura, el deporte y el turismo. Bienvenido a tu destino de entretenimiento.
      </p>
      <div class="hero-actions">
        <RouterLink class="btn" to="/cumpleanos-infantiles">Reserva tu cumpleaños</RouterLink>
        <RouterLink class="btn btn--light" to="/eventos">Próximos eventos</RouterLink>
      </div>
      <div class="stat-row">
        <div class="stat"><strong>2.000 m²</strong><span>de instalaciones</span></div>
        <div class="stat"><strong>500</strong><span>personas sentadas</span></div>
        <div class="stat"><strong>13 × 20 m</strong><span>pista de fútbol</span></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container grid grid--2" style="align-items: center">
      <div>
        <span class="eyebrow">Por qué elegirnos</span>
        <h2>¿Por qué somos el espacio ideal para tu celebración en Narón?</h2>
        <ul class="feature-list">
          <li v-for="r in reasons" :key="r">{{ r }}</li>
        </ul>
      </div>
      <div class="grid" style="grid-template-columns: 1fr 1fr">
        <div class="tile" style="--c1: #ff5a5f; --c2: #ffa24d">Ocio</div>
        <div class="tile" style="--c1: #2ec4b6; --c2: #1b8a9c">Deporte</div>
        <div class="tile" style="--c1: #6c5ce7; --c2: #a29bfe">Cultura</div>
        <div class="tile" style="--c1: #ffc233; --c2: #ff9f1c; color: var(--ink)">Turismo</div>
      </div>
    </div>
  </section>

  <section class="section section--white">
    <div class="container">
      <div class="center" style="margin-bottom: 2rem">
        <span class="eyebrow">Eventos</span>
        <h2>¿Qué puedes hacer en El Patio de Mi Recreo?</h2>
      </div>
      <div class="grid grid--3">
        <article v-for="t in eventTypes" :key="t.title" class="card">
          <div class="tile" :style="{ '--c1': t.c1, '--c2': t.c2, aspectRatio: '16/8', marginBottom: '1rem' }">{{ t.title }}</div>
          <p>{{ t.text }}</p>
        </article>
      </div>
      <p class="center" style="margin-top: 1.5rem"><RouterLink class="btn btn--ghost" to="/eventos">Saber más</RouterLink></p>
    </div>
  </section>

  <section class="section">
    <div class="container grid grid--2">
      <div class="card card--tint">
        <span class="badge badge--coral">Cumpleaños</span>
        <h2 style="margin-top: .8rem">Reserva ya fecha para celebrar tu cumpleaños</h2>
        <p>Somos especialistas en cumpleaños infantiles. Calcula tu presupuesto al instante y reserva tu franja online.</p>
        <RouterLink class="btn" to="/cumpleanos-infantiles">Solicitar información</RouterLink>
      </div>
      <div class="card" style="background: var(--ink); color: #fff">
        <span class="badge">Entradas</span>
        <h2 style="margin-top: .8rem">Plataforma de venta de entradas</h2>
        <p style="color: #c9d1e6">Entérate de los próximos eventos y reserva tus entradas: un ocio económico y atractivo para todos.</p>
        <RouterLink class="btn btn--light" to="/eventos#entradas">Reservar</RouterLink>
      </div>
    </div>
  </section>

  <section class="section section--white">
    <div class="container" style="max-width: 820px">
      <h2 class="center">Preguntas frecuentes</h2>
      <FaqList />
    </div>
  </section>

  <section class="section">
    <div class="container grid grid--2">
      <div>
        <h2>¿Tienes dudas? ¡Ponte en contacto con nosotros!</h2>
        <ContactForm />
      </div>
      <div>
        <h2>Ubicación</h2>
        <p><strong>{{ SITE.addressLine }}</strong></p>
        <p class="muted">
          Estamos en A Gándara, a unos 10 minutos en coche de Odeón y su centro comercial, a pocos minutos del paseo marítimo de Xuvia y cerca de los polígonos de Río do Pozo y A Gándara.
        </p>
        <div style="height: 340px"><MapEmbed /></div>
      </div>
    </div>
  </section>
</template>
