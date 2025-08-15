# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-15

### Added
- Initial release of @locatorpro/playwright
- 35-priority intelligent locator generation system
- Self-healing locator capabilities for Playwright
- SmartLocator class with comprehensive API
- Support for text, role, testId, and CSS selector-based finding
- Automatic fallback strategies for element location
- Full TypeScript support with type definitions
- Comprehensive configuration options
- Debug information and strategy validation
- Page Object Model integration examples
- Complete documentation and usage examples

### Features
- **Test-Specific Attributes**: Prioritizes data-testid, data-test, data-qa
- **Semantic Attributes**: ARIA labels, element IDs, name attributes  
- **Role-Based Strategies**: Explicit and implicit ARIA roles
- **Text-Based Strategies**: Exact and partial text matching
- **Structure-Based Strategies**: CSS classes, tag names, paths
- **Attribute Combinations**: Custom attributes and value combinations
- **Fallback Strategies**: XPath selectors and position-based (optional)

### Configuration
- Configurable maximum strategies limit
- Optional XPath and CSS path generation
- Custom attribute support
- Test attribute prioritization
- Position-based fallback (disabled by default)
- Adjustable logging levels

### API
- `findByText()` - Find elements by text content
- `findByTestId()` - Find elements by test attributes
- `findByRole()` - Find elements by ARIA role
- `findBySelector()` - Enhance CSS selectors with self-healing
- `enhanceLocator()` - Add self-healing to existing locators
- `validateLocator()` - Check locator validity
- `getDebugInfo()` - Get strategy generation details

### Performance
- Lazy strategy evaluation
- Configurable strategy limits
- Efficient DOM querying
- Minimal runtime overhead

### Browser Support
- Works with all Playwright-supported browsers
- Chrome, Firefox, Safari, Edge
- Mobile browser support via Playwright

### Dependencies
- Requires @playwright/test as peer dependency
- Zero additional runtime dependencies
- Full TypeScript support

## [Unreleased]

### Planned Features
- Enhanced self-healing with automatic strategy re-ranking
- Visual locator integration
- AI-powered strategy generation
- Multi-framework support (Cypress, Selenium)
- Performance analytics and reporting
- Strategy learning algorithms
