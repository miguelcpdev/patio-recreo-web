import { z } from 'zod';

const text = (max) => z.string().trim().min(1).max(max);
const phone = z
  .string()
  .trim()
  .regex(/^[+\d][\d\s().-]{7,18}$/, 'Teléfono no válido');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida');

export const contactSchema = z.object({
  topic: z.enum(['general', 'cumpleanos', 'eventos', 'alquiler', 'entradas']).default('general'),
  name: text(80),
  surname: z.string().trim().max(120).optional().default(''),
  email: z.string().trim().email().max(160),
  phone,
  message: text(2000),
  privacy: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar la política de privacidad' }) }),
  website: z.string().max(0).optional() // honeypot
});

export const quoteSchema = z.object({
  date: isoDate,
  kids: z.number().int().min(1).max(60),
  joint: z.boolean().default(false),
  addons: z
    .array(z.object({ code: z.string().max(60), quantity: z.number().int().min(1).max(5).default(1) }))
    .max(20)
    .default([])
});

export const bookingSchema = quoteSchema.extend({
  slot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/),
  honoreeNames: text(200),
  contactName: text(120),
  email: z.string().trim().email().max(160),
  phone,
  notes: z.string().trim().max(1000).optional().default(''),
  privacy: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar la política de privacidad' }) }),
  website: z.string().max(0).optional()
});

export const rentalRequestSchema = z.object({
  name: text(120),
  email: z.string().trim().email().max(160),
  phone,
  eventDate: isoDate,
  location: z.string().trim().max(200).optional().default(''),
  message: z.string().trim().max(1000).optional().default(''),
  privacy: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar la política de privacidad' }) }),
  website: z.string().max(0).optional()
});

export const ticketSchema = z.object({
  name: text(120),
  email: z.string().trim().email().max(160),
  phone,
  quantity: z.number().int().min(1).max(20),
  privacy: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar la política de privacidad' }) }),
  website: z.string().max(0).optional()
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200)
});

export const eventSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(80),
  title: text(120),
  description: text(2000),
  category: z.enum(['concierto', 'monologo', 'cena', 'feria', 'deporte', 'campamento', 'otro']),
  startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  endsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/).nullable().optional(),
  capacity: z.number().int().min(1).max(5000),
  priceCents: z.number().int().min(0).max(1_000_000),
  published: z.boolean().default(true)
});

export const statusSchemas = {
  contacts: z.enum(['new', 'read', 'answered', 'archived']),
  bookings: z.enum(['pending', 'confirmed', 'cancelled']),
  rentals: z.enum(['new', 'quoted', 'confirmed', 'rejected']),
  tickets: z.enum(['reserved', 'paid', 'cancelled'])
};
