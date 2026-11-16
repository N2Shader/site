<script setup lang="ts">
// The three contact details: linked email and phone, plain office address (spec, ADR-0003).
const contactDetails = useContactDetails()
</script>

<template>
  <ul class="contact-details-list">
    <li>
      <a :href="contactDetails.emailHref">{{ contactDetails.email }}</a>
    </li>
    <li>
      <a :href="contactDetails.phoneHref">{{ contactDetails.phoneDisplay }}</a>
    </li>
    <li>
      <address>
        <template
          v-for="(officeAddressLine, lineIndex) in contactDetails.officeAddressLines"
          :key="lineIndex"
        >
          <br v-if="lineIndex > 0">{{ officeAddressLine }}
        </template>
      </address>
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

address {
  font-style: normal;
}
</style>
