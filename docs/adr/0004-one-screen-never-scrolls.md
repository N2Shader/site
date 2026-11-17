---
status: accepted
---

# The landing page never scrolls; it shrinks to fit (accepted WCAG risk)

The design is a single screen with no navbar, footer or scroll, and the owner chose a hard lock: the content layer scales down to fit the viewport instead of scrolling when it overflows. This deliberately trades against the project's "WCAG 2.2 AAA where feasible" target. At 200% text zoom (1.4.4 Resize Text) or 320px width (1.4.10 Reflow), content may be clipped or become very small. Don't "fix" this by enabling scroll without asking the owner. Revisit it if an audit or a user complaint flags it.

The email and phone links are about 22px tall. That passes 2.5.8 Target Size (AA) through its spacing exception, but not 2.5.5 (AAA, 44px), which the locale switch and the consent banner's buttons meet. 44px chips would add about 45px to the stack, which no longer fits a 568×320 landscape phone. The owner accepted the AAA gap on 2026-11-17.
