<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../api.js';
import { applySeo, faqSchema, breadcrumb } from '../seo.js';
import { useRoute } from 'vue-router';

const faqs = ref([]);
const route = useRoute();
const emit = defineEmits(['loaded']);

onMounted(async () => {
  try {
    faqs.value = await api('/faqs');
    emit('loaded', faqs.value);
    if (faqs.value.length) {
      applySeo({ ...route.meta, path: route.path, jsonld: [faqSchema(faqs.value)] });
    }
  } catch { /* la sección simplemente no se muestra */ }
});
</script>

<template>
  <div v-if="faqs.length" class="faq">
    <details v-for="f in faqs" :key="f.id">
      <summary>{{ f.question }}</summary>
      <p>{{ f.answer }}</p>
    </details>
  </div>
</template>
