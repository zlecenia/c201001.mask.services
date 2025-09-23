/**
 * MASKSERVICE C20 - Dependency Loader Module
 * Advanced dependency management system with automatic cascading loading
 * Similar to AMD/RequireJS but tailored for MASKSERVICE C20
 */

class DependencyLoader {
    constructor() {
        this.modules = new Map(); // Defined modules
        this.loading = new Map(); // Currently loading modules
        this.loaded = new Map(); // Successfully loaded modules
        this.failed = new Set(); // Failed to load modules
        this.dependencyGraph = new Map(); // Module dependency graph
        this.loadQueue = []; // Queue for dependency resolution
        this.circularDeps = new Set(); // Detected circular dependencies
        this.basePath = '/js/modules/';
        this.cacheBuster = Date.now();
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.loadTimeout = 30000; // 30 seconds timeout per module
        this.debug = true;
        
        // Performance tracking
        this.stats = {
            modulesLoaded: 0,
            totalLoadTime: 0,
            dependenciesResolved: 0,
            circularDependenciesDetected: 0,
            loadFailures: 0
        };

        this.init();
    }

    init() {
        console.log('🔧 DependencyLoader initialized with cascading support');
        
        // Make global functions available
        window.define = this.define.bind(this);
        window.require = this.require.bind(this);
        
        // Handle unhandled module loads
        window.addEventListener('error', (event) => {
            if (event.filename && event.filename.includes('/js/modules/')) {
                const moduleName = this.extractModuleNameFromPath(event.filename);
                this.handleLoadError(moduleName, new Error(event.message));
            }
        });
    }

    /**
     * Define a module with dependencies
     * @param {string} name - Module name
     * @param {Array<string>} dependencies - Array of dependency module names
     * @param {Function} factory - Factory function that returns the module
     */
    define(name, dependencies = [], factory = null) {
        // Handle different call signatures
        if (typeof name === 'function') {
            factory = name;
            dependencies = [];
            name = this.generateAnonymousName();
        } else if (Array.isArray(name)) {
            factory = dependencies;
            dependencies = name;
            name = this.generateAnonymousName();
        } else if (typeof dependencies === 'function') {
            factory = dependencies;
            dependencies = [];
        }

        if (this.debug) {
            console.log(`📦 Defining module: ${name}`, dependencies);
        }

        // Register module definition
        this.modules.set(name, {
            name,
            dependencies,
            factory,
            exports: null,
            loading: false,
            loaded: false,
            error: null,
            definedAt: Date.now()
        });

        // Build dependency graph
        this.dependencyGraph.set(name, new Set(dependencies));

        // Auto-start loading if no dependencies or all dependencies already loaded
        if (dependencies.length === 0 || this.allDependenciesLoaded(dependencies)) {
            setTimeout(() => this.loadModule(name), 0);
        }

        return name;
    }

    /**
     * Require modules with automatic dependency resolution
     * @param {Array<string>|string} moduleNames - Module name(s) to require
     * @param {Function} callback - Callback function with loaded modules
     * @param {Function} errorCallback - Error callback
     * @returns {Promise} Promise that resolves when all modules are loaded
     */
    async require(moduleNames, callback = null, errorCallback = null) {
        const startTime = Date.now();
        
        // Normalize to array
        const names = Array.isArray(moduleNames) ? moduleNames : [moduleNames];
        
        if (this.debug) {
            console.log(`🚀 Requiring modules:`, names);
        }

        try {
            // Resolve all dependencies recursively
            const allDependencies = await this.resolveDependencies(names);
            
            // Load all modules in correct order
            const loadedModules = await this.loadModulesInOrder(allDependencies);
            
            // Get the requested modules
            const requestedModules = names.map(name => this.getLoadedModule(name));
            
            // Update stats
            this.stats.totalLoadTime += Date.now() - startTime;
            this.stats.dependenciesResolved += allDependencies.length;
            
            // Call callback if provided
            if (callback) {
                if (names.length === 1) {
                    callback(requestedModules[0]);
                } else {
                    callback(...requestedModules);
                }
            }

            return names.length === 1 ? requestedModules[0] : requestedModules;
            
        } catch (error) {
            this.stats.loadFailures++;
            
            if (errorCallback) {
                errorCallback(error);
            }
            
            console.error(`❌ Failed to require modules:`, names, error);
            throw error;
        }
    }

    /**
     * Resolve all dependencies recursively with cycle detection
     * @param {Array<string>} moduleNames - Root module names
     * @returns {Promise<Array<string>>} Ordered list of all dependencies
     */
    async resolveDependencies(moduleNames) {
        const resolved = new Set();
        const resolving = new Set();
        const orderedDeps = [];

        const resolveDep = async (moduleName, path = []) => {
            // Check for circular dependency
            if (resolving.has(moduleName)) {
                const cycle = [...path, moduleName].join(' -> ');
                this.circularDeps.add(cycle);
                this.stats.circularDependenciesDetected++;
                
                if (this.debug) {
                    console.warn(`🔄 Circular dependency detected: ${cycle}`);
                }
                return; // Skip circular dependencies
            }

            // Already resolved
            if (resolved.has(moduleName)) {
                return;
            }

            // Mark as resolving
            resolving.add(moduleName);

            // Ensure module is defined or auto-load it
            await this.ensureModuleDefined(moduleName);

            const module = this.modules.get(moduleName);
            if (module && module.dependencies.length > 0) {
                // Resolve dependencies first
                for (const dep of module.dependencies) {
                    await resolveDep(dep, [...path, moduleName]);
                }
            }

            // Add to resolved and ordered list
            resolving.delete(moduleName);
            resolved.add(moduleName);
            orderedDeps.push(moduleName);
        };

        // Resolve all root modules
        for (const name of moduleNames) {
            await resolveDep(name);
        }

        return orderedDeps;
    }

    /**
     * Ensure module is defined (auto-load if needed)
     * @param {string} moduleName - Module name
     */
    async ensureModuleDefined(moduleName) {
        if (this.modules.has(moduleName) || this.loading.has(moduleName)) {
            return;
        }

        // Auto-load module file
        try {
            await this.loadModuleScript(moduleName);
        } catch (error) {
            // If auto-load fails, create a placeholder
            if (this.debug) {
                console.warn(`⚠️ Auto-load failed for ${moduleName}, creating placeholder`);
            }
            
            this.modules.set(moduleName, {
                name: moduleName,
                dependencies: [],
                factory: () => ({}),
                exports: null,
                loading: false,
                loaded: false,
                error: error,
                definedAt: Date.now()
            });
        }
    }

    /**
     * Load module script from file system
     * @param {string} moduleName - Module name
     * @returns {Promise} Loading promise
     */
    async loadModuleScript(moduleName) {
        if (this.loading.has(moduleName)) {
            return this.loading.get(moduleName);
        }

        const scriptPath = this.getModulePath(moduleName);
        
        if (this.debug) {
            console.log(`📥 Auto-loading script: ${moduleName} from ${scriptPath}`);
        }

        const loadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.async = true;
            
            const timeout = setTimeout(() => {
                document.head.removeChild(script);
                reject(new Error(`Timeout loading ${moduleName}`));
            }, this.loadTimeout);

            script.onload = () => {
                clearTimeout(timeout);
                document.head.removeChild(script);
                resolve();
            };

            script.onerror = () => {
                clearTimeout(timeout);
                document.head.removeChild(script);
                reject(new Error(`Failed to load script: ${scriptPath}`));
            };

            document.head.appendChild(script);
        });

        this.loading.set(moduleName, loadPromise);
        
        try {
            await loadPromise;
        } finally {
            this.loading.delete(moduleName);
        }
    }

    /**
     * Load modules in dependency order
     * @param {Array<string>} moduleNames - Ordered module names
     * @returns {Promise<Array>} Array of loaded modules
     */
    async loadModulesInOrder(moduleNames) {
        const loadedModules = [];
        
        for (const moduleName of moduleNames) {
            const module = await this.loadModule(moduleName);
            loadedModules.push(module);
        }

        return loadedModules;
    }

    /**
     * Load a single module
     * @param {string} moduleName - Module name
     * @returns {Promise} Module exports
     */
    async loadModule(moduleName) {
        // Return cached if already loaded
        if (this.loaded.has(moduleName)) {
            return this.loaded.get(moduleName);
        }

        // Check if failed previously
        if (this.failed.has(moduleName)) {
            throw new Error(`Module ${moduleName} previously failed to load`);
        }

        const moduleDefinition = this.modules.get(moduleName);
        if (!moduleDefinition) {
            throw new Error(`Module ${moduleName} is not defined`);
        }

        if (moduleDefinition.loading) {
            // Wait for ongoing load
            return new Promise((resolve, reject) => {
                const checkInterval = setInterval(() => {
                    if (this.loaded.has(moduleName)) {
                        clearInterval(checkInterval);
                        resolve(this.loaded.get(moduleName));
                    } else if (this.failed.has(moduleName) || moduleDefinition.error) {
                        clearInterval(checkInterval);
                        reject(moduleDefinition.error || new Error(`Failed to load ${moduleName}`));
                    }
                }, 10);
            });
        }

        // Mark as loading
        moduleDefinition.loading = true;

        try {
            // Load dependencies first
            const dependencyModules = [];
            for (const depName of moduleDefinition.dependencies) {
                const depModule = await this.loadModule(depName);
                dependencyModules.push(depModule);
            }

            // Execute factory function
            let exports;
            if (typeof moduleDefinition.factory === 'function') {
                exports = moduleDefinition.factory(...dependencyModules);
            } else {
                exports = moduleDefinition.factory;
            }

            // Handle async exports
            if (exports instanceof Promise) {
                exports = await exports;
            }

            // Cache the exports
            this.loaded.set(moduleName, exports);
            moduleDefinition.exports = exports;
            moduleDefinition.loaded = true;
            moduleDefinition.loading = false;

            this.stats.modulesLoaded++;

            if (this.debug) {
                console.log(`✅ Module loaded: ${moduleName}`);
            }

            return exports;

        } catch (error) {
            // Mark as failed
            this.failed.add(moduleName);
            moduleDefinition.error = error;
            moduleDefinition.loading = false;

            console.error(`❌ Failed to load module: ${moduleName}`, error);
            throw error;
        }
    }

    /**
     * Get loaded module
     * @param {string} moduleName - Module name
     * @returns {*} Module exports
     */
    getLoadedModule(moduleName) {
        if (!this.loaded.has(moduleName)) {
            throw new Error(`Module ${moduleName} is not loaded`);
        }
        return this.loaded.get(moduleName);
    }

    /**
     * Check if all dependencies are loaded
     * @param {Array<string>} dependencies - Dependency names
     * @returns {boolean} True if all loaded
     */
    allDependenciesLoaded(dependencies) {
        return dependencies.every(dep => this.loaded.has(dep));
    }

    /**
     * Generate anonymous module name
     * @returns {string} Generated name
     */
    generateAnonymousName() {
        return `__anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }

    /**
     * Get module file path
     * @param {string} moduleName - Module name
     * @returns {string} File path
     */
    getModulePath(moduleName) {
        // Handle different naming conventions
        let fileName = moduleName;
        
        // Convert kebab-case or camelCase to file names, but preserve directory paths
        if (!fileName.endsWith('.js')) {
            // Split path and filename to handle directories properly
            const pathParts = fileName.split('/');
            const fileBaseName = pathParts.pop(); // Get the actual filename
            const dirPath = pathParts.length > 0 ? pathParts.join('/') + '/' : '';
            
            // Process only the filename part for kebab-case/camelCase conversion
            const processedFileName = fileBaseName
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .toLowerCase() + '.js';
            
            fileName = dirPath + processedFileName;
        }

        return `${this.basePath}${fileName}?v=${this.cacheBuster}`;
    }

    /**
     * Extract module name from file path
     * @param {string} filePath - File path
     * @returns {string} Module name
     */
    extractModuleNameFromPath(filePath) {
        const fileName = filePath.split('/').pop().replace('.js', '').split('?')[0];
        return fileName.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    }

    /**
     * Handle load error
     * @param {string} moduleName - Module name
     * @param {Error} error - Error object
     */
    handleLoadError(moduleName, error) {
        this.failed.add(moduleName);
        
        if (this.modules.has(moduleName)) {
            this.modules.get(moduleName).error = error;
        }

        console.error(`❌ Module load error: ${moduleName}`, error);
    }

    /**
     * Get dependency graph visualization
     * @returns {Object} Graph representation
     */
    getDependencyGraph() {
        const graph = {};
        
        this.dependencyGraph.forEach((deps, moduleName) => {
            graph[moduleName] = Array.from(deps);
        });

        return graph;
    }

    /**
     * Get loader statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            ...this.stats,
            totalModules: this.modules.size,
            loadedModules: this.loaded.size,
            failedModules: this.failed.size,
            circularDependencies: Array.from(this.circularDeps),
            averageLoadTime: this.stats.modulesLoaded > 0 
                ? this.stats.totalLoadTime / this.stats.modulesLoaded 
                : 0
        };
    }

    /**
     * Set base URL for module loading
     * @param {string} baseUrl - Base URL path
     */
    setBaseUrl(baseUrl) {
        this.basePath = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
        if (this.debug) {
            console.log(`🔧 DependencyLoader base URL set to: ${this.basePath}`);
        }
    }

    /**
     * Set cache buster value
     * @param {string|number} cacheBuster - Cache buster value
     */
    setCacheBuster(cacheBuster) {
        this.cacheBuster = cacheBuster;
        if (this.debug) {
            console.log(`🔧 DependencyLoader cache buster set to: ${this.cacheBuster}`);
        }
    }

    /**
     * Set load timeout
     * @param {number} timeout - Timeout in milliseconds
     */
    setTimeout(timeout) {
        this.loadTimeout = timeout;
        if (this.debug) {
            console.log(`🔧 DependencyLoader timeout set to: ${this.loadTimeout}ms`);
        }
    }

    /**
     * Set debug mode
     * @param {boolean} debug - Debug mode flag
     */
    setDebug(debug) {
        this.debug = debug;
        if (this.debug) {
            console.log(`🔧 DependencyLoader debug mode: ${this.debug}`);
        }
    }

    /**
     * Clear module cache
     * @param {string} moduleName - Module name (optional)
     */
    clearCache(moduleName = null) {
        if (moduleName) {
            this.loaded.delete(moduleName);
            this.failed.delete(moduleName);
            
            if (this.modules.has(moduleName)) {
                const module = this.modules.get(moduleName);
                module.loaded = false;
                module.exports = null;
                module.error = null;
            }
            
            console.log(`🗑️ Cleared cache for: ${moduleName}`);
        } else {
            this.loaded.clear();
            this.failed.clear();
            this.modules.forEach(module => {
                module.loaded = false;
                module.exports = null;
                module.error = null;
            });
            
            console.log('🗑️ Cleared all module cache');
        }
    }

    /**
     * Destroy the dependency loader
     */
    destroy() {
        this.modules.clear();
        this.loading.clear();
        this.loaded.clear();
        this.failed.clear();
        this.dependencyGraph.clear();
        this.circularDeps.clear();
        
        delete window.define;
        delete window.require;
        
        console.log('🗑️ DependencyLoader destroyed');
    }
}

// Create global instance
const dependencyLoader = new DependencyLoader();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.DependencyLoader = DependencyLoader;
    window.dependencyLoader = dependencyLoader;
}

console.log('✅ Dependency Loader Module with cascading support loaded');
