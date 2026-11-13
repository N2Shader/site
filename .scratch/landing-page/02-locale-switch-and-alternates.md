# 02 Locale switch and alternate links
Status: todo
Blocked by: 01

- Corner link to the other locale: real `<a>` with `hreflang` and `lang`, a clear accessible name ("Español" / "English"), keyboard reachable, visible focus.
- `useLocaleHead` output in the head: canonical, hreflang en/es/x-default, `og:locale` + alternate.
- Test: each route has the correct canonical and hreflang set, and the switch points to the other locale.
