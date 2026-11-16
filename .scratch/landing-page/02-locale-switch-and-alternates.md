# 02 Locale switch and alternate links
Status: todo
Blocked by: 01

- Corner link to the other locale: real `<a>` with `hreflang` and `lang`, a clear accessible name ("Español" / "English"), keyboard reachable, visible focus.
- `useLocaleHead` output in the head: canonical, hreflang en/es/x-default, `og:locale` + alternate.
- Test: each route has the correct canonical and hreflang set, and the switch points to the other locale.
- The switch carries the `.content-layer` class so it inverts over the ink like the rest of the content layer (ADR-0009, ticket 14). Place it outside any wrapper of the background scene.
