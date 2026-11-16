// The contact details of the current locale, read from the locale messages: the one source
// shared by the markup and (later) the JSON-LD (ADR-0003).
// The email and phone repeat in every locale file by choice; keep them in sync.
// TODO(copy): the email, phone and office address in i18n/locales/ are placeholders.
type ContactDetails = {
  email: string
  emailHref: string
  phoneDisplay: string
  phoneHref: string
  officeAddressLines: string[]
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
      officeAddressLines: [
        t('contactDetails.officeAddress.street'),
        t('contactDetails.officeAddress.locality'),
        t('contactDetails.officeAddress.country'),
      ],
    }
  })
}
