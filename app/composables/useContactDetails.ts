// The contact details of the current locale, read from the locale messages: the one source
// shared by the markup and (later) the JSON-LD (ADR-0003).
// The email and phone repeat in every locale file by choice; keep them in sync.
type ContactDetails = {
  email: string
  emailHref: string
  phoneDisplay: string
  phoneHref: string
  officeAddress: string
}

export const useContactDetails = () => {
  const { t } = useI18n()

  return computed<ContactDetails>(() => {
    const email = t('contactDetails.email')
    return {
      email,
      emailHref: `mailto:${email}`,
      phoneDisplay: t('contactDetails.phoneDisplay'),
      phoneHref: `tel:${t('contactDetails.phoneE164')}`,
      // One line, as the owner writes it, so the stack keeps room for the description.
      officeAddress: [
        t('contactDetails.officeAddress.locality'),
        t('contactDetails.officeAddress.region'),
        t('contactDetails.officeAddress.country'),
      ].join(', '),
    }
  })
}
