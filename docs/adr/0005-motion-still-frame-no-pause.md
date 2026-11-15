---
status: accepted
---

# Reduced motion shows a still frame; no pause control (accepted WCAG risk)

Visitors with `prefers-reduced-motion` get a still frame: clean paper, no ink, no intro stroke and no frame loop (ADR-0008). Everyone else gets the moving background scene with no pause/play button, because the owner wants nothing extra on the content layer. WCAG 2.2.2 Pause, Stop, Hide (Level A) asks for a way to stop moving content that runs longer than five seconds alongside other content, so this is a known conformance risk.

## Revisited for the ink scene

Most of the risk is now gone. Ink only moves in response to the visitor's own pointer. The intro stroke lasts under five seconds. The sheet then dries, fades and the loop sleeps. The remaining motion is ink bleeding and fading after the visitor paints, which is motion caused by an interaction (2.3.3, AAA), and reduced-motion visitors don't get it. A pause control is still the fix if an audit disagrees.
