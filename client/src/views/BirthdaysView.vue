<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import PageHero from '../components/PageHero.vue';
import { api, ApiError } from '../api.js';
import { eur } from '../site.js';

const config = ref(null);
const today = new Date().toISOString().slice(0, 10);

const form = reactive({
  date: '', slot: '', kids: 15, joint: false, selected: {},
  honoreeNames: '', contactName: '', email: '', phone: '', notes: '', privacy: false, website: ''
});
const slots = ref([]);
const quote = ref(null);
const state = ref('idle');
const error = ref('');
const fieldErrors = ref({});
const done = ref(null);

const groups = computed(() => {
  const by = { animation: [], snack: [], parents: [] };
  config.value?.addons.forEach((a) => by[a.category].push(a));
  return by;
});

const priceLabel = (a) => {
  if (a.priceCents == null) return 'A consultar';
  const unit = { per_child: '/ niñ@', per_hour: '/ hora', fixed: '' }[a.unit];
  return `${a.minCents && a.unit === 'per_child' ? 'mín. ' + eur(a.minCents) + ' · ' : ''}${eur(a.priceCents)} ${unit}`.trim();
};

onMounted(async () => (config.value = await api('/birthdays/config').catch(() => null)));

watch(() => form.date, async (date) => {
  form.slot = '';
  slots.value = [];
  if (!date) return;
  try { slots.value = (await api(`/birthdays/availability?date=${date}`)).slots; } catch { /* noop */ }
});

const addonPayload = () => Object.keys(form.selected).filter((k) => form.selected[k]).map((code) => ({ code, quantity: 1 }));

let timer;
watch(() => [form.date, form.kids, form.joint, { ...form.selected }], () => {
  clearTimeout(timer);
  if (!form.date || !(form.kids >= 1)) return (quote.value = null);
  timer = setTimeout(async () => {
    try {
      quote.value = await api('/birthdays/quote', { method: 'POST', body: { date: form.date, kids: Number(form.kids), joint: form.joint, addons: addonPayload() } });
    } catch { quote.value = null; }
  }, 250);
}, { deep: true });

async function submit() {
  state.value = 'sending'; error.value = ''; fieldErrors.value = {};
  try {
    done.value = await api('/birthdays/bookings', {
      method: 'POST',
      body: {
        date: form.date, slot: form.slot, kids: Number(form.kids), joint: form.joint, addons: addonPayload(),
        honoreeNames: form.honoreeNames, contactName: form.contactName, email: form.email, phone: form.phone,
        notes: form.notes, privacy: form.privacy, website: form.website
      }
    });
    state.value = 'ok';
  } catch (e) {
    state.value = 'error';
    error.value = e.message;
    fieldErrors.value = e instanceof ApiError ? e.fields || {} : {};
    if (e.status === 409 && form.date) slots.value = (await api(`/birthdays/availability?date=${form.date}`)).slots;
  }
}

const canSubmit = computed(() => form.date && form.slot && form.kids >= 1 && state.value !== 'sending');

const schedule = [
  ['Lunes a jueves', '17:00 – 20:00'],
  ['Viernes y vísperas de festivo', '17:00 – 20:00 · 21:00 – 00:00'],
  ['Sábados', '11:00 – 14:00 · 17:00 – 20:00 · 21:00 – 00:00'],
  ['Domingos', '11:00 – 14:00 · 17:00 – 20:00']
];
</script>

<template>
  <PageHero eyebrow="Cumpleaños" title="Cumpleaños infantiles llenos de diversión" lead="Un espacio seguro con actividades, animaciones y opciones de merienda para que los más pequeños disfruten de un día único." />

  <section class="section">
    <div class="container grid grid--2">
      <div class="card card--tint">
        <span class="badge">Pack básico</span>
        <p class="price" style="margin-top: .8rem">300 € <small>hasta 15 niñ@s</small></p>
        <p class="muted">+19 € por niñ@ adicional · Fines de semana, festivos y vísperas: +1,50 €/niñ@ (mín. 22,50 €) · Cumple conjunto: +1,50 €/niñ@</p>
        <ul class="feature-list">
          <li><strong>Ocio:</strong> pista de fútbol, futbolines, air hockey, karaoke, juegos de mesa, canasta, vóley…</li>
          <li><strong>Merienda:</strong> sándwiches, snacks, gominolas, chocolatina, bebidas, tarta y cono de chuches.</li>
          <li>Uso exclusivo de las instalaciones (2.000 m²).</li>
        </ul>
      </div>
      <div>
        <h2>Horarios</h2>
        <div class="schedule">
          <div v-for="[day, hours] in schedule" :key="day"><strong>{{ day }}</strong><span>{{ hours }}</span></div>
        </div>
        <p class="muted" style="margin-top: .8rem">Entrada 10 minutos antes de la hora fijada.</p>
      </div>
    </div>
  </section>

  <section id="reservar" class="section section--white">
    <div class="container">
      <h2>Calcula tu presupuesto y reserva</h2>
      <p class="lead">Elige fecha y franja; la reserva queda pendiente de confirmación por nuestro equipo.</p>

      <div v-if="state === 'ok' && done" class="card card--tint" role="status">
        <h3>¡Solicitud recibida!</h3>
        <p>Tu referencia es <strong>{{ done.ref }}</strong>. Total estimado: <strong>{{ eur(done.totalCents) }}</strong><span v-if="done.onRequest"> (+ extras a consultar)</span>. Te contactaremos para confirmar la fecha.</p>
      </div>

      <form v-else-if="config" class="wizard" novalidate @submit.prevent="submit">
        <div class="form">
          <div class="card">
            <h3>1. Fecha y horario</h3>
            <div class="form-row">
              <div class="field">
                <label for="bd-date">Fecha *</label>
                <input id="bd-date" v-model="form.date" type="date" :min="today" required />
              </div>
              <div class="field">
                <label for="bd-kids">Nº de niñ@s *</label>
                <input id="bd-kids" v-model.number="form.kids" type="number" min="1" max="60" required />
              </div>
            </div>
            <div v-if="form.date" style="margin-top: 1rem">
              <p class="muted" v-if="!slots.length">No hay franjas para esa fecha.</p>
              <div class="slots" role="group" aria-label="Franja horaria">
                <button v-for="s in slots" :key="s.slot" type="button" class="slot" :disabled="!s.available" :aria-pressed="form.slot === s.slot" @click="form.slot = s.slot">
                  {{ s.slot.replace('-', ' – ') }}<span v-if="!s.available"> (ocupado)</span>
                </button>
              </div>
            </div>
            <label class="check" style="margin-top: 1rem">
              <input v-model="form.joint" type="checkbox" /><span>Cumple conjunto (2 o más cumpleañer@s)</span>
            </label>
          </div>

          <div class="card">
            <h3>2. Animaciones</h3>
            <div class="form">
              <label v-for="a in groups.animation" :key="a.code" class="addon">
                <span><input v-model="form.selected[a.code]" type="checkbox" /><strong>{{ a.name }}</strong><br /><small class="muted">{{ a.description }}</small></span>
                <strong>{{ priceLabel(a) }}</strong>
              </label>
            </div>
          </div>

          <div class="card">
            <h3>3. Complementos de merienda</h3>
            <div class="form">
              <label v-for="a in groups.snack" :key="a.code" class="addon">
                <span><input v-model="form.selected[a.code]" type="checkbox" /><strong>{{ a.name }}</strong></span>
                <strong>{{ priceLabel(a) }}</strong>
              </label>
            </div>
            <h3 style="margin-top: 1.2rem">Picoteo para padres</h3>
            <div class="form">
              <label v-for="a in groups.parents" :key="a.code" class="addon">
                <span><input v-model="form.selected[a.code]" type="checkbox" /><strong>{{ a.name }}</strong></span>
                <strong>{{ priceLabel(a) }}</strong>
              </label>
            </div>
          </div>

          <div class="card">
            <h3>4. Tus datos</h3>
            <div class="form">
              <div class="form-row">
                <div class="field"><label for="bd-hon">Cumpleañer@(s) *</label><input id="bd-hon" v-model="form.honoreeNames" required /><p v-if="fieldErrors.honoreeNames" class="err">{{ fieldErrors.honoreeNames }}</p></div>
                <div class="field"><label for="bd-name">Tu nombre *</label><input id="bd-name" v-model="form.contactName" required autocomplete="name" /><p v-if="fieldErrors.contactName" class="err">{{ fieldErrors.contactName }}</p></div>
              </div>
              <div class="form-row">
                <div class="field"><label for="bd-mail">Email *</label><input id="bd-mail" v-model="form.email" type="email" required autocomplete="email" /><p v-if="fieldErrors.email" class="err">{{ fieldErrors.email }}</p></div>
                <div class="field"><label for="bd-tel">Teléfono *</label><input id="bd-tel" v-model="form.phone" type="tel" required autocomplete="tel" /><p v-if="fieldErrors.phone" class="err">{{ fieldErrors.phone }}</p></div>
              </div>
              <div class="field"><label for="bd-notes">Observaciones (alergias, temática…)</label><textarea id="bd-notes" v-model="form.notes" /></div>
              <div class="hp" aria-hidden="true"><input v-model="form.website" tabindex="-1" autocomplete="off" /></div>
              <label class="check"><input v-model="form.privacy" type="checkbox" /><span>Acepto la <RouterLink to="/politica-privacidad" target="_blank">Política de Privacidad</RouterLink>.</span></label>
              <p v-if="fieldErrors.privacy" class="err" style="color: var(--coral-dark)">{{ fieldErrors.privacy }}</p>
            </div>
          </div>
        </div>

        <aside class="card summary" aria-live="polite">
          <h3>Resumen</h3>
          <p v-if="!quote" class="muted">Elige una fecha para ver el presupuesto.</p>
          <template v-else>
            <div v-for="l in quote.lines" :key="l.key" class="summary-line"><span>{{ l.label }}</span><strong>{{ l.onRequest ? '—' : eur(l.cents) }}</strong></div>
            <div class="summary-total"><span>Total</span><span>{{ eur(quote.totalCents) }}</span></div>
            <p v-if="quote.onRequest" class="muted">Los extras “a consultar” no incluidos en el total.</p>
          </template>
          <div v-if="state === 'error'" class="alert alert--err" role="alert" style="margin-top: 1rem">{{ error }}</div>
          <button class="btn" type="submit" style="width: 100%; margin-top: 1rem" :disabled="!canSubmit">
            {{ state === 'sending' ? 'Enviando…' : 'Solicitar reserva' }}
          </button>
          <p class="muted" style="margin-top: .6rem">No se realiza ningún pago ahora.</p>
        </aside>
      </form>
      <p v-else class="muted">Cargando configurador…</p>
    </div>
  </section>
</template>
