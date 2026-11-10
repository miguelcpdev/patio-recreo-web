<script setup>
import { ref, reactive, onMounted } from 'vue';
import PageHero from '../components/PageHero.vue';
import ContactForm from '../components/ContactForm.vue';
import { api } from '../api.js';

const items = ref([]);
const selected = ref(null);
const extra = reactive({ eventDate: '', location: '' });
const today = new Date().toISOString().slice(0, 10);

onMounted(async () => (items.value = await api('/rentals').catch(() => [])));
</script>

<template>
  <PageHero eyebrow="Alquiler" title="Alquiler de atracciones y equipamiento" lead="Haz que tu evento sea aún más especial. Opciones ideales para fiestas y celebraciones, dentro o fuera de nuestras instalaciones." />
  <section class="section">
    <div class="container grid grid--3">
      <article v-for="it in items" :key="it.id" class="card">
        <h3>{{ it.name }}</h3>
        <p>{{ it.description }}</p>
        <p class="muted"><strong>{{ it.priceNote }}</strong></p>
        <button class="btn btn--sm" @click="selected = it">Consultar</button>
      </article>
    </div>
  </section>

  <div v-if="selected" class="modal-back" role="dialog" aria-modal="true" :aria-label="`Consultar ${selected.name}`" @click.self="selected = null">
    <div class="modal">
      <h3>Consultar: {{ selected.name }}</h3>
      <ContactForm :endpoint="`/rentals/${selected.id}/requests`" :extra="extra" :show-surname="false" submit-label="Pedir presupuesto">
        <template #extra-fields="{ errors }">
          <div class="form-row">
            <div class="field">
              <label for="rf-date">Fecha del evento *</label>
              <input id="rf-date" v-model="extra.eventDate" type="date" :min="today" required />
              <p v-if="errors.eventDate" class="err">{{ errors.eventDate }}</p>
            </div>
            <div class="field">
              <label for="rf-loc">Lugar</label>
              <input id="rf-loc" v-model="extra.location" placeholder="Dirección o localidad" />
            </div>
          </div>
        </template>
      </ContactForm>
      <p style="margin-top: 1rem"><button class="btn btn--sm btn--ghost" @click="selected = null">Cerrar</button></p>
    </div>
  </div>
</template>
