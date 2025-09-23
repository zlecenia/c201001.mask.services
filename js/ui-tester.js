/* ====================
   frontend/js/ui-tester.js
   Comprehensive UI Testing and Hash Navigation
   ==================== */

class UITester {
    constructor() {
        this.testResults = [];
        this.currentTestSuite = null;
        this.interactiveElements = new Map();
        this.init();
    }

    init() {
        this.setupHashNavigation();
        this.catalogInteractiveElements();
        this.setupGlobalClickHandler();
        console.log('UI Tester initialized with', this.interactiveElements.size, 'interactive elements');
    }

    setupHashNavigation() {
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });

        // Handle initial hash if present
        if (window.location.hash) {
            this.handleHashChange();
        }
    }

    handleHashChange() {
        const hash = window.location.hash.substring(1); // Remove #
        if (hash) {
            console.log('Hash navigation to:', hash);
            const element = document.getElementById(hash);
            if (element) {
                this.highlightElement(element);
                this.logInteraction('hash-navigation', hash);
            }
        }
    }

    setupGlobalClickHandler() {
        document.addEventListener('click', (event) => {
            const element = event.target;
            if (this.isInteractiveElement(element)) {
                this.handleInteractiveClick(element, event);
            }
        });
    }

    handleInteractiveClick(element, event) {
        const elementId = element.id || this.generateElementId(element);
        
        // Update URL hash
        if (elementId && !window.location.hash.includes(elementId)) {
            window.location.hash = elementId;
        }

        // Log the interaction
        this.logInteraction('click', elementId, {
            tagName: element.tagName,
            className: element.className,
            textContent: element.textContent?.substring(0, 50),
            type: element.type
        });

        // Highlight the clicked element
        this.highlightElement(element);
    }

    catalogInteractiveElements() {
        // Find all interactive elements and ensure they have IDs
        const selectors = [
            'button',
            'input',
            'select',
            'textarea',
            'a[href]',
            '[onclick]',
            '[role="button"]',
            '.keyboard-key',
            '.menu-item',
            '.btn'
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                let elementId = element.id;
                
                if (!elementId) {
                    elementId = this.generateElementId(element);
                    element.id = elementId;
                }

                this.interactiveElements.set(elementId, {
                    element: element,
                    selector: selector,
                    tagName: element.tagName,
                    className: element.className,
                    textContent: element.textContent?.substring(0, 30),
                    hasOnClick: !!element.onclick || !!element.getAttribute('onclick')
                });
            });
        });
    }

    generateElementId(element) {
        // Generate a meaningful ID based on element properties
        let id = '';
        
        if (element.textContent) {
            id = element.textContent
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 20);
        }
        
        if (!id && element.className) {
            id = element.className.split(' ')[0];
        }
        
        if (!id) {
            id = element.tagName.toLowerCase();
        }
        
        // Add suffix if ID already exists
        let counter = 1;
        let finalId = id;
        while (document.getElementById(finalId)) {
            finalId = `${id}-${counter}`;
            counter++;
        }
        
        return finalId;
    }

    isInteractiveElement(element) {
        return element.tagName === 'BUTTON' ||
               element.tagName === 'INPUT' ||
               element.tagName === 'SELECT' ||
               element.tagName === 'TEXTAREA' ||
               element.tagName === 'A' ||
               element.hasAttribute('onclick') ||
               element.getAttribute('role') === 'button' ||
               element.classList.contains('keyboard-key') ||
               element.classList.contains('menu-item') ||
               element.classList.contains('btn');
    }

    highlightElement(element) {
        // Remove previous highlights
        document.querySelectorAll('.ui-test-highlight').forEach(el => {
            el.classList.remove('ui-test-highlight');
        });

        // Add highlight to current element
        element.classList.add('ui-test-highlight');
        
        // Remove highlight after 2 seconds
        setTimeout(() => {
            element.classList.remove('ui-test-highlight');
        }, 2000);
    }

    logInteraction(type, elementId, details = {}) {
        const interaction = {
            timestamp: new Date().toISOString(),
            type: type,
            elementId: elementId,
            url: window.location.href,
            details: details
        };

        this.testResults.push(interaction);
        console.log('UI Interaction:', interaction);
    }

    // Test Suite Methods
    runFormTests() {
        console.log('🧪 Running Form Tests...');
        this.currentTestSuite = 'form-tests';
        
        const testCases = [
            () => this.testPasswordInput(),
            () => this.testVirtualKeyboard(),
            () => this.testLoginButtons(),
            () => this.testPasswordVisibilityToggle()
        ];

        this.executeTestSuite(testCases);
    }

    testPasswordInput() {
        console.log('Testing password input...');
        const passwordInput = document.getElementById('password-input');
        
        if (passwordInput) {
            // Test typing
            passwordInput.focus();
            passwordInput.value = 'test123';
            passwordInput.dispatchEvent(new Event('input'));
            
            this.logInteraction('test', 'password-input', {
                action: 'type',
                value: passwordInput.value,
                success: passwordInput.value === 'test123'
            });
            
            return true;
        }
        return false;
    }

    testVirtualKeyboard() {
        console.log('Testing virtual keyboard...');
        const keyboardKeys = document.querySelectorAll('.keyboard-key');
        let testCount = 0;
        
        keyboardKeys.forEach((key, index) => {
            if (index < 5) { // Test first 5 keys
                setTimeout(() => {
                    key.click();
                    testCount++;
                    this.logInteraction('test', key.id || `keyboard-key-${index}`, {
                        action: 'virtual-keyboard-click',
                        success: true
                    });
                }, index * 500);
            }
        });
        
        return testCount > 0;
    }

    testLoginButtons() {
        console.log('Testing login buttons...');
        const loginButtons = [
            'login-operator-btn',
            'login-admin-btn', 
            'login-superuser-btn',
            'login-serwisant-btn'
        ];
        
        let testCount = 0;
        loginButtons.forEach((buttonId, index) => {
            const button = document.getElementById(buttonId);
            if (button) {
                setTimeout(() => {
                    // Set a test password first
                    const passwordInput = document.getElementById('password-input');
                    if (passwordInput) {
                        passwordInput.value = 'test123';
                    }
                    
                    // Click the login button
                    button.click();
                    testCount++;
                    
                    this.logInteraction('test', buttonId, {
                        action: 'login-test',
                        role: button.textContent,
                        success: true
                    });
                }, index * 2000); // Delay between tests
            }
        });
        
        return testCount > 0;
    }

    testPasswordVisibilityToggle() {
        console.log('Testing password visibility toggle...');
        const toggleButton = document.querySelector('.toggle-password');
        const passwordInput = document.getElementById('password-input');
        
        if (toggleButton && passwordInput) {
            const initialType = passwordInput.type;
            toggleButton.click();
            const newType = passwordInput.type;
            
            this.logInteraction('test', 'password-visibility-toggle', {
                action: 'toggle-visibility',
                initialType: initialType,
                newType: newType,
                success: initialType !== newType
            });
            
            return initialType !== newType;
        }
        return false;
    }

    executeTestSuite(testCases) {
        let passed = 0;
        let failed = 0;
        
        testCases.forEach((testCase, index) => {
            setTimeout(() => {
                try {
                    const result = testCase();
                    if (result) {
                        passed++;
                        console.log(`✅ Test ${index + 1} passed`);
                    } else {
                        failed++;
                        console.log(`❌ Test ${index + 1} failed`);
                    }
                } catch (error) {
                    failed++;
                    console.error(`❌ Test ${index + 1} error:`, error);
                }
                
                if (index === testCases.length - 1) {
                    console.log(`🏁 Test suite completed: ${passed} passed, ${failed} failed`);
                }
            }, index * 1000);
        });
    }

    // Utility methods for manual testing
    clickAllButtons() {
        console.log('🎯 Clicking all buttons sequentially...');
        const buttons = Array.from(document.querySelectorAll('button'));
        
        buttons.forEach((button, index) => {
            setTimeout(() => {
                if (button.offsetParent !== null) { // Only visible buttons
                    button.click();
                    console.log(`Clicked button ${index + 1}/${buttons.length}:`, button.textContent);
                }
            }, index * 1000);
        });
    }

    fillAllForms() {
        console.log('📝 Filling all form fields...');
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach((input) => {
            if (input.type === 'password' || input.type === 'text') {
                input.value = 'test-value-' + Math.random().toString(36).substr(2, 5);
                input.dispatchEvent(new Event('input'));
            } else if (input.type === 'checkbox') {
                input.checked = true;
                input.dispatchEvent(new Event('change'));
            } else if (input.tagName === 'SELECT') {
                if (input.options.length > 0) {
                    input.selectedIndex = 1;
                    input.dispatchEvent(new Event('change'));
                }
            }
        });
    }

    generateTestReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalInteractions: this.testResults.length,
            interactiveElements: this.interactiveElements.size,
            interactions: this.testResults,
            elementCatalog: Array.from(this.interactiveElements.entries())
        };
        
        console.log('📊 UI Test Report:', report);
        return report;
    }

    exportTestResults() {
        const report = this.generateTestReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ui-test-results-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Auto-initialize and expose globally
let uiTester;
document.addEventListener('DOMContentLoaded', () => {
    uiTester = new UITester();
    window.uiTester = uiTester;
    
    // Add test controls to console
    console.log('🧪 UI Tester loaded! Available commands:');
    console.log('- uiTester.runFormTests() - Run automated form tests');
    console.log('- uiTester.clickAllButtons() - Click all buttons sequentially');
    console.log('- uiTester.fillAllForms() - Fill all form fields');
    console.log('- uiTester.generateTestReport() - Generate test report');
    console.log('- uiTester.exportTestResults() - Export results as JSON');
});

export default UITester;
