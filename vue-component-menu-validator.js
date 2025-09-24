/**
 * Vue Component Menu Accessibility Validator
 * Systematically tests that every Vue component is accessible from the menu and visible in the browser
 */

class VueComponentMenuValidator {
    constructor() {
        this.testResults = {
            accessible: [],
            missing: [],
            errors: [],
            total: 0,
            passed: 0,
            failed: 0
        };
        
        // Map of Vue components to expected menu keys
        this.componentMenuMap = {
            // Test Templates
            'TestMenuTemplate': ['test_wizard', 'test_quick', 'test_scenarios'],
            'TestReportsTemplate': [], // Missing from menu
            
            // Device Templates  
            'DeviceHistoryTemplate': ['device_history'],
            'DeviceSelectTemplate': [], // Missing from menu
            'DeviceDataTemplate': [], // Missing from menu
            
            // Reports Templates
            'ReportsViewTemplate': ['reports_view'],
            'ReportsBatchTemplate': ['reports_batch'], 
            'ReportsScheduleTemplate': ['reports_schedule'],
            
            // User Templates
            'UserDataTemplate': ['user_data'],
            'UsersTemplate': ['users'],
            
            // Sensors
            'RealtimeSensorsTemplate': ['realtime_sensors'],
            
            // Workshop Templates
            'WorkshopTemplate': [], // Missing from menu
            'WorkshopPartsTemplate': ['workshop_parts'],
            'WorkshopMaintenanceTemplate': ['workshop_maintenance'],
            'WorkshopToolsTemplate': ['workshop_tools'],
            'WorkshopInventoryTemplate': ['workshop_inventory'],
            
            // Service & Settings
            'ServiceMenuTemplate': ['service_menu'],
            'SystemSettingsTemplate': ['settings_scenarios', 'settings_integration', 'settings_standards', 'settings_system'],
            
            // Core Components (always accessible)
            'LoginScreen': ['login'], // Special case - login flow
            'UserMenuScreen': ['user_menu'], // Special case - main menu
            'SystemScreen': ['system'] // Special case - system view
        };
        
        // Role-based test scenarios
        this.testRoles = ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERVICEUSER'];
    }
    
    /**
     * Initialize validator and start testing
     */
    async initialize() {
        console.log('🧪 Vue Component Menu Accessibility Validator Starting...');
        console.log('='.repeat(70));
        
        // Wait for app to load
        await this.waitForAppReady();
        
        // Test each role scenario
        for (const role of this.testRoles) {
            console.log(`\n🔍 Testing role: ${role}`);
            await this.testRoleComponents(role);
        }
        
        // Generate comprehensive report
        this.generateReport();
    }
    
    /**
     * Wait for app components to be ready
     */
    async waitForAppReady() {
        return new Promise((resolve) => {
            const checkReady = () => {
                if (window.MenuManager && window.C20Router && window.vueApp) {
                    console.log('✅ App components ready for testing');
                    resolve();
                } else {
                    console.log('⏳ Waiting for app components...');
                    setTimeout(checkReady, 1000);
                }
            };
            checkReady();
        });
    }
    
    /**
     * Test component accessibility for specific role
     */
    async testRoleComponents(role) {
        try {
            // Simulate login with role
            await this.simulateRoleLogin(role);
            
            // Get menu for this role
            const menuItems = await this.getMenuForRole(role);
            console.log(`📋 Found ${menuItems.length} menu items for ${role}`);
            
            // Test each menu item
            for (const menuItem of menuItems) {
                await this.testMenuItemComponent(menuItem, role);
                await this.delay(500); // Prevent rapid clicking
            }
            
        } catch (error) {
            console.error(`❌ Error testing role ${role}:`, error.message);
            this.testResults.errors.push({
                role: role,
                error: error.message
            });
        }
    }
    
    /**
     * Simulate login with specific role
     */
    async simulateRoleLogin(role) {
        console.log(`🔐 Simulating login with role: ${role}`);
        
        // Set authentication state
        if (window.vueApp && window.vueApp.appState) {
            window.vueApp.appState.currentUser = {
                username: `test_${role.toLowerCase()}`,
                role: role,
                isAuthenticated: true
            };
        }
        
        // Initialize menu for role
        if (window.MenuManager) {
            await window.MenuManager.initializeMenu(role);
        }
    }
    
    /**
     * Get menu items for specific role
     */
    async getMenuForRole(role) {
        if (!window.MenuManager || !window.MenuManager.currentMenu) {
            console.warn(`⚠️ No menu available for role: ${role}`);
            return [];
        }
        
        return window.MenuManager.currentMenu || [];
    }
    
    /**
     * Test individual menu item component accessibility
     */
    async testMenuItemComponent(menuItem, role) {
        console.log(`🎯 Testing menu item: ${menuItem.key} (${menuItem.label})`);
        this.testResults.total++;
        
        try {
            // Record initial state
            const initialHash = window.location.hash;
            const initialComponent = this.getCurrentVueComponent();
            
            // Click menu item
            if (window.MenuManager && window.MenuManager.selectMenuOption) {
                await window.MenuManager.selectMenuOption(menuItem.key);
                
                // Wait for navigation
                await this.delay(1000);
                
                // Check if component loaded
                const newHash = window.location.hash;
                const newComponent = this.getCurrentVueComponent();
                
                // Validate component accessibility
                const result = this.validateComponentAccessibility(
                    menuItem, 
                    role, 
                    initialHash, 
                    newHash, 
                    initialComponent, 
                    newComponent
                );
                
                if (result.success) {
                    console.log(`✅ ${menuItem.key}: Component accessible`);
                    this.testResults.accessible.push(result);
                    this.testResults.passed++;
                } else {
                    console.log(`❌ ${menuItem.key}: ${result.error}`);
                    this.testResults.missing.push(result);
                    this.testResults.failed++;
                }
                
            } else {
                throw new Error('MenuManager.selectMenuOption not available');
            }
            
        } catch (error) {
            console.error(`❌ Error testing ${menuItem.key}:`, error.message);
            this.testResults.errors.push({
                menuItem: menuItem.key,
                role: role,
                error: error.message
            });
            this.testResults.failed++;
        }
    }
    
    /**
     * Get currently active Vue component
     */
    getCurrentVueComponent() {
        if (window.vueApp && window.vueApp.appState) {
            return window.vueApp.appState.currentScreen;
        }
        return 'unknown';
    }
    
    /**
     * Validate component accessibility result
     */
    validateComponentAccessibility(menuItem, role, initialHash, newHash, initialComponent, newComponent) {
        const result = {
            menuKey: menuItem.key,
            label: menuItem.label,
            role: role,
            initialHash: initialHash,
            newHash: newHash,
            initialComponent: initialComponent,
            newComponent: newComponent,
            success: false,
            error: null
        };
        
        // Check if hash changed (navigation occurred)
        if (initialHash === newHash) {
            result.error = 'Hash did not change - navigation may have failed';
            return result;
        }
        
        // Check if component changed
        if (initialComponent === newComponent) {
            result.error = 'Vue component did not change - component may not have loaded';
            return result;
        }
        
        // Check if expected Vue component is mapped
        const expectedComponents = this.getExpectedComponentsForMenuKey(menuItem.key);
        if (expectedComponents.length === 0) {
            result.error = 'No Vue component mapped for this menu key';
            return result;
        }
        
        result.success = true;
        result.expectedComponents = expectedComponents;
        return result;
    }
    
    /**
     * Get expected Vue components for menu key
     */
    getExpectedComponentsForMenuKey(menuKey) {
        const components = [];
        for (const [componentName, menuKeys] of Object.entries(this.componentMenuMap)) {
            if (menuKeys.includes(menuKey)) {
                components.push(componentName);
            }
        }
        return components;
    }
    
    /**
     * Generate comprehensive test report
     */
    generateReport() {
        const successRate = this.testResults.total > 0 ? 
            ((this.testResults.passed / this.testResults.total) * 100).toFixed(1) : 0;
        
        console.log('\n' + '='.repeat(80));
        console.log('🧪 VUE COMPONENT MENU ACCESSIBILITY TEST REPORT');
        console.log('='.repeat(80));
        console.log(`📊 Total Tests: ${this.testResults.total}`);
        console.log(`✅ Accessible: ${this.testResults.passed}`);
        console.log(`❌ Failed/Missing: ${this.testResults.failed}`);
        console.log(`📈 Success Rate: ${successRate}%`);
        console.log('='.repeat(80));
        
        // Components accessible through menu
        console.log('\n✅ COMPONENTS ACCESSIBLE THROUGH MENU:');
        this.testResults.accessible.forEach(result => {
            console.log(`✅ ${result.menuKey} (${result.label}) → ${result.newComponent}`);
        });
        
        // Missing components
        console.log('\n❌ COMPONENTS NOT ACCESSIBLE OR FAILED:');
        this.testResults.missing.forEach(result => {
            console.log(`❌ ${result.menuKey} (${result.label}): ${result.error}`);
        });
        
        // Components missing from menu entirely
        console.log('\n⚠️ VUE COMPONENTS WITH NO MENU ACCESS:');
        const missingComponents = this.findComponentsWithoutMenuAccess();
        missingComponents.forEach(component => {
            console.log(`⚠️ ${component} - No menu option available`);
        });
        
        // Error details
        if (this.testResults.errors.length > 0) {
            console.log('\n🚨 TEST EXECUTION ERRORS:');
            this.testResults.errors.forEach(error => {
                console.log(`🚨 ${error.menuItem || error.role}: ${error.error}`);
            });
        }
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        if (missingComponents.length > 0) {
            console.log(`💡 Add menu options for ${missingComponents.length} orphaned components`);
        }
        if (this.testResults.failed > 0) {
            console.log(`💡 Fix ${this.testResults.failed} component accessibility issues`);
        }
        if (successRate < 100) {
            console.log(`💡 Improve component accessibility from ${successRate}% to 100%`);
        }
        
        // Export results for further analysis
        window.VUE_COMPONENT_ACCESSIBILITY_RESULTS = this.testResults;
        console.log('\n📋 Results exported to window.VUE_COMPONENT_ACCESSIBILITY_RESULTS');
    }
    
    /**
     * Find Vue components that have no menu access
     */
    findComponentsWithoutMenuAccess() {
        const missingComponents = [];
        for (const [componentName, menuKeys] of Object.entries(this.componentMenuMap)) {
            if (menuKeys.length === 0 && !['LoginScreen', 'UserMenuScreen', 'SystemScreen'].includes(componentName)) {
                missingComponents.push(componentName);
            }
        }
        return missingComponents;
    }
    
    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Auto-run validator when page loads
if (typeof window !== 'undefined') {
    window.VueComponentMenuValidator = VueComponentMenuValidator;
    
    // Auto-start validation after app loads
    window.addEventListener('load', async () => {
        setTimeout(async () => {
            console.log('🚀 Starting Vue Component Menu Accessibility Validation...');
            const validator = new VueComponentMenuValidator();
            await validator.initialize();
        }, 6000); // Wait 6 seconds for full app initialization
    });
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VueComponentMenuValidator;
}
