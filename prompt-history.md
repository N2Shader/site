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

## Black-ink painting scene (watercolor.bizar.ro reverse-engineer) — planning — 2026-11-14 23:04

1. I would like that for the scene, we reverse engineer this website: https://watercolor.bizar.ro/ But before doing that, before any code let's make some changes to it, let's planning so go to that website, focus only on the scene. forget about the native apps, the texts, the controls. inspect the code. we will use a very similar patter to it. can you find some similar apps to that list them in your response. apply grilling skills before any code be mande. we will start by creating the experience on this repo, on this site. The painting will occurr automatically when the user move its mouse or touch the canvas. no colours just a black ink will be painting. no options or controls.
2. (grilling answers via input tool) Renderer: three.js WebGPURenderer + TSL; clean reimplementation, no copied shader text; mouse hover and touch drag paint, only while moving, brush runs dry; dried ink fades slowly (~30 s); TSL render-target passes (run on WebGPU and the WebGL2 fallback); textured neutral off-white paper; text inverts over ink with mix-blend-mode: difference; reduced motion = still paper, no ink.
3. (grilling answers) mid-grey contrast dip accepted and recorded in an ADR; one intro stroke on load; build the scene on the bare page now (ticket 07 unblocked); resize clears to clean paper.
4. (grilling answers) intro stroke = random gesture; touch: first finger only, pinch zoom kept, window listeners, taps leave a dot; loop sleeps when idle or the tab is hidden; lazy-load + 2 quality tiers + DPR cap.
5. (grilling answers) random gesture 1.2–2 s, 40–70% of the short side, interruptible; write ADRs, glossary and tickets; keep vignette and wet sheen, grain doesn't move; plan confirmed.

## Build ticket 07: background scene shell — 2026-11-15 13:28

1. /build-ticket 07
2. (input answers) paper #f4f2ee; DPR cap 2; test seams: BackgroundScene component, SceneController lifecycle, viewport sizing
3. unmm I can't see anything different on screen is that right?
4. /verify
5. close the ticket

## Build ticket 12: ink simulation — 2026-11-15 14:11

1. /build-ticket 12
2. (input answer) test seams: none
3. looks good close this ticket, I'll later play with some parameteres

## Build ticket 13: intro stroke — 2026-11-15 20:31

1. /build-ticket 13
2. (input answers) test seams: IntroStrokePath, SceneController; intro plays once, the first time the moving scene starts
3. tess is a litle to straight can we modeify a little maybe maxBend
4. perfect close the ticket

## Build ticket 14: text inverts over ink (blocked) — 2026-11-15 21:00

1. /build-ticket 14

## Build ticket 01: landing page tracer bullet — 2026-11-15 21:05

1. /build-ticket 1
2. (input answers) test seams: landing page component, server HTML per route; obvious fake placeholder contact details
3. (input answer) keep email and phone duplicated in both locale JSON files

## Build ticket 06: one-screen layout and type — 2026-11-15 21:20

1. /build-ticket 06
2. (input answers) unblock: decide design direction now; font: I'll provide it myself, what works for you?; layout: top left; test seams: none, CSS only
3. (input answers) build now with a system-font placeholder, swap later; locale switch top-right
4. /verify
5. (font folder: Cascadia Code 2111.01 woff2) This is the font, but do not add them all, just the one we're using it (or the most appropiated). If we add them all but not using them, is that bad for performance?
6. This page will grow so add for the moment keep in memory probably in a comment, that if we need another spesific font I got them all. CLose this ticket

## Build ticket 14: text inverts over ink — 2026-11-15 21:45

1. /build-ticket 14
2. (input answer) test seams: server HTML
3. (input answers) focus ring over mid-grey ink: unblended focus ring (new ticket); add the content-layer note to ticket 02; keep 'N2Shader' (rename is a separate ticket)

## Drop ticket 17 — 2026-11-15 22:00

1. Ticket 17 is useless the only part of the app that should be rename was the title I did it, this ticket is not necessary delete it
2. (interrupted the follow-up question about the two <h1> test assertions and the n2Shader doc rule)
3. /verify

## Tweakpane ticket — 2026-11-15 22:20

1. Add a new ticket, add tweakpane to the experience, focus on the painting, use grilling to understand what is happening, this will take it later for now just add the ticket

## Build ticket 15: idle sleep and quality tiers — 2026-11-16 00:00

1. /build-ticket 15
2. (input answers) test seams: none; clean check: CPU timer
3. (input answer) half-float fade review finding: follow-up ticket 18

## Build ticket 16: unblended focus ring — 2026-11-16 10:32

1. /build-ticket 16
2. (input answers) focused link: paper plate + ring; test seam: none, CSS only
3. (code review applied: blend on every content-layer element without a link, single shadow, wording)

## Build ticket 17: tweakpane painting controls — 2026-11-16 10:39

1. /build-ticket 17
2. (grilling answers) dev only; live uniforms; painting groups (brush, ink, flow, look, introStroke); copy as SceneSettings snippet
3. (grilling answers) extras: clear the sheet, quality tier switch; no panel on reduced motion; placement: top left, default position of tweakpane; ranges: wide, uniform
4. (grilling answers) top-right, Tweakpane default; start open only when the #debug hash is on the URL; snippet: all five groups; record: row in ADR-0007
5. (grilling answers) only appear with #debug, otherwise not even imported; wake loop + live clock; tier switch and clear both start clean
6. (grilling answers) dev only with #debug; read at load only; test seams: no test
7. (input answer) confirmed the summary: build it
8. (input answer) intro stroke folder: add a replay button
9. (code review applied: pointerenter lift, panel floors instead of shader guards, tier choice kept across remounts, clearInk/applyTunedSettings names)

## Real copy and contact details (ticket 10) — 2026-11-16 13:03

1. Real data: email n2shader@gmail.com, tel +44 7771444593, address Haworth, West Yorkshire, England, and the description; update every part of the app and the tickets that use it
2. (input answers) slogan: split, first sentence is the slogan and the full text is the description; name: "N2Shader" everywhere
3. The text after the h1 is just one line; show the full description there

## Build ticket 02: locale switch and alternate links — 2026-11-16 13:45

1. what should be my next ticket?
2. /build-ticket 02
3. (input answers) test seams: e2e head tags and e2e switch link; landmark: bare link
4. (input answers) og:locale: en-GB / es-ES now; alignment: keep centred; tab order: first, but give screen readers more than "Español" (a language-switch hint); corner: accept and note it


## Build ticket 03: meta tags and share cards — 2026-11-16 14:20

1. /build-ticket 03
2. (input answers) title: name only ("N2Shader"); placeholder share image: logo + name + slogan; Twitter: card + image alt, rest from OG; test seams: e2e head tags + PNG size
3. (code review applied: share image term + glossary, site config name, folder map, shared test fixtures)
4. /build-ticket next
5. (input answer) build ticket 04 next

## Build ticket 04: Organization JSON-LD — 2026-11-16 15:10

1. /build-ticket next → 04
2. (input answers) logo: new logo.png 512×512; test seam: e2e JSON-LD graph; asked what sameAs is
3. (input answer) sameAs: https://github.com/N2Shader and https://x.com/n2shader, nothing else for now
4. (code review applied: folder map and sameAs constraint, country code constant, shared e2e fixtures, clearer test names)

## Build ticket 08: favicon legibility — 2026-11-16 20:15

1. /build-ticket 08
2. (input answers) stroke 7 with the vertical joined into the outline; colours black / paper #f4f2ee in dark scheme; touch icon: bold mark on paper, ~20% padding; test seams: public file checks + e2e head links

## Build ticket 09: Netlify config — 2026-11-16 16:00

1. /build-ticket 09

## Ticket 10 status check — 2026-11-16 20:30

1. Is the ticket 10 already done? what is missing for closing it?
2. update text in spanish: "En N2Shader, cada sitio web es una obra de arte digital única. Creamos experiencias inmersivas que tus usuarios no olvidarán." (accent on olvidarán)

## Build ticket 05: sitemap, robots.txt and llms.txt — 2026-11-16 15:40

1. /build-ticket 05
2. (input answers) test seam: no test; robots.txt layout: whatever is best for SEO (one shared group)
3. (code review applied: single sitemap.xml via `sitemaps: false`, absolute llms.txt links, clearer robots comment)
3. (code review applied: shared readPublicFile, looser dark-scheme check, paper colour sync note, spec logo line)
2. (input answers) CSP: static with 'unsafe-inline'; HSTS: 1 year + includeSubDomains, no preload; test seam: no test
3. (code review applied: NITRO_PRESET=static so the publish dir exists on Netlify, shorter comments, folder map line)

## Ink brush feel: pen width by speed, faster drying, black core (ticket 17 follow-up) — 2026-11-16 20:45

1. The Tweakpane options are way too many and too complicated. Wanted: (1) speed changes the pen size, not the ink strength (fast = thinner but still black); (2) ink dries a little faster, keep the fluid motion but make it stop sooner; (3) grey/softer outer edge, pure black centre
2. (input answer) panel: a few plain sliders on top, the raw sliders in a closed "Advanced" folder

## Locale switch: flag and code — 2026-11-16 21:10

1. Instead of "Español" and "English", show the abbreviation with a flag: ES and EN
2. (input answers) colour flag on a paper chip; EN flag: United Kingdom

## Text selection colours — 2026-11-16 21:30

1. Highlighted (selected) text is barely readable; change the highlight colour with the new CSS syntax for better contrast

## Contact details on paper chips — 2026-11-16 21:45

1. What did you do with the locale button so it does not merge with the ink? Do the same for the email, phone and address

## Tuned painting values — 2026-11-16 22:00

1. New SceneSettings values from the panel snippet (pen size 0.0457609, width when fast 0.117402, drying speed 2.01685)
