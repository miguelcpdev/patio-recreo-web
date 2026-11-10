import { openDb } from './db.js';
import { seedIfEmpty } from './seed.js';

const db = openDb();
seedIfEmpty(db, {
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD
});
console.log('Base de datos inicializada.');
