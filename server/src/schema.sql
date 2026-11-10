PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- Administradores del panel
CREATE TABLE IF NOT EXISTS admin_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Formulario de contacto / consultas generales
CREATE TABLE IF NOT EXISTS contact_messages (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  topic             TEXT NOT NULL DEFAULT 'general'
                    CHECK (topic IN ('general','cumpleanos','eventos','alquiler','entradas')),
  name              TEXT NOT NULL,
  surname           TEXT,
  email             TEXT NOT NULL,
  phone             TEXT NOT NULL,
  message           TEXT NOT NULL,
  privacy_accepted  INTEGER NOT NULL CHECK (privacy_accepted = 1),
  status            TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','answered','archived')),
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status, created_at);

-- Catálogo de extras de cumpleaños (animaciones, merienda, picoteo padres)
CREATE TABLE IF NOT EXISTS birthday_addons (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  code         TEXT NOT NULL UNIQUE,
  category     TEXT NOT NULL CHECK (category IN ('animation','snack','parents')),
  name         TEXT NOT NULL,
  description  TEXT,
  price_cents  INTEGER,                 -- NULL = precio a consultar
  unit         TEXT NOT NULL CHECK (unit IN ('fixed','per_child','per_hour')),
  min_cents    INTEGER NOT NULL DEFAULT 0,
  active       INTEGER NOT NULL DEFAULT 1,
  position     INTEGER NOT NULL DEFAULT 0
);

-- Reservas de cumpleaños (una por fecha + franja)
CREATE TABLE IF NOT EXISTS birthday_bookings (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  ref            TEXT NOT NULL UNIQUE,
  date           TEXT NOT NULL,                 -- YYYY-MM-DD
  slot           TEXT NOT NULL,                 -- HH:MM-HH:MM
  kids           INTEGER NOT NULL CHECK (kids BETWEEN 1 AND 60),
  honoree_names  TEXT NOT NULL,
  joint          INTEGER NOT NULL DEFAULT 0,
  contact_name   TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT NOT NULL,
  notes          TEXT,
  total_cents    INTEGER NOT NULL,
  on_request     INTEGER NOT NULL DEFAULT 0,    -- hay extras sin precio cerrado
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','confirmed','cancelled')),
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Evita doble reserva de la misma franja salvo que esté cancelada
CREATE UNIQUE INDEX IF NOT EXISTS uq_birthday_slot
  ON birthday_bookings(date, slot) WHERE status <> 'cancelled';

CREATE TABLE IF NOT EXISTS birthday_booking_addons (
  booking_id   INTEGER NOT NULL REFERENCES birthday_bookings(id) ON DELETE CASCADE,
  addon_id     INTEGER NOT NULL REFERENCES birthday_addons(id),
  quantity     INTEGER NOT NULL DEFAULT 1,
  total_cents  INTEGER NOT NULL,
  PRIMARY KEY (booking_id, addon_id)
);

-- Alquiler de atracciones y equipamiento
CREATE TABLE IF NOT EXISTS rental_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL,
  price_note   TEXT NOT NULL DEFAULT 'Precio a consultar',
  active       INTEGER NOT NULL DEFAULT 1,
  position     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rental_requests (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id     INTEGER NOT NULL REFERENCES rental_items(id),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  event_date  TEXT NOT NULL,
  location    TEXT,
  message     TEXT,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','quoted','confirmed','rejected')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Eventos programados y venta de entradas (sin pasarela de pago todavía)
CREATE TABLE IF NOT EXISTS events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('concierto','monologo','cena','feria','deporte','campamento','otro')),
  starts_at    TEXT NOT NULL,                  -- ISO local: YYYY-MM-DDTHH:MM
  ends_at      TEXT,
  capacity     INTEGER NOT NULL CHECK (capacity > 0),
  price_cents  INTEGER NOT NULL DEFAULT 0,
  published    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(published, starts_at);

-- Reservas de entradas. Se quedan en 'reserved' hasta integrar la pasarela.
CREATE TABLE IF NOT EXISTS ticket_reservations (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ref          TEXT NOT NULL UNIQUE,
  event_id     INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  total_cents  INTEGER NOT NULL,
  status       TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','paid','cancelled')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON ticket_reservations(event_id, status);

CREATE TABLE IF NOT EXISTS faqs (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  question  TEXT NOT NULL,
  answer    TEXT NOT NULL,
  position  INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS testimonials (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  author     TEXT NOT NULL,
  text       TEXT NOT NULL,
  rating     INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  published  INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
