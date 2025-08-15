/**
 * Example usage of LocatorPro with Playwright
 */

import { test, expect, Page } from '@playwright/test';
import { SmartLocator } from '../src';

// Helper function to create SmartLocator instance
function createSmartLocator(page: Page) {
    return new SmartLocator(page, {
        logLevel: 'info',
        config: {
            maxStrategies: 10,
            includeXPath: true,
            includeCssPath: true,
            prioritizeTestAttributes: true,
            customAttributes: ['data-qa', 'data-test']
        }
    });
}

test.describe('LocatorPro Examples', () => {
    test('should find elements by text with self-healing', async ({ page }) => {
        // Navigate to a test page
        await page.goto('https://playwright.dev');

        const smartLocator = createSmartLocator(page);

        // Find elements using self-healing locators
        const getStartedButton = await smartLocator.findByText('Get started');
        await expect(getStartedButton).toBeVisible();

        // The locator will automatically try multiple strategies:
        // 1. Exact text match
        // 2. Playwright text selector
        // 3. XPath text match
        // 4. Partial text match
    });

    test('should find elements by test ID with fallbacks', async ({ page }) => {
        await page.goto('https://playwright.dev');

        const smartLocator = createSmartLocator(page);

        // This will generate multiple strategies including:
        // - data-testid
        // - id-based selectors
        // - class-based selectors
        // - text content fallbacks
        try {
            const element = await smartLocator.findByTestId('nonexistent-test-id');
            await expect(element).toBeVisible();
        } catch (error) {
            console.log('Expected: Element not found, but fallback strategies were attempted');
        }
    });

    test('should enhance existing locators', async ({ page }) => {
        await page.goto('https://playwright.dev');

        const smartLocator = createSmartLocator(page);

        // Start with a basic locator
        const basicLocator = page.locator('nav');

        // Enhance it with self-healing capabilities
        const enhancedLocator = await smartLocator.enhanceLocator(basicLocator);
        await expect(enhancedLocator).toBeVisible();
    });

    test('should provide debug information', async ({ page }) => {
        await page.goto('https://playwright.dev');

        const smartLocator = createSmartLocator(page);

        // Get debug info for a selector
        const debugInfo = await smartLocator.getDebugInfo('nav');

        console.log('Generated strategies:', debugInfo.strategies.length);
        console.log('Valid strategies:', debugInfo.validStrategies.length);
        console.log('Recommended selector:', debugInfo.recommended);

        expect(debugInfo.strategies.length).toBeGreaterThan(0);
    });

    test('should find elements by role', async ({ page }) => {
        await page.goto('https://playwright.dev');

        const smartLocator = createSmartLocator(page);

        // Find navigation element
        const navigation = await smartLocator.findByRole('navigation');
        await expect(navigation).toBeVisible();
    });

    test('should validate locators', async ({ page }) => {
        await page.goto('https://playwright.dev');

        const smartLocator = createSmartLocator(page);

        // Test valid locator
        const validLocator = page.locator('nav');
        const isValid = await smartLocator.validateLocator(validLocator);
        expect(isValid).toBe(true);

        // Test invalid locator
        const invalidLocator = page.locator('#nonexistent-element');
        const isInvalid = await smartLocator.validateLocator(invalidLocator);
        expect(isInvalid).toBe(false);
    });
});

// Example of using SmartLocator in a Page Object Model
class LoginPage {
    private smartLocator: SmartLocator;

    constructor(private page: Page) {
        this.smartLocator = createSmartLocator(page);
    }

    async login(username: string, password: string) {
        // Self-healing locators that adapt to UI changes
        const usernameField = await this.smartLocator.findByTestId('username');
        const passwordField = await this.smartLocator.findByTestId('password');
        const loginButton = await this.smartLocator.findByText('Login');

        await usernameField.fill(username);
        await passwordField.fill(password);
        await loginButton.click();
    }

    async getErrorMessage() {
        // Multiple strategies for finding error messages
        return await this.smartLocator.findBySelector('.error-message');
    }
}

export { LoginPage };
