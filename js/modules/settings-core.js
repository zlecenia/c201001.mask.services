/**
 * MASKSERVICE C20 - Settings Core Module
 * Core functionality for system settings management
 * @version 1.0.0
 * @author MASKSERVICE Team
 */

class SettingsCore {
    constructor() {
        this.testScenarios = new Map();
        this.integrationSettings = new Map();
        this.standardsConfig = new Map();
        this.systemConfig = {};
        this.init();
    }

    init() {
        this.loadTestScenarios();
        this.loadIntegrationSettings();
        this.loadStandardsConfig();
        this.loadSystemConfig();
    }

    // Test scenarios management
    testScenarios = {
        editor: {
            createNew: true,
            modifyExisting: true,
            importFromXML: true,
            validateAgainstNorms: true // PN-EN 136/137
        },
        mapping: {
            deviceType: 'scenario_matrix',
            testInterval: 'scenario_selection',
            customRules: true
        }
    };

    loadTestScenarios() {
        const scenarios = [
            {
                id: 'scenario_1',
                name: 'Test po użyciu',
                norm: 'PN-EN 136',
                deviceTypes: ['PP_MASK', 'NP_MASK'],
                parameters: {
                    pressureTest: { min: -10, max: -5, unit: 'mbar' },
                    leakTest: { max: 0.5, unit: 'l/min' },
                    duration: 300
                }
            },
            {
                id: 'scenario_2',
                name: 'Test ciśnienia roboczego',
                norm: 'PN-EN 137',
                deviceTypes: ['PP_MASK'],
                parameters: {
                    pressureTest: { min: -20, max: -15, unit: 'mbar' },
                    leakTest: { max: 0.3, unit: 'l/min' },
                    duration: 600
                }
            }
        ];

        scenarios.forEach(scenario => {
            this.testScenarios.set(scenario.id, scenario);
        });
    }

    loadIntegrationSettings() {
        const integrations = [
            {
                id: 'erp_system',
                name: 'ERP System',
                type: 'REST_API',
                status: 'active',
                config: {
                    url: 'https://erp.company.com/api',
                    apiKey: '***MASKED***',
                    timeout: 30000
                }
            },
            {
                id: 'email_gateway',
                name: 'Email Gateway',
                type: 'SMTP',
                status: 'active',
                config: {
                    host: 'smtp.company.com',
                    port: 587,
                    security: 'TLS'
                }
            }
        ];

        integrations.forEach(integration => {
            this.integrationSettings.set(integration.id, integration);
        });
    }

    loadStandardsConfig() {
        const standards = [
            {
                id: 'pn_en_136',
                name: 'PN-EN 136',
                version: '2019',
                status: 'verified',
                description: 'Aparaty ochrony dróg oddechowych - Maski pełnotwarzowe',
                parameters: {
                    pressureTest: { min: -10, tolerance: 0.1 },
                    leakTest: { max: 0.5, unit: 'l/min' },
                    duration: 300
                }
            },
            {
                id: 'pn_en_137',
                name: 'PN-EN 137',
                version: '2021',
                status: 'verified',
                description: 'Aparaty ochrony dróg oddechowych - Autonomiczne aparaty oddechowe',
                parameters: {
                    pressureTest: { min: -20, tolerance: 0.1 },
                    flowTest: { min: 200, unit: 'l/min' },
                    duration: 600
                }
            },
            {
                id: 'iso_16900',
                name: 'ISO 16900',
                version: '2022',
                status: 'pending',
                description: 'Aparaty ochrony dróg oddechowych - Metody badań',
                parameters: {
                    testProcedures: ['static', 'dynamic', 'environmental'],
                    calibrationInterval: 365
                }
            }
        ];

        standards.forEach(standard => {
            this.standardsConfig.set(standard.id, standard);
        });
    }

    loadSystemConfig() {
        this.systemConfig = {
            system: {
                name: 'MASKTRONIC C20',
                version: '1.0.1',
                language: 'pl',
                timezone: 'Europe/Warsaw'
            },
            security: {
                sessionTimeout: 30,
                strongPasswords: true,
                auditLogging: true,
                twoFactorAuth: false
            },
            performance: {
                dataRefreshInterval: 5,
                maxConcurrentTests: 4,
                reportCache: 30
            },
            backup: {
                automatic: true,
                frequency: 'weekly',
                retention: 7
            }
        };
    }

    // Public getters
    getTestScenarios() {
        return this.testScenarios;
    }

    getIntegrationSettings() {
        return this.integrationSettings;
    }

    getStandardsConfig() {
        return this.standardsConfig;
    }

    getSystemConfig() {
        return this.systemConfig;
    }

    // Configuration management
    updateSystemConfig(section, key, value) {
        if (this.systemConfig[section]) {
            this.systemConfig[section][key] = value;
            this.saveConfig();
        }
    }

    saveConfig() {
        localStorage.setItem('maskservice_config', JSON.stringify(this.systemConfig));
        console.log('✅ System configuration saved');
    }

    exportConfig() {
        const config = {
            timestamp: new Date().toISOString(),
            version: this.systemConfig.system.version,
            settings: this.systemConfig,
            scenarios: Array.from(this.testScenarios.values()),
            integrations: Array.from(this.integrationSettings.values()),
            standards: Array.from(this.standardsConfig.values())
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'maskservice-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsCore;
}

console.log('✅ Settings Core Module loaded');
