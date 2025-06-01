# CtrlSketch_Hybrid Testing Suite

This directory contains tests for the CtrlSketch_Hybrid application. The tests are organized into the following categories:

## Unit Tests

Located in the `unit` directory, these tests focus on testing individual components and utilities in isolation.

- **Components**: Tests for Vue components
- **Utils**: Tests for utility functions

## Integration Tests

Located in the `integration` directory, these tests focus on testing how components interact with each other.

## Running Tests

To run the tests, use the following commands:

```bash
# Run all tests once
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The test suite aims to cover the following aspects of the application:

1. **Component Rendering**: Ensuring components render correctly with different props
2. **Component Interactions**: Testing events and user interactions
3. **State Management**: Verifying state changes work as expected
4. **Utility Functions**: Testing helper functions and utilities

## Fixing Test Failures

If you encounter test failures, here are some common issues and solutions:

1. **Component Structure Changes**: If the component's DOM structure has changed, update the selectors in the tests
2. **Prop Changes**: If component props have changed, update the test setup
3. **Event Changes**: If event names or payloads have changed, update the event assertions

## Adding New Tests

When adding new features, please add corresponding tests:

1. **Unit Tests**: For new components or utilities
2. **Integration Tests**: For features that span multiple components
3. **Regression Tests**: For bugs that have been fixed

## Mocking Dependencies

For components with external dependencies (like Canvas API), use the mocking capabilities provided by Vitest:

```javascript
import { vi } from 'vitest'

// Mock a function
const mockFunction = vi.fn()

// Mock a module
vi.mock('module-name', () => ({
  default: vi.fn(),
  namedExport: vi.fn()
}))
```

## Best Practices

1. Keep tests focused and small
2. Use descriptive test names
3. Group related tests together
4. Avoid testing implementation details
5. Focus on behavior, not internal state