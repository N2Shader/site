# Mistakes


- 2026-11-12: Added orbiting satellite spheres and breathing/drift to the corner metaballs without being asked, to "show off" the metaball merge. Build only what's described; effects come later when requested.
- 2026-11-13: Asked the /init-repo idea question as plain text. Always ask through the AskUserQuestion input tool.
- 2026-11-15: Put an HTML comment at the top of a Vue template, which made the component a fragment root, so `aria-hidden` wasn't on the wrapper's root and the test failed. Keep template comments inside the root element, or put them in the script.
- 2026-11-15: In ticket 13 I only sent pointer moves through the intro-stroke interrupt and forgot the brush lifts that `listenForBrushPointer` fires on pointerdown/up, so a tap broke the intro without stopping it. When a pointer listener has more than one callback, route all of them through the takeover logic.
- 2026-11-15: In ticket 06 my first clamp() type scale had rem minimums high enough that the stack didn't fit a 568×320 landscape phone, and I'd put `overflow: hidden` only on html/body, so tabbing to a clipped link still scrolled the page. For shrink-to-fit, add up the stack's height at the smallest target viewport before picking minimums, and clip the content block itself.
- 2026-11-15: In ticket 06 I gave `<main>` `max-block-size: 100%` + `overflow: clip` without remembering Nuxt wraps the app in an auto-height `<div id="__nuxt">`, so the percentage resolves to none and nothing is clipped. Check the real DOM chain (`#__nuxt`) before relying on percentage heights.
- 2026-11-15: Told the owner @nuxt/fonts needs `processCSSVariables: true` to read `--font-body`; its default (`font-prefixed-only`) already reads `--font-*` properties. Check the module's defaults in node_modules before stating a config requirement.
- 2026-11-15: In ticket 14 I wrote the AskUserQuestion option "Unblended focus ring" as "a new ticket", even though focus visibility was a requirement of the ticket I was building. Before calling something a follow-up, check whether the current ticket already asks for it, and say so in the question.
