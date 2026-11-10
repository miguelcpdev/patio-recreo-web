import { randomBytes } from 'node:crypto';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Referencia legible, p. ej. CUM-7F3A9C */
export function makeRef(prefix) {
  return `${prefix}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

/** Si el honeypot viene relleno, respondemos OK sin guardar nada. */
export function isBot(body) {
  return typeof body?.website === 'string' && body.website.length > 0;
}
