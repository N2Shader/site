# 16 Focus ring that stays visible over mid-grey ink
Status: done
Blocked by: 14

- Today the focus ring is `currentColor` inside the blended content layer (ticket 14), so over mid-grey fading ink it shows as ~#7f7f7f on #808080 and nearly disappears (WCAG 2.4.7, 2.4.13).
- The owner chose an unblended focus indicator (2026-11-15) over accepting it as part of the ADR-0009 risk. A child can't escape its parent's `mix-blend-mode`, so this means moving the blend off the `.content-layer` group or drawing the indicator outside it, for example a dark-and-light double ring.
- Focused link text must stay readable over paper, black ink and mid-grey ink. Ask before adding a paper plate or halo behind it (ADR-0009).
- Record the outcome in ADR-0009.

## Comments

- 2026-11-16: Moved the difference blend off the `.content-layer` group. It now sits, together with the white blended text colour, on every content-layer element that holds no link (`:is(.content-layer, .content-layer *):not(:has(a))`). While the scene is running, a focused link leaves the blend: plain dark text on a paper-coloured plate, inside the 3px dark ring with a 2px paper-coloured edge (one box-shadow under the outline). That's readable over paper, black ink and mid-grey ink (ring always 16.5:1 on the plate, edge about 3.5:1 on mid-grey). The owner chose the plate (2026-11-16). Pending, still frame, failed and forced colours are unchanged. There's no test seam (CSS only, by the owner's choice), so check it by keyboard in a browser over fading ink.
  - Files: `app/assets/css/base.css`, `app/assets/css/tokens.css` (`--focus-ring-paper-edge`), `docs/adr/0009-text-inverts-over-ink.md` (outcome recorded), `CLAUDE.md` (folder map).
  - Follow-ups: for ticket 02, a fixed or sticky wrapper with a `z-index` around the locale switch would cut its link off from the ink. Put `position: fixed` on the `a.content-layer` itself, never on a wrapper (a fixed element is always a stacking context). A long email that wraps gets its plate split per line (accepted). `app/pages/index.vue` renders "N2Shader" against the "n2Shader" rule, and the e2e test still expects `n2Shader` (the owner's edit, not touched).
