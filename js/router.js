/**
 * MASKSERVICE C20 - Advanced URL Router Module
 * Format: PROTOCOL://DOMAIN:PORT/VIEW-ID/LANGUAGE/ACTION-ID
 */

class C20Router {
    constructor() {
        this.config = null;
        this.currentView = 'login-screen';
        this.currentLanguage = 'pl';
        this.currentAction = 'default';
        this.viewHistory = [];
        this.routes = {};
        this.storageKeys = {
            lastView: 'c20_last_view',
            lastLanguage: 'c20_last_language',
            lastAction: 'c20_last_action',
            userPreferences: 'c20_user_prefs'
        };
        this.init();
    }

    /**
     * Initialize router with config and storage
     */
    async init() {
        await this.loadConfig();
        this.loadFromStorage();
        this.initializeRoutes();
        this.bindEvents();
        console.log('🛣️ C20Router initialized with config and storage');
    }

    /**
     * Load router configuration from config/router.json
     */
    async loadConfig() {
        try {
            const response = await fetch('/config/router.json');
            this.config = await response.json();
            
            // Set defaults from config
            this.currentView = this.config.default.view;
            this.currentLanguage = this.config.default.language;
            this.currentAction = this.config.default.action;
            this.storageKeys = this.config.storage.keys;
            
            console.log('✅ Router config loaded:', this.config);
        } catch (error) {
            console.warn('⚠️ Failed to load router config, using defaults:', error);
            this.config = this.getDefaultConfig();
        }
    }

    /**
     * Load last settings from browser storage
     */
    loadFromStorage() {
        if (!this.config?.storage?.enabled) return;
        
        try {
            const lastView = localStorage.getItem(this.storageKeys.lastView);
            const lastLanguage = localStorage.getItem(this.storageKeys.lastLanguage);
            const lastAction = localStorage.getItem(this.storageKeys.lastAction);
            
            if (lastView) this.currentView = lastView;
            if (lastLanguage) this.currentLanguage = lastLanguage;
            if (lastAction) this.currentAction = lastAction;
            
            console.log('✅ Settings loaded from storage:', {
                view: this.currentView,
                language: this.currentLanguage,
                action: this.currentAction
            });
        } catch (error) {
            console.warn('⚠️ Failed to load from storage:', error);
        }
    }

    /**
     * Save current settings to browser storage
     */
    saveToStorage() {
        if (!this.config?.storage?.enabled) return;
        
        try {
            localStorage.setItem(this.storageKeys.lastView, this.currentView);
            localStorage.setItem(this.storageKeys.lastLanguage, this.currentLanguage);
            localStorage.setItem(this.storageKeys.lastAction, this.currentAction);
            
            console.log('💾 Settings saved to storage');
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
            'menu-screen': {
                element: '#menu-screen',
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
     * Parse URL hash into route components
     * Format: #/view-id/language/action-id
     */
    parseRoute(hash = window.location.hash) {
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
     * Navigate with action-only changes (preserves view and language)
     */
    navigateAction(actionId) {
        if (!this.config?.navigation?.actionOnlyChanges) {
            // Fallback to regular navigation
            this.navigate(this.currentView, this.currentLanguage, actionId);
            return;
        }
        
        // Only change action, preserve view and language
        this.currentAction = actionId;
        this.saveToStorage();
        
        // Update URL hash with full format
        const newHash = `#/${this.currentView}/${this.currentLanguage}/${actionId}`;
        window.location.hash = newHash;
        
        console.log('🎯 Action-only navigation:', {
            view: this.currentView,
            language: this.currentLanguage,
            action: actionId,
            fullURL: this.buildFullURL()
        });
    }

    /**
     * Navigate to a specific route
     */
    navigate(view, language = null, action = null, updateHash = true) {
        const targetLang = language || this.currentLanguage;
        const route = {
            view: view,
            language: targetLang, 
            action: action
        };

        console.log('🛣️ Navigating to:', route);

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

        // Add to history
        this.viewHistory.push({
            ...route,
            timestamp: new Date().toISOString()
        });

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
     * Build hash string from route components
     */
    buildRouteHash(view, language, action) {
        let hash = `/${view}`;
        
        if (language) {
            hash += `/${language}`;
        }
        
        if (action) {
            hash += `/${action}`;
        }
        
        return hash;
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
     * Navigate back in history
     */
    goBack() {
        if (this.viewHistory.length > 1) {
            // Remove current route
            this.viewHistory.pop();
            
            // Get previous route
            const previousRoute = this.viewHistory[this.viewHistory.length - 1];
            this.navigate(previousRoute.view, previousRoute.language, previousRoute.action);
            
            return true;
        }
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
