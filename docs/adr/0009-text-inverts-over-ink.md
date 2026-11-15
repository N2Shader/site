---
status: accepted
---

# Content text inverts over the ink with a difference blend (accepted WCAG risk)

Visitors can paint black ink anywhere, including behind the content layer. The owner chose to let text invert over the ink (`mix-blend-mode: difference`: dark on paper, light on ink) rather than keep ink away from the content or put the content on a paper-coloured plate. Over mid-grey ink the text loses contrast. Every stroke passes through mid-grey as it fades (ADR-0008), so text under fading ink can briefly drop below 7:1 (1.4.6, AAA) or even 4.5:1 (1.4.3, AA). This is a known conformance risk, like ADR-0004 and ADR-0005. Don't "fix" it without asking.

## Consequences

- Under `forced-colors: active`, and whenever the scene isn't running (no WebGL, reduced motion, before it loads), the blend is off and text is plain dark text that meets 7:1 against the fallback backdrop.
- Automated contrast checks may report the blended text inaccurately. Judge them against the fallback state.
- Revisit this if an audit or a user complaint flags it. Ink that keeps away from the content, or a faint paper halo behind the text, are the fallback fixes.
