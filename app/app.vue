<script setup lang="ts">
// <html lang>, canonical, hreflang (en, es, x-default) and og:locale come from @nuxtjs/i18n (ADR-0002).
// The locale switch comes first in the tab order, so a visitor who can't read this locale finds the other one first.
// It's hidden for now (owner's choice, 2026-11-20); /es still exists and the hreflang links still point to it.
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
  <!-- Hidden for now (owner's choice, 2026-11-20); uncomment to bring the locale switch back. -->
  <!-- <LocaleSwitch /> -->
  <NuxtPage />
  <AnalyticsConsentBanner />
</template>
