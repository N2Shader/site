<script setup lang="ts">
// The landing page's content layer: everything here is prerendered and indexable (ADR-0001).
const { t } = useI18n()
useLandingPageMeta()
useOrganizationSchema()
// The parts the content reveal animates carry `data-content-reveal-part` (app/reveal/ContentReveal.ts).
useContentReveal()
</script>

<template>
  <main class="landing-page content-layer">
    <div class="landing-page__masthead">
      <CompanyLogo data-content-reveal-part="logo" />
      <h1 class="landing-page__company-name" data-content-reveal-part="company-name">N2Shader</h1>
    </div>
    <p class="landing-page__description" data-content-reveal-part="description">{{ t('landingPage.description') }}</p>
    <ContactDetailsList class="landing-page__contact-details" data-content-reveal-part="contact-details" />
  </main>
</template>

<style scoped>
/* One block stacked in the top-left corner; the top-right corner is kept for the locale switch (ticket 02). */
.landing-page {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-stack);
  max-block-size: 100%;
  /* Clip, not hide: focusing a clipped link can't scroll the locked page (ADR-0004). */
  overflow: clip;
  max-inline-size: min(100%, 44rem);
  padding: var(--space-edge);
}

/* The logo sits on the company name's line, to its left. */
.landing-page__masthead {
  display: flex;
  align-items: center;
  gap: var(--space-stack);
}

.landing-page__company-name {
  margin: 0;
  font-size: var(--type-display);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}

.landing-page__description {
  margin: 0;
  /*
   * Wide enough that the paragraph takes four lines (en) or three (es) on a 568×320 landscape phone, so the whole
   * stack is about 240px tall there now the logo sits beside the company name (worked out from the tokens, not yet seen
   * in a browser), and under AAA's 80 characters per line (1.4.8).
   */
  max-inline-size: 60ch;
  font-size: var(--type-body);
  line-height: 1.35;
  /* `pretty`, not `balance`: browsers stop balancing after a few lines. */
  text-wrap: pretty;
}

.landing-page__contact-details {
  margin-block-start: var(--space-stack);
}
</style>
