/**
 * MASKSERVICE C20 - Storage Manager Module
 * Handles localStorage, sessionStorage, and data persistence
 */

class StorageManager {
    constructor() {
        this.storagePrefix = 'maskservice_c20_';
        this.encryptionKey = 'mask_c20_2024';
        this.compressionEnabled = true;
        this.quotaWarningThreshold = 0.8; // 80% of quota
        this.storageListeners = [];
        this.init();
    }

    init() {
        this.checkStorageSupport();
        this.checkStorageQuota();
        this.bindStorageEvents();
        console.log('💾 StorageManager initialized');
    }

    /**
     * Check browser storage support
     */
    checkStorageSupport() {
        this.localStorageSupported = this.testStorage(localStorage);
        this.sessionStorageSupported = this.testStorage(sessionStorage);

        console.log('📊 Storage support:', {
            localStorage: this.localStorageSupported,
            sessionStorage: this.sessionStorageSupported
        });
    }

    /**
     * Test storage availability
     * @param {Storage} storage - Storage object to test
     * @returns {boolean} True if storage is available
     */
    testStorage(storage) {
        try {
            const testKey = '__storage_test__';
            storage.setItem(testKey, 'test');
            storage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Check storage quota and usage
     */
    async checkStorageQuota() {
        if (navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                const usageRatio = estimate.usage / estimate.quota;
                
                console.log('📈 Storage quota:', {
                    used: this.formatBytes(estimate.usage),
                    total: this.formatBytes(estimate.quota),
                    percentage: Math.round(usageRatio * 100) + '%'
                });

                if (usageRatio > this.quotaWarningThreshold) {
                    console.warn('⚠️ Storage quota warning: ' + Math.round(usageRatio * 100) + '% used');
                    this.notifyStorageListeners('quota_warning', { usageRatio, estimate });
                }
            } catch (error) {
                console.warn('⚠️ Could not check storage quota:', error);
            }
        }
    }

    /**
     * Bind storage events
     */
    bindStorageEvents() {
        window.addEventListener('storage', (event) => {
            this.handleStorageEvent(event);
        });

        // Listen for quota exceeded errors
        window.addEventListener('error', (event) => {
            if (event.error && event.error.name === 'QuotaExceededError') {
                this.handleQuotaExceeded(event);
            }
        });
    }

    /**
     * Handle storage events from other tabs
     * @param {StorageEvent} event - Storage event
     */
    handleStorageEvent(event) {
        if (event.key && event.key.startsWith(this.storagePrefix)) {
            const key = event.key.substring(this.storagePrefix.length);
            
            console.log('🔄 Storage sync from other tab:', {
                key: key,
                oldValue: event.oldValue,
                newValue: event.newValue
            });

            this.notifyStorageListeners('sync', {
                key: key,
                oldValue: this.parseStoredValue(event.oldValue),
                newValue: this.parseStoredValue(event.newValue)
            });
        }
    }

    /**
     * Handle quota exceeded errors
     * @param {ErrorEvent} event - Error event
     */
    handleQuotaExceeded(event) {
        console.error('❌ Storage quota exceeded');
        
        // Try to clean up old data
        this.cleanupOldData();
        
        this.notifyStorageListeners('quota_exceeded', { error: event.error });
    }

    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @param {Object} options - Storage options
     * @returns {boolean} True if successful
     */
    setLocal(key, value, options = {}) {
        if (!this.localStorageSupported) {
            console.warn('⚠️ localStorage not supported');
            return false;
        }

        try {
            const fullKey = this.storagePrefix + key;
            const processedValue = this.processValueForStorage(value, options);
            
            localStorage.setItem(fullKey, processedValue);
            
            // Set expiration if specified
            if (options.expires) {
                const expirationKey = fullKey + '_expires';
                const expirationTime = Date.now() + (options.expires * 1000);
                localStorage.setItem(expirationKey, expirationTime.toString());
            }

            console.log(`💾 Stored in localStorage: ${key}`);
            this.notifyStorageListeners('set', { key, value, type: 'local' });
            
            return true;
        } catch (error) {
            console.error('❌ Failed to set localStorage item:', error);
            
            if (error.name === 'QuotaExceededError') {
                this.handleQuotaExceeded({ error });
            }
            
            return false;
        }
    }

    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Retrieved value or default
     */
    getLocal(key, defaultValue = null) {
        if (!this.localStorageSupported) {
            return defaultValue;
        }

        try {
            const fullKey = this.storagePrefix + key;
            
            // Check expiration
            const expirationKey = fullKey + '_expires';
            const expiration = localStorage.getItem(expirationKey);
            
            if (expiration && Date.now() > parseInt(expiration)) {
                // Item has expired
                this.removeLocal(key);
                return defaultValue;
            }

            const storedValue = localStorage.getItem(fullKey);
            
            if (storedValue === null) {
                return defaultValue;
            }

            return this.parseStoredValue(storedValue);
        } catch (error) {
            console.error('❌ Failed to get localStorage item:', error);
            return defaultValue;
        }
    }

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} True if successful
     */
    removeLocal(key) {
        if (!this.localStorageSupported) {
            return false;
        }

        try {
            const fullKey = this.storagePrefix + key;
            const expirationKey = fullKey + '_expires';
            
            localStorage.removeItem(fullKey);
            localStorage.removeItem(expirationKey);
            
            console.log(`🗑️ Removed from localStorage: ${key}`);
            this.notifyStorageListeners('remove', { key, type: 'local' });
            
            return true;
        } catch (error) {
            console.error('❌ Failed to remove localStorage item:', error);
            return false;
        }
    }

    /**
     * Set item in sessionStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @param {Object} options - Storage options
     * @returns {boolean} True if successful
     */
    setSession(key, value, options = {}) {
        if (!this.sessionStorageSupported) {
            console.warn('⚠️ sessionStorage not supported');
            return false;
        }

        try {
            const fullKey = this.storagePrefix + key;
            const processedValue = this.processValueForStorage(value, options);
            
            sessionStorage.setItem(fullKey, processedValue);
            
            console.log(`💾 Stored in sessionStorage: ${key}`);
            this.notifyStorageListeners('set', { key, value, type: 'session' });
            
            return true;
        } catch (error) {
            console.error('❌ Failed to set sessionStorage item:', error);
            return false;
        }
    }

    /**
     * Get item from sessionStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Retrieved value or default
     */
    getSession(key, defaultValue = null) {
        if (!this.sessionStorageSupported) {
            return defaultValue;
        }

        try {
            const fullKey = this.storagePrefix + key;
            const storedValue = sessionStorage.getItem(fullKey);
            
            if (storedValue === null) {
                return defaultValue;
            }

            return this.parseStoredValue(storedValue);
        } catch (error) {
            console.error('❌ Failed to get sessionStorage item:', error);
            return defaultValue;
        }
    }

    /**
     * Remove item from sessionStorage
     * @param {string} key - Storage key
     * @returns {boolean} True if successful
     */
    removeSession(key) {
        if (!this.sessionStorageSupported) {
            return false;
        }

        try {
            const fullKey = this.storagePrefix + key;
            sessionStorage.removeItem(fullKey);
            
            console.log(`🗑️ Removed from sessionStorage: ${key}`);
            this.notifyStorageListeners('remove', { key, type: 'session' });
            
            return true;
        } catch (error) {
            console.error('❌ Failed to remove sessionStorage item:', error);
            return false;
        }
    }

    /**
     * Process value for storage (stringify, encrypt, compress)
     * @param {*} value - Value to process
     * @param {Object} options - Processing options
     * @returns {string} Processed value string
     */
    processValueForStorage(value, options = {}) {
        let processedValue = value;

        // Convert to JSON string
        if (typeof value !== 'string') {
            processedValue = JSON.stringify(value);
        }

        // Compress if enabled and value is large
        if (this.compressionEnabled && processedValue.length > 1000) {
            processedValue = this.compressString(processedValue);
        }

        // Encrypt if requested
        if (options.encrypt) {
            processedValue = this.encryptString(processedValue);
        }

        // Add metadata
        const metadata = {
            value: processedValue,
            timestamp: Date.now(),
            compressed: this.compressionEnabled && processedValue.length > 1000,
            encrypted: !!options.encrypt,
            type: typeof value
        };

        return JSON.stringify(metadata);
    }

    /**
     * Parse stored value (decompress, decrypt, parse)
     * @param {string} storedValue - Stored value string
     * @returns {*} Parsed value
     */
    parseStoredValue(storedValue) {
        if (!storedValue) {
            return null;
        }

        try {
            // Try to parse as metadata object first
            const metadata = JSON.parse(storedValue);
            
            if (metadata && typeof metadata === 'object' && 'value' in metadata) {
                let value = metadata.value;

                // Decrypt if needed
                if (metadata.encrypted) {
                    value = this.decryptString(value);
                }

                // Decompress if needed
                if (metadata.compressed) {
                    value = this.decompressString(value);
                }

                // Parse JSON if it was originally an object
                if (metadata.type !== 'string') {
                    return JSON.parse(value);
                }

                return value;
            }
        } catch (e) {
            // Fallback to direct parsing for legacy data
            console.warn('⚠️ Parsing legacy stored value');
        }

        // Fallback for simple JSON values
        try {
            return JSON.parse(storedValue);
        } catch (e) {
            return storedValue;
        }
    }

    /**
     * Simple string compression (basic RLE)
     * @param {string} str - String to compress
     * @returns {string} Compressed string
     */
    compressString(str) {
        // Simple run-length encoding for repeating characters
        return str.replace(/(.)\1{2,}/g, (match, char) => {
            return `${char}${match.length}`;
        });
    }

    /**
     * Simple string decompression
     * @param {string} str - String to decompress
     * @returns {string} Decompressed string
     */
    decompressString(str) {
        // Reverse run-length encoding
        return str.replace(/(.)\d+/g, (match, char) => {
            const count = parseInt(match.substring(1));
            return char.repeat(count);
        });
    }

    /**
     * Simple string encryption (XOR cipher)
     * @param {string} str - String to encrypt
     * @returns {string} Encrypted string
     */
    encryptString(str) {
        let result = '';
        for (let i = 0; i < str.length; i++) {
            const keyChar = this.encryptionKey[i % this.encryptionKey.length];
            result += String.fromCharCode(str.charCodeAt(i) ^ keyChar.charCodeAt(0));
        }
        return btoa(result); // Base64 encode
    }

    /**
     * Simple string decryption
     * @param {string} str - String to decrypt
     * @returns {string} Decrypted string
     */
    decryptString(str) {
        try {
            const decoded = atob(str); // Base64 decode
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                const keyChar = this.encryptionKey[i % this.encryptionKey.length];
                result += String.fromCharCode(decoded.charCodeAt(i) ^ keyChar.charCodeAt(0));
            }
            return result;
        } catch (error) {
            console.error('❌ Decryption failed:', error);
            return str;
        }
    }

    /**
     * Clear all application data from localStorage
     * @returns {boolean} True if successful
     */
    clearLocalData() {
        if (!this.localStorageSupported) {
            return false;
        }

        try {
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storagePrefix)) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });

            console.log(`🗑️ Cleared ${keysToRemove.length} items from localStorage`);
            this.notifyStorageListeners('clear', { type: 'local', count: keysToRemove.length });
            
            return true;
        } catch (error) {
            console.error('❌ Failed to clear localStorage:', error);
            return false;
        }
    }

    /**
     * Clear all application data from sessionStorage
     * @returns {boolean} True if successful
     */
    clearSessionData() {
        if (!this.sessionStorageSupported) {
            return false;
        }

        try {
            const keysToRemove = [];
            
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith(this.storagePrefix)) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => {
                sessionStorage.removeItem(key);
            });

            console.log(`🗑️ Cleared ${keysToRemove.length} items from sessionStorage`);
            this.notifyStorageListeners('clear', { type: 'session', count: keysToRemove.length });
            
            return true;
        } catch (error) {
            console.error('❌ Failed to clear sessionStorage:', error);
            return false;
        }
    }

    /**
     * Clean up old and expired data
     */
    cleanupOldData() {
        const now = Date.now();
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        let cleanedCount = 0;

        try {
            // Clean up localStorage
            if (this.localStorageSupported) {
                const keysToRemove = [];
                
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.storagePrefix)) {
                        
                        // Check if it's an expiration key
                        if (key.endsWith('_expires')) {
                            const expirationTime = localStorage.getItem(key);
                            if (expirationTime && now > parseInt(expirationTime)) {
                                const originalKey = key.slice(0, -8); // Remove '_expires'
                                keysToRemove.push(key, originalKey);
                            }
                        }
                        // Check timestamp metadata for old items
                        else {
                            const value = localStorage.getItem(key);
                            try {
                                const metadata = JSON.parse(value);
                                if (metadata.timestamp && metadata.timestamp < oneWeekAgo) {
                                    keysToRemove.push(key);
                                }
                            } catch (e) {
                                // Ignore parsing errors
                            }
                        }
                    }
                }

                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                    cleanedCount++;
                });
            }

            console.log(`🧹 Cleaned up ${cleanedCount} old storage items`);
            this.notifyStorageListeners('cleanup', { cleanedCount });
            
        } catch (error) {
            console.error('❌ Failed to clean up old data:', error);
        }
    }

    /**
     * Get storage usage statistics
     * @returns {Object} Storage usage statistics
     */
    getStorageStats() {
        const stats = {
            localStorage: { count: 0, size: 0 },
            sessionStorage: { count: 0, size: 0 }
        };

        // Count localStorage items
        if (this.localStorageSupported) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storagePrefix)) {
                    const value = localStorage.getItem(key);
                    stats.localStorage.count++;
                    stats.localStorage.size += (key.length + (value ? value.length : 0)) * 2; // UTF-16
                }
            }
        }

        // Count sessionStorage items
        if (this.sessionStorageSupported) {
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith(this.storagePrefix)) {
                    const value = sessionStorage.getItem(key);
                    stats.sessionStorage.count++;
                    stats.sessionStorage.size += (key.length + (value ? value.length : 0)) * 2; // UTF-16
                }
            }
        }

        return stats;
    }

    /**
     * Format bytes for display
     * @param {number} bytes - Number of bytes
     * @returns {string} Formatted byte string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Add storage event listener
     * @param {Function} listener - Listener function
     */
    addStorageListener(listener) {
        if (typeof listener === 'function') {
            this.storageListeners.push(listener);
        }
    }

    /**
     * Remove storage event listener
     * @param {Function} listener - Listener function
     */
    removeStorageListener(listener) {
        const index = this.storageListeners.indexOf(listener);
        if (index > -1) {
            this.storageListeners.splice(index, 1);
        }
    }

    /**
     * Notify storage listeners
     * @param {string} event - Event type
     * @param {Object} data - Event data
     */
    notifyStorageListeners(event, data) {
        this.storageListeners.forEach(listener => {
            try {
                listener(event, data);
            } catch (error) {
                console.error('❌ Storage listener error:', error);
            }
        });
    }

    /**
     * Destroy storage manager
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('storage', this.handleStorageEvent);
        
        // Clear listeners
        this.storageListeners = [];
        
        console.log('🗑️ StorageManager destroyed');
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}
