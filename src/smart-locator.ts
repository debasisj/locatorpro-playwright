/**
 * SmartLocator - Playwright Integration for LocatorPro
 * 
 * Self-healing locator system with intelligent fallback strategies
 */

import { Page, Locator } from '@playwright/test';
import { LocatorEngine } from './locator-engine';
import { LocatorProOptions, LocatorResult, LocatorStrategy, DomElement } from './types';

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
     * NEXT LEVEL: Intelligent DOM scanning to find element by visible text
     * This is the main user-facing method - just pass visible text and fallbacks
     */
    async findByVisibleText(text: string, options?: {
        fallbacks?: string[];
        elementTypes?: string[];
        maxResults?: number;
    }): Promise<Locator> {
        console.log(`🔍 Smart DOM Scan for: "${text}"`);

        const textVariations = [text];
        if (options?.fallbacks) {
            textVariations.push(...options.fallbacks);
        }

        // Scan DOM for all possible matches
        const domScanResults = await this.scanDomForText(textVariations, options?.elementTypes);

        if (domScanResults.length === 0) {
            throw new Error(`No elements found for text variations: ${textVariations.join(', ')}`);
        }

        // Analyze and rank the best strategies
        const bestStrategies = await this.analyzeBestStrategies(domScanResults);

        console.log(`✅ Found ${domScanResults.length} potential elements, using ${bestStrategies.length} strategies`);

        return this.createSelfHealingLocator(bestStrategies);
    }

    /**
     * Comprehensive DOM scanning to find all elements containing text variations
     */
    private async scanDomForText(textVariations: string[], elementTypes?: string[]): Promise<DomElement[]> {
        const scanResults = await this.page.evaluate((args) => {
            const { textVariations, elementTypes } = args;
            const results: any[] = [];

            // Get all elements in the DOM
            const allElements = Array.from(document.querySelectorAll('*'));

            for (const element of allElements) {
                const el = element as HTMLElement;

                // Skip hidden, script, style elements
                if (!el.offsetParent && el.tagName !== 'HTML' && el.tagName !== 'BODY') continue;
                if (['SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE'].includes(el.tagName)) continue;

                // Filter by element types if specified
                if (elementTypes && elementTypes.length > 0) {
                    if (!elementTypes.includes(el.tagName.toLowerCase())) continue;
                }

                // Check if element contains any of our text variations
                const textContent = el.textContent?.trim() || '';
                const innerText = el.innerText?.trim() || '';
                const value = el.getAttribute('value') || '';
                const placeholder = el.getAttribute('placeholder') || '';
                const ariaLabel = el.getAttribute('aria-label') || '';
                const title = el.getAttribute('title') || '';

                const searchableTexts = [textContent, innerText, value, placeholder, ariaLabel, title];

                for (const searchText of searchableTexts) {
                    for (const targetText of textVariations) {
                        if (searchText.toLowerCase().includes(targetText.toLowerCase()) ||
                            targetText.toLowerCase().includes(searchText.toLowerCase())) {

                            // Calculate element quality score
                            const rect = el.getBoundingClientRect();
                            const isVisible = rect.width > 0 && rect.height > 0 &&
                                window.getComputedStyle(el).visibility !== 'hidden' &&
                                window.getComputedStyle(el).display !== 'none';

                            const attributes: Record<string, string> = {};
                            for (let i = 0; i < el.attributes.length; i++) {
                                const attr = el.attributes[i];
                                if (attr) attributes[attr.name] = attr.value;
                            }

                            results.push({
                                tagName: el.tagName.toLowerCase(),
                                textContent: textContent,
                                innerText: innerText,
                                value: value,
                                id: el.id || null,
                                className: el.className || null,
                                attributes: attributes,
                                isVisible: isVisible,
                                isInteractive: ['BUTTON', 'INPUT', 'A', 'SELECT', 'TEXTAREA'].includes(el.tagName) ||
                                    el.hasAttribute('onclick') || el.hasAttribute('role'),
                                hasTestId: el.hasAttribute('data-testid') || el.hasAttribute('data-test') || el.hasAttribute('data-qa'),
                                matchedText: targetText,
                                matchType: searchText === targetText ? 'exact' : 'partial',
                                position: {
                                    x: rect.x,
                                    y: rect.y,
                                    width: rect.width,
                                    height: rect.height
                                },
                                score: 0 // Will be calculated later
                            });
                            break; // Found a match, move to next element
                        }
                    }
                }
            }

            return results;
        }, { textVariations, elementTypes: elementTypes || [] });

        return scanResults;
    }

    /**
     * Analyze DOM scan results and create the best locator strategies
     */
    private async analyzeBestStrategies(domElements: DomElement[]): Promise<LocatorStrategy[]> {
        // Score and rank elements
        const scoredElements = domElements.map(el => {
            let score = 0;

            // Visibility bonus
            if (el.isVisible) score += 30;

            // Interactive element bonus
            if (el.isInteractive) score += 25;

            // Test ID bonus (highest priority)
            if (el.hasTestId) score += 40;

            // ID attribute bonus
            if (el.id) score += 20;

            // Exact text match bonus
            if (el.matchType === 'exact') score += 15;

            // Size bonus (reasonable sized elements)
            if (el.position.width > 20 && el.position.height > 10) score += 10;

            // Clickable elements bonus
            if (['button', 'input', 'a'].includes(el.tagName)) score += 20;

            // Penalty for very large elements (likely containers)
            if (el.position.width > 800 || el.position.height > 600) score -= 15;

            el.score = score;
            return el;
        });

        // Sort by score (highest first)
        scoredElements.sort((a, b) => b.score - a.score);

        console.log('🎯 Top DOM Analysis Results:');
        scoredElements.slice(0, 3).forEach((el, i) => {
            console.log(`  ${i + 1}. ${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className.split(' ')[0] : ''} (score: ${el.score})`);
            console.log(`     Text: "${el.textContent?.substring(0, 50)}${el.textContent && el.textContent.length > 50 ? '...' : ''}"`);
            console.log(`     Visible: ${el.isVisible}, Interactive: ${el.isInteractive}, TestId: ${el.hasTestId}`);
        });

        // Take the highest scoring element and create focused strategies
        const bestElement = scoredElements[0];
        if (!bestElement) {
            throw new Error('No suitable elements found');
        }

        const strategies: LocatorStrategy[] = [];
        const usedSelectors = new Set<string>(); // Prevent duplicates
        let priority = 1;

        // Strategy 1: Text-specific selector (HIGHEST priority for text-based searches)
        if (bestElement.textContent && bestElement.textContent.trim().length > 0 && bestElement.textContent.trim().length < 100) {
            // Use Playwright's native getByText which is more precise than :has-text()
            const textContent = bestElement.textContent.trim();
            const textSelector = `getByText:${textContent}`;
            if (!usedSelectors.has(textSelector)) {
                strategies.push({
                    type: 'text',
                    selector: textContent,
                    priority: priority++,
                    description: `Exact text match: "${textContent}"`,
                    reliability: 0.95
                });
                usedSelectors.add(textSelector);
            }
        }

        // Strategy 2: Test ID (high priority but may be generic)
        if (bestElement.attributes['data-testid'] && !usedSelectors.has(`[data-testid="${bestElement.attributes['data-testid']}"]`)) {
            const selector = `[data-testid="${bestElement.attributes['data-testid']}"]`;
            strategies.push({
                type: 'data-testid',
                selector: selector,
                priority: priority++,
                description: `Test ID: ${bestElement.attributes['data-testid']}`,
                reliability: 0.9
            });
            usedSelectors.add(selector);
        }

        if (bestElement.attributes['data-test'] && !usedSelectors.has(`[data-test="${bestElement.attributes['data-test']}"]`)) {
            const selector = `[data-test="${bestElement.attributes['data-test']}"]`;
            strategies.push({
                type: 'css',
                selector: selector,
                priority: priority++,
                description: `Data-test: ${bestElement.attributes['data-test']}`,
                reliability: 0.9
            });
            usedSelectors.add(selector);
        }

        // Strategy 3: ID selector
        if (bestElement.id && !usedSelectors.has(`#${bestElement.id}`)) {
            const selector = `#${bestElement.id}`;
            strategies.push({
                type: 'id',
                selector: selector,
                priority: priority++,
                description: `ID: ${bestElement.id}`,
                reliability: 0.9
            });
            usedSelectors.add(selector);
        }

        // Strategy 4: Specific input selectors for form elements
        if (bestElement.tagName === 'input') {
            if (bestElement.attributes['type'] && bestElement.attributes['name'] && !usedSelectors.has(`input[type="${bestElement.attributes['type']}"][name="${bestElement.attributes['name']}"]`)) {
                const selector = `input[type="${bestElement.attributes['type']}"][name="${bestElement.attributes['name']}"]`;
                strategies.push({
                    type: 'css',
                    selector: selector,
                    priority: priority++,
                    description: `Input type+name: ${bestElement.attributes['type']}, ${bestElement.attributes['name']}`,
                    reliability: 0.85
                });
                usedSelectors.add(selector);
            }

            if (bestElement.value && !usedSelectors.has(`input[value="${bestElement.value}"]`)) {
                const selector = `input[value="${bestElement.value}"]`;
                strategies.push({
                    type: 'css',
                    selector: selector,
                    priority: priority++,
                    description: `Input value: ${bestElement.value}`,
                    reliability: 0.8
                });
                usedSelectors.add(selector);
            }

            if (bestElement.attributes['placeholder'] && !usedSelectors.has(`input[placeholder="${bestElement.attributes['placeholder']}"]`)) {
                const selector = `input[placeholder="${bestElement.attributes['placeholder']}"]`;
                strategies.push({
                    type: 'css',
                    selector: selector,
                    priority: priority++,
                    description: `Placeholder: ${bestElement.attributes['placeholder']}`,
                    reliability: 0.75
                });
                usedSelectors.add(selector);
            }
        }

        // Strategy 5: Class selector (only if reasonably specific)
        if (bestElement.className && bestElement.className.split(' ').length <= 2) {
            const classes = bestElement.className.split(' ').filter(cls => cls.length > 0);
            const selector = `.${classes.join('.')}`;
            if (!usedSelectors.has(selector)) {
                strategies.push({
                    type: 'css',
                    selector: selector,
                    priority: priority++,
                    description: `Classes: ${classes.join(', ')}`,
                    reliability: 0.6
                });
                usedSelectors.add(selector);
            }
        }

        // Add fallback from other high-scoring elements if we don't have enough strategies
        if (strategies.length < 3) {
            for (let i = 1; i < Math.min(scoredElements.length, 3); i++) {
                const element = scoredElements[i];
                if (!element) continue;

                if (element.attributes['data-testid'] && !usedSelectors.has(`[data-testid="${element.attributes['data-testid']}"]`)) {
                    const selector = `[data-testid="${element.attributes['data-testid']}"]`;
                    strategies.push({
                        type: 'data-testid',
                        selector: selector,
                        priority: priority++,
                        description: `Fallback Test ID: ${element.attributes['data-testid']}`,
                        reliability: 0.9
                    });
                    usedSelectors.add(selector);
                }

                if (element.id && !usedSelectors.has(`#${element.id}`)) {
                    const selector = `#${element.id}`;
                    strategies.push({
                        type: 'id',
                        selector: selector,
                        priority: priority++,
                        description: `Fallback ID: ${element.id}`,
                        reliability: 0.85
                    });
                    usedSelectors.add(selector);
                }
            }
        }

        console.log(`✅ Generated ${strategies.length} unique strategies for best element`);

        // DEBUG: Show all generated strategies
        console.log('🔍 Generated strategies:');
        strategies.forEach((strategy, index) => {
            console.log(`  ${index + 1}. [${strategy.type}] ${strategy.selector} (priority: ${strategy.priority}, reliability: ${strategy.reliability})`);
            console.log(`     Description: ${strategy.description}`);
        });

        // Respect maxStrategies configuration
        const maxStrategies = this.options.config?.maxStrategies || 5;
        const finalStrategies = strategies.slice(0, maxStrategies);

        console.log(`📊 Using ${finalStrategies.length} strategies (max: ${maxStrategies})`);
        return finalStrategies;
    }

    /**
     * Find element by text content with self-healing capabilities
     */
    async findByText(text: string, options?: { fallbacks?: string[] }): Promise<Locator> {
        const textVariations = [text];

        // Add fallbacks if provided
        if (options?.fallbacks) {
            textVariations.push(...options.fallbacks);
        }

        // Generate strategies for all text variations
        const allStrategies = [];
        for (const textVariation of textVariations) {
            const strategies = await this.generateStrategiesForText(textVariation);
            allStrategies.push(...strategies);
        }

        return this.createSelfHealingLocator(allStrategies);
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
     * Supports both data-testid and data-test attributes
     */
    async findByTestId(testId: string): Promise<Locator> {
        console.log(`🔍 Finding element by test ID: "${testId}"`);

        // Try multiple test attribute variations
        const testStrategies: LocatorStrategy[] = [
            {
                type: 'css',
                selector: `[data-testid="${testId}"]`,
                priority: 1,
                description: `Test ID: data-testid="${testId}"`,
                reliability: 0.95
            },
            {
                type: 'css',
                selector: `[data-test="${testId}"]`,
                priority: 2,
                description: `Test ID: data-test="${testId}"`,
                reliability: 0.95
            },
            {
                type: 'css',
                selector: `[data-qa="${testId}"]`,
                priority: 3,
                description: `Test ID: data-qa="${testId}"`,
                reliability: 0.9
            },
            // ID-based fallback (in case testId matches an ID)
            {
                type: 'id',
                selector: `#${testId}`,
                priority: 4,
                description: `ID fallback: ${testId}`,
                reliability: 0.8
            },
            // Class-based fallback (in case testId matches a class)
            {
                type: 'css',
                selector: `.${testId}`,
                priority: 5,
                description: `Class fallback: ${testId}`,
                reliability: 0.6
            }
        ];

        console.log(`✅ Generated ${testStrategies.length} test ID strategies`);
        return this.createSelfHealingLocator(testStrategies);
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
            // Use exact text match with specific element types to avoid title conflicts
            {
                type: 'xpath',
                selector: `//div[normalize-space(text())="${text}" and not(descendant::*[text()])]`,
                priority: 1,
                description: 'XPath div with exact text only',
                reliability: 0.9
            },
            {
                type: 'xpath',
                selector: `//span[normalize-space(text())="${text}" and not(descendant::*[text()])]`,
                priority: 2,
                description: 'XPath span with exact text only',
                reliability: 0.9
            },
            {
                type: 'css',
                selector: `div.login_logo:has-text("${text}")`,
                priority: 3,
                description: 'Login logo div containing text',
                reliability: 0.85
            },
            {
                type: 'xpath',
                selector: `//div[text()="${text}"]`,
                priority: 4,
                description: 'XPath div exact text',
                reliability: 0.8
            },
            {
                type: 'xpath',
                selector: `//span[text()="${text}"]`,
                priority: 5,
                description: 'XPath span exact text',
                reliability: 0.8
            },
            {
                type: 'text',
                selector: text,
                priority: 6,
                description: 'Playwright text match (may include title)',
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

        // Sort strategies by priority (lower number = higher priority)
        const sortedStrategies = strategies.sort((a, b) => a.priority - b.priority);

        // Create the primary locator
        let locator = this.createLocatorForStrategy(sortedStrategies[0]!);

        // Add fallback strategies using Playwright's or() method
        for (let i = 1; i < sortedStrategies.length; i++) {
            const fallbackLocator = this.createLocatorForStrategy(sortedStrategies[i]!);
            locator = locator.or(fallbackLocator);
        }

        return locator;
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

    /**
     * 🎯 ADVANCED: Find element by its relationship to specific text
     * Perfect for finding buttons/actions related to specific items (e.g., "Add to cart" for "Sauce Labs Onesie")
     */
    async findByRelatedText(targetText: string, relatedText: string, options?: {
        containerTypes?: string[];
        maxLevelsUp?: number;
        maxStrategies?: number;
    }): Promise<Locator> {
        console.log(`🔗 Smart Related Text Search: "${targetText}" related to "${relatedText}"`);

        const containerTypes = options?.containerTypes || ['div', 'section', 'article', 'li', 'tr'];
        const maxLevelsUp = options?.maxLevelsUp || 5;
        const maxStrategies = options?.maxStrategies || 1;

        // Find elements that contain both the related text and target text
        const relatedResults = await this.page.evaluate((args) => {
            const { targetText, relatedText, containerTypes, maxLevelsUp } = args;
            const results: any[] = [];

            // Strategy: Find containers that have the related text, then look for target elements within
            const allElements = Array.from(document.querySelectorAll('*'));

            for (const element of allElements) {
                const el = element as HTMLElement;

                // Skip non-relevant elements
                if (['SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE'].includes(el.tagName)) continue;

                const elementText = el.textContent?.trim() || '';

                // Check if this element contains the related text (e.g., "Aer Lingus")
                if (elementText.includes(relatedText)) {
                    // Now find target elements within this container
                    const targetElements = el.querySelectorAll('*');

                    for (const targetEl of Array.from(targetElements)) {
                        const targetElement = targetEl as HTMLElement;
                        const targetElementText = targetElement.textContent?.trim() || '';
                        const value = (targetElement as HTMLInputElement).value || '';
                        const ariaLabel = targetElement.getAttribute('aria-label') || '';

                        // Check if this element contains our target text (in text, value, or aria-label)
                        const isTargetByText = targetElementText.includes(targetText);
                        const isTargetByValue = value.includes(targetText);
                        const isTargetByAriaLabel = ariaLabel.includes(targetText);

                        if (isTargetByText || isTargetByValue || isTargetByAriaLabel) {

                            const rect = targetElement.getBoundingClientRect();
                            const isVisible = rect.width > 0 && rect.height > 0;
                            const isInteractive = ['BUTTON', 'INPUT', 'A', 'SELECT'].includes(targetElement.tagName) ||
                                targetElement.hasAttribute('onclick') ||
                                targetElement.hasAttribute('role');

                            if (isVisible && isInteractive) {
                                // Calculate container specificity score
                                const containerTextLength = elementText.length;
                                const relatedTextOccurrences = (elementText.match(new RegExp(relatedText, 'g')) || []).length;

                                // Prefer smaller, more specific containers
                                const specificityScore = relatedTextOccurrences === 1 ? 100 :
                                    containerTextLength < 500 ? 80 :
                                        containerTextLength < 1000 ? 60 : 40;

                                const attributes: Record<string, string> = {};
                                for (let i = 0; i < targetElement.attributes.length; i++) {
                                    const attr = targetElement.attributes[i];
                                    if (attr) attributes[attr.name] = attr.value;
                                }

                                results.push({
                                    tagName: targetElement.tagName.toLowerCase(),
                                    textContent: targetElementText,
                                    value: value,
                                    id: targetElement.id || null,
                                    className: targetElement.className || null,
                                    attributes: attributes,
                                    isVisible: isVisible,
                                    isInteractive: isInteractive,
                                    relatedText: relatedText,
                                    targetText: targetText,
                                    containerInfo: {
                                        tagName: el.tagName,
                                        className: el.className,
                                        textLength: containerTextLength,
                                        specificity: specificityScore
                                    },
                                    score: specificityScore + (isVisible ? 20 : 0) + (isInteractive ? 10 : 0)
                                });
                            }
                        }
                    }
                }
            }

            // Sort by score (most specific containers first)
            return results.sort((a, b) => b.score - a.score);
        }, { targetText, relatedText, containerTypes, maxLevelsUp });

        if (relatedResults.length === 0) {
            throw new Error(`No elements found for "${targetText}" related to "${relatedText}"`);
        }

        console.log(`🎯 Found ${relatedResults.length} related elements`);
        relatedResults.slice(0, 5).forEach((result, idx) => {
            console.log(`   ${idx + 1}. ${result.tagName}#${result.id || 'no-id'} - specificity: ${result.containerInfo.specificity}`);
        });

        // Create strategies for the related elements
        const strategies = await this.generateRelatedTextStrategies(relatedResults[0], relatedText);

        console.log(`📊 Using ${Math.min(strategies.length, maxStrategies)} related-text strategies`);

        return this.createSelfHealingLocator(strategies.slice(0, maxStrategies));
    }

    /**
     * Generate intelligent strategies for related text element selection
     */
    private async generateRelatedTextStrategies(element: any, relatedText: string): Promise<LocatorStrategy[]> {
        const strategies: LocatorStrategy[] = [];

        // Strategy 1: Use ID if available (most reliable)
        if (element.id) {
            strategies.push({
                selector: `#${element.id}`,
                type: 'id',
                priority: 1,
                reliability: 0.98,
                description: `Direct ID: ${element.id}`
            });
        }

        // Strategy 2: Use data-test attribute if available
        if (element.attributes['data-test']) {
            strategies.push({
                selector: `[data-test="${element.attributes['data-test']}"]`,
                type: 'css',
                priority: 2,
                reliability: 0.95,
                description: `Data-test: ${element.attributes['data-test']}`
            });
        }

        // Strategy 3: Use name attribute for form elements
        if (element.attributes['name']) {
            strategies.push({
                selector: `[name="${element.attributes['name']}"]`,
                type: 'css',
                priority: 3,
                reliability: 0.9,
                description: `Name attribute: ${element.attributes['name']}`
            });
        }

        // Strategy 4: Use role attribute for accessibility
        if (element.attributes['role']) {
            strategies.push({
                selector: `:has-text("${relatedText}") [role="${element.attributes['role']}"]`,
                type: 'css',
                priority: 4,
                reliability: 0.85,
                description: `Role attribute: ${element.attributes['role']} in container with ${relatedText}`
            });
        }

        // Strategy 5: Use href attribute for links
        if (element.tagName === 'a' && element.attributes['href']) {
            strategies.push({
                selector: `:has-text("${relatedText}") a[href="${element.attributes['href']}"]`,
                type: 'css',
                priority: 5,
                reliability: 0.9,
                description: `Link href: ${element.attributes['href']} in container with ${relatedText}`
            });
        }

        // Strategy 6: Use alt attribute for images
        if (element.tagName === 'img' && element.attributes['alt']) {
            strategies.push({
                selector: `:has-text("${relatedText}") img[alt="${element.attributes['alt']}"]`,
                type: 'css',
                priority: 6,
                reliability: 0.85,
                description: `Image alt: ${element.attributes['alt']} in container with ${relatedText}`
            });
        }

        // Strategy 7: Use title attribute
        if (element.attributes['title']) {
            strategies.push({
                selector: `:has-text("${relatedText}") [title="${element.attributes['title']}"]`,
                type: 'css',
                priority: 7,
                reliability: 0.8,
                description: `Title attribute: ${element.attributes['title']} in container with ${relatedText}`
            });
        }

        // Strategy 8: Use placeholder for input elements
        if (element.tagName === 'input' && element.attributes['placeholder']) {
            strategies.push({
                selector: `:has-text("${relatedText}") input[placeholder="${element.attributes['placeholder']}"]`,
                type: 'css',
                priority: 8,
                reliability: 0.8,
                description: `Input placeholder: ${element.attributes['placeholder']} in container with ${relatedText}`
            });
        }

        // Strategy 9: Use type attribute for input elements
        if (element.tagName === 'input' && element.attributes['type']) {
            strategies.push({
                selector: `:has-text("${relatedText}") input[type="${element.attributes['type']}"]`,
                type: 'css',
                priority: 9,
                reliability: 0.75,
                description: `Input type: ${element.attributes['type']} in container with ${relatedText}`
            });
        }

        // Strategy 10: Use row-based CSS selector with has-text and value
        if (element.tagName === 'input' && element.value) {
            strategies.push({
                selector: `tr:has-text("${relatedText}") input[value="${element.value}"]`,
                type: 'css',
                priority: 10,
                reliability: 0.9,
                description: `Row-based input value: ${element.value} in row with ${relatedText}`
            });
        }

        // Strategy 11: XPath with value attribute for input elements
        if (element.tagName === 'input' && element.value) {
            strategies.push({
                selector: `//*[contains(text(), "${relatedText}")]/ancestor::tr//input[@value="${element.value}"]`,
                type: 'xpath',
                priority: 11,
                reliability: 0.85,
                description: `XPath input value: ${element.value} in row with ${relatedText}`
            });
        }

        // Strategy 12: CSS selector for anchor elements with text content
        if (element.tagName === 'a' && element.textContent) {
            strategies.push({
                selector: `:has-text("${relatedText}") a:has-text("${element.textContent.trim()}")`,
                type: 'css',
                priority: 12,
                reliability: 0.85,
                description: `Anchor with text: ${element.textContent.trim()} in container with ${relatedText}`
            });
        }

        // Strategy 13: XPath for anchor elements
        if (element.tagName === 'a' && element.textContent) {
            strategies.push({
                selector: `//*[contains(text(), "${relatedText}")]/ancestor::*//a[contains(text(), "${element.textContent.trim()}")]`,
                type: 'xpath',
                priority: 13,
                reliability: 0.8,
                description: `XPath anchor: ${element.textContent.trim()} in container with ${relatedText}`
            });
        }

        // Strategy 14: Generic container approach for non-input elements
        if (element.containerInfo && element.containerInfo.className) {
            const containerClass = element.containerInfo.className.split(' ')[0];
            strategies.push({
                selector: `.${containerClass}:has-text("${relatedText}") ${element.tagName}:has-text("${element.targetText}")`,
                type: 'css',
                priority: 14,
                reliability: 0.8,
                description: `Specific container: ${containerClass} with both texts`
            });
        }

        console.log(`🎯 Generated ${strategies.length} related-text strategies:`);
        strategies.slice(0, 3).forEach((strategy, idx) => {
            console.log(`   ${idx + 1}. [${strategy.type}] ${strategy.selector} (priority: ${strategy.priority}, reliability: ${strategy.reliability})`);
            console.log(`      ${strategy.description}`);
        });

        return strategies;
    }
}
