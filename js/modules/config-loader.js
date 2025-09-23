/**
 * MASKSERVICE C20 - Config Loader Module
 * Handles configuration loading, validation, and management
 */

class ConfigLoader {
    constructor() {
        this.configs = new Map();
        this.configPaths = {
            app: '/config/app.json',
            menu: '/config/menu.json', 
            router: '/config/router.json'
        };
        this.loadingPromises = new Map();
        this.configListeners = [];
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
        this.init();
    }

    init() {
        console.log('⚙️ ConfigLoader initialized');
    }

    /**
     * Load configuration file
     * @param {string} configName - Configuration name
     * @param {Object} options - Loading options
     * @returns {Promise<Object>} Configuration object
     */
    async loadConfig(configName, options = {}) {
        const cacheKey = configName + (options.version ? `_v${options.version}` : '');
        
        // Return existing loading promise if in progress
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }

        // Return cached config if available and not expired
        if (!options.forceReload && this.configs.has(cacheKey)) {
            const cached = this.configs.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log(`📋 Using cached config: ${configName}`);
                return cached.data;
            }
        }

        // Create loading promise
        const loadingPromise = this.doLoadConfig(configName, options);
        this.loadingPromises.set(cacheKey, loadingPromise);

        try {
            const config = await loadingPromise;
            
            // Cache the result
            this.configs.set(cacheKey, {
                data: config,
                timestamp: Date.now()
            });

            // Notify listeners
            this.notifyConfigListeners('loaded', configName, config);
            
            console.log(`✅ Config loaded: ${configName}`);
            return config;
            
        } catch (error) {
            console.error(`❌ Failed to load config: ${configName}`, error);
            this.notifyConfigListeners('error', configName, error);
            throw error;
        } finally {
            this.loadingPromises.delete(cacheKey);
        }
    }

    /**
     * Actually load configuration with retries
     * @param {string} configName - Configuration name  
     * @param {Object} options - Loading options
     * @returns {Promise<Object>} Configuration object
     */
    async doLoadConfig(configName, options = {}) {
        const path = options.path || this.configPaths[configName];
        if (!path) {
            throw new Error(`Unknown config: ${configName}`);
        }

        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`📥 Loading config: ${configName} (attempt ${attempt})`);
                
                const response = await fetch(path + (options.cacheBust ? `?v=${Date.now()}` : ''));
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const config = await response.json();
                
                // Validate config
                this.validateConfig(configName, config);
                
                // Process config
                const processedConfig = this.processConfig(configName, config, options);
                
                return processedConfig;
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Config load attempt ${attempt} failed:`, error.message);
                
                if (attempt < this.retryAttempts) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }

        throw lastError;
    }

    /**
     * Load multiple configurations
     * @param {Array<string>} configNames - Array of config names
     * @param {Object} options - Loading options
     * @returns {Promise<Object>} Object with all loaded configs
     */
    async loadConfigs(configNames, options = {}) {
        const promises = configNames.map(name => 
            this.loadConfig(name, options).catch(error => ({ error, name }))
        );

        const results = await Promise.all(promises);
        const configs = {};
        const errors = [];

        results.forEach((result, index) => {
            const name = configNames[index];
            if (result.error) {
                errors.push({ name, error: result.error });
            } else {
                configs[name] = result;
            }
        });

        if (errors.length > 0 && !options.allowPartialLoad) {
            throw new Error(`Failed to load configs: ${errors.map(e => e.name).join(', ')}`);
        }

        return { configs, errors };
    }

    /**
     * Get cached configuration
     * @param {string} configName - Configuration name
     * @returns {Object|null} Cached configuration or null
     */
    getCachedConfig(configName) {
        const cached = this.configs.get(configName);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    /**
     * Validate configuration structure
     * @param {string} configName - Configuration name
     * @param {Object} config - Configuration object to validate
     */
    validateConfig(configName, config) {
        if (!config || typeof config !== 'object') {
            throw new Error(`Invalid config format: ${configName}`);
        }

        // Validate specific config types
        switch (configName) {
            case 'app':
                this.validateAppConfig(config);
                break;
            case 'menu':
                this.validateMenuConfig(config);
                break;
            case 'router':
                this.validateRouterConfig(config);
                break;
        }
    }

    /**
     * Validate app configuration
     * @param {Object} config - App config object
     */
    validateAppConfig(config) {
        const required = ['app_name', 'version', 'language'];
        const missing = required.filter(key => !(key in config));
        
        if (missing.length > 0) {
            throw new Error(`Missing required app config fields: ${missing.join(', ')}`);
        }

        if (config.supported_languages && !Array.isArray(config.supported_languages)) {
            throw new Error('supported_languages must be an array');
        }
    }

    /**
     * Validate menu configuration
     * @param {Object} config - Menu config object
     */
    validateMenuConfig(config) {
        if (!config.menu_items || !Array.isArray(config.menu_items)) {
            throw new Error('menu_items must be an array');
        }

        config.menu_items.forEach((item, index) => {
            if (!item.id || !item.label || !item.view) {
                throw new Error(`Invalid menu item at index ${index}: missing required fields`);
            }
        });

        if (config.role_restrictions && typeof config.role_restrictions !== 'object') {
            throw new Error('role_restrictions must be an object');
        }
    }

    /**
     * Validate router configuration
     * @param {Object} config - Router config object
     */
    validateRouterConfig(config) {
        if (!config.routes || typeof config.routes !== 'object') {
            throw new Error('routes must be an object');
        }

        if (config.default_route && typeof config.default_route !== 'string') {
            throw new Error('default_route must be a string');
        }

        if (config.supported_languages && !Array.isArray(config.supported_languages)) {
            throw new Error('supported_languages must be an array');
        }
    }

    /**
     * Process configuration after loading
     * @param {string} configName - Configuration name
     * @param {Object} config - Raw configuration object
     * @param {Object} options - Processing options
     * @returns {Object} Processed configuration
     */
    processConfig(configName, config, options = {}) {
        let processedConfig = { ...config };

        // Add metadata
        processedConfig._meta = {
            name: configName,
            loadedAt: new Date().toISOString(),
            version: options.version || '1.0.0'
        };

        // Process specific config types
        switch (configName) {
            case 'app':
                processedConfig = this.processAppConfig(processedConfig, options);
                break;
            case 'menu':
                processedConfig = this.processMenuConfig(processedConfig, options);
                break;
            case 'router':
                processedConfig = this.processRouterConfig(processedConfig, options);
                break;
        }

        // Apply environment-specific overrides
        if (options.environment && processedConfig.environments) {
            const envConfig = processedConfig.environments[options.environment];
            if (envConfig) {
                processedConfig = this.mergeConfigs(processedConfig, envConfig);
            }
        }

        return processedConfig;
    }

    /**
     * Process app configuration
     * @param {Object} config - App config
     * @param {Object} options - Options
     * @returns {Object} Processed config
     */
    processAppConfig(config, options) {
        // Set default values
        config.debug = config.debug !== undefined ? config.debug : false;
        config.theme = config.theme || 'default';
        config.supported_languages = config.supported_languages || ['en'];
        
        // Validate language settings
        if (config.language && !config.supported_languages.includes(config.language)) {
            console.warn(`⚠️ Default language '${config.language}' not in supported languages`);
            config.language = config.supported_languages[0];
        }

        return config;
    }

    /**
     * Process menu configuration
     * @param {Object} config - Menu config
     * @param {Object} options - Options
     * @returns {Object} Processed config
     */
    processMenuConfig(config, options) {
        // Create lookup maps for efficiency
        config._itemsById = new Map();
        config._itemsByView = new Map();

        config.menu_items.forEach(item => {
            config._itemsById.set(item.id, item);
            if (item.view) {
                config._itemsByView.set(item.view, item);
            }
        });

        // Process role restrictions
        if (config.role_restrictions) {
            config._roleMap = new Map();
            Object.entries(config.role_restrictions).forEach(([role, allowedItems]) => {
                config._roleMap.set(role, new Set(allowedItems));
            });
        }

        return config;
    }

    /**
     * Process router configuration
     * @param {Object} config - Router config
     * @param {Object} options - Options
     * @returns {Object} Processed config
     */
    processRouterConfig(config, options) {
        // Create route lookup map
        config._routeMap = new Map();
        Object.entries(config.routes).forEach(([path, routeConfig]) => {
            config._routeMap.set(path, routeConfig);
        });

        // Set defaults
        config.default_route = config.default_route || 'menu-screen';
        config.supported_languages = config.supported_languages || ['en'];
        config.case_sensitive = config.case_sensitive !== undefined ? config.case_sensitive : false;

        return config;
    }

    /**
     * Merge configuration objects
     * @param {Object} base - Base configuration
     * @param {Object} override - Override configuration  
     * @returns {Object} Merged configuration
     */
    mergeConfigs(base, override) {
        const result = { ...base };

        Object.entries(override).forEach(([key, value]) => {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                result[key] = this.mergeConfigs(result[key] || {}, value);
            } else {
                result[key] = value;
            }
        });

        return result;
    }

    /**
     * Reload configuration
     * @param {string} configName - Configuration name
     * @param {Object} options - Reload options
     * @returns {Promise<Object>} Reloaded configuration
     */
    async reloadConfig(configName, options = {}) {
        // Clear cache
        this.clearConfigCache(configName);
        
        // Force reload
        return this.loadConfig(configName, { ...options, forceReload: true });
    }

    /**
     * Clear configuration cache
     * @param {string} configName - Configuration name (optional, clears all if not provided)
     */
    clearConfigCache(configName) {
        if (configName) {
            // Clear specific config
            const keysToDelete = [];
            for (const key of this.configs.keys()) {
                if (key.startsWith(configName)) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach(key => this.configs.delete(key));
            
            console.log(`🗑️ Cleared config cache: ${configName}`);
        } else {
            // Clear all configs
            this.configs.clear();
            console.log('🗑️ Cleared all config cache');
        }
    }

    /**
     * Get configuration value by path
     * @param {string} configName - Configuration name
     * @param {string} path - Dot-separated path (e.g., 'app.version')
     * @param {*} defaultValue - Default value if path not found
     * @returns {*} Configuration value
     */
    getConfigValue(configName, path, defaultValue = null) {
        const config = this.getCachedConfig(configName);
        if (!config) {
            return defaultValue;
        }

        const pathParts = path.split('.');
        let value = config;

        for (const part of pathParts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                return defaultValue;
            }
        }

        return value;
    }

    /**
     * Check if configuration is loaded
     * @param {string} configName - Configuration name
     * @returns {boolean} True if loaded and cached
     */
    isConfigLoaded(configName) {
        return this.configs.has(configName);
    }

    /**
     * Get all loaded configurations
     * @returns {Object} Object with all loaded configs
     */
    getAllConfigs() {
        const configs = {};
        this.configs.forEach((cached, name) => {
            configs[name] = cached.data;
        });
        return configs;
    }

    /**
     * Watch for configuration changes
     * @param {string} configName - Configuration name
     * @param {number} interval - Check interval in milliseconds
     * @returns {Function} Stop watching function
     */
    watchConfig(configName, interval = 30000) {
        const checkForChanges = async () => {
            try {
                const cached = this.getCachedConfig(configName);
                if (cached) {
                    const fresh = await this.doLoadConfig(configName, { cacheBust: true });
                    
                    if (JSON.stringify(cached) !== JSON.stringify(fresh)) {
                        console.log(`🔄 Config changed: ${configName}`);
                        this.configs.set(configName, {
                            data: fresh,
                            timestamp: Date.now()
                        });
                        this.notifyConfigListeners('changed', configName, fresh);
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Config watch error: ${configName}`, error);
            }
        };

        const watchId = setInterval(checkForChanges, interval);
        
        return () => {
            clearInterval(watchId);
        };
    }

    /**
     * Add configuration change listener
     * @param {Function} listener - Listener function
     */
    addConfigListener(listener) {
        if (typeof listener === 'function') {
            this.configListeners.push(listener);
        }
    }

    /**
     * Remove configuration change listener
     * @param {Function} listener - Listener function
     */
    removeConfigListener(listener) {
        const index = this.configListeners.indexOf(listener);
        if (index > -1) {
            this.configListeners.splice(index, 1);
        }
    }

    /**
     * Notify configuration listeners
     * @param {string} event - Event type
     * @param {string} configName - Configuration name
     * @param {*} data - Event data
     */
    notifyConfigListeners(event, configName, data) {
        this.configListeners.forEach(listener => {
            try {
                listener(event, configName, data);
            } catch (error) {
                console.error('❌ Config listener error:', error);
            }
        });
    }

    /**
     * Utility delay function
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Delay promise
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get configuration loading statistics
     * @returns {Object} Loading statistics
     */
    getStats() {
        return {
            configsLoaded: this.configs.size,
            configsLoading: this.loadingPromises.size,
            listenerCount: this.configListeners.length,
            cacheTimeout: this.cacheTimeout,
            retryAttempts: this.retryAttempts
        };
    }

    /**
     * Destroy config loader
     */
    destroy() {
        // Clear all caches and promises
        this.configs.clear();
        this.loadingPromises.clear();
        this.configListeners = [];
        
        console.log('🗑️ ConfigLoader destroyed');
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ConfigLoader = ConfigLoader;
}
