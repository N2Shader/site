import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LandingPage from '../../app/pages/index.vue'

const mountLandingPageAt = (route: string) => mountSuspended(LandingPage, { route })

describe.each([
  {
    route: '/',
    logoLabel: 'n2Shader logo',
    slogan: 'PLACEHOLDER: what n2Shader does, in one line.',
    country: 'Spain',
  },
  {
    route: '/es',
    logoLabel: 'Logotipo de n2Shader',
    slogan: 'PLACEHOLDER: qué hace n2Shader, en una línea.',
    country: 'España',
  },
])('Landing page at $route', ({ route, logoLabel, slogan, country }) => {
  it('shows the company name as the single heading, with a named logo', async () => {
    const wrapper = await mountLandingPageAt(route)

    const headings = wrapper.findAll('h1')
    expect(headings).toHaveLength(1)
    expect(headings[0]!.text()).toBe('n2Shader')
    expect(wrapper.find('svg[role="img"]').attributes('aria-label')).toBe(logoLabel)

    wrapper.unmount()
  })

  it('shows the slogan and the three contact details in its locale', async () => {
    const wrapper = await mountLandingPageAt(route)

    expect(wrapper.text()).toContain(slogan)
    const emailLink = wrapper.find('a[href^="mailto:"]')
    expect(emailLink.attributes('href')).toBe('mailto:hello@n2shader.com')
    expect(emailLink.text()).toBe('hello@n2shader.com')
    const phoneLink = wrapper.find('a[href^="tel:"]')
    expect(phoneLink.attributes('href')).toBe('tel:+34600000000')
    expect(phoneLink.text()).toBe('+34 600 000 000')
    expect(wrapper.find('address').text()).toContain(country)

    wrapper.unmount()
  })
})
