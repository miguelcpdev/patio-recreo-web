<script setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import CookieBanner from './components/CookieBanner.vue';

const route = useRoute();
const isAdmin = computed(() => route.meta.admin);
</script>

<template>
  <a class="skip-link" href="#main">Saltar al contenido</a>
  <AppHeader v-if="!isAdmin" />
  <main id="main">
    <RouterView />
  </main>
  <AppFooter v-if="!isAdmin" />
  <CookieBanner v-if="!isAdmin" />
</template>
