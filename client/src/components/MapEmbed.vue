<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { SITE } from '../site.js';

// El mapa de Google solo se carga con consentimiento (RGPD).
const consent = ref(localStorage.getItem('patio-cookie-consent'));
const onConsent = (e) => (consent.value = e.detail);
onMounted(() => window.addEventListener('cookie-consent', onConsent));
onUnmounted(() => window.removeEventListener('cookie-consent', onConsent));

const src = computed(() => `https://www.google.com/maps?q=${encodeURIComponent(SITE.mapsQuery)}&output=embed`);
const link = computed(() => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapsQuery)}`);
function accept() {
  localStorage.setItem('patio-cookie-consent', 'all');
  consent.value = 'all';
  window.dispatchEvent(new CustomEvent('cookie-consent', { detail: 'all' }));
}
</script>

<template>
  <iframe v-if="consent === 'all'" class="map" :src="src" title="Mapa de ubicación de El Patio de mi Recreo" loading="lazy" referrerpolicy="no-referrer-when-downgrade" />
  <div v-else class="card card--tint" style="height: 100%; display: grid; place-content: center; text-align: center; gap: .8rem">
    <p>Este mapa requiere tu consentimiento para cargarse.</p>
    <div style="display: flex; gap: .6rem; justify-content: center; flex-wrap: wrap">
      <button class="btn btn--sm" @click="accept">Aceptar y ver mapa</button>
      <a class="btn btn--sm btn--ghost" :href="link" target="_blank" rel="noopener">Abrir en Google Maps</a>
    </div>
  </div>
</template>
