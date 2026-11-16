<script setup lang="ts">
// The flag next to the locale switch's code: the United Kingdom for English (en-GB), Spain for Spanish (es-ES).
// Decorative and `aria-hidden`: the link's text already names the language. Drawn inline, because flag emoji show as
// plain letters on Windows. Spain's is the plain flag without the coat of arms, which is unreadable at this size.
defineProps<{ localeCode: string }>()
</script>

<template>
  <svg
    v-if="localeCode === 'en'"
    class="locale-flag"
    viewBox="0 0 60 30"
    aria-hidden="true"
    focusable="false"
  >
    <clipPath id="locale-flag-union-jack-diagonals">
      <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
    </clipPath>
    <path d="M0 0v30h60V0z" fill="#012169" />
    <path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6" />
    <path
      d="M0 0l60 30m0-30L0 30"
      clip-path="url(#locale-flag-union-jack-diagonals)"
      stroke="#c8102e"
      stroke-width="4"
    />
    <path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10" />
    <path d="M30 0v30M0 15h60" stroke="#c8102e" stroke-width="6" />
  </svg>
  <svg
    v-else
    class="locale-flag"
    viewBox="0 0 750 500"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M0 0h750v500H0z" fill="#aa151b" />
    <path d="M0 125h750v250H0z" fill="#f1bf00" />
  </svg>
</template>

<style scoped>
/* The same height for both; the width follows each flag's own proportions (2:1 and 3:2). */
.locale-flag {
  display: block;
  block-size: 0.9em;
  inline-size: auto;
  flex-shrink: 0;
}
</style>
