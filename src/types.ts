/**
 * Core types for the LocatorPro engine
 */

export interface LocatorStrategy {
    type: 'id' | 'data-testid' | 'aria-label' | 'text' | 'role' | 'css' | 'xpath';
    selector: string;
    priority: number;
    description: string;
    isUnique?: boolean;
    reliability?: number;
}

export interface ElementData {
    tagName: string;
    id?: string | undefined;
    className?: string | undefined;
    textContent?: string | undefined;
    attributes: Record<string, string>;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    xpath?: string | undefined;
    cssPath?: string | undefined;
}

export interface LocatorConfig {
    maxStrategies?: number;
    includeXPath?: boolean;
    includeCssPath?: boolean;
    prioritizeTestAttributes?: boolean;
    fallbackToPosition?: boolean;
    customAttributes?: string[];
}

export interface LocatorResult {
    strategies: LocatorStrategy[];
    primarySelector: string;
    confidence: number;
    elementData: ElementData;
}

export interface ValidationResult {
    isValid: boolean;
    uniqueMatches: number;
    strategy: LocatorStrategy;
    elements?: Element[];
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LocatorProOptions {
    logLevel?: LogLevel;
    config?: LocatorConfig;
    customStrategies?: Array<(element: Element) => LocatorStrategy[]>;
}
