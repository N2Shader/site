import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LandingPage from '../../app/pages/index.vue'

const mountLandingPageAt = (route: string) => mountSuspended(LandingPage, { route })

describe.each([
  {
    route: '/',
    logoLabel: 'N2Shader logo',
    description: 'At N2Shader, every website is a one-of-a-kind piece of digital art. We build immersive experiences that make customers feel something before they read a single word, because that is what they remember.',
    country: 'England',
  },
  {
    route: '/es',
    logoLabel: 'Logotipo de N2Shader',
    description: 'En N2Shader, cada sitio web es una obra de arte digital única. Creamos experiencias inmersivas que hacen sentir algo a los clientes antes de que lean una sola palabra, porque eso es lo que recuerdan.',
    country: 'Inglaterra',
  },
])('Landing page at $route', ({ route, logoLabel, description, country }) => {
  it('shows the company name as the single heading, with a named logo', async () => {
    const wrapper = await mountLandingPageAt(route)

    const headings = wrapper.findAll('h1')
    expect(headings).toHaveLength(1)
    expect(headings[0]!.text()).toBe('N2Shader')
    expect(wrapper.find('svg[role="img"]').attributes('aria-label')).toBe(logoLabel)

    wrapper.unmount()
  })

  it('shows the description and the three contact details in its locale', async () => {
    const wrapper = await mountLandingPageAt(route)

    expect(wrapper.text()).toContain(description)
    const emailLink = wrapper.find('a[href^="mailto:"]')
    expect(emailLink.attributes('href')).toBe('mailto:n2shader@gmail.com')
    expect(emailLink.text()).toBe('n2shader@gmail.com')
    const phoneLink = wrapper.find('a[href^="tel:"]')
    expect(phoneLink.attributes('href')).toBe('tel:+447771444593')
    expect(phoneLink.text()).toBe('+44 7771 444593')
    expect(wrapper.find('address').text()).toContain(country)

    wrapper.unmount()
  })
})
