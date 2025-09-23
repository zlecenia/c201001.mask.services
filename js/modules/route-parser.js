/**
 * MASKSERVICE C20 - Route Parser Module
 * URL parsing and route handling for advanced router
 * Format: PROTOCOL://DOMAIN:PORT/#/VIEW-ID/LANGUAGE/ACTION-ID
 */

class RouteParser {
    constructor() {
        this.currentView = 'login-screen';
        this.currentLanguage = 'pl';
        this.currentAction = 'default';
        this.routes = {};
    }

    /**
     * Parse current URL hash into route components
     * Supports both new format (/view/lang/action) and legacy format (#element-id)
     */
    parseCurrentRoute() {
        const hash = window.location.hash || '#/login-screen/pl/default';
        return this.parseRoute(hash);
    }

    /**
     * Parse route hash into components
     * @param {string} hash - URL hash to parse
     * @returns {Object} Parsed route object
     */
    parseRoute(hash) {
        if (!hash || hash === '#') {
            return this.getDefaultRoute();
        }

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
            action: parts[2] || this.currentAction,
            isLegacy: false,
            isValid: this.validateRoute(parts[0], parts[1], parts[2])
        };
    }

    /**
     * Parse legacy route format (#element-id)
     * @param {string} elementId - Legacy element ID
     * @returns {Object} Parsed legacy route object
     */
    parseLegacyRoute(elementId) {
        // Determine view based on element ID patterns
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
        } else if (elementId.includes('test')) {
            view = 'test-screen';
        } else if (elementId.includes('report')) {
            view = 'reports-screen';
        } else if (elementId.includes('workshop')) {
            view = 'workshop-screen';
        }

        return {
            view: view,
            language: this.currentLanguage,
            action: elementId,
            isLegacy: true,
            isValid: true
        };
    }

    /**
     * Build route hash from components
     * @param {string} view - Target view
     * @param {string} language - Target language
     * @param {string} action - Target action
     * @returns {string} Formatted route hash
     */
    buildRouteHash(view, language, action) {
        const targetView = view || this.currentView;
        const targetLang = language || this.currentLanguage;
        const targetAction = action || this.currentAction;
        
        return `#/${targetView}/${targetLang}/${targetAction}`;
    }

    /**
     * Build full URL with protocol, domain, port
     * @param {string} view - Target view
     * @param {string} language - Target language  
     * @param {string} action - Target action
     * @param {Object} config - URL configuration
     * @returns {string} Complete URL
     */
    buildFullURL(view, language, action, config = {}) {
        const targetView = view || this.currentView;
        const targetLang = language || this.currentLanguage;
        const targetAction = action || this.currentAction;
        
        const protocol = config.protocol || 'http';
        const domain = config.domain || 'localhost';
        const port = config.port || '8081';
        const hashPrefix = config.hashPrefix || '#/';
        
        return `${protocol}://${domain}:${port}/${hashPrefix}${targetView}/${targetLang}/${targetAction}`;
    }

    /**
     * Validate route components
     * @param {string} view - View to validate
     * @param {string} language - Language to validate
     * @param {string} action - Action to validate
     * @returns {boolean} True if route is valid
     */
    validateRoute(view, language, action) {
        const validViews = [
            'login-screen', 'menu-screen', 'test-screen', 'data-screen',
            'reports-screen', 'workshop-screen', 'settings-screen'
        ];
        
        const validLanguages = ['en', 'pl', 'de'];
        
        // View validation
        if (view && !validViews.includes(view)) {
            console.warn(`⚠️ Invalid view: ${view}`);
            return false;
        }
        
        // Language validation  
        if (language && !validLanguages.includes(language)) {
            console.warn(`⚠️ Invalid language: ${language}`);
            return false;
        }
        
        return true;
    }

    /**
     * Get default route configuration
     * @returns {Object} Default route object
     */
    getDefaultRoute() {
        return {
            view: 'login-screen',
            language: 'pl',
            action: 'default',
            isLegacy: false,
            isValid: true
        };
    }

    /**
     * Extract query parameters from URL
     * @param {string} url - URL to parse
     * @returns {Object} Query parameters object
     */
    parseQueryParams(url = window.location.href) {
        const params = {};
        const urlObj = new URL(url);
        
        for (const [key, value] of urlObj.searchParams) {
            params[key] = value;
        }
        
        return params;
    }

    /**
     * Build query string from parameters object
     * @param {Object} params - Parameters to serialize
     * @returns {string} Query string
     */
    buildQueryString(params) {
        const urlParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                urlParams.append(key, value);
            }
        });
        
        return urlParams.toString();
    }

    /**
     * Normalize route components (sanitize and validate)
     * @param {Object} route - Route object to normalize
     * @returns {Object} Normalized route object  
     */
    normalizeRoute(route) {
        return {
            view: this.sanitizeComponent(route.view) || this.currentView,
            language: this.sanitizeComponent(route.language) || this.currentLanguage,
            action: this.sanitizeComponent(route.action) || this.currentAction,
            isLegacy: Boolean(route.isLegacy),
            isValid: Boolean(route.isValid)
        };
    }

    /**
     * Sanitize route component (remove invalid characters)
     * @param {string} component - Component to sanitize
     * @returns {string} Sanitized component
     */
    sanitizeComponent(component) {
        if (!component || typeof component !== 'string') {
            return null;
        }
        
        // Remove potentially dangerous characters
        return component
            .replace(/[<>\"']/g, '')
            .replace(/javascript:/gi, '')
            .replace(/data:/gi, '')
            .trim();
    }

    /**
     * Check if two routes are equivalent
     * @param {Object} route1 - First route
     * @param {Object} route2 - Second route
     * @returns {boolean} True if routes are equivalent
     */
    routesEqual(route1, route2) {
        return route1.view === route2.view &&
               route1.language === route2.language &&
               route1.action === route2.action;
    }

    /**
     * Get route breadcrumb for navigation
     * @param {Object} route - Current route
     * @returns {Array} Breadcrumb array
     */
    getRouteBreadcrumb(route) {
        const breadcrumb = [
            { view: 'login-screen', language: route.language, label: 'Login' }
        ];
        
        if (route.view !== 'login-screen') {
            breadcrumb.push({
                view: route.view,
                language: route.language,
                action: route.action,
                label: this.getViewLabel(route.view)
            });
        }
        
        return breadcrumb;
    }

    /**
     * Get human-readable label for view
     * @param {string} view - View identifier
     * @returns {string} Human-readable label
     */
    getViewLabel(view) {
        const labels = {
            'login-screen': 'Login',
            'menu-screen': 'Main Menu',
            'test-screen': 'Testing',
            'data-screen': 'Device Data',
            'reports-screen': 'Reports',
            'workshop-screen': 'Workshop',
            'settings-screen': 'Settings'
        };
        
        return labels[view] || view;
    }

    /**
     * Set current route state
     * @param {Object} route - Route to set
     */
    setCurrentRoute(route) {
        const normalized = this.normalizeRoute(route);
        this.currentView = normalized.view;
        this.currentLanguage = normalized.language;  
        this.currentAction = normalized.action;
    }

    /**
     * Get current route state
     * @returns {Object} Current route object
     */
    getCurrentRoute() {
        return {
            view: this.currentView,
            language: this.currentLanguage,
            action: this.currentAction,
            isLegacy: false,
            isValid: true
        };
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.RouteParser = RouteParser;
}
