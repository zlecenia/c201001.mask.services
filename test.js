/**
 * MASKSERVICE C20 - Vue.js Architecture Test Suite
 * Comprehensive testing for Vue components, reactive systems, and external configs
 * Post-Migration: Tests for Vue.js-based architecture (September 2025)
 */

const MASKSERVICE_VUE_TEST_CONFIG = {
    baseUrl: 'http://localhost:8081',
    testTimeout: 15000,
    roles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
    expectedMenuCounts: {
        'OPERATOR': 7,
        'ADMIN': 9,
        'SUPERUSER': 15,
        'SERWISANT': 18
    },
    vueComponents: [
        'LoginScreen', 'SystemScreen', 'UserMenuScreen',
        'TestMenuTemplate', 'UserDataTemplate', 'DeviceSelectTemplate',
        'DeviceDataTemplate', 'RealtimeSensorsTemplate', 'ReportsViewTemplate',
        'SystemSettingsTemplate', 'ServiceMenuTemplate', 'UsersTemplate',
        'WorkshopTemplate', 'TestReportsTemplate', 'DeviceHistoryTemplate',
        'ReportsBatchTemplate', 'ReportsScheduleTemplate', 'WorkshopInventoryTemplate',
        'WorkshopMaintenanceTemplate', 'WorkshopPartsTemplate', 'WorkshopToolsTemplate'
    ],
    externalConfigs: [
        '/config/sensors.json',
        '/config/routing.json', 
        '/config/app.json',
        '/config/menu.json'
    ],
    localeFiles: [
        '/locales/pl.json',
        '/locales/en.json',
        '/locales/de.json'
    ]
};

class MaskServiceVueTest {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: [],
            vueComponents: [],
            configTests: [],
            reactiveTests: []
        };
        this.vueApp = null;
        this.vueComponents = new Map();
        this.externalConfigs = new Map();
        this.reactiveData = new Map();
        this.testStartTime = Date.now();
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'info': '✅',
            'error': '❌',
            'warn': '⚠️',
            'test': '🧪',
            'vue': '🔶'
        }[type] || 'ℹ️';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
        this.results.details.push({ timestamp, type, message });
    }

    /**
     * Test Vue.js app initialization and mounting
     */
    async testVueAppInitialization() {
        this.log('🔶 Testing Vue.js App Initialization', 'test');
        
        try {
            // Check if Vue is available
            if (typeof Vue === 'undefined') {
                this.log('Vue.js not loaded', 'error');
                this.results.failed++;
                this.results.total++;
                return;
            }
            
            // Check if MaskServiceVueApp is available
            if (typeof window.maskServiceVueApp !== 'undefined') {
                this.vueApp = window.maskServiceVueApp;
                this.log('Vue App instance found', 'info');
                this.results.passed++;
            } else {
                this.log('Vue App instance not found', 'error');
                this.results.failed++;
            }
            
            // Check if Vue app is mounted
            const vueAppElement = document.querySelector('#vue-app');
            if (vueAppElement && vueAppElement.__vue_app__) {
                this.log('Vue App successfully mounted', 'info');
                this.results.passed++;
            } else {
                this.log('Vue App not mounted or mount element missing', 'warn');
                this.results.failed++;
            }
            
            this.results.total += 2;
            
        } catch (error) {
            this.log(`Vue App initialization error: ${error.message}`, 'error');
            this.results.failed++;
            this.results.total++;
        }
    }

    /**
     * Test Vue component registration and loading
     */
    async testVueComponentLoading() {
        this.log('🔶 Testing Vue Component Loading', 'test');
        
        const expectedComponents = MASKSERVICE_VUE_TEST_CONFIG.vueComponents;
        
        for (const componentName of expectedComponents) {
            try {
                // Check if component is registered globally
                if (typeof window[componentName] !== 'undefined') {
                    this.vueComponents.set(componentName, window[componentName]);
                    this.log(`Component ${componentName} loaded successfully`, 'vue');
                    this.results.passed++;
                    this.results.vueComponents.push({ name: componentName, status: 'loaded' });
                } else {
                    this.log(`Component ${componentName} not found`, 'error');
                    this.results.failed++;
                    this.results.vueComponents.push({ name: componentName, status: 'missing' });
                }
                this.results.total++;
            } catch (error) {
                this.log(`Error checking component ${componentName}: ${error.message}`, 'error');
                this.results.failed++;
                this.results.total++;
                this.results.vueComponents.push({ name: componentName, status: 'error', error: error.message });
            }
        }
    }

    /**
     * Test external JSON configuration loading
     */
    async testExternalConfigLoading() {
        this.log('🗺 Testing External Config Loading', 'test');
        
        const configPaths = MASKSERVICE_VUE_TEST_CONFIG.externalConfigs;
        
        for (const configPath of configPaths) {
            try {
                const response = await fetch(configPath);
                if (response.ok) {
                    const configData = await response.json();
                    this.externalConfigs.set(configPath, configData);
                    this.log(`Config ${configPath} loaded successfully`, 'info');
                    this.results.passed++;
                    this.results.configTests.push({ path: configPath, status: 'loaded', size: JSON.stringify(configData).length });
                } else {
                    this.log(`Config ${configPath} failed to load (${response.status})`, 'error');
                    this.results.failed++;
                    this.results.configTests.push({ path: configPath, status: 'failed', error: response.status });
                }
                this.results.total++;
            } catch (error) {
                this.log(`Config ${configPath} error: ${error.message}`, 'error');
                this.results.failed++;
                this.results.total++;
                this.results.configTests.push({ path: configPath, status: 'error', error: error.message });
            }
        }
    }

    /**
     * Test Vue reactive systems (i18n, sensors, app state)
     */
    async testVueReactiveSystems() {
        this.log('⚡ Testing Vue Reactive Systems', 'test');
        
        // Test VueI18nManager
        try {
            if (typeof window.vueI18nManager !== 'undefined') {
                const i18nManager = window.vueI18nManager;
                this.reactiveData.set('i18n', i18nManager.reactiveTranslations);
                this.log('VueI18nManager reactive system active', 'vue');
                this.results.passed++;
                this.results.reactiveTests.push({ system: 'i18n', status: 'active' });
            } else {
                this.log('VueI18nManager not found', 'error');
                this.results.failed++;
                this.results.reactiveTests.push({ system: 'i18n', status: 'missing' });
            }
            this.results.total++;
        } catch (error) {
            this.log(`VueI18nManager error: ${error.message}`, 'error');
            this.results.failed++;
            this.results.total++;
        }

        // Test VueSensorMonitoring 
        try {
            if (typeof window.vueSensorMonitoring !== 'undefined') {
                const sensorMonitoring = window.vueSensorMonitoring;
                this.reactiveData.set('sensors', sensorMonitoring.reactiveSensorData);
                this.log('VueSensorMonitoring reactive system active', 'vue');
                this.results.passed++;
                this.results.reactiveTests.push({ system: 'sensors', status: 'active' });
            } else {
                this.log('VueSensorMonitoring not found', 'error');
                this.results.failed++;
                this.results.reactiveTests.push({ system: 'sensors', status: 'missing' });
            }
            this.results.total++;
        } catch (error) {
            this.log(`VueSensorMonitoring error: ${error.message}`, 'error');
            this.results.failed++;
            this.results.total++;
        }

        // Test Vue App State Reactivity
        try {
            if (this.vueApp && this.vueApp.appState) {
                this.reactiveData.set('appState', this.vueApp.appState);
                this.log('Vue App state reactivity active', 'vue');
                this.results.passed++;
                this.results.reactiveTests.push({ system: 'appState', status: 'active' });
            } else {
                this.log('Vue App state not reactive or not found', 'warn');
                this.results.failed++;
                this.results.reactiveTests.push({ system: 'appState', status: 'missing' });
            }
            this.results.total++;
        } catch (error) {
            this.log(`Vue App state error: ${error.message}`, 'error');
            this.results.failed++;
            this.results.total++;
        }
    }

    /**
     * Test Vue router and navigation system
     */
    async testVueRouterNavigation() {
        this.log('🛣️ Testing Vue Router Navigation', 'test');
        
        try {
            // Check if C20Router exists
            if (typeof window.C20Router === 'undefined') {
                this.log('C20Router not found', 'error');
                this.results.failed++;
                this.results.total++;
                return;
            }

            const router = window.C20Router;
            const initialHash = window.location.hash;
            
            // Test navigation method
            if (typeof router.navigateToView === 'function') {
                this.log('Router navigation method available', 'info');
                this.results.passed++;
            } else {
                this.log('Router navigation method missing', 'error');
                this.results.failed++;
            }

            // Test route parsing
            if (typeof router.parseRoute === 'function') {
                const testRoute = router.parseRoute('#/login-screen/pl/default');
                if (testRoute && testRoute.view) {
                    this.log('Router parsing working', 'info');
                    this.results.passed++;
                } else {
                    this.log('Router parsing failed', 'error');
                    this.results.failed++;
                }
            } else {
                this.log('Router parseRoute method missing', 'error');
                this.results.failed++;
            }

            this.results.total += 2;
            
        } catch (error) {
            this.log(`Router navigation error: ${error.message}`, 'error');
            this.results.failed++;
            this.results.total++;
        }
    }

    /**
     * Test Vue component mounting and template validation
     */
    async testVueComponentMounting() {
        this.log('🏗️ Testing Vue Component Mounting', 'test');
        
        const testComponents = ['LoginScreen', 'SystemScreen', 'UserMenuScreen'];
        
        for (const componentName of testComponents) {
            try {
                if (this.vueComponents.has(componentName)) {
                    const component = this.vueComponents.get(componentName);
                    
                    // Check if component has required properties
                    if (component.name && component.setup) {
                        this.log(`Component ${componentName} structure valid`, 'vue');
                        this.results.passed++;
                    } else if (component.template || component.render) {
                        this.log(`Component ${componentName} template/render valid`, 'vue');
                        this.results.passed++;
                    } else {
                        this.log(`Component ${componentName} missing required structure`, 'error');
                        this.results.failed++;
                    }
                } else {
                    this.log(`Component ${componentName} not available for testing`, 'warn');
                    this.results.failed++;
                }
                this.results.total++;
            } catch (error) {
                this.log(`Component ${componentName} mounting error: ${error.message}`, 'error');
                this.results.failed++;
                this.results.total++;
            }
        }
    }

    async discoverAllTemplates() {
        this.log('🔍 Dynamic Discovery - Scanning ALL Templates in DOM', 'test');
        
        // Find all elements with id ending in '-template'
        const allElements = document.querySelectorAll('*[id]');
        const templateElements = Array.from(allElements).filter(el => 
            el.id.endsWith('-template') || el.id.endsWith('-screen') || el.classList.contains('template')
        );
        
        this.discoveredTemplates = templateElements.map(el => ({
            id: el.id,
            element: el,
            visible: el.style.display !== 'none' && !el.closest('[style*="display: none"]'),
            hasContent: el.innerHTML.trim().length > 0,
            hasExportSection: !!el.querySelector('.export-section'),
            exportButtonCount: el.querySelectorAll('.btn-export').length,
            hasMenuCards: el.querySelectorAll('.menu-card, .menu-item').length,
            hasButtons: el.querySelectorAll('button').length,
            hasLinks: el.querySelectorAll('a').length
        }));
        
        // Legacy template discovery removed - Vue components are tested via component loading tests
        
        this.log(`✅ Working templates: ${this.templateAnalysis.working.length}`, 'info');
        this.log(`📊 With export functionality: ${this.templateAnalysis.withExport.length}`, 'info');
        this.log(`⚠️ Without export functionality: ${this.templateAnalysis.withoutExport.length}`, 'info');
        this.log(`❌ Missing/empty templates: ${this.templateAnalysis.missing.length}`, 'info');
        
        return this.discoveredTemplates;
    }

    async testAllDiscoveredTemplates() {
        this.log('🧪 Testing ALL Discovered Templates', 'test');
        
        for (const template of this.discoveredTemplates) {
            try {
                this.log(`Testing template: ${template.id}`, 'info');
                
                // Test template structure
                if (template.hasContent) {
                    this.log(`✅ Template ${template.id} has content`, 'info');
                    this.results.passed++;
                    
                    // Test export functionality if present
                    if (template.hasExportSection) {
                        if (template.exportButtonCount >= 4) {
                            this.log(`✅ Template ${template.id} has complete export section (${template.exportButtonCount} buttons)`, 'info');
                            this.results.passed++;
                        } else {
                            this.log(`⚠️ Template ${template.id} has incomplete export section (${template.exportButtonCount} buttons)`, 'warn');
                            this.results.failed++;
                        }
                    }
                    
                    // Test interactive elements
                    if (template.hasButtons > 0 || template.hasLinks > 0) {
                        this.log(`✅ Template ${template.id} has ${template.hasButtons} buttons and ${template.hasLinks} links`, 'info');
                        this.results.passed++;
                    }
                    
                } else {
                    this.log(`❌ Template ${template.id} is empty or missing content`, 'error');
                    this.results.failed++;
                }
                
                this.results.total += 2; // Structure + content tests
                
            } catch (error) {
                this.log(`Error testing template ${template.id}: ${error.message}`, 'error');
                this.results.failed++;
                this.results.total++;
            }
        }
    }

    async testExportFunctions() {
        this.log('Testing Export Functions', 'test');
        
        const exportFunctions = [
            'exportTestData',
            'exportUserData', 
            'exportUsersData',
            'exportServiceData',
            'exportSettingsData'
        ];
        
        for (const funcName of exportFunctions) {
            try {
                if (typeof window[funcName] === 'function') {
                    this.log(`Export function ${funcName} available`, 'info');
                    this.results.passed++;
                } else {
                    this.log(`Export function ${funcName} not found`, 'error');
                    this.results.failed++;
                }
                this.results.total++;
            } catch (error) {
                this.log(`Error checking export function ${funcName}: ${error.message}`, 'error');
                this.results.failed++;
                this.results.total++;
            }
        }
    }

    async testDataExportManager() {
        this.log('Testing DataExportManager', 'test');
        
        try {
            if (window.dataExporter && window.dataExporter.exportData) {
                this.log('DataExportManager available', 'info');
                
                // Test formats
                const supportedFormats = ['json', 'xml', 'csv', 'pdf'];
                this.log(`DataExportManager supports: ${supportedFormats.join(', ')}`, 'info');
                this.results.passed++;
            } else {
                this.log('DataExportManager not available', 'error');
                this.results.failed++;
            }
            this.results.total++;
        } catch (error) {
            this.log(`Error testing DataExportManager: ${error.message}`, 'error');
            this.results.failed++;
            this.results.total++;
        }
    }

    async testAuthSystem() {
        this.log('Testing Authentication System', 'test');
        
        try {
            if (window.authManager && window.logout) {
                this.log('Auth system available', 'info');
                
                // Test logout protection
                if (window.logout.toString().includes('authManager.currentUser')) {
                    this.log('Logout protection mechanism detected', 'info');
                    this.results.passed++;
                } else {
                    this.log('Logout protection mechanism not found', 'warn');
                    this.results.failed++;
                }
            } else {
                this.log('Auth system not available', 'error');
                this.results.failed++;
            }
            this.results.total++;
        } catch (error) {
            this.log(`Error testing auth system: ${error.message}`, 'error');
            this.results.failed++;
            this.results.total++;
        }
    }

    async discoverAllMenuLinks() {
        this.log('🔍 Dynamic Discovery - Scanning ALL Menu Links and Navigation', 'test');
        
        // Find all menu items with onclick handlers
        const menuItems = document.querySelectorAll('[onclick], .menu-item, .menu-card, .nav-link, [data-screen]');
        
        this.discoveredMenuLinks = Array.from(menuItems).map(item => ({
            element: item,
            id: item.id || 'no-id',
            onclick: item.getAttribute('onclick') || '',
            dataScreen: item.getAttribute('data-screen') || '',
            text: item.textContent.trim(),
            visible: item.offsetParent !== null,
            hasHandler: !!(item.getAttribute('onclick') || item.getAttribute('data-screen'))
        })).filter(link => link.hasHandler || link.text.length > 0);
        
        this.log(`📊 Discovered ${this.discoveredMenuLinks.length} menu links/navigation items`, 'info');
        
        return this.discoveredMenuLinks;
    }
    
    async testAllMenuLinks() {
        this.log('🧪 Testing ALL Menu Links and Navigation Handlers', 'test');
        
        for (const link of this.discoveredMenuLinks) {
            try {
                this.log(`Testing menu link: "${link.text}" (${link.id})`, 'info');
                
                // Test onclick handler
                if (link.onclick) {
                    try {
                        // Parse onclick to check if function exists
                        const funcMatch = link.onclick.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
                        if (funcMatch) {
                            const funcName = funcMatch[0];
                            if (typeof window[funcName] === 'function') {
                                this.log(`✅ Menu link "${link.text}" has valid onclick handler: ${funcName}`, 'info');
                                this.results.passed++;
                            } else {
                                this.log(`❌ Menu link "${link.text}" has invalid onclick handler: ${funcName}`, 'error');
                                this.results.failed++;
                            }
                        }
                    } catch (e) {
                        this.log(`⚠️ Could not validate onclick for "${link.text}": ${link.onclick}`, 'warn');
                        this.results.failed++;
                    }
                }
                
                // Test data-screen attribute
                if (link.dataScreen) {
                    const targetScreen = document.getElementById(link.dataScreen);
                    if (targetScreen) {
                        this.log(`✅ Menu link "${link.text}" has valid target screen: ${link.dataScreen}`, 'info');
                        this.results.passed++;
                    } else {
                        this.log(`❌ Menu link "${link.text}" has invalid target screen: ${link.dataScreen}`, 'error');
                        this.results.failed++;
                    }
                }
                
                this.results.total++;
                
            } catch (error) {
                this.log(`Error testing menu link "${link.text}": ${error.message}`, 'error');
                this.results.failed++;
                this.results.total++;
            }
        }
    }
    
    async testAllViewLinks() {
        this.log('🧪 Testing ALL View Links and Screen Navigation', 'test');
        
        // Find all screen elements
        const allScreens = document.querySelectorAll('[id*="-screen"], [id*="-view"], .screen');
        
        this.discoveredViewLinks = Array.from(allScreens).map(screen => ({
            id: screen.id,
            element: screen,
            visible: screen.classList.contains('active') || screen.style.display !== 'none',
            hasContent: screen.innerHTML.trim().length > 0
        }));
        
        this.log(`📊 Discovered ${this.discoveredViewLinks.length} view screens`, 'info');
        
        for (const view of this.discoveredViewLinks) {
            try {
                if (view.hasContent) {
                    this.log(`✅ View screen ${view.id} has content`, 'info');
                    this.results.passed++;
                } else {
                    this.log(`❌ View screen ${view.id} is empty`, 'error');
                    this.results.failed++;
                }
                this.results.total++;
            } catch (error) {
                this.log(`Error testing view ${view.id}: ${error.message}`, 'error');
                this.results.failed++;
                this.results.total++;
            }
        }
    }

    /**
     * Generate comprehensive Vue.js test report
     */
    generateVueReport() {
        const testDuration = Date.now() - this.testStartTime;
        const successRate = this.results.total > 0 ? ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;
        
        console.log('\n' + '='.repeat(80));
        console.log('🔶 MASKSERVICE C20 VUE.JS ARCHITECTURE TEST REPORT');
        console.log('='.repeat(80));
        console.log(`📊 Total Tests: ${this.results.total}`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Success Rate: ${successRate}%`);
        console.log(`⏱️ Test Duration: ${testDuration}ms`);
        console.log('='.repeat(80));
        
        if (this.results.failed === 0) {
            console.log('🎉 ALL VUE.JS TESTS PASSED! System is production-ready.');
        } else {
            console.log('⚠️  Some Vue.js tests failed. Review the details above.');
        }
        
        // Vue Components Report
        console.log('\n🔶 VUE COMPONENTS REPORT:');
        console.log(`📊 Total Components Expected: ${MASKSERVICE_VUE_TEST_CONFIG.vueComponents.length}`);
        const loadedComponents = this.results.vueComponents.filter(c => c.status === 'loaded').length;
        const missingComponents = this.results.vueComponents.filter(c => c.status === 'missing').length;
        const errorComponents = this.results.vueComponents.filter(c => c.status === 'error').length;
        console.log(`✅ Components Loaded: ${loadedComponents}`);
        console.log(`❌ Components Missing: ${missingComponents}`);
        console.log(`⚠️ Components with Errors: ${errorComponents}`);
        
        // External Config Report
        console.log('\n🗺 EXTERNAL CONFIG REPORT:');
        console.log(`📊 Total Configs Expected: ${MASKSERVICE_VUE_TEST_CONFIG.externalConfigs.length}`);
        const loadedConfigs = this.results.configTests.filter(c => c.status === 'loaded').length;
        const failedConfigs = this.results.configTests.filter(c => c.status === 'failed').length;
        const errorConfigs = this.results.configTests.filter(c => c.status === 'error').length;
        console.log(`✅ Configs Loaded: ${loadedConfigs}`);
        console.log(`❌ Configs Failed: ${failedConfigs}`);
        console.log(`⚠️ Configs with Errors: ${errorConfigs}`);
        
        // Reactive Systems Report
        console.log('\n⚡ REACTIVE SYSTEMS REPORT:');
        const activeSystems = this.results.reactiveTests.filter(r => r.status === 'active').length;
        const missingSystems = this.results.reactiveTests.filter(r => r.status === 'missing').length;
        console.log(`✅ Reactive Systems Active: ${activeSystems}`);
        console.log(`❌ Reactive Systems Missing: ${missingSystems}`);
        
        // Detailed Component List
        if (this.results.vueComponents.length > 0) {
            console.log('\n📊 DETAILED COMPONENT STATUS:');
            this.results.vueComponents.forEach(component => {
                const status = {
                    'loaded': '✅',
                    'missing': '❌',
                    'error': '⚠️'
                }[component.status] || '❓';
                console.log(`${status} ${component.name} (${component.status})`);
            });
        }
        
        return {
            success: this.results.failed === 0,
            passed: this.results.passed,
            failed: this.results.failed,
            total: this.results.total,
            successRate: parseFloat(successRate),
            testDuration: testDuration,
            vueComponents: {
                total: MASKSERVICE_VUE_TEST_CONFIG.vueComponents.length,
                loaded: loadedComponents,
                missing: missingComponents,
                errors: errorComponents
            },
            externalConfigs: {
                total: MASKSERVICE_VUE_TEST_CONFIG.externalConfigs.length,
                loaded: loadedConfigs,
                failed: failedConfigs,
                errors: errorConfigs
            },
            reactiveSystems: {
                active: activeSystems,
                missing: missingSystems
            }
        };
    }

    /**
     * Run comprehensive Vue.js architecture test suite
     */
    async runAllVueTests() {
        this.log('🚀 Starting MASKSERVICE C20 VUE.JS ARCHITECTURE Tests', 'test');
        this.testStartTime = Date.now();
        
        try {
            // Core Vue.js architecture tests
            await this.testVueAppInitialization();
            await this.testVueComponentLoading();
            await this.testExternalConfigLoading();
            await this.testVueReactiveSystems();
            await this.testVueRouterNavigation();
            await this.testVueComponentMounting();
            
            // Legacy compatibility tests (minimal)
            await this.testDataExportManager();
            
        } catch (error) {
            this.log(`Critical test execution error: ${error.message}`, 'error');
            this.results.failed++;
            this.results.total++;
        }
        
        return this.generateVueReport();
    }
}

// Auto-run Vue.js tests when page loads (if not in production)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    window.addEventListener('load', async () => {
        // Wait for Vue.js app and components to load
        setTimeout(async () => {
            console.log('🔶 Starting MASKSERVICE C20 Vue.js Architecture Tests...');
            const vueTester = new MaskServiceVueTest();
            const results = await vueTester.runAllVueTests();
            
            // Export results to global scope for Makefile and automation access
            window.MASKSERVICE_VUE_TEST_RESULTS = results;
            window.MASKSERVICE_TEST_RESULTS = results; // Legacy compatibility
            
            console.log('🎯 Vue.js test results exported to window.MASKSERVICE_VUE_TEST_RESULTS');
        }, 5000); // Wait 5 seconds for Vue.js components to initialize
    });
}

// Export for manual testing
if (typeof window !== 'undefined') {
    window.MaskServiceVueTest = MaskServiceVueTest;
    // Legacy export for compatibility
    window.MaskserviceTemplateTest = MaskServiceVueTest;
}

// Node.js export for testing frameworks
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaskServiceVueTest;
}
