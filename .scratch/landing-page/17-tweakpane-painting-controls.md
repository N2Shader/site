# 17 Tweakpane controls for the painting
Status: todo
Blocked by: 12, 13

- Add a Tweakpane panel for tuning the ink painting live: the brush, the ink, the water flow, the look and the intro stroke (`SceneSettings`), so the owner can play with the parameters without editing code.
- Focus on the painting. The content layer, the locales and the SEO stay untouched.
- **Start with `/grilling`.** The scope isn't settled yet; agree on it with the owner before any code.

## To settle while grilling

- **Who sees it:** dev only, or also on the live site behind something like `?tweak` or a key? The scene is `aria-hidden` and the content layer must stay clean (ADR-0001, ADR-0005), and any shipped bundle cost counts against Lighthouse 100 (ADR-0006).
- **The library:** Tweakpane isn't in ADR-0007's list. Record it there, or in a new ADR, along with how it stays out of the first bundle (lazy import, like three.js and GSAP).
- **Live or rebuild:** many constants are baked into the TSL nodes as JS numbers when the passes are built (`app/scene/ink/`). Live sliders need them moved to uniforms. Otherwise a change rebuilds the passes or starts a new sheet. Grid sizes (`SceneSettings.grid`) always need a new sheet.
- **Which settings:** all of `SceneSettings`, or a curated set? Which ranges and steps? Does the paper colour have to stay in sync with `--paper` and theme-color?
- **Keeping a result:** copy or export the tuned values as a `SceneSettings` snippet, presets, local storage, or nothing?
- **Extras:** buttons to replay the intro stroke, clear the sheet or show FPS? How does it relate to ticket 15's quality tiers?
- **Reduced motion:** does the panel work on the still frame?
