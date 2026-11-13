# 06 One-screen layout and type
Status: todo
Blocked by: 01, design direction (parked until the scene prompt)

- Fits one viewport (`100svh`, safe areas), never scrolls, and shrinks to fit (ADR-0004).
- Design tokens file (colours, `clamp()` type scale). Font self-hosted via `@nuxt/fonts` with a metric fallback.
- 7:1 contrast for all text against the fallback backdrop; visible focus styles; hover styles only inside `@media (hover: hover)`.
- Set the final `theme-color`.
