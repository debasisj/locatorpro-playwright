import { test, expect } from '@playwright/test';
import { SmartLocator } from '../src/smart-locator';

test.describe('Self-Healing Enhancement', () => {
    let smartLocator: SmartLocator;

    test.beforeEach(async ({ page }) => {
        smartLocator = new SmartLocator(page);
        await page.goto('/');
    });

    test('should handle broken selectors with pattern analysis', async ({ page }) => {
        // Test with a broken ID that doesn't exist
        const brokenLocator = page.locator('#non-existent-submit-123');

        // Test the pattern analysis function directly
        const debugInfo = await smartLocator.getDebugInfo('#non-existent-submit-123');

        // Should have generated some fallback strategies
        expect(debugInfo.strategies).toBeDefined();
        expect(debugInfo.strategies.length).toBeGreaterThan(0);

        // Should have inferred submit-related strategies from the ID pattern
        const selectors = debugInfo.strategies.map(s => s.selector);
        expect(selectors.some(s => s.includes('submit'))).toBe(true);
    });

    test('should generate multiple strategies with reliability scores', async ({ page }) => {
        const debugInfo = await smartLocator.getDebugInfo('#username');

        expect(debugInfo.strategies).toBeDefined();
        expect(debugInfo.strategies.length).toBeGreaterThan(0);

        // Should have strategies with different types
        const strategyTypes = debugInfo.strategies.map(s => s.type);
        expect(strategyTypes).toContain('id');
    });

    test('should validate locator effectiveness', async ({ page }) => {
        const workingLocator = page.locator('#username');
        const isValid = await smartLocator.validateLocator(workingLocator);
        expect(isValid).toBe(true);

        const brokenLocator = page.locator('#does-not-exist');
        const isValidBroken = await smartLocator.validateLocator(brokenLocator);
        expect(isValidBroken).toBe(false);
    });

    test('should handle comprehensive HTML attributes', async ({ page }) => {
        // Test various attribute types
        const usernameByName = await smartLocator.findBySelector('[name="user-name"]');
        await expect(usernameByName).toBeVisible();

        const passwordByType = await smartLocator.findBySelector('input[type="password"]');
        await expect(passwordByType).toBeVisible();

        const submitByType = await smartLocator.findBySelector('input[type="submit"], button[type="submit"]');
        await expect(submitByType.first()).toBeVisible();
    });

    test('should work with role-based selection', async ({ page }) => {
        // Look for input elements instead of textbox role
        const inputs = await smartLocator.findBySelector('input[type="text"], input[type="email"], input[type="password"]');
        await expect(inputs.first()).toBeVisible();

        const button = await smartLocator.findByRole('button');
        await expect(button.first()).toBeVisible();
    });

    test('should handle dynamic content and DOM changes', async ({ page }) => {
        // Test that after changing element IDs, the system can still find elements
        // Click button that changes IDs (this button exists in our test site)
        await page.click('#break-selectors');

        // Now try to find the login button which should still work even if some IDs changed
        const loginButton = await smartLocator.findByVisibleText('Login');
        await expect(loginButton.first()).toBeVisible();
    });

    test('should handle late-loading elements', async ({ page }) => {
        // Wait for late-loading button (loads after 2 seconds)
        const lateButton = await smartLocator.findByTestId('late-loaded');
        await expect(lateButton).toBeVisible();
        await expect(lateButton).toContainText('Late Loading Button');
    });

    test('should work with data attributes variations', async ({ page }) => {
        // Test different data attribute patterns
        const usernameTestId = await smartLocator.findByTestId('username');
        await expect(usernameTestId).toBeVisible();

        const emailQA = await smartLocator.findBySelector('[data-qa="email-field"]');
        await expect(emailQA).toBeVisible();

        const automationBtn = await smartLocator.findBySelector('[data-automation="secondary-btn"]');
        await expect(automationBtn.first()).toBeVisible();
    });
});
