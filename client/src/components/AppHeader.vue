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
        <svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
          <rect width="64" height="64" rx="16" fill="#14213d" />
          <circle cx="32" cy="32" r="14" fill="#ffc233" />
          <circle cx="32" cy="32" r="7" fill="#ff5a5f" />
        </svg>
        <span>El Patio de mi Recreo</span>
      </RouterLink>

      <nav id="main-nav" class="nav" :class="{ open }" aria-label="Principal">
        <RouterLink v-for="item in NAV" :key="item.to" :to="item.to">{{ item.label }}</RouterLink>
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
