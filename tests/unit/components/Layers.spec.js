import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Layers from '../../../src/components/Layers.vue'

// Mock data for testing
const mockLayers = [
  { id: 'layer1', name: 'Layer 1', visible: true, opacity: 100 },
  { id: 'layer2', name: 'Layer 2', visible: true, opacity: 75 },
  { id: 'layer3', name: 'Layer 3', visible: false, opacity: 50 }
]

describe('Layers.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Layers, {
      props: {
        visible: true,
        layers: mockLayers,
        selectedLayerIndex: 0
      }
    })
  })

  it('renders the correct number of layers', () => {
    const layerItems = wrapper.findAll('.layer-item')
    expect(layerItems.length).toBe(mockLayers.length)
  })

  it('displays the correct layer names', () => {
    const layerNames = wrapper.findAll('.layer-name')
    expect(layerNames[0].text()).toBe('Layer 1')
    expect(layerNames[1].text()).toBe('Layer 2')
    expect(layerNames[2].text()).toBe('Layer 3')
  })

  it('shows the correct visibility state for each layer', () => {
    // Find the visibility buttons (they're the first button in each layer-controls div)
    const visibilityButtons = wrapper.findAll('.layer-controls button:first-child')
    
    // First two layers are visible
    expect(visibilityButtons[0].find('.icon').text()).toBe('👁️')
    expect(visibilityButtons[1].find('.icon').text()).toBe('👁️')
    
    // Third layer is hidden
    expect(visibilityButtons[2].find('.icon').text()).toBe('👁️‍🗨️')
  })

  it('emits update-layers event when visibility is toggled', async () => {
    // Find the first visibility button
    const visibilityButton = wrapper.findAll('.layer-controls button:first-child')[0]
    await visibilityButton.trigger('click')
    
    // The component now emits update-layers instead of update-layer-visibility
    expect(wrapper.emitted('update-layers')).toBeTruthy()
    
    // Check that the updated layers array has the first layer's visibility toggled
    const updatedLayers = wrapper.emitted('update-layers')[0][0]
    expect(updatedLayers[0].visible).toBe(false) // toggled from true to false
  })

  it('emits select-layer event when a layer is clicked', async () => {
    const layerItem = wrapper.findAll('.layer-item')[1]
    await layerItem.trigger('click')
    
    expect(wrapper.emitted('select-layer')).toBeTruthy()
    expect(wrapper.emitted('select-layer')[0][0]).toBe(1) // index 1
  })

  it('shows the correct opacity icon based on layer opacity', () => {
    // Find the opacity buttons (they're the third button in each layer-controls div)
    const opacityButtons = wrapper.findAll('.layer-controls button:nth-child(3)')
    
    // Layer 1: 100% opacity
    expect(opacityButtons[0].find('.icon').text()).toBe('🔍')
    
    // Layer 2: 75% opacity
    expect(opacityButtons[1].find('.icon').text()).toBe('🔍')
    
    // Layer 3: 50% opacity
    expect(opacityButtons[2].find('.icon').text()).toBe('🔅')
  })

  it('emits update-layer-opacity event when opacity is changed', async () => {
    // Open opacity slider by clicking the opacity button (third button)
    const opacityButton = wrapper.findAll('.layer-controls button:nth-child(3)')[0]
    await opacityButton.trigger('click')
    
    // Find the slider and change its value
    const slider = wrapper.find('.opacity-slider')
    await slider.setValue(50)
    
    // Check that both update-layers and update-layer-opacity events are emitted
    expect(wrapper.emitted('update-layers')).toBeTruthy()
    expect(wrapper.emitted('update-layer-opacity')).toBeTruthy()
    
    // Check the update-layer-opacity event payload
    expect(wrapper.emitted('update-layer-opacity')[0][0]).toEqual({
      index: 0,
      opacity: 50
    })
  })
})