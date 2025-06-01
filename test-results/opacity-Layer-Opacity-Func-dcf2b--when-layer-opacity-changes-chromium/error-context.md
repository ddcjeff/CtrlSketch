# Test info

- Name: Layer Opacity Functionality >> should update the canvas when layer opacity changes
- Location: C:\Jeff\CtrlSketch_Beta1\tests\e2e\opacity.spec.js:35:3

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.ribbon-tab:has-text("Home")')

    at C:\Jeff\CtrlSketch_Beta1\tests\e2e\opacity.spec.js:39:56
```

# Page snapshot

```yaml
- img "CtrlSketch Logo"
- button "📁 File":
  - text: 📁 File
  - img
- button "❓ Help":
  - text: ❓ Help
  - img
- button "🏠 Home"
- button "➕ Insert"
- button "✏️ Draw"
- button "👁️ View"
- button "🔧 Tools"
- text: Powered by HickSoft
- heading "Clipboard" [level=3]
- button "📋 Paste"
- button "✂️ Cut"
- button "📝 Copy"
- heading "History" [level=3]
- button "↩️ Undo"
- button "↪️ Redo"
- heading "Arrange" [level=3]
- button "🔗 Group"
- button "🔓 Ungroup"
- main:
  - text: 0 ¼ ½ ¼ 1 ¼ ½ ¼ 2 ¼ ½ ¼ 3 ¼ ½ ¼ 4 ¼ ½ ¼ 5 ¼ ½ ¼ 6 ¼ ½ ¼ 7 ¼ ½ ¼ 8 ¼ ½ ¼ 9 ¼ ½ ¼ 10 ¼ ½ ¼ 11 ¼ ½ ¼ 12 ¼ ½ ¼ 13 ¼ ½ ¼ 14 ¼ ½ ¼ 15 ¼ ½ ¼ 16 ¼ ½ ¼ 17 0 ¼ ½ ¼ 1 ¼ ½ ¼ 2 ¼ ½ ¼ 3 ¼ ½ ¼ 4 ¼ ½ ¼ 5 ¼ ½ ¼ 6 ¼ ½ ¼ 7 ¼ ½ ¼ 8 ¼ ½ ¼ 9 ¼ ½ ¼ 10 ¼ ½ ¼ 11 0,0
  - strong: "Zoom:"
  - text: 100%
  - strong: "X:"
  - text: "0"
  - strong: "Y:"
  - text: "0"
  - strong: "Selected:"
  - text: "0"
  - strong: "Snap to Grid:"
  - text: "OFF"
  - button "Debug"
```

# Test source

```ts
   1 | // @ts-check
   2 | const { test, expect } = require('@playwright/test');
   3 |
   4 | test.describe('Layer Opacity Functionality', () => {
   5 |   test('should adjust layer opacity using the slider', async ({ page }) => {
   6 |     await page.goto('/');
   7 |     
   8 |     // Open the layers panel
   9 |     await page.locator('.ribbon-tab:has-text("View")').click();
  10 |     await page.locator('.ribbon-button:has-text("Layers")').click();
  11 |     
  12 |     // Verify the layers panel is visible
  13 |     const layersPanel = page.locator('.layers-panel');
  14 |     await expect(layersPanel).toBeVisible();
  15 |     
  16 |     // Find the opacity slider for the first layer
  17 |     const opacitySlider = page.locator('.layer-item').first().locator('input[type="range"]');
  18 |     await expect(opacitySlider).toBeVisible();
  19 |     
  20 |     // Get the initial value
  21 |     const initialValue = await opacitySlider.inputValue();
  22 |     
  23 |     // Set the opacity to 50%
  24 |     await opacitySlider.fill('50');
  25 |     
  26 |     // Verify the value changed
  27 |     await expect(opacitySlider).toHaveValue('50');
  28 |     
  29 |     // Check that the layer's visual representation reflects the opacity change
  30 |     // This might need to be adjusted based on how your app handles opacity
  31 |     const layerElement = page.locator('.layer-item').first();
  32 |     await expect(layerElement.locator('.opacity-value')).toContainText('50');
  33 |   });
  34 |
  35 |   test('should update the canvas when layer opacity changes', async ({ page }) => {
  36 |     await page.goto('/');
  37 |     
  38 |     // Draw a shape first
> 39 |     await page.locator('.ribbon-tab:has-text("Home")').click();
     |                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  40 |     await page.locator('.ribbon-button:has-text("Rectangle")').click();
  41 |     
  42 |     const canvas = page.locator('.canvas-workspace');
  43 |     const boundingBox = await canvas.boundingBox();
  44 |     
  45 |     if (boundingBox) {
  46 |       // Draw a rectangle
  47 |       const startX = boundingBox.x + boundingBox.width / 4;
  48 |       const startY = boundingBox.y + boundingBox.height / 4;
  49 |       const endX = boundingBox.x + (boundingBox.width * 3) / 4;
  50 |       const endY = boundingBox.y + (boundingBox.height * 3) / 4;
  51 |       
  52 |       await page.mouse.move(startX, startY);
  53 |       await page.mouse.down();
  54 |       await page.mouse.move(endX, endY);
  55 |       await page.mouse.up();
  56 |       
  57 |       // Wait for the shape to be created
  58 |       await page.waitForTimeout(500);
  59 |     }
  60 |     
  61 |     // Open the layers panel
  62 |     await page.locator('.ribbon-tab:has-text("View")').click();
  63 |     await page.locator('.ribbon-button:has-text("Layers")').click();
  64 |     
  65 |     // Find the opacity slider for the layer with the shape
  66 |     const opacitySlider = page.locator('.layer-item').first().locator('input[type="range"]');
  67 |     
  68 |     // Change the opacity to 50%
  69 |     await opacitySlider.fill('50');
  70 |     
  71 |     // Take a screenshot before changing opacity further
  72 |     const screenshotBefore = await page.screenshot();
  73 |     
  74 |     // Change the opacity to 20%
  75 |     await opacitySlider.fill('20');
  76 |     
  77 |     // Wait for the rendering to update
  78 |     await page.waitForTimeout(500);
  79 |     
  80 |     // Take a screenshot after changing opacity
  81 |     const screenshotAfter = await page.screenshot();
  82 |     
  83 |     // Compare screenshots - they should be different if opacity is working
  84 |     // This is a simple check that the screenshots are different
  85 |     expect(screenshotBefore).not.toEqual(screenshotAfter);
  86 |   });
  87 | });
```