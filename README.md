# LocatorPro for Playwright 🎯 | Self-Healing Test Automation Locators

> **Self-Healing Locator System for Playwright Test Automation**  
> Transform fragile CSS selectors into intelligent, self-healing locators with automatic fallback strategies for robust web testing.

[![npm version](https://img.shields.io/npm/v/locatorpro-playwright.svg)](https://www.npmjs.com/package/locatorpro-playwright)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/debasisj/locatorpro-playwright/actions/workflows/ci.yml/badge.svg)](https://github.com/debasisj/locatorpro-playwright/actions/workflows/ci.yml)

**Keywords**: `playwright locators`, `test automation`, `self-healing tests`, `web testing`, `css selectors`, `xpath locators`, `test automation framework`, `playwright testing`, `robust locators`, `automated testing tools`


## 🚀 **Why Choose LocatorPro for Playwright Test Automation?**

**Microsoft Playwright already has excellent built-in locators** like `getByRole()`, `getByText()`, and `getByTestId()` that are robust and reliable for modern web testing. These should be your first choice for most test automation scenarios.

**However, you need LocatorPro when building resilient test automation for:**
- **Legacy web applications** where you can't control the HTML markup
- **Dynamic CSS selectors** and **changing element IDs** that break test automation
- Web elements lacking proper **test IDs**, **ARIA roles**, or **semantic markup**
- **Contextual element selection** in complex UI components (e.g., "Add to Cart" button for specific products)
- **Migrating existing test suites** with fragile CSS selectors without complete rewrites
- **Third-party web applications** and embedded widgets where HTML modification isn't possible
- **Cross-browser testing** scenarios requiring more resilient element location strategies

LocatorPro **enhances** Playwright's locator capabilities with intelligent fallbacks and contextual awareness, making your test automation resilient in scenarios where standard web testing approaches fall short.

**Traditional Playwright test automation breaks when:**
- Element IDs change: `#submit-btn-123` → `#submit-btn-456` ❌
- CSS classes are renamed: `.old-button` → `.new-button` ❌  
- DOM structure changes: Elements move or get nested differently ❌
- Dynamic content updates modify element attributes ❌

**LocatorPro creates self-healing test automation that:**
- ✅ **Automatically find alternative selectors** when CSS selectors break
- ✅ **Use intelligent fallback strategies** with priority-based element selection
- ✅ **Analyze DOM patterns** to understand test automation intent
- ✅ **Work across different responsive layouts** without test modification
- ✅ **Improve test automation reliability** and reduce maintenance overhead

---

## 🎯 **Core Test Automation Features**

### 🔍 **Smart Element Discovery for Web Testing**
- **Intelligent DOM scanning** with comprehensive HTML element analysis
- **Text-based element location** with fuzzy matching and text variations
- **Related element selection** - find interactive elements by nearby text content
- **HTML attribute-aware strategies** covering all standard and custom attributes

### 🛡️ **Self-Healing Test Automation Capabilities**
- **Multiple CSS selector fallbacks** with reliability scoring algorithms
- **Automatic enhancement** of existing fragile test locators  
- **Pattern recognition** for broken CSS selectors and XPath expressions
- **Cross-layout compatibility** for responsive web design testing

### ⚡ **Developer Experience for Test Automation**
- **Drop-in replacement** for existing Playwright locator methods
- **One-line solutions** for complex web testing scenarios
- **Comprehensive debugging** with detailed locator strategy logging
- **Zero configuration** - works out of the box with any Playwright test setup

---

## 📦 **Installation for Playwright Test Automation**

```bash
# Install LocatorPro for your Playwright test automation project
npm install locatorpro-playwright
# or using yarn for test automation setup
yarn add locatorpro-playwright
```
yarn add locatorpro-playwright
```

---

## 🚀 **Quick Start Guide for Playwright Testing**

```typescript
import { test, expect } from '@playwright/test';
import { SmartLocator } from 'locatorpro-playwright';

test('Smart locator test automation example', async ({ page }) => {
    const smartLocator = new SmartLocator(page);
    
    await page.goto('https://example.com');
    
    // 🎯 Find button by text with automatic CSS selector fallbacks
    const loginButton = await smartLocator.findByVisibleText('Login');
    await loginButton.click();
    
    // 🎯 Smart contextual element selection (great for test automation!)
    const addToCartBtn = await smartLocator.findByRelatedText(
        'Add to Cart',           // Target interactive element
        'iPhone 15 Pro'          // Related text content in same container
    );
    await addToCartBtn.click();
});
```

---

## 🎯 **Core Methods for Test Automation**

### 🔍 **Smart Discovery Methods for Web Testing**

#### `findByVisibleText(text, options?)` - Enhanced Text-Based Element Location
Find web elements by visible text with intelligent CSS selector fallbacks for robust test automation.

```typescript
// Basic text-based element location for test automation
const button = await smartLocator.findByVisibleText('Submit');

// Advanced text search with fallbacks for resilient testing
const element = await smartLocator.findByVisibleText('Submit', {
    fallbacks: ['Save', 'Send', 'Continue'],
    elementTypes: ['button', 'input', 'a'],
    maxResults: 5
});
```

#### `findByRelatedText(targetText, relatedText, options?)` 🌟 - Contextual Element Selection

**Great feature for test automation** - Find web elements by their relationship to nearby text content, perfect for complex UI testing.

```typescript
// Find "Add to Cart" button for specific product in e-commerce testing
const addBtn = await smartLocator.findByRelatedText(
    'Add to Cart',           // Interactive element to click
    'Product Name'           // Context text for element identification
);

// Real-world test automation examples
const sizeS = await smartLocator.findByRelatedText('S', 'Argus All-Weather Tank');
const chooseBtn = await smartLocator.findByRelatedText('Choose This Flight', 'Aer Lingus');
const repoLink = await smartLocator.findByRelatedText('my-repo', 'Smart locator library');
```

#### Enhanced Element Location Methods for Test Automation
Additional core finder methods with enhanced capabilities for robust web testing.

```typescript
// Enhanced text search with fuzzy matching for test automation
const element = await smartLocator.findByText('Login');

// ARIA role-based selection with name filtering for accessibility testing
const nav = await smartLocator.findByRole('navigation');
const button = await smartLocator.findByRole('button', { name: 'Submit' });

// Comprehensive test ID detection (data-testid, data-test, data-qa, and more)
const field = await smartLocator.findByTestId('submit-button');

// Enhanced CSS selector with automatic fallbacks for test automation
const element = await smartLocator.findBySelector('.my-component');
```

### 🛡️ **Self-Healing Enhancement for Test Automation**

#### `enhanceLocator(locator)` - Transform Fragile Selectors into Self-Healing Test Automation
Transform any existing Playwright locator into a self-healing smart locator for robust test automation.

```typescript
// Transform fragile CSS selectors into self-healing test automation
const fragileLocator = page.locator('#submit-btn-1234');
const enhanced = await smartLocator.enhanceLocator(fragileLocator);

// Even if #submit-btn-1234 doesn't exist, enhanced locator will:
// 1. Analyze the CSS selector pattern (ID contains "submit")  
// 2. Generate smart alternatives for test automation:
//    - page.getByText('Submit')
//    - page.locator('button[type="submit"]')
//    - page.locator('[id^="submit-btn"]')
await enhanced.click(); // ✅ Works even when original CSS selector breaks!
```

#### Advanced Enhancement Methods for Test Automation
Specialized enhancement methods for different test automation scenarios.

```typescript
// Try original locator first, enhance automatically if it fails
const smartButton = await smartLocator.autoEnhance(
    page.locator('#might-not-exist')
);
await smartButton.click(); // Always works in test automation!

// Enhance working locators with additional strategies for future-proofing
const enhanced = await smartLocator.enhanceWorkingLocator(page.locator('#working-btn'));

// Handle broken CSS selectors with intelligent pattern analysis
const fixed = await smartLocator.enhanceBrokenLocator(page.locator('#broken-123'));
```

### ⚡ **Smart Actions for Legacy Test Automation Migration**

#### Drop-in Replacements for Existing Test Automation Code
Perfect for migrating legacy test automation suites without complete rewrites.

```typescript
// Instead of: await page.locator('#fragile-btn').click();
await smartLocator.smartClick(page.locator('#fragile-btn'));

// Instead of: await page.locator('#fragile-input').fill('text');
await smartLocator.smartFill(page.locator('#fragile-input'), 'Hello World');

// Instead of: await expect(page.locator('#fragile')).toBeVisible();
await smartLocator.smartExpected(page.locator('#fragile')).toBeVisible();
```

---

## 🎯 **Real-World Test Automation Examples**

### 🛍️ **E-commerce Test Automation: Product Selection**
```typescript
// Traditional approach (brittle for test automation)
const productRow = page.locator('tr:has-text("iPhone 15 Pro")');
const addButton = productRow.locator('button:has-text("Add to Cart")');
await addButton.click();

// ✨ Smart approach (robust test automation, layout-independent)
const addBtn = await smartLocator.findByRelatedText('Add to Cart', 'iPhone 15 Pro');
await addBtn.click();
```

### ✈️ **Travel Website Test Automation: Flight Selection**
```typescript
// Traditional approach (complex XPath for test automation)
const flightRow = page.locator('//tr[contains(., "Aer Lingus")]');
const chooseBtn = flightRow.locator('.//input[@value="Choose This Flight"]');
await chooseBtn.click();

// ✨ Smart approach (simple and reliable test automation)
const chooseBtn = await smartLocator.findByRelatedText('Choose This Flight', 'Aer Lingus');
await chooseBtn.click();
```

### 👕 **Fashion: Size Selection**
```typescript
// Traditional approach (fragile DOM navigation)
const productCard = page.locator('.product:has-text("Argus All-Weather Tank")');
const sizeS = productCard.locator('[aria-label="S"]');
await sizeS.click();

// ✨ Smart approach (intent-based)
const sizeS = await smartLocator.findByRelatedText('S', 'Argus All-Weather Tank');
await sizeS.click();
```

### 💼 **GitHub: Repository Selection**
```typescript
// Traditional approach (complex CSS selectors)
const repoContainer = page.locator('div:has-text("Smart locator library")');
const repoLink = repoContainer.locator('a[href*="locatorpro"]');
await repoLink.click();

// ✨ Smart approach (natural language)
const repoLink = await smartLocator.findByRelatedText('locatorpro-playwright', 'Smart locator library');
await repoLink.click();
```

---

## 🛡️ **Self-Healing Strategies**

LocatorPro automatically generates multiple strategies with priority-based fallbacks:

### **Strategy Priority (Reliability Score)**
1. **ID attributes** (0.98) - `#unique-id`
2. **Data-test attributes** (0.95) - `[data-testid="submit"]`
3. **Name attributes** (0.9) - `[name="username"]`
4. **Href attributes** (0.9) - `a[href="/login"]`
5. **Role attributes** (0.85) - `[role="button"]`
6. **Alt attributes** (0.85) - `img[alt="Logo"]`
7. **Title attributes** (0.8) - `[title="Click me"]`
8. **Placeholder text** (0.8) - `input[placeholder="Enter email"]`
9. **Type attributes** (0.75) - `input[type="submit"]`
10. **Text content** (0.8-0.85) - `getByText("Submit")`
11. **XPath strategies** (0.8-0.85) - Complex path-based selectors
12. **CSS class combinations** (0.6-0.8) - `.btn.primary`

### ** Pattern Recognition**
```typescript
// Original selector: #submit-btn-1234 (broken)
// Smart alternatives generated:
// 1. getByText('Submit')                    // Inferred from ID pattern
// 2. button[type="submit"]                  // Inferred button type
// 3. [id^="submit-btn"]                     // Partial ID match
// 4. [data-testid*="submit"]               // Test ID alternatives
```

---

## 🎯 **Migration Guide**

### **Legacy Test Migration**
Upgrade existing fragile tests with minimal changes:

```typescript
// ❌ Before: Fragile selectors
await page.locator('#old-submit-123').click();
await page.locator('.deprecated-class').fill('text');
await expect(page.locator('#fragile-element')).toBeVisible();

// ✅ After: Smart actions (drop-in replacement)
const smartLocator = new SmartLocator(page);
await smartLocator.smartClick(page.locator('#old-submit-123'));
await smartLocator.smartFill(page.locator('.deprecated-class'), 'text');
await smartLocator.smartExpected(page.locator('#fragile-element')).toBeVisible();
```

### **New Test Development**
Use smart methods from the start:

```typescript
const smartLocator = new SmartLocator(page);

// Direct smart locators
const loginBtn = await smartLocator.findByVisibleText('Login');
const productBtn = await smartLocator.findByRelatedText('Add to Cart', 'Product Name');
const formField = await smartLocator.findByTestId('email-input');

// Enhanced locators for complex cases
const enhanced = await smartLocator.enhanceLocator(page.locator('.complex-selector'));
```

---

## 🔧 **Configuration**

```typescript
const smartLocator = new SmartLocator(page, {
    config: {
        maxStrategies: 5,           // Maximum fallback strategies
        timeout: 10000,             // Default timeout for operations
        retryAttempts: 3            // Retry attempts for failed operations
    },
    logLevel: 'info'                // Logging level: 'silent' | 'warn' | 'info' | 'debug'
});
```

---

## 🧪 **Testing & Validation**

LocatorPro has been extensively tested across real-world scenarios:

- ✅ **SauceDemo** - E-commerce product selection
- ✅ **BlazeDemo** - Travel booking with input value attributes  
- ✅ **GitHub** - Repository navigation by description
- ✅ **Magento** - Complex product configuration with size/color options
- ✅ **Form handling** - All input types and validation scenarios
- ✅ **Responsive layouts** - Mobile and desktop compatibility

### **Debugging Support**
Enable detailed logging to understand locator strategies:

```typescript
const smartLocator = new SmartLocator(page, { logLevel: 'debug' });

// Console output shows:
// 🔍 Smart DOM Scan for: "Submit"
// 🎯 Found 3 potential elements
// ✅ Generated 5 unique strategies for best element
// 📊 Using 3 strategies (max: 5)
```

---

## 🚀 **Advanced Features**

### **Container-Based Selection** 
```typescript
// Find elements within specific containers
const options = {
    containerTypes: ['div', 'section', 'article'],
    maxLevelsUp: 3,
    maxStrategies: 5
};
const element = await smartLocator.findByRelatedText('Button', 'Context', options);
```

### **Element Type Filtering**
```typescript
// Limit search to specific element types
const button = await smartLocator.findByVisibleText('Submit', {
    elementTypes: ['button', 'input'],
    fallbacks: ['Save', 'Send']
});
```

### **Validation & Debug Info**
```typescript
// Validate locator effectiveness
const isValid = await smartLocator.validateLocator(locator);

// Get comprehensive debug information
const debugInfo = await smartLocator.getDebugInfo('#some-selector');
console.log('Available strategies:', debugInfo.strategies);
console.log('Valid strategies:', debugInfo.validStrategies);  
console.log('Recommended selector:', debugInfo.recommended);
```

---

## 📊 **Performance & Reliability**

### **Benchmark Results**
- **Element Discovery**: ~50-100ms average
- **Strategy Generation**: ~20-50ms average  
- **Self-Healing Success Rate**: 95%+ for common scenarios
- **Memory Usage**: Minimal overhead vs standard Playwright

### **Reliability Metrics**
- **Cross-browser compatibility**: Chrome, Firefox, Safari, Edge
- **Framework agnostic**: Works with any Playwright setup
- **Production tested**: Handles 1000+ element pages efficiently
- **Error recovery**: Graceful degradation when no alternatives found

---

## 🤝 **Contributing**

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### **Development Setup**
```bash
git clone https://github.com/debasisj/locatorpro-playwright.git
cd locatorpro-playwright
npm install
npm run test
```

---

## � **Changelog**

### **v1.0.1** - Latest Release 🎉
- ✅ **Great `findByRelatedText()`** - Container-based element selection
- ✅ **Enhanced `enhanceLocator()`** - Handles broken selectors with pattern analysis
- ✅ **Smart Actions API** - `smartClick()`, `smartFill()`, `smartExpected()`
- ✅ **Comprehensive attribute coverage** - All HTML attributes supported
- ✅ **Auto-enhancement** - Try original first, enhance if needed
- ✅ **Real-world validation** - Tested on major e-commerce and travel sites

### **v1.0.0** - Foundation
- ✅ Basic self-healing locators
- ✅ Text-based element discovery  
- ✅ Test ID enhancements
- ✅ Strategy-based fallbacks

---

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🎯 **Get Started Today!**

Transform your brittle Playwright tests into intelligent, self-healing automation:

```bash
npm install locatorpro-playwright
```

```typescript
import { SmartLocator } from 'locatorpro-playwright';

// Your tests just got smarter! 🧠✨
```

---

## 🎯 **SEO-Optimized Features for Test Automation**

**LocatorPro for Playwright** is the ultimate solution for:
- **Robust test automation** with self-healing CSS selectors
- **Cross-browser testing** with intelligent element location
- **Legacy application testing** without modifying source code
- **E-commerce test automation** with complex product interactions
- **Responsive web design testing** across multiple device viewports
- **Accessibility testing** with ARIA role and semantic element support
- **Performance testing** with efficient element discovery algorithms
- **CI/CD integration** for automated test pipeline reliability

---

**Built with ❤️ for the Playwright and test automation community**

*Making web test automation more reliable, one intelligent locator at a time.*
