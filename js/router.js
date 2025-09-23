/**
 * MASKSERVICE C20 - Advanced URL Router Module (Orchestrator)
 * Format: PROTOCOL://DOMAIN:PORT/VIEW-ID/LANGUAGE/ACTION-ID
 * 
 * This orchestrator delegates functionality to modular components:
 * - RouteParser: URL parsing and validation
 * - NavigationManager: Navigation logic and history
 * - StorageManager: Browser storage management
 * - ConfigLoader: Configuration loading and caching
 */

class C20Router {
    constructor() {
        this.config = null;
        this.currentView = 'login-screen';
        this.currentLanguage = 'pl';
        this.currentAction = 'default';
        this.routes = {};
        
        // Initialize modular components
        this.routeParser = null;
        this.navigationManager = null;
        this.storageManager = null;
        this.configLoader = null;
        
        this.init();
    }

    /**
     * Initialize router with modular components and config
     */
    async init() {
        this.initializeComponents();
        await this.loadConfig();
        this.loadFromStorage();
        this.initializeRoutes();
        this.bindEvents();
        console.log('🛣️ C20Router orchestrator initialized with modular components');
    }

    /**
     * Initialize modular components
     */
    initializeComponents() {
        // Initialize components if available
        if (window.RouteParser) {
            this.routeParser = new window.RouteParser();
        }
        if (window.NavigationManager) {
            this.navigationManager = new window.NavigationManager();
        }
        if (window.StorageManager) {
            this.storageManager = new window.StorageManager();
        }
        if (window.ConfigLoader) {
            this.configLoader = new window.ConfigLoader();
        }

        // Set up component integration
        if (this.navigationManager) {
            this.navigationManager.addNavigationListener((newRoute, previousRoute, options) => {
                this.handleNavigationChange(newRoute, previousRoute, options);
            });
        }
    }

    /**
     * Load router configuration using ConfigLoader module
     */
    async loadConfig() {
        if (this.configLoader) {
            try {
                this.config = await this.configLoader.loadConfig('router');
                
                // Set defaults from config
                if (this.config.default) {
                    this.currentView = this.config.default.view;
                    this.currentLanguage = this.config.default.language;  
                    this.currentAction = this.config.default.action;
                }
                
                console.log('✅ Router config loaded via ConfigLoader:', this.config);
            } catch (error) {
                console.warn('⚠️ Failed to load router config via ConfigLoader, using defaults:', error);
                this.config = this.getDefaultConfig();
            }
        } else {
            // Fallback to direct loading
            await this.loadConfigDirect();
        }
    }

    /**
     * Fallback direct config loading
     */
    async loadConfigDirect() {
        try {
            const response = await fetch('/config/router.json');
            this.config = await response.json();
            
            if (this.config.default) {
                this.currentView = this.config.default.view;
                this.currentLanguage = this.config.default.language;
                this.currentAction = this.config.default.action;
            }
            
            console.log('✅ Router config loaded directly:', this.config);
        } catch (error) {
            console.warn('⚠️ Failed to load router config, using defaults:', error);
            this.config = this.getDefaultConfig();
        }
    }

    /**
     * Load last settings using StorageManager module
     */
    loadFromStorage() {
        if (!this.config?.storage?.enabled) return;
        
        if (this.storageManager) {
            try {
                const lastView = this.storageManager.getLocal('last_view');
                const lastLanguage = this.storageManager.getLocal('last_language');
                const lastAction = this.storageManager.getLocal('last_action');
                
                if (lastView) this.currentView = lastView;
                if (lastLanguage) this.currentLanguage = lastLanguage;
                if (lastAction) this.currentAction = lastAction;
                
                console.log('✅ Settings loaded via StorageManager:', {
                    view: this.currentView,
                    language: this.currentLanguage,
                    action: this.currentAction
                });
            } catch (error) {
                console.warn('⚠️ Failed to load from StorageManager:', error);
            }
        } else {
            // Fallback to direct localStorage
            this.loadFromStorageDirect();
        }
    }

    /**
     * Fallback direct storage loading
     */
    loadFromStorageDirect() {
        try {
            const storageKeys = this.config?.storage?.keys || {
                lastView: 'c20_last_view',
                lastLanguage: 'c20_last_language',
                lastAction: 'c20_last_action'
            };
            
            const lastView = localStorage.getItem(storageKeys.lastView);
            const lastLanguage = localStorage.getItem(storageKeys.lastLanguage);
            const lastAction = localStorage.getItem(storageKeys.lastAction);
            
            if (lastView) this.currentView = lastView;
            if (lastLanguage) this.currentLanguage = lastLanguage;
            if (lastAction) this.currentAction = lastAction;
            
            console.log('✅ Settings loaded directly from localStorage');
        } catch (error) {
            console.warn('⚠️ Failed to load from storage:', error);
        }
    }

    /**
     * Save current settings using StorageManager module
     */
    saveToStorage() {
        if (!this.config?.storage?.enabled) return;
        
        if (this.storageManager) {
            try {
                this.storageManager.setLocal('last_view', this.currentView);
                this.storageManager.setLocal('last_language', this.currentLanguage);
                this.storageManager.setLocal('last_action', this.currentAction);
                
                console.log('💾 Settings saved via StorageManager');
            } catch (error) {
                console.warn('⚠️ Failed to save via StorageManager:', error);
            }
        } else {
            // Fallback to direct localStorage
            this.saveToStorageDirect();
        }
    }

    /**
     * Fallback direct storage saving
     */
    saveToStorageDirect() {
        try {
            const storageKeys = this.config?.storage?.keys || {
                lastView: 'c20_last_view',
                lastLanguage: 'c20_last_language',
                lastAction: 'c20_last_action'
            };
            
            localStorage.setItem(storageKeys.lastView, this.currentView);
            localStorage.setItem(storageKeys.lastLanguage, this.currentLanguage);
            localStorage.setItem(storageKeys.lastAction, this.currentAction);
            
            console.log('💾 Settings saved directly to localStorage');
        } catch (error) {
            console.warn('⚠️ Failed to save to storage:', error);
        }
    }

    /**
     * Get default configuration fallback
     */
    getDefaultConfig() {
        return {
            default: {
                protocol: 'http',
                domain: 'localhost',
                port: '8081',
                view: 'login-screen',
                language: 'pl',
                action: 'default'
            },
            storage: { enabled: true },
            navigation: { actionOnlyChanges: true }
        };
    }

    /**
     * Initialize all available routes and their configurations
     */
    initializeRoutes() {
        this.routes = {
            'login-screen': {
                element: '#login-screen',
                title: 'Login Screen',
                actions: [
                    'login-scanner-btn',
                    'login-keyword-btn', 
                    'login-operator-btn',
                    'login-admin-btn',
                    'login-superuser-btn',
                    'login-serwisant-btn',
                    'key-*', // Virtual keyboard keys
                    'password-input'
                ]
            },
            'user-menu-screen': {
                element: '#user-menu-screen',
                title: 'User Menu',
                actions: [
                    'menu-item-*',
                    'logout-btn'
                ]
            },
            'system-screen': {
                element: '#system-screen',
                title: 'System View',
                actions: [
                    'system-info',
                    'system-status'
                ]
            },
            'data-screen': {
                element: '#data-screen', 
                title: 'Data Sensors',
                actions: [
                    'pressure-sensor',
                    'temperature-sensor',
                    'humidity-sensor'
                ]
            },
            'settings-screen': {
                element: '#settings-screen',
                title: 'System Settings',
                actions: [
                    'device-settings',
                    'network-settings',
                    'system-config',
                    'save-settings-btn'
                ]
            }
        };

        console.log('✅ Router routes initialized:', Object.keys(this.routes));
    }

    /**
     * Bind event listeners for hash changes and navigation
     */
    bindEvents() {
        // Listen to hash changes
        window.addEventListener('hashchange', (e) => {
            this.handleHashChange(e);
        });

        // Listen to initial page load
        window.addEventListener('load', () => {
            this.handleInitialRoute();
        });

        // Override UI Tester hash navigation
        if (window.uiTester) {
            this.integrateWithUITester();
        }
    }

    /**
     * Parse URL hash using RouteParser module
     * Format: #/view-id/language/action-id
     */
    parseRoute(hash = window.location.hash) {
        if (this.routeParser) {
            try {
                const route = this.routeParser.parseRoute(hash);
                console.log('🔍 Route parsed via RouteParser:', route);
                return route;
            } catch (error) {
                console.warn('⚠️ RouteParser failed, using fallback:', error);
            }
        }
        
        // Fallback direct parsing
        return this.parseRouteDirect(hash);
    }

    /**
     * Fallback direct route parsing
     */
    parseRouteDirect(hash = window.location.hash) {
        // Remove # and split by /
        const cleanHash = hash.replace('#', '');
        
        // Handle legacy format (#element-id)
        if (!cleanHash.startsWith('/')) {
            return this.parseLegacyRoute(cleanHash);
        }

        // New format: /view-id/language/action-id
        const parts = cleanHash.split('/').filter(part => part.length > 0);
        
        return {
            view: parts[0] || this.currentView,
            language: parts[1] || this.currentLanguage,
            action: parts[2] || null,
            isLegacy: false
        };
    }

    /**
     * Parse legacy route format (#element-id)
     */
    parseLegacyRoute(elementId) {
        // Determine view based on element ID
        let view = this.currentView;
        
        if (elementId.startsWith('login-')) {
            view = 'login-screen';
        } else if (elementId.startsWith('menu-')) {
            view = 'menu-screen';
        } else if (elementId.startsWith('key-')) {
            view = 'login-screen'; // Virtual keyboard is on login screen
        } else if (elementId.includes('settings')) {
            view = 'settings-screen';
        } else if (elementId.includes('data') || elementId.includes('pressure')) {
            view = 'data-screen';
        }

        return {
            view: view,
            language: this.currentLanguage,
            action: elementId,
            isLegacy: true
        };
    }

    /**
     * Build full URL with protocol, domain, port format
     * Format: PROTOCOL://DOMAIN:PORT/#/VIEW/LANGUAGE/ACTION
     */
    buildFullURL(view = null, language = null, action = null) {
        const config = this.config?.default || this.getDefaultConfig().default;
        const targetView = view || this.currentView;
        const targetLang = language || this.currentLanguage;
        const targetAction = action || this.currentAction;
        
        const protocol = config.protocol || 'http';
        const domain = config.domain || 'localhost';
        const port = config.port || '8081';
        const hashPrefix = this.config?.navigation?.hashPrefix || '#/';
        
        return `${protocol}://${domain}:${port}/${hashPrefix}${targetView}/${targetLang}/${targetAction}`;
    }

    /**
     * Navigate with action-only changes using NavigationManager
     */
    navigateAction(actionId) {
        if (this.navigationManager) {
            try {
                return this.navigationManager.navigateAction(actionId);
            } catch (error) {
                console.warn('⚠️ NavigationManager.navigateAction failed, using fallback:', error);
            }
        }
        
        // Fallback to direct navigation
        return this.navigateActionDirect(actionId);
    }

    /**
     * Fallback direct action navigation
     */
    navigateActionDirect(actionId) {
        if (!this.config?.navigation?.actionOnlyChanges) {
            // Fallback to regular navigation
            this.navigate(this.currentView, this.currentLanguage, actionId);
            return;
        }
        
        // Only change action, preserve view and language
        this.currentAction = actionId;
        this.saveToStorage();
        
        // Update URL hash using standard buildRouteHash function
        const newHash = this.buildRouteHash(this.currentView, this.currentLanguage, actionId);
        window.location.hash = newHash;
        
        console.log('🎯 Action-only navigation (direct):', {
            view: this.currentView,
            language: this.currentLanguage,
            action: actionId,
            fullURL: this.buildFullURL()
        });
    }

    /**
     * Navigate to a specific route using NavigationManager
     */
    navigate(view, language = null, action = null, updateHash = true) {
        const targetLang = language || this.currentLanguage;
        const route = {
            view: view,
            language: targetLang, 
            action: action
        };

        if (this.navigationManager) {
            try {
                const options = { updateUrl: updateHash };
                return this.navigationManager.navigate(route, options);
            } catch (error) {
                console.warn('⚠️ NavigationManager.navigate failed, using fallback:', error);
            }
        }

        // Fallback to direct navigation
        return this.navigateDirect(view, language, action, updateHash);
    }

    /**
     * Fallback direct navigation
     */
    navigateDirect(view, language = null, action = null, updateHash = true) {
        const targetLang = language || this.currentLanguage;
        const route = {
            view: view,
            language: targetLang, 
            action: action
        };

        console.log('🛣️ Navigating directly to:', route);

        // Validate route
        if (!this.routes[view]) {
            console.warn('⚠️ Unknown view:', view);
            return false;
        }

        // Update internal state
        this.currentView = view;
        this.currentLanguage = targetLang;
        this.currentAction = action;

        // Save to browser storage
        this.saveToStorage();

        // Update hash if requested (using new full format)
        if (updateHash) {
            const newHash = this.buildRouteHash(view, targetLang, action);
            window.location.hash = newHash;
        }

        // Trigger view change
        this.showView(view);
        
        // Update language if changed
        if (language && window.changeLanguage) {
            window.changeLanguage(targetLang);
        }

        // Focus action element if specified
        if (action) {
            this.focusActionElement(action);
        }

        // Emit navigation event
        this.emitNavigationEvent(route);

        return true;
    }

    /**
     * Build hash string from route components (always full format)
     */
    buildRouteHash(view, language, action) {
        // Always use full format: #/VIEW-ID/LANGUAGE/ACTION-ID
        const viewId = view || this.currentView || 'login-screen';
        const lang = language || this.currentLanguage || 'pl';
        const actionId = action || 'default';
        
        return `#/${viewId}/${lang}/${actionId}`;
    }

    /**
     * Show specific view and hide others
     */
    showView(viewId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.querySelector(`#${viewId}`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            console.log('✅ View shown:', viewId);
            
            // Trigger system-screen loading if navigating to system-screen - CRITICAL INTEGRATION!
            if (viewId === 'system-screen' && window.initSystemScreen) {
                console.log('🚀 Triggering system-screen loading animation...');
                window.initSystemScreen();
            }
        } else {
            console.warn('⚠️ View element not found:', viewId);
        }
    }

    /**
     * Focus on action element
     */
    focusActionElement(actionId) {
        const element = document.getElementById(actionId);
        if (element) {
            // Scroll into view
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add highlight effect
            element.classList.add('router-highlight');
            setTimeout(() => {
                element.classList.remove('router-highlight');
            }, 2000);

            console.log('🎯 Action element focused:', actionId);
        }
    }

    /**
     * Handle hash change events
     */
    handleHashChange(event) {
        const route = this.parseRoute();
        console.log('🛣️ Hash changed, parsed route:', route);
        
        this.navigate(route.view, route.language, route.action, false);
    }

    /**
     * Handle initial page load routing
     */
    handleInitialRoute() {
        const route = this.parseRoute();
        console.log('🛣️ Initial route:', route);
        
        if (route.isLegacy) {
            // Convert legacy route to new format
            const newHash = this.buildRouteHash(route.view, route.language, route.action);
            window.location.hash = newHash;
        } else {
            this.navigate(route.view, route.language, route.action, false);
        }
    }

    /**
     * Integrate with UI Tester for automated testing
     */
    integrateWithUITester() {
        // Override UI Tester's hash navigation
        if (window.uiTester && window.uiTester.logInteraction) {
            const originalLogInteraction = window.uiTester.logInteraction;
            
            window.uiTester.logInteraction = (type, element, details) => {
                // Call original method
                originalLogInteraction.call(window.uiTester, type, element, details);
                
                // Add router integration
                if (type === 'click' && element.id) {
                    this.handleUITesterClick(element);
                }
            };
        }

        console.log('✅ Router integrated with UI Tester');
    }

    /**
     * Handle UI Tester click events
     */
    handleUITesterClick(element) {
        const elementId = element.id;
        const currentView = this.getCurrentViewFromElement(element);
        
        // Update route with new action
        this.navigate(currentView, this.currentLanguage, elementId);
    }

    /**
     * Determine current view from element context
     */
    getCurrentViewFromElement(element) {
        const screen = element.closest('.screen');
        return screen ? screen.id : this.currentView;
    }

    /**
     * Emit navigation event for other modules
     */
    emitNavigationEvent(route) {
        const event = new CustomEvent('c20-navigation', {
            detail: {
                route: route,
                timestamp: new Date().toISOString(),
                history: this.viewHistory
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Get current route information
     */
    getCurrentRoute() {
        return {
            view: this.currentView,
            language: this.currentLanguage,
            action: this.currentAction,
            url: window.location.href,
            hash: window.location.hash
        };
    }

    /**
     * Handle navigation changes from NavigationManager
     */
    handleNavigationChange(newRoute, previousRoute, options) {
        // Update internal state
        this.currentView = newRoute.view;
        this.currentLanguage = newRoute.language;
        this.currentAction = newRoute.action;
        
        // Save to storage
        this.saveToStorage();
        
        // Trigger view change
        this.showView(newRoute.view);
        
        // Update language if changed
        if (newRoute.language !== previousRoute?.language && window.changeLanguage) {
            window.changeLanguage(newRoute.language);
        }
        
        // Focus action element if specified
        if (newRoute.action) {
            this.focusActionElement(newRoute.action);
        }
        
        // Emit navigation event for backward compatibility
        this.emitNavigationEvent(newRoute);
        
        console.log('🔄 Navigation change handled:', { newRoute, previousRoute, options });
    }

    /**
     * Navigate back in history using NavigationManager
     */
    goBack() {
        if (this.navigationManager) {
            try {
                return this.navigationManager.navigateBack();
            } catch (error) {
                console.warn('⚠️ NavigationManager.navigateBack failed, using fallback:', error);
            }
        }
        
        // Fallback to direct history navigation
        return this.goBackDirect();
    }

    /**
     * Fallback direct history navigation
     */
    goBackDirect() {
        // This is a basic implementation since we don't have access to NavigationManager's history
        console.warn('⚠️ Direct history navigation not fully implemented without NavigationManager');
        return false;
    }

    /**
     * Get navigation breadcrumb
     */
    getBreadcrumb() {
        return this.viewHistory.map(route => ({
            view: route.view,
            title: this.routes[route.view]?.title || route.view,
            action: route.action
        }));
    }

    /**
     * Generate sitemap of all routes
     */
    generateSitemap() {
        const sitemap = {};
        
        Object.keys(this.routes).forEach(viewId => {
            const view = this.routes[viewId];
            sitemap[viewId] = {
                title: view.title,
                actions: view.actions,
                urls: ['pl', 'en', 'de'].map(lang => 
                    view.actions.map(action => 
                        `${window.location.origin}${window.location.pathname}#/${viewId}/${lang}/${action}`
                    )
                ).flat()
            };
        });
        
        return sitemap;
    }
}

// Create global router instance
window.C20Router = new C20Router();

// Export functions for global access
window.navigateTo = (view, language, action) => window.C20Router.navigate(view, language, action);
window.navigateAction = (actionId) => window.C20Router.navigateAction(actionId);
window.buildFullURL = (view, language, action) => window.C20Router.buildFullURL(view, language, action);
window.getCurrentRoute = () => window.C20Router.getCurrentRoute();
window.getRouteBreadcrumb = () => window.C20Router.getBreadcrumb();
window.saveRouterSettings = () => window.C20Router.saveToStorage();
window.loadRouterSettings = () => window.C20Router.loadFromStorage();

console.log('✅ Router Module initialized');
