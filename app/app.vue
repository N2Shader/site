<script setup lang="ts">
// <html lang>, canonical, hreflang (en, es, x-default) and og:locale come from @nuxtjs/i18n (ADR-0002).
// The locale switch comes first in the tab order, so a visitor who can't read this locale finds the other one first.
// The analytics consent banner comes last: it renders only in the browser, after the stored choice is read (ADR-0006).
const localeHead = useLocaleHead({ dir: false, seo: true })
useHead({
  htmlAttrs: { lang: () => localeHead.value.htmlAttrs.lang },
  link: () => localeHead.value.link,
  meta: () => localeHead.value.meta,
})
</script>

<template>
  <BackgroundScene />
  <LocaleSwitch />
  <NuxtPage />
  <AnalyticsConsentBanner />
</template>
