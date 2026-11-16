# Discoverability: structured data, llms.txt and open AI crawling

SEO and answer-engine optimisation (AEO) are the reason the site exists, so each locale ships full meta tags (title, description, canonical, hreflang, Open Graph and Twitter cards) and `schema.org` JSON-LD: an `Organization` (name, logo, slogan, description, email, telephone, office address, `sameAs`) plus `WebSite` and `WebPage`. Public profiles appear only in `sameAs`, not as visible links, to keep the content layer minimal. `sitemap.xml` lists both locales with alternates, `robots.txt` explicitly allows search and AI answer crawlers, and `llms.txt` gives AI assistants a plain-text summary of the company.

## Consequences

- The office address is typed as `Organization.address`, not `LocalBusiness`: N2Shader isn't a walk-in business, so no opening hours or geo coordinates.
- Structured data must stay in sync with the visible contact details. Both come from the same locale content.
