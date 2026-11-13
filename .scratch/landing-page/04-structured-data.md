# 04 Organization JSON-LD
Status: todo
Blocked by: 01

- `nuxt-schema-org`: `Organization` (name, logo, slogan, description, email, telephone, `PostalAddress`, `sameAs` placeholders), `WebSite`, `WebPage` per locale with `inLanguage`.
- Values come from the same source as the visible contact details.
- Test: the JSON-LD on each route contains the Organization with the visible email, phone and address.
