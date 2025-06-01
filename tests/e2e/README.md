# End-to-End Testing with Playwright

This directory contains end-to-end tests for the CtrlSketch_Hybrid application using Playwright.

## Overview

End-to-end tests verify that the application works correctly from a user's perspective by automating browser interactions. These tests complement the unit and integration tests by testing the application as a whole.

## Test Structure

- `app.spec.js` - Tests for basic application functionality
- `opacity.spec.js` - Tests for layer opacity functionality

## Running Tests

### Run All Tests

```bash
npx playwright test
```

### Run Tests with UI Mode

```bash
npx playwright test --ui
```

This opens the Playwright UI, which provides a visual interface for running and debugging tests.

### Run Tests in a Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run a Specific Test File

```bash
npx playwright test app.spec.js
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

## Test Reports

After running tests, an HTML report is generated. View it with:

```bash
npx playwright show-report
```

## Trace Viewer

For failed tests, Playwright captures traces that can be viewed with:

```bash
npx playwright show-trace test-results/trace.zip
```

## Creating New Tests

1. Create a new file in the `tests/e2e` directory with a `.spec.js` extension
2. Import the Playwright test utilities:
   ```javascript
   const { test, expect } = require('@playwright/test');
   ```
3. Write your tests using the Playwright API
4. Run the tests to verify they work as expected

## Best Practices

1. **Keep tests independent** - Each test should be able to run on its own
2. **Use descriptive test names** - Make it clear what each test is verifying
3. **Test user flows** - Focus on testing complete user journeys
4. **Use page objects** - For complex applications, use page objects to organize test code
5. **Avoid flaky tests** - Use proper waiting mechanisms instead of fixed timeouts
6. **Take screenshots** - Use screenshots to verify visual changes

## Debugging Tips

1. Use `--debug` flag to run tests in debug mode
2. Add `await page.pause()` in your test to pause execution
3. Use `console.log()` for debugging (output appears in the terminal)
4. Take screenshots with `await page.screenshot({ path: 'screenshot.png' })`
5. Use the Trace Viewer to see what happened during test execution

## Configuration

The Playwright configuration is in `playwright.config.js` in the project root. Adjust settings like:

- Browsers to test in
- Viewport size
- Timeouts
- Reporters
- Screenshots and video recording

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Test Examples](https://github.com/microsoft/playwright/tree/main/examples)