<script setup>
import PageHero from '../components/PageHero.vue';
import ContactForm from '../components/ContactForm.vue';
import MapEmbed from '../components/MapEmbed.vue';
import { SITE } from '../site.js';
</script>

<template>
  <PageHero eyebrow="Contacto" title="Hablemos de tu próxima celebración" lead="Rellena el formulario o contáctanos directamente." />
  <section class="section">
    <div class="container grid grid--2">
      <div class="card"><ContactForm /></div>
      <div class="grid" style="align-content: start">
        <div class="card">
          <h3>Llámanos por teléfono</h3>
          <p><a :href="`tel:${SITE.phoneIntl}`">{{ SITE.phone }}</a></p>
          <h3>Escríbenos un mail</h3>
          <p><a :href="`mailto:${SITE.email}`">{{ SITE.email }}</a></p>
          <h3>Dónde encontrarnos</h3>
          <p>{{ SITE.addressLine }}</p>
        </div>
        <div style="min-height: 340px"><MapEmbed /></div>
      </div>
    </div>
  </section>
</template>
