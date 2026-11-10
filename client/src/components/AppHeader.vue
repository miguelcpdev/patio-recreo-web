<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { NAV, SITE } from '../site.js';

const open = ref(false);
const route = useRoute();
watch(() => route.path, () => (open.value = false));
</script>

<template>
  <header class="header">
    <div class="container">
      <RouterLink to="/" class="brand" aria-label="El Patio de mi Recreo - Inicio">
        <img class="brand-logo" src="/images/logo.svg" width="457" height="168" alt="El Patio de mi Recreo" />
      </RouterLink>

      <nav id="main-nav" class="nav" :class="{ open }" aria-label="Principal">
        <RouterLink v-for="item in NAV" :key="item.to" :to="item.to">{{ item.label }}</RouterLink>
        <a class="btn nav-call" :href="`tel:${SITE.phoneIntl}`">Llamar · {{ SITE.phone }}</a>
      </nav>

      <div class="header-cta">
        <a class="btn btn--sm" :href="`tel:${SITE.phoneIntl}`">{{ SITE.phone }}</a>
        <button class="menu-btn" :aria-expanded="open" aria-controls="main-nav" aria-label="Menú" @click="open = !open">
          <span /><span /><span />
        </button>
      </div>
    </div>
  </header>
</template>
