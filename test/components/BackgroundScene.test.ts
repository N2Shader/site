import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BackgroundScene from '../../app/components/BackgroundScene.vue'

describe('BackgroundScene', () => {
  it('renders the fallback backdrop and an empty scene canvas, hidden from assistive tech', async () => {
    const wrapper = await mountSuspended(BackgroundScene)

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(wrapper.text()).toBe('')

    wrapper.unmount()
  })
})
