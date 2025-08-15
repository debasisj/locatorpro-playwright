/**
 * LocatorPro Core Engine - 35-Priority Intelligent Selector Generation
 * 
 * This is the heart of LocatorPro's self-healing locator technology.
 * Ported and enhanced from the Chrome extension's proven locator generation system.
 */

import {
    LocatorStrategy,
    ElementData,
    LocatorConfig,
    LocatorResult,
    ValidationResult,
    LogLevel
} from './types';

export class LocatorEngine {
    private config: Required<LocatorConfig>;
    private logLevel: LogLevel;

    constructor(config?: LocatorConfig, logLevel: LogLevel = 'warn') {
        this.config = {
            maxStrategies: config?.maxStrategies ?? 10,
            includeXPath: config?.includeXPath ?? true,
            includeCssPath: config?.includeCssPath ?? true,
            prioritizeTestAttributes: config?.prioritizeTestAttributes ?? true,
            fallbackToPosition: config?.fallbackToPosition ?? false,
            customAttributes: config?.customAttributes ?? []
        };
        this.logLevel = logLevel;
    }

    /**
     * Generate optimized selectors for an element using 35-priority system
     */
    public generateSelectors(element: Element): LocatorResult {
        const elementData = this.captureElementData(element);
        const strategies = this.generateAllStrategies(element, elementData);

        // Sort by priority and filter for reliability
        const sortedStrategies = strategies
            .sort((a, b) => a.priority - b.priority)
            .slice(0, this.config.maxStrategies);

        // Validate strategies and pick the best one
        const validatedStrategies = this.validateStrategies(sortedStrategies);
        const primarySelector = this.selectPrimaryStrategy(validatedStrategies);
        const confidence = this.calculateConfidence(validatedStrategies);

        this.log('info', `Generated ${strategies.length} strategies, selected ${validatedStrategies.length} valid ones`);

        return {
            strategies: validatedStrategies,
            primarySelector,
            confidence,
            elementData
        };
    }

    /**
     * Capture comprehensive element data
     */
    private captureElementData(element: Element): ElementData {
        const rect = element.getBoundingClientRect();
        const attributes: Record<string, string> = {};

        // Capture all attributes
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            if (attr) {
                attributes[attr.name] = attr.value;
            }
        }

        return {
            tagName: element.tagName.toLowerCase(),
            id: element.id || undefined,
            className: element.className || undefined,
            textContent: element.textContent?.trim() || undefined,
            attributes,
            position: {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            },
            xpath: this.generateXPath(element),
            cssPath: this.generateCssPath(element)
        };
    }

    /**
     * Generate all 35 locator strategies with priorities
     */
    private generateAllStrategies(element: Element, elementData: ElementData): LocatorStrategy[] {
        const strategies: LocatorStrategy[] = [];

        // Priority 1-5: Test-specific attributes (highest priority)
        this.addTestAttributeStrategies(strategies, elementData);

        // Priority 6-10: Semantic attributes
        this.addSemanticStrategies(strategies, element, elementData);

        // Priority 11-15: Role-based strategies
        this.addRoleStrategies(strategies, element, elementData);

        // Priority 16-20: Text-based strategies
        this.addTextStrategies(strategies, element, elementData);

        // Priority 21-25: Structure-based strategies
        this.addStructureStrategies(strategies, element, elementData);

        // Priority 26-30: Attribute combinations
        this.addAttributeCombinationStrategies(strategies, elementData);

        // Priority 31-35: Fallback strategies
        this.addFallbackStrategies(strategies, element, elementData);

        return strategies.filter(s => s.selector.length > 0);
    }

    /**
     * Priority 1-5: Test-specific attributes
     */
    private addTestAttributeStrategies(strategies: LocatorStrategy[], elementData: ElementData): void {
        const { attributes } = elementData;

        if (attributes['data-testid']) {
            strategies.push({
                type: 'data-testid',
                selector: `[data-testid="${attributes['data-testid']}"]`,
                priority: 1,
                description: 'Data test ID (most reliable)',
                reliability: 0.95
            });
        }

        if (attributes['data-test']) {
            strategies.push({
                type: 'data-testid',
                selector: `[data-test="${attributes['data-test']}"]`,
                priority: 2,
                description: 'Data test attribute',
                reliability: 0.9
            });
        }

        if (attributes['data-qa']) {
            strategies.push({
                type: 'data-testid',
                selector: `[data-qa="${attributes['data-qa']}"]`,
                priority: 3,
                description: 'Data QA attribute',
                reliability: 0.9
            });
        }

        if (attributes['test-id']) {
            strategies.push({
                type: 'data-testid',
                selector: `[test-id="${attributes['test-id']}"]`,
                priority: 4,
                description: 'Test ID attribute',
                reliability: 0.85
            });
        }

        if (elementData.id && this.isTestLikeId(elementData.id)) {
            strategies.push({
                type: 'id',
                selector: `#${elementData.id}`,
                priority: 5,
                description: 'Test-like ID',
                reliability: 0.8
            });
        }
    }

    /**
     * Priority 6-10: Semantic attributes
     */
    private addSemanticStrategies(strategies: LocatorStrategy[], element: Element, elementData: ElementData): void {
        const { attributes } = elementData;

        if (elementData.id && !this.isTestLikeId(elementData.id)) {
            strategies.push({
                type: 'id',
                selector: `#${elementData.id}`,
                priority: 6,
                description: 'Element ID',
                reliability: 0.8
            });
        }

        if (attributes['aria-label']) {
            strategies.push({
                type: 'aria-label',
                selector: `[aria-label="${attributes['aria-label']}"]`,
                priority: 7,
                description: 'ARIA label',
                reliability: 0.75
            });
        }

        if (attributes['aria-labelledby']) {
            strategies.push({
                type: 'aria-label',
                selector: `[aria-labelledby="${attributes['aria-labelledby']}"]`,
                priority: 8,
                description: 'ARIA labelledby',
                reliability: 0.7
            });
        }

        if (attributes['name']) {
            strategies.push({
                type: 'css',
                selector: `[name="${attributes['name']}"]`,
                priority: 9,
                description: 'Name attribute',
                reliability: 0.75
            });
        }

        if (attributes['for']) {
            strategies.push({
                type: 'css',
                selector: `[for="${attributes['for']}"]`,
                priority: 10,
                description: 'For attribute (labels)',
                reliability: 0.7
            });
        }
    }

    /**
     * Priority 11-15: Role-based strategies
     */
    private addRoleStrategies(strategies: LocatorStrategy[], element: Element, elementData: ElementData): void {
        const { attributes, tagName } = elementData;

        if (attributes['role']) {
            strategies.push({
                type: 'role',
                selector: `[role="${attributes['role']}"]`,
                priority: 11,
                description: 'ARIA role',
                reliability: 0.6
            });
        }

        // Implicit roles for common elements
        const implicitRoles = this.getImplicitRole(tagName, attributes);
        if (implicitRoles.length > 0) {
            implicitRoles.forEach((role, index) => {
                strategies.push({
                    type: 'role',
                    selector: `${tagName}[role="${role}"]`,
                    priority: 12 + index,
                    description: `Implicit role: ${role}`,
                    reliability: 0.55
                });
            });
        }
    }

    /**
     * Priority 16-20: Text-based strategies
     */
    private addTextStrategies(strategies: LocatorStrategy[], element: Element, elementData: ElementData): void {
        const textContent = elementData.textContent;
        if (!textContent || textContent.length > 50) return;

        // Exact text match
        strategies.push({
            type: 'text',
            selector: `text="${textContent}"`,
            priority: 16,
            description: 'Exact text content',
            reliability: 0.7
        });

        // Partial text match
        if (textContent.length > 10) {
            const partialText = textContent.substring(0, Math.min(20, textContent.length));
            strategies.push({
                type: 'text',
                selector: `text*="${partialText}"`,
                priority: 17,
                description: 'Partial text content',
                reliability: 0.6
            });
        }

        // Text with tag
        strategies.push({
            type: 'text',
            selector: `${elementData.tagName}:has-text("${textContent}")`,
            priority: 18,
            description: 'Tag with text content',
            reliability: 0.65
        });

        // Placeholder text
        if (elementData.attributes['placeholder']) {
            strategies.push({
                type: 'css',
                selector: `[placeholder="${elementData.attributes['placeholder']}"]`,
                priority: 19,
                description: 'Placeholder text',
                reliability: 0.7
            });
        }

        // Alt text
        if (elementData.attributes['alt']) {
            strategies.push({
                type: 'css',
                selector: `[alt="${elementData.attributes['alt']}"]`,
                priority: 20,
                description: 'Alt text',
                reliability: 0.7
            });
        }
    }

    /**
     * Priority 21-25: Structure-based strategies
     */
    private addStructureStrategies(strategies: LocatorStrategy[], element: Element, elementData: ElementData): void {
        // Class-based selectors
        if (elementData.className) {
            const classes = elementData.className.split(' ').filter(cls =>
                cls.length > 0 && !this.isUtilityClass(cls)
            );

            if (classes.length > 0) {
                // Single most meaningful class
                const bestClass = this.selectBestClass(classes);
                strategies.push({
                    type: 'css',
                    selector: `.${bestClass}`,
                    priority: 21,
                    description: 'Best class selector',
                    reliability: 0.5
                });

                // Tag with class
                strategies.push({
                    type: 'css',
                    selector: `${elementData.tagName}.${bestClass}`,
                    priority: 22,
                    description: 'Tag with class',
                    reliability: 0.55
                });
            }
        }

        // Type attribute for inputs
        if (elementData.tagName === 'input' && elementData.attributes['type']) {
            strategies.push({
                type: 'css',
                selector: `input[type="${elementData.attributes['type']}"]`,
                priority: 23,
                description: 'Input type',
                reliability: 0.4
            });
        }

        // Tag selector
        strategies.push({
            type: 'css',
            selector: elementData.tagName,
            priority: 24,
            description: 'Tag name',
            reliability: 0.2
        });

        // CSS path (if enabled)
        if (this.config.includeCssPath && elementData.cssPath) {
            strategies.push({
                type: 'css',
                selector: elementData.cssPath,
                priority: 25,
                description: 'CSS path',
                reliability: 0.8
            });
        }
    }

    /**
     * Priority 26-30: Attribute combinations
     */
    private addAttributeCombinationStrategies(strategies: LocatorStrategy[], elementData: ElementData): void {
        const { attributes, tagName } = elementData;

        // Custom attributes from config
        this.config.customAttributes.forEach((attr, index) => {
            if (attributes[attr]) {
                strategies.push({
                    type: 'css',
                    selector: `[${attr}="${attributes[attr]}"]`,
                    priority: 26 + index,
                    description: `Custom attribute: ${attr}`,
                    reliability: 0.6
                });
            }
        });

        // Common attribute combinations
        if (attributes['value'] && ['input', 'button'].includes(tagName)) {
            strategies.push({
                type: 'css',
                selector: `${tagName}[value="${attributes['value']}"]`,
                priority: 28,
                description: 'Tag with value',
                reliability: 0.6
            });
        }

        if (attributes['href'] && tagName === 'a') {
            strategies.push({
                type: 'css',
                selector: `a[href="${attributes['href']}"]`,
                priority: 29,
                description: 'Link with href',
                reliability: 0.65
            });
        }

        if (attributes['src'] && ['img', 'iframe'].includes(tagName)) {
            strategies.push({
                type: 'css',
                selector: `${tagName}[src="${attributes['src']}"]`,
                priority: 30,
                description: 'Element with src',
                reliability: 0.6
            });
        }
    }

    /**
     * Priority 31-35: Fallback strategies
     */
    private addFallbackStrategies(strategies: LocatorStrategy[], element: Element, elementData: ElementData): void {
        // XPath (if enabled)
        if (this.config.includeXPath && elementData.xpath) {
            strategies.push({
                type: 'xpath',
                selector: elementData.xpath,
                priority: 31,
                description: 'XPath selector',
                reliability: 0.9
            });
        }

        // Position-based (if enabled)
        if (this.config.fallbackToPosition) {
            const { position } = elementData;
            strategies.push({
                type: 'xpath',
                selector: `//*[@data-locatorpro-x="${Math.round(position.x)}" and @data-locatorpro-y="${Math.round(position.y)}"]`,
                priority: 35,
                description: 'Position-based fallback',
                reliability: 0.3
            });
        }
    }

    /**
     * Generate XPath for element with enhanced tag anchoring
     */
    private generateXPath(element: Element): string {
        const parts: string[] = [];
        let currentElement: Element | null = element;

        while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
            let tagName = currentElement.tagName.toLowerCase();
            let index = 1;
            let sibling = currentElement.previousElementSibling;

            // Count siblings with same tag name
            while (sibling) {
                if (sibling.tagName.toLowerCase() === tagName) {
                    index++;
                }
                sibling = sibling.previousElementSibling;
            }

            // Use specific tag instead of generic //*
            const pathSegment = index > 1 ? `${tagName}[${index}]` : tagName;
            parts.unshift(pathSegment);

            currentElement = currentElement.parentElement;
        }

        return '//' + parts.join('/');
    }

    /**
     * Generate CSS path for element
     */
    private generateCssPath(element: Element): string {
        const parts: string[] = [];
        let currentElement: Element | null = element;

        while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
            let selector = currentElement.tagName.toLowerCase();

            if (currentElement.id) {
                selector += `#${currentElement.id}`;
                parts.unshift(selector);
                break;
            } else {
                let sibling = currentElement.previousElementSibling;
                let index = 1;

                while (sibling) {
                    if (sibling.tagName === currentElement.tagName) {
                        index++;
                    }
                    sibling = sibling.previousElementSibling;
                }

                if (index > 1) {
                    selector += `:nth-child(${index})`;
                }
            }

            parts.unshift(selector);
            currentElement = currentElement.parentElement;
        }

        return parts.join(' > ');
    }

    /**
     * Validate strategies by testing them in the DOM
     */
    private validateStrategies(strategies: LocatorStrategy[]): LocatorStrategy[] {
        return strategies.filter(strategy => {
            try {
                const result = this.testStrategy(strategy);
                strategy.isUnique = result.uniqueMatches === 1;
                return result.isValid && result.uniqueMatches <= 5; // Allow up to 5 matches
            } catch (error) {
                this.log('debug', `Strategy validation failed: ${strategy.selector}`, error);
                return false;
            }
        });
    }

    /**
     * Test a strategy to see if it's valid and unique
     */
    private testStrategy(strategy: LocatorStrategy): ValidationResult {
        let elements: Element[] = [];

        try {
            switch (strategy.type) {
                case 'xpath':
                    const xpathResult = document.evaluate(
                        strategy.selector,
                        document,
                        null,
                        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                        null
                    );
                    for (let i = 0; i < xpathResult.snapshotLength; i++) {
                        const node = xpathResult.snapshotItem(i);
                        if (node && node.nodeType === Node.ELEMENT_NODE) {
                            elements.push(node as Element);
                        }
                    }
                    break;
                case 'text':
                    // Handle Playwright-style text selectors
                    if (strategy.selector.startsWith('text=')) {
                        const text = strategy.selector.substring(5).replace(/"/g, '');
                        elements = Array.from(document.querySelectorAll('*')).filter(el =>
                            el.textContent?.trim() === text
                        );
                    } else if (strategy.selector.includes(':has-text(')) {
                        const tagMatch = strategy.selector.match(/^(\w+):has-text\("([^"]+)"\)$/);
                        if (tagMatch) {
                            const [, tag, text] = tagMatch;
                            if (tag && text) {
                                elements = Array.from(document.querySelectorAll(tag)).filter(el =>
                                    el.textContent?.includes(text)
                                );
                            }
                        }
                    }
                    break;
                default:
                    elements = Array.from(document.querySelectorAll(strategy.selector));
            }

            return {
                isValid: elements.length > 0,
                uniqueMatches: elements.length,
                strategy,
                elements
            };
        } catch (error) {
            return {
                isValid: false,
                uniqueMatches: 0,
                strategy
            };
        }
    }

    /**
     * Select the primary strategy from validated strategies
     */
    private selectPrimaryStrategy(strategies: LocatorStrategy[]): string {
        if (strategies.length === 0) return '';

        // Prefer unique strategies
        const uniqueStrategies = strategies.filter(s => s.isUnique);
        if (uniqueStrategies.length > 0) {
            return uniqueStrategies[0]!.selector;
        }

        // Fallback to highest priority
        return strategies[0]!.selector;
    }

    /**
     * Calculate confidence score
     */
    private calculateConfidence(strategies: LocatorStrategy[]): number {
        if (strategies.length === 0) return 0;

        let totalReliability = 0;
        let weightSum = 0;

        strategies.forEach(strategy => {
            const weight = strategy.isUnique ? 2 : 1;
            const reliability = strategy.reliability || 0.5;
            totalReliability += reliability * weight;
            weightSum += weight;
        });

        return weightSum > 0 ? totalReliability / weightSum : 0;
    }

    /**
     * Utility methods
     */
    private isTestLikeId(id: string): boolean {
        const testPatterns = ['test', 'qa', 'cypress', 'selenium', 'playwright', 'automation'];
        return testPatterns.some(pattern => id.toLowerCase().includes(pattern));
    }

    private isUtilityClass(className: string): boolean {
        const utilityPatterns = [
            /^(p|m)[trblxy]?-\d+$/, // Tailwind spacing
            /^text-(xs|sm|base|lg|xl|\d*xl)$/, // Tailwind text sizes
            /^(w|h)-\d+$/, // Tailwind width/height
            /^(bg|text|border)-\w+(-\d+)?$/, // Tailwind colors
            /^(flex|block|inline|hidden)$/, // Tailwind display
            /^[a-z0-9]{6,}$/ // Long random strings
        ];

        return utilityPatterns.some(pattern => pattern.test(className));
    }

    private selectBestClass(classes: string[]): string {
        // Prefer semantic classes over utility classes
        const semanticClasses = classes.filter(cls => !this.isUtilityClass(cls));
        if (semanticClasses.length > 0) {
            return semanticClasses[0]!;
        }
        return classes[0]!;
    }

    private getImplicitRole(tagName: string, attributes: Record<string, string>): string[] {
        const roleMap: Record<string, string[]> = {
            'button': ['button'],
            'a': attributes['href'] ? ['link'] : [],
            'input': this.getInputRole(attributes['type']),
            'select': ['combobox'],
            'textarea': ['textbox'],
            'img': ['img'],
            'nav': ['navigation'],
            'main': ['main'],
            'header': ['banner'],
            'footer': ['contentinfo'],
            'aside': ['complementary'],
            'section': ['region'],
            'article': ['article'],
            'h1': ['heading'],
            'h2': ['heading'],
            'h3': ['heading'],
            'h4': ['heading'],
            'h5': ['heading'],
            'h6': ['heading']
        };

        return roleMap[tagName] || [];
    }

    private getInputRole(type?: string): string[] {
        if (!type) return ['textbox'];

        const inputRoles: Record<string, string[]> = {
            'button': ['button'],
            'submit': ['button'],
            'reset': ['button'],
            'checkbox': ['checkbox'],
            'radio': ['radio'],
            'text': ['textbox'],
            'email': ['textbox'],
            'password': ['textbox'],
            'search': ['searchbox'],
            'tel': ['textbox'],
            'url': ['textbox'],
            'number': ['spinbutton'],
            'range': ['slider']
        };

        return inputRoles[type] || ['textbox'];
    }

    private log(level: LogLevel, message: string, ...args: any[]): void {
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };
        if (levels[level] >= levels[this.logLevel]) {
            console[level](`[LocatorPro] ${message}`, ...args);
        }
    }
}
