/**
 * MASKSERVICE C20 - Storage Core Module
 * Basic storage operations and support checking
 */

// AMD/RequireJS module definition
define('storage-core', [], function() {

class StorageCore {
    constructor() {
        this.storagePrefix = 'maskservice_c20_';
        this.localStorageSupported = false;
        this.sessionStorageSupported = false;
        this.init();
    }

    init() {
        this.checkStorageSupport();
        console.log('💾 StorageCore initialized');
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
     * Get full storage key with prefix
     * @param {string} key - Base key
     * @returns {string} Full key with prefix
     */
    getFullKey(key) {
        return this.storagePrefix + key;
    }

    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {string} value - Processed value to store
     * @param {number} expirationTime - Optional expiration timestamp
     * @returns {boolean} True if successful
     */
    setLocalStorageItem(key, value, expirationTime = null) {
        if (!this.localStorageSupported) {
            console.warn('⚠️ localStorage not supported');
            return false;
        }

        try {
            const fullKey = this.getFullKey(key);
            localStorage.setItem(fullKey, value);

            if (expirationTime) {
                const expirationKey = fullKey + '_expires';
                localStorage.setItem(expirationKey, expirationTime.toString());
            }

            console.log(`💾 Stored in localStorage: ${key}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to set localStorage item:', error);
            return false;
        }
    }

    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @returns {string|null} Retrieved value or null
     */
    getLocalStorageItem(key) {
        if (!this.localStorageSupported) {
            return null;
        }

        try {
            const fullKey = this.getFullKey(key);
            const expirationKey = fullKey + '_expires';
            
            // Check expiration
            const expirationTime = localStorage.getItem(expirationKey);
            if (expirationTime && Date.now() > parseInt(expirationTime)) {
                this.removeLocalStorageItem(key);
                return null;
            }

            return localStorage.getItem(fullKey);
        } catch (error) {
            console.error('❌ Failed to get localStorage item:', error);
            return null;
        }
    }

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} True if successful
     */
    removeLocalStorageItem(key) {
        if (!this.localStorageSupported) {
            return false;
        }

        try {
            const fullKey = this.getFullKey(key);
            const expirationKey = fullKey + '_expires';
            
            localStorage.removeItem(fullKey);
            localStorage.removeItem(expirationKey);
            
            console.log(`🗑️ Removed from localStorage: ${key}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to remove localStorage item:', error);
            return false;
        }
    }

    /**
     * Set item in sessionStorage
     * @param {string} key - Storage key
     * @param {string} value - Processed value to store
     * @returns {boolean} True if successful
     */
    setSessionStorageItem(key, value) {
        if (!this.sessionStorageSupported) {
            console.warn('⚠️ sessionStorage not supported');
            return false;
        }

        try {
            const fullKey = this.getFullKey(key);
            sessionStorage.setItem(fullKey, value);
            console.log(`💾 Stored in sessionStorage: ${key}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to set sessionStorage item:', error);
            return false;
        }
    }

    /**
     * Get item from sessionStorage
     * @param {string} key - Storage key
     * @returns {string|null} Retrieved value or null
     */
    getSessionStorageItem(key) {
        if (!this.sessionStorageSupported) {
            return null;
        }

        try {
            const fullKey = this.getFullKey(key);
            return sessionStorage.getItem(fullKey);
        } catch (error) {
            console.error('❌ Failed to get sessionStorage item:', error);
            return null;
        }
    }

    /**
     * Remove item from sessionStorage
     * @param {string} key - Storage key
     * @returns {boolean} True if successful
     */
    removeSessionStorageItem(key) {
        if (!this.sessionStorageSupported) {
            return false;
        }

        try {
            const fullKey = this.getFullKey(key);
            sessionStorage.removeItem(fullKey);
            console.log(`🗑️ Removed from sessionStorage: ${key}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to remove sessionStorage item:', error);
            return false;
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
            return true;
        } catch (error) {
            console.error('❌ Failed to clear sessionStorage:', error);
            return false;
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.StorageCore = StorageCore;
}
