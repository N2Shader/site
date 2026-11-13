# Prompt History

## Nuxt scaffold, favicon, metaball scene (reverted) — 2026-11-12 22:35

1. Start a new project for a website, we will use the latest version of nuxt, gsap, threejs, tresjs. but for now let's just keep it simple. we don't need routes or serverside for nuxt just render the pagem no components no additional library no nothing as simple as possible
2. use this as favicon (n2shader-logo-2048.svg)
3. Create a web page implementation from the diffui instructions (Expanded_Blue_Layout.md) for the "Creative Studio" image. Notes: all images are a tres.js scene split into components; center geometries are placeholders (skip them); a circle at each viewport corner; circles are raymarched metaballs; keep the image's colours on the metaballs.
4. perfect the only things that is wrong is the "Each one also has a small sphere orbiting it" for now the corner sphere are just a sphere not 2 one orbiting, we will add effects to them later
5. go back the changes of the last prompts keep only the initial simple implementation, the initial basic no scene or diffUI implementation. remove tresjs as dependency, add GSAP, keep SSR true since SEO is going to be very important

## Init repo: n2Shader SEO/AEO/a11y landing page — 2026-11-13 00:00

1. /init-repo
2. The purpose of this repo is to create a simple landingpage no scroll, no navbar, no footer only the name of the company "n2Shader" a small description or slogan and logo and 3 contacts, emails, phone number, address. in order to do this, this page needs to be discoverable, SEO and AEO are a must, Ally needs to be there too. I'll describe the scene at the bg in another prompt, and remember to throw questions on input not text
3. (grilling answers via input tool) static + client-only scene; Netlify; EN + ES (EN at /, ES at /es, @nuxtjs/i18n, small corner switch); Organization schema; 1 email + 1 phone linked, address plain; sameAs JSON-LD only; no analytics; domain https://n2shader.com; placeholders for copy; meta/OG/hreflang + JSON-LD + sitemap/robots + llms.txt; WCAG 2.2 AAA where feasible; reduced motion still frame, no pause button; CSS gradient fallback; favicon SVG as logo; never scroll, shrink to fit; @nuxt/fonts self-hosted; done = Lighthouse 100x4 + axe 0 + Rich Results/hreflang valid; design direction parked for the scene prompt.
4. (stack answers) à la carte SEO modules; static OG PNG per locale; nuxt-llms module; plain scoped CSS + tokens.
5. (scaffold answers) install all v1 libraries; full verify tooling (lint/typecheck/test); apply mobile baseline now; no pre-commit hook.
