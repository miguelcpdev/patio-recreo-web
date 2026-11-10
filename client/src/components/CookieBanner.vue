<script setup>
import { ref } from 'vue';

// Sin analítica ni terceros cargados por defecto: solo guardamos la elección.
const KEY = 'patio-cookie-consent';
const choice = ref(localStorage.getItem(KEY));

function set(value) {
  localStorage.setItem(KEY, value);
  choice.value = value;
  window.dispatchEvent(new CustomEvent('cookie-consent', { detail: value }));
}
</script>

<template>
  <aside v-if="!choice" class="cookie" role="dialog" aria-label="Cookies" aria-live="polite">
    <p>
      Usamos solo cookies técnicas imprescindibles. Si aceptas, podremos cargar contenido externo (mapas, vídeos) y
      medir el uso del sitio.
      <RouterLink to="/politica-cookies">Más información</RouterLink>.
    </p>
    <div class="cookie-actions">
      <button class="btn btn--sm" @click="set('all')">Aceptar todo</button>
      <button class="btn btn--sm btn--ghost" @click="set('necessary')">Solo necesarias</button>
    </div>
  </aside>
</template>
