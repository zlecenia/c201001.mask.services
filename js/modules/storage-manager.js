/**
 * MASKSERVICE C20 - Storage Manager Orchestrator
 * Coordinates modular storage components
 */

class StorageManager {
    constructor() {
        this.storagePrefix = 'maskservice_c20_';
        this.initializeComponents();
        this.setupIntegration();
        console.log('💾 StorageManager orchestrator initialized');
    }

    /**
     * Initialize all modular components
     */
    initializeComponents() {
        // Initialize core storage operations
        this.core = new StorageCore();
        
        // Initialize encryption functionality  
        this.encryption = new StorageEncryption();
        
        // Initialize compression functionality
        this.compression = new StorageCompression();
        
        // Initialize cleanup and maintenance
        this.cleanup = new StorageCleanup();
        
        // Initialize statistics and monitoring
        this.stats = new StorageStats();
        
        // Initialize event management
        this.events = new StorageEvents();
        
        console.log('🔧 All storage components initialized');
    }

    /**
     * Setup integration between components
     */
    setupIntegration() {
        // Enable storage event listening
        this.events.enableStorageEventListening();
        
        // Schedule automatic cleanup
        this.cleanup.scheduleAutomaticCleanup(24); // Every 24 hours
        
        // Add logger for debugging
        if (window.location.search.includes('debug=storage')) {
            this.debugLogger = this.events.createLogger(true);
        }
        
        console.log('🔗 Storage component integration setup complete');
    }

    // ===================
    // DELEGATION METHODS
    // ===================

    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @param {Object} options - Storage options
     * @returns {boolean} True if successful
     */
    setLocal(key, value, options = {}) {
        const result = this.core.setItem(key, value, 'localStorage', options);
        if (result) {
            this.events.emitSetEvent(key, value, { storage: 'localStorage', ...options });
        }
        return result;
    }

    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Retrieved value or default
     */
    getLocal(key, defaultValue = null) {
        const result = this.core.getItem(key, 'localStorage', defaultValue);
        this.events.emitGetEvent(key, result, { storage: 'localStorage' });
        return result;
    }

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} True if successful
     */
    removeLocal(key) {
        const result = this.core.removeItem(key, 'localStorage');
        if (result) {
            this.events.emitRemoveEvent(key, { storage: 'localStorage' });
        }
        return result;
    }

    /**
     * Set item in sessionStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @param {Object} options - Storage options
     * @returns {boolean} True if successful
     */
    setSession(key, value, options = {}) {
        const result = this.core.setItem(key, value, 'sessionStorage', options);
        if (result) {
            this.events.emitSetEvent(key, value, { storage: 'sessionStorage', ...options });
        }
        return result;
    }

    /**
     * Get item from sessionStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Retrieved value or default
     */
    getSession(key, defaultValue = null) {
        const result = this.core.getItem(key, 'sessionStorage', defaultValue);
        this.events.emitGetEvent(key, result, { storage: 'sessionStorage' });
        return result;
    }

    /**
     * Remove item from sessionStorage
     * @param {string} key - Storage key
     * @returns {boolean} True if successful
     */
    removeSession(key) {
        const result = this.core.removeItem(key, 'sessionStorage');
        if (result) {
            this.events.emitRemoveEvent(key, { storage: 'sessionStorage' });
        }
        return result;
    }

    /**
     * Clear all application data from localStorage
     * @returns {boolean} True if successful
     */
    clearLocalData() {
        const result = this.core.clearAllData('localStorage');
        if (result) {
            this.events.emitClearEvent({ storage: 'localStorage' });
        }
        return result;
    }

    /**
     * Clear all application data from sessionStorage
     * @returns {boolean} True if successful
     */
    clearSessionData() {
        const result = this.core.clearAllData('sessionStorage');
        if (result) {
            this.events.emitClearEvent({ storage: 'sessionStorage' });
        }
        return result;
    }

    /**
     * Clean up old and expired data
     * @returns {Object} Cleanup results
     */
    cleanupOldData() {
        return this.cleanup.cleanupOldData();
    }

    /**
     * Check storage quota usage
     * @returns {Object} Quota information
     */
    async checkStorageQuota() {
        const quota = await this.cleanup.checkStorageQuota();
        if (quota.warningLevel) {
            this.events.emitQuotaWarningEvent(quota);
        }
        return quota;
    }

    /**
     * Get storage usage statistics
     * @returns {Object} Storage statistics
     */
    getStorageStats() {
        return this.stats.getStorageStats();
    }

    /**
     * Get detailed storage statistics with categories
     * @returns {Object} Categorized storage stats
     */
    getCategorizedStats() {
        return this.stats.getCategorizedStats();
    }

    /**
     * Generate comprehensive storage report
     * @returns {Object} Storage report
     */
    generateStorageReport() {
        return this.stats.generateStorageReport();
    }

    /**
     * Get storage performance metrics
     * @returns {Object} Performance metrics
     */
    async getPerformanceMetrics() {
        return await this.stats.getPerformanceMetrics();
    }

    /**
     * Add storage event listener
     * @param {string} eventType - Type of event
     * @param {Function} callback - Callback function
     * @returns {string} Listener ID
     */
    addEventListener(eventType, callback) {
        return this.events.addEventListener(eventType, callback);
    }

    /**
     * Remove storage event listener
     * @param {string} eventType - Type of event
     * @param {string} listenerId - Listener ID
     * @returns {boolean} True if removed
     */
    removeEventListener(eventType, listenerId) {
        return this.events.removeEventListener(eventType, listenerId);
    }

    /**
     * Get event listener statistics
     * @returns {Object} Listener stats
     */
    getListenerStats() {
        return this.events.getListenerStats();
    }

    /**
     * Encrypt a string
     * @param {string} str - String to encrypt
     * @returns {string} Encrypted string
     */
    encryptString(str) {
        return this.encryption.encryptString(str);
    }

    /**
     * Decrypt a string
     * @param {string} str - String to decrypt
     * @returns {string} Decrypted string
     */
    decryptString(str) {
        return this.encryption.decryptString(str);
    }

    /**
     * Compress a string
     * @param {string} str - String to compress
     * @returns {string} Compressed string
     */
    compressString(str) {
        return this.compression.compressString(str);
    }

    /**
     * Decompress a string
     * @param {string} str - String to decompress
     * @returns {string} Decompressed string
     */
    decompressString(str) {
        return this.compression.decompressString(str);
    }

    /**
     * Log storage statistics to console
     */
    logStorageStats() {
        this.stats.logStorageStats();
    }

    /**
     * Test compression effectiveness
     * @param {string} sampleData - Sample data to test
     * @returns {Object} Test results
     */
    testCompression(sampleData) {
        return this.compression.testCompression(sampleData);
    }

    /**
     * Force cleanup when quota is low
     * @returns {boolean} True if cleanup was performed
     */
    async forceCleanupOnLowQuota() {
        return await this.cleanup.forceCleanupOnLowQuota();
    }

    /**
     * Get compression statistics for data
     * @param {string} original - Original string
     * @param {string} compressed - Compressed string
     * @returns {Object} Compression statistics
     */
    getCompressionStats(original, compressed) {
        return this.compression.getCompressionStats(original, compressed);
    }

    /**
     * Set encryption key
     * @param {string} key - New encryption key
     */
    setEncryptionKey(key) {
        this.encryption.setEncryptionKey(key);
    }

    /**
     * Enable/disable compression
     * @param {boolean} enabled - Whether compression is enabled
     */
    setCompressionEnabled(enabled) {
        this.compression.setCompressionEnabled(enabled);
    }

    /**
     * Legacy compatibility methods (delegating to core)
     */
    testStorage(storage) {
        return this.core.testStorage(storage);
    }

    formatBytes(bytes) {
        return this.stats.formatBytes(bytes);
    }

    /**
     * Destroy storage manager and cleanup
     */
    destroy() {
        // Disable storage event listening
        this.events.disableStorageEventListening();
        
        // Clear all event listeners
        this.events.clearAllListeners();
        
        // Remove debug logger if exists
        if (this.debugLogger) {
            this.debugLogger();
        }
        
        console.log('🗑️ StorageManager orchestrator destroyed');
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}
