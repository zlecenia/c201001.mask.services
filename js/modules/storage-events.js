/**
 * MASKSERVICE C20 - Storage Events Module
 * Handles event management and listeners for storage operations
 */

class StorageEvents {
    constructor() {
        this.listeners = {
            set: [],
            get: [],
            remove: [],
            clear: [],
            error: [],
            quotaWarning: []
        };
        this.storageEventHandler = null;
        console.log('📡 StorageEvents initialized');
    }

    /**
     * Add event listener
     * @param {string} eventType - Type of event (set, get, remove, clear, error, quotaWarning)
     * @param {Function} callback - Callback function
     * @returns {string} Listener ID for removal
     */
    addEventListener(eventType, callback) {
        if (!this.listeners[eventType]) {
            console.warn(`⚠️ Unknown event type: ${eventType}`);
            return null;
        }

        if (typeof callback !== 'function') {
            console.warn('⚠️ Event listener callback must be a function');
            return null;
        }

        const listenerId = this.generateListenerId();
        this.listeners[eventType].push({
            id: listenerId,
            callback: callback,
            timestamp: Date.now()
        });

        console.log(`📡 Added ${eventType} listener: ${listenerId}`);
        return listenerId;
    }

    /**
     * Remove event listener
     * @param {string} eventType - Type of event
     * @param {string} listenerId - Listener ID to remove
     * @returns {boolean} True if listener was removed
     */
    removeEventListener(eventType, listenerId) {
        if (!this.listeners[eventType]) {
            return false;
        }

        const initialLength = this.listeners[eventType].length;
        this.listeners[eventType] = this.listeners[eventType].filter(
            listener => listener.id !== listenerId
        );

        const removed = this.listeners[eventType].length < initialLength;
        if (removed) {
            console.log(`📡 Removed ${eventType} listener: ${listenerId}`);
        }

        return removed;
    }

    /**
     * Remove all listeners for an event type
     * @param {string} eventType - Type of event
     * @returns {number} Number of listeners removed
     */
    removeAllListeners(eventType) {
        if (!this.listeners[eventType]) {
            return 0;
        }

        const count = this.listeners[eventType].length;
        this.listeners[eventType] = [];
        console.log(`📡 Removed all ${count} ${eventType} listeners`);
        return count;
    }

    /**
     * Emit an event to all registered listeners
     * @param {string} eventType - Type of event
     * @param {Object} eventData - Event data to pass to listeners
     */
    emit(eventType, eventData = {}) {
        if (!this.listeners[eventType]) {
            return;
        }

        const listeners = this.listeners[eventType];
        if (listeners.length === 0) {
            return;
        }

        const event = {
            type: eventType,
            timestamp: Date.now(),
            ...eventData
        };

        listeners.forEach(listener => {
            try {
                listener.callback(event);
            } catch (error) {
                console.error(`❌ Error in ${eventType} listener ${listener.id}:`, error);
            }
        });
    }

    /**
     * Enable browser storage event listening
     */
    enableStorageEventListening() {
        if (this.storageEventHandler) {
            return; // Already enabled
        }

        this.storageEventHandler = (e) => {
            if (e.key && e.key.startsWith('maskservice_c20_')) {
                this.emit('storageChange', {
                    key: e.key,
                    oldValue: e.oldValue,
                    newValue: e.newValue,
                    url: e.url,
                    storageArea: e.storageArea === localStorage ? 'localStorage' : 'sessionStorage'
                });
            }
        };

        window.addEventListener('storage', this.storageEventHandler);
        console.log('📡 Browser storage event listening enabled');
    }

    /**
     * Disable browser storage event listening
     */
    disableStorageEventListening() {
        if (this.storageEventHandler) {
            window.removeEventListener('storage', this.storageEventHandler);
            this.storageEventHandler = null;
            console.log('📡 Browser storage event listening disabled');
        }
    }

    /**
     * Create a detailed event object for storage operations
     * @param {string} operation - Operation type (set, get, remove, etc.)
     * @param {string} key - Storage key
     * @param {*} value - Storage value (for set operations)
     * @param {Object} metadata - Additional metadata
     * @returns {Object} Event object
     */
    createStorageEvent(operation, key, value = null, metadata = {}) {
        return {
            operation,
            key,
            value,
            timestamp: Date.now(),
            size: value ? JSON.stringify(value).length * 2 : 0, // UTF-16 byte estimate
            ...metadata
        };
    }

    /**
     * Emit a storage set event
     * @param {string} key - Storage key
     * @param {*} value - Storage value
     * @param {Object} metadata - Additional metadata
     */
    emitSetEvent(key, value, metadata = {}) {
        const event = this.createStorageEvent('set', key, value, metadata);
        this.emit('set', event);
    }

    /**
     * Emit a storage get event
     * @param {string} key - Storage key
     * @param {*} value - Retrieved value
     * @param {Object} metadata - Additional metadata
     */
    emitGetEvent(key, value, metadata = {}) {
        const event = this.createStorageEvent('get', key, value, metadata);
        this.emit('get', event);
    }

    /**
     * Emit a storage remove event
     * @param {string} key - Storage key
     * @param {Object} metadata - Additional metadata
     */
    emitRemoveEvent(key, metadata = {}) {
        const event = this.createStorageEvent('remove', key, null, metadata);
        this.emit('remove', event);
    }

    /**
     * Emit a storage clear event
     * @param {Object} metadata - Additional metadata
     */
    emitClearEvent(metadata = {}) {
        const event = this.createStorageEvent('clear', null, null, metadata);
        this.emit('clear', event);
    }

    /**
     * Emit an error event
     * @param {Error} error - Error object
     * @param {Object} context - Error context
     */
    emitErrorEvent(error, context = {}) {
        this.emit('error', {
            error: error.message,
            stack: error.stack,
            timestamp: Date.now(),
            ...context
        });
    }

    /**
     * Emit a quota warning event
     * @param {Object} quotaInfo - Quota information
     */
    emitQuotaWarningEvent(quotaInfo) {
        this.emit('quotaWarning', {
            ...quotaInfo,
            timestamp: Date.now()
        });
    }

    /**
     * Get event listener statistics
     * @returns {Object} Listener statistics
     */
    getListenerStats() {
        const stats = {};
        
        Object.keys(this.listeners).forEach(eventType => {
            stats[eventType] = {
                count: this.listeners[eventType].length,
                listeners: this.listeners[eventType].map(listener => ({
                    id: listener.id,
                    timestamp: listener.timestamp
                }))
            };
        });

        stats.total = Object.values(this.listeners)
            .reduce((sum, listeners) => sum + listeners.length, 0);

        return stats;
    }

    /**
     * Create a storage operation logger
     * @param {boolean} logToConsole - Whether to log to console
     * @returns {Function} Cleanup function to remove logger
     */
    createLogger(logToConsole = true) {
        const loggerIds = [];

        // Log all storage operations
        ['set', 'get', 'remove', 'clear'].forEach(eventType => {
            const listenerId = this.addEventListener(eventType, (event) => {
                if (logToConsole) {
                    console.log(`📦 Storage ${event.operation}:`, {
                        key: event.key,
                        size: event.size ? `${event.size} bytes` : 'N/A',
                        timestamp: new Date(event.timestamp).toISOString()
                    });
                }
            });
            loggerIds.push({ eventType, listenerId });
        });

        // Log errors
        const errorListenerId = this.addEventListener('error', (event) => {
            if (logToConsole) {
                console.error('❌ Storage error:', event.error);
            }
        });
        loggerIds.push({ eventType: 'error', listenerId: errorListenerId });

        // Return cleanup function
        return () => {
            loggerIds.forEach(({ eventType, listenerId }) => {
                this.removeEventListener(eventType, listenerId);
            });
            console.log('📡 Storage logger removed');
        };
    }

    /**
     * Generate a unique listener ID
     * @returns {string} Unique ID
     */
    generateListenerId() {
        return 'listener_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get all registered event types
     * @returns {Array} Array of event types
     */
    getEventTypes() {
        return Object.keys(this.listeners);
    }

    /**
     * Check if there are listeners for an event type
     * @param {string} eventType - Event type to check
     * @returns {boolean} True if there are listeners
     */
    hasListeners(eventType) {
        return this.listeners[eventType] && this.listeners[eventType].length > 0;
    }

    /**
     * Clear all event listeners
     */
    clearAllListeners() {
        let totalRemoved = 0;
        
        Object.keys(this.listeners).forEach(eventType => {
            totalRemoved += this.listeners[eventType].length;
            this.listeners[eventType] = [];
        });

        console.log(`📡 Cleared all ${totalRemoved} event listeners`);
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.StorageEvents = StorageEvents;
}
