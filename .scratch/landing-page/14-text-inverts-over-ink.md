# 14 Text inverts over ink
Status: todo
Blocked by: 06, 07

- Content-layer text, logo and locale switch use `mix-blend-mode: difference` over the scene: dark on paper, light on ink (ADR-0009).
- Blend off (plain dark text, 7:1 against the fallback backdrop) under `forced-colors: active`, under reduced motion, before the scene loads and when it fails.
- Focus indicators stay visible over paper and over ink.
- The mid-grey contrast dip is an accepted risk. Don't add a halo or keep ink away from the content without asking.
