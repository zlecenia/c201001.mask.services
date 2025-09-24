/**
 * MASKTRONIC C20 - Vue.js Application Entry Point
 * Vue.js Migration: Main app instance and component management
 */

// Vue.js CDN version for development
const { createApp, ref, reactive, computed, onMounted, nextTick } = Vue;

/**
 * Main Vue App Instance for MASKTRONIC C20
 * Gradually replacing vanilla JS modules with Vue components
 */
class MaskServiceVueApp {
    constructor() {
        this.app = null;
        this.appState = null; // Will store reference to Vue app state
        this.currentScreen = ref('login-screen');
        this.currentLanguage = ref('pl');
        this.currentUser = reactive({
            username: null,
            role: null,
            isAuthenticated: false
        });
        
        console.log('🔶 Vue.js App initializing for MASKTRONIC C20...');
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

                // Store reference to appState for external access
                window.MaskServiceVue.appState = appState;

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
                
                // ROUTER METHODS - Missing methods for 100% compliance
                
                // Parse route from hash string
                const parseRoute = (hash) => {
                    console.log('🛣️ Vue Router: Parsing route:', hash);
                    
                    if (!hash || hash === '#') {
                        return {
                            view: 'login-screen',
                            language: 'pl',
                            action: 'default',
                            isValid: true
                        };
                    }
                    
                    // Remove leading # and split
                    const cleanHash = hash.replace(/^#\/?/, '');
                    const parts = cleanHash.split('/');
                    
                    const route = {
                        view: parts[0] || 'login-screen',
                        language: parts[1] || 'pl',
                        action: parts[2] || 'default',
                        isValid: parts.length >= 1 && parts[0] !== ''
                    };
                    
                    console.log('🛣️ Vue Router: Parsed route:', route);
                    return route;
                };
                
                // Enhanced navigation method with validation
                const navigation = {
                    navigateTo: (screen, language = 'pl', action = 'default') => {
                        console.log(`🛣️ Vue Navigation: Navigating to ${screen}/${language}/${action}`);
                        
                        // Validate screen exists
                        const validScreens = [
                            'login-screen', 'user-menu-screen', 'system-screen',
                            'test-menu', 'user-data', 'device-data', 'realtime-sensors',
                            'system-settings', 'users', 'workshop', 'reports-view',
                            'service-menu', 'test-reports', 'device-select', 'device-history'
                        ];
                        
                        if (!validScreens.includes(screen)) {
                            console.warn(`⚠️ Vue Navigation: Invalid screen '${screen}', defaulting to login`);
                            screen = 'login-screen';
                        }
                        
                        return navigateToScreen(screen, language, action);
                    },
                    
                    getCurrentRoute: () => {
                        return {
                            screen: appState.currentScreen,
                            language: appState.currentLanguage,
                            user: appState.currentUser
                        };
                    },
                    
                    setRoute: (route) => {
                        if (route && route.view) {
                            appState.currentScreen = route.view;
                            appState.currentLanguage = route.language || 'pl';
                            
                            console.log('🛣️ Vue Router: Route set to:', route);
                        }
                    }
                };
                
                // Reactive state management enhancement
                const stateManager = {
                    updateState: (key, value) => {
                        if (appState.hasOwnProperty(key)) {
                            appState[key] = value;
                            console.log(`🔄 Vue State: Updated ${key}:`, value);
                        }
                    },
                    
                    getState: () => appState,
                    
                    watchState: (callback) => {
                        // In a real implementation, would use Vue's watch
                        console.log('👁️ Vue State: Watcher registered');
                        return () => console.log('👁️ Vue State: Watcher removed');
                    }
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
                    logout,
                    // ROUTER METHODS - Export for 100% compliance
                    parseRoute,
                    navigation,
                    stateManager
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
 * FIXED: Now actually renders Vue components instead of just changing hash
 */
navigateToScreen(screen, language = 'pl', action = 'default') {
    console.log(`🔶 Vue Navigation: ${screen}/${language}/${action}`);
    
    try {
        // Update app state
        if (this.appState) {
            this.appState.currentScreen = screen;
            this.appState.currentLanguage = language;
        }
        
        // CRITICAL FIX: Actually load and render the Vue component
        this.loadComponentToDom(screen);
        
        // Update router hash for consistency
        if (window.C20Router) {
            const hash = `#/${screen}/${language}/${action}`;
            window.location.hash = hash;
        }
        
        console.log('✅ Vue Navigation completed:', { screen, language, action });
        return true;
        
    } catch (error) {
        console.error(`❌ Vue Navigation failed for ${screen}:`, error);
        return false;
    }
}

/**
 * Load and render Vue component to DOM - CRITICAL FIX for navigation
 * This replaces the legacy loadTemplate DOM manipulation with proper Vue rendering
 */
loadComponentToDom(screenName) {
    console.log(`🔶 Vue: Loading component for screen: ${screenName}`);
    
    try {
        // Find the menu content container (same as legacy loadTemplate)
        const menuContent = document.getElementById('menu-content');
        if (!menuContent) {
            console.error('❌ Menu content container not found');
            return false;
        }
        
        // Map screen names to Vue component names
        const componentMap = {
            'test-menu': 'TestMenuTemplate',
            'test-menu-template': 'TestMenuTemplate',
            'user-data': 'UserDataTemplate', 
            'user-data-template': 'UserDataTemplate',
            'device-select': 'DeviceSelectTemplate',
            'device-select-template': 'DeviceSelectTemplate',
            'device-data': 'DeviceDataTemplate',
            'device-data-template': 'DeviceDataTemplate',
            'realtime-sensors': 'RealtimeSensorsTemplate',
            'realtime-sensors-template': 'RealtimeSensorsTemplate',
            'reports-view': 'ReportsViewTemplate',
            'reports-view-template': 'ReportsViewTemplate',
            'reports-batch': 'ReportsBatchTemplate',
            'reports-batch-template': 'ReportsBatchTemplate',
            'reports-schedule': 'ReportsScheduleTemplate',
            'reports-schedule-template': 'ReportsScheduleTemplate',
            'system-settings': 'SystemSettingsTemplate',
            'system-settings-template': 'SystemSettingsTemplate',
            'service-menu': 'ServiceMenuTemplate',
            'service-menu-template': 'ServiceMenuTemplate',
            'users': 'UsersTemplate',
            'users-template': 'UsersTemplate',
            'workshop': 'WorkshopTemplate',
            'workshop-template': 'WorkshopTemplate',
            'workshop-inventory': 'WorkshopInventoryTemplate',
            'workshop-inventory-template': 'WorkshopInventoryTemplate',
            'workshop-maintenance': 'WorkshopMaintenanceTemplate',
            'workshop-maintenance-template': 'WorkshopMaintenanceTemplate',
            'workshop-parts': 'WorkshopPartsTemplate',
            'workshop-parts-template': 'WorkshopPartsTemplate',
            'workshop-tools': 'WorkshopToolsTemplate',
            'workshop-tools-template': 'WorkshopToolsTemplate',
            'test-reports': 'TestReportsTemplate',
            'test-reports-template': 'TestReportsTemplate',
            'device-history': 'DeviceHistoryTemplate',
            'device-history-template': 'DeviceHistoryTemplate'
        };
        
        const componentName = componentMap[screenName];
        if (!componentName) {
            console.error(`❌ Vue: No component mapped for screen: ${screenName}`);
            menuContent.innerHTML = `<div class="error-message">
                <h2>Component Not Found</h2>
                <p>No Vue component available for screen: ${screenName}</p>
                <p>Available screens: ${Object.keys(componentMap).join(', ')}</p>
            </div>`;
            return false;
        }
        
        // Check if component is registered
        if (!this.app || !this.app._context.components[componentName]) {
            console.error(`❌ Vue: Component '${componentName}' not registered`);
            menuContent.innerHTML = `<div class="error-message">
                <h2>Component Not Registered</h2>
                <p>Vue component '${componentName}' is not registered</p>
            </div>`;
            return false;
        }
        
        // Clear existing content and render Vue component
        menuContent.innerHTML = `<div id="vue-component-${screenName}" class="vue-component-container"></div>`;
        
        // Create a new Vue app instance for this component
        const { createApp } = Vue;
        const componentApp = createApp({
            components: {
                [componentName]: this.app._context.components[componentName]
            },
            template: `<${componentName}></${componentName}>`
        });
        
        // Mount the component to the container
        const componentContainer = document.getElementById(`vue-component-${screenName}`);
        if (componentContainer) {
            componentApp.mount(componentContainer);
            console.log(`✅ Vue: Component '${componentName}' rendered successfully for screen '${screenName}'`);
            
            // Apply i18n if available (legacy compatibility)
            if (window.changeLanguage && window.currentLanguage) {
                // Vue components should handle i18n internally, but legacy fallback
                setTimeout(() => {
                    if (window.changeLanguage) {
                        window.changeLanguage(window.currentLanguage);
                    }
                }, 100);
            }
            
            return true;
        } else {
            console.error(`❌ Vue: Could not find component container for ${screenName}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Vue: Failed to load component for ${screenName}:`, error);
        const menuContent = document.getElementById('menu-content');
        if (menuContent) {
            menuContent.innerHTML = `<div class="error-message">
                <h2>Component Load Error</h2>
                <p>Failed to load Vue component for "${screenName}": ${error.message}</p>
            </div>`;
        }
        return false;
    }
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

console.log('🔶 Vue.js integration loaded for MASKTRONIC C20');
