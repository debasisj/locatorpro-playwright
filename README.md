# @locatorpro/playwright

🎯 **Self-healing locators for Playwright with 35-priority intelligent selector generation**

[![npm version](https://badge.fury.io/js/%40locatorpro%2Fplaywright.svg)](https://badge.fury.io/js/%40locatorpro%2Fplaywright)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

LocatorPro brings the power of self-healing, intelligent locator generation to Playwright test automation. Using a sophisticated 35-priority system, it automatically generates multiple fallback strategies for each element, making your tests more resilient to UI changes.

### 🚀 Key Features

- **35-Priority Locator System**: Intelligent ranking from test-specific attributes to fallback strategies
- **Self-Healing**: Automatic fallback when primary locators fail
- **Playwright Native**: Built specifically for Playwright with full TypeScript support
- **Zero Configuration**: Works out of the box with sensible defaults
- **Highly Configurable**: Customize strategies, priorities, and fallback behavior
- **Production Ready**: Based on proven Chrome extension logic used by thousands of developers

## Installation

```bash
npm install @locatorpro/playwright
# or
yarn add @locatorpro/playwright
# or
pnpm add @locatorpro/playwright
```

## Quick Start

```typescript
import { test, expect } from '@playwright/test';
import { SmartLocator } from '@locatorpro/playwright';

test('self-healing locator example', async ({ page }) => {
  await page.goto('https://example.com');
  
  const smartLocator = new SmartLocator(page);
  
  // Find elements with automatic fallback strategies
  const loginButton = await smartLocator.findByText('Login');
  const usernameField = await smartLocator.findByTestId('username');
  
  await usernameField.fill('user@example.com');
  await loginButton.click();
  
  await expect(page).toHaveURL(/dashboard/);
});
```

## Core Concepts

### 35-Priority Locator System

LocatorPro uses a sophisticated priority system to generate the most reliable locators:

**Priority 1-5: Test-Specific Attributes** (Highest Reliability)
- `data-testid`
- `data-test`
- `data-qa`
- `test-id`
- Test-like IDs

**Priority 6-10: Semantic Attributes**
- Element IDs
- ARIA labels
- ARIA labelledby
- Name attributes
- For attributes

**Priority 11-15: Role-Based Strategies**
- Explicit ARIA roles
- Implicit element roles

**Priority 16-20: Text-Based Strategies**
- Exact text content
- Partial text matching
- Placeholder text
- Alt text

**Priority 21-25: Structure-Based Strategies**
- CSS classes (filtered)
- Tag names
- CSS paths
- Input types

**Priority 26-30: Attribute Combinations**
- Custom attributes
- Value attributes
- Href attributes
- Src attributes

**Priority 31-35: Fallback Strategies**
- XPath selectors
- Position-based (optional)

## API Reference

### SmartLocator Class

#### Constructor

```typescript
new SmartLocator(page: Page, options?: LocatorProOptions)
```

**Options:**
```typescript
interface LocatorProOptions {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  config?: LocatorConfig;
  customStrategies?: Array<(element: Element) => LocatorStrategy[]>;
}

interface LocatorConfig {
  maxStrategies?: number;        // Default: 10
  includeXPath?: boolean;        // Default: true
  includeCssPath?: boolean;      // Default: true
  prioritizeTestAttributes?: boolean; // Default: true
  fallbackToPosition?: boolean;  // Default: false
  customAttributes?: string[];   // Default: []
}
```

#### Methods

##### `findByText(text: string): Promise<Locator>`
Find elements by text content with multiple fallback strategies.

```typescript
const button = await smartLocator.findByText('Submit');
const link = await smartLocator.findByText('Learn More');
```

##### `findByTestId(testId: string): Promise<Locator>`
Find elements by test ID with enhanced fallback strategies.

```typescript
const field = await smartLocator.findByTestId('email-input');
```

##### `findByRole(role: string, options?: {name?: string}): Promise<Locator>`
Find elements by ARIA role with optional name filtering.

```typescript
const nav = await smartLocator.findByRole('navigation');
const button = await smartLocator.findByRole('button', { name: 'Submit' });
```

##### `findBySelector(selector: string): Promise<Locator>`
Enhance any CSS selector with self-healing capabilities.

```typescript
const element = await smartLocator.findBySelector('.my-component');
```

##### `enhanceLocator(locator: Locator): Promise<Locator>`
Add self-healing capabilities to existing Playwright locators.

```typescript
const basicLocator = page.locator('#my-id');
const enhancedLocator = await smartLocator.enhanceLocator(basicLocator);
```

##### `validateLocator(locator: Locator): Promise<boolean>`
Check if a locator can find elements on the current page.

```typescript
const isValid = await smartLocator.validateLocator(myLocator);
```

##### `getDebugInfo(selector: string): Promise<DebugInfo>`
Get detailed information about generated strategies for debugging.

```typescript
const debug = await smartLocator.getDebugInfo('.my-selector');
console.log('Strategies:', debug.strategies);
console.log('Recommended:', debug.recommended);
```

## Advanced Usage

### Page Object Model Integration

```typescript
import { Page } from '@playwright/test';
import { SmartLocator } from '@locatorpro/playwright';

export class LoginPage {
  private smartLocator: SmartLocator;

  constructor(private page: Page) {
    this.smartLocator = new SmartLocator(page, {
      config: {
        customAttributes: ['data-automation', 'data-qa'],
        prioritizeTestAttributes: true
      }
    });
  }

  async login(username: string, password: string) {
    // Self-healing locators adapt to UI changes automatically
    await (await this.smartLocator.findByTestId('username')).fill(username);
    await (await this.smartLocator.findByTestId('password')).fill(password);
    await (await this.smartLocator.findByText('Sign In')).click();
  }

  async getValidationError() {
    // Multiple strategies for error messages
    return this.smartLocator.findBySelector('.error, .validation-message, [role="alert"]');
  }
}
```

### Custom Configuration

```typescript
const smartLocator = new SmartLocator(page, {
  logLevel: 'debug',
  config: {
    maxStrategies: 15,
    includeXPath: true,
    includeCssPath: false,
    prioritizeTestAttributes: true,
    customAttributes: [
      'data-automation',
      'data-qa-id',
      'data-test-id',
      'automation-id'
    ]
  }
});
```

### Debugging and Monitoring

```typescript
// Enable debug logging
const smartLocator = new SmartLocator(page, { logLevel: 'debug' });

// Get detailed strategy information
const debugInfo = await smartLocator.getDebugInfo('#my-element');
console.log(`Generated ${debugInfo.strategies.length} strategies`);
console.log(`${debugInfo.validStrategies.length} strategies are valid`);
console.log(`Recommended: ${debugInfo.recommended}`);

// Log all strategies for analysis
debugInfo.strategies.forEach((strategy, index) => {
  console.log(`${index + 1}. [${strategy.type}] ${strategy.selector} (Priority: ${strategy.priority})`);
});
```

## Best Practices

### 1. Use Test-Specific Attributes
```html
<!-- Preferred -->
<button data-testid="submit-button">Submit</button>
<input data-qa="email-field" type="email">

<!-- Good fallback -->
<button id="submit-btn">Submit</button>
<input name="email" type="email">
```

### 2. Leverage Semantic HTML
```html
<!-- Better -->
<button aria-label="Close dialog">×</button>
<nav role="navigation">
  <a href="/home">Home</a>
</nav>

<!-- Than -->
<div class="btn close-btn">×</div>
<div class="nav">
  <span class="link">Home</span>
</div>
```

### 3. Configure for Your Application
```typescript
// For applications with specific test attribute patterns
const smartLocator = new SmartLocator(page, {
  config: {
    customAttributes: ['data-automation-id', 'data-e2e'],
    prioritizeTestAttributes: true,
    maxStrategies: 8
  }
});
```

### 4. Use in Page Object Models
```typescript
// Encapsulate smart locators in page objects
export class DashboardPage {
  constructor(private page: Page) {
    this.smartLocator = new SmartLocator(page);
  }

  get userMenu() {
    return this.smartLocator.findByTestId('user-menu');
  }

  get notifications() {
    return this.smartLocator.findByRole('button', { name: 'Notifications' });
  }
}
```

## Performance Considerations

- **Strategy Validation**: Only valid strategies are kept, reducing false positives
- **Lazy Evaluation**: Strategies are generated only when needed
- **Caching**: Results can be cached for repeated operations
- **Configurable Limits**: Control the number of strategies generated

## Migration Guide

### From Standard Playwright Locators

```typescript
// Before
const button = page.locator('[data-testid="submit"]');
const text = page.getByText('Login');

// After
const smartLocator = new SmartLocator(page);
const button = await smartLocator.findByTestId('submit');
const text = await smartLocator.findByText('Login');
```

### From Selenium/WebDriver

```typescript
// Before (Selenium)
driver.findElement(By.xpath("//button[text()='Submit']"));
driver.findElement(By.id("email-field"));

// After (LocatorPro)
const button = await smartLocator.findByText('Submit');
const field = await smartLocator.findByTestId('email-field');
```

## Error Handling

```typescript
try {
  const element = await smartLocator.findByTestId('missing-element');
  await element.click();
} catch (error) {
  // LocatorPro will have tried all available strategies
  console.log('Element not found with any strategy');
  
  // Get debug information
  const debug = await smartLocator.getDebugInfo('[data-testid="missing-element"]');
  console.log('Attempted strategies:', debug.strategies);
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/locatorpro/playwright.git
cd playwright
npm install
npm run build
npm test
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] **Enhanced Self-Healing**: Automatic strategy re-ranking based on success rates
- [ ] **Visual Locators**: Integration with visual element recognition
- [ ] **AI-Powered Strategies**: Machine learning-based locator generation
- [ ] **Multi-Framework Support**: Expand to Cypress, Selenium, and others
- [ ] **Performance Analytics**: Built-in metrics and reporting
- [ ] **Strategy Learning**: Adaptive algorithms that learn from your application

## Support

- 📖 [Documentation](https://github.com/locatorpro/playwright#readme)
- 🐛 [Issue Tracker](https://github.com/locatorpro/playwright/issues)
- 💬 [Discussions](https://github.com/locatorpro/playwright/discussions)
- 📧 [Email Support](mailto:support@locatorpro.dev)

---

**Made with ❤️ by the LocatorPro Team**

*Bringing reliability and intelligence to web automation, one locator at a time.*
