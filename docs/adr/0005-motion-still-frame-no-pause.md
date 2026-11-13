---
status: accepted
---

# Reduced motion shows a still frame; no pause control (accepted WCAG risk)

The background scene animates automatically. Visitors with `prefers-reduced-motion` get a still frame. Everyone else sees it move, with no pause/play button, because the owner wants nothing extra on the content layer. WCAG 2.2.2 Pause, Stop, Hide (Level A) asks for a way to stop moving content that runs longer than five seconds alongside other content, so this is a known conformance risk. Revisit it once the background scene is designed. A very slow or subtle scene lowers the risk, and a pause control is the fix if the scene turns out busy.
