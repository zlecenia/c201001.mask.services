/**
 * MASKSERVICE C20 - Template Loading Validator
 * Comprehensive validation system to verify template loading and router state changes
 * Optimized for 400x1280px LCD touchscreen interface
 */

class TemplateValidator {
    constructor() {
        this.validationHistory = [];
        this.routerHistory = [];
        this.templateLoadEvents = [];
        this.menuClickHistory = [];
        
        this.init();
    }
    
    init() {
        console.log('🔍 TemplateValidator initialized');
        
        // Listen for router changes
        this.setupRouterMonitoring();
        
        // Listen for template load events
        this.setupTemplateMonitoring();
        
        // Monitor menu interactions
        this.setupMenuMonitoring();
    }
    
    /**
     * Setup router state monitoring
     */
    setupRouterMonitoring() {
        // Monitor hash changes
        window.addEventListener('hashchange', (event) => {
            const routerState = {
                timestamp: new Date().toISOString(),
                oldURL: event.oldURL,
                newURL: event.newURL,
                hash: window.location.hash,
                triggered: 'hashchange'
            };
            
            this.routerHistory.push(routerState);
            console.log('📍 Router state changed:', routerState);
        });
        
        // Monitor popstate events
        window.addEventListener('popstate', (event) => {
            const routerState = {
                timestamp: new Date().toISOString(),
                state: event.state,
                hash: window.location.hash,
                triggered: 'popstate'
            };
            
            this.routerHistory.push(routerState);
            console.log('📍 Router popstate:', routerState);
        });
    }
    
    /**
     * Setup template loading monitoring
     */
    setupTemplateMonitoring() {
        // Listen for custom template load events
        document.addEventListener('viewLoaded', (event) => {
            const loadEvent = {
                timestamp: new Date().toISOString(),
                viewId: event.detail.viewId,
                element: event.detail.element,
                loadTime: Date.now() - (event.detail.startTime || Date.now())
            };
            
            this.templateLoadEvents.push(loadEvent);
            console.log('📄 Template loaded:', loadEvent);
        });
    }
    
    /**
     * Setup menu interaction monitoring
     */
    setupMenuMonitoring() {
        // Override MenuManager.selectMenuOption to add validation
        if (window.MenuManager && window.MenuManager.selectMenuOption) {
            const originalSelectMenuOption = window.MenuManager.selectMenuOption.bind(window.MenuManager);
            
            window.MenuManager.selectMenuOption = async (optionKey) => {
                const clickEvent = {
                    timestamp: new Date().toISOString(),
                    optionKey: optionKey,
                    beforeHash: window.location.hash,
                    beforeContent: this.getCurrentMenuContent()
                };
                
                console.log('🎯 Menu option clicked:', optionKey);
                
                try {
                    // Call original function
                    const result = await originalSelectMenuOption(optionKey);
                    
                    // Wait a bit for changes to take effect
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    clickEvent.afterHash = window.location.hash;
                    clickEvent.afterContent = this.getCurrentMenuContent();
                    clickEvent.success = result;
                    clickEvent.routerChanged = clickEvent.beforeHash !== clickEvent.afterHash;
                    clickEvent.contentChanged = clickEvent.beforeContent !== clickEvent.afterContent;
                    
                    this.menuClickHistory.push(clickEvent);
                    
                    // Validate the result
                    this.validateMenuAction(clickEvent);
                    
                    return result;
                } catch (error) {
                    clickEvent.error = error.message;
                    clickEvent.success = false;
                    this.menuClickHistory.push(clickEvent);
                    console.error('❌ Menu action failed:', error);
                    throw error;
                }
            };
        }
    }
    
    /**
     * Get current menu content for comparison
     */
    getCurrentMenuContent() {
        const menuContent = document.getElementById('menu-content');
        if (!menuContent) return '';
        
        return {
            innerHTML: menuContent.innerHTML.substring(0, 200) + '...', // First 200 chars
            length: menuContent.innerHTML.length,
            hasContent: menuContent.innerHTML.trim().length > 0,
            visibleElements: menuContent.querySelectorAll('*:not([style*="display: none"])').length
        };
    }
    
    /**
     * Validate menu action results
     */
    validateMenuAction(clickEvent) {
        console.log('🔍 Validating menu action:', clickEvent.optionKey);
        
        const validation = {
            timestamp: new Date().toISOString(),
            optionKey: clickEvent.optionKey,
            tests: {}
        };
        
        // Test 1: Did router change?
        validation.tests.routerChanged = {
            passed: clickEvent.routerChanged,
            details: `Hash: ${clickEvent.beforeHash} → ${clickEvent.afterHash}`
        };
        
        // Test 2: Did content change?
        validation.tests.contentChanged = {
            passed: clickEvent.contentChanged,
            details: `Content: ${clickEvent.beforeContent.length} → ${clickEvent.afterContent.length} chars`
        };
        
        // Test 3: Is there actual content now?
        validation.tests.hasContent = {
            passed: clickEvent.afterContent.hasContent,
            details: `Content length: ${clickEvent.afterContent.length}, Elements: ${clickEvent.afterContent.visibleElements}`
        };
        
        // Test 4: No error occurred?
        validation.tests.noError = {
            passed: !clickEvent.error,
            details: clickEvent.error || 'No errors'
        };
        
        // Test 5: Check if expected template is loaded
        const expectedTemplate = this.getExpectedTemplate(clickEvent.optionKey);
        validation.tests.expectedTemplate = {
            passed: this.isTemplateLoaded(expectedTemplate),
            details: `Expected: ${expectedTemplate}, Found: ${this.getLoadedTemplate()}`
        };
        
        // Overall validation result
        const passedTests = Object.values(validation.tests).filter(test => test.passed).length;
        const totalTests = Object.keys(validation.tests).length;
        validation.overallSuccess = passedTests === totalTests;
        validation.successRate = `${passedTests}/${totalTests}`;
        
        this.validationHistory.push(validation);
        
        // Log results
        if (validation.overallSuccess) {
            console.log(`✅ Menu action validated: ${clickEvent.optionKey} (${validation.successRate})`);
        } else {
            console.log(`❌ Menu action failed validation: ${clickEvent.optionKey} (${validation.successRate})`);
            console.log('Failed tests:', Object.entries(validation.tests)
                .filter(([key, test]) => !test.passed)
                .map(([key, test]) => `${key}: ${test.details}`)
            );
        }
        
        return validation;
    }
    
    /**
     * Get expected template ID for menu option
     */
    getExpectedTemplate(optionKey) {
        const templateMap = {
            'user_data': 'user-data-template',
            'realtime_sensors': 'realtime-sensors-template',
            'reports_view': 'reports-view-template',
            'reports_batch': 'reports-batch-template',
            'reports_schedule': 'reports-schedule-template',
            'workshop_parts': 'workshop-parts-template',
            'workshop_maintenance': 'workshop-maintenance-template',
            'workshop_tools': 'workshop-tools-template',
            'workshop_inventory': 'workshop-inventory-template',
            'users': 'users-template',
            'service_menu': 'service-menu-template',
            'settings_scenarios': 'system-settings-template',
            'settings_integration': 'system-settings-template',
            'settings_standards': 'system-settings-template',
            'settings_system': 'system-settings-template'
        };
        
        return templateMap[optionKey] || 'unknown-template';
    }
    
    /**
     * Check if specific template is loaded in DOM
     */
    isTemplateLoaded(templateId) {
        if (!templateId || templateId === 'unknown-template') return false;
        
        const menuContent = document.getElementById('menu-content');
        if (!menuContent) return false;
        
        // Check if menu content contains template-specific elements
        const templateIndicators = {
            'user-data-template': '.user-info-grid, .info-card',
            'realtime-sensors-template': '.sensors-container, .sensor-grid',
            'reports-view-template': '.reports-summary, .summary-card',
            'workshop-parts-template': '.parts-container, .search-filter',
            'users-template': '.users-list, .user-item',
            'service-menu-template': '.service-grid, .service-card',
            'system-settings-template': '.settings-grid, .setting-group'
        };
        
        const indicators = templateIndicators[templateId];
        if (indicators) {
            const selectors = indicators.split(', ');
            return selectors.some(selector => menuContent.querySelector(selector) !== null);
        }
        
        return menuContent.innerHTML.includes(templateId.replace('-template', ''));
    }
    
    /**
     * Get currently loaded template name
     */
    getLoadedTemplate() {
        const menuContent = document.getElementById('menu-content');
        if (!menuContent || !menuContent.innerHTML.trim()) return 'none';
        
        // Try to identify template by its content
        const content = menuContent.innerHTML;
        
        if (content.includes('user-info-grid')) return 'user-data-template';
        if (content.includes('sensors-container')) return 'realtime-sensors-template';  
        if (content.includes('reports-summary')) return 'reports-view-template';
        if (content.includes('parts-container')) return 'workshop-parts-template';
        if (content.includes('users-list')) return 'users-template';
        if (content.includes('service-grid')) return 'service-menu-template';
        if (content.includes('settings-grid')) return 'system-settings-template';
        
        return 'unknown';
    }
    
    /**
     * Generate comprehensive validation report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalMenuClicks: this.menuClickHistory.length,
                successfulClicks: this.menuClickHistory.filter(click => click.success).length,
                routerChanges: this.routerHistory.length,
                templateLoads: this.templateLoadEvents.length,
                validations: this.validationHistory.length,
                successfulValidations: this.validationHistory.filter(v => v.overallSuccess).length
            },
            recentHistory: {
                menuClicks: this.menuClickHistory.slice(-10),
                routerChanges: this.routerHistory.slice(-10),
                validations: this.validationHistory.slice(-10)
            },
            failedActions: this.validationHistory.filter(v => !v.overallSuccess),
            recommendations: this.generateRecommendations()
        };
        
        console.log('📊 TEMPLATE VALIDATION REPORT:', report);
        return report;
    }
    
    /**
     * Generate recommendations based on validation history
     */
    generateRecommendations() {
        const recommendations = [];
        
        const failedValidations = this.validationHistory.filter(v => !v.overallSuccess);
        const routerIssues = failedValidations.filter(v => !v.tests.routerChanged?.passed);
        const contentIssues = failedValidations.filter(v => !v.tests.hasContent?.passed);
        const templateIssues = failedValidations.filter(v => !v.tests.expectedTemplate?.passed);
        
        if (routerIssues.length > 0) {
            recommendations.push('🔄 Router not updating URL - check router integration');
        }
        
        if (contentIssues.length > 0) {
            recommendations.push('📄 Templates not loading content - check ViewLoader');
        }
        
        if (templateIssues.length > 0) {
            recommendations.push('🎯 Wrong templates loading - check menu option mapping');
        }
        
        return recommendations;
    }
    
    /**
     * Test specific menu option manually
     */
    async testMenuOption(optionKey) {
        console.log(`🧪 Manual test: ${optionKey}`);
        
        if (!window.MenuManager) {
            console.error('❌ MenuManager not available');
            return false;
        }
        
        try {
            await window.MenuManager.selectMenuOption(optionKey);
            return true;
        } catch (error) {
            console.error(`❌ Test failed for ${optionKey}:`, error);
            return false;
        }
    }
}

// Initialize global TemplateValidator instance
const templateValidator = new TemplateValidator();

// Export to global scope
window.TemplateValidator = TemplateValidator;
window.templateValidator = templateValidator;

// Add keyboard shortcut for quick report
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        templateValidator.generateReport();
    }
});

console.log('✅ TemplateValidator loaded - Press Ctrl+Shift+V for validation report');
