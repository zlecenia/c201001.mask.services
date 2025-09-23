/**
 * MASKSERVICE C20 - Storage Stats Module
 * Handles storage statistics and monitoring
 */

class StorageStats {
    constructor() {
        this.storagePrefix = 'maskservice_c20_';
        console.log('📊 StorageStats initialized');
    }

    /**
     * Get storage usage statistics
     * @returns {Object} Storage statistics
     */
    getStorageStats() {
        const stats = {
            localStorage: {
                supported: this.isLocalStorageSupported(),
                count: 0,
                size: 0,
                items: []
            },
            sessionStorage: {
                supported: this.isSessionStorageSupported(),
                count: 0,
                size: 0,
                items: []
            },
            total: {
                count: 0,
                size: 0
            }
        };

        // Collect localStorage stats
        if (stats.localStorage.supported) {
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.storagePrefix)) {
                        const value = localStorage.getItem(key);
                        const size = (key.length + (value ? value.length : 0)) * 2; // UTF-16
                        
                        stats.localStorage.count++;
                        stats.localStorage.size += size;
                        stats.localStorage.items.push({
                            key: key.substring(this.storagePrefix.length),
                            size: size,
                            sizeFormatted: this.formatBytes(size)
                        });
                    }
                }
            } catch (error) {
                console.error('❌ Error collecting localStorage stats:', error);
            }
        }

        // Collect sessionStorage stats
        if (stats.sessionStorage.supported) {
            try {
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (key && key.startsWith(this.storagePrefix)) {
                        const value = sessionStorage.getItem(key);
                        const size = (key.length + (value ? value.length : 0)) * 2; // UTF-16
                        
                        stats.sessionStorage.count++;
                        stats.sessionStorage.size += size;
                        stats.sessionStorage.items.push({
                            key: key.substring(this.storagePrefix.length),
                            size: size,
                            sizeFormatted: this.formatBytes(size)
                        });
                    }
                }
            } catch (error) {
                console.error('❌ Error collecting sessionStorage stats:', error);
            }
        }

        // Calculate totals
        stats.total.count = stats.localStorage.count + stats.sessionStorage.count;
        stats.total.size = stats.localStorage.size + stats.sessionStorage.size;

        // Format sizes
        stats.localStorage.sizeFormatted = this.formatBytes(stats.localStorage.size);
        stats.sessionStorage.sizeFormatted = this.formatBytes(stats.sessionStorage.size);
        stats.total.sizeFormatted = this.formatBytes(stats.total.size);

        return stats;
    }

    /**
     * Get detailed breakdown of storage by category
     * @returns {Object} Categorized storage stats
     */
    getCategorizedStats() {
        const categories = {
            user_settings: { count: 0, size: 0, items: [] },
            session_data: { count: 0, size: 0, items: [] },
            cache_data: { count: 0, size: 0, items: [] },
            temporary: { count: 0, size: 0, items: [] },
            other: { count: 0, size: 0, items: [] }
        };

        const allStats = this.getStorageStats();
        
        // Categorize localStorage items
        allStats.localStorage.items.forEach(item => {
            const category = this.categorizeStorageKey(item.key);
            categories[category].count++;
            categories[category].size += item.size;
            categories[category].items.push({
                ...item,
                storage: 'localStorage'
            });
        });

        // Categorize sessionStorage items
        allStats.sessionStorage.items.forEach(item => {
            const category = this.categorizeStorageKey(item.key);
            categories[category].count++;
            categories[category].size += item.size;
            categories[category].items.push({
                ...item,
                storage: 'sessionStorage'
            });
        });

        // Format sizes for categories
        Object.keys(categories).forEach(category => {
            categories[category].sizeFormatted = this.formatBytes(categories[category].size);
        });

        return categories;
    }

    /**
     * Categorize a storage key based on its name
     * @param {string} key - Storage key to categorize
     * @returns {string} Category name
     */
    categorizeStorageKey(key) {
        const lowerKey = key.toLowerCase();
        
        if (lowerKey.includes('settings') || lowerKey.includes('config') || lowerKey.includes('preferences')) {
            return 'user_settings';
        } else if (lowerKey.includes('session') || lowerKey.includes('auth') || lowerKey.includes('login')) {
            return 'session_data';
        } else if (lowerKey.includes('cache') || lowerKey.includes('thumbnail') || lowerKey.includes('preview')) {
            return 'cache_data';
        } else if (lowerKey.includes('temp') || lowerKey.includes('tmp') || lowerKey.includes('draft')) {
            return 'temporary';
        } else {
            return 'other';
        }
    }

    /**
     * Get storage performance metrics
     * @returns {Object} Performance metrics
     */
    async getPerformanceMetrics() {
        const metrics = {
            readPerformance: 0,
            writePerformance: 0,
            storageQuota: null,
            recommendations: []
        };

        // Test read performance
        const readStart = performance.now();
        try {
            // Read test data from localStorage
            for (let i = 0; i < 100; i++) {
                localStorage.getItem(this.storagePrefix + 'perf_test_' + i);
            }
            metrics.readPerformance = performance.now() - readStart;
        } catch (error) {
            console.warn('⚠️ Read performance test failed:', error);
        }

        // Test write performance
        const writeStart = performance.now();
        try {
            // Write test data to localStorage
            const testData = 'x'.repeat(1000); // 1KB test data
            for (let i = 0; i < 10; i++) {
                localStorage.setItem(this.storagePrefix + 'perf_test_' + i, testData);
            }
            metrics.writePerformance = performance.now() - writeStart;
            
            // Clean up test data
            for (let i = 0; i < 10; i++) {
                localStorage.removeItem(this.storagePrefix + 'perf_test_' + i);
            }
        } catch (error) {
            console.warn('⚠️ Write performance test failed:', error);
        }

        // Get storage quota information
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                metrics.storageQuota = {
                    used: estimate.usage || 0,
                    total: estimate.quota || 0,
                    available: (estimate.quota || 0) - (estimate.usage || 0),
                    percentage: estimate.quota > 0 ? (estimate.usage / estimate.quota) : 0
                };
            }
        } catch (error) {
            console.warn('⚠️ Storage quota check failed:', error);
        }

        // Generate recommendations
        metrics.recommendations = this.generateRecommendations(metrics);

        return metrics;
    }

    /**
     * Generate performance recommendations
     * @param {Object} metrics - Performance metrics
     * @returns {Array} Array of recommendation objects
     */
    generateRecommendations(metrics) {
        const recommendations = [];
        const stats = this.getStorageStats();

        // Check storage usage
        if (metrics.storageQuota && metrics.storageQuota.percentage > 0.8) {
            recommendations.push({
                type: 'warning',
                category: 'storage_quota',
                message: 'Storage quota is over 80% full. Consider cleaning up old data.',
                priority: 'high'
            });
        }

        // Check performance
        if (metrics.writePerformance > 100) {
            recommendations.push({
                type: 'info',
                category: 'performance',
                message: 'Write operations are slower than expected. Consider reducing data size or frequency.',
                priority: 'medium'
            });
        }

        // Check item count
        if (stats.total.count > 500) {
            recommendations.push({
                type: 'info',
                category: 'organization',
                message: 'Large number of storage items detected. Consider implementing cleanup routines.',
                priority: 'medium'
            });
        }

        // Check large items
        const largeItems = [...stats.localStorage.items, ...stats.sessionStorage.items]
            .filter(item => item.size > 10240) // 10KB+
            .sort((a, b) => b.size - a.size)
            .slice(0, 5);

        if (largeItems.length > 0) {
            recommendations.push({
                type: 'info',
                category: 'optimization',
                message: `Found ${largeItems.length} large storage items. Consider compression or alternative storage.`,
                priority: 'low',
                details: largeItems
            });
        }

        return recommendations;
    }

    /**
     * Generate a storage usage report
     * @returns {Object} Comprehensive storage report
     */
    generateStorageReport() {
        const basicStats = this.getStorageStats();
        const categorizedStats = this.getCategorizedStats();
        
        return {
            timestamp: new Date().toISOString(),
            summary: {
                totalItems: basicStats.total.count,
                totalSize: basicStats.total.size,
                totalSizeFormatted: basicStats.total.sizeFormatted,
                localStorageItems: basicStats.localStorage.count,
                sessionStorageItems: basicStats.sessionStorage.count
            },
            breakdown: {
                localStorage: basicStats.localStorage,
                sessionStorage: basicStats.sessionStorage
            },
            categories: categorizedStats,
            topItems: this.getTopStorageItems(5),
            recommendations: []
        };
    }

    /**
     * Get top storage items by size
     * @param {number} limit - Number of items to return
     * @returns {Array} Top storage items
     */
    getTopStorageItems(limit = 10) {
        const stats = this.getStorageStats();
        const allItems = [
            ...stats.localStorage.items.map(item => ({ ...item, storage: 'localStorage' })),
            ...stats.sessionStorage.items.map(item => ({ ...item, storage: 'sessionStorage' }))
        ];

        return allItems
            .sort((a, b) => b.size - a.size)
            .slice(0, limit);
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
     * Log storage statistics to console
     */
    logStorageStats() {
        const report = this.generateStorageReport();
        
        console.group('📊 Storage Statistics Report');
        console.log('Summary:', report.summary);
        console.log('Categories:', report.categories);
        console.log('Top Items:', report.topItems);
        if (report.recommendations.length > 0) {
            console.log('Recommendations:', report.recommendations);
        }
        console.groupEnd();
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.StorageStats = StorageStats;
}
