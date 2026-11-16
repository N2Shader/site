# 12 Ink simulation
Status: done
Blocked by: 07

Our own TSL code, modelled on watercolor.bizar.ro's design but with no copied shader text (ADR-0008). Every pass is a full-screen TSL pass into ping-pong render targets, so it runs on WebGPU and on the WebGL2 fallback.

- **Paper** (made once per sheet): procedural height (tooth, grain, fibres), permeability and mottle.
- **Water flow** (half-resolution grid): curl, then advect velocity (vorticity confinement, friction, brush velocity injected near the stroke, velocity only where the paper is wet), then divergence, then pressure ×N (Jacobi), then project.
- **Carry ink**: move floating ink and water along the flow, then add the brush. The brush is a short line between the last two pointer positions, with ragged, splayed edges and dry-brush gaps when the load runs low.
- **Spread** ×N: water and ink soak sideways into neighbouring cells, more where the paper is permeable. Wet edges stay put (pinning), which gives the dark edges and blooms.
- **Settle**: water evaporates, ink deposits into the paper (more into its low spots) and dries.
- **Fade**: dried ink fades back to clean paper after about 30 s without painting.
- **Draw**: one channel of ink density shaded with a Kubelka-Munk-style tone curve, so it goes neutral black through greys. Paper lit by its height, granulation and mottle, a sheen on wet ink, a faint vignette, and grain that doesn't move.
- **Brush**: fixed size (about 4% of the screen's short side). Ink is laid only while the pointer moves, scaled by speed, never at rest. The brush runs dry on long, fast strokes and refills at rest. No smudge, colour, wash or keyboard controls.
- All tuning constants live in one settings module.

## Comments

- 2026-11-15: Built the ink simulation. Moving the pointer now paints black ink on textured paper. It flows, soaks sideways with pinned dark edges, settles more into the paper's low spots, dries, holds for 8 s and fades back to clean paper by about 30 s. All passes are TSL full-screen passes into half-float ping-pong render targets. The flow grid is half the paint grid's resolution, and the paint grid is 1 cell per CSS px, capped at 1600 on the long side. The brush has ragged, splayed edges, lays ink only while moving (scaled by speed), and runs dry with bristle gaps on long, fast strokes. The brush is 2% of the short side in radius, so about 4% across.
  - Files: `app/scene/{BrushStroke,SimulationGrid,SceneSettings,ThreeSceneAdapter,BrushPointer,SceneController}.ts`, `app/scene/ink/{BrushShape,DrawPass,FlowPasses,InkPasses,InkSimulation,InkTargets,InkUniforms,PaperPass,ShaderNoise}.ts`, `test/scene/SceneController.test.ts` (fake adapter gains `liftBrush`), `CLAUDE.md` (folder map).
  - Tests: none added, by choice. Typecheck and the existing 11 tests pass. The look hasn't been checked in a browser yet, and the constants in `SceneSettings` will need tuning by eye.
  - `BrushPointer` now signals a brush lift (pointer up, cancel, leaving the page, or a hand-over), so strokes don't join across lifts. This closes that follow-up from 07.
  - Deviation: Fade is folded into the Settle pass (per-cell age in the state's alpha channel), not a separate pass.
  - Follow-ups:
    - Taps don't leave a dot yet (from the planning answers). `BrushPointer` only reports moves.
    - The frame loop still never sleeps (07 finding, ticket 15).
- 2026-11-16: Superseded by the ticket 17 follow-up. The brush no longer lays ink scaled by speed. Speed now thins the line, and the ink stays black. Wet ink also dries in about 4 s instead of about 8 s.
