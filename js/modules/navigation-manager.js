/**
 * MASKSERVICE C20 - Navigation Manager Module
 * Handles navigation logic, history management, and view transitions
 */

class NavigationManager {
    constructor() {
        this.viewHistory = [];
        this.maxHistorySize = 50;
        this.navigationListeners = [];
        this.beforeNavigationListeners = [];
        this.currentRoute = null;
        this.isNavigating = false;
        this.navigationQueue = [];
        this.init();
    }

    init() {
        this.bindBrowserEvents();
        console.log('🧭 NavigationManager initialized');
    }

    /**
     * Bind browser navigation events
     */
    bindBrowserEvents() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            this.handleBrowserNavigation(event);
        });

        // Handle hash changes
        window.addEventListener('hashchange', (event) => {
            this.handleHashChange(event);
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    /**
     * Navigate to a specific route
     * @param {Object} route - Route object {view, language, action}
     * @param {Object} options - Navigation options
     * @returns {Promise} Navigation promise
     */
    async navigate(route, options = {}) {
        if (this.isNavigating && !options.force) {
            // Queue navigation if already navigating
            return new Promise((resolve, reject) => {
                this.navigationQueue.push({ route, options, resolve, reject });
            });
        }

        try {
            this.isNavigating = true;

            // Validate route
            if (!this.validateRoute(route)) {
                throw new Error(`Invalid route: ${JSON.stringify(route)}`);
            }

            // Execute before-navigation listeners
            const shouldContinue = await this.executeBeforeNavigationListeners(route, options);
            if (!shouldContinue) {
                console.log('🚫 Navigation cancelled by before-navigation listener');
                return false;
            }

            // Store previous route for history
            const previousRoute = this.currentRoute;

            // Update current route
            this.currentRoute = { ...route };

            // Add to history (unless it's a replace operation)
            if (!options.replace && previousRoute) {
                this.addToHistory(previousRoute);
            }

            // Update browser URL
            if (options.updateUrl !== false) {
                this.updateBrowserUrl(route, options);
            }

            // Execute view transition
            await this.executeViewTransition(route, previousRoute, options);

            // Notify navigation listeners
            this.notifyNavigationListeners(route, previousRoute, options);

            console.log('🎯 Navigation completed:', {
                from: previousRoute,
                to: route,
                options: options
            });

            return true;

        } catch (error) {
            console.error('❌ Navigation failed:', error);
            throw error;
        } finally {
            this.isNavigating = false;
            this.processNavigationQueue();
        }
    }

    /**
     * Navigate with action-only changes (preserves view and language)
     * @param {string} actionId - Action to navigate to
     * @param {Object} options - Navigation options
     */
    async navigateAction(actionId, options = {}) {
        if (!this.currentRoute) {
            console.warn('⚠️ No current route for action navigation');
            return false;
        }

        const newRoute = {
            ...this.currentRoute,
            action: actionId
        };

        return this.navigate(newRoute, { ...options, actionOnly: true });
    }

    /**
     * Navigate back in history
     * @param {number} steps - Number of steps to go back (default: 1)
     * @returns {Promise} Navigation promise
     */
    async navigateBack(steps = 1) {
        if (this.viewHistory.length === 0) {
            console.warn('⚠️ No history available for back navigation');
            return false;
        }

        const targetIndex = Math.max(0, this.viewHistory.length - steps);
        const targetRoute = this.viewHistory[targetIndex];

        // Remove history entries after the target
        this.viewHistory = this.viewHistory.slice(0, targetIndex);

        return this.navigate(targetRoute, { isBackNavigation: true, replace: true });
    }

    /**
     * Navigate forward (redo)
     * @returns {Promise} Navigation promise
     */
    async navigateForward() {
        // This would require implementing a forward history stack
        console.warn('⚠️ Forward navigation not implemented');
        return false;
    }

    /**
     * Replace current route without adding to history
     * @param {Object} route - Route to replace with
     * @param {Object} options - Navigation options
     */
    async replaceRoute(route, options = {}) {
        return this.navigate(route, { ...options, replace: true });
    }

    /**
     * Refresh current route
     * @param {Object} options - Refresh options
     */
    async refresh(options = {}) {
        if (!this.currentRoute) {
            console.warn('⚠️ No current route to refresh');
            return false;
        }

        return this.navigate(this.currentRoute, { ...options, replace: true, refresh: true });
    }

    /**
     * Handle browser navigation (back/forward buttons)
     * @param {PopStateEvent} event - Browser navigation event
     */
    handleBrowserNavigation(event) {
        if (event.state && event.state.route) {
            // Restore from browser state
            this.navigate(event.state.route, { 
                fromBrowser: true, 
                replace: true,
                updateUrl: false 
            });
        } else {
            // Parse current URL
            if (window.RouteParser) {
                const parser = new window.RouteParser();
                const route = parser.parseCurrentRoute();
                this.navigate(route, { 
                    fromBrowser: true, 
                    replace: true,
                    updateUrl: false 
                });
            }
        }
    }

    /**
     * Handle hash change events
     * @param {HashChangeEvent} event - Hash change event
     */
    handleHashChange(event) {
        if (!this.isNavigating) {
            // Parse new hash and navigate
            if (window.RouteParser) {
                const parser = new window.RouteParser();
                const route = parser.parseCurrentRoute();
                this.navigate(route, { 
                    fromHashChange: true, 
                    replace: true,
                    updateUrl: false 
                });
            }
        }
    }

    /**
     * Handle page visibility changes
     */
    handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            // Page became visible - might need to refresh data
            this.notifyVisibilityListeners(true);
        } else {
            // Page became hidden - might need to pause activities
            this.notifyVisibilityListeners(false);
        }
    }

    /**
     * Execute view transition
     * @param {Object} newRoute - Target route
     * @param {Object} previousRoute - Previous route
     * @param {Object} options - Transition options
     */
    async executeViewTransition(newRoute, previousRoute, options) {
        // Hide all screens first
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(newRoute.view);
        if (targetScreen) {
            targetScreen.classList.add('active');
            
            // Add transition effects if configured
            if (options.transition && !options.actionOnly) {
                await this.applyTransitionEffect(targetScreen, options.transition);
            }
        } else {
            console.warn(`⚠️ Target screen not found: ${newRoute.view}`);
        }

        // Update page title
        this.updatePageTitle(newRoute);

        // Update active menu items
        this.updateActiveMenuItems(newRoute);
    }

    /**
     * Apply transition effects
     * @param {HTMLElement} element - Element to animate
     * @param {string} transition - Transition type
     */
    async applyTransitionEffect(element, transition) {
        return new Promise((resolve) => {
            switch (transition) {
                case 'fade':
                    element.style.opacity = '0';
                    element.style.transition = 'opacity 0.3s ease-in-out';
                    setTimeout(() => {
                        element.style.opacity = '1';
                        setTimeout(resolve, 300);
                    }, 10);
                    break;
                    
                case 'slide':
                    element.style.transform = 'translateX(100%)';
                    element.style.transition = 'transform 0.3s ease-in-out';
                    setTimeout(() => {
                        element.style.transform = 'translateX(0)';
                        setTimeout(resolve, 300);
                    }, 10);
                    break;
                    
                default:
                    resolve();
            }
        });
    }

    /**
     * Update browser URL
     * @param {Object} route - Route to reflect in URL
     * @param {Object} options - URL update options
     */
    updateBrowserUrl(route, options) {
        if (window.RouteParser) {
            const parser = new window.RouteParser();
            const hash = parser.buildRouteHash(route.view, route.language, route.action);
            
            if (options.replace) {
                window.history.replaceState({ route }, '', hash);
            } else {
                window.history.pushState({ route }, '', hash);
            }
        }
    }

    /**
     * Update page title based on route
     * @param {Object} route - Current route
     */
    updatePageTitle(route) {
        const titles = {
            'login-screen': 'Login - MASKSERVICE C20',
            'menu-screen': 'Main Menu - MASKSERVICE C20',
            'test-screen': 'Testing - MASKSERVICE C20',
            'data-screen': 'Device Data - MASKSERVICE C20',
            'reports-screen': 'Reports - MASKSERVICE C20',
            'workshop-screen': 'Workshop - MASKSERVICE C20',
            'settings-screen': 'Settings - MASKSERVICE C20'
        };

        document.title = titles[route.view] || 'MASKSERVICE C20';
    }

    /**
     * Update active menu items
     * @param {Object} route - Current route
     */
    updateActiveMenuItems(route) {
        // Remove active class from all menu items
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => item.classList.remove('active'));

        // Add active class to current menu item
        const activeItem = document.querySelector(`[data-view="${route.view}"]`) ||
                          document.querySelector(`[data-action="${route.action}"]`);
        
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    /**
     * Add route to navigation history
     * @param {Object} route - Route to add to history
     */
    addToHistory(route) {
        this.viewHistory.push({ ...route, timestamp: Date.now() });
        
        // Limit history size
        if (this.viewHistory.length > this.maxHistorySize) {
            this.viewHistory = this.viewHistory.slice(-this.maxHistorySize);
        }

        console.log(`📚 Added to history: ${route.view}/${route.language}/${route.action}`);
    }

    /**
     * Get navigation history
     * @returns {Array} Navigation history array
     */
    getHistory() {
        return [...this.viewHistory];
    }

    /**
     * Clear navigation history
     */
    clearHistory() {
        this.viewHistory = [];
        console.log('🗑️ Navigation history cleared');
    }

    /**
     * Process queued navigation requests
     */
    async processNavigationQueue() {
        if (this.navigationQueue.length === 0) return;

        const { route, options, resolve, reject } = this.navigationQueue.shift();
        
        try {
            const result = await this.navigate(route, options);
            resolve(result);
        } catch (error) {
            reject(error);
        }
    }

    /**
     * Validate route object
     * @param {Object} route - Route to validate
     * @returns {boolean} True if valid
     */
    validateRoute(route) {
        if (!route || typeof route !== 'object') {
            return false;
        }

        if (!route.view || typeof route.view !== 'string') {
            return false;
        }

        return true;
    }

    /**
     * Add navigation listener
     * @param {Function} listener - Listener function
     */
    addNavigationListener(listener) {
        if (typeof listener === 'function') {
            this.navigationListeners.push(listener);
        }
    }

    /**
     * Remove navigation listener
     * @param {Function} listener - Listener function to remove
     */
    removeNavigationListener(listener) {
        const index = this.navigationListeners.indexOf(listener);
        if (index > -1) {
            this.navigationListeners.splice(index, 1);
        }
    }

    /**
     * Add before-navigation listener
     * @param {Function} listener - Listener function
     */
    addBeforeNavigationListener(listener) {
        if (typeof listener === 'function') {
            this.beforeNavigationListeners.push(listener);
        }
    }

    /**
     * Execute before-navigation listeners
     * @param {Object} route - Target route
     * @param {Object} options - Navigation options
     * @returns {Promise<boolean>} True if navigation should continue
     */
    async executeBeforeNavigationListeners(route, options) {
        for (const listener of this.beforeNavigationListeners) {
            try {
                const result = await listener(route, this.currentRoute, options);
                if (result === false) {
                    return false;
                }
            } catch (error) {
                console.error('❌ Before-navigation listener error:', error);
            }
        }
        return true;
    }

    /**
     * Notify navigation listeners
     * @param {Object} newRoute - New route
     * @param {Object} previousRoute - Previous route
     * @param {Object} options - Navigation options
     */
    notifyNavigationListeners(newRoute, previousRoute, options) {
        this.navigationListeners.forEach(listener => {
            try {
                listener(newRoute, previousRoute, options);
            } catch (error) {
                console.error('❌ Navigation listener error:', error);
            }
        });
    }

    /**
     * Notify visibility listeners
     * @param {boolean} isVisible - Page visibility state
     */
    notifyVisibilityListeners(isVisible) {
        // This could be extended to support visibility listeners
        console.log(`👁️ Page visibility changed: ${isVisible ? 'visible' : 'hidden'}`);
    }

    /**
     * Get current route
     * @returns {Object} Current route object
     */
    getCurrentRoute() {
        return this.currentRoute ? { ...this.currentRoute } : null;
    }

    /**
     * Check if currently navigating
     * @returns {boolean} True if navigation is in progress
     */
    isCurrentlyNavigating() {
        return this.isNavigating;
    }

    /**
     * Get navigation statistics
     * @returns {Object} Navigation statistics
     */
    getNavigationStats() {
        return {
            historySize: this.viewHistory.length,
            queuedNavigations: this.navigationQueue.length,
            isNavigating: this.isNavigating,
            listenerCount: this.navigationListeners.length,
            beforeListenerCount: this.beforeNavigationListeners.length
        };
    }

    /**
     * Destroy navigation manager
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('popstate', this.handleBrowserNavigation);
        window.removeEventListener('hashchange', this.handleHashChange);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);

        // Clear arrays
        this.viewHistory = [];
        this.navigationListeners = [];
        this.beforeNavigationListeners = [];
        this.navigationQueue = [];

        console.log('🗑️ NavigationManager destroyed');
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.NavigationManager = NavigationManager;
}
