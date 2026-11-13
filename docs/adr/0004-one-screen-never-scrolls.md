---
status: accepted
---

# The landing page never scrolls; it shrinks to fit (accepted WCAG risk)

The design is a single screen with no navbar, footer or scroll, and the owner chose a hard lock: the content layer scales down to fit the viewport instead of scrolling when it overflows. This deliberately trades against the project's "WCAG 2.2 AAA where feasible" target. At 200% text zoom (1.4.4 Resize Text) or 320px width (1.4.10 Reflow), content may be clipped or become very small. Don't "fix" this by enabling scroll without asking the owner. Revisit it if an audit or a user complaint flags it.
