<script setup lang="ts">
// The consent banner for Google Analytics (ADR-0006): small, bottom-right, on a paper-coloured chip that never inverts
// over the ink (`.paper-chip`, base.css). Accept and Reject look the same, so rejecting is as easy as accepting.
// After a choice only the "Cookies" button stays, to reopen the banner and change it. Nothing renders until the
// stored choice has been read in the browser, so the prerendered HTML has no banner and returning visitors see no flash.
// The `<section>`, named in the current locale, keeps the banner in a landmark (axe `region`). Focus moves with the
// toggle, so a keyboard user never lands on a button that just disappeared.
const { t } = useI18n()
const { isBannerOpen, hasReadStoredChoice, acceptAnalytics, rejectAnalytics, reopenBanner } = useAnalyticsConsent()

const consentQuestion = useTemplateRef<HTMLParagraphElement>('consentQuestion')
const reopenButton = useTemplateRef<HTMLButtonElement>('reopenButton')

const focusElementAfterRender = async (element: { readonly value: HTMLElement | null }) => {
  await nextTick()
  element.value?.focus()
}

// Accept and Reject both close the banner, so focus goes to the "Cookies" button that replaces it.
const chooseThenFocusReopenButton = (makeChoice: () => void) => () => {
  makeChoice()
  focusElementAfterRender(reopenButton)
}

const acceptAndFocusReopenButton = chooseThenFocusReopenButton(acceptAnalytics)
const rejectAndFocusReopenButton = chooseThenFocusReopenButton(rejectAnalytics)

const reopenAndFocusQuestion = () => {
  reopenBanner()
  focusElementAfterRender(consentQuestion)
}
</script>

<template>
  <section
    v-if="hasReadStoredChoice"
    class="analytics-consent paper-chip"
    :class="{ 'analytics-consent--open': isBannerOpen }"
    :aria-label="t('analyticsConsent.regionLabel')"
  >
    <template v-if="isBannerOpen">
      <p ref="consentQuestion" class="analytics-consent__question" tabindex="-1">{{ t('analyticsConsent.question') }}</p>
      <div class="analytics-consent__actions">
        <button type="button" class="analytics-consent__choice" @click="acceptAndFocusReopenButton">
          {{ t('analyticsConsent.accept') }}
        </button>
        <button type="button" class="analytics-consent__choice" @click="rejectAndFocusReopenButton">
          {{ t('analyticsConsent.reject') }}
        </button>
      </div>
    </template>
    <button v-else ref="reopenButton" type="button" class="analytics-consent__reopen" @click="reopenAndFocusQuestion">
      {{ t('analyticsConsent.reopen') }}<span class="analytics-consent__hint">, {{ t('analyticsConsent.reopenHint') }}</span>
    </button>
  </section>
</template>

<style scoped>
/* Bottom-right corner, on the same inset as the content stack and the locale switch. */
.analytics-consent {
  position: fixed;
  inset-block-end: calc(env(safe-area-inset-bottom) + var(--space-edge));
  inset-inline-end: calc(env(safe-area-inset-right) + var(--space-edge));
  /* The chip's paper colour and dark text come from `.paper-chip` (base.css). */
  font-size: var(--type-small);
  line-height: 1.4;
  /* Fades up into place when it first renders (ease-out, 200ms), so it doesn't pop in. */
  transition:
    opacity 200ms cubic-bezier(0.23, 1, 0.32, 1),
    transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
}

@starting-style {
  .analytics-consent {
    opacity: 0;
    transform: translateY(0.5rem);
  }
}

/* Reduced motion: the fade only, no movement. */
@media (prefers-reduced-motion: reduce) {
  .analytics-consent {
    transition: opacity 200ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  @starting-style {
    .analytics-consent {
      transform: none;
    }
  }
}

.analytics-consent--open {
  max-inline-size: min(calc(100vw - 2 * var(--space-edge)), 24rem);
  padding: 0.75em 1em;
  /* A faint edge, so the banner reads as one box over bare paper. */
  box-shadow: 0 0 0 1px rgb(20 20 20 / 0.2);
}

.analytics-consent__question {
  margin: 0 0 0.6em;
}

.analytics-consent__actions {
  display: flex;
  gap: 0.6em;
}

/* Every banner button: a 44px target (2.5.5, AAA) in the chip's own text. */
.analytics-consent__choice,
.analytics-consent__reopen {
  min-block-size: 44px;
  min-inline-size: 44px;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

/* Accept and Reject share one style, so rejecting is as prominent as accepting. */
.analytics-consent__choice {
  padding: 0 1em;
  border: 1px solid currentColor;
  border-radius: 0.25rem;
}

.analytics-consent__reopen {
  padding: 0 0.25em;
  border: 0;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
  cursor: pointer;
}

@media (hover: hover) {
  .analytics-consent__choice:hover {
    background-color: var(--text-colour);
    color: var(--paper);
  }

  .analytics-consent__reopen:hover {
    text-decoration-thickness: 2px;
  }
}

/* Read by screen readers, never shown. */
.analytics-consent__hint {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
