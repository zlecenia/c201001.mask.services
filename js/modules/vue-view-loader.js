/**
 * MASKSERVICE C20 - Vue.js Compatible View Loader
 * Replaces legacy HTML loading with Vue component mounting
 * Post-migration integration layer for Vue components
 */

class VueViewLoader {
    constructor() {
        this.cache = new Map();
        this.loadedViews = new Set();
        this.activeComponents = new Map();
        
        // Vue Component Registry - maps view IDs to Vue component names
        this.vueComponentRegistry = {
            // Screens (Vue Components)
            'login-screen': 'LoginScreen',
            'system-screen': 'SystemScreen', 
            'user-menu-screen': 'UserMenuScreen',
            
            // Templates (Vue Components)
            'test-menu-template': 'TestMenuTemplate',
            'device-select-template': 'DeviceSelectTemplate',
            'workshop-template': 'WorkshopTemplate',
            'user-data-template': 'UserDataTemplate',
            'device-data-template': 'DeviceDataTemplate',
            'test-reports-template': 'TestReportsTemplate',
            'users-template': 'UsersTemplate',
            'service-menu-template': 'ServiceMenuTemplate',
            'system-settings-template': 'SystemSettingsTemplate',
            'device-history-template': 'DeviceHistoryTemplate',
            'reports-view-template': 'ReportsViewTemplate',
            'reports-batch-template': 'ReportsBatchTemplate',
            'realtime-sensors-template': 'RealtimeSensorsTemplate',
            'reports-schedule-template': 'ReportsScheduleTemplate',
            'workshop-parts-template': 'WorkshopPartsTemplate',
            'workshop-maintenance-template': 'WorkshopMaintenanceTemplate',
            'workshop-tools-template': 'WorkshopToolsTemplate',
            'workshop-inventory-template': 'WorkshopInventoryTemplate'
        };
        
        this.init();
    }
    
    init() {
        console.log('🔧 VueViewLoader initialized with', Object.keys(this.vueComponentRegistry).length, 'Vue components');
        
        // Wait for Vue app to be ready
        this.waitForVueApp();
    }
    
    waitForVueApp() {
        if (window.MaskServiceVue && window.MaskServiceVue.mount) {
            console.log('✅ Vue app detected, VueViewLoader ready');
            this.vueAppReady = true;
        } else {
            console.log('⏳ Waiting for Vue app...');
            setTimeout(() => this.waitForVueApp(), 100);
        }
    }
    
    /**
     * Load Vue component instead of HTML file
     */
    async loadView(viewId) {
        console.log(`🔶 VueViewLoader: Loading view ${viewId}`);
        
        // Check if already loaded
        if (this.cache.has(viewId)) {
            console.log(`✅ View ${viewId} loaded from cache`);
            return this.cache.get(viewId);
        }
        
        // Get Vue component name
        const componentName = this.vueComponentRegistry[viewId];
        if (!componentName) {
            throw new Error(`Vue component for view ${viewId} not found in registry`);
        }
        
        // Check if Vue component exists
        if (!window.MaskServiceVue || !window[componentName]) {
            throw new Error(`Vue component ${componentName} not loaded`);
        }
        
        // Create mock content for compatibility with existing code
        const mockContent = `<div id="${viewId}" class="vue-component-placeholder">
            <!-- Vue component ${componentName} will be mounted here -->
        </div>`;
        
        this.cache.set(viewId, mockContent);
        this.loadedViews.add(viewId);
        
        console.log(`✅ Vue view registered: ${viewId} -> ${componentName}`);
        return mockContent;
    }
    
    /**
     * Load and inject Vue component into DOM
     */
    async loadAndInjectView(viewId, targetElement = null) {
        console.log(`🔶 VueViewLoader: Injecting view ${viewId}`);
        
        const componentName = this.vueComponentRegistry[viewId];
        if (!componentName) {
            throw new Error(`Vue component for view ${viewId} not found`);
        }
        
        // Get or create target element
        const target = targetElement || document.getElementById('main-content') || document.body;
        
        // Create component container
        const container = document.createElement('div');
        container.id = `${viewId}-container`;
        container.className = 'vue-component-container';
        
        // Clear target and add container
        target.innerHTML = '';
        target.appendChild(container);
        
        // Trigger Vue component render through Vue app
        if (window.MaskServiceVue && window.MaskServiceVue.renderComponent) {
            try {
                await window.MaskServiceVue.renderComponent(componentName, container);
                console.log(`✅ Vue component ${componentName} rendered for ${viewId}`);
            } catch (error) {
                console.error(`❌ Failed to render Vue component ${componentName}:`, error);
                // Fallback to basic component mounting
                this.fallbackComponentMount(componentName, container, viewId);
            }
        } else {
            // Direct component mounting fallback
            this.fallbackComponentMount(componentName, container, viewId);
        }
        
        this._triggerViewLoadEvent(viewId, container);
        this.activeComponents.set(viewId, container);
        
        return container;
    }
    
    /**
     * Fallback component mounting when Vue app methods not available
     */
    fallbackComponentMount(componentName, container, viewId) {
        console.log(`🔄 Fallback mounting for ${componentName}`);
        
        // Create Vue component template placeholder
        container.innerHTML = `
            <div class="vue-component" data-component="${componentName}">
                <div class="vue-loading">
                    <h3>Loading ${componentName}...</h3>
                    <p>Vue component will be mounted here</p>
                </div>
            </div>
        `;
        
        // Attempt to trigger Vue component through global navigation
        if (window.MaskServiceVue && window.MaskServiceVue.navigate) {
            setTimeout(() => {
                window.MaskServiceVue.navigate(viewId);
            }, 100);
        }
    }
    
    /**
     * Preload Vue components (compatibility method)
     */
    async preloadViews(viewIds) {
        console.log(`⚡ VueViewLoader: Preloading ${viewIds.length} Vue components...`);
        
        const loadPromises = viewIds.map(viewId => {
            return this.loadView(viewId).catch(error => {
                console.warn(`Failed to preload Vue component for ${viewId}:`, error);
                return null;
            });
        });
        
        const results = await Promise.all(loadPromises);
        const successful = results.filter(r => r !== null).length;
        
        console.log(`✅ Preloaded ${successful}/${viewIds.length} Vue components`);
        return successful;
    }
    
    /**
     * Trigger custom event when view is loaded
     */
    _triggerViewLoadEvent(viewId, element) {
        const event = new CustomEvent('viewLoaded', {
            detail: {
                viewId: viewId,
                element: element,
                componentType: 'vue',
                timestamp: new Date()
            }
        });
        
        document.dispatchEvent(event);
        element.dispatchEvent(event);
    }
    
    /**
     * Get loading statistics
     */
    getStats() {
        return {
            totalComponents: Object.keys(this.vueComponentRegistry).length,
            loadedViews: this.loadedViews.size,
            cachedViews: this.cache.size,
            activeComponents: this.activeComponents.size,
            componentType: 'Vue.js'
        };
    }
    
    /**
     * Clear cache and reset loader
     */
    clearCache() {
        this.cache.clear();
        this.loadedViews.clear();
        this.activeComponents.clear();
        console.log('🗑️ VueViewLoader cache cleared');
    }
    
    /**
     * Check if Vue component exists for view
     */
    hasView(viewId) {
        return this.vueComponentRegistry.hasOwnProperty(viewId);
    }
    
    /**
     * Get all registered Vue component view IDs
     */
    getRegisteredViews() {
        return Object.keys(this.vueComponentRegistry);
    }
    
    /**
     * Register new Vue component view dynamically
     */
    registerVueComponent(viewId, componentName) {
        this.vueComponentRegistry[viewId] = componentName;
        console.log(`📝 Registered new Vue component: ${viewId} -> ${componentName}`);
    }
    
    /**
     * Load view with Vue component fallback
     */
    async loadViewWithFallback(viewId, fallbackContent = null) {
        try {
            return await this.loadAndInjectView(viewId);
        } catch (error) {
            console.warn(`Failed to load Vue component for ${viewId}, using fallback:`, error);
            
            if (fallbackContent) {
                const target = document.getElementById(viewId) || document.createElement('div');
                target.id = viewId;
                target.innerHTML = fallbackContent;
                return target;
            }
            
            // Ultimate fallback - create basic Vue placeholder
            const placeholder = document.createElement('div');
            placeholder.id = viewId;
            placeholder.innerHTML = `
                <div class="vue-component-error">
                    <h3>Component ${viewId} not available</h3>
                    <p>Vue component could not be loaded</p>
                </div>
            `;
            return placeholder;
        }
    }
}

// Initialize global VueViewLoader instance (replaces ViewLoader)
const vueViewLoader = new VueViewLoader();

// Export to global scope with backward compatibility
window.VueViewLoader = VueViewLoader;
window.vueViewLoader = vueViewLoader;

// Replace legacy ViewLoader with Vue-compatible version
window.ViewLoader = VueViewLoader;
window.viewLoader = vueViewLoader;

console.log('✅ VueViewLoader module loaded - Vue.js component loading enabled');
console.log('🔄 Legacy ViewLoader replaced with Vue-compatible version');
