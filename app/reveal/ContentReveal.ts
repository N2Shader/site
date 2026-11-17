import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { SplitText } from 'gsap/SplitText'
import { endContentRevealPending } from './ContentRevealPendingScript'
import type { ContentRevealPart } from './ContentRevealPendingScript'
import { ContentRevealSettings } from './ContentRevealSettings'

gsap.registerPlugin(DrawSVGPlugin, SplitText)

/**
 * The content reveal: the content layer's one-time entrance on page load (GLOSSARY.md). The logo draws its strokes,
 * the company name fills in letter by letter, then the contact chips and the locale switch wipe open. Loaded lazily
 * (useContentReveal.ts), so GSAP stays out of the first bundle. The description rises in from CSS instead (base.css),
 * from the first paint, so the largest text never waits for this file.
 *
 * Only the stroke dash, the letter fill and clip-path move. Each moves on the element that is
 * itself blended or a paper chip, never on a group around a blended element, which would cut the blend off from the
 * ink (ADR-0009).
 * When the reveal ends, the gsap context reverts: the split text goes back to its original markup and every inline
 * style is dropped, so the page is left exactly as prerendered.
 */

// Clip-path insets that hide a chip and open it from its left or its right edge.
const CLIP_HIDDEN_OPENS_RIGHTWARD = 'inset(0% 100% 0% 0%)'
const CLIP_HIDDEN_OPENS_LEFTWARD = 'inset(0% 0% 0% 100%)'
const CLIP_SHOWN = 'inset(0% 0% 0% 0%)'

const findRevealPart = (part: ContentRevealPart) =>
  document.querySelector<HTMLElement>(`[data-content-reveal-part="${part}"]`)

const addLogoDrawing = (timeline: gsap.core.Timeline, logo: HTMLElement) => {
  const { startAt, durationSeconds, staggerSeconds, ease } = ContentRevealSettings.logo
  timeline.fromTo(
    logo.querySelectorAll('path'),
    { drawSVG: '0%' },
    { drawSVG: '100%', duration: durationSeconds, stagger: staggerSeconds, ease },
    startAt,
  )
}

/*
 * Each letter fills from the paper colour to the text colour, fully opaque throughout. Only the fill amount
 * (`--reveal-fill`, 0 to 1) is tweened; base.css turns it into the colour for the scene's current state, so the fill
 * stays right if the scene starts running mid-reveal and the blend kicks in. `aria: 'auto'` names the heading with its
 * full text and hides the single letters from screen readers.
 */
const addCompanyNameFill = (timeline: gsap.core.Timeline, companyName: HTMLElement) => {
  const { startAt, durationSeconds, staggerSeconds, ease } = ContentRevealSettings.companyName
  const { chars } = SplitText.create(companyName, {
    type: 'chars',
    tag: 'span',
    aria: 'auto',
    charsClass: 'content-reveal-letter',
  })
  timeline.fromTo(
    chars,
    { '--reveal-fill': 0 },
    { '--reveal-fill': 1, duration: durationSeconds, stagger: staggerSeconds, ease },
    startAt,
  )
}

// Each chip wipes open left to right, the way the mono text reads.
const addContactDetailsWipe = (timeline: gsap.core.Timeline, contactDetails: HTMLElement) => {
  const { startAt, durationSeconds, staggerSeconds, ease } = ContentRevealSettings.contactDetails
  timeline.fromTo(
    contactDetails.querySelectorAll('.paper-chip'),
    { clipPath: CLIP_HIDDEN_OPENS_RIGHTWARD },
    { clipPath: CLIP_SHOWN, duration: durationSeconds, stagger: staggerSeconds, ease },
    startAt,
  )
}

// The locale switch sits in the top-right corner, so it wipes open from its right edge, mirroring the contact chips.
const addLocaleSwitchWipe = (timeline: gsap.core.Timeline, localeSwitch: HTMLElement) => {
  const { startAt, durationSeconds, ease } = ContentRevealSettings.localeSwitch
  timeline.fromTo(
    localeSwitch,
    { clipPath: CLIP_HIDDEN_OPENS_LEFTWARD },
    { clipPath: CLIP_SHOWN, duration: durationSeconds, ease },
    startAt,
  )
}

const addRevealParts = (timeline: gsap.core.Timeline) => {
  const logo = findRevealPart('logo')
  const companyName = findRevealPart('company-name')
  const contactDetails = findRevealPart('contact-details')
  const localeSwitch = findRevealPart('locale-switch')
  if (logo) addLogoDrawing(timeline, logo)
  if (companyName) addCompanyNameFill(timeline, companyName)
  if (contactDetails) addContactDetailsWipe(timeline, contactDetails)
  if (localeSwitch) addLocaleSwitchWipe(timeline, localeSwitch)
}

/**
 * Plays the content reveal once. The `fromTo` tweens set every part's hidden state as they're created, so ending the
 * pending state right after shows no flash. Anything taking focus (a Tab press, a click) jumps the reveal to its end,
 * so a keyboard user never lands on a link that is still wiped shut. Returns a stop function that ends the reveal and
 * restores the page.
 */
export const playContentReveal = () => {
  let finishRevealOnFocus = () => {}
  const revealContext = gsap.context(() => {
    const timeline = gsap.timeline({ onComplete: () => stopContentReveal() })
    addRevealParts(timeline)
    finishRevealOnFocus = () => {
      timeline.progress(1)
    }
  })
  const stopContentReveal = () => {
    document.removeEventListener('focusin', finishRevealOnFocus)
    revealContext.revert()
  }
  document.addEventListener('focusin', finishRevealOnFocus)
  endContentRevealPending()
  return stopContentReveal
}
