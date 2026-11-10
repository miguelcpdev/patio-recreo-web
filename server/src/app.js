import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicRoutes } from './routes/public.js';
import { adminRoutes } from './routes/admin.js';
import { HttpError } from './http.js';
import { ZodError } from 'zod';

const here = dirname(fileURLToPath(import.meta.url));

export function createApp(db, { jwtSecret, clientOrigin, serveClient = true } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'img-src': ["'self'", 'data:', 'https:'],
          'frame-src': ["'self'", 'https://www.google.com'],
          'script-src': ["'self'"],
          'style-src': ["'self'", "'unsafe-inline'"]
        }
      }
    })
  );
  if (clientOrigin) app.use(cors({ origin: clientOrigin.split(','), credentials: false }));
  app.use(express.json({ limit: '50kb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  const formLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes, inténtalo más tarde.' }
  });
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { error: 'Demasiados intentos de acceso.' }
  });

  app.use('/api/admin', adminRoutes(db, { jwtSecret, loginLimiter }));
  app.use('/api', publicRoutes(db, { formLimiter }));
  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Recurso no encontrado')));

  // Front compilado (producción) con fallback SPA
  const dist = resolve(here, '../../client/dist');
  if (serveClient && existsSync(dist)) {
    app.use(express.static(dist, { maxAge: '1h', index: false }));
    app.get('/{*splat}', (_req, res) => res.sendFile(resolve(dist, 'index.html')));
  }

  app.use((err, _req, res, _next) => {
    if (err instanceof ZodError) {
      return res.status(422).json({
        error: 'Datos no válidos',
        fields: Object.fromEntries(err.issues.map((i) => [i.path.join('.') || '_', i.message]))
      });
    }
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON no válido' });
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  return app;
}
