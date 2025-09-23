/**
 * MASKSERVICE C20 - Settings System Configuration Module
 * Manages system-level settings, timeouts, data retention, audit logs
 * Extracted from system-settings-enhanced.js for modularity
 */

define('settings-system-config', [], function() {

    class SettingsSystemConfig {
        constructor() {
            this.systemConfig = new Map();
            this.configCategories = new Map();
            this.configHistory = [];
            this.init();
        }

        init() {
            this.setupDefaultConfiguration();
            this.setupConfigCategories();
            console.log('✅ SettingsSystemConfig initialized');
        }

        setupDefaultConfiguration() {
            // Device operation settings
            this.systemConfig.set('device', {
                timeout: {
                    value: 30000,
                    unit: 'ms',
                    min: 5000,
                    max: 120000,
                    description: 'Device communication timeout'
                },
                retryAttempts: {
                    value: 3,
                    min: 1,
                    max: 10,
                    description: 'Number of retry attempts for device communication'
                },
                connectionPool: {
                    value: 5,
                    min: 1,
                    max: 20,
                    description: 'Maximum concurrent device connections'
                }
            });

            // Sensor monitoring settings
            this.systemConfig.set('sensors', {
                updateInterval: {
                    value: 1000,
                    unit: 'ms',
                    min: 100,
                    max: 10000,
                    description: 'Sensor data update frequency'
                },
                bufferSize: {
                    value: 1000,
                    min: 100,
                    max: 10000,
                    description: 'Sensor data buffer size'
                },
                alarmThreshold: {
                    value: 85,
                    unit: '%',
                    min: 50,
                    max: 99,
                    description: 'Alarm threshold for sensor values'
                }
            });

            // Test execution settings
            this.systemConfig.set('testing', {
                maxConcurrentTests: {
                    value: 3,
                    min: 1,
                    max: 10,
                    description: 'Maximum number of tests running simultaneously'
                },
                testTimeout: {
                    value: 3600000,
                    unit: 'ms',
                    min: 60000,
                    max: 7200000,
                    description: 'Maximum test execution time'
                },
                autoSaveInterval: {
                    value: 30000,
                    unit: 'ms',
                    min: 10000,
                    max: 300000,
                    description: 'Automatic test data save interval'
                }
            });

            // Data management settings
            this.systemConfig.set('data', {
                retentionPeriod: {
                    value: 1825,
                    unit: 'days',
                    min: 30,
                    max: 3650,
                    description: 'Data retention period (5 years default)'
                },
                compressionEnabled: {
                    value: true,
                    description: 'Enable data compression for storage'
                },
                backupInterval: {
                    value: 86400000,
                    unit: 'ms',
                    min: 3600000,
                    max: 604800000,
                    description: 'Automatic backup interval (24 hours default)'
                },
                maxFileSize: {
                    value: 104857600,
                    unit: 'bytes',
                    min: 1048576,
                    max: 1073741824,
                    description: 'Maximum file size (100MB default)'
                }
            });

            // Security and audit settings
            this.systemConfig.set('security', {
                auditLogEnabled: {
                    value: true,
                    description: 'Enable audit logging'
                },
                sessionTimeout: {
                    value: 3600000,
                    unit: 'ms',
                    min: 300000,
                    max: 28800000,
                    description: 'User session timeout (1 hour default)'
                },
                maxLoginAttempts: {
                    value: 5,
                    min: 3,
                    max: 10,
                    description: 'Maximum failed login attempts before lockout'
                },
                passwordExpiry: {
                    value: 90,
                    unit: 'days',
                    min: 30,
                    max: 365,
                    description: 'Password expiration period'
                }
            });

            // Performance settings
            this.systemConfig.set('performance', {
                cacheSize: {
                    value: 52428800,
                    unit: 'bytes',
                    min: 10485760,
                    max: 209715200,
                    description: 'Application cache size (50MB default)'
                },
                workerThreads: {
                    value: 4,
                    min: 1,
                    max: 16,
                    description: 'Number of background worker threads'
                },
                uiUpdateFrequency: {
                    value: 100,
                    unit: 'ms',
                    min: 50,
                    max: 1000,
                    description: 'UI refresh frequency'
                }
            });

            console.log(`⚙️ Loaded system configuration with ${this.systemConfig.size} categories`);
        }

        setupConfigCategories() {
            this.configCategories.set('device', {
                name: 'Device Settings',
                description: 'Hardware communication and control settings',
                icon: '🔌',
                priority: 1
            });

            this.configCategories.set('sensors', {
                name: 'Sensor Configuration',
                description: 'Sensor monitoring and data collection settings',
                icon: '📡',
                priority: 2
            });

            this.configCategories.set('testing', {
                name: 'Test Execution',
                description: 'Test automation and execution parameters',
                icon: '🧪',
                priority: 3
            });

            this.configCategories.set('data', {
                name: 'Data Management',
                description: 'Storage, retention and backup settings',
                icon: '💾',
                priority: 4
            });

            this.configCategories.set('security', {
                name: 'Security & Audit',
                description: 'Security policies and audit configuration',
                icon: '🔒',
                priority: 5
            });

            this.configCategories.set('performance', {
                name: 'Performance',
                description: 'System performance optimization settings',
                icon: '⚡',
                priority: 6
            });
        }

        /**
         * Get configuration value
         */
        getConfigValue(category, setting) {
            const categoryConfig = this.systemConfig.get(category);
            if (!categoryConfig || !categoryConfig[setting]) {
                throw new Error(`Configuration not found: ${category}.${setting}`);
            }

            return categoryConfig[setting].value;
        }

        /**
         * Set configuration value with validation
         */
        setConfigValue(category, setting, value) {
            const categoryConfig = this.systemConfig.get(category);
            if (!categoryConfig || !categoryConfig[setting]) {
                throw new Error(`Configuration not found: ${category}.${setting}`);
            }

            const config = categoryConfig[setting];

            // Validate the new value
            const validation = this.validateConfigValue(config, value);
            if (!validation.valid) {
                throw new Error(`Invalid configuration value: ${validation.error}`);
            }

            // Store old value for history
            const oldValue = config.value;
            
            // Update value
            config.value = value;
            config.lastModified = new Date().toISOString();

            // Add to history
            this.configHistory.push({
                category,
                setting,
                oldValue,
                newValue: value,
                timestamp: new Date().toISOString(),
                user: 'system' // In production, this would be the actual user
            });

            console.log(`⚙️ Updated ${category}.${setting}: ${oldValue} → ${value}`);
            
            return config;
        }

        /**
         * Validate configuration value
         */
        validateConfigValue(config, value) {
            const validation = { valid: true, error: null };

            // Type validation
            if (typeof config.value === 'boolean' && typeof value !== 'boolean') {
                validation.valid = false;
                validation.error = `Expected boolean, got ${typeof value}`;
                return validation;
            }

            if (typeof config.value === 'number' && typeof value !== 'number') {
                validation.valid = false;
                validation.error = `Expected number, got ${typeof value}`;
                return validation;
            }

            // Range validation for numbers
            if (typeof value === 'number') {
                if (config.min !== undefined && value < config.min) {
                    validation.valid = false;
                    validation.error = `Value ${value} below minimum ${config.min}`;
                    return validation;
                }

                if (config.max !== undefined && value > config.max) {
                    validation.valid = false;
                    validation.error = `Value ${value} above maximum ${config.max}`;
                    return validation;
                }
            }

            return validation;
        }

        /**
         * Get all configuration for a category
         */
        getCategoryConfig(category) {
            const config = this.systemConfig.get(category);
            if (!config) {
                throw new Error(`Category not found: ${category}`);
            }

            return { ...config };
        }

        /**
         * Update multiple configuration values
         */
        updateCategoryConfig(category, updates) {
            const results = [];

            Object.entries(updates).forEach(([setting, value]) => {
                try {
                    const result = this.setConfigValue(category, setting, value);
                    results.push({ setting, success: true, config: result });
                } catch (error) {
                    results.push({ setting, success: false, error: error.message });
                }
            });

            return results;
        }

        /**
         * Reset category to defaults
         */
        resetCategoryToDefaults(category) {
            if (!this.systemConfig.has(category)) {
                throw new Error(`Category not found: ${category}`);
            }

            // Re-initialize the category with defaults
            this.setupDefaultConfiguration();
            
            console.log(`🔄 Reset ${category} configuration to defaults`);
            
            return this.getCategoryConfig(category);
        }

        /**
         * Reset all configuration to defaults
         */
        resetAllToDefaults() {
            this.systemConfig.clear();
            this.configHistory = [];
            this.setupDefaultConfiguration();
            
            console.log('🔄 Reset all system configuration to defaults');
        }

        /**
         * Get configuration categories
         */
        getConfigCategories() {
            return Array.from(this.configCategories.entries()).map(([key, category]) => ({
                key,
                ...category
            })).sort((a, b) => a.priority - b.priority);
        }

        /**
         * Get configuration history
         */
        getConfigHistory(category = null, limit = 100) {
            let history = [...this.configHistory];

            if (category) {
                history = history.filter(entry => entry.category === category);
            }

            // Sort by timestamp (newest first) and limit
            return history
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, limit);
        }

        /**
         * Clear old data based on retention settings
         */
        clearOldData() {
            const retentionPeriod = this.getConfigValue('data', 'retentionPeriod');
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);

            // Clear old configuration history
            const initialHistoryLength = this.configHistory.length;
            this.configHistory = this.configHistory.filter(entry => 
                new Date(entry.timestamp) > cutoffDate
            );

            const clearedEntries = initialHistoryLength - this.configHistory.length;
            
            console.log(`🗑️ Cleared ${clearedEntries} old configuration history entries`);
            
            return {
                clearedEntries,
                retentionPeriod,
                cutoffDate: cutoffDate.toISOString()
            };
        }

        /**
         * Export system configuration
         */
        exportConfiguration() {
            const config = {};
            
            this.systemConfig.forEach((categoryConfig, category) => {
                config[category] = {};
                Object.entries(categoryConfig).forEach(([setting, settingConfig]) => {
                    config[category][setting] = {
                        value: settingConfig.value,
                        description: settingConfig.description,
                        lastModified: settingConfig.lastModified
                    };
                });
            });

            return JSON.stringify({
                configuration: config,
                categories: Object.fromEntries(this.configCategories),
                exportedAt: new Date().toISOString(),
                version: '1.0'
            }, null, 2);
        }

        /**
         * Import system configuration
         */
        importConfiguration(configJson) {
            try {
                const importData = JSON.parse(configJson);
                
                if (!importData.configuration) {
                    throw new Error('Invalid configuration format');
                }

                const results = [];

                Object.entries(importData.configuration).forEach(([category, categoryConfig]) => {
                    if (this.systemConfig.has(category)) {
                        Object.entries(categoryConfig).forEach(([setting, settingData]) => {
                            try {
                                this.setConfigValue(category, setting, settingData.value);
                                results.push({ 
                                    category, 
                                    setting, 
                                    success: true 
                                });
                            } catch (error) {
                                results.push({ 
                                    category, 
                                    setting, 
                                    success: false, 
                                    error: error.message 
                                });
                            }
                        });
                    } else {
                        results.push({ 
                            category, 
                            success: false, 
                            error: 'Category not found' 
                        });
                    }
                });

                const successful = results.filter(r => r.success).length;
                const failed = results.filter(r => !r.success).length;

                console.log(`✅ Configuration import completed: ${successful} successful, ${failed} failed`);
                
                return {
                    success: true,
                    message: `Configuration imported: ${successful} successful, ${failed} failed`,
                    results
                };

            } catch (error) {
                console.error('❌ Failed to import configuration:', error.message);
                return {
                    success: false,
                    message: `Import failed: ${error.message}`,
                    error: error.message
                };
            }
        }

        /**
         * Validate system configuration integrity
         */
        validateSystemIntegrity() {
            const issues = [];
            
            // Check critical settings
            const criticalSettings = [
                { category: 'device', setting: 'timeout' },
                { category: 'sensors', setting: 'updateInterval' },
                { category: 'testing', setting: 'maxConcurrentTests' },
                { category: 'security', setting: 'auditLogEnabled' }
            ];

            criticalSettings.forEach(({ category, setting }) => {
                try {
                    const value = this.getConfigValue(category, setting);
                    if (value === null || value === undefined) {
                        issues.push(`Critical setting missing: ${category}.${setting}`);
                    }
                } catch (error) {
                    issues.push(`Critical setting error: ${category}.${setting} - ${error.message}`);
                }
            });

            // Check for conflicting settings
            const deviceTimeout = this.getConfigValue('device', 'timeout');
            const testTimeout = this.getConfigValue('testing', 'testTimeout');
            
            if (deviceTimeout >= testTimeout) {
                issues.push('Device timeout should be less than test timeout');
            }

            return {
                valid: issues.length === 0,
                issues: issues,
                checkedAt: new Date().toISOString()
            };
        }

        /**
         * Get system status based on configuration
         */
        getSystemStatus() {
            const integrity = this.validateSystemIntegrity();
            const categories = this.getConfigCategories();
            
            return {
                healthy: integrity.valid,
                issues: integrity.issues,
                configuredCategories: categories.length,
                totalSettings: Array.from(this.systemConfig.values())
                    .reduce((count, category) => count + Object.keys(category).length, 0),
                lastConfigChange: this.configHistory.length > 0 ? 
                    this.configHistory[this.configHistory.length - 1].timestamp : null,
                checkedAt: new Date().toISOString()
            };
        }
    }

    return SettingsSystemConfig;
});

// Legacy global export
if (typeof window !== 'undefined') {
    window.SettingsSystemConfig = SettingsSystemConfig;
}
