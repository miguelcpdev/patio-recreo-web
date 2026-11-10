import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export function openDb(path = process.env.DB_PATH || './data/patio.db') {
  if (path !== ':memory:') {
    const abs = resolve(here, '..', path);
    mkdirSync(dirname(abs), { recursive: true });
    path = abs;
  }
  const db = new DatabaseSync(path);
  db.exec(readFileSync(resolve(here, 'schema.sql'), 'utf8'));
  return db;
}

/** Ejecuta fn dentro de una transacción. */
export function tx(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
