<script setup>
import { computed } from 'vue';
import PageHero from '../components/PageHero.vue';
import { SITE } from '../site.js';

const props = defineProps({ doc: String });

// BORRADOR: revisar con asesoría legal antes de publicar.
const docs = {
  'aviso-legal': {
    title: 'Aviso legal',
    sections: [
      ['Titular', `${SITE.legalName}. Domicilio: ${SITE.addressLine}. Email: ${SITE.email}. Teléfono: ${SITE.phone}. [Completar CIF y datos registrales]`],
      ['Condiciones de uso', 'El acceso a este sitio atribuye la condición de usuario e implica la aceptación de estas condiciones. El titular puede modificar los contenidos en cualquier momento.'],
      ['Propiedad intelectual', 'Los contenidos, textos, imágenes y diseño son titularidad del responsable o se usan con licencia; queda prohibida su reproducción sin autorización.'],
      ['Legislación', 'Este aviso se rige por la legislación española.']
    ]
  },
  privacidad: {
    title: 'Política de privacidad',
    sections: [
      ['Responsable', `${SITE.legalName}, ${SITE.addressLine}. Contacto: ${SITE.email}.`],
      ['Finalidad', 'Atender consultas, gestionar solicitudes de reserva de cumpleaños, alquiler de material y reservas de entradas.'],
      ['Base jurídica', 'Consentimiento del interesado y ejecución de medidas precontractuales a petición suya (art. 6.1 a y b RGPD).'],
      ['Conservación', 'Durante el tiempo necesario para atender la solicitud y las obligaciones legales aplicables.'],
      ['Destinatarios', 'No se ceden datos a terceros salvo obligación legal.'],
      ['Derechos', `Acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a ${SITE.email}. Puedes reclamar ante la AEPD (aepd.es).`]
    ]
  },
  cookies: {
    title: 'Política de cookies',
    sections: [
      ['Qué usamos', 'Almacenamiento local técnico para recordar tu elección de cookies y la sesión del panel de administración. No usamos cookies publicitarias.'],
      ['Contenido externo', 'El mapa de Google solo se carga si aceptas. Google puede instalar sus propias cookies en ese caso.'],
      ['Cómo gestionarlas', 'Borra los datos del sitio en tu navegador para volver a ver el aviso y cambiar tu elección.']
    ]
  },
  accesibilidad: {
    title: 'Declaración de accesibilidad',
    sections: [
      ['Compromiso', 'Trabajamos para que este sitio sea accesible según las pautas WCAG 2.1 nivel AA: navegación por teclado, enlace para saltar al contenido, contraste suficiente y etiquetas en formularios.'],
      ['Contacto', `Si encuentras una barrera de accesibilidad, escríbenos a ${SITE.email}.`]
    ]
  }
};
const d = computed(() => docs[props.doc]);
</script>

<template>
  <PageHero :title="d.title" />
  <section class="section">
    <div class="container prose">
      <template v-for="[h, p] in d.sections" :key="h">
        <h2>{{ h }}</h2>
        <p>{{ p }}</p>
      </template>
    </div>
  </section>
</template>
