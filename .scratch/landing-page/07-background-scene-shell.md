# 07 Background scene shell
Status: todo
Blocked by: 06, scene description (later prompt)

- CSS fallback backdrop is visible on first paint and whenever WebGL is unavailable or fails.
- three.js canvas mounted client-only after hydration, `aria-hidden`, `pointer-events: none`, no layout shift; disposed on unmount.
- `prefers-reduced-motion`: render one still frame, no loop. GSAP drives motion otherwise.
- Must not hurt Lighthouse Performance (lazy-load three after first paint).
- The scene content itself is a separate ticket once described.
