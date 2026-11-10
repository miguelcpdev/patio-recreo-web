import { Router } from 'express';
import { tx } from '../db.js';
import { HttpError, makeRef } from '../http.js';
import {
  contactSchema,
  quoteSchema,
  bookingSchema,
  rentalRequestSchema,
  ticketSchema
} from '../validation.js';
import {
  BASE_CENTS,
  BASE_KIDS,
  EXTRA_KID_CENTS,
  computeQuote,
  parseDate,
  slotsForDate
} from '../pricing.js';

const todayIso = () => new Date().toISOString().slice(0, 10);

function eventView(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    capacity: row.capacity,
    priceCents: row.price_cents,
    remaining: Math.max(0, row.capacity - (row.sold ?? 0))
  };
}

const EVENT_SELECT = `
  SELECT e.*, COALESCE((SELECT SUM(quantity) FROM ticket_reservations t
                        WHERE t.event_id = e.id AND t.status <> 'cancelled'), 0) AS sold
  FROM events e`;

export function publicRoutes(db, { formLimiter }) {
  const r = Router();

  // ---------- Contenido ----------
  r.get('/faqs', (_req, res) => {
    res.json(db.prepare('SELECT id, question, answer FROM faqs WHERE published=1 ORDER BY position').all());
  });

  r.get('/testimonials', (_req, res) => {
    res.json(db.prepare('SELECT id, author, text, rating FROM testimonials WHERE published=1 ORDER BY id DESC').all());
  });

  r.get('/rentals', (_req, res) => {
    res.json(
      db
        .prepare('SELECT id, slug, name, description, price_note AS priceNote FROM rental_items WHERE active=1 ORDER BY position')
        .all()
    );
  });

  // ---------- Contacto ----------
  r.post('/contact', formLimiter, (req, res) => {
    const d = contactSchema.parse(req.body);
    const info = db
      .prepare(
        `INSERT INTO contact_messages (topic,name,surname,email,phone,message,privacy_accepted)
         VALUES (?,?,?,?,?,?,1)`
      )
      .run(d.topic, d.name, d.surname, d.email, d.phone, d.message);
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  });

  // ---------- Alquiler ----------
  r.post('/rentals/:id/requests', formLimiter, (req, res) => {
    const item = db.prepare('SELECT id FROM rental_items WHERE id=? AND active=1').get(Number(req.params.id));
    if (!item) throw new HttpError(404, 'Artículo no encontrado');
    const d = rentalRequestSchema.parse(req.body);
    if (!parseDate(d.eventDate) || d.eventDate < todayIso()) {
      throw new HttpError(422, 'La fecha del evento debe ser futura');
    }
    const info = db
      .prepare(
        `INSERT INTO rental_requests (item_id,name,email,phone,event_date,location,message)
         VALUES (?,?,?,?,?,?,?)`
      )
      .run(item.id, d.name, d.email, d.phone, d.eventDate, d.location, d.message);
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  });

  // ---------- Cumpleaños ----------
  const addonRows = () =>
    db.prepare('SELECT * FROM birthday_addons WHERE active=1 ORDER BY position').all();

  r.get('/birthdays/config', (_req, res) => {
    res.json({
      pricing: { baseCents: BASE_CENTS, baseKids: BASE_KIDS, extraKidCents: EXTRA_KID_CENTS },
      addons: addonRows().map((a) => ({
        code: a.code,
        category: a.category,
        name: a.name,
        description: a.description,
        priceCents: a.price_cents,
        unit: a.unit,
        minCents: a.min_cents
      }))
    });
  });

  r.get('/birthdays/availability', (req, res) => {
    const date = String(req.query.date ?? '');
    if (!parseDate(date)) throw new HttpError(422, 'Fecha no válida');
    const taken = new Set(
      db
        .prepare("SELECT slot FROM birthday_bookings WHERE date=? AND status <> 'cancelled'")
        .all(date)
        .map((x) => x.slot)
    );
    const past = date < todayIso();
    res.json({
      date,
      slots: slotsForDate(date).map((slot) => ({ slot, available: !past && !taken.has(slot) }))
    });
  });

  function resolveItems(addons) {
    const rows = new Map(addonRows().map((a) => [a.code, a]));
    return addons.map(({ code, quantity }) => {
      const addon = rows.get(code);
      if (!addon) throw new HttpError(422, `Extra desconocido: ${code}`);
      return { addon, quantity };
    });
  }

  r.post('/birthdays/quote', (req, res) => {
    const d = quoteSchema.parse(req.body);
    if (!parseDate(d.date)) throw new HttpError(422, 'Fecha no válida');
    res.json(computeQuote({ ...d, items: resolveItems(d.addons) }));
  });

  r.post('/birthdays/bookings', formLimiter, (req, res) => {
    const d = bookingSchema.parse(req.body);
    if (!parseDate(d.date) || d.date < todayIso()) throw new HttpError(422, 'La fecha debe ser futura');
    if (!slotsForDate(d.date).includes(d.slot)) throw new HttpError(422, 'Franja horaria no disponible ese día');

    const items = resolveItems(d.addons);
    const quote = computeQuote({ ...d, items });
    const ref = makeRef('CUM');

    try {
      const id = tx(db, () => {
        const info = db
          .prepare(
            `INSERT INTO birthday_bookings
             (ref,date,slot,kids,honoree_names,joint,contact_name,email,phone,notes,total_cents,on_request)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
          )
          .run(ref, d.date, d.slot, d.kids, d.honoreeNames, d.joint ? 1 : 0, d.contactName, d.email, d.phone, d.notes, quote.totalCents, quote.onRequest ? 1 : 0);
        const bookingId = Number(info.lastInsertRowid);
        const ins = db.prepare(
          'INSERT INTO birthday_booking_addons (booking_id,addon_id,quantity,total_cents) VALUES (?,?,?,?)'
        );
        for (const { addon, quantity } of items) {
          const line = quote.lines.find((l) => l.key === addon.code);
          ins.run(bookingId, addon.id, quantity, line?.cents ?? 0);
        }
        return bookingId;
      });
      res.status(201).json({ id, ref, status: 'pending', ...quote });
    } catch (err) {
      if (String(err?.message).includes('UNIQUE')) {
        throw new HttpError(409, 'Esa franja ya está reservada. Elige otra.');
      }
      throw err;
    }
  });

  // ---------- Eventos y entradas ----------
  r.get('/events', (_req, res) => {
    const now = new Date().toISOString().slice(0, 16);
    const rows = db
      .prepare(`${EVENT_SELECT} WHERE e.published=1 AND e.starts_at >= ? ORDER BY e.starts_at`)
      .all(now);
    res.json(rows.map(eventView));
  });

  r.get('/events/:slug', (req, res) => {
    const row = db.prepare(`${EVENT_SELECT} WHERE e.slug=? AND e.published=1`).get(req.params.slug);
    if (!row) throw new HttpError(404, 'Evento no encontrado');
    res.json(eventView(row));
  });

  // Reserva de entradas. No hay cobro: la reserva queda en 'reserved'.
  r.post('/events/:slug/reservations', formLimiter, (req, res) => {
    const d = ticketSchema.parse(req.body);
    const result = tx(db, () => {
      const ev = db.prepare(`${EVENT_SELECT} WHERE e.slug=? AND e.published=1`).get(req.params.slug);
      if (!ev) throw new HttpError(404, 'Evento no encontrado');
      if (ev.starts_at < new Date().toISOString().slice(0, 16)) throw new HttpError(410, 'El evento ya ha pasado');
      if (ev.capacity - ev.sold < d.quantity) {
        throw new HttpError(409, `Solo quedan ${Math.max(0, ev.capacity - ev.sold)} entradas`);
      }
      const ref = makeRef('ENT');
      const total = ev.price_cents * d.quantity;
      db.prepare(
        `INSERT INTO ticket_reservations (ref,event_id,name,email,phone,quantity,total_cents)
         VALUES (?,?,?,?,?,?,?)`
      ).run(ref, ev.id, d.name, d.email, d.phone, d.quantity, total);
      return { ref, totalCents: total, quantity: d.quantity, status: 'reserved' };
    });
    res.status(201).json(result);
  });

  return r;
}
