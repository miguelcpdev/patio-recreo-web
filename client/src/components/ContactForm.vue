<script setup>
import { reactive, ref } from 'vue';
import { api, ApiError } from '../api.js';

const props = defineProps({
  topic: { type: String, default: 'general' },
  endpoint: { type: String, default: '/contact' },
  extra: { type: Object, default: () => ({}) },
  submitLabel: { type: String, default: 'Enviar' },
  showSurname: { type: Boolean, default: true }
});
const emit = defineEmits(['sent']);

const form = reactive({ name: '', surname: '', email: '', phone: '', message: '', privacy: false, website: '' });
const state = ref('idle'); // idle | sending | ok | error
const errors = ref({});
const message = ref('');

async function submit() {
  state.value = 'sending';
  errors.value = {};
  try {
    const body = props.endpoint === '/contact' ? { ...form, topic: props.topic } : { ...form, ...props.extra };
    await api(props.endpoint, { method: 'POST', body });
    state.value = 'ok';
    message.value = 'Mensaje enviado. Te responderemos lo antes posible.';
    Object.assign(form, { name: '', surname: '', email: '', phone: '', message: '', privacy: false });
    emit('sent');
  } catch (e) {
    state.value = 'error';
    errors.value = e instanceof ApiError ? e.fields || {} : {};
    message.value = e.message;
  }
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="submit">
    <div class="form-row">
      <div class="field">
        <label for="cf-name">Nombre *</label>
        <input id="cf-name" v-model="form.name" required autocomplete="given-name" />
        <p v-if="errors.name" class="err">{{ errors.name }}</p>
      </div>
      <div v-if="showSurname" class="field">
        <label for="cf-surname">Apellidos</label>
        <input id="cf-surname" v-model="form.surname" autocomplete="family-name" />
      </div>
    </div>
    <div class="form-row">
      <div class="field">
        <label for="cf-email">Email *</label>
        <input id="cf-email" v-model="form.email" type="email" required autocomplete="email" />
        <p v-if="errors.email" class="err">{{ errors.email }}</p>
      </div>
      <div class="field">
        <label for="cf-phone">Teléfono *</label>
        <input id="cf-phone" v-model="form.phone" type="tel" required autocomplete="tel" />
        <p v-if="errors.phone" class="err">{{ errors.phone }}</p>
      </div>
    </div>
    <slot name="extra-fields" :errors="errors" />
    <div class="field">
      <label for="cf-message">Escribe tu mensaje *</label>
      <textarea id="cf-message" v-model="form.message" required />
      <p v-if="errors.message" class="err">{{ errors.message }}</p>
    </div>
    <div class="hp" aria-hidden="true">
      <label>No rellenar <input v-model="form.website" tabindex="-1" autocomplete="off" /></label>
    </div>
    <div>
      <label class="check">
        <input v-model="form.privacy" type="checkbox" />
        <span>Acepto la <RouterLink to="/politica-privacidad" target="_blank">Política de Privacidad</RouterLink> de esta página web.</span>
      </label>
      <p v-if="errors.privacy" class="err" style="color: var(--coral-dark); font-size: .85rem">{{ errors.privacy }}</p>
    </div>
    <div v-if="state === 'ok'" class="alert alert--ok" role="status">{{ message }}</div>
    <div v-if="state === 'error'" class="alert alert--err" role="alert">{{ message }}</div>
    <div>
      <button class="btn" type="submit" :disabled="state === 'sending'">
        {{ state === 'sending' ? 'Enviando…' : submitLabel }}
      </button>
    </div>
  </form>
</template>
