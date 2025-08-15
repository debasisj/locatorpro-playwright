#!/usr/bin/env node

/**
 * LocatorPro Demo Script
 * 
 * This script demonstrates the core functionality of the LocatorPro locator engine
 * in a Node.js environment without requiring a browser.
 */

const { LocatorEngine } = require('./dist/locator-engine');

// Mock DOM environment for demonstration
const mockElement = {
    tagName: 'BUTTON',
    id: 'submit-btn',
    className: 'btn btn-primary submit-button',
    textContent: 'Submit Form',
    attributes: {
        length: 4,
        0: { name: 'data-testid', value: 'submit-button' },
        1: { name: 'type', value: 'submit' },
        2: { name: 'aria-label', value: 'Submit the form' },
        3: { name: 'class', value: 'btn btn-primary submit-button' }
    },
    getBoundingClientRect: () => ({
        x: 100,
        y: 200,
        width: 80,
        height: 32
    }),
    parentElement: {
        tagName: 'FORM',
        parentElement: {
            tagName: 'DIV',
            parentElement: {
                tagName: 'BODY',
                parentElement: null
            }
        }
    },
    previousElementSibling: null
};

// Mock global DOM objects
global.document = {
    evaluate: () => ({
        snapshotLength: 1,
        snapshotItem: () => mockElement
    }),
    querySelectorAll: () => [mockElement]
};

global.Node = {
    ELEMENT_NODE: 1
};

function runDemo() {
    console.log('🎯 LocatorPro Playwright Demo\n');
    console.log('='.repeat(50));

    // Create engine with default configuration
    const engine = new LocatorEngine();

    console.log('\n📊 Element Analysis:');
    console.log('Element:', `<${mockElement.tagName.toLowerCase()} id="${mockElement.id}" class="${mockElement.className}" data-testid="submit-button">Submit Form</button>`);

    // Generate selectors
    const result = engine.generateSelectors(mockElement);

    console.log('\n🔍 Generated Strategies:');
    console.log(`Total strategies: ${result.strategies.length}`);
    console.log(`Primary selector: ${result.primarySelector}`);
    console.log(`Confidence score: ${(result.confidence * 100).toFixed(1)}%`);

    console.log('\n📋 Strategy Details:');
    result.strategies.slice(0, 10).forEach((strategy, index) => {
        console.log(`${index + 1}. [Priority ${strategy.priority}] ${strategy.type.toUpperCase()}: ${strategy.selector}`);
        console.log(`   └─ ${strategy.description} (${(strategy.reliability * 100).toFixed(0)}% reliable)`);
    });

    console.log('\n📈 Element Data Captured:');
    console.log(`Tag Name: ${result.elementData.tagName}`);
    console.log(`ID: ${result.elementData.id}`);
    console.log(`Classes: ${result.elementData.className}`);
    console.log(`Text Content: ${result.elementData.textContent}`);
    console.log(`Position: ${result.elementData.position.x}x${result.elementData.position.y} (${result.elementData.position.width}×${result.elementData.position.height})`);
    console.log(`XPath: ${result.elementData.xpath}`);
    console.log(`CSS Path: ${result.elementData.cssPath}`);

    console.log('\n🎛️  Configuration Demo:');

    // Demo with custom configuration
    const customEngine = new LocatorEngine({
        maxStrategies: 5,
        includeXPath: false,
        customAttributes: ['data-automation', 'data-qa-id']
    });

    const customResult = customEngine.generateSelectors(mockElement);
    console.log(`Custom config - Strategies: ${customResult.strategies.length}, Primary: ${customResult.primarySelector}`);

    console.log('\n✅ Demo Complete!');
    console.log('\nNext Steps:');
    console.log('1. Install: npm install @locatorpro/playwright');
    console.log('2. Import: import { SmartLocator } from "@locatorpro/playwright"');
    console.log('3. Use: const smartLocator = new SmartLocator(page)');
    console.log('4. Find: await smartLocator.findByTestId("submit-button")');

    console.log('\n🔗 Learn More:');
    console.log('📖 Documentation: https://github.com/locatorpro/playwright');
    console.log('🐛 Issues: https://github.com/locatorpro/playwright/issues');
    console.log('💬 Discussions: https://github.com/locatorpro/playwright/discussions');
}

// Run the demo
if (require.main === module) {
    runDemo();
}

module.exports = { runDemo };
