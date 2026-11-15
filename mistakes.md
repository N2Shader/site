# Mistakes


- 2026-11-12: Added orbiting satellite spheres and breathing/drift to the corner metaballs without being asked, to "show off" the metaball merge. Build only what's described; effects come later when requested.
- 2026-11-13: Asked the /init-repo idea question as plain text. Always ask through the AskUserQuestion input tool.
- 2026-11-15: Put an HTML comment at the top of a Vue template, which made the component a fragment root, so `aria-hidden` wasn't on the wrapper's root and the test failed. Keep template comments inside the root element, or put them in the script.
