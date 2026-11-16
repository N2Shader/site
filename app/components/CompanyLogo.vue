<script setup lang="ts">
// The logo's original artwork inlined so it inherits the text colour and gets an accessible name.
// public/favicon.svg is a bolder variant of these paths that reads at 16px (ticket 08); don't copy its stroke here.
const { t } = useI18n()
</script>

<template>
  <svg
    class="company-logo"
    role="img"
    :aria-label="t('landingPage.logoLabel')"
    viewBox="22 10 106 106"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="miter"
    stroke-linecap="butt"
  >
    <path d="M65 13.6 L125 62.8 L65 112.7 L25.4 80 L84.5 29.6" />
    <path d="M65 13.6 V112.7" />
    <path d="M105 46.4 L65 79.2" />
    <path d="M45.4 62.9 L84.4 96.6" />
  </svg>
</template>

<style scoped>
.company-logo {
  display: block;
  flex-shrink: 0;
  width: var(--logo-size);
  height: var(--logo-size);
}
</style>
