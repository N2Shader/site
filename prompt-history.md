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
