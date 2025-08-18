import { test, expect } from '@playwright/test';
import { SmartLocator } from '../src/smart-locator';

test.describe('findByRelatedText - Revolutionary Feature', () => {
    let smartLocator: SmartLocator;

    test.beforeEach(async ({ page }) => {
        smartLocator = new SmartLocator(page);
        await page.goto('/');
    });

    test('should find Add to Cart by product name', async ({ page }) => {
        // Find "Add to cart" button for iPhone 15 Pro
        const addToCartBtn = await smartLocator.findByRelatedText(
            'Add to Cart',
            'iPhone 15 Pro'
        );

        await expect(addToCartBtn.first()).toBeVisible();
        await addToCartBtn.first().click();

        // Verify cart badge appears
        const cartBadge = page.locator('.cart-badge');
        await expect(cartBadge).toBeVisible();
        await expect(cartBadge).toContainText('1');
    });

    test('should handle multiple products with same action', async ({ page }) => {
        // Test with different products
        const samsungBtn = await smartLocator.findByRelatedText(
            'Add to Cart',
            'Samsung Galaxy S24'
        );
        await expect(samsungBtn.first()).toBeVisible();

        const tankBtn = await smartLocator.findByRelatedText(
            'Add to Cart',
            'Argus All-Weather Tank'
        );
        await expect(tankBtn.first()).toBeVisible();

        const shoesBtn = await smartLocator.findByRelatedText(
            'Add to Cart',
            'Nike Air Max'
        );
        await expect(shoesBtn.first()).toBeVisible();
    });

    test('should find size selection by product context', async ({ page }) => {
        // Find size S for the tank product
        const sizeS = await smartLocator.findByRelatedText('S', 'Argus All-Weather Tank');
        await expect(sizeS.first()).toBeVisible();
        await sizeS.first().click();

        // Find size 9 for the shoes
        const size9 = await smartLocator.findByRelatedText('9', 'Nike Air Max');
        await expect(size9.first()).toBeVisible();
        await size9.first().click();

        // Find 256GB for iPhone
        const storage256 = await smartLocator.findByRelatedText('256GB', 'iPhone 15 Pro');
        await expect(storage256.first()).toBeVisible();
        await storage256.first().click();
    });

    test('should handle flight selection', async ({ page }) => {
        // Navigate to flights section
        await page.locator('#search-flights').click();

        // Find "Choose This Flight" for Virgin America
        const chooseVirgin = await smartLocator.findByRelatedText(
            'Choose This Flight',
            'Virgin America'
        );
        await expect(chooseVirgin.first()).toBeVisible();

        // Find "Choose This Flight" for Aer Lingus
        const chooseAer = await smartLocator.findByRelatedText(
            'Choose This Flight',
            'Aer Lingus'
        );
        await expect(chooseAer.first()).toBeVisible();

        // Find "Choose This Flight" for British Airways
        const chooseBA = await smartLocator.findByRelatedText(
            'Choose This Flight',
            'British Airways'
        );
        await expect(chooseBA.first()).toBeVisible();
    });

    test('should work with repository selection', async ({ page }) => {
        // Find repository by description
        const locatorProRepo = await smartLocator.findByRelatedText(
            'locatorpro-playwright',
            'Smart locator library'
        );
        await expect(locatorProRepo.first()).toBeVisible();

        const automationRepo = await smartLocator.findByRelatedText(
            'automation-framework',
            'Comprehensive test automation framework'
        );
        await expect(automationRepo.first()).toBeVisible();

        const seleniumRepo = await smartLocator.findByRelatedText(
            'selenium-helpers',
            'Utility library for Selenium WebDriver'
        );
        await expect(seleniumRepo.first()).toBeVisible();
    });

    test('should handle price-based context', async ({ page }) => {
        // Find product by price context - these are in same container
        const iphoneByPrice = await smartLocator.findByRelatedText(
            'iPhone 15 Pro',
            '$999.99'
        );
        await expect(iphoneByPrice.first()).toBeVisible();
        await expect(iphoneByPrice.first()).toContainText('iPhone 15 Pro');

        const tankByPrice = await smartLocator.findByRelatedText(
            'Argus All-Weather Tank',
            '$29.99'
        );
        await expect(tankByPrice.first()).toBeVisible();
        await expect(tankByPrice.first()).toContainText('Argus All-Weather Tank');

        const shoesByPrice = await smartLocator.findByRelatedText(
            'Nike Air Max',
            '$149.99'
        );
        await expect(shoesByPrice.first()).toBeVisible();
        await expect(shoesByPrice.first()).toContainText('Nike Air Max');
    });
});
