<script setup lang="ts">
// The locale switch: a real link to the other locale (ADR-0002), shown as that locale's flag and two-letter code
// ("EN", "ES") on a paper-coloured chip (`.paper-chip`, base.css). The chip stays out of the content layer's difference
// blend (owner's choice, ADR-0009), so the flag keeps its true colours: plain dark text on paper over both paper and ink.
// The hidden part names the language and says what the link does, in the other locale's language (the link's `lang`),
// since whoever follows it reads that language. The accessible name starts with the visible code (2.5.3).
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

// ADR-0002 fixes two locales, so the other one is the one that isn't current.
const otherLocale = computed(() => locales.value.find((configuredLocale) => configuredLocale.code !== locale.value)!)
const otherLocaleAbbreviation = computed(() => otherLocale.value.code.toUpperCase())
</script>

<template>
  <NuxtLink
    class="locale-switch paper-chip"
    :to="switchLocalePath(otherLocale.code)"
    :hreflang="otherLocale.language"
    :lang="otherLocale.language"
  >
    <LocaleFlag :locale-code="otherLocale.code" />
    {{ otherLocaleAbbreviation }}<span class="locale-switch__hint">, {{ otherLocale.name }}: {{ t('localeSwitch.hintInOtherLocale') }}</span>
  </NuxtLink>
</template>

<style scoped>
/* Top-right corner, on the same inset as the content stack (ticket 06). */
.locale-switch {
  position: fixed;
  inset-block-start: calc(env(safe-area-inset-top) + var(--space-edge));
  inset-inline-end: calc(env(safe-area-inset-right) + var(--space-edge));
  /* A 44px target (2.5.5, AAA) around the short label. */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4em;
  min-block-size: 44px;
  min-inline-size: 44px;
  /* The chip's paper colour and dark text come from `.paper-chip` (base.css). */
  padding-block: 0;
  font-size: var(--type-small);
  line-height: 1.4;
}

/* Read by screen readers, never shown. */
.locale-switch__hint {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
