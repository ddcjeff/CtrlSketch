// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Layer Opacity Functionality', () => {
  test('should adjust layer opacity using the slider', async ({ page }) => {
    await page.goto('/');
    
    // Open the layers panel
    await page.locator('.ribbon-tab:has-text("View")').click();
    await page.locator('.ribbon-button:has-text("Layers")').click();
    
    // Verify the layers panel is visible
    const layersPanel = page.locator('.layers-panel');
    await expect(layersPanel).toBeVisible();
    
    // Find the opacity slider for the first layer
    const opacitySlider = page.locator('.layer-item').first().locator('input[type="range"]');
    await expect(opacitySlider).toBeVisible();
    
    // Get the initial value
    const initialValue = await opacitySlider.inputValue();
    
    // Set the opacity to 50%
    await opacitySlider.fill('50');
    
    // Verify the value changed
    await expect(opacitySlider).toHaveValue('50');
    
    // Check that the layer's visual representation reflects the opacity change
    // This might need to be adjusted based on how your app handles opacity
    const layerElement = page.locator('.layer-item').first();
    await expect(layerElement.locator('.opacity-value')).toContainText('50');
  });

  test('should update the canvas when layer opacity changes', async ({ page }) => {
    await page.goto('/');
    
    // Draw a shape first
    await page.locator('.ribbon-tab:has-text("Home")').click();
    await page.locator('.ribbon-button:has-text("Rectangle")').click();
    
    const canvas = page.locator('.canvas-workspace');
    const boundingBox = await canvas.boundingBox();
    
    if (boundingBox) {
      // Draw a rectangle
      const startX = boundingBox.x + boundingBox.width / 4;
      const startY = boundingBox.y + boundingBox.height / 4;
      const endX = boundingBox.x + (boundingBox.width * 3) / 4;
      const endY = boundingBox.y + (boundingBox.height * 3) / 4;
      
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY);
      await page.mouse.up();
      
      // Wait for the shape to be created
      await page.waitForTimeout(500);
    }
    
    // Open the layers panel
    await page.locator('.ribbon-tab:has-text("View")').click();
    await page.locator('.ribbon-button:has-text("Layers")').click();
    
    // Find the opacity slider for the layer with the shape
    const opacitySlider = page.locator('.layer-item').first().locator('input[type="range"]');
    
    // Change the opacity to 50%
    await opacitySlider.fill('50');
    
    // Take a screenshot before changing opacity further
    const screenshotBefore = await page.screenshot();
    
    // Change the opacity to 20%
    await opacitySlider.fill('20');
    
    // Wait for the rendering to update
    await page.waitForTimeout(500);
    
    // Take a screenshot after changing opacity
    const screenshotAfter = await page.screenshot();
    
    // Compare screenshots - they should be different if opacity is working
    // This is a simple check that the screenshots are different
    expect(screenshotBefore).not.toEqual(screenshotAfter);
  });
});