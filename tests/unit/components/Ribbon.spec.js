import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Ribbon from '../../../src/components/Ribbon.vue'

describe('Ribbon.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Ribbon, {
      props: {
        activeTab: 'Home',
        gridSize: 20,
        gridOpacity: 0.5,
        showLayers: false
      }
    })
  })

  it('renders the Home tab content when activeTab is Home', () => {
    expect(wrapper.find('.bg-gray-900:first-child h3').text()).toBe('Clipboard')
    expect(wrapper.findAll('button')[0].text()).toContain('Paste')
    expect(wrapper.findAll('button')[1].text()).toContain('Cut')
    expect(wrapper.findAll('button')[2].text()).toContain('Copy')
  })

  it('renders the View tab content when activeTab is View', async () => {
    await wrapper.setProps({ activeTab: 'View' })
    
    expect(wrapper.find('.bg-gray-900:first-child h3').text()).toBe('View')
    expect(wrapper.findAll('button')[0].text()).toContain('Toggle Grid')
    expect(wrapper.findAll('button')[1].text()).toContain('Toggle Rulers')
  })

  it('renders the Layers button in the View tab', async () => {
    await wrapper.setProps({ activeTab: 'View' })
    
    const buttons = wrapper.findAll('button')
    const layersButton = Array.from(buttons).find(button => button.text().includes('Layers'))
    
    expect(layersButton).toBeTruthy()
  })

  it('applies the correct styling to the Layers button when showLayers is true', async () => {
    await wrapper.setProps({ 
      activeTab: 'View',
      showLayers: true
    })
    
    const buttons = wrapper.findAll('button')
    const layersButton = Array.from(buttons).find(button => button.text().includes('Layers'))
    
    expect(layersButton.classes()).toContain('bg-indigo-700')
  })

  it('applies the correct styling to the Layers button when showLayers is false', async () => {
    await wrapper.setProps({ 
      activeTab: 'View',
      showLayers: false
    })
    
    const buttons = wrapper.findAll('button')
    const layersButton = Array.from(buttons).find(button => button.text().includes('Layers'))
    
    expect(layersButton.classes()).toContain('bg-gray-800')
  })

  it('emits ribbon-action event with correct payload when a button is clicked', async () => {
    const pasteButton = wrapper.findAll('button')[0] // Paste button in Home tab
    await pasteButton.trigger('click')
    
    expect(wrapper.emitted('ribbon-action')).toBeTruthy()
    expect(wrapper.emitted('ribbon-action')[0][0]).toEqual({ 
      type: 'clipboard', 
      value: 'paste' 
    })
  })

  it('emits ribbon-action event with correct payload when Layers button is clicked', async () => {
    await wrapper.setProps({ activeTab: 'View' })
    
    const buttons = wrapper.findAll('button')
    const layersButton = Array.from(buttons).find(button => button.text().includes('Layers'))
    
    await layersButton.trigger('click')
    
    expect(wrapper.emitted('ribbon-action')).toBeTruthy()
    const emittedEvents = wrapper.emitted('ribbon-action')
    const layersEvent = emittedEvents.find(event => 
      event[0].type === 'view' && event[0].value === 'layers'
    )
    
    expect(layersEvent).toBeTruthy()
  })
})