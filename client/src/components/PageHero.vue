<script setup>
defineProps({ eyebrow: String, title: String, lead: String });
</script>

<template>
  <section class="hero hero--page">
    <div class="container">
      <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
      <h1>{{ title }}</h1>
      <p v-if="lead" class="lead">{{ lead }}</p>
      <slot />
    </div>
  </section>
</template>
