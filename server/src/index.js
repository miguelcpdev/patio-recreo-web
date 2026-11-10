import { openDb } from './db.js';
import { seedIfEmpty } from './seed.js';
import { createApp } from './app.js';

const isProd = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  if (isProd) {
    console.error('JWT_SECRET debe definirse con al menos 32 caracteres en producción.');
    process.exit(1);
  }
  console.warn('[aviso] JWT_SECRET no definido o corto; usando valor de desarrollo.');
}

const db = openDb();
seedIfEmpty(db, {
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD
});

const app = createApp(db, {
  jwtSecret: jwtSecret || 'dev-only-secret-dev-only-secret-dev-only',
  clientOrigin: process.env.CLIENT_ORIGIN
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`API escuchando en http://localhost:${port}`));
