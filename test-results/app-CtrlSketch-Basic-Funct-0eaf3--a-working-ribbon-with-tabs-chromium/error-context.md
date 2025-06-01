# Test info

- Name: CtrlSketch Basic Functionality >> should have a working ribbon with tabs
- Location: C:\Jeff\CtrlSketch_Beta1\tests\e2e\app.spec.js:14:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('.ribbon-tab:has-text("Home")')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('.ribbon-tab:has-text("Home")')

    at C:\Jeff\CtrlSketch_Beta1\tests\e2e\app.spec.js:21:27
```

# Page snapshot

```yaml
- img "CtrlSketch Logo"
- heading "CtrlSketch" [level=2]
- paragraph: Version 1.0.0
- paragraph: "License: CS-2023-0001"
```

# Test source

```ts
   1 | // @ts-check
   2 | const { test, expect } = require('@playwright/test');
   3 |
   4 | test.describe('CtrlSketch Basic Functionality', () => {
   5 |   test('should load the application', async ({ page }) => {
   6 |     // Navigate to the app
   7 |     await page.goto('/');
   8 |     
   9 |     // Verify the app loads by checking for key elements
   10 |     await expect(page.locator('.canvas-workspace')).toBeVisible();
   11 |     await expect(page.locator('.ribbon')).toBeVisible();
   12 |   });
   13 |
   14 |   test('should have a working ribbon with tabs', async ({ page }) => {
   15 |     await page.goto('/');
   16 |     
   17 |     // Check that the ribbon has tabs
   18 |     const homeTab = page.locator('.ribbon-tab:has-text("Home")');
   19 |     const viewTab = page.locator('.ribbon-tab:has-text("View")');
   20 |     
>  21 |     await expect(homeTab).toBeVisible();
      |                           ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
   22 |     await expect(viewTab).toBeVisible();
   23 |     
   24 |     // Click on the View tab
   25 |     await viewTab.click();
   26 |     
   27 |     // Verify the View tab is active
   28 |     await expect(viewTab).toHaveClass(/active/);
   29 |   });
   30 |
   31 |   test('should toggle layers panel when clicking the Layers button', async ({ page }) => {
   32 |     await page.goto('/');
   33 |     
   34 |     // Click on the View tab
   35 |     await page.locator('.ribbon-tab:has-text("View")').click();
   36 |     
   37 |     // Find and click the Layers button
   38 |     const layersButton = page.locator('.ribbon-button:has-text("Layers")');
   39 |     await expect(layersButton).toBeVisible();
   40 |     await layersButton.click();
   41 |     
   42 |     // Verify the layers panel is visible
   43 |     await expect(page.locator('.layers-panel')).toBeVisible();
   44 |     
   45 |     // Click the Layers button again to hide the panel
   46 |     await layersButton.click();
   47 |     
   48 |     // Verify the layers panel is hidden
   49 |     await expect(page.locator('.layers-panel')).not.toBeVisible();
   50 |   });
   51 | });
   52 |
   53 | test.describe('Drawing Functionality', () => {
   54 |   test('should be able to select a drawing tool', async ({ page }) => {
   55 |     await page.goto('/');
   56 |     
   57 |     // Click on the Home tab to ensure it's active
   58 |     await page.locator('.ribbon-tab:has-text("Home")').click();
   59 |     
   60 |     // Find and click on a drawing tool (e.g., Rectangle)
   61 |     const rectangleTool = page.locator('.ribbon-button:has-text("Rectangle")');
   62 |     await expect(rectangleTool).toBeVisible();
   63 |     await rectangleTool.click();
   64 |     
   65 |     // Verify the tool is selected (this might need to be adjusted based on your UI)
   66 |     await expect(rectangleTool).toHaveClass(/selected/);
   67 |   });
   68 |
   69 |   test('should be able to draw a shape on the canvas', async ({ page }) => {
   70 |     await page.goto('/');
   71 |     
   72 |     // Select the Rectangle tool
   73 |     await page.locator('.ribbon-tab:has-text("Home")').click();
   74 |     await page.locator('.ribbon-button:has-text("Rectangle")').click();
   75 |     
   76 |     // Get the canvas element
   77 |     const canvas = page.locator('.canvas-workspace');
   78 |     await expect(canvas).toBeVisible();
   79 |     
   80 |     // Get the bounding box of the canvas
   81 |     const boundingBox = await canvas.boundingBox();
   82 |     
   83 |     // Draw a rectangle by clicking and dragging
   84 |     if (boundingBox) {
   85 |       const startX = boundingBox.x + boundingBox.width / 4;
   86 |       const startY = boundingBox.y + boundingBox.height / 4;
   87 |       const endX = boundingBox.x + (boundingBox.width * 3) / 4;
   88 |       const endY = boundingBox.y + (boundingBox.height * 3) / 4;
   89 |       
   90 |       await page.mouse.move(startX, startY);
   91 |       await page.mouse.down();
   92 |       await page.mouse.move(endX, endY);
   93 |       await page.mouse.up();
   94 |       
   95 |       // Wait a moment for the shape to be rendered
   96 |       await page.waitForTimeout(500);
   97 |       
   98 |       // Verify a shape was created (this might need to be adjusted based on your app)
   99 |       // This could check for a selection box, a shape element, or other indicators
  100 |       await expect(page.locator('.shape, .selected-shape')).toBeVisible();
  101 |     }
  102 |   });
  103 | });
  104 |
  105 | test.describe('Layer Management', () => {
  106 |   test('should display layers in the layers panel', async ({ page }) => {
  107 |     await page.goto('/');
  108 |     
  109 |     // Open the layers panel
  110 |     await page.locator('.ribbon-tab:has-text("View")').click();
  111 |     await page.locator('.ribbon-button:has-text("Layers")').click();
  112 |     
  113 |     // Verify the layers panel is visible
  114 |     const layersPanel = page.locator('.layers-panel');
  115 |     await expect(layersPanel).toBeVisible();
  116 |     
  117 |     // Check that at least one layer exists
  118 |     await expect(page.locator('.layer-item')).toBeVisible();
  119 |   });
  120 |
  121 |   test('should be able to toggle layer visibility', async ({ page }) => {
```