// The contact details of the current locale, read from the locale messages: the one source
// shared by the markup and the Organization JSON-LD (ADR-0003).
// The email and phone repeat in every locale file by choice; keep them in sync.
type OfficeAddressParts = {
  locality: string
  region: string
  countryCode: string
}

// ISO 3166-1 alpha-2 for the JSON-LD. England has no code of its own, so it's GB, the same in every locale.
const OFFICE_COUNTRY_CODE = 'GB'

type ContactDetails = {
  email: string
  emailHref: string
  phoneE164: string
  phoneDisplay: string
  phoneHref: string
  officeAddress: string
  officeAddressParts: OfficeAddressParts
}

export const useContactDetails = () => {
  const { t } = useI18n()

  return computed<ContactDetails>(() => {
    const email = t('contactDetails.email')
    const phoneE164 = t('contactDetails.phoneE164')
    const officeAddressParts = {
      locality: t('contactDetails.officeAddress.locality'),
      region: t('contactDetails.officeAddress.region'),
      countryCode: OFFICE_COUNTRY_CODE,
    }
    return {
      email,
      emailHref: `mailto:${email}`,
      phoneE164,
      phoneDisplay: t('contactDetails.phoneDisplay'),
      phoneHref: `tel:${phoneE164}`,
      // One line, as the owner writes it, so the stack keeps room for the description.
      officeAddress: [
        officeAddressParts.locality,
        officeAddressParts.region,
        t('contactDetails.officeAddress.country'),
      ].join(', '),
      officeAddressParts,
    }
  })
}
