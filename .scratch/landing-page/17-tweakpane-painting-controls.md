# 17 Tweakpane controls for the painting
Status: done
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

## Decisions (grilling, 2026-11-16)

- **Who sees it:** dev only (`import.meta.dev`), and only with `#debug` in the URL at load. Otherwise Tweakpane is never imported. It's a devDependency (4.0.5), never in the production bundle. Recorded as a row in ADR-0007.
- **Placement:** Tweakpane's default (top-right), open.
- **Settings:** folders `brush`, `introStroke`, `flow`, `ink`, `look`. Not in the panel: grid, quality tiers, plumbing, paper colour. Ranges: 0 to 5× each default. Integer counts step by 1 with a floor of 1 and 2 (so the path can't crash). `ease` is a dropdown of GSAP eases.
- **Live:** shader constants move into uniforms. JS-side values read `SceneSettings`, which the panel edits in place. A brush radius change updates the brush uniform. Any change wakes a sleeping loop, and `CleanPaperClock` uses the live drying, hold and fade values.
- **Extras:**
  - "Clear the sheet" wipes every simulation grid.
  - A quality tier dropdown (auto / high / low) rebuilds the grids at that tier on a clean sheet.
  - "Replay intro stroke" plays a new random intro stroke with the current values.
- **Keeping a result:** "Copy as snippet" copies all five groups in full as `SceneSettings` TypeScript.
- **Reduced motion:** no panel; it only exists while the scene is running.
- **Tests:** none, by the owner's choice.

## Comments

- 2026-11-16: Built the dev-only painting tuning panel. Under `nuxt dev` with `#debug` in the URL, a Tweakpane panel ("Painting", top-right, open) appears while the moving scene runs.
  - **Controls:** folders for brush, introStroke, flow, ink and look, edited live. Buttons: "Clear the ink", "Replay intro stroke", "Copy as snippet". A quality tier dropdown: auto (detected) / high / low.
  - **Live values:** every number the shaders read from brush, flow, ink and look is now a uniform (`ink/SettingsUniforms.ts`), synced on each change. JS-side values are read where they're used. The brush radius uniform follows `radiusOfShortSide`.
  - **Loop and clock:** each change wakes a sleeping loop, and `CleanPaperClock` works out the clean time from the live values on every check.
  - **Brush off the panel:** the brush ignores the panel, both on hover and while dragging a slider (not asked for, but without it every slider drag paints).
  - **Production:** `import.meta.dev` is false there, so neither the panel nor Tweakpane is bundled.
  - **Tests:** none by the owner's choice. Typecheck is clean, and the scene specs pass (26). The two LandingPage component failures are the existing "N2Shader" heading.
  - **Changes from the decisions:**
    - The button reads "Clear the ink" (the glossary avoids "sheet").
    - Values the shaders divide by or use as a smoothstep edge (`radiusOfShortSide`, `dryLoad`, `wetWater`, `pinWater`, `fadeSeconds`) stop at 1% of their default instead of 0, so the grids can't fill with NaN.
    - `#debug` is read when the scene starts (after the idle wait), not at the very first paint.
    - `@tweakpane/core` is a second devDependency, needed for Tweakpane's TypeScript types.
  - **Files:**
    - New: `app/scene/PaintingTuningPanel.ts`, `app/scene/PaintingSettingsSnippet.ts`, `app/scene/SceneAdapter.ts` (types moved out of SceneController to stay under 250 lines), `app/scene/ink/SettingsUniforms.ts`.
    - Changed: `app/scene/ink/{InkUniforms,InkPasses,DrawPass,FlowPasses,BrushShape,InkSimulation}.ts`, `app/scene/{SceneController,ThreeSceneAdapter,SimulationGrid,CleanPaperClock,QualityTier,SceneSettings,IntroStrokePlayer}.ts`, `app/composables/useBackgroundScene.ts`, `test/scene/SceneControllerHarness.ts`, `docs/adr/0007-stack-and-libraries.md`, `CLAUDE.md`, `package.json`, `pnpm-lock.yaml`.
  - **Follow-ups:**
    - Setting `ink.evaporationPerSecond` to 0 makes the paper never count as clean, so the loop never sleeps (dev only).
    - The copied snippet has no doc comments; put them back when pasting.
    - Not yet checked in a browser.
