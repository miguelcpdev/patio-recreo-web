import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HttpError } from '../http.js';
import { eventSchema, loginSchema, statusSchemas } from '../validation.js';

// hash ficticio para igualar tiempos cuando el usuario no existe
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 12);

const RESOURCES = {
  contacts: {
    table: 'contact_messages',
    list: `SELECT id,topic,name,surname,email,phone,message,status,created_at AS createdAt
           FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 500`
  },
  bookings: {
    table: 'birthday_bookings',
    list: `SELECT id,ref,date,slot,kids,honoree_names AS honoreeNames,joint,contact_name AS contactName,
                  email,phone,notes,total_cents AS totalCents,on_request AS onRequest,status,created_at AS createdAt
           FROM birthday_bookings ORDER BY date DESC, id DESC LIMIT 500`
  },
  rentals: {
    table: 'rental_requests',
    list: `SELECT r.id,i.name AS item,r.name,r.email,r.phone,r.event_date AS eventDate,r.location,
                  r.message,r.status,r.created_at AS createdAt
           FROM rental_requests r JOIN rental_items i ON i.id=r.item_id
           ORDER BY r.created_at DESC, r.id DESC LIMIT 500`
  },
  tickets: {
    table: 'ticket_reservations',
    list: `SELECT t.id,t.ref,e.title AS event,t.name,t.email,t.phone,t.quantity,
                  t.total_cents AS totalCents,t.status,t.created_at AS createdAt
           FROM ticket_reservations t JOIN events e ON e.id=t.event_id
           ORDER BY t.created_at DESC, t.id DESC LIMIT 500`
  }
};

export function adminRoutes(db, { jwtSecret, loginLimiter }) {
  const r = Router();

  r.post('/login', loginLimiter, (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = db.prepare('SELECT * FROM admin_users WHERE email=?').get(email.toLowerCase());
    const ok = bcrypt.compareSync(password, user?.password_hash ?? DUMMY_HASH);
    if (!user || !ok) throw new HttpError(401, 'Credenciales incorrectas');
    const token = jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: '8h' });
    res.json({ token, email: user.email });
  });

  r.use((req, _res, next) => {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    try {
      if (!token) throw new Error('no token');
      req.admin = jwt.verify(token, jwtSecret);
      next();
    } catch {
      next(new HttpError(401, 'No autorizado'));
    }
  });

  r.get('/summary', (_req, res) => {
    const c = (sql) => db.prepare(sql).get().c;
    res.json({
      newContacts: c("SELECT COUNT(*) c FROM contact_messages WHERE status='new'"),
      pendingBookings: c("SELECT COUNT(*) c FROM birthday_bookings WHERE status='pending'"),
      newRentals: c("SELECT COUNT(*) c FROM rental_requests WHERE status='new'"),
      reservedTickets: c("SELECT COALESCE(SUM(quantity),0) c FROM ticket_reservations WHERE status='reserved'")
    });
  });

  // ---- Eventos (CRUD) ----
  const eventRow = (e) => ({
    id: e.id, slug: e.slug, title: e.title, description: e.description, category: e.category,
    startsAt: e.starts_at, endsAt: e.ends_at, capacity: e.capacity, priceCents: e.price_cents, published: !!e.published
  });

  r.get('/events', (_req, res) => {
    res.json(db.prepare('SELECT * FROM events ORDER BY starts_at DESC').all().map(eventRow));
  });

  r.post('/events', (req, res) => {
    const d = eventSchema.parse(req.body);
    try {
      const info = db
        .prepare(
          `INSERT INTO events (slug,title,description,category,starts_at,ends_at,capacity,price_cents,published)
           VALUES (?,?,?,?,?,?,?,?,?)`
        )
        .run(d.slug, d.title, d.description, d.category, d.startsAt, d.endsAt ?? null, d.capacity, d.priceCents, d.published ? 1 : 0);
      res.status(201).json({ id: Number(info.lastInsertRowid) });
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) throw new HttpError(409, 'Ya existe un evento con ese slug');
      throw e;
    }
  });

  r.put('/events/:id', (req, res) => {
    const d = eventSchema.parse(req.body);
    const info = db
      .prepare(
        `UPDATE events SET slug=?,title=?,description=?,category=?,starts_at=?,ends_at=?,capacity=?,price_cents=?,published=?
         WHERE id=?`
      )
      .run(d.slug, d.title, d.description, d.category, d.startsAt, d.endsAt ?? null, d.capacity, d.priceCents, d.published ? 1 : 0, Number(req.params.id));
    if (!info.changes) throw new HttpError(404, 'Evento no encontrado');
    res.json({ ok: true });
  });

  r.delete('/events/:id', (req, res) => {
    const info = db.prepare('DELETE FROM events WHERE id=?').run(Number(req.params.id));
    if (!info.changes) throw new HttpError(404, 'Evento no encontrado');
    res.status(204).end();
  });

  // ---- Listados y cambio de estado ----
  r.get('/:resource', (req, res, next) => {
    const def = RESOURCES[req.params.resource];
    if (!def) return next(new HttpError(404, 'Recurso no encontrado'));
    res.json(db.prepare(def.list).all());
  });

  r.patch('/:resource/:id/status', (req, res) => {
    const def = RESOURCES[req.params.resource];
    if (!def) throw new HttpError(404, 'Recurso no encontrado');
    const status = statusSchemas[req.params.resource].parse(req.body?.status);
    const info = db.prepare(`UPDATE ${def.table} SET status=? WHERE id=?`).run(status, Number(req.params.id));
    if (!info.changes) throw new HttpError(404, 'No encontrado');
    res.json({ ok: true });
  });

  return r;
}
