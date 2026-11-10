<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { api } from '../api.js';
import { eur } from '../site.js';

const token = ref(sessionStorage.getItem('patio-admin-token') || '');
const login = reactive({ email: '', password: '' });
const loginError = ref('');
const tab = ref('bookings');
const rows = ref([]);
const summary = ref(null);
const error = ref('');

const STATUSES = {
  contacts: ['new', 'read', 'answered', 'archived'],
  bookings: ['pending', 'confirmed', 'cancelled'],
  rentals: ['new', 'quoted', 'confirmed', 'rejected'],
  tickets: ['reserved', 'paid', 'cancelled']
};
const TABS = [
  ['bookings', 'Cumpleaños'], ['tickets', 'Entradas'], ['rentals', 'Alquiler'], ['contacts', 'Mensajes'], ['events', 'Eventos']
];
const COLUMNS = {
  bookings: [['ref', 'Ref'], ['date', 'Fecha'], ['slot', 'Franja'], ['kids', 'Niños'], ['contactName', 'Contacto'], ['phone', 'Teléfono'], ['totalCents', 'Total', eur]],
  tickets: [['ref', 'Ref'], ['event', 'Evento'], ['name', 'Nombre'], ['phone', 'Teléfono'], ['quantity', 'Ud.'], ['totalCents', 'Total', eur]],
  rentals: [['createdAt', 'Recibido'], ['item', 'Artículo'], ['name', 'Nombre'], ['phone', 'Teléfono'], ['eventDate', 'Fecha evento'], ['message', 'Mensaje']],
  contacts: [['createdAt', 'Recibido'], ['topic', 'Tema'], ['name', 'Nombre'], ['email', 'Email'], ['phone', 'Teléfono'], ['message', 'Mensaje']]
};

const call = (path, opts = {}) => api(`/admin${path}`, { ...opts, token: token.value });

function logout() {
  token.value = ''; sessionStorage.removeItem('patio-admin-token');
}
function guard(e) {
  if (e.status === 401) logout();
  error.value = e.message;
}

async function doLogin() {
  loginError.value = '';
  try {
    const r = await api('/admin/login', { method: 'POST', body: login });
    token.value = r.token; sessionStorage.setItem('patio-admin-token', r.token);
    login.password = '';
  } catch (e) { loginError.value = e.message; }
}

async function load() {
  if (!token.value) return;
  error.value = '';
  try {
    summary.value = await call('/summary');
    rows.value = await call(`/${tab.value}`);
  } catch (e) { guard(e); }
}
watch([tab, token], load);
onMounted(load);

async function setStatus(row, status) {
  try { await call(`/${tab.value}/${row.id}/status`, { method: 'PATCH', body: { status } }); row.status = status; summary.value = await call('/summary'); }
  catch (e) { guard(e); }
}

// ---- Eventos ----
const blank = () => ({ id: null, slug: '', title: '', description: '', category: 'otro', startsAt: '', endsAt: null, capacity: 100, priceCents: 0, published: true });
const ev = ref(blank());
const priceEuros = computed({ get: () => ev.value.priceCents / 100, set: (v) => (ev.value.priceCents = Math.round(Number(v) * 100)) });
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function saveEvent() {
  error.value = '';
  const body = { ...ev.value }; delete body.id;
  if (!body.slug) body.slug = slugify(body.title);
  try {
    if (ev.value.id) await call(`/events/${ev.value.id}`, { method: 'PUT', body });
    else await call('/events', { method: 'POST', body });
    ev.value = blank(); await load();
  } catch (e) { error.value = e.fields ? Object.entries(e.fields).map(([k, v]) => `${k}: ${v}`).join(' · ') : e.message; }
}
async function removeEvent(id) {
  if (!confirm('¿Eliminar este evento y sus reservas?')) return;
  try { await call(`/events/${id}`, { method: 'DELETE' }); await load(); } catch (e) { guard(e); }
}
</script>

<template>
  <div class="container" style="padding-block: 2rem">
    <form v-if="!token" class="card form" style="max-width: 420px; margin: 4rem auto" @submit.prevent="doLogin">
      <h1 style="font-size: 1.8rem">Panel de administración</h1>
      <div class="field"><label for="ad-mail">Email</label><input id="ad-mail" v-model="login.email" type="email" required autocomplete="username" /></div>
      <div class="field"><label for="ad-pass">Contraseña</label><input id="ad-pass" v-model="login.password" type="password" required autocomplete="current-password" /></div>
      <div v-if="loginError" class="alert alert--err" role="alert">{{ loginError }}</div>
      <button class="btn" type="submit">Entrar</button>
    </form>

    <template v-else>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem">
        <h1 style="font-size: 1.8rem; margin: 0">Panel</h1>
        <div style="display: flex; gap: .6rem"><RouterLink class="btn btn--sm btn--ghost" to="/">Ver web</RouterLink><button class="btn btn--sm btn--ghost" @click="logout">Salir</button></div>
      </div>

      <div v-if="summary" class="kpis">
        <div class="card kpi"><strong>{{ summary.pendingBookings }}</strong>Cumpleaños pendientes</div>
        <div class="card kpi"><strong>{{ summary.reservedTickets }}</strong>Entradas reservadas</div>
        <div class="card kpi"><strong>{{ summary.newRentals }}</strong>Alquileres nuevos</div>
        <div class="card kpi"><strong>{{ summary.newContacts }}</strong>Mensajes nuevos</div>
      </div>

      <div class="tabs" role="tablist">
        <button v-for="[k, label] in TABS" :key="k" class="tab" role="tab" :aria-selected="tab === k" @click="tab = k">{{ label }}</button>
      </div>
      <div v-if="error" class="alert alert--err" role="alert" style="margin-bottom: 1rem">{{ error }}</div>

      <!-- Listados con estado -->
      <div v-if="tab !== 'events'" class="table-wrap">
        <table>
          <thead><tr><th v-for="c in COLUMNS[tab]" :key="c[0]">{{ c[1] }}</th><th>Estado</th></tr></thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id">
              <td v-for="c in COLUMNS[tab]" :key="c[0]">{{ c[2] ? c[2](r[c[0]]) : r[c[0]] }}</td>
              <td>
                <select :value="r.status" :aria-label="`Estado de ${r.ref || r.name}`" @change="setStatus(r, $event.target.value)">
                  <option v-for="s in STATUSES[tab]" :key="s" :value="s">{{ s }}</option>
                </select>
              </td>
            </tr>
            <tr v-if="!rows.length"><td :colspan="COLUMNS[tab].length + 1" class="muted">Sin registros.</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Eventos -->
      <div v-else class="grid grid--2" style="align-items: start">
        <form class="card form" @submit.prevent="saveEvent">
          <h3>{{ ev.id ? 'Editar evento' : 'Nuevo evento' }}</h3>
          <div class="field"><label for="ev-t">Título</label><input id="ev-t" v-model="ev.title" required /></div>
          <div class="field"><label for="ev-s">Slug (opcional)</label><input id="ev-s" v-model="ev.slug" placeholder="se genera del título" /></div>
          <div class="field"><label for="ev-d">Descripción</label><textarea id="ev-d" v-model="ev.description" required /></div>
          <div class="form-row">
            <div class="field"><label for="ev-c">Categoría</label>
              <select id="ev-c" v-model="ev.category"><option v-for="c in ['concierto','monologo','cena','feria','deporte','campamento','otro']" :key="c">{{ c }}</option></select></div>
            <div class="field"><label for="ev-st">Inicio</label><input id="ev-st" v-model="ev.startsAt" type="datetime-local" required /></div>
          </div>
          <div class="form-row">
            <div class="field"><label for="ev-cap">Aforo</label><input id="ev-cap" v-model.number="ev.capacity" type="number" min="1" required /></div>
            <div class="field"><label for="ev-p">Precio (€)</label><input id="ev-p" v-model="priceEuros" type="number" min="0" step="0.5" /></div>
          </div>
          <label class="check"><input v-model="ev.published" type="checkbox" /><span>Publicado</span></label>
          <div style="display: flex; gap: .6rem">
            <button class="btn" type="submit">Guardar</button>
            <button v-if="ev.id" class="btn btn--ghost" type="button" @click="ev = blank()">Cancelar</button>
          </div>
        </form>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Evento</th><th>Fecha</th><th>Aforo</th><th /></tr></thead>
            <tbody>
              <tr v-for="r in rows" :key="r.id">
                <td>{{ r.title }}<br /><span class="muted">{{ r.published ? 'Publicado' : 'Oculto' }} · {{ eur(r.priceCents) }}</span></td>
                <td>{{ r.startsAt.replace('T', ' ') }}</td><td>{{ r.capacity }}</td>
                <td style="white-space: nowrap">
                  <button class="btn btn--sm btn--ghost" @click="ev = { ...r }">Editar</button>
                  <button class="btn btn--sm btn--ghost" @click="removeEvent(r.id)">Borrar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
