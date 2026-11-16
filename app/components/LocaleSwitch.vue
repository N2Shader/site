<script setup lang="ts">
// The locale switch: a real link to the other locale, named in that locale's own language (ADR-0002).
// `.content-layer` so it inverts over the ink (ADR-0009). Fixed on the link itself, never on a wrapper: a wrapper
// would become a stacking context and cut the link's blend off from the ink (ticket 16).
// The hidden hint tells screen readers what the link does. It's in the other locale's language (the link's `lang`),
// since whoever follows it reads that language, and the name starts with the visible label (2.5.3).
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

// ADR-0002 fixes two locales, so the other one is the one that isn't current.
const otherLocale = computed(() => locales.value.find((configuredLocale) => configuredLocale.code !== locale.value)!)
</script>

<template>
  <NuxtLink
    class="locale-switch content-layer"
    :to="switchLocalePath(otherLocale.code)"
    :hreflang="otherLocale.language"
    :lang="otherLocale.language"
  >
    {{ otherLocale.name }}<span class="locale-switch__hint">: {{ t('localeSwitch.hintInOtherLocale') }}</span>
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
  min-block-size: 44px;
  min-inline-size: 44px;
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
