import bcrypt from 'bcryptjs';

const addons = [
  // code, category, name, description, price_cents, unit, min_cents
  ['hinchable', 'animation', 'Castillo hinchable grande', '10-12 niñ@s. 1h con monitor/a + 2h adicionales bajo supervisión de los padres.', 200, 'per_child', 3000],
  ['scooters', 'animation', 'Scooters eléctricos', '5 uds · 5 min por vuelta · edad mínima 7-8 años. 1h con monitor/a.', 5000, 'per_hour', 0],
  ['wipeout', 'animation', 'Barredora wipe out', '8 niñ@s por turno · 5 min cada turno. 1h repartida en 2 tramos.', 6000, 'per_hour', 0],
  ['ruloway', 'animation', 'Ruloway', '2 personas por vuelta · 12 viajes garantizados en 1h con monitor/a.', 7000, 'per_hour', 0],
  ['laser-tag', 'animation', 'Láser tag', '25 jugadores simultáneos · 1h con monitor/a · equipos o todos contra todos.', 800, 'per_child', 0],
  ['perritos', 'snack', 'Perritos', 'Complemento de merienda', 150, 'per_child', 0],
  ['pizza', 'snack', 'Pizza', 'Complemento de merienda', 200, 'per_child', 0],
  ['fruta', 'snack', 'Fruta', 'Complemento de merienda', 100, 'per_child', 0],
  ['postre', 'snack', 'Postre individual', 'Complemento de merienda', 500, 'per_child', 0],
  ['tarta-sin-alergenos', 'snack', 'Tarta sin alérgenos', 'Complemento de merienda', 150, 'per_child', 0],
  ['empanada', 'parents', 'Empanada 1,5 kg', 'Picoteo para padres', null, 'fixed', 0],
  ['tortilla', 'parents', 'Tortilla', 'Picoteo para padres', null, 'fixed', 0],
  ['embutidos', 'parents', 'Tabla de embutidos', 'Picoteo para padres', null, 'fixed', 0],
  ['bizcocho', 'parents', 'Bizcocho', 'Picoteo para padres', null, 'fixed', 0]
];

const rentals = [
  ['food-truck', 'Food Truck', 'Añade un toque especial a tu evento con nuestro food truck, disponible para ofrecer una variedad de deliciosos snacks.'],
  ['hinchables', 'Hinchables', 'Los hinchables siempre son un éxito entre los más pequeños. Elige entre nuestro castillo hinchable o la barredora wipe out.'],
  ['atracciones', 'Atracciones', 'Incorpora nuestras atracciones como el Ruloway o los scooters eléctricos para añadir emoción a tu fiesta.'],
  ['equipamiento', 'Equipamiento', '¿Quieres capturar recuerdos? Nuestro fotomatón y equipo de karaoke son perfectos para cualquier celebración.'],
  ['mobiliario', 'Mobiliario', 'Sillas modelo "Garrotxa" y mesas plegables de 0,90 × 2,00 m para tu evento o fiesta privada.']
];

const faqs = [
  ['¿Qué tipo de eventos de cumpleaños pueden organizarse en El Patio de Mi Recreo?', 'Desde fiestas infantiles temáticas hasta celebraciones para adultos. Nuestro equipo se adapta a tus preferencias para que tu evento sea único y especial.'],
  ['¿Qué actividades de ocio y entretenimiento existen además de eventos privados?', 'Eventos deportivos, ferias gastronómicas, actividades culturales y dirigidas. Puedes unirte a nuestras actividades programadas o alquilar las instalaciones para eventos privados.'],
  ['¿Qué incluye el pack básico de los cumpleaños infantiles?', 'Uso exclusivo de las instalaciones (2.000 m²); ocio (pista de fútbol de 13 × 20 m, futbolines, air hockey, karaoke, juegos de mesa, canasta, red de vóley…); y merienda (sándwiches variados, snacks, gominolas, chocolatina, bebidas, tarta y cono de chuches). La oferta de ocio se renueva continuamente.'],
  ['¿Cuándo se cobra el PLUS de CUMPLE CONJUNTO?', 'En cumpleaños de 2 o más cumpleañer@s que no alcancen los 30 niñ@s. Excepción: si son familia directa (hermanos/mellizos) se regalan 20 minutos de alguna atracción según la opción contratada.']
];

const testimonials = [
  ['Familia de Narón', 'Los niños no querían irse. Mucho espacio, monitores atentos y todo organizado. Repetiremos.', 5],
  ['Marta R.', 'Celebramos la cena de empresa y fue un acierto: capacidad de sobra y trato inmejorable.', 5],
  ['Carlos y Lucía', 'La pista y los futbolines fueron el éxito del cumple de nuestro hijo. Precio muy ajustado.', 5]
];

function nextDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const events = [
  ['noche-de-monologos', 'Noche de monólogos', 'Una noche de humor con artistas gallegos. Entradas limitadas.', 'monologo', `${nextDays(21)}T21:30`, 500, 1200],
  ['cena-baile-navidad', 'Cena baile de Navidad', 'Cenas de empresa y amigos con baile y DJ. Menú cerrado.', 'cena', `${nextDays(45)}T21:00`, 500, 3500],
  ['campamento-urbano', 'Campamento urbano', 'Semana de actividades deportivas, juegos y talleres para niñ@s.', 'campamento', `${nextDays(60)}T09:00`, 60, 8500]
];

export function seedIfEmpty(db, { adminEmail, adminPassword } = {}) {
  const count = (t) => db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c;

  if (!count('birthday_addons')) {
    const st = db.prepare(
      'INSERT INTO birthday_addons (code,category,name,description,price_cents,unit,min_cents,position) VALUES (?,?,?,?,?,?,?,?)'
    );
    addons.forEach((a, i) => st.run(...a, i));
  }
  if (!count('rental_items')) {
    const st = db.prepare('INSERT INTO rental_items (slug,name,description,position) VALUES (?,?,?,?)');
    rentals.forEach((r, i) => st.run(...r, i));
  }
  if (!count('faqs')) {
    const st = db.prepare('INSERT INTO faqs (question,answer,position) VALUES (?,?,?)');
    faqs.forEach((f, i) => st.run(...f, i));
  }
  if (!count('testimonials')) {
    const st = db.prepare('INSERT INTO testimonials (author,text,rating) VALUES (?,?,?)');
    testimonials.forEach((t) => st.run(...t));
  }
  if (!count('events')) {
    const st = db.prepare(
      'INSERT INTO events (slug,title,description,category,starts_at,capacity,price_cents) VALUES (?,?,?,?,?,?,?)'
    );
    events.forEach((e) => st.run(...e));
  }
  if (adminEmail && adminPassword && !count('admin_users')) {
    db.prepare('INSERT INTO admin_users (email,password_hash) VALUES (?,?)').run(
      adminEmail.toLowerCase(),
      bcrypt.hashSync(adminPassword, 12)
    );
  }
}
