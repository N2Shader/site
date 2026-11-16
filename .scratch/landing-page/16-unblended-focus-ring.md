# 16 Focus ring that stays visible over mid-grey ink
Status: todo
Blocked by: 14

- Today the focus ring is `currentColor` inside the blended content layer (ticket 14), so over mid-grey fading ink it shows as ~#7f7f7f on #808080 and nearly disappears (WCAG 2.4.7, 2.4.13).
- The owner chose an unblended focus indicator (2026-11-15) over accepting it as part of the ADR-0009 risk. A child can't escape its parent's `mix-blend-mode`, so this means moving the blend off the `.content-layer` group or drawing the indicator outside it, for example a dark-and-light double ring.
- Focused link text must stay readable over paper, black ink and mid-grey ink. Ask before adding a paper plate or halo behind it (ADR-0009).
- Record the outcome in ADR-0009.
