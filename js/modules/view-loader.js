/**
 * MASKSERVICE C20 - Dynamic View Loader
 * Dynamically loads HTML templates and screens from separate files
 * Optimized for 400x1280px display with lazy loading
 */

class ViewLoader {
    constructor() {
        this.cache = new Map();
        this.loadedViews = new Set();
        this.loadingPromises = new Map();
        this.baseViewPath = 'views/';
        
        // View registry - maps view IDs to their file paths
        this.viewRegistry = {
            // Screens
            'login-screen': 'screens/login-screen.html',
            'system-screen': 'screens/system-screen.html', 
            'user-menu-screen': 'screens/user-menu-screen.html',
            
            // Role-based menu screens
            'operator-menu-screen': 'screens/operator-menu-screen.html',
            'admin-menu-screen': 'screens/admin-menu-screen.html',
            'service-menu-screen': 'screens/service-menu-screen.html',
            'superuser-menu-screen': 'screens/superuser-menu-screen.html',
            
            // Templates
            'test-menu-template': 'templates/test-menu-template.html',
            'device-select-template': 'templates/device-select-template.html',
            'workshop-template': 'templates/workshop-template.html',
            'user-data-template': 'templates/user-data-template.html',
            'device-data-template': 'templates/device-data-template.html',
            'test-reports-template': 'templates/test-reports-template.html',
            'users-template': 'templates/users-template.html',
            'service-menu-template': 'templates/service-menu-template.html',
            'system-settings-template': 'templates/system-settings-template.html',
            'device-history-template': 'templates/device-history-template.html',
            'reports-view-template': 'templates/reports-view-template.html',
            'reports-batch-template': 'templates/reports-batch-template.html',
            'realtime-sensors-template': 'templates/realtime-sensors-template.html',
            'reports-schedule-template': 'templates/reports-schedule-template.html',
            'workshop-parts-template': 'templates/workshop-parts-template.html',
            'workshop-maintenance-template': 'templates/workshop-maintenance-template.html',
            'workshop-tools-template': 'templates/workshop-tools-template.html',
            'workshop-inventory-template': 'templates/workshop-inventory-template.html'
        };
        
        this.init();
    }
    
    init() {
        console.log('🔧 ViewLoader initialized with', Object.keys(this.viewRegistry).length, 'registered views');
    }
    
    /**
     * Load view HTML from file
     */
    async loadView(viewId) {
        // Check if already loaded
        if (this.cache.has(viewId)) {
            return this.cache.get(viewId);
        }
        
        // Check if already loading
        if (this.loadingPromises.has(viewId)) {
            return this.loadingPromises.get(viewId);
        }
        
        // Get file path
        const filePath = this.viewRegistry[viewId];
        if (!filePath) {
            throw new Error(`View ${viewId} not found in registry`);
        }
        
        const fullPath = this.baseViewPath + filePath;
        
        // Create loading promise
        const loadingPromise = this._fetchViewContent(fullPath, viewId);
        this.loadingPromises.set(viewId, loadingPromise);
        
        try {
            const content = await loadingPromise;
            this.cache.set(viewId, content);
            this.loadedViews.add(viewId);
            this.loadingPromises.delete(viewId);
            
            console.log(`✅ View loaded: ${viewId} (${content.length} chars)`);
            return content;
        } catch (error) {
            this.loadingPromises.delete(viewId);
            console.error(`❌ Failed to load view ${viewId}:`, error);
            throw error;
        }
    }
    
    /**
     * Fetch view content from server
     */
    async _fetchViewContent(path, viewId) {
        try {
            const response = await fetch(path + '?v=' + Date.now());
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const content = await response.text();
            
            // Validate content
            if (!content.trim()) {
                throw new Error('Empty view content');
            }
            
            return content;
        } catch (error) {
            console.error(`Failed to fetch ${path}:`, error);
            throw error;
        }
    }
    
    /**
     * Load and inject view into DOM
     */
    async loadAndInjectView(viewId, targetElement = null) {
        try {
            const content = await this.loadView(viewId);
            
            // Find target element
            let target = targetElement;
            if (!target) {
                target = document.getElementById(viewId);
                if (!target) {
                    // Create target element if it doesn't exist
                    target = document.createElement('div');
                    target.id = viewId;
                    
                    // Determine where to append based on view type
                    if (viewId.includes('screen')) {
                        // Append to main content area
                        const mainContent = document.querySelector('.main-content');
                        if (mainContent) {
                            mainContent.appendChild(target);
                        } else {
                            document.body.appendChild(target);
                        }
                    } else {
                        // Append to templates container
                        let templatesContainer = document.getElementById('templates');
                        if (!templatesContainer) {
                            templatesContainer = document.createElement('div');
                            templatesContainer.id = 'templates';
                            templatesContainer.style.display = 'none';
                            document.body.appendChild(templatesContainer);
                        }
                        templatesContainer.appendChild(target);
                    }
                }
            }
            
            // Inject content
            target.innerHTML = content;
            
            // Apply i18n if available
            if (window.changeLanguage && window.currentLanguage) {
                this._applyI18nToElement(target);
            }
            
            // Trigger load event
            this._triggerViewLoadEvent(viewId, target);
            
            return target;
        } catch (error) {
            console.error(`Failed to load and inject view ${viewId}:`, error);
            throw error;
        }
    }
    
    /**
     * Apply internationalization to loaded element
     */
    _applyI18nToElement(element) {
        try {
            const i18nElements = element.querySelectorAll('[data-i18n]');
            i18nElements.forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (key && window.i18nManager && window.i18nManager.translate) {
                    const translation = window.i18nManager.translate(key);
                    if (translation !== key) {
                        el.textContent = translation;
                    }
                }
            });
        } catch (error) {
            console.warn('Failed to apply i18n:', error);
        }
    }
    
    /**
     * Trigger custom event when view is loaded
     */
    _triggerViewLoadEvent(viewId, element) {
        const event = new CustomEvent('viewLoaded', {
            detail: {
                viewId: viewId,
                element: element,
                timestamp: new Date()
            }
        });
        
        document.dispatchEvent(event);
        element.dispatchEvent(event);
    }
    
    /**
     * Preload views for faster access
     */
    async preloadViews(viewIds) {
        console.log(`⚡ Preloading ${viewIds.length} views...`);
        
        const loadPromises = viewIds.map(viewId => {
            return this.loadView(viewId).catch(error => {
                console.warn(`Failed to preload ${viewId}:`, error);
                return null;
            });
        });
        
        const results = await Promise.all(loadPromises);
        const successful = results.filter(r => r !== null).length;
        
        console.log(`✅ Preloaded ${successful}/${viewIds.length} views`);
        return successful;
    }
    
    /**
     * Get loading statistics
     */
    getStats() {
        return {
            totalViews: Object.keys(this.viewRegistry).length,
            loadedViews: this.loadedViews.size,
            cachedViews: this.cache.size,
            loadingViews: this.loadingPromises.size,
            cacheHitRate: this.loadedViews.size > 0 ? 
                ((this.cache.size / this.loadedViews.size) * 100).toFixed(1) + '%' : '0%'
        };
    }
    
    /**
     * Clear cache and reset loader
     */
    clearCache() {
        this.cache.clear();
        this.loadedViews.clear();
        this.loadingPromises.clear();
        console.log('🗑️ ViewLoader cache cleared');
    }
    
    /**
     * Check if view exists in registry
     */
    hasView(viewId) {
        return this.viewRegistry.hasOwnProperty(viewId);
    }
    
    /**
     * Get all registered view IDs
     */
    getRegisteredViews() {
        return Object.keys(this.viewRegistry);
    }
    
    /**
     * Register new view dynamically
     */
    registerView(viewId, filePath) {
        this.viewRegistry[viewId] = filePath;
        console.log(`📝 Registered new view: ${viewId} -> ${filePath}`);
    }
    
    /**
     * Load view on demand with fallback
     */
    async loadViewWithFallback(viewId, fallbackContent = null) {
        try {
            return await this.loadAndInjectView(viewId);
        } catch (error) {
            console.warn(`Failed to load ${viewId}, using fallback:`, error);
            
            if (fallbackContent) {
                const target = document.getElementById(viewId) || document.createElement('div');
                target.id = viewId;
                target.innerHTML = fallbackContent;
                return target;
            }
            
            throw error;
        }
    }
}

// Initialize global ViewLoader instance
const viewLoader = new ViewLoader();

// Export to global scope
window.ViewLoader = ViewLoader;
window.viewLoader = viewLoader;

// Add event listener for preloading critical views
document.addEventListener('DOMContentLoaded', () => {
    // Preload critical views
    const criticalViews = ['login-screen', 'system-screen', 'user-menu-screen'];
    viewLoader.preloadViews(criticalViews);
});

console.log('✅ ViewLoader module loaded - Dynamic view loading enabled');
