import { test, expect } from '@playwright/test';
import { SmartLocator } from '../src/smart-locator';

test.describe('Special Characters Handling', () => {
    let smartLocator: SmartLocator;

    test.beforeEach(async ({ page }) => {
        smartLocator = new SmartLocator(page);
        // Use a simple data URL instead of localhost
        await page.goto('data:text/html,<html><body><h1>Test Page</h1></body></html>');
    });

    test('should handle text with apostrophes', async ({ page }) => {
        // Add a button with text containing apostrophe to the test page
        await page.evaluate(() => {
            const button = document.createElement('button');
            button.textContent = "Before you can use online banking, you'll need to set yourself up in the app";
            button.id = 'apostrophe-test-btn';
            document.body.appendChild(button);
        });

        // This should not fail due to unescaped apostrophes
        const button = await smartLocator.findByVisibleText("Before you can use online banking, you'll need to set yourself up in the app");
        await expect(button).toBeVisible();
        await button.click();
    });

    test('should handle text with double quotes', async ({ page }) => {
        // Add a button with text containing double quotes
        await page.evaluate(() => {
            const button = document.createElement('button');
            button.textContent = 'Click to "submit" your form';
            button.id = 'quotes-test-btn';
            document.body.appendChild(button);
        });

        const button = await smartLocator.findByVisibleText('Click to "submit" your form');
        await expect(button).toBeVisible();
        await button.click();
    });

    test('should handle text with both single and double quotes', async ({ page }) => {
        // Add a button with text containing both types of quotes
        await page.evaluate(() => {
            const button = document.createElement('button');
            button.textContent = `He said "Don't worry, you'll be fine"`;
            button.id = 'mixed-quotes-test-btn';
            document.body.appendChild(button);
        });

        const button = await smartLocator.findByVisibleText(`He said "Don't worry, you'll be fine"`);
        await expect(button).toBeVisible();
        await button.click();
    });

    test('should handle text with backslashes', async ({ page }) => {
        // Add a button with text containing backslashes
        await page.evaluate(() => {
            const button = document.createElement('button');
            button.textContent = 'File path: C:\\\\Users\\\\test\\\\file.txt';
            button.id = 'backslash-test-btn';
            document.body.appendChild(button);
        });

        const button = await smartLocator.findByVisibleText('File path: C:\\\\Users\\\\test\\\\file.txt');
        await expect(button).toBeVisible();
        await button.click();
    });

    test('should handle related text with special characters', async ({ page }) => {
        // Add a product with special characters
        await page.evaluate(() => {
            const container = document.createElement('div');
            container.innerHTML = `
                <div class="product-card">
                    <h3>Special Product: "John's Best" - 100% Organic</h3>
                    <button id="special-add-btn">Add to Cart</button>
                </div>
            `;
            document.body.appendChild(container);
        });

        // This should work with the findByRelatedText method
        const addButton = await smartLocator.findByRelatedText(
            'Add to Cart', 
            'Special Product: "John\'s Best" - 100% Organic'
        );
        await expect(addButton).toBeVisible();
        await addButton.click();
    });
});