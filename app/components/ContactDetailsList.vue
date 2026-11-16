<script setup lang="ts">
// The three contact details: linked email and phone, plain office address (spec, ADR-0003). Each sits on its own
// paper-coloured chip (`.paper-chip`, base.css) and never inverts over the ink, like the locale switch (ADR-0009).
// The chip is on the link itself, not on the `<li>`, so a focused link's plate and ring stay its own.
const contactDetails = useContactDetails()
</script>

<template>
  <ul class="contact-details-list">
    <li>
      <a class="paper-chip" :href="contactDetails.emailHref">{{ contactDetails.email }}</a>
    </li>
    <li>
      <a class="paper-chip" :href="contactDetails.phoneHref">{{ contactDetails.phoneDisplay }}</a>
    </li>
    <li>
      <address class="paper-chip">{{ contactDetails.officeAddress }}</address>
    </li>
  </ul>
</template>

<style scoped>
.contact-details-list {
  display: flex;
  flex-direction: column;
  gap: 0.35em;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--type-small);
  line-height: 1.4;
  /* A long email or address line breaks anywhere instead of widening the one screen. */
  overflow-wrap: anywhere;
}

/* Each chip hugs its own text, pulled back by its padding so the text lines up with the description above. */
.paper-chip {
  display: inline-block;
  margin-inline-start: -0.5em;
}

address {
  font-style: normal;
}
</style>
