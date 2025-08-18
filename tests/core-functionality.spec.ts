import { test, expect } from '@playwright/test';
import { SmartLocator } from '../src/smart-locator';

test.describe('LocatorPro Core Functionality', () => {
    let smartLocator: SmartLocator;

    test.beforeEach(async ({ page }) => {
        smartLocator = new SmartLocator(page);
        await page.goto('/');
    });

    test('findByVisibleText - should find login button', async ({ page }) => {
        const loginButton = await smartLocator.findByVisibleText('Login');
        await expect(loginButton.first()).toBeVisible();
    });

    test('findByTestId - should find username field', async ({ page }) => {
        const usernameField = await smartLocator.findByTestId('username');
        await expect(usernameField).toBeVisible();
        await usernameField.fill('testuser');
    });

    test('enhanceLocator - should enhance working locator', async ({ page }) => {
        const originalLocator = page.locator('#username');
        const enhanced = await smartLocator.enhanceLocator(originalLocator);
        await expect(enhanced).toBeVisible();
        await enhanced.fill('testuser');
    });

    test('smartClick - should work with fragile selectors', async ({ page }) => {
        // Fill credentials first
        await smartLocator.smartFill(page.locator('#username'), 'testuser');
        await smartLocator.smartFill(page.locator('#password'), 'testpass');

        // Listen for the alert dialog
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Login successful');
            await dialog.accept();
        });

        // Smart click on login - use more specific locator to avoid strict mode
        await smartLocator.smartClick(page.locator('#login-btn'));

        // Should show updated heading
        await expect(page.locator('h1')).toContainText('Welcome, testuser!');
    });

    test('autoEnhance - should try original first, then enhance', async ({ page }) => {
        const enhanced = await smartLocator.autoEnhance(page.locator('#username'));
        await enhanced.fill('testuser');
        await expect(enhanced).toHaveValue('testuser');
    });

    test('findByRole - should find elements by ARIA role', async ({ page }) => {
        const navigation = await smartLocator.findByRole('navigation');
        await expect(navigation).toBeVisible();

        // Look for input elements instead of textbox role
        const inputs = await smartLocator.findBySelector('input[type="text"], input[type="email"], input[type="password"]');
        await expect(inputs.first()).toBeVisible();
    });

    test('comprehensive attribute coverage', async ({ page }) => {
        // Test various attribute types
        const usernameByName = await smartLocator.findBySelector('[name="user-name"]');
        await expect(usernameByName).toBeVisible();

        const emailByType = await smartLocator.findBySelector('input[type="email"]');
        await expect(emailByType.first()).toBeVisible();

        const submitByType = await smartLocator.findBySelector('input[type="submit"], button[type="submit"]');
        await expect(submitByType.first()).toBeVisible();
    });
});
