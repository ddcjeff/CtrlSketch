// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('CtrlSketch Basic Functionality', () => {
  test('should load the application', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Verify the app loads by checking for key elements
    await expect(page.locator('.canvas-workspace')).toBeVisible();
    await expect(page.locator('.ribbon')).toBeVisible();
  });

  test('should have a working ribbon with tabs', async ({ page }) => {
    await page.goto('/');
    
    // Check that the ribbon has tabs
    const homeTab = page.locator('.ribbon-tab:has-text("Home")');
    const viewTab = page.locator('.ribbon-tab:has-text("View")');
    
    await expect(homeTab).toBeVisible();
    await expect(viewTab).toBeVisible();
    
    // Click on the View tab
    await viewTab.click();
    
    // Verify the View tab is active
    await expect(viewTab).toHaveClass(/active/);
  });

  test('should toggle layers panel when clicking the Layers button', async ({ page }) => {
    await page.goto('/');
    
    // Click on the View tab
    await page.locator('.ribbon-tab:has-text("View")').click();
    
    // Find and click the Layers button
    const layersButton = page.locator('.ribbon-button:has-text("Layers")');
    await expect(layersButton).toBeVisible();
    await layersButton.click();
    
    // Verify the layers panel is visible
    await expect(page.locator('.layers-panel')).toBeVisible();
    
    // Click the Layers button again to hide the panel
    await layersButton.click();
    
    // Verify the layers panel is hidden
    await expect(page.locator('.layers-panel')).not.toBeVisible();
  });
});

test.describe('Drawing Functionality', () => {
  test('should be able to select a drawing tool', async ({ page }) => {
    await page.goto('/');
    
    // Click on the Home tab to ensure it's active
    await page.locator('.ribbon-tab:has-text("Home")').click();
    
    // Find and click on a drawing tool (e.g., Rectangle)
    const rectangleTool = page.locator('.ribbon-button:has-text("Rectangle")');
    await expect(rectangleTool).toBeVisible();
    await rectangleTool.click();
    
    // Verify the tool is selected (this might need to be adjusted based on your UI)
    await expect(rectangleTool).toHaveClass(/selected/);
  });

  test('should be able to draw a shape on the canvas', async ({ page }) => {
    await page.goto('/');
    
    // Select the Rectangle tool
    await page.locator('.ribbon-tab:has-text("Home")').click();
    await page.locator('.ribbon-button:has-text("Rectangle")').click();
    
    // Get the canvas element
    const canvas = page.locator('.canvas-workspace');
    await expect(canvas).toBeVisible();
    
    // Get the bounding box of the canvas
    const boundingBox = await canvas.boundingBox();
    
    // Draw a rectangle by clicking and dragging
    if (boundingBox) {
      const startX = boundingBox.x + boundingBox.width / 4;
      const startY = boundingBox.y + boundingBox.height / 4;
      const endX = boundingBox.x + (boundingBox.width * 3) / 4;
      const endY = boundingBox.y + (boundingBox.height * 3) / 4;
      
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY);
      await page.mouse.up();
      
      // Wait a moment for the shape to be rendered
      await page.waitForTimeout(500);
      
      // Verify a shape was created (this might need to be adjusted based on your app)
      // This could check for a selection box, a shape element, or other indicators
      await expect(page.locator('.shape, .selected-shape')).toBeVisible();
    }
  });
});

test.describe('Layer Management', () => {
  test('should display layers in the layers panel', async ({ page }) => {
    await page.goto('/');
    
    // Open the layers panel
    await page.locator('.ribbon-tab:has-text("View")').click();
    await page.locator('.ribbon-button:has-text("Layers")').click();
    
    // Verify the layers panel is visible
    const layersPanel = page.locator('.layers-panel');
    await expect(layersPanel).toBeVisible();
    
    // Check that at least one layer exists
    await expect(page.locator('.layer-item')).toBeVisible();
  });

  test('should be able to toggle layer visibility', async ({ page }) => {
    await page.goto('/');
    
    // Open the layers panel
    await page.locator('.ribbon-tab:has-text("View")').click();
    await page.locator('.ribbon-button:has-text("Layers")').click();
    
    // Find the visibility toggle for the first layer
    const visibilityToggle = page.locator('.layer-item').first().locator('.layer-visibility-toggle');
    await expect(visibilityToggle).toBeVisible();
    
    // Get the current state
    const initialClass = await visibilityToggle.getAttribute('class');
    
    // Click to toggle visibility
    await visibilityToggle.click();
    
    // Verify the state changed
    if (initialClass) {
      // If initialClass is not null, check that it changed
      await expect(async () => {
        const newClass = await visibilityToggle.getAttribute('class');
        expect(newClass).not.toBe(initialClass);
      }).toPass();
    } else {
      // If initialClass was null, just check that it now has a class
      await expect(visibilityToggle).toHaveAttribute('class');
    }
  });
});