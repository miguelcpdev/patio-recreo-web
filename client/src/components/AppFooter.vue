<script setup>
import { SITE, NAV } from '../site.js';
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="grid grid--3">
        <div>
          <img class="footer-logo" src="/images/logo-light.svg" width="457" height="168" :alt="SITE.name" loading="lazy" />
          <p>2.000 m² de ocio, cultura, deporte y turismo en Narón.</p>
        </div>
        <div>
          <h3>Navegación</h3>
          <ul>
            <li v-for="n in NAV" :key="n.to"><RouterLink :to="n.to">{{ n.label }}</RouterLink></li>
          </ul>
        </div>
        <div>
          <h3>Contacto</h3>
          <ul>
            <li><a :href="`tel:${SITE.phoneIntl}`">{{ SITE.phone }}</a></li>
            <li><a :href="`mailto:${SITE.email}`">{{ SITE.email }}</a></li>
            <li>{{ SITE.addressLine }}</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© {{ new Date().getFullYear() }} {{ SITE.legalName }} Todos los derechos reservados.</span>
        <nav aria-label="Legal">
          <RouterLink to="/politica-privacidad">Privacidad</RouterLink>
          <RouterLink to="/aviso-legal">Aviso legal</RouterLink>
          <RouterLink to="/politica-cookies">Cookies</RouterLink>
          <RouterLink to="/declaracion-accesibilidad">Accesibilidad</RouterLink>
        </nav>
      </div>
    </div>
    <a class="whatsapp" :href="SITE.whatsapp" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.2-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.400-5.900c-.2-.1-1.400-.7-1.600-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.500 6.500 0 0 1-3.200-2.800c-.2-.4.200-.4.700-1.300.1-.2 0-.3 0-.5l-.7-1.600c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.300-.2.300-.9.900-.9 2.100s.9 2.500 1 2.600c.1.2 1.800 2.800 4.400 3.900 1.600.7 2.200.7 3 .6.500-.1 1.400-.6 1.600-1.200.2-.600.2-1.100.1-1.200 0-.1-.2-.2-.5-.3z"/></svg>
    </a>
  </footer>
</template>
