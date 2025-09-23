/**
 * MASKSERVICE C20 - Storage Cleanup Module
 * Handles cleanup and maintenance of storage data
 */

// AMD/RequireJS module definition
define('modules/storage-cleanup', [], function() {

class StorageCleanup {
    constructor() {
        this.storagePrefix = 'maskservice_c20_';
        this.quotaWarningThreshold = 0.8; // 80% of quota
        console.log('🧹 StorageCleanup initialized');
    }

    /**
     * Clean up old and expired data
     * @returns {Object} Cleanup results
     */
    cleanupOldData() {
        const now = Date.now();
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        let results = {
            localStorage: { cleaned: 0, errors: 0 },
            sessionStorage: { cleaned: 0, errors: 0 }
        };

        try {
            // Clean up localStorage
            if (this.isLocalStorageSupported()) {
                results.localStorage = this.cleanupLocalStorage(now, oneWeekAgo);
            }

            // Clean up sessionStorage (less aggressive, just expired items)
            if (this.isSessionStorageSupported()) {
                results.sessionStorage = this.cleanupSessionStorage();
            }

            const totalCleaned = results.localStorage.cleaned + results.sessionStorage.cleaned;
            console.log(`🧹 Cleanup completed: ${totalCleaned} items removed`);

        } catch (error) {
            console.error('❌ Cleanup failed:', error);
        }

        return results;
    }

    /**
     * Clean up localStorage specifically
     * @param {number} now - Current timestamp
     * @param {number} oneWeekAgo - One week ago timestamp
     * @returns {Object} Cleanup results for localStorage
     */
    cleanupLocalStorage(now, oneWeekAgo) {
        const results = { cleaned: 0, errors: 0 };
        const keysToRemove = [];

        try {
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
                        } catch (parseError) {
                            // Not JSON metadata, skip timestamp check
                        }
                    }
                }
            }

            // Remove identified keys
            keysToRemove.forEach(key => {
                try {
                    localStorage.removeItem(key);
                    results.cleaned++;
                } catch (error) {
                    results.errors++;
                    console.error(`❌ Failed to remove ${key}:`, error);
                }
            });

        } catch (error) {
            console.error('❌ localStorage cleanup failed:', error);
            results.errors++;
        }

        return results;
    }

    /**
     * Clean up sessionStorage specifically
     * @returns {Object} Cleanup results for sessionStorage
     */
    cleanupSessionStorage() {
        const results = { cleaned: 0, errors: 0 };

        try {
            // SessionStorage cleanup is simpler - just remove invalid entries
            const keysToRemove = [];

            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith(this.storagePrefix)) {
                    const value = sessionStorage.getItem(key);
                    
                    // Remove empty or invalid entries
                    if (!value || value === 'null' || value === 'undefined') {
                        keysToRemove.push(key);
                    }
                }
            }

            keysToRemove.forEach(key => {
                try {
                    sessionStorage.removeItem(key);
                    results.cleaned++;
                } catch (error) {
                    results.errors++;
                    console.error(`❌ Failed to remove ${key}:`, error);
                }
            });

        } catch (error) {
            console.error('❌ sessionStorage cleanup failed:', error);
            results.errors++;
        }

        return results;
    }

    /**
     * Check storage quota usage
     * @returns {Object} Quota information
     */
    async checkStorageQuota() {
        const quota = {
            used: 0,
            total: 0,
            available: 0,
            percentage: 0,
            warningLevel: false
        };

        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                quota.used = estimate.usage || 0;
                quota.total = estimate.quota || 0;
                quota.available = quota.total - quota.used;
                quota.percentage = quota.total > 0 ? (quota.used / quota.total) : 0;
                quota.warningLevel = quota.percentage > this.quotaWarningThreshold;

                console.log('📊 Storage quota:', {
                    used: this.formatBytes(quota.used),
                    total: this.formatBytes(quota.total),
                    percentage: Math.round(quota.percentage * 100) + '%'
                });

                if (quota.warningLevel) {
                    console.warn('⚠️ Storage quota warning: ' + Math.round(quota.percentage * 100) + '% used');
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not check storage quota:', error);
        }

        return quota;
    }

    /**
     * Force cleanup when quota is low
     * @returns {boolean} True if cleanup was performed
     */
    async forceCleanupOnLowQuota() {
        const quota = await this.checkStorageQuota();
        
        if (quota.warningLevel) {
            console.log('🧹 Performing emergency cleanup due to low quota...');
            const results = this.cleanupOldData();
            
            // Also remove non-essential cached data
            this.cleanupCachedData();
            
            return true;
        }

        return false;
    }

    /**
     * Clean up cached data that can be regenerated
     */
    cleanupCachedData() {
        const cacheKeywords = ['cache_', 'temp_', 'preview_', 'thumbnail_'];
        let removedCount = 0;

        try {
            // Clean localStorage cache
            if (this.isLocalStorageSupported()) {
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.storagePrefix)) {
                        const shouldRemove = cacheKeywords.some(keyword => 
                            key.includes(keyword)
                        );
                        
                        if (shouldRemove) {
                            localStorage.removeItem(key);
                            removedCount++;
                        }
                    }
                }
            }

            // Clean sessionStorage cache
            if (this.isSessionStorageSupported()) {
                for (let i = sessionStorage.length - 1; i >= 0; i--) {
                    const key = sessionStorage.key(i);
                    if (key && key.startsWith(this.storagePrefix)) {
                        const shouldRemove = cacheKeywords.some(keyword => 
                            key.includes(keyword)
                        );
                        
                        if (shouldRemove) {
                            sessionStorage.removeItem(key);
                            removedCount++;
                        }
                    }
                }
            }

            console.log(`🧹 Removed ${removedCount} cached items`);
        } catch (error) {
            console.error('❌ Cache cleanup failed:', error);
        }
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
     * Check localStorage support
     * @returns {boolean} True if supported
     */
    isLocalStorageSupported() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Check sessionStorage support  
     * @returns {boolean} True if supported
     */
    isSessionStorageSupported() {
        try {
            const testKey = '__storage_test__';
            sessionStorage.setItem(testKey, 'test');
            sessionStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Schedule automatic cleanup
     * @param {number} intervalHours - Cleanup interval in hours (default: 24)
     */
    scheduleAutomaticCleanup(intervalHours = 24) {
        const intervalMs = intervalHours * 60 * 60 * 1000;
        
        setInterval(() => {
            console.log('🧹 Running scheduled cleanup...');
            this.cleanupOldData();
        }, intervalMs);

        console.log(`🧹 Automatic cleanup scheduled every ${intervalHours} hours`);
    }
}

    // Export for backwards compatibility
    if (typeof window !== 'undefined') {
        window.StorageCleanup = StorageCleanup;
    }

    // Return StorageCleanup class for AMD/RequireJS
    return StorageCleanup;
});
