// Reglas de precio de cumpleaños (céntimos). Fuente: web actual.
export const BASE_CENTS = 30000;          // hasta 15 niños
export const BASE_KIDS = 15;
export const EXTRA_KID_CENTS = 1900;      // niño adicional
export const WEEKEND_PER_KID_CENTS = 150; // viernes a domingo
export const WEEKEND_MIN_CENTS = 2250;
export const JOINT_PER_KID_CENTS = 150;   // cumple conjunto
export const JOINT_EXEMPT_FROM_KIDS = 30; // a partir de 30 niños no se cobra

const SLOTS = {
  1: ['17:00-20:00'],
  2: ['17:00-20:00'],
  3: ['17:00-20:00'],
  4: ['17:00-20:00'],
  5: ['17:00-20:00', '21:00-00:00'],
  6: ['11:00-14:00', '17:00-20:00', '21:00-00:00'],
  0: ['11:00-14:00', '17:00-20:00']
};

export function parseDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso ? null : d;
}

export function slotsForDate(iso) {
  const d = parseDate(iso);
  return d ? SLOTS[d.getUTCDay()] : [];
}

export function isWeekendPricing(iso) {
  const day = parseDate(iso)?.getUTCDay();
  return day === 5 || day === 6 || day === 0;
}

export function addonCost(addon, kids, quantity = 1) {
  if (addon.price_cents == null) return null; // a consultar
  let cost;
  if (addon.unit === 'per_child') cost = addon.price_cents * kids;
  else if (addon.unit === 'per_hour') cost = addon.price_cents * quantity;
  else cost = addon.price_cents * quantity;
  return Math.max(cost, addon.min_cents || 0);
}

/**
 * @param {{date:string,kids:number,joint:boolean,items:{addon:object,quantity:number}[]}} input
 */
export function computeQuote({ date, kids, joint, items = [] }) {
  const lines = [];
  lines.push({ key: 'base', label: `Pack básico (hasta ${BASE_KIDS} niñ@s)`, cents: BASE_CENTS });

  const extraKids = Math.max(0, kids - BASE_KIDS);
  if (extraKids) {
    lines.push({
      key: 'extra_kids',
      label: `${extraKids} niñ@(s) adicional(es) × 19 €`,
      cents: extraKids * EXTRA_KID_CENTS
    });
  }
  if (isWeekendPricing(date)) {
    lines.push({
      key: 'weekend',
      label: 'Suplemento fin de semana (vie-dom)',
      cents: Math.max(kids * WEEKEND_PER_KID_CENTS, WEEKEND_MIN_CENTS)
    });
  }
  if (joint && kids < JOINT_EXEMPT_FROM_KIDS) {
    lines.push({ key: 'joint', label: 'Plus cumple conjunto', cents: kids * JOINT_PER_KID_CENTS });
  }

  let onRequest = false;
  for (const { addon, quantity } of items) {
    const cents = addonCost(addon, kids, quantity);
    if (cents == null) {
      onRequest = true;
      lines.push({ key: addon.code, label: `${addon.name} (a consultar)`, cents: 0, onRequest: true });
    } else {
      lines.push({ key: addon.code, label: addon.name, cents });
    }
  }
  const totalCents = lines.reduce((sum, l) => sum + l.cents, 0);
  return { lines, totalCents, onRequest };
}
