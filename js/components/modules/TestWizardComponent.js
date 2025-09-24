/**
 * MASKTRONIC C20 - Test Wizard Component (Modular)
 * Extracted from TestMenuTemplate.js for better maintainability
 * Handles guided 4-step test creation process
 */

const TestWizardComponent = {
    name: 'TestWizardComponent',
    props: {
        user: { type: Object, required: true },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['wizard-complete', 'wizard-cancel'],
    
    setup(props, { emit }) {
        // Vue.js imports
        const { reactive, computed, onMounted, onUnmounted } = Vue;
        
        // Test Wizard State (4-step process)
        const wizardState = reactive({
            active: false,
            currentStep: 1,
            totalSteps: 4,
            wizardData: {
                step1: { 
                    deviceType: null, 
                    deviceModel: null,
                    deviceCategory: 'mask' // mask, respirator, filter
                },
                step2: { 
                    testType: null, 
                    testStandard: null, 
                    pressureRange: null,
                    testMethod: 'automatic' // automatic, manual, custom
                },
                step3: { 
                    duration: 300, // seconds
                    cycles: 1, 
                    tolerance: 5, // percentage
                    alerts: true,
                    autoStop: true,
                    repeatCount: 1
                },
                step4: { 
                    name: '', 
                    description: '', 
                    saveAsTemplate: false,
                    assignToOperator: props.user.username || '',
                    priority: 'normal' // low, normal, high
                }
            },
            validationErrors: [],
            isProcessing: false
        });
        
        // Step validation rules
        const stepValidation = {
            1: () => {
                const errors = [];
                if (!wizardState.wizardData.step1.deviceType) {
                    errors.push('Device type is required');
                }
                if (!wizardState.wizardData.step1.deviceModel) {
                    errors.push('Device model is required');
                }
                return errors;
            },
            2: () => {
                const errors = [];
                if (!wizardState.wizardData.step2.testType) {
                    errors.push('Test type is required');
                }
                if (!wizardState.wizardData.step2.testStandard) {
                    errors.push('Test standard is required');
                }
                if (!wizardState.wizardData.step2.pressureRange) {
                    errors.push('Pressure range is required');
                }
                return errors;
            },
            3: () => {
                const errors = [];
                if (wizardState.wizardData.step3.duration < 60 || wizardState.wizardData.step3.duration > 3600) {
                    errors.push('Duration must be between 60 and 3600 seconds');
                }
                if (wizardState.wizardData.step3.cycles < 1 || wizardState.wizardData.step3.cycles > 100) {
                    errors.push('Cycles must be between 1 and 100');
                }
                if (wizardState.wizardData.step3.tolerance < 1 || wizardState.wizardData.step3.tolerance > 50) {
                    errors.push('Tolerance must be between 1% and 50%');
                }
                return errors;
            },
            4: () => {
                const errors = [];
                if (!wizardState.wizardData.step4.name.trim()) {
                    errors.push('Test name is required');
                }
                if (wizardState.wizardData.step4.name.length > 100) {
                    errors.push('Test name must be less than 100 characters');
                }
                return errors;
            }
        };
        
        // Test Wizard Methods (4-step process)
        const startTestWizard = () => {
            console.log('🪄 Starting Test Wizard (4-step process)');
            wizardState.active = true;
            wizardState.currentStep = 1;
            resetWizardData();
            
            console.log('🪄 Test Wizard activated');
            console.log('🪄 Current step:', wizardState.currentStep);
        };
        
        const resetWizardData = () => {
            wizardState.wizardData = {
                step1: { deviceType: null, deviceModel: null, deviceCategory: 'mask' },
                step2: { testType: null, testStandard: null, pressureRange: null, testMethod: 'automatic' },
                step3: { duration: 300, cycles: 1, tolerance: 5, alerts: true, autoStop: true, repeatCount: 1 },
                step4: { name: '', description: '', saveAsTemplate: false, assignToOperator: props.user.username || '', priority: 'normal' }
            };
            wizardState.validationErrors = [];
            wizardState.isProcessing = false;
            
            console.log('🔄 Test Wizard data reset to defaults');
        };
        
        const nextWizardStep = () => {
            // Validate current step
            const errors = stepValidation[wizardState.currentStep]();
            wizardState.validationErrors = errors;
            
            if (errors.length > 0) {
                console.log('❌ Validation failed for step', wizardState.currentStep, ':', errors);
                return false;
            }
            
            if (wizardState.currentStep < wizardState.totalSteps) {
                wizardState.currentStep++;
                console.log('➡️ Advanced to Test Wizard step:', wizardState.currentStep);
                return true;
            }
            
            return false;
        };
        
        const prevWizardStep = () => {
            if (wizardState.currentStep > 1) {
                wizardState.currentStep--;
                wizardState.validationErrors = []; // Clear validation errors when going back
                console.log('⬅️ Returned to Test Wizard step:', wizardState.currentStep);
                return true;
            }
            return false;
        };
        
        const finishTestWizard = () => {
            console.log('🎯 Finishing Test Wizard...');
            wizardState.isProcessing = true;
            
            // Final validation
            const allErrors = [];
            for (let step = 1; step <= wizardState.totalSteps; step++) {
                const errors = stepValidation[step]();
                allErrors.push(...errors);
            }
            
            if (allErrors.length > 0) {
                wizardState.validationErrors = allErrors;
                wizardState.isProcessing = false;
                console.log('❌ Final validation failed:', allErrors);
                return;
            }
            
            // Simulate test creation process
            setTimeout(() => {
                const testConfiguration = {
                    id: `test_${Date.now()}`,
                    createdBy: props.user.username || 'Unknown',
                    createdAt: new Date().toISOString(),
                    ...wizardState.wizardData.step1,
                    ...wizardState.wizardData.step2,
                    ...wizardState.wizardData.step3,
                    ...wizardState.wizardData.step4,
                    status: 'configured',
                    wizardGenerated: true
                };
                
                console.log('✅ Test Wizard completed successfully');
                console.log('📋 Test configuration created:', testConfiguration);
                
                // Save as template if requested
                if (wizardState.wizardData.step4.saveAsTemplate) {
                    console.log('💾 Saving test configuration as template');
                }
                
                wizardState.isProcessing = false;
                wizardState.active = false;
                
                emit('wizard-complete', testConfiguration);
            }, 2000);
        };
        
        const cancelTestWizard = () => {
            console.log('❌ Test Wizard cancelled by user');
            wizardState.active = false;
            resetWizardData();
            emit('wizard-cancel');
        };
        
        // Helper methods
        const getStepTitle = (step) => {
            const titles = {
                pl: {
                    1: 'Krok 1: Wybór Urządzenia',
                    2: 'Krok 2: Parametry Testu', 
                    3: 'Krok 3: Konfiguracja',
                    4: 'Krok 4: Podsumowanie'
                },
                en: {
                    1: 'Step 1: Device Selection',
                    2: 'Step 2: Test Parameters',
                    3: 'Step 3: Configuration', 
                    4: 'Step 4: Summary'
                }
            };
            return titles[props.language]?.[step] || titles.en[step];
        };
        
        const getStepDescription = (step) => {
            const descriptions = {
                pl: {
                    1: 'Wybierz typ i model urządzenia do testowania',
                    2: 'Określ rodzaj testu i standard testowy',
                    3: 'Skonfiguruj parametry wykonania testu',
                    4: 'Przejrzyj konfigurację i uruchom test'
                },
                en: {
                    1: 'Select device type and model for testing',
                    2: 'Define test type and testing standard',
                    3: 'Configure test execution parameters',
                    4: 'Review configuration and start test'
                }
            };
            return descriptions[props.language]?.[step] || descriptions.en[step];
        };
        
        // Computed properties
        const currentStepTitle = computed(() => getStepTitle(wizardState.currentStep));
        const currentStepDescription = computed(() => getStepDescription(wizardState.currentStep));
        const canGoNext = computed(() => wizardState.currentStep < wizardState.totalSteps);
        const canGoPrev = computed(() => wizardState.currentStep > 1);
        const isLastStep = computed(() => wizardState.currentStep === wizardState.totalSteps);
        const progressPercentage = computed(() => (wizardState.currentStep / wizardState.totalSteps) * 100);
        
        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: TestWizardComponent mounted');
        });
        
        onUnmounted(() => {
            console.log('🔶 Vue: TestWizardComponent unmounted');
        });
        
        return {
            wizardState,
            currentStepTitle,
            currentStepDescription,
            canGoNext,
            canGoPrev,
            isLastStep,
            progressPercentage,
            startTestWizard,
            resetWizardData,
            nextWizardStep,
            prevWizardStep,
            finishTestWizard,
            cancelTestWizard,
            getStepTitle,
            getStepDescription
        };
    },
    
    template: `
        <div v-if="wizardState.active" class="test-wizard-modal">
            <div class="wizard-overlay" @click="cancelTestWizard"></div>
            <div class="wizard-container">
                <div class="wizard-header">
                    <h3>🪄 {{ currentStepTitle }}</h3>
                    <button @click="cancelTestWizard" class="close-btn">✕</button>
                </div>
                
                <div class="wizard-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ wizardState.currentStep }}/{{ wizardState.totalSteps }}</span>
                </div>
                
                <div class="wizard-body">
                    <p class="step-description">{{ currentStepDescription }}</p>
                    
                    <div v-if="wizardState.validationErrors.length > 0" class="validation-errors">
                        <div v-for="error in wizardState.validationErrors" :key="error" class="error-item">
                            ❌ {{ error }}
                        </div>
                    </div>
                    
                    <!-- Step 1: Device Selection -->
                    <div v-if="wizardState.currentStep === 1" class="wizard-step">
                        <div class="form-group">
                            <label>Kategoria urządzenia:</label>
                            <select v-model="wizardState.wizardData.step1.deviceCategory">
                                <option value="mask">Maska ochronna</option>
                                <option value="respirator">Respirator</option>
                                <option value="filter">Filtr</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Typ urządzenia:</label>
                            <select v-model="wizardState.wizardData.step1.deviceType">
                                <option value="">Wybierz typ...</option>
                                <option value="ffp1">FFP1</option>
                                <option value="ffp2">FFP2</option>
                                <option value="ffp3">FFP3</option>
                                <option value="surgical">Chirurgiczna</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Model urządzenia:</label>
                            <input v-model="wizardState.wizardData.step1.deviceModel" 
                                   type="text" 
                                   placeholder="Wprowadź model urządzenia">
                        </div>
                    </div>
                    
                    <!-- Step 2: Test Parameters -->
                    <div v-if="wizardState.currentStep === 2" class="wizard-step">
                        <div class="form-group">
                            <label>Rodzaj testu:</label>
                            <select v-model="wizardState.wizardData.step2.testType">
                                <option value="">Wybierz test...</option>
                                <option value="filtration">Test filtracji</option>
                                <option value="breathability">Test oddychalności</option>
                                <option value="fit">Test dopasowania</option>
                                <option value="durability">Test trwałości</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Standard testowy:</label>
                            <select v-model="wizardState.wizardData.step2.testStandard">
                                <option value="">Wybierz standard...</option>
                                <option value="en149">EN 149</option>
                                <option value="en14683">EN 14683</option>
                                <option value="astm">ASTM F2100</option>
                                <option value="iso">ISO 17664</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Zakres ciśnienia:</label>
                            <select v-model="wizardState.wizardData.step2.pressureRange">
                                <option value="">Wybierz zakres...</option>
                                <option value="low">0-50 Pa</option>
                                <option value="medium">50-200 Pa</option>
                                <option value="high">200-500 Pa</option>
                                <option value="custom">Niestandardowy</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Metoda testowa:</label>
                            <select v-model="wizardState.wizardData.step2.testMethod">
                                <option value="automatic">Automatyczna</option>
                                <option value="manual">Ręczna</option>
                                <option value="custom">Niestandardowa</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Step 3: Configuration -->
                    <div v-if="wizardState.currentStep === 3" class="wizard-step">
                        <div class="form-group">
                            <label>Czas trwania (sekundy):</label>
                            <input v-model.number="wizardState.wizardData.step3.duration" 
                                   type="number" 
                                   min="60" 
                                   max="3600">
                        </div>
                        
                        <div class="form-group">
                            <label>Liczba cykli:</label>
                            <input v-model.number="wizardState.wizardData.step3.cycles" 
                                   type="number" 
                                   min="1" 
                                   max="100">
                        </div>
                        
                        <div class="form-group">
                            <label>Tolerancja (%):</label>
                            <input v-model.number="wizardState.wizardData.step3.tolerance" 
                                   type="number" 
                                   min="1" 
                                   max="50">
                        </div>
                        
                        <div class="form-group">
                            <label>Liczba powtórzeń:</label>
                            <input v-model.number="wizardState.wizardData.step3.repeatCount" 
                                   type="number" 
                                   min="1" 
                                   max="10">
                        </div>
                        
                        <div class="checkbox-group">
                            <label>
                                <input v-model="wizardState.wizardData.step3.alerts" type="checkbox">
                                Włącz alerty dźwiękowe
                            </label>
                            <label>
                                <input v-model="wizardState.wizardData.step3.autoStop" type="checkbox">
                                Automatyczne zatrzymanie przy błędzie
                            </label>
                        </div>
                    </div>
                    
                    <!-- Step 4: Summary -->
                    <div v-if="wizardState.currentStep === 4" class="wizard-step">
                        <div class="form-group">
                            <label>Nazwa testu:</label>
                            <input v-model="wizardState.wizardData.step4.name" 
                                   type="text" 
                                   placeholder="Wprowadź nazwę testu">
                        </div>
                        
                        <div class="form-group">
                            <label>Opis testu:</label>
                            <textarea v-model="wizardState.wizardData.step4.description" 
                                      placeholder="Opcjonalny opis testu"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>Przypisz do operatora:</label>
                            <input v-model="wizardState.wizardData.step4.assignToOperator" 
                                   type="text" 
                                   placeholder="Nazwa operatora">
                        </div>
                        
                        <div class="form-group">
                            <label>Priorytet:</label>
                            <select v-model="wizardState.wizardData.step4.priority">
                                <option value="low">Niski</option>
                                <option value="normal">Normalny</option>
                                <option value="high">Wysoki</option>
                            </select>
                        </div>
                        
                        <div class="checkbox-group">
                            <label>
                                <input v-model="wizardState.wizardData.step4.saveAsTemplate" type="checkbox">
                                Zapisz jako szablon testu
                            </label>
                        </div>
                        
                        <div class="test-summary">
                            <h4>📋 Podsumowanie konfiguracji:</h4>
                            <div class="summary-grid">
                                <div class="summary-item">
                                    <strong>Urządzenie:</strong> 
                                    {{ wizardState.wizardData.step1.deviceType }} - {{ wizardState.wizardData.step1.deviceModel }}
                                </div>
                                <div class="summary-item">
                                    <strong>Test:</strong> 
                                    {{ wizardState.wizardData.step2.testType }} ({{ wizardState.wizardData.step2.testStandard }})
                                </div>
                                <div class="summary-item">
                                    <strong>Parametry:</strong> 
                                    {{ wizardState.wizardData.step3.duration }}s, {{ wizardState.wizardData.step3.cycles }} cykli
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="wizard-footer">
                    <button v-if="canGoPrev" @click="prevWizardStep" class="btn btn-secondary">
                        ⬅️ Wstecz
                    </button>
                    
                    <div class="spacer"></div>
                    
                    <button v-if="canGoNext" @click="nextWizardStep" class="btn btn-primary">
                        Dalej ➡️
                    </button>
                    
                    <button v-if="isLastStep" @click="finishTestWizard" 
                            :disabled="wizardState.isProcessing" 
                            class="btn btn-success">
                        <span v-if="wizardState.isProcessing">⏳ Tworzenie...</span>
                        <span v-else>🚀 Uruchom Test</span>
                    </button>
                </div>
            </div>
        </div>
    `,
    
    style: `
        .test-wizard-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .wizard-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
        }
        
        .wizard-container {
            position: relative;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .wizard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
            background: #f8f9fa;
        }
        
        .wizard-header h3 {
            margin: 0;
            color: #333;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 1.5em;
            cursor: pointer;
            color: #666;
            padding: 4px;
        }
        
        .wizard-progress {
            padding: 16px 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
        }
        
        .progress-bar {
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 8px;
        }
        
        .progress-fill {
            height: 100%;
            background: #007bff;
            border-radius: 4px;
            transition: width 0.3s;
        }
        
        .progress-text {
            font-size: 0.9em;
            color: #666;
        }
        
        .wizard-body {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }
        
        .step-description {
            margin: 0 0 20px 0;
            color: #666;
            font-style: italic;
        }
        
        .validation-errors {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 20px;
        }
        
        .error-item {
            color: #e53e3e;
            font-size: 0.9em;
            margin-bottom: 4px;
        }
        
        .form-group {
            margin-bottom: 16px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 6px;
            font-weight: 600;
            color: #333;
        }
        
        .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1em;
        }
        
        .checkbox-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .checkbox-group label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: normal;
        }
        
        .test-summary {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .test-summary h4 {
            margin: 0 0 12px 0;
            color: #333;
        }
        
        .summary-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .summary-item {
            padding: 8px;
            background: white;
            border-radius: 4px;
            font-size: 0.9em;
        }
        
        .wizard-footer {
            display: flex;
            align-items: center;
            padding: 20px;
            border-top: 1px solid #e9ecef;
            background: #f8f9fa;
        }
        
        .spacer {
            flex: 1;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .btn-primary {
            background: #007bff;
            color: white;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-success {
            background: #28a745;
            color: white;
        }
        
        .btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
    `
};

window.TestWizardComponent = TestWizardComponent;
console.log('🪄 Vue TestWizardComponent loaded');
