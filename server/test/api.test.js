import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../src/db.js';
import { seedIfEmpty } from '../src/seed.js';
import { createApp } from '../src/app.js';
import { computeQuote } from '../src/pricing.js';

let server, base;
const secret = 'test-secret-test-secret-test-secret-1234';

before(async () => {
  const db = openDb(':memory:');
  seedIfEmpty(db, { adminEmail: 'admin@test.com', adminPassword: 'password123' });
  const app = createApp(db, { jwtSecret: secret, serveClient: false });
  await new Promise((ok) => (server = app.listen(0, ok)));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => server.close());

const call = (path, { method = 'GET', body, token } = {}) =>
  fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body)
  });

// Próximo miércoles y sábado a futuro
function nextWeekday(dow) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 7);
  while (d.getUTCDay() !== dow) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

test('precio: pack básico entre semana', () => {
  const q = computeQuote({ date: nextWeekday(3), kids: 15, joint: false });
  assert.equal(q.totalCents, 30000);
});

test('precio: 20 niños en sábado con cumple conjunto', () => {
  const q = computeQuote({ date: nextWeekday(6), kids: 20, joint: true });
  // 300 + 5*19 + max(20*1.5, 22.5)=30 + joint 20*1.5=30  => 455
  assert.equal(q.totalCents, 45500);
});

test('precio: cumple conjunto no se cobra con 30+ niños', () => {
  const q = computeQuote({ date: nextWeekday(3), kids: 30, joint: true });
  assert.ok(!q.lines.some((l) => l.key === 'joint'));
});

test('contacto: valida y guarda', async () => {
  const bad = await call('/contact', { method: 'POST', body: { name: 'A' } });
  assert.equal(bad.status, 422);
  const ok = await call('/contact', {
    method: 'POST',
    body: { name: 'Ana', email: 'ana@x.com', phone: '691793956', message: 'Hola', privacy: true }
  });
  assert.equal(ok.status, 201);
});

test('contacto: honeypot rechaza bots', async () => {
  const res = await call('/contact', {
    method: 'POST',
    body: { name: 'Bot', email: 'b@x.com', phone: '691793956', message: 'spam', privacy: true, website: 'http://spam' }
  });
  assert.equal(res.status, 422);
});

test('cumpleaños: disponibilidad, reserva y doble reserva', async () => {
  const date = nextWeekday(4);
  const av = await (await call(`/birthdays/availability?date=${date}`)).json();
  assert.deepEqual(av.slots, [{ slot: '17:00-20:00', available: true }]);

  const payload = {
    date, slot: '17:00-20:00', kids: 12, joint: false,
    addons: [{ code: 'laser-tag', quantity: 1 }, { code: 'tortilla', quantity: 1 }],
    honoreeNames: 'Lucas', contactName: 'Marta', email: 'm@x.com', phone: '691793956', privacy: true
  };
  const res = await call('/birthdays/bookings', { method: 'POST', body: payload });
  assert.equal(res.status, 201);
  const b = await res.json();
  assert.equal(b.totalCents, 30000 + 12 * 800);
  assert.equal(b.onRequest, true);
  assert.match(b.ref, /^CUM-[0-9A-F]{6}$/);

  const again = await call('/birthdays/bookings', { method: 'POST', body: payload });
  assert.equal(again.status, 409);

  const av2 = await (await call(`/birthdays/availability?date=${date}`)).json();
  assert.equal(av2.slots[0].available, false);
});

test('cumpleaños: franja inválida y fecha pasada', async () => {
  const base = { kids: 10, joint: false, addons: [], honoreeNames: 'x', contactName: 'y', email: 'a@b.com', phone: '691793956', privacy: true };
  const wrongSlot = await call('/birthdays/bookings', { method: 'POST', body: { ...base, date: nextWeekday(3), slot: '21:00-00:00' } });
  assert.equal(wrongSlot.status, 422);
  const past = await call('/birthdays/bookings', { method: 'POST', body: { ...base, date: '2020-01-01', slot: '17:00-20:00' } });
  assert.equal(past.status, 422);
});

test('entradas: respeta aforo', async () => {
  const [ev] = await (await call('/events')).json();
  const res = await call(`/events/${ev.slug}/reservations`, {
    method: 'POST',
    body: { name: 'Pepe', email: 'p@x.com', phone: '691793956', quantity: 2, privacy: true }
  });
  assert.equal(res.status, 201);
  const r = await res.json();
  assert.equal(r.totalCents, ev.priceCents * 2);
  const after = await (await call(`/events/${ev.slug}`)).json();
  assert.equal(after.remaining, ev.capacity - 2);

  const over = await call(`/events/${ev.slug}/reservations`, {
    method: 'POST',
    body: { name: 'Pepe', email: 'p@x.com', phone: '691793956', quantity: 20, privacy: true }
  });
  assert.equal(over.status, 201); // 20 <= restantes
});

test('admin: requiere auth, login y cambio de estado', async () => {
  assert.equal((await call('/admin/summary')).status, 401);
  assert.equal((await call('/admin/login', { method: 'POST', body: { email: 'admin@test.com', password: 'mala' } })).status, 401);

  const { token } = await (await call('/admin/login', { method: 'POST', body: { email: 'admin@test.com', password: 'password123' } })).json();
  const sum = await (await call('/admin/summary', { token })).json();
  assert.equal(sum.newContacts, 1);

  const contacts = await (await call('/admin/contacts', { token })).json();
  const patch = await call(`/admin/contacts/${contacts[0].id}/status`, { method: 'PATCH', token, body: { status: 'answered' } });
  assert.equal(patch.status, 200);
  const badStatus = await call(`/admin/contacts/${contacts[0].id}/status`, { method: 'PATCH', token, body: { status: 'nope' } });
  assert.equal(badStatus.status, 422);
});

test('admin: CRUD de eventos', async () => {
  const { token } = await (await call('/admin/login', { method: 'POST', body: { email: 'admin@test.com', password: 'password123' } })).json();
  const ev = { slug: 'concierto-test', title: 'Concierto', description: 'Desc', category: 'concierto', startsAt: '2099-01-01T21:00', capacity: 100, priceCents: 1500, published: true };
  const created = await call('/admin/events', { method: 'POST', token, body: ev });
  assert.equal(created.status, 201);
  assert.equal((await call('/admin/events', { method: 'POST', token, body: ev })).status, 409);
  const { id } = await created.json();
  assert.equal((await call(`/admin/events/${id}`, { method: 'PUT', token, body: { ...ev, title: 'Nuevo' } })).status, 200);
  assert.equal((await call(`/admin/events/${id}`, { method: 'DELETE', token })).status, 204);
});
