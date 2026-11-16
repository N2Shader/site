# N2Shader site

The public one-screen landing page that introduces the company N2Shader and tells visitors how to reach it.

## Page

**Landing page**:
The single screen of the site, in one locale. There are no other pages.
_Avoid_: Home, homepage, index

**Content layer**:
Everything on the landing page that carries meaning: company name, logo, description, contact details and the locale switch.
_Avoid_: Foreground, UI, overlay

**Background scene**:
The decorative ink painting behind the content layer, which visitors paint by moving the pointer. It carries no information.
_Avoid_: Canvas, hero, background animation

**Fallback backdrop**:
The static image or gradient shown behind the content layer before the background scene appears, or instead of it when it can't run.
_Avoid_: Placeholder, poster, loading screen

**Still frame**:
The background scene as clean paper with no ink, shown to visitors who ask their device for reduced motion.
_Avoid_: Paused scene, static mode

## Background scene

**Paper**:
The textured off-white sheet that fills the background scene and takes the ink.
_Avoid_: Canvas, sheet, surface

**Ink**:
The only colour in the background scene: black, or grey where it's thin. It runs wet, soaks into the paper, dries and fades away.
_Avoid_: Paint, pigment, colour

**Brush**:
The invisible tool that follows the visitor's pointer and lays ink while it moves: a black core with a grey edge. The faster it moves, the thinner its line, never the lighter. It runs dry on long strokes.
_Avoid_: Cursor, pen, stroke tool

**Intro stroke**:
The single random brush stroke that paints itself once when the page loads, to show that the paper can be painted.
_Avoid_: Intro animation, demo stroke, hint

## Company

**Company name**:
"N2Shader", written with that exact capitalisation (lowercase only in the domain and email address).
_Avoid_: n2Shader, n2shader, N2S

**Slogan**:
The first sentence of the description, used as the JSON-LD `slogan` and on the share image. Not shown on the page.
_Avoid_: Tagline, description, subtitle

**Share image**:
The 1200×630 PNG, one per locale, that link previews show when someone shares the landing page (Open Graph and X cards).
_Avoid_: OG image, social card, thumbnail

**Description**:
The paragraph under the company name saying what N2Shader does. The meta description, the JSON-LD and llms.txt use it too.
_Avoid_: Slogan, summary, about

**Contact details**:
The three ways to reach N2Shader shown on the page: one email address, one phone number and one postal address.
_Avoid_: Contacts, contact info, contact section

**Office address**:
Where N2Shader is based: town, county and country on one line (Haworth, West Yorkshire, England), no street. Clients don't visit it.
_Avoid_: Location, store, headquarters

**Public profiles**:
N2Shader's accounts on other sites (LinkedIn, GitHub, etc.). They aren't shown on the page.
_Avoid_: Socials, social links

## Locales

**Locale**:
One language version of the landing page: English (the default) or Spanish.
_Avoid_: Language version, translation, i18n

**Locale switch**:
The small link that moves a visitor between the English and Spanish landing pages. It shows the other locale's flag and two-letter code ("EN", "ES") on a paper-coloured chip.
_Avoid_: Language picker, language selector, toggle
