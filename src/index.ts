/**
 * @locatorpro/playwright - Self-healing locators for Playwright
 * 
 * A sophisticated locator generation system that creates robust, self-healing
 * element selectors for Playwright test automation.
 */

export { SmartLocator } from './smart-locator';
export { LocatorEngine } from './locator-engine';
export * from './types';

// Re-export for convenience
import { SmartLocator } from './smart-locator';
export default SmartLocator;
