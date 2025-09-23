/**
 * MASKSERVICE C20 - Settings Standards Validator Module
 * Validates compliance with PN-EN 136/137 and other standards
 * Extracted from system-settings-enhanced.js for modularity
 */

define('settings-standards-validator', [], function() {

    class SettingsStandardsValidator {
        constructor() {
            this.standards = new Map();
            this.validationRules = new Map();
            this.customStandards = new Set();
            this.init();
        }

        init() {
            this.setupStandardsLibrary();
            this.setupValidationRules();
            console.log('✅ SettingsStandardsValidator initialized');
        }

        setupStandardsLibrary() {
            // PN-EN 136 - Respiratory protective devices - Full face masks
            this.standards.set('PN-EN 136', {
                name: 'PN-EN 136',
                title: 'Respiratory protective devices - Full face masks - Requirements, testing, marking',
                version: '2019',
                enabled: true,
                category: 'respiratory_protection',
                applicableDevices: ['PP_MASK', 'NP_MASK', 'FULL_FACE_MASK'],
                requirements: {
                    leakage: {
                        inward: { max: 0.05, unit: '%', testPressure: -1000, testPressureUnit: 'Pa' },
                        outward: { max: 2.0, unit: 'ml/min', testPressure: 100, testPressureUnit: 'Pa' }
                    },
                    resistance: {
                        inhalation: { max: 2.4, unit: 'mbar', flow: 95, flowUnit: 'l/min' },
                        exhalation: { max: 3.0, unit: 'mbar', flow: 160, flowUnit: 'l/min' }
                    },
                    fieldOfVision: { min: 70, unit: 'degrees' },
                    durability: { cycles: 10000, type: 'breathing_cycles' }
                }
            });

            // PN-EN 137 - Self-contained open-circuit breathing apparatus
            this.standards.set('PN-EN 137', {
                name: 'PN-EN 137',
                title: 'Self-contained open-circuit breathing apparatus with full face mask or mouthpiece assembly for use as escape apparatus',
                version: '2019',
                enabled: true,
                category: 'breathing_apparatus',
                applicableDevices: ['SCBA', 'ESCAPE_APPARATUS'],
                requirements: {
                    pressure: {
                        working: { min: 200, max: 300, unit: 'bar' },
                        alarm: { trigger: 55, unit: 'bar', tolerance: 5 },
                        test: { pressure: 1.5, multiplier: 'working_pressure', duration: 1, durationUnit: 'min' }
                    },
                    airFlow: {
                        delivery: { min: 200, unit: 'l/min', conditions: 'STPD' },
                        emergency: { min: 400, unit: 'l/min', activationPressure: 55, activationPressureUnit: 'bar' }
                    },
                    duration: {
                        rated: { min: 10, unit: 'min' },
                        escape: { min: 15, unit: 'min', workLoad: 'moderate' }
                    },
                    alarms: {
                        visual: { required: true, type: 'pressure_gauge' },
                        audible: { required: true, sound: 90, soundUnit: 'dB', distance: 1, distanceUnit: 'm' }
                    }
                }
            });

            // EN 14387 - Gas filters and combined filters
            this.standards.set('EN 14387', {
                name: 'EN 14387',
                title: 'Respiratory protective devices - Gas filters and combined filters - Requirements, testing, marking',
                version: '2019',
                enabled: false,
                category: 'filters',
                applicableDevices: ['GAS_FILTER', 'COMBINED_FILTER'],
                requirements: {
                    breakthrough: {
                        time: { min: 20, unit: 'min', concentration: 1000, concentrationUnit: 'ppm' },
                        testGases: ['CO', 'NO2', 'SO2', 'H2S', 'NH3']
                    },
                    resistance: {
                        initial: { max: 3.0, unit: 'mbar', flow: 95, flowUnit: 'l/min' },
                        loaded: { max: 5.0, unit: 'mbar', flow: 95, flowUnit: 'l/min' }
                    }
                }
            });

            console.log(`📋 Loaded ${this.standards.size} standards definitions`);
        }

        setupValidationRules() {
            // Validation rules for different test scenarios
            this.validationRules.set('pressure_test', {
                applicableStandards: ['PN-EN 136', 'PN-EN 137'],
                validator: this.validatePressureTest.bind(this),
                severity: 'critical'
            });

            this.validationRules.set('leakage_test', {
                applicableStandards: ['PN-EN 136'],
                validator: this.validateLeakageTest.bind(this),
                severity: 'critical'
            });

            this.validationRules.set('flow_test', {
                applicableStandards: ['PN-EN 137'],
                validator: this.validateFlowTest.bind(this),
                severity: 'high'
            });

            this.validationRules.set('alarm_test', {
                applicableStandards: ['PN-EN 137'],
                validator: this.validateAlarmTest.bind(this),
                severity: 'critical'
            });

            console.log(`🔍 Configured ${this.validationRules.size} validation rules`);
        }

        /**
         * Validate test scenario against applicable standards
         */
        validateScenario(scenario) {
            const validation = {
                scenario: scenario.id,
                standard: scenario.norm,
                valid: true,
                errors: [],
                warnings: [],
                recommendations: [],
                details: []
            };

            // Check if standard is supported
            const standard = this.standards.get(scenario.norm);
            if (!standard) {
                validation.valid = false;
                validation.errors.push(`Unsupported standard: ${scenario.norm}`);
                return validation;
            }

            if (!standard.enabled) {
                validation.warnings.push(`Standard ${scenario.norm} is not enabled for validation`);
            }

            // Check device type compatibility
            const deviceTypeValid = scenario.deviceTypes.some(deviceType => 
                standard.applicableDevices.includes(deviceType)
            );

            if (!deviceTypeValid) {
                validation.warnings.push(
                    `Device types ${scenario.deviceTypes.join(', ')} may not be fully compatible with ${scenario.norm}. ` +
                    `Applicable devices: ${standard.applicableDevices.join(', ')}`
                );
            }

            // Run specific validation tests
            this.runValidationTests(scenario, standard, validation);

            return validation;
        }

        /**
         * Run specific validation tests for the scenario
         */
        runValidationTests(scenario, standard, validation) {
            // Check pressure test validation
            if (scenario.parameters.pressureTest) {
                const pressureValidation = this.validatePressureTest(scenario.parameters.pressureTest, standard);
                this.mergeValidationResults(validation, pressureValidation, 'pressure_test');
            }

            // Check leakage test validation
            if (scenario.parameters.leakageTest && standard.requirements.leakage) {
                const leakageValidation = this.validateLeakageTest(scenario.parameters.leakageTest, standard);
                this.mergeValidationResults(validation, leakageValidation, 'leakage_test');
            }

            // Check flow test validation for SCBA
            if (scenario.parameters.airFlow && standard.requirements.airFlow) {
                const flowValidation = this.validateFlowTest(scenario.parameters.airFlow, standard);
                this.mergeValidationResults(validation, flowValidation, 'flow_test');
            }

            // Check alarm test validation for SCBA
            if (scenario.parameters.alarmTest && standard.requirements.alarms) {
                const alarmValidation = this.validateAlarmTest(scenario.parameters.alarmTest, standard);
                this.mergeValidationResults(validation, alarmValidation, 'alarm_test');
            }
        }

        /**
         * Validate pressure test parameters
         */
        validatePressureTest(pressureTest, standard) {
            const validation = { valid: true, errors: [], warnings: [], recommendations: [] };

            if (standard.name === 'PN-EN 136') {
                // For respiratory protective devices
                const { min, max, unit } = pressureTest;
                
                if (unit !== 'mbar' && unit !== 'Pa') {
                    validation.warnings.push('PN-EN 136 typically uses mbar or Pa for pressure measurements');
                }

                if (unit === 'mbar') {
                    if (min < -2 || min > 2) {
                        validation.warnings.push('PN-EN 136: Test pressure typically ranges from -2 to +2 mbar');
                    }
                }

            } else if (standard.name === 'PN-EN 137') {
                // For SCBA equipment
                const { min, max, unit } = pressureTest;
                
                if (unit !== 'bar') {
                    validation.errors.push('PN-EN 137: SCBA pressure tests must be specified in bar');
                    validation.valid = false;
                }

                const workingPressure = standard.requirements.pressure.working;
                if (max < workingPressure.min || min > workingPressure.max) {
                    validation.warnings.push(
                        `PN-EN 137: Test pressure should align with working pressure range ` +
                        `${workingPressure.min}-${workingPressure.max} ${workingPressure.unit}`
                    );
                }
            }

            return validation;
        }

        /**
         * Validate leakage test parameters
         */
        validateLeakageTest(leakageTest, standard) {
            const validation = { valid: true, errors: [], warnings: [], recommendations: [] };

            if (standard.requirements.leakage) {
                const { maxLeak, unit } = leakageTest;
                const inwardLeakage = standard.requirements.leakage.inward;
                const outwardLeakage = standard.requirements.leakage.outward;

                if (unit === '%' && inwardLeakage) {
                    if (maxLeak > inwardLeakage.max) {
                        validation.errors.push(
                            `Inward leakage ${maxLeak}% exceeds ${standard.name} limit of ${inwardLeakage.max}%`
                        );
                        validation.valid = false;
                    }
                } else if (unit === 'ml/min' && outwardLeakage) {
                    if (maxLeak > outwardLeakage.max) {
                        validation.errors.push(
                            `Outward leakage ${maxLeak} ml/min exceeds ${standard.name} limit of ${outwardLeakage.max} ml/min`
                        );
                        validation.valid = false;
                    }
                }
            }

            return validation;
        }

        /**
         * Validate air flow parameters
         */
        validateFlowTest(airFlow, standard) {
            const validation = { valid: true, errors: [], warnings: [], recommendations: [] };

            if (standard.requirements.airFlow) {
                const { min, max, unit } = airFlow;
                const requiredFlow = standard.requirements.airFlow.delivery;

                if (unit !== requiredFlow.unit) {
                    validation.warnings.push(
                        `Flow unit should be ${requiredFlow.unit} according to ${standard.name}`
                    );
                }

                if (min < requiredFlow.min) {
                    validation.errors.push(
                        `Minimum flow ${min} ${unit} below ${standard.name} requirement of ${requiredFlow.min} ${requiredFlow.unit}`
                    );
                    validation.valid = false;
                }
            }

            return validation;
        }

        /**
         * Validate alarm test parameters
         */
        validateAlarmTest(alarmTest, standard) {
            const validation = { valid: true, errors: [], warnings: [], recommendations: [] };

            if (standard.requirements.alarms) {
                const { lowPressure, unit } = alarmTest;
                const requiredAlarm = standard.requirements.pressure.alarm;

                if (unit !== requiredAlarm.unit) {
                    validation.warnings.push(
                        `Alarm pressure unit should be ${requiredAlarm.unit} according to ${standard.name}`
                    );
                }

                const expectedTrigger = requiredAlarm.trigger;
                const tolerance = requiredAlarm.tolerance;
                
                if (lowPressure < (expectedTrigger - tolerance) || lowPressure > (expectedTrigger + tolerance)) {
                    validation.warnings.push(
                        `Alarm trigger ${lowPressure} ${unit} outside recommended range: ` +
                        `${expectedTrigger - tolerance}-${expectedTrigger + tolerance} ${requiredAlarm.unit}`
                    );
                }
            }

            return validation;
        }

        /**
         * Merge validation results
         */
        mergeValidationResults(mainValidation, testValidation, testType) {
            if (!testValidation.valid) {
                mainValidation.valid = false;
            }

            mainValidation.errors.push(...testValidation.errors.map(err => `${testType}: ${err}`));
            mainValidation.warnings.push(...testValidation.warnings.map(warn => `${testType}: ${warn}`));
            mainValidation.recommendations.push(...testValidation.recommendations.map(rec => `${testType}: ${rec}`));
        }

        /**
         * Get available standards
         */
        getAvailableStandards() {
            return Array.from(this.standards.values());
        }

        /**
         * Enable/disable standard
         */
        toggleStandard(standardName, enabled) {
            const standard = this.standards.get(standardName);
            if (!standard) {
                throw new Error(`Standard not found: ${standardName}`);
            }

            standard.enabled = enabled;
            console.log(`${enabled ? '✅' : '⏹️'} ${enabled ? 'Enabled' : 'Disabled'} standard: ${standardName}`);
            
            return standard;
        }

        /**
         * Add custom standard requirement
         */
        addCustomStandard(requirement) {
            const customStandard = {
                id: `custom_${Date.now()}`,
                name: requirement.name,
                description: requirement.description,
                category: requirement.category || 'custom',
                created: new Date().toISOString(),
                ...requirement
            };

            this.customStandards.add(customStandard);
            console.log(`➕ Added custom standard: ${requirement.name}`);
            
            return customStandard;
        }

        /**
         * Remove custom standard
         */
        removeCustomStandard(standardId) {
            const customStandard = Array.from(this.customStandards)
                .find(std => std.id === standardId);
            
            if (customStandard) {
                this.customStandards.delete(customStandard);
                console.log(`🗑️ Removed custom standard: ${customStandard.name}`);
                return true;
            }
            
            return false;
        }

        /**
         * Export standards configuration
         */
        exportStandardsConfig() {
            return JSON.stringify({
                standards: Array.from(this.standards.values()),
                customStandards: Array.from(this.customStandards),
                validationRules: Object.fromEntries(this.validationRules)
            }, null, 2);
        }

        /**
         * Import standards configuration
         */
        importStandardsConfig(configJson) {
            try {
                const config = JSON.parse(configJson);
                
                // Import custom standards
                if (config.customStandards) {
                    config.customStandards.forEach(std => {
                        this.customStandards.add(std);
                    });
                }

                // Update standard enabled states
                if (config.standards) {
                    config.standards.forEach(importedStd => {
                        const existing = this.standards.get(importedStd.name);
                        if (existing) {
                            existing.enabled = importedStd.enabled;
                        }
                    });
                }

                console.log('✅ Standards configuration imported successfully');
                return { success: true, message: 'Standards configuration imported' };

            } catch (error) {
                console.error('❌ Failed to import standards configuration:', error.message);
                return { success: false, message: `Import failed: ${error.message}` };
            }
        }
    }

    return SettingsStandardsValidator;
});

// Legacy global export
if (typeof window !== 'undefined') {
    window.SettingsStandardsValidator = SettingsStandardsValidator;
}
