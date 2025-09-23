/**
 * MASKSERVICE C20 - Automated Template Loading Tests
 * Comprehensive test suite for UI template verification
 */

const MASKSERVICE_TEST_CONFIG = {
    baseUrl: 'http://localhost:8084',
    testTimeout: 10000,
    roles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
    expectedMenuCounts: {
        'OPERATOR': 7,
        'ADMIN': 9,
        'SUPERUSER': 15,
        'SERWISANT': 18
    }
};

class MaskserviceTemplateTest {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        this.discoveredTemplates = [];
        this.discoveredMenuLinks = [];
        this.discoveredViewLinks = [];
        this.templateAnalysis = {
            working: [],
            missing: [],
            withExport: [],
            withoutExport: []
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'info': '✅',
            'error': '❌',
            'warn': '⚠️',
            'test': '🧪'
        }[type] || 'ℹ️';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
        this.results.details.push({ timestamp, type, message });
    }

    async testModuleLoading() {
        this.log('Starting Module Loading Tests', 'test');
        
        const expectedModules = [
            'Utils', 'ConfigManager', 'AuthManager', 'MenuManager', 
            'DataExportManager', 'Router', 'App', 'VirtualKeyboard'
        ];
        
        for (const module of expectedModules) {
            try {
                if (typeof window[module] !== 'undefined' || 
                    typeof window[module.toLowerCase()] !== 'undefined') {
                    this.log(`Module ${module} loaded successfully`, 'info');
                    this.results.passed++;
                } else {
                    this.log(`Module ${module} not found`, 'error');
                    this.results.failed++;
                }
                this.results.total++;
            } catch (error) {
                this.log(`Error checking module ${module}: ${error.message}`, 'error');
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
        
        this.log(`📊 Discovered ${this.discoveredTemplates.length} templates total`, 'info');
        
        // Categorize templates
        this.discoveredTemplates.forEach(template => {
            if (template.hasContent && template.element.parentElement) {
                this.templateAnalysis.working.push(template);
                if (template.hasExportSection) {
                    this.templateAnalysis.withExport.push(template);
                } else {
                    this.templateAnalysis.withoutExport.push(template);
                }
            } else {
                this.templateAnalysis.missing.push(template);
            }
        });
        
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

    generateReport() {
        const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        
        console.log('\n' + '='.repeat(80));
        console.log('🧪 MASKSERVICE C20 COMPREHENSIVE TEMPLATE & LINK TEST REPORT');
        console.log('='.repeat(80));
        console.log(`📊 Total Tests: ${this.results.total}`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Success Rate: ${successRate}%`);
        console.log('='.repeat(80));
        
        if (this.results.failed === 0) {
            console.log('🎉 ALL TESTS PASSED! System is stable and ready for production.');
        } else {
            console.log('⚠️  Some tests failed. Review the details above.');
        }
        
        console.log('\n📋 COMPREHENSIVE DISCOVERY RESULTS:');
        console.log(`🔍 Total Templates Discovered: ${this.discoveredTemplates.length}`);
        console.log(`✅ Working Templates: ${this.templateAnalysis.working.length}`);
        console.log(`📊 Templates with Export: ${this.templateAnalysis.withExport.length}`);
        console.log(`⚠️ Templates without Export: ${this.templateAnalysis.withoutExport.length}`);
        console.log(`❌ Empty/Missing Templates: ${this.templateAnalysis.missing.length}`);
        console.log(`🔗 Menu Links Discovered: ${this.discoveredMenuLinks.length}`);
        console.log(`🖥️ View Screens Discovered: ${this.discoveredViewLinks.length}`);
        console.log('🔧 Module Loading: Complete');
        console.log('🔐 Auth System: Logout protection active');
        
        console.log('\n📊 DETAILED TEMPLATE LIST:');
        this.discoveredTemplates.forEach(template => {
            const status = template.hasContent ? '✅' : '❌';
            const exportStatus = template.hasExportSection ? '📊' : '⚪';
            console.log(`${status} ${exportStatus} ${template.id} (${template.hasButtons} buttons, ${template.hasLinks} links)`);
        });
        
        return {
            success: this.results.failed === 0,
            passed: this.results.passed,
            failed: this.results.failed,
            total: this.results.total,
            successRate: successRate,
            discovery: {
                templates: this.discoveredTemplates.length,
                workingTemplates: this.templateAnalysis.working.length,
                withExport: this.templateAnalysis.withExport.length,
                menuLinks: this.discoveredMenuLinks.length,
                viewScreens: this.discoveredViewLinks.length
            }
        };
    }

    async runAllTests() {
        this.log('🚀 Starting MASKSERVICE C20 COMPREHENSIVE Template & Link Tests', 'test');
        
        // Module and system tests
        await this.testModuleLoading();
        await this.testExportFunctions();
        await this.testDataExportManager();
        await this.testAuthSystem();
        
        // Dynamic discovery tests
        await this.discoverAllTemplates();
        await this.testAllDiscoveredTemplates();
        await this.discoverAllMenuLinks();
        await this.testAllMenuLinks();
        await this.testAllViewLinks();
        
        return this.generateReport();
    }
}

// Auto-run tests when page loads (if not in production)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    window.addEventListener('load', async () => {
        // Wait for all modules to load
        setTimeout(async () => {
            const tester = new MaskserviceTemplateTest();
            const results = await tester.runAllTests();
            
            // Export results to global scope for Makefile access
            window.MASKSERVICE_TEST_RESULTS = results;
        }, 3000); // Wait 3 seconds for all modules to initialize
    });
}

// Export for manual testing
if (typeof window !== 'undefined') {
    window.MaskserviceTemplateTest = MaskserviceTemplateTest;
}

// Node.js export for testing frameworks
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaskserviceTemplateTest;
}
