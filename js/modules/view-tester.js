/**
 * MASKSERVICE C20 - View Tester Module
 * Comprehensive testing tool for all application views and templates
 * Tests content availability, interactive elements, and generates detailed reports
 */

class ViewTester {
    constructor() {
        this.testResults = [];
        this.currentTest = null;
        this.testStartTime = null;
        this.templates = [
            'login-screen',
            'system-screen', 
            'user-menu-screen',
            'test-menu-template',
            'device-select-template',
            'workshop-template',
            'user-data-template',
            'device-data-template',
            'test-reports-template',
            'users-template',
            'service-menu-template',
            'system-settings-template',
            'device-history-template',
            'reports-view-template',
            'reports-batch-template',
            'realtime-sensors-template',
            'reports-schedule-template',
            'workshop-parts-template',
            'workshop-maintenance-template',
            'workshop-tools-template',
            'workshop-inventory-template'
        ];
        
        this.menuOptions = [
            'user_data',
            'realtime_sensors', 
            'reports_view',
            'reports_batch',
            'reports_schedule',
            'workshop_parts',
            'workshop_maintenance',
            'workshop_tools',
            'workshop_inventory',
            'users',
            'service_menu',
            'settings_scenarios',
            'settings_integration',
            'settings_standards',
            'settings_system'
        ];

        this.init();
    }

    init() {
        console.log('🧪 ViewTester initialized');
        this.createTestInterface();
    }

    createTestInterface() {
        // Create test panel if it doesn't exist
        if (!document.getElementById('view-tester-panel')) {
            const panel = document.createElement('div');
            panel.id = 'view-tester-panel';
            panel.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                width: 300px;
                background: #2c3e50;
                color: white;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: monospace;
                font-size: 12px;
                max-height: 80vh;
                overflow-y: auto;
                display: none;
            `;
            
            panel.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: #3498db;">🧪 View Tester</h3>
                    <button onclick="viewTester.hidePanel()" style="background: #e74c3c; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer;">×</button>
                </div>
                <div style="margin-bottom: 10px;">
                    <button onclick="viewTester.runAllTests()" style="background: #27ae60; color: white; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; width: 100%; margin-bottom: 5px;">Run All Tests</button>
                    <button onclick="viewTester.testCurrentView()" style="background: #f39c12; color: white; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; width: 100%; margin-bottom: 5px;">Test Current View</button>
                    <button onclick="viewTester.testMenuNavigation()" style="background: #9b59b6; color: white; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; width: 100%; margin-bottom: 5px;">Test Menu Navigation</button>
                    <button onclick="viewTester.generateReport()" style="background: #34495e; color: white; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; width: 100%;">Generate Report</button>
                </div>
                <div id="test-progress" style="margin-bottom: 10px; display: none;">
                    <div style="background: #34495e; border-radius: 4px; padding: 4px;">
                        <div id="progress-bar" style="background: #3498db; height: 8px; border-radius: 4px; width: 0%; transition: width 0.3s;"></div>
                    </div>
                    <div id="progress-text" style="margin-top: 5px; font-size: 11px;">Ready to test...</div>
                </div>
                <div id="test-results" style="max-height: 300px; overflow-y: auto; font-size: 10px;"></div>
            `;
            
            document.body.appendChild(panel);
        }
    }

    showPanel() {
        const panel = document.getElementById('view-tester-panel');
        if (panel) {
            panel.style.display = 'block';
        }
    }

    hidePanel() {
        const panel = document.getElementById('view-tester-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }

    updateProgress(current, total, message) {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const progressContainer = document.getElementById('test-progress');
        
        if (progressContainer) progressContainer.style.display = 'block';
        if (progressBar) progressBar.style.width = `${(current / total) * 100}%`;
        if (progressText) progressText.textContent = message;
    }

    logResult(message, type = 'info') {
        const resultsDiv = document.getElementById('test-results');
        if (resultsDiv) {
            const colors = {
                'success': '#27ae60',
                'error': '#e74c3c', 
                'warning': '#f39c12',
                'info': '#3498db'
            };
            
            const logEntry = document.createElement('div');
            logEntry.style.cssText = `
                margin-bottom: 2px;
                padding: 4px;
                border-left: 3px solid ${colors[type]};
                background: rgba(255,255,255,0.05);
            `;
            logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
            resultsDiv.appendChild(logEntry);
            resultsDiv.scrollTop = resultsDiv.scrollHeight;
        }
        
        console.log(`🧪 ViewTester [${type.toUpperCase()}]: ${message}`);
    }

    async runAllTests() {
        this.testStartTime = Date.now();
        this.testResults = [];
        this.showPanel();
        
        this.logResult('Starting comprehensive view testing...', 'info');
        
        // Test 1: Template Availability
        await this.testTemplateAvailability();
        
        // Test 2: Menu Navigation
        await this.testMenuNavigation();
        
        // Test 3: Interactive Elements
        await this.testInteractiveElements();
        
        // Test 4: Content Validation
        await this.testContentValidation();
        
        // Test 5: Localization
        await this.testLocalization();
        
        this.generateReport();
        this.logResult('All tests completed!', 'success');
    }

    async testTemplateAvailability() {
        this.logResult('Testing template availability...', 'info');
        let passedCount = 0;
        
        for (let i = 0; i < this.templates.length; i++) {
            const templateId = this.templates[i];
            this.updateProgress(i + 1, this.templates.length, `Testing template: ${templateId}`);
            
            const template = document.getElementById(templateId);
            if (template) {
                const hasContent = template.innerHTML.trim().length > 0;
                
                if (hasContent) {
                    this.logResult(`✅ Template ${templateId}: Available (${template.innerHTML.length} chars)`, 'success');
                    passedCount++;
                    this.testResults.push({
                        test: 'Template Availability',
                        item: templateId,
                        status: 'PASS',
                        details: `Content length: ${template.innerHTML.length} characters`
                    });
                } else {
                    this.logResult(`❌ Template ${templateId}: Empty content`, 'error');
                    this.testResults.push({
                        test: 'Template Availability',
                        item: templateId,
                        status: 'FAIL',
                        details: 'Template exists but has no content'
                    });
                }
            } else {
                this.logResult(`❌ Template ${templateId}: Not found`, 'error');
                this.testResults.push({
                    test: 'Template Availability',
                    item: templateId,
                    status: 'FAIL',
                    details: 'Template element not found in DOM'
                });
            }
            
            await this.sleep(50); // Small delay for visual feedback
        }
        
        this.logResult(`Template test completed: ${passedCount}/${this.templates.length} passed`, 'info');
    }

    async testMenuNavigation() {
        this.logResult('Testing menu navigation...', 'info');
        let passedCount = 0;
        
        // First ensure we're logged in
        const loginAsOperator = () => {
            if (window.mockLogin) {
                window.mockLogin('OPERATOR');
                return true;
            }
            return false;
        };
        
        if (loginAsOperator()) {
            await this.sleep(1000); // Wait for login to complete
        }
        
        for (let i = 0; i < this.menuOptions.length; i++) {
            const menuOption = this.menuOptions[i];
            this.updateProgress(i + 1, this.menuOptions.length, `Testing menu: ${menuOption}`);
            
            try {
                if (window.MenuManager?.selectMenuOption) {
                    // Capture any errors during menu selection
                    const originalConsoleError = console.error;
                    let errorCaught = null;
                    
                    console.error = (message) => {
                        if (message.includes('Template not found') || message.includes('not found')) {
                            errorCaught = message;
                        }
                        originalConsoleError(message);
                    };
                    
                    window.MenuManager.selectMenuOption(menuOption);
                    await this.sleep(200);
                    
                    console.error = originalConsoleError;
                    
                    if (errorCaught) {
                        this.logResult(`❌ Menu ${menuOption}: ${errorCaught}`, 'error');
                        this.testResults.push({
                            test: 'Menu Navigation',
                            item: menuOption,
                            status: 'FAIL',
                            details: errorCaught
                        });
                    } else {
                        this.logResult(`✅ Menu ${menuOption}: Navigation successful`, 'success');
                        passedCount++;
                        this.testResults.push({
                            test: 'Menu Navigation',
                            item: menuOption,
                            status: 'PASS',
                            details: 'Menu navigation completed without errors'
                        });
                    }
                } else {
                    this.logResult(`❌ Menu ${menuOption}: MenuManager not available`, 'error');
                    this.testResults.push({
                        test: 'Menu Navigation',
                        item: menuOption,
                        status: 'FAIL',
                        details: 'MenuManager not available'
                    });
                }
            } catch (error) {
                this.logResult(`❌ Menu ${menuOption}: ${error.message}`, 'error');
                this.testResults.push({
                    test: 'Menu Navigation',
                    item: menuOption,
                    status: 'FAIL',
                    details: error.message
                });
            }
            
            await this.sleep(100);
        }
        
        this.logResult(`Menu navigation test completed: ${passedCount}/${this.menuOptions.length} passed`, 'info');
    }

    async testInteractiveElements() {
        this.logResult('Testing interactive elements...', 'info');
        
        const buttons = document.querySelectorAll('button[onclick], .menu-item[onclick], .btn');
        
        let buttonCount = 0;
        let workingButtons = 0;
        
        buttons.forEach(button => {
            buttonCount++;
            const onclick = button.getAttribute('onclick');
            const hasValidOnclick = onclick && onclick.trim().length > 0;
            
            if (hasValidOnclick) {
                workingButtons++;
            }
        });
        
        this.logResult(`Interactive elements: ${workingButtons}/${buttonCount} buttons have onclick handlers`, 'info');
        this.testResults.push({
            test: 'Interactive Elements',
            item: 'Buttons',
            status: workingButtons === buttonCount ? 'PASS' : 'PARTIAL',
            details: `${workingButtons}/${buttonCount} buttons have onclick handlers`
        });
    }

    async testContentValidation() {
        this.logResult('Testing content validation...', 'info');
        
        // Test for common content elements
        const contentTests = [
            { selector: 'h1, h2, h3', name: 'Headers' },
            { selector: 'button', name: 'Buttons' },
            { selector: 'input', name: 'Input fields' },
            { selector: '[data-i18n]', name: 'Translatable elements' },
            { selector: '.menu-item', name: 'Menu items' },
            { selector: '.btn', name: 'Button elements' }
        ];
        
        contentTests.forEach(test => {
            const elements = document.querySelectorAll(test.selector);
            this.logResult(`Content: ${elements.length} ${test.name} found`, 'info');
            this.testResults.push({
                test: 'Content Validation',
                item: test.name,
                status: elements.length > 0 ? 'PASS' : 'FAIL',
                details: `${elements.length} elements found`
            });
        });
    }

    async testLocalization() {
        this.logResult('Testing localization...', 'info');
        
        const i18nElements = document.querySelectorAll('[data-i18n]');
        const untranslatedElements = [];
        
        i18nElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = element.textContent.trim();
            
            // Check if element still contains the translation key (indicates missing translation)
            if (text === key || text.includes('{{') || text.includes('}}')) {
                untranslatedElements.push({ element, key, text });
            }
        });
        
        if (untranslatedElements.length === 0) {
            this.logResult(`✅ Localization: All ${i18nElements.length} elements translated`, 'success');
            this.testResults.push({
                test: 'Localization',
                item: 'Translation completeness',
                status: 'PASS',
                details: `${i18nElements.length} elements properly translated`
            });
        } else {
            this.logResult(`⚠️ Localization: ${untranslatedElements.length} untranslated elements`, 'warning');
            this.testResults.push({
                test: 'Localization',
                item: 'Translation completeness',
                status: 'PARTIAL',
                details: `${untranslatedElements.length}/${i18nElements.length} elements need translation`
            });
        }
    }

    testCurrentView() {
        this.showPanel();
        this.logResult('Testing current view...', 'info');
        
        const activeScreen = document.querySelector('.screen.active, .screen[style*="block"]');
        if (activeScreen) {
            const screenId = activeScreen.id;
            this.logResult(`Current view: ${screenId}`, 'info');
            
            // Test current view content
            const buttons = activeScreen.querySelectorAll('button, .btn');
            const inputs = activeScreen.querySelectorAll('input, select, textarea');
            const i18nElements = activeScreen.querySelectorAll('[data-i18n]');
            
            this.logResult(`View content: ${buttons.length} buttons, ${inputs.length} inputs, ${i18nElements.length} translatable elements`, 'info');
        } else {
            this.logResult('No active view found', 'warning');
        }
    }

    generateReport() {
        const endTime = Date.now();
        const duration = this.testStartTime ? (endTime - this.testStartTime) / 1000 : 0;
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
        const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
        const partialTests = this.testResults.filter(r => r.status === 'PARTIAL').length;
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: `${duration.toFixed(2)}s`,
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                partial: partialTests,
                successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) + '%' : '0%'
            },
            results: this.testResults
        };
        
        console.log('🧪 VIEW TESTER REPORT:', report);
        
        this.logResult(`📊 Test Report: ${passedTests}/${totalTests} passed (${report.summary.successRate})`, 'info');
        this.logResult(`⏱️ Duration: ${duration.toFixed(2)}s`, 'info');
        
        // Save report to localStorage for later access
        localStorage.setItem('viewTesterReport', JSON.stringify(report));
        
        return report;
    }

    exportReport() {
        const report = this.generateReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `view-tester-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize ViewTester
const viewTester = new ViewTester();

// Add keyboard shortcut to toggle tester
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        const panel = document.getElementById('view-tester-panel');
        if (panel) {
            if (panel.style.display === 'none') {
                viewTester.showPanel();
            } else {
                viewTester.hidePanel();
            }
        }
    }
});

// Export to global scope
window.ViewTester = ViewTester;
window.viewTester = viewTester;

console.log('✅ ViewTester Module loaded - Press Ctrl+Shift+T to open test panel');
