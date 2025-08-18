# Contributing to LocatorPro for Playwright

Thank you for your interest in contributing to LocatorPro! We welcome contributions from the community and are excited to see what you'll bring to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/locatorpro-playwright.git
   cd locatorpro-playwright
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the local test server**
   ```bash
   npm start
   # Server runs on http://localhost:3000
   ```

4. **Run tests to ensure everything works**
   ```bash
   npm test
   npm run test:headed  # Run with browser UI
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

## 🧪 Testing

### Running Tests
- `npm test` - Run all Playwright tests
- `npm run test:headed` - Run tests with browser visible
- `npm run test:ui` - Interactive test runner
- `npm run build` - TypeScript compilation

### Test Structure
- `tests/core-functionality.spec.ts` - Core SmartLocator methods
- `tests/related-text.spec.ts` - Revolutionary findByRelatedText features
- `tests/self-healing.spec.ts` - Self-healing and pattern analysis
- `test-site/` - Local test site with comprehensive scenarios

### Writing Tests
When adding new features, please include tests that cover:
- Happy path scenarios
- Edge cases and error conditions
- Cross-browser compatibility
- Performance considerations

## 📝 Code Style

### TypeScript Guidelines
- Use strict TypeScript with proper type definitions
- Follow existing code patterns and naming conventions
- Add JSDoc comments for public methods
- Use meaningful variable and function names

### Formatting
We use standard TypeScript formatting. The project will auto-format on build.

## 🎯 Types of Contributions

### 🐛 Bug Reports
Please use the GitHub issue template and include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and environment details
- Minimal code example

### ✨ Feature Requests
For new features, please:
- Check existing issues first
- Describe the use case and benefit
- Provide examples of how it would work
- Consider backward compatibility

### 🔧 Code Contributions

#### Pull Request Process
1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add/update tests as needed
   - Update documentation if necessary

3. **Test your changes**
   ```bash
   npm test
   npm run build
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add smart pattern recognition for form inputs"
   # or
   git commit -m "fix: handle timeout errors in generateStrategies"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

#### Commit Message Format
We follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `chore:` - Maintenance tasks

## 🎯 Priority Areas for Contribution

### High Priority
- **New locator strategies** - Additional ways to find elements
- **Performance optimizations** - Faster strategy generation
- **Cross-browser testing** - Ensure compatibility
- **Documentation improvements** - Examples and guides

### Medium Priority
- **Framework integrations** - Jest, Cucumber, etc.
- **Visual regression detection** - Image-based locators
- **Machine learning patterns** - Smarter pattern recognition
- **Accessibility improvements** - Better ARIA support

### Good First Issues
- **Bug fixes** - Small, well-defined issues
- **Documentation updates** - README improvements
- **Test coverage** - Additional test scenarios
- **Code examples** - Real-world usage examples

## 📚 Development Guidelines

### Architecture Overview
```
src/
├── index.ts              # Main exports
├── smart-locator.ts      # Core SmartLocator class
├── locator-engine.ts     # Strategy generation engine
└── types.ts             # TypeScript type definitions
```

### Key Components
- **SmartLocator** - Main class with public API
- **LocatorEngine** - Strategy generation and DOM analysis
- **Strategy System** - Prioritized fallback mechanisms
- **Pattern Analysis** - Broken selector intelligence

### Adding New Features
1. **Update types** in `src/types.ts`
2. **Implement logic** in appropriate files
3. **Add public methods** to `SmartLocator` class
4. **Write comprehensive tests**
5. **Update documentation**

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers get started
- Maintain professional communication

### Getting Help
- **GitHub Discussions** - General questions and ideas
- **GitHub Issues** - Bug reports and feature requests
- **Discord/Slack** - Real-time community chat (if available)

## 📋 Review Process

### What We Look For
- **Code quality** - Clean, readable, maintainable code
- **Test coverage** - Comprehensive test scenarios
- **Documentation** - Clear explanations and examples
- **Backward compatibility** - Don't break existing functionality
- **Performance** - Consider impact on execution speed

### Review Timeline
- Initial response: 2-3 business days
- Code review: 3-5 business days
- Final approval: 1-2 business days

## 🎉 Recognition

Contributors will be:
- Added to the contributors list
- Mentioned in release notes
- Invited to become maintainers (for significant contributions)

## 📞 Questions?

Feel free to reach out:
- **GitHub Issues** - For bug reports and feature requests
- **GitHub Discussions** - For general questions
- **Email** - [maintainer email if available]

---

Thank you for contributing to LocatorPro! Together, we're making Playwright automation more reliable and accessible for everyone. 🚀

## 📄 License

By contributing to LocatorPro, you agree that your contributions will be licensed under the MIT License.
