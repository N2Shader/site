# 07 Background scene shell
Status: done
Blocked by: none (unblocked from 06 so the scene can go in behind the bare page; ADR-0008)

- CSS fallback backdrop in the paper colour is visible on first paint and whenever WebGPU/WebGL2 is unavailable or fails.
- `three/webgpu` `WebGPURenderer` canvas mounted client-only after hydration and lazy-loaded once the browser is idle after first paint. It's `aria-hidden` and `pointer-events: none`, causes no layout shift, and is disposed on unmount. It fades in over the backdrop.
- Pointer listeners on `window` (`pointermove`, `pointerdown`, `pointerup`, `pointercancel`, `pointerleave`). Only the first pointer paints. The page uses `touch-action: pinch-zoom`, so pinch zoom stays and there's no pull-to-refresh or panning.
- `prefers-reduced-motion`: show the still frame (clean paper) with no ink, no intro stroke and no loop. React to the setting changing while the page is open.
- Resize or rotation, debounced: rebuild the sim grid and clear to clean paper. Cap the device pixel ratio.
- Must not hurt Lighthouse Performance.
- The ink simulation, intro stroke, text blend and idle/quality work are tickets 12–15.

## Comments

- 2026-11-15: Built the background scene shell. The paper-coloured fallback backdrop shows from first paint. After load and idle, a lazy-loaded `WebGPURenderer` (WebGL2 fallback) fades in over it, drawing flat paper. Pointer listeners on `window` follow the first pointer only, and a hovering mouse hands the brush to any pointer that presses down. `touch-action: pinch-zoom` is set. Reduced motion shows the still frame and reacts live to the setting. A debounced resize rebuilds and clears. The DPR is capped at 2. The renderer is disposed on unmount, including mid-load.
  - Files: `app/app.vue`, `app/assets/css/base.css`, `app/components/BackgroundScene.vue`, `app/composables/useBackgroundScene.ts`, `app/scene/{BrowserIdle,BrushPointer,SceneController,SceneSettings,SceneViewport,ThreeSceneAdapter}.ts`, `test/scene/*.test.ts`, `test/components/BackgroundScene.test.ts`.
  - Tests: SceneController lifecycle (9), viewport sizing (1), BackgroundScene component (1). The first-pointer logic has no tests of its own, by choice.
  - Deviation: the code listens for `pointerout` with no `relatedTarget` instead of `pointerleave`, because `pointerleave` never reaches `window`.
  - Follow-ups:
    - The GPU device or WebGL context lost while running doesn't switch to the fallback backdrop yet.
    - Ticket 12 needs a brush-lift signal from `BrushPointer` so strokes don't join across lifts.
    - The `theme-color` meta is still `#ffffff` (should match the paper, `TODO(design)`).
    - `app.vue` shows "n2shader" instead of "n2Shader" (ticket 01).
    - Check that Nuxt doesn't prefetch the three.js chunk during the Lighthouse run (ticket 11).
- 2026-11-15: `/verify` passed lint, typecheck and tests (11/11). Closed with two open findings in `ThreeSceneAdapter.ts`, both left unfixed:
  - The frame loop never stops. In three r187, `renderer.render()` starts an internal rAF loop that `setAnimationLoop(null)` never stops, so the reduced-motion still frame and `stopLoop()` keep waking the browser every frame. The fix is to stop it after each still frame and in `stopLoop()`, which means calling the private `renderer._animation.stop()`. Ticket 15 depends on this.
  - A failed `init()` logs an unhandled rejection. The catch calls `renderer.dispose()`, which re-awaits `init()` and rejects again, so devices without WebGPU or WebGL2 get an "Uncaught (in promise)" console error. The fix is to drop that `dispose()` or catch it.
