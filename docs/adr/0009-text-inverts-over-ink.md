---
status: accepted
---

# Content text inverts over the ink with a difference blend (accepted WCAG risk)

Visitors can paint black ink anywhere, including behind the content layer. The owner chose to let text invert over the ink (`mix-blend-mode: difference`: dark on paper, light on ink) rather than keep ink away from the content or put the content on a paper-coloured plate. Over mid-grey ink the text loses contrast. Every stroke passes through mid-grey as it fades (ADR-0008), so text under fading ink can briefly drop below 7:1 (1.4.6, AAA) or even 4.5:1 (1.4.3, AA). This is a known conformance risk, like ADR-0004 and ADR-0005. Don't "fix" it without asking.

## Consequences

- Under `forced-colors: active`, and whenever the scene isn't running (no WebGL, reduced motion, before it loads), the blend is off and text is plain dark text that meets 7:1 against the fallback backdrop.
- Automated contrast checks may report the blended text inaccurately. Judge them against the fallback state. In ticket 11 (2026-11-17), Lighthouse's accessibility score was 96 on `/` and `/es` while the scene ran. axe ignores the blend and scored the blended text colour of the name and description against the paper (1.11:1 for #fff, 1.16:1 since the blended colour became #e3e1dd), but on screen it shows as #111 on paper (16.9:1). The owner accepted the 96. With reduced motion (the still frame, blend off), the score is 100. That fallback-state run is the accessibility half of the done bar (ADR-0006).
- The focus indicator is not part of the accepted risk (decided 2026-11-16, ticket 16). Inside the blend, a focus ring nearly disappears over mid-grey ink (2.4.7, 2.4.13). So the blend sits on every content-layer element that holds no link, never on a group around a link, and a focused link leaves it. While it's focused, the link sits on a paper-coloured plate with plain dark text, inside a dark ring with a paper-coloured edge, readable over paper, black ink and mid-grey ink. Only the focused link gets a plate. Unfocused text still inverts.
- The locale switch and the three contact details are exceptions (owner's choice, 2026-11-16). Each sits on its own paper-coloured chip (`.paper-chip` in base.css) with plain dark text and never inverts, so they always read at 16.9:1, even over mid-grey ink. Over the ink, each shows as a small light box. The switch went first, because the blend would turn its colour flag's colours into their opposites on paper. The owner then asked for the same on the email, phone and address. The logo, name and description still invert.
- Revisit this if an audit or a user complaint flags it. Ink that keeps away from the content, or a faint paper halo behind the text, are the fallback fixes.
