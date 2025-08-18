# LocatorPro Test Site

This is a comprehensive test website designed specifically for testing LocatorPro's smart locator functionality. It provides controlled test scenarios without external dependencies.

## Features Covered

### 🔐 **Login Forms**
- Multiple input types (text, password, email)
- Various attribute patterns (id, name, data-testid, data-qa, placeholder, aria-label)
- Form validation testing

### 🛒 **E-commerce Product Selection**  
- Product cards with names, prices, and images
- Size/storage selectors with aria-labels
- Add to cart functionality with cart badge updates
- Multiple products for testing `findByRelatedText()`

### ✈️ **Flight Booking Interface**
- Dropdown selectors for departure/destination
- Flight results with airline names and details  
- "Choose This Flight" buttons for different airlines
- Price and time information

### 📦 **GitHub-style Repository Listing**
- Repository cards with names, descriptions, and stats
- Link elements for testing repository selection
- Multiple repos for context-based selection

### 🔄 **Dynamic Content Testing**
- Content that loads after page initialization
- DOM manipulation to simulate broken selectors
- ID changes to test self-healing capabilities
- Late-loading elements (2-second delay)

### 🎯 **Broken Selector Simulation**
- Elements with IDs that can be changed dynamically
- Fallback elements with reliable attributes
- Pattern testing for smart enhancement

## Running the Test Site

```bash
# Start the local server
npm run start

# The site will be available at http://localhost:3000
```

## Test Scenarios

### Basic Element Discovery
```typescript
// Find login button
const loginBtn = await smartLocator.findByVisibleText('Login');

// Find username field by test ID
const username = await smartLocator.findByTestId('username');
```

### Revolutionary Related Text Selection
```typescript
// Find "Add to Cart" for specific product
const iphoneCart = await smartLocator.findByRelatedText('Add to Cart', 'iPhone 15 Pro');

// Find size by product context
const sizeS = await smartLocator.findByRelatedText('S', 'Argus All-Weather Tank');

// Find flight selection by airline
const flight = await smartLocator.findByRelatedText('Choose This Flight', 'Virgin America');
```

### Self-Healing Testing
```typescript
// Test with elements that have changing IDs
await page.click('#break-selectors'); // Simulates DOM changes
const enhanced = await smartLocator.enhanceLocator(page.locator('#submit-btn-1234'));
```

### Comprehensive Attribute Coverage
```typescript
// Test various HTML attributes
const byName = await smartLocator.findBySelector('[name="user-name"]');
const byType = await smartLocator.findBySelector('input[type="email"]');
const byDataQA = await smartLocator.findBySelector('[data-qa="email-field"]');
```

## Test Categories

1. **Core Functionality** (`core-functionality.spec.ts`)
   - Basic finder methods
   - Smart actions (click, fill, expected)
   - Enhancement capabilities

2. **Related Text Selection** (`related-text.spec.ts`)
   - Product-based selection
   - Flight booking scenarios
   - Repository selection
   - Price-based context

3. **Self-Healing** (`self-healing.spec.ts`)
   - Broken selector handling
   - Pattern analysis
   - Dynamic content
   - Late-loading elements

## Interactive Features

- **Cart Counter**: Updates when products are added
- **Size Selection**: Visual feedback when sizes are selected  
- **Flight Search**: Shows/hides flight results
- **DOM Manipulation**: Buttons to break selectors for testing
- **Dynamic Loading**: Elements that appear after delays

This test site eliminates external dependencies and provides complete control over test scenarios, making it perfect for regression testing and feature development.
