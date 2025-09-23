/**
 * MASKSERVICE C20 - Settings Scenario Manager Module
 * Manages test scenarios, validation against PN-EN standards
 * Extracted from system-settings-enhanced.js for modularity
 */

define('settings-scenario-manager', [], function() {

    class SettingsScenarioManager {
        constructor() {
            this.scenarios = new Map();
            this.supportedNorms = ['PN-EN 136', 'PN-EN 137'];
            this.init();
        }

        init() {
            this.loadDefaultScenarios();
            console.log('✅ SettingsScenarioManager initialized');
        }

        loadDefaultScenarios() {
            const defaultScenarios = [
                {
                    id: 'scenario_1',
                    name: 'Test po użyciu',
                    norm: 'PN-EN 136',
                    deviceTypes: ['PP_MASK', 'NP_MASK'],
                    parameters: {
                        pressureTest: { min: 8, max: 12, unit: 'mbar' },
                        durabilityTest: { duration: 300, cycles: 10 },
                        leakageTest: { maxLeak: 0.5, unit: 'ml/min' }
                    },
                    validationRules: {
                        mandatory: true,
                        frequency: 'after_use',
                        conditions: ['visual_inspection', 'pressure_test']
                    }
                },
                {
                    id: 'scenario_2',
                    name: 'Test okresowy',
                    norm: 'PN-EN 136',
                    deviceTypes: ['PP_MASK', 'NP_MASK', 'FILTER_MASK'],
                    parameters: {
                        pressureTest: { min: 8, max: 12, unit: 'mbar' },
                        durabilityTest: { duration: 600, cycles: 20 },
                        leakageTest: { maxLeak: 0.3, unit: 'ml/min' },
                        flowTest: { minFlow: 120, unit: 'l/min' }
                    },
                    validationRules: {
                        mandatory: true,
                        frequency: 'monthly',
                        conditions: ['full_inspection', 'pressure_test', 'flow_test']
                    }
                },
                {
                    id: 'scenario_3',
                    name: 'Test przed użyciem - SCBA',
                    norm: 'PN-EN 137',
                    deviceTypes: ['SCBA'],
                    parameters: {
                        pressureTest: { min: 18, max: 22, unit: 'bar' },
                        airFlow: { min: 200, max: 500, unit: 'l/min' },
                        alarmTest: { lowPressure: 55, unit: 'bar' },
                        maskTest: { leakage: 0.1, unit: 'ml/min' }
                    },
                    validationRules: {
                        mandatory: true,
                        frequency: 'before_use',
                        conditions: ['pressure_test', 'alarm_test', 'mask_seal_test']
                    }
                }
            ];

            defaultScenarios.forEach(scenario => {
                this.scenarios.set(scenario.id, scenario);
            });

            console.log(`📋 Loaded ${defaultScenarios.length} default test scenarios`);
        }

        /**
         * Create new test scenario
         */
        createNewScenario(scenarioData) {
            const scenario = {
                id: `scenario_${Date.now()}`,
                name: scenarioData.name || 'Nowy scenariusz',
                norm: scenarioData.norm || 'PN-EN 136',
                deviceTypes: scenarioData.deviceTypes || [],
                parameters: scenarioData.parameters || {},
                validationRules: scenarioData.validationRules || {},
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            };

            // Validate scenario against norms
            const validation = this.validateScenarioAgainstNorms(scenario);
            if (!validation.valid) {
                throw new Error(`Scenario validation failed: ${validation.errors.join(', ')}`);
            }

            this.scenarios.set(scenario.id, scenario);
            console.log(`➕ Created new scenario: ${scenario.name} (${scenario.id})`);
            
            return scenario;
        }

        /**
         * Edit existing scenario
         */
        editScenario(scenarioId, updates) {
            const scenario = this.scenarios.get(scenarioId);
            if (!scenario) {
                throw new Error(`Scenario not found: ${scenarioId}`);
            }

            // Apply updates
            Object.assign(scenario, updates, {
                modified: new Date().toISOString()
            });

            // Validate updated scenario
            const validation = this.validateScenarioAgainstNorms(scenario);
            if (!validation.valid) {
                throw new Error(`Updated scenario validation failed: ${validation.errors.join(', ')}`);
            }

            this.scenarios.set(scenarioId, scenario);
            console.log(`✏️ Updated scenario: ${scenario.name} (${scenarioId})`);
            
            return scenario;
        }

        /**
         * Delete scenario
         */
        deleteScenario(scenarioId) {
            const scenario = this.scenarios.get(scenarioId);
            if (!scenario) {
                throw new Error(`Scenario not found: ${scenarioId}`);
            }

            this.scenarios.delete(scenarioId);
            console.log(`🗑️ Deleted scenario: ${scenario.name} (${scenarioId})`);
            
            return true;
        }

        /**
         * Validate scenario against PN-EN norms
         */
        validateScenarioAgainstNorms(scenario) {
            const validation = {
                valid: true,
                errors: [],
                warnings: []
            };

            // Basic validation
            if (!scenario.name || scenario.name.trim().length === 0) {
                validation.errors.push('Scenario name is required');
            }

            if (!this.supportedNorms.includes(scenario.norm)) {
                validation.errors.push(`Unsupported norm: ${scenario.norm}`);
            }

            if (!scenario.deviceTypes || scenario.deviceTypes.length === 0) {
                validation.errors.push('At least one device type must be specified');
            }

            // Norm-specific validation
            if (scenario.norm === 'PN-EN 136') {
                validation.warnings.push(...this.validatePN_EN_136(scenario));
            } else if (scenario.norm === 'PN-EN 137') {
                validation.warnings.push(...this.validatePN_EN_137(scenario));
            }

            validation.valid = validation.errors.length === 0;
            
            return validation;
        }

        /**
         * Validate scenario against PN-EN 136 standard
         */
        validatePN_EN_136(scenario) {
            const warnings = [];

            // Check pressure test parameters for respiratory protective devices
            if (scenario.parameters.pressureTest) {
                const { min, max } = scenario.parameters.pressureTest;
                if (min < 5 || max > 15) {
                    warnings.push('PN-EN 136: Pressure test should be between 5-15 mbar for most devices');
                }
            } else {
                warnings.push('PN-EN 136: Pressure test parameters are recommended');
            }

            // Check leakage test
            if (scenario.parameters.leakageTest) {
                const maxLeak = scenario.parameters.leakageTest.maxLeak;
                if (maxLeak > 1.0) {
                    warnings.push('PN-EN 136: Maximum leakage should not exceed 1.0 ml/min');
                }
            }

            return warnings;
        }

        /**
         * Validate scenario against PN-EN 137 standard
         */
        validatePN_EN_137(scenario) {
            const warnings = [];

            // Check for SCBA-specific requirements
            if (!scenario.deviceTypes.includes('SCBA')) {
                warnings.push('PN-EN 137: This standard applies to Self-Contained Breathing Apparatus (SCBA)');
            }

            // Check pressure test for SCBA
            if (scenario.parameters.pressureTest) {
                const { min, max } = scenario.parameters.pressureTest;
                if (min < 15 || max > 30) {
                    warnings.push('PN-EN 137: SCBA pressure test should be between 15-30 bar');
                }
            } else {
                warnings.push('PN-EN 137: High-pressure test is mandatory for SCBA');
            }

            // Check alarm test
            if (!scenario.parameters.alarmTest) {
                warnings.push('PN-EN 137: Low-pressure alarm test is required for SCBA');
            }

            return warnings;
        }

        /**
         * Import scenarios from XML/JSON file
         */
        importScenariosFromFile(fileContent, fileType) {
            let importedScenarios = [];

            try {
                if (fileType === 'json') {
                    importedScenarios = JSON.parse(fileContent);
                } else if (fileType === 'xml') {
                    // Basic XML parsing (in production, use proper XML parser)
                    importedScenarios = this.parseXMLScenarios(fileContent);
                } else {
                    throw new Error(`Unsupported file type: ${fileType}`);
                }

                const results = {
                    imported: 0,
                    failed: 0,
                    errors: []
                };

                importedScenarios.forEach(scenarioData => {
                    try {
                        this.createNewScenario(scenarioData);
                        results.imported++;
                    } catch (error) {
                        results.failed++;
                        results.errors.push(`Failed to import ${scenarioData.name}: ${error.message}`);
                    }
                });

                console.log(`📥 Import completed: ${results.imported} imported, ${results.failed} failed`);
                return results;

            } catch (error) {
                throw new Error(`File parsing error: ${error.message}`);
            }
        }

        /**
         * Basic XML scenario parsing
         */
        parseXMLScenarios(xmlContent) {
            // Simplified XML parsing - in production use DOMParser or proper XML library
            const scenarios = [];
            
            // This is a basic implementation - replace with proper XML parsing
            console.warn('XML import requires proper XML parser implementation');
            
            return scenarios;
        }

        /**
         * Export scenarios to JSON format
         */
        exportScenariosToJSON() {
            const scenarios = Array.from(this.scenarios.values());
            return JSON.stringify(scenarios, null, 2);
        }

        /**
         * Export scenarios to XML format
         */
        exportScenariosToXML() {
            const scenarios = Array.from(this.scenarios.values());
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<scenarios>\n';
            
            scenarios.forEach(scenario => {
                xml += `  <scenario id="${scenario.id}" norm="${scenario.norm}">\n`;
                xml += `    <name>${scenario.name}</name>\n`;
                xml += `    <deviceTypes>${scenario.deviceTypes.join(',')}</deviceTypes>\n`;
                xml += `    <parameters>${JSON.stringify(scenario.parameters)}</parameters>\n`;
                xml += `    <validationRules>${JSON.stringify(scenario.validationRules)}</validationRules>\n`;
                xml += `  </scenario>\n`;
            });
            
            xml += '</scenarios>';
            return xml;
        }

        /**
         * Get all scenarios
         */
        getAllScenarios() {
            return Array.from(this.scenarios.values());
        }

        /**
         * Get scenario by ID
         */
        getScenario(scenarioId) {
            return this.scenarios.get(scenarioId);
        }

        /**
         * Get scenarios by norm
         */
        getScenariosByNorm(norm) {
            return Array.from(this.scenarios.values())
                .filter(scenario => scenario.norm === norm);
        }

        /**
         * Get scenarios by device type
         */
        getScenariosByDeviceType(deviceType) {
            return Array.from(this.scenarios.values())
                .filter(scenario => scenario.deviceTypes.includes(deviceType));
        }

        /**
         * Get supported norms
         */
        getSupportedNorms() {
            return [...this.supportedNorms];
        }

        /**
         * Clear all scenarios (for testing)
         */
        clearAllScenarios() {
            this.scenarios.clear();
            console.log('🗑️ All scenarios cleared');
        }
    }

    return SettingsScenarioManager;
});

// Legacy global export
if (typeof window !== 'undefined') {
    window.SettingsScenarioManager = SettingsScenarioManager;
}
