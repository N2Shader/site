---
status: accepted
---

# The background scene is a black-ink painting simulation on paper

The background scene is a sheet of textured paper that the visitor paints on with black ink just by moving the pointer. It's modelled on watercolor.bizar.ro (Luis Bizarro): a fluid simulation moves the water, ink is carried along with it, soaks into the paper and dries into it. We reimplement the technique in our own TSL code, using its architecture and the published methods it builds on (Stam's stable fluids, Curtis et al. 1997). We copy none of its shader text, because that bundle has no open-source licence.

## Considered options

- **Renderer.** We chose three.js `WebGPURenderer` with TSL. Raw WebGPU like the original was rejected because it has no fallback and would leave three. Plain `WebGLRenderer` + GLSL was rejected in favour of WebGPU-first.
- **How the passes run.** Each simulation step is a TSL full-screen pass that renders into ping-pong render targets, not a TSL compute shader. Compute that writes storage textures only runs on real WebGPU, while render-target passes also run on the renderer's WebGL2 fallback. Every step only reads neighbouring cells and writes its own cell, so nothing is lost by not using compute.

## Consequences

- Only black ink, no colour mixing. The paper is a neutral off-white with grain, fibres and mottle, lit by a fixed light. There's a faint vignette and a sheen on wet ink. Grain is part of the paper and doesn't change from frame to frame.
- Mouse hover paints and touch paints while dragging. Only the first pointer paints, and only while it moves. The brush runs dry over long strokes and refills while the pointer rests. Brush size is fixed, and there are no controls: no smudge, colour, wash or keyboard shortcuts.
- Dried ink fades back to clean paper after about 30 s without painting, so the page always comes back clean.
- One random stroke, driven by GSAP, paints itself on load to show that the page can be painted. The visitor's pointer interrupts it.
- The canvas stays `pointer-events: none` and listens on `window`, so links keep working. The page uses `touch-action: pinch-zoom`.
- The scene is lazy-loaded after first paint and picks a high or low quality tier for the device. The loop sleeps when the sheet is clean and the pointer is idle, or when the tab is hidden. A resize clears the sheet back to clean paper.
