# 15 Idle sleep and quality tiers
Status: done
Blocked by: 12

- The frame loop sleeps when the sheet is clean (no wet ink, all dried ink faded) and the pointer is idle, and while the tab is hidden. It wakes on the next pointer move or when the tab becomes visible again.
- Two quality tiers. High: fine pointer and at least 8 cores and 8 GB of memory (where the browser reports them). Low: everything else, with a coarser paint grid and fewer spread and pressure iterations.
- The low tier holds a steady frame rate on a mid-range phone.

## Comments

- 2026-11-16: Built idle sleep and the two quality tiers.
  - The frame loop now sleeps once the paper is clean and the brush lays nothing, and while the tab is hidden. It wakes on any brush move (the visitor's or the intro stroke's), when the tab shows again, and on a resize, so the new paper gets drawn. Wake and sleep are tracked in `SceneController`.
  - "Clean" is a CPU timer, by the owner's choice: `CleanPaperClock` counts simulated seconds since the last ink. The bound is worked out from `SceneSettings`: drying ln(1 + s/c)/s ≈ 8.4 s, plus hold 8 s, fade 22 s and a 1 s margin, so ≈ 39.4 s.
  - The adapter also stops three's internal rAF (`renderer._animation`, private in r187). `setAnimationLoop(null)` only drops the callback, and every render restarts that rAF. This also makes the reduced-motion still frame truly loop-free (ADR-0005).
  - Tiers: `QualityTier` gives high for `(pointer: fine)` + ≥ 8 cores + ≥ 8 GB, where reported. Low halves the paint cells per pixel (cap 800) and halves the pressure (10) and spread (2) iterations. Settings are in `SceneSettings.quality`/`highTier`.
  - Files: `app/scene/{CleanPaperClock,QualityTier}.ts` (new), `app/scene/{SceneController,SceneSettings,SimulationGrid,ThreeSceneAdapter}.ts`, `app/scene/ink/InkSimulation.ts`, `app/composables/useBackgroundScene.ts` (passes `document`), `test/scene/SceneControllerHarness.ts`, `CLAUDE.md` (folder map).
  - Tests: none added, by choice. Typecheck passes and all 26 scene tests pass. The full suite still has the 4 pre-existing `N2Shader` heading failures (the same on the untouched baseline).
  - Unverified: the low tier's frame rate on a real mid-range phone. It hasn't been checked in a browser yet.
  - Follow-ups:
    - Ticket 18: half-float rounding makes the dried-ink fade slow down, or stall above ~130 Hz, so the loop can sleep with ink still showing.
    - The private `_animation.stop()` call needs re-checking on three upgrades. If it stops working, the page goes back to an empty rAF every frame.
    - The low tier still renders the paper and draw passes at the capped DPR (2). Lowering the DPR cap on low is a possible next lever if phones still struggle.
