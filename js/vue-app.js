/**
 * MASKSERVICE C20 - Vue.js Application Entry Point
 * Vue.js Migration: Main app instance and component management
 */

// Vue.js CDN version for development
const { createApp, ref, reactive, computed, onMounted, nextTick } = Vue;

/**
 * Main Vue App Instance for MASKSERVICE C20
 * Gradually replacing vanilla JS modules with Vue components
 */
class MaskServiceVueApp {
    constructor() {
        this.app = null;
        this.currentScreen = ref('login-screen');
        this.currentLanguage = ref('pl');
        this.currentUser = reactive({
            username: null,
            role: null,
            isAuthenticated: false
        });
        
        console.log('🔶 Vue.js App initializing for MASKSERVICE C20...');
        this.initializeVueApp();
    }

    /**
     * Initialize Vue application with root component
     */
    initializeVueApp() {
        this.app = createApp({
            setup() {
                const appState = reactive({
                    currentScreen: 'login-screen',
                    currentLanguage: 'pl',
                    isLoading: false,
                    currentUser: {
                        username: null,
                        role: null,
                        isAuthenticated: false
                    }
                });

                // Navigation method compatible with existing router
                const navigateToScreen = (screen, language = 'pl', action = 'default') => {
                    console.log(`🔶 Vue Navigation: ${screen}/${language}/${action}`);
                    appState.currentScreen = screen;
                    appState.currentLanguage = language;
                    
                    // Integrate with existing router system
                    if (window.C20Router) {
                        const hash = `#/${screen}/${language}/${action}`;
                        window.location.hash = hash;
                    }
                };

                // Authentication method
                const authenticate = (username, role) => {
                    appState.currentUser.username = username;
                    appState.currentUser.role = role;
                    appState.currentUser.isAuthenticated = true;
                    console.log(`🔶 Vue Auth: User ${username} (${role}) authenticated`);
                };

                // Logout method
                const logout = () => {
                    appState.currentUser = {
                        username: null,
                        role: null,
                        isAuthenticated: false
                    };
                    appState.currentScreen = 'login-screen';
                    navigateToScreen('login-screen');
                    console.log('🔶 Vue Auth: User logged out');
                };

                // Lifecycle hooks
                onMounted(() => {
                    console.log('🔶 Vue App mounted and ready');
                    
                    // Listen to hash changes from vanilla router
                    window.addEventListener('hashchange', (event) => {
                        const hash = window.location.hash;
                        if (hash) {
                            const parts = hash.replace('#/', '').split('/');
                            if (parts.length >= 1) {
                                appState.currentScreen = parts[0];
                                appState.currentLanguage = parts[1] || 'pl';
                            }
                        }
                    });
                });

                return {
                    appState,
                    navigateToScreen,
                    authenticate,
                    logout
                };
            },
            
            template: `
                <div id="vue-app-container">
                    <!-- Vue-managed content will go here -->
                    <transition name="screen-fade" mode="out-in">
                        <component 
                            :is="getCurrentScreenComponent()" 
                            :key="appState.currentScreen"
                            :user="appState.currentUser"
                            :language="appState.currentLanguage"
                            @navigate="navigateToScreen"
                            @authenticate="authenticate"
                            @logout="logout"
                        />
                    </transition>
                </div>
            `,
            
            methods: {
                getCurrentScreenComponent() {
                // Complete Vue component mapping for all views/templates
                const componentMap = {
                    // Core Screens
                    'login-screen': 'LoginScreen',
                    'user-menu-screen': 'UserMenuScreen', 
                    'system-screen': 'SystemScreen',
                    
                    // Service Menu & Templates
                    'service-menu': 'ServiceMenuTemplate',
                    'service-menu-template': 'ServiceMenuTemplate',
                    
                    // Test Templates
                    'test-menu': 'TestMenuTemplate',
                    'test-menu-template': 'TestMenuTemplate',
                    'test-reports': 'TestReportsTemplate',
                    'test-reports-template': 'TestReportsTemplate',
                    
                    // User & Device Templates
                    'user-data': 'UserDataTemplate',
                    'user-data-template': 'UserDataTemplate',
                    'users': 'UsersTemplate',
                    'users-template': 'UsersTemplate',
                    'device-select': 'DeviceSelectTemplate',
                    'device-select-template': 'DeviceSelectTemplate',
                    'device-data': 'DeviceDataTemplate',
                    'device-data-template': 'DeviceDataTemplate',
                    'device-history': 'DeviceHistoryTemplate',
                    'device-history-template': 'DeviceHistoryTemplate',
                    
                    // Sensors & Monitoring
                    'realtime-sensors': 'RealtimeSensorsTemplate',
                    'realtime-sensors-template': 'RealtimeSensorsTemplate',
                    
                    // Reports Templates
                    'reports-view': 'ReportsViewTemplate',
                    'reports-view-template': 'ReportsViewTemplate',
                    'reports-batch': 'ReportsBatchTemplate',
                    'reports-batch-template': 'ReportsBatchTemplate',
                    'reports-schedule': 'ReportsScheduleTemplate',
                    'reports-schedule-template': 'ReportsScheduleTemplate',
                    
                    // Settings Templates
                    'system-settings': 'SystemSettingsTemplate',
                    'system-settings-template': 'SystemSettingsTemplate',
                    'settings-system': 'SystemSettingsTemplate',
                    'settings-standards': 'SystemSettingsTemplate',
                    'settings-scenarios': 'SystemSettingsTemplate',
                    
                    // Workshop Templates
                    'workshop': 'WorkshopTemplate',
                    'workshop-template': 'WorkshopTemplate',
                    'workshop-inventory': 'WorkshopInventoryTemplate',
                    'workshop-inventory-template': 'WorkshopInventoryTemplate',
                    'workshop-maintenance': 'WorkshopMaintenanceTemplate',
                    'workshop-maintenance-template': 'WorkshopMaintenanceTemplate',
                    'workshop-parts': 'WorkshopPartsTemplate',
                    'workshop-parts-template': 'WorkshopPartsTemplate',
                    'workshop-tools': 'WorkshopToolsTemplate',
                    'workshop-tools-template': 'WorkshopToolsTemplate'
                };
                
                const componentName = componentMap[this.appState.currentScreen];
                if (!componentName) {
                    console.warn(`⚠️ Vue: Unknown screen '${this.appState.currentScreen}', falling back to LoginScreen`);
                    return 'LoginScreen';
                }
                
                console.log(`🔶 Vue: Loading component ${componentName} for screen '${this.appState.currentScreen}'`);
                return componentName;
            }
        }
    });

        // Register global properties for backwards compatibility
        this.app.config.globalProperties.$maskService = {
            currentUser: this.currentUser,
            navigateToScreen: this.navigateToScreen.bind(this)
        };

        console.log('🔶 Vue App initialized, ready to mount');
        return this.app;
    }

    /**
     * Mount Vue app to DOM element
     */
    mount(selector = '#vue-app') {
        if (!this.app) {
            console.error('❌ Vue app not initialized');
            return null;
        }

        try {
            const mountedApp = this.app.mount(selector);
            console.log('✅ Vue App mounted successfully to', selector);
            return mountedApp;
        } catch (error) {
            console.error('❌ Failed to mount Vue app:', error);
            return null;
        }
    }

    /**
     * Navigate to screen - Vue-compatible navigation method
     */
    navigateToScreen(screen, language = 'pl', action = 'default') {
        console.log(`🔶 Vue Navigation: ${screen}/${language}/${action}`);
        
        // Update app state
        this.appState.currentScreen = screen;
        this.appState.currentLanguage = language;
        
        // Integrate with existing router system
        if (window.C20Router) {
            const hash = `#/${screen}/${language}/${action}`;
            window.location.hash = hash;
        }
        
        console.log('✅ Vue Navigation completed:', { screen, language, action });
    }

    /**
     * Register Vue component
     */
    registerComponent(name, component) {
        if (this.app) {
            this.app.component(name, component);
            console.log(`✅ Vue component registered: ${name}`);
        }
    }

    /**
     * Get Vue app instance
     */
    getApp() {
        return this.app;
    }
}

// Global Vue app instance
window.MaskServiceVue = new MaskServiceVueApp();

// Backward compatibility - expose Vue app globally
window.vueApp = window.MaskServiceVue;

console.log('🔶 Vue.js integration loaded for MASKSERVICE C20');
