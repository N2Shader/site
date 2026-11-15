# 12 Ink simulation
Status: todo
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
