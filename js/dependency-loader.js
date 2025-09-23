/**
 * MASKSERVICE C20 - Dependency Loading Framework
 * Node.js-like dependency management for frontend modules
 * Automatic cascade loading with circular dependency detection
 */

class DependencyLoader {
    constructor() {
        this.modules = new Map();
        this.loading = new Set();
        this.loaded = new Set();
        this.dependencies = new Map();
        this.callbacks = new Map();
        
        // Initialize with cache busting
        this.version = Date.now();
        
        console.log('📦 DependencyLoader initialized with cache-busting version:', this.version);
        this.init();
    }

    init() {
        // Make global for easy access
        if (typeof window !== 'undefined') {
            window.DependencyLoader = this;
            window.require = this.require.bind(this);
            window.define = this.define.bind(this);
        }
    }

    /**
     * Define a module with its dependencies (like AMD define)
     * @param {string} name - Module name
     * @param {string[]} dependencies - Array of dependency names
     * @param {Function} factory - Module factory function
     */
    define(name, dependencies = [], factory = null) {
        // Handle different call signatures
        if (typeof dependencies === 'function') {
            factory = dependencies;
            dependencies = [];
        }

        this.dependencies.set(name, dependencies);
        this.callbacks.set(name, factory);

        console.log(`📋 Module defined: ${name} with dependencies:`, dependencies);

        // If no dependencies, load immediately
        if (dependencies.length === 0) {
            this.loadModule(name);
        }
    }

    /**
     * Require a module (like Node.js require)
     * @param {string} name - Module name or path
     * @returns {Promise} - Promise that resolves when module is loaded
     */
    async require(name) {
        // Convert path to module name if needed
        const moduleName = this.normalizeModuleName(name);

        if (this.loaded.has(moduleName)) {
            return this.modules.get(moduleName);
        }

        if (this.loading.has(moduleName)) {
            // Wait for loading to complete
            return this.waitForModule(moduleName);
        }

        return this.loadModuleWithDependencies(moduleName);
    }

    /**
     * Load a module and its dependencies recursively
     */
    async loadModuleWithDependencies(moduleName) {
        if (this.loading.has(moduleName)) {
            throw new Error(`Circular dependency detected: ${moduleName}`);
        }

        this.loading.add(moduleName);

        try {
            // Load script if not already loaded
            await this.loadScript(moduleName);

            // Get dependencies
            const dependencies = this.dependencies.get(moduleName) || [];
            
            // Load all dependencies first
            const dependencyPromises = dependencies.map(dep => 
                this.loadModuleWithDependencies(dep)
            );
            
            const loadedDeps = await Promise.all(dependencyPromises);

            // Execute module factory
            const factory = this.callbacks.get(moduleName);
            let moduleExports = {};

            if (factory) {
                const result = factory.apply(null, loadedDeps);
                moduleExports = result || moduleExports;
            }

            this.modules.set(moduleName, moduleExports);
            this.loaded.add(moduleName);
            this.loading.delete(moduleName);

            console.log(`✅ Module loaded: ${moduleName}`);
            return moduleExports;

        } catch (error) {
            this.loading.delete(moduleName);
            console.error(`❌ Failed to load module ${moduleName}:`, error);
            throw error;
        }
    }

    /**
     * Load module immediately (for modules without dependencies)
     */
    loadModule(name) {
        const factory = this.callbacks.get(name);
        let moduleExports = {};

        if (factory) {
            const result = factory();
            moduleExports = result || moduleExports;
        }

        this.modules.set(name, moduleExports);
        this.loaded.add(name);
        
        console.log(`⚡ Module loaded immediately: ${name}`);
        return moduleExports;
    }

    /**
     * Load script file dynamically
     */
    async loadScript(moduleName) {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            const existingScript = document.querySelector(`script[data-module="${moduleName}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = this.getModulePath(moduleName) + `?v=${this.version}`;
            script.setAttribute('data-module', moduleName);
            script.async = true;

            script.onload = () => {
                console.log(`📜 Script loaded: ${moduleName}`);
                resolve();
            };

            script.onerror = () => {
                reject(new Error(`Failed to load script: ${moduleName}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Wait for module to finish loading
     */
    async waitForModule(moduleName) {
        return new Promise((resolve, reject) => {
            const checkLoaded = () => {
                if (this.loaded.has(moduleName)) {
                    resolve(this.modules.get(moduleName));
                } else if (!this.loading.has(moduleName)) {
                    reject(new Error(`Module ${moduleName} failed to load`));
                } else {
                    setTimeout(checkLoaded, 10);
                }
            };
            checkLoaded();
        });
    }

    /**
     * Convert file path to module name
     */
    normalizeModuleName(name) {
        // Remove js extension and path separators
        return name.replace(/\.js$/, '').replace(/[\/\\]/g, '-').toLowerCase();
    }

    /**
     * Get full path for module
     */
    getModulePath(moduleName) {
        // Map module names to file paths
        const moduleMap = {
            'utils': '/js/utils.js',
            'config': '/js/config.js',
            'auth': '/js/auth.js',
            'menu': '/js/menu.js',
            'i18n': '/js/i18n.js',
            'keyboard': '/js/keyboard.js',
            'app': '/js/app.js',
            'router': '/js/router.js',
            'ui-tester': '/js/ui-tester.js',
            
            // Module directory
            'storage-manager': '/js/modules/storage-manager.js',
            'navigation-manager': '/js/modules/navigation-manager.js',
            'config-loader': '/js/modules/config-loader.js',
            'route-parser': '/js/modules/route-parser.js',
            'sensor-monitoring': '/js/modules/sensor-monitoring.js',
            'pressure-visualization': '/js/modules/pressure-visualization.js',
            'device-history': '/js/modules/device-history.js',
            'alarm-management': '/js/modules/alarm-management.js',
            
            // Enhanced modules
            'device-data-enhanced': '/js/device-data-enhanced.js',
            'test-menu-enhanced': '/js/test-menu-enhanced.js',
            'test-reports-enhanced': '/js/test-reports-enhanced.js',
            'workshop-enhanced': '/js/workshop-enhanced.js',
            'system-settings-enhanced': '/js/system-settings-enhanced.js'
        };

        return moduleMap[moduleName] || `/js/${moduleName}.js`;
    }

    /**
     * Get module loading status for debugging
     */
    getStatus() {
        return {
            loaded: Array.from(this.loaded),
            loading: Array.from(this.loading),
            defined: Array.from(this.dependencies.keys()),
            modules: Array.from(this.modules.keys())
        };
    }

    /**
     * Clear cache (for development)
     */
    clearCache() {
        this.modules.clear();
        this.loaded.clear();
        this.loading.clear();
        this.version = Date.now();
        console.log('🔄 DependencyLoader cache cleared');
    }
}

// Initialize global dependency loader
if (typeof window !== 'undefined') {
    window.dependencyLoader = new DependencyLoader();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DependencyLoader;
}
