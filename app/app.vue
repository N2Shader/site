<script setup lang="ts">
// <html lang> follows the route's locale. Alternates and other SEO tags come with ticket 02.
const localeHead = useLocaleHead({ dir: false, seo: false })
useHead({ htmlAttrs: { lang: () => localeHead.value.htmlAttrs.lang } })
</script>

<template>
  <BackgroundScene />
  <NuxtPage />
</template>
