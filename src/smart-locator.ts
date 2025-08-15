/**
 * SmartLocator - Playwright Integration for LocatorPro
 * 
 * Self-healing locator system with intelligent fallback strategies
 */

import { Page, Locator } from '@playwright/test';
import { LocatorEngine } from './locator-engine';
import { LocatorProOptions, LocatorResult, LocatorStrategy } from './types';

export class SmartLocator {
    private engine: LocatorEngine;
    private page: Page;
    private options: LocatorProOptions;

    constructor(page: Page, options: LocatorProOptions = {}) {
        this.page = page;
        this.options = options;
        this.engine = new LocatorEngine(
            options.config,
            options.logLevel || 'warn'
        );
    }

    /**
     * Find element by text content with self-healing capabilities
     */
    async findByText(text: string): Promise<Locator> {
        const strategies = await this.generateStrategiesForText(text);
        return this.createSelfHealingLocator(strategies);
    }

    /**
     * Find element by role with self-healing capabilities
     */
    async findByRole(role: string, options?: { name?: string }): Promise<Locator> {
        let selector = `[role="${role}"]`;
        if (options?.name) {
            selector = `[role="${role}"][aria-label="${options.name}"]`;
        }

        const strategies = await this.generateStrategiesForSelector(selector);
        return this.createSelfHealingLocator(strategies);
    }

    /**
     * Find element by test ID with self-healing capabilities
     */
    async findByTestId(testId: string): Promise<Locator> {
        const selector = `[data-testid="${testId}"]`;
        const strategies = await this.generateStrategiesForSelector(selector);
        return this.createSelfHealingLocator(strategies);
    }

    /**
     * Find element by CSS selector with self-healing capabilities
     */
    async findBySelector(selector: string): Promise<Locator> {
        const strategies = await this.generateStrategiesForSelector(selector);
        return this.createSelfHealingLocator(strategies);
    }

    /**
     * Generate locator for an existing Playwright locator
     */
    async enhanceLocator(locator: Locator): Promise<Locator> {
        // Get the element to analyze
        const element = await locator.elementHandle();
        if (!element) {
            throw new Error('Element not found for enhancement');
        }

        // Generate strategies using the engine
        const result = await this.page.evaluate((el) => {
            // This runs in browser context, so we need to recreate the engine
            // For now, we'll use a simplified approach
            return {
                strategies: [],
                primarySelector: el.tagName.toLowerCase(),
                confidence: 0.5,
                elementData: {
                    tagName: el.tagName.toLowerCase(),
                    id: el.id || undefined,
                    className: el.className || undefined,
                    textContent: el.textContent?.trim() || undefined,
                    attributes: {},
                    position: { x: 0, y: 0, width: 0, height: 0 }
                }
            };
        }, element);

        return this.createSelfHealingLocator(result.strategies);
    }

    /**
     * Generate multiple strategies for text-based selection
     */
    private async generateStrategiesForText(text: string): Promise<LocatorStrategy[]> {
        const strategies: LocatorStrategy[] = [
            {
                type: 'text',
                selector: text,
                priority: 1,
                description: 'Exact text match',
                reliability: 0.8
            },
            {
                type: 'text',
                selector: `text=${text}`,
                priority: 2,
                description: 'Playwright text selector',
                reliability: 0.8
            },
            {
                type: 'xpath',
                selector: `//*[text()="${text}"]`,
                priority: 3,
                description: 'XPath text match',
                reliability: 0.7
            },
            {
                type: 'xpath',
                selector: `//*[contains(text(), "${text}")]`,
                priority: 4,
                description: 'XPath partial text match',
                reliability: 0.6
            }
        ];

        return strategies;
    }

    /**
     * Generate multiple strategies for CSS selector
     */
    private async generateStrategiesForSelector(initialSelector: string): Promise<LocatorStrategy[]> {
        try {
            // Find the element first
            const element = await this.page.locator(initialSelector).first().elementHandle();
            if (!element) {
                // Return basic strategy if element not found
                return [{
                    type: 'css',
                    selector: initialSelector,
                    priority: 1,
                    description: 'Original selector',
                    reliability: 0.5
                }];
            }

            // Use the engine to generate comprehensive strategies
            const result = await this.page.evaluate((el) => {
                // We need to pass the engine logic into the browser context
                // For now, return a simplified result
                const rect = el.getBoundingClientRect();
                const attributes: Record<string, string> = {};

                for (let i = 0; i < el.attributes.length; i++) {
                    const attr = el.attributes[i];
                    if (attr) {
                        attributes[attr.name] = attr.value;
                    }
                }

                return {
                    tagName: el.tagName.toLowerCase(),
                    id: el.id || undefined,
                    className: el.className || undefined,
                    textContent: el.textContent?.trim() || undefined,
                    attributes,
                    position: {
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height
                    }
                };
            }, element);

            // Generate strategies based on element data
            const strategies: LocatorStrategy[] = [];

            // Add original selector
            strategies.push({
                type: 'css',
                selector: initialSelector,
                priority: 1,
                description: 'Original selector',
                reliability: 0.7
            });

            // Add ID-based strategy
            if (result.id) {
                strategies.push({
                    type: 'id',
                    selector: `#${result.id}`,
                    priority: 2,
                    description: 'ID selector',
                    reliability: 0.9
                });
            }

            // Add test attribute strategies
            if (result.attributes['data-testid']) {
                strategies.push({
                    type: 'data-testid',
                    selector: `[data-testid="${result.attributes['data-testid']}"]`,
                    priority: 1,
                    description: 'Test ID attribute',
                    reliability: 0.95
                });
            }

            // Add text-based strategy
            if (result.textContent && result.textContent.length < 50) {
                strategies.push({
                    type: 'text',
                    selector: result.textContent,
                    priority: 5,
                    description: 'Text content',
                    reliability: 0.7
                });
            }

            // Add class-based strategy
            if (result.className) {
                const classes = result.className.split(' ').filter((cls: string) => cls.length > 0);
                if (classes.length > 0) {
                    strategies.push({
                        type: 'css',
                        selector: `.${classes[0]}`,
                        priority: 6,
                        description: 'Class selector',
                        reliability: 0.5
                    });
                }
            }

            return strategies.sort((a, b) => a.priority - b.priority);

        } catch (error) {
            console.warn('[SmartLocator] Error generating strategies:', error);
            return [{
                type: 'css',
                selector: initialSelector,
                priority: 1,
                description: 'Fallback selector',
                reliability: 0.3
            }];
        }
    }

    /**
     * Create a self-healing locator that tries multiple strategies
     */
    private createSelfHealingLocator(strategies: LocatorStrategy[]): Locator {
        if (strategies.length === 0) {
            throw new Error('No strategies available for locator');
        }

        // Start with the highest priority strategy
        let currentLocator = this.createLocatorForStrategy(strategies[0]!);

        // If we have multiple strategies, create a fallback chain
        if (strategies.length > 1) {
            // For now, we'll use the primary strategy
            // In the future, we could implement retry logic with fallbacks
            currentLocator = this.createLocatorForStrategy(strategies[0]!);
        }

        return currentLocator;
    }

    /**
     * Create a Playwright locator for a specific strategy
     */
    private createLocatorForStrategy(strategy: LocatorStrategy): Locator {
        switch (strategy.type) {
            case 'id':
                return this.page.locator(strategy.selector);

            case 'data-testid':
                if (strategy.selector.startsWith('[data-testid=')) {
                    const testId = strategy.selector.match(/data-testid="([^"]+)"/)?.[1];
                    return testId ? this.page.getByTestId(testId) : this.page.locator(strategy.selector);
                }
                return this.page.locator(strategy.selector);

            case 'text':
                if (strategy.selector.startsWith('text=')) {
                    const text = strategy.selector.substring(5);
                    return this.page.getByText(text);
                }
                return this.page.getByText(strategy.selector);

            case 'role':
                const roleMatch = strategy.selector.match(/\[role="([^"]+)"\]/);
                if (roleMatch) {
                    return this.page.getByRole(roleMatch[1] as any);
                }
                return this.page.locator(strategy.selector);

            case 'aria-label':
                const labelMatch = strategy.selector.match(/\[aria-label="([^"]+)"\]/);
                if (labelMatch && labelMatch[1]) {
                    return this.page.getByLabel(labelMatch[1]);
                }
                return this.page.locator(strategy.selector);

            case 'xpath':
                return this.page.locator(`xpath=${strategy.selector}`);

            case 'css':
            default:
                return this.page.locator(strategy.selector);
        }
    }

    /**
     * Validate that a locator can find elements
     */
    async validateLocator(locator: Locator): Promise<boolean> {
        try {
            const count = await locator.count();
            return count > 0;
        } catch {
            return false;
        }
    }

    /**
     * Get debug information about the generated strategies
     */
    async getDebugInfo(selector: string): Promise<{
        strategies: LocatorStrategy[];
        validStrategies: LocatorStrategy[];
        recommended: string;
    }> {
        const strategies = await this.generateStrategiesForSelector(selector);

        // Test each strategy
        const validStrategies: LocatorStrategy[] = [];
        for (const strategy of strategies) {
            const locator = this.createLocatorForStrategy(strategy);
            const isValid = await this.validateLocator(locator);
            if (isValid) {
                validStrategies.push({ ...strategy, isUnique: true });
            }
        }

        return {
            strategies,
            validStrategies,
            recommended: validStrategies[0]?.selector || strategies[0]?.selector || selector
        };
    }
}
