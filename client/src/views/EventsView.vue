<script setup>
import { ref, reactive, onMounted } from 'vue';
import PageHero from '../components/PageHero.vue';
import ContactForm from '../components/ContactForm.vue';
import { api, ApiError } from '../api.js';
import { eur } from '../site.js';
import { applySeo, eventSchema as evSchema } from '../seo.js';
import { useRoute } from 'vue-router';

const route = useRoute();
const events = ref([]);
const selected = ref(null);
const form = reactive({ name: '', email: '', phone: '', quantity: 1, privacy: false, website: '' });
const state = ref('idle');
const error = ref('');
const errors = ref({});
const result = ref(null);

const parts = (iso) => {
  const d = new Date(iso);
  return {
    day: d.getDate(),
    month: d.toLocaleDateString('es-ES', { month: 'short' }),
    full: d.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  };
};

async function load() {
  events.value = await api('/events').catch(() => []);
  if (events.value.length) applySeo({ ...route.meta, path: route.path, jsonld: events.value.map(evSchema) });
}
onMounted(load);

function open(ev) {
  selected.value = ev; result.value = null; state.value = 'idle'; error.value = ''; errors.value = {};
  form.quantity = 1;
}

async function reserve() {
  state.value = 'sending'; errors.value = {};
  try {
    result.value = await api(`/events/${selected.value.slug}/reservations`, { method: 'POST', body: { ...form, quantity: Number(form.quantity) } });
    state.value = 'ok';
    load();
  } catch (e) {
    state.value = 'error'; error.value = e.message; errors.value = e instanceof ApiError ? e.fields || {} : {};
  }
}

const privateTypes = ['Cumpleaños infantiles y adultos', 'Bodas', 'Bautizos', 'Comuniones', 'Despedidas de solteros', 'Team building'];
const scheduledTypes = ['Comidas o cenas baile', 'Monólogos', 'Conciertos', 'Ferias y exposiciones', 'Eventos deportivos', 'Campamentos de verano'];
</script>

<template>
  <PageHero eyebrow="Eventos" title="Eventos únicos en El Patio de Mi Recreo" lead="Celebra tus momentos especiales, únete a nuestra programación o llévate la diversión donde quieras." />

  <section class="section">
    <div class="container grid grid--3">
      <article class="card">
        <span class="badge badge--coral">Eventos privados</span>
        <h3 style="margin-top: .8rem">Celebra a tu manera</h3>
        <p>Nuestras instalaciones se transforman en el escenario perfecto para tu evento, con ambiente personalizado.</p>
        <ul class="feature-list"><li v-for="t in privateTypes" :key="t">{{ t }}</li></ul>
        <p class="muted" style="margin-top: 1rem">Complementa con catering y actividades.</p>
      </article>
      <article class="card">
        <span class="badge badge--mint">Eventos programados</span>
        <h3 style="margin-top: .8rem">Planes para todas las edades</h3>
        <p>Capacidad de hasta <strong>500 personas sentadas</strong> en comidas, cenas y monólogos (ampliable según evento).</p>
        <ul class="feature-list"><li v-for="t in scheduledTypes" :key="t">{{ t }}</li></ul>
      </article>
      <article class="card">
        <span class="badge">Eventos externos</span>
        <h3 style="margin-top: .8rem">Donde tú estés</h3>
        <p>Llevamos la energía de El Patio de Mi Recreo a parques, espacios públicos o la ubicación que elijas.</p>
      </article>
    </div>
  </section>

  <section id="entradas" class="section section--white">
    <div class="container" style="max-width: 900px">
      <span class="eyebrow">Entradas</span>
      <h2>Próximos eventos</h2>
      <p v-if="!events.length" class="muted">Pronto anunciaremos nuevas fechas.</p>
      <div class="grid">
        <article v-for="ev in events" :id="ev.slug" :key="ev.id" class="card event">
          <div class="date-chip"><strong>{{ parts(ev.startsAt).day }}</strong><span>{{ parts(ev.startsAt).month }}</span></div>
          <div>
            <h3>{{ ev.title }}</h3>
            <p style="margin-bottom: .3rem">{{ ev.description }}</p>
            <p class="muted">{{ parts(ev.startsAt).full }} · {{ ev.priceCents ? eur(ev.priceCents) : 'Gratis' }} ·
              <strong>{{ ev.remaining ? `${ev.remaining} entradas disponibles` : 'Agotado' }}</strong></p>
          </div>
          <button class="btn btn--sm" :disabled="!ev.remaining" @click="open(ev)">Reservar</button>
        </article>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container" style="max-width: 760px">
      <h2>¿Tienes dudas? ¡Ponte en contacto con nosotros!</h2>
      <ContactForm topic="eventos" />
    </div>
  </section>

  <div v-if="selected" class="modal-back" role="dialog" aria-modal="true" :aria-label="`Reservar ${selected.title}`" @click.self="selected = null">
    <div class="modal">
      <h3>{{ selected.title }}</h3>
      <div v-if="state === 'ok' && result">
        <div class="alert alert--ok" role="status">
          Reserva <strong>{{ result.ref }}</strong> registrada: {{ result.quantity }} entrada(s), {{ eur(result.totalCents) }}.
        </div>
        <p class="muted">El pago se gestionará más adelante; te avisaremos por email con las instrucciones.</p>
        <button class="btn btn--sm" @click="selected = null">Cerrar</button>
      </div>
      <form v-else class="form" novalidate @submit.prevent="reserve">
        <div class="field"><label for="tk-name">Nombre *</label><input id="tk-name" v-model="form.name" required /><p v-if="errors.name" class="err">{{ errors.name }}</p></div>
        <div class="form-row">
          <div class="field"><label for="tk-mail">Email *</label><input id="tk-mail" v-model="form.email" type="email" required /><p v-if="errors.email" class="err">{{ errors.email }}</p></div>
          <div class="field"><label for="tk-tel">Teléfono *</label><input id="tk-tel" v-model="form.phone" type="tel" required /><p v-if="errors.phone" class="err">{{ errors.phone }}</p></div>
        </div>
        <div class="field">
          <label for="tk-qty">Entradas</label>
          <input id="tk-qty" v-model.number="form.quantity" type="number" min="1" :max="Math.min(20, selected.remaining)" />
          <p class="muted">Total: <strong>{{ eur(selected.priceCents * (form.quantity || 0)) }}</strong></p>
        </div>
        <div class="hp" aria-hidden="true"><input v-model="form.website" tabindex="-1" autocomplete="off" /></div>
        <label class="check"><input v-model="form.privacy" type="checkbox" /><span>Acepto la <RouterLink to="/politica-privacidad" target="_blank">Política de Privacidad</RouterLink>.</span></label>
        <p v-if="errors.privacy" class="err" style="color: var(--coral-dark)">{{ errors.privacy }}</p>
        <div v-if="state === 'error'" class="alert alert--err" role="alert">{{ error }}</div>
        <div style="display: flex; gap: .6rem">
          <button class="btn" type="submit" :disabled="state === 'sending'">{{ state === 'sending' ? 'Reservando…' : 'Reservar entradas' }}</button>
          <button class="btn btn--ghost" type="button" @click="selected = null">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>
