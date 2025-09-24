/**
 * MASKTRONIC C20 - Vue.js Test Menu Template Component
 * Replaces vanilla test-menu-template.html
 * Interactive test menu with export functionality
 */


const TestMenuTemplate = {
    name: 'TestMenuTemplate',
    props: {
        user: {
            type: Object,
            default: () => ({ username: null, role: null, isAuthenticated: false })
        },
        language: {
            type: String,
            default: 'pl'
        }
    },
    
    emits: ['navigate', 'test-selected', 'export-data'],
    
    setup(props, { emit }) {
        // Reactive state
        const testState = reactive({
            selectedOption: null,
            exportInProgress: false,
            exportFormat: null,
            testData: [],
            
            // Test Wizard state (4-step process)
            wizardActive: false,
            wizardStep: 1,
            wizardData: {
                step1: { deviceType: null, deviceModel: null },
                step2: { testType: null, testStandard: null, pressureRange: null },
                step3: { duration: 300, cycles: 1, tolerance: 5, alerts: true },
                step4: { name: '', description: '', saveAsTemplate: false }
            },
            
            // Custom Scenarios state
            scenariosActive: false,
            customScenarios: [],
            selectedScenario: null,
            
            // Test History state
            historyActive: false,
            testHistory: [],
            historyFilter: 'all',
            
            // Test Templates state
            templatesActive: false,
            testTemplates: [],
            selectedTemplate: null
        });

        // Enhanced test menu options with advanced features
        const testOptions = computed(() => [
            {
                id: 'wizard',
                icon: '🪄',
                title: props.language === 'pl' ? 'Kreator Testów' : 'Test Wizard',
                description: props.language === 'pl' ? 'Guided 4-step test creation process' : '4-step guided test setup',
                color: 'blue',
                advanced: true
            },
            {
                id: 'scenarios',
                icon: '📈',
                title: props.language === 'pl' ? 'Własne Scenariusze' : 'Custom Scenarios',
                description: props.language === 'pl' ? 'Manage custom test scenarios' : 'Create and manage test scenarios',
                color: 'green',
                advanced: true
            },
            {
                id: 'history',
                icon: '📅',
                title: props.language === 'pl' ? 'Historia Testów' : 'Test History',
                description: props.language === 'pl' ? 'View previous test results' : 'Browse test execution history',
                color: 'purple',
                advanced: true
            },
            {
                id: 'templates',
                icon: '📋',
                title: props.language === 'pl' ? 'Szablony Testów' : 'Test Templates',
                description: props.language === 'pl' ? 'Pre-configured test templates' : 'Ready-to-use test configurations',
                color: 'orange',
                advanced: true
            },
            {
                id: 'device',
                icon: '🛡️',
                title: props.language === 'pl' ? 'Rodzaj urządzenia' : 'Kind of Device',
                description: props.language === 'pl' ? 'Wybierz rodzaj urządzenia' : 'Select device type',
                color: 'blue'
            },
            {
                id: 'type',
                icon: '🔧',
                title: props.language === 'pl' ? 'Typ urządzenia' : 'Device Type',
                description: props.language === 'pl' ? 'Wybierz typ urządzenia' : 'Select device model',
                color: 'green'
            },
            {
                id: 'test',
                icon: '🧪',
                title: props.language === 'pl' ? 'Rodzaj testu' : 'Kind of Test',
                description: props.language === 'pl' ? 'Wybierz rodzaj testu' : 'Select test type',
                color: 'purple'
            },
            {
                id: 'flow',
                icon: '🎯',
                title: props.language === 'pl' ? 'Przepływ testu' : 'Test Flow',
                description: props.language === 'pl' ? 'Scenariusz testowy' : 'Test scenario',
                color: 'orange'
            }
        ]);

        // Export formats
        const exportFormats = computed(() => [
            {
                id: 'json',
                label: 'JSON',
                icon: '📄',
                color: 'blue',
                description: 'JavaScript Object Notation'
            },
            {
                id: 'xml',
                label: 'XML',
                icon: '📋',
                color: 'green',
                description: 'Extensible Markup Language'
            },
            {
                id: 'csv',
                label: 'CSV',
                icon: '📊',
                color: 'purple',
                description: 'Comma Separated Values'
            },
            {
                id: 'pdf',
                label: 'PDF',
                icon: '📑',
                color: 'red',
                description: 'Portable Document Format'
            }
        ]);

        // Computed properties
        const pageTitle = computed(() => {
            const titleMap = {
                pl: 'Menu Testów',
                en: 'Test Menu',
                de: 'Testmenü'
            };
            return titleMap[props.language] || 'Menu Testów';
        });

        const exportTitle = computed(() => {
            const titleMap = {
                pl: 'Eksport danych testowych',
                en: 'Export Test Data',
                de: 'Testdaten exportieren'
            };
            return titleMap[props.language] || 'Eksport danych testowych';
        });

        // Methods
        const selectTestOption = async (option) => {
            console.log(`🔶 Vue: Test option selected: ${option.id}`);
            testState.selectedOption = option;
            
            // Handle advanced features
            switch (option.id) {
                case 'wizard':
                    startTestWizard();
                    break;
                case 'scenarios':
                    showCustomScenarios();
                    break;
                case 'history':
                    showTestHistory();
                    break;
                case 'templates':
                    showTestTemplates();
                    break;
                default:
                    // Legacy test options
                    if (window.TestManager && window.TestManager.selectTestOption) {
                        try {
                            await window.TestManager.selectTestOption(option.id);
                        } catch (error) {
                            console.error('Error calling TestManager:', error);
                        }
                    }
                    break;
            }
            
            // Emit event to parent
            emit('test-selected', { option, timestamp: new Date().toISOString() });
            
            // Simulate navigation or further action
            setTimeout(() => {
                emit('navigate', 'device-select', props.language, option.id);
            }, 500);
        };
        
        // Test Wizard Methods (4-step process)
        const startTestWizard = () => {
            console.log('🪄 Starting Test Wizard (4-step process)');
            testState.wizardActive = true;
            testState.wizardStep = 1;
            resetWizardData();
        };
        
        const resetWizardData = () => {
            testState.wizardData = {
                step1: { deviceType: null, deviceModel: null },
                step2: { testType: null, testStandard: null, pressureRange: null },
                step3: { duration: 300, cycles: 1, tolerance: 5, alerts: true },
                step4: { name: '', description: '', saveAsTemplate: false }
            };
        };
        
        const nextWizardStep = () => {
            if (testState.wizardStep < 4) {
                testState.wizardStep++;
                console.log(`🪄 Test Wizard: Step ${testState.wizardStep}`);
            }
        };
        
        const prevWizardStep = () => {
            if (testState.wizardStep > 1) {
                testState.wizardStep--;
                console.log(`🪄 Test Wizard: Step ${testState.wizardStep}`);
            }
        };
        
        const finishTestWizard = async () => {
            console.log('🪄 Finishing Test Wizard with data:', testState.wizardData);
            
            // Create test configuration
            const testConfig = {
                id: `test_${Date.now()}`,
                name: testState.wizardData.step4.name || 'New Test',
                description: testState.wizardData.step4.description,
                device: testState.wizardData.step1,
                test: testState.wizardData.step2,
                parameters: testState.wizardData.step3,
                created: new Date().toISOString(),
                status: 'configured'
            };
            
            // Save as template if requested
            if (testState.wizardData.step4.saveAsTemplate) {
                testState.testTemplates.push({
                    ...testConfig,
                    isTemplate: true,
                    templateName: testConfig.name
                });
                console.log('📋 Test saved as template');
            }
            
            // Add to history
            testState.testHistory.unshift(testConfig);
            
            // Close wizard
            testState.wizardActive = false;
            
            // Emit test creation event
            emit('test-created', testConfig);
            
            alert(props.language === 'pl' ? 
                'Test został skonfigurowany pomyślnie!' : 
                'Test configured successfully!');
        };
        
        const cancelTestWizard = () => {
            testState.wizardActive = false;
            testState.wizardStep = 1;
            resetWizardData();
        };
        
        // Custom Scenarios Methods
        const showCustomScenarios = () => {
            console.log('📈 Showing Custom Scenarios');
            testState.scenariosActive = true;
            loadCustomScenarios();
        };
        
        const loadCustomScenarios = () => {
            // Mock data for demonstration
            testState.customScenarios = [
                {
                    id: 'sc1',
                    name: 'Pressure Test Standard',
                    description: 'Standard pressure test with 5 cycles',
                    device: 'RPD',
                    testType: 'pressure',
                    parameters: { cycles: 5, duration: 300 },
                    created: '2024-01-15'
                },
                {
                    id: 'sc2', 
                    name: 'Extended Durability Test',
                    description: 'Long-duration test for device validation',
                    device: 'SCSR',
                    testType: 'durability',
                    parameters: { cycles: 20, duration: 1800 },
                    created: '2024-01-10'
                }
            ];
        };
        
        const createNewScenario = () => {
            // Start wizard with scenario mode
            startTestWizard();
            testState.wizardData.step4.saveAsTemplate = true;
        };
        
        // Test History Methods
        const showTestHistory = () => {
            console.log('📅 Showing Test History');
            testState.historyActive = true;
            loadTestHistory();
        };
        
        const loadTestHistory = () => {
            // Mock historical data
            testState.testHistory = [
                {
                    id: 'test_001',
                    name: 'RPD Pressure Test',
                    device: { deviceType: 'RPD', deviceModel: 'Model-A' },
                    status: 'completed',
                    result: 'PASS',
                    duration: '05:23',
                    date: '2024-01-20 14:30'
                },
                {
                    id: 'test_002', 
                    name: 'SCSR Durability Test',
                    device: { deviceType: 'SCSR', deviceModel: 'Model-B' },
                    status: 'completed',
                    result: 'FAIL',
                    duration: '12:45',
                    date: '2024-01-19 09:15'
                },
                {
                    id: 'test_003',
                    name: 'Quick Validation Test', 
                    device: { deviceType: 'RPD', deviceModel: 'Model-C' },
                    status: 'in_progress',
                    result: null,
                    duration: null,
                    date: '2024-01-21 11:00'
                }
            ];
        };
        
        // Test Templates Methods
        const showTestTemplates = () => {
            console.log('📋 Showing Test Templates');
            testState.templatesActive = true;
            loadTestTemplates();
        };
        
        const loadTestTemplates = () => {
            // Mock template data
            testState.testTemplates = [
                {
                    id: 'tpl_001',
                    name: 'Standard RPD Test',
                    description: 'Basic pressure test for RPD devices',
                    device: { deviceType: 'RPD', deviceModel: 'Any' },
                    test: { testType: 'pressure', testStandard: 'PN-EN-149' },
                    parameters: { duration: 300, cycles: 3, tolerance: 5 },
                    category: 'standard',
                    popular: true
                },
                {
                    id: 'tpl_002',
                    name: 'SCSR Durability Test',
                    description: 'Extended durability test for SCSR devices',
                    device: { deviceType: 'SCSR', deviceModel: 'Any' },
                    test: { testType: 'durability', testStandard: 'PN-EN-402' },
                    parameters: { duration: 1800, cycles: 10, tolerance: 2 },
                    category: 'extended',
                    popular: false
                },
                {
                    id: 'tpl_003',
                    name: 'Quick Validation',
                    description: 'Fast validation test for any device',
                    device: { deviceType: 'Any', deviceModel: 'Any' },
                    test: { testType: 'validation', testStandard: 'Internal' },
                    parameters: { duration: 120, cycles: 1, tolerance: 10 },
                    category: 'quick',
                    popular: true
                }
            ];
        };
        
        const useTemplate = (template) => {
            console.log('📋 Using template:', template.name);
            
            // Pre-fill wizard with template data
            testState.wizardData = {
                step1: template.device,
                step2: template.test,
                step3: template.parameters,
                step4: { 
                    name: `${template.name} - ${new Date().toLocaleDateString()}`,
                    description: `Based on template: ${template.description}`,
                    saveAsTemplate: false 
                }
            };
            
            // Start wizard with pre-filled data
            testState.templatesActive = false;
            testState.wizardActive = true;
            testState.wizardStep = 4; // Skip to final step for review
        };
        
        // Utility Methods
        const closeAllModals = () => {
            testState.wizardActive = false;
            testState.scenariosActive = false;
            testState.historyActive = false;
            testState.templatesActive = false;
        };

        const exportTestData = async (format) => {
            console.log(`🔶 Vue: Exporting test data as ${format.id}`);
            testState.exportInProgress = true;
            testState.exportFormat = format;
            
            try {
                // Generate mock test data
                const mockTestData = {
                    timestamp: new Date().toISOString(),
                    user: props.user.username,
                    role: props.user.role,
                    selectedOption: testState.selectedOption?.id || 'none',
                    testResults: [
                        { device: 'PP Mask', result: 'PASS', score: 95 },
                        { device: 'NP Mask', result: 'PASS', score: 88 },
                        { device: 'SCBA', result: 'FAIL', score: 65 }
                    ],
                    exportFormat: format.id,
                    language: props.language
                };
                
                // Integrate with existing export system if available
                if (window.DataExportManager && window.DataExportManager.exportData) {
                    await window.DataExportManager.exportData(mockTestData, format.id);
                } else if (window.exportTestData) {
                    // Fallback to existing vanilla function
                    await window.exportTestData(format.id);
                } else {
                    // Vue-only export simulation
                    await simulateExport(mockTestData, format);
                }
                
                // Emit event for parent component
                emit('export-data', { data: mockTestData, format });
                
                console.log(`✅ Vue: Test data exported successfully as ${format.id}`);
                
            } catch (error) {
                console.error(`❌ Vue: Export failed for ${format.id}:`, error);
                alert(`Eksport ${format.id} nieudany: ${error.message}`);
            } finally {
                testState.exportInProgress = false;
                testState.exportFormat = null;
            }
        };

        const simulateExport = async (data, format) => {
            // Simulate export delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            let content = '';
            let mimeType = '';
            let fileName = `test-data-${Date.now()}`;
            
            switch (format.id) {
                case 'json':
                    content = JSON.stringify(data, null, 2);
                    mimeType = 'application/json';
                    fileName += '.json';
                    break;
                case 'xml':
                    content = `<?xml version="1.0" encoding="UTF-8"?>
<testData>
    <timestamp>${data.timestamp}</timestamp>
    <user>${data.user}</user>
    <role>${data.role}</role>
    <results>
        ${data.testResults.map(r => `<result device="${r.device}" result="${r.result}" score="${r.score}"/>`).join('\n        ')}
    </results>
</testData>`;
                    mimeType = 'application/xml';
                    fileName += '.xml';
                    break;
                case 'csv':
                    content = `Device,Result,Score\n${data.testResults.map(r => `${r.device},${r.result},${r.score}`).join('\n')}`;
                    mimeType = 'text/csv';
                    fileName += '.csv';
                    break;
                case 'pdf':
                    // For PDF, we'd normally use jsPDF, but for now just simulate
                    content = `PDF Export - Test Data\nUser: ${data.user}\nTimestamp: ${data.timestamp}`;
                    mimeType = 'application/pdf';
                    fileName += '.pdf';
                    break;
            }
            
            // Create and trigger download
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        const goBack = () => {
            console.log('🔶 Vue: Returning to previous screen');
            emit('navigate', 'user-menu-screen', props.language, 'default');
        };

        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: TestMenuTemplate component mounted');
            console.log(`🔶 Vue: ${testOptions.value.length} test options available`);
        });

        return {
            // Reactive state
            testState,
            
            // Computed properties
            testOptions,
            exportFormats,
            pageTitle,
            exportTitle,
            
            // Basic methods
            selectTestOption,
            exportTestData,
            goBack,
            
            // Test Wizard methods
            startTestWizard,
            nextWizardStep,
            prevWizardStep,
            finishTestWizard,
            cancelTestWizard,
            
            // Custom Scenarios methods
            showCustomScenarios,
            createNewScenario,
            
            // Test History methods
            showTestHistory,
            
            // Test Templates methods
            showTestTemplates,
            useTemplate,
            
            // Utility methods
            closeAllModals
        };
    },

    template: `
        <div class="test-menu-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="vue-badge">Vue</div>
                </div>

                <!-- Test Options Grid -->
                <div class="test-menu-section">
                    <div class="menu-grid">
                        <div 
                            v-for="option in testOptions" 
                            :key="option.id"
                            class="menu-card"
                            :class="[
                                'card-' + option.color,
                                { active: testState.selectedOption?.id === option.id }
                            ]"
                            @click="selectTestOption(option)"
                        >
                            <div class="card-icon">{{ option.icon }}</div>
                            <div class="card-content">
                                <h3 class="card-title">{{ option.title }}</h3>
                                <p class="card-description">{{ option.description }}</p>
                            </div>
                            <div class="card-arrow">→</div>
                        </div>
                    </div>
                </div>

                <!-- Export Section -->
                <div class="export-section">
                    <h3 class="export-title">{{ exportTitle }}</h3>
                    
                    <div class="export-buttons">
                        <button 
                            v-for="format in exportFormats" 
                            :key="format.id"
                            class="btn-export"
                            :class="[
                                'btn-' + format.color,
                                { 
                                    loading: testState.exportInProgress && testState.exportFormat?.id === format.id,
                                    disabled: testState.exportInProgress && testState.exportFormat?.id !== format.id
                                }
                            ]"
                            @click="exportTestData(format)"
                            :disabled="testState.exportInProgress"
                        >
                            <span class="btn-icon">{{ format.icon }}</span>
                            <span class="btn-label">{{ format.label }}</span>
                            <span v-if="testState.exportInProgress && testState.exportFormat?.id === format.id" 
                                  class="btn-spinner">⏳</span>
                        </button>
                    </div>
                    
                    <p class="export-description">
                        Wybierz format eksportu danych testowych
                    </p>
                </div>

                <!-- Status Display -->
                <div v-if="testState.selectedOption" class="status-display">
                    <p><strong>Wybrana opcja:</strong> {{ testState.selectedOption.title }}</p>
                    <p><strong>Użytkownik:</strong> {{ user.username }} ({{ user.role }})</p>
                </div>
                
                <!-- Test Wizard Modal (4-step process) -->
                <div v-if="testState.wizardActive" class="modal-overlay" @click="cancelTestWizard">
                    <div class="modal-content wizard-modal" @click.stop>
                        <div class="modal-header">
                            <h3>🪄 Kreator Testów - Krok {{ testState.wizardStep }}/4</h3>
                            <button class="modal-close" @click="cancelTestWizard">×</button>
                        </div>
                        
                        <!-- Step Progress Bar -->
                        <div class="step-progress">
                            <div v-for="step in 4" :key="step" 
                                 :class="['step-indicator', { active: step <= testState.wizardStep, completed: step < testState.wizardStep }]">
                                {{ step }}
                            </div>
                        </div>
                        
                        <!-- Step 1: Device Selection -->
                        <div v-if="testState.wizardStep === 1" class="wizard-step">
                            <h4>🛡️ Wybierz Urządzenie</h4>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Typ urządzenia:</label>
                                    <select v-model="testState.wizardData.step1.deviceType">
                                        <option value="">-- Wybierz typ --</option>
                                        <option value="RPD">RPD (Respiratory Protective Device)</option>
                                        <option value="SCSR">SCSR (Self-Contained Self-Rescuer)</option>
                                        <option value="PAPR">PAPR (Powered Air-Purifying Respirator)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Model urządzenia:</label>
                                    <select v-model="testState.wizardData.step1.deviceModel" :disabled="!testState.wizardData.step1.deviceType">
                                        <option value="">-- Wybierz model --</option>
                                        <option v-if="testState.wizardData.step1.deviceType === 'RPD'" value="Model-A">Model-A</option>
                                        <option v-if="testState.wizardData.step1.deviceType === 'RPD'" value="Model-B">Model-B</option>
                                        <option v-if="testState.wizardData.step1.deviceType === 'SCSR'" value="SCSR-100">SCSR-100</option>
                                        <option v-if="testState.wizardData.step1.deviceType === 'SCSR'" value="SCSR-200">SCSR-200</option>
                                        <option v-if="testState.wizardData.step1.deviceType === 'PAPR'" value="PAPR-X1">PAPR-X1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Step 2: Test Configuration -->
                        <div v-if="testState.wizardStep === 2" class="wizard-step">
                            <h4>🧪 Konfiguracja Testu</h4>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Typ testu:</label>
                                    <select v-model="testState.wizardData.step2.testType">
                                        <option value="">-- Wybierz typ testu --</option>
                                        <option value="pressure">Test ciśnienia</option>
                                        <option value="durability">Test trwałości</option>
                                        <option value="validation">Walidacja</option>
                                        <option value="performance">Test wydajności</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Standard testowy:</label>
                                    <select v-model="testState.wizardData.step2.testStandard">
                                        <option value="">-- Wybierz standard --</option>
                                        <option value="PN-EN-149">PN-EN-149</option>
                                        <option value="PN-EN-402">PN-EN-402</option>
                                        <option value="PN-EN-136">PN-EN-136</option>
                                        <option value="Internal">Standard wewnętrzny</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Zakres ciśnienia:</label>
                                    <select v-model="testState.wizardData.step2.pressureRange">
                                        <option value="">-- Wybierz zakres --</option>
                                        <option value="low">Niski (0-10 mbar)</option>
                                        <option value="medium">Sredni (10-50 mbar)</option>
                                        <option value="high">Wysoki (50-100 mbar)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Step 3: Test Parameters -->
                        <div v-if="testState.wizardStep === 3" class="wizard-step">
                            <h4>⚙️ Parametry Testu</h4>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Czas trwania (s):</label>
                                    <input type="number" v-model.number="testState.wizardData.step3.duration" min="60" max="3600" />
                                </div>
                                <div class="form-group">
                                    <label>Liczba cykli:</label>
                                    <input type="number" v-model.number="testState.wizardData.step3.cycles" min="1" max="50" />
                                </div>
                                <div class="form-group">
                                    <label>Tolerancja (%):</label>
                                    <input type="number" v-model.number="testState.wizardData.step3.tolerance" min="1" max="20" />
                                </div>
                                <div class="form-group checkbox-group">
                                    <label>
                                        <input type="checkbox" v-model="testState.wizardData.step3.alerts" />
                                        Włącz alerty dźwiękowe
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Step 4: Test Summary & Save -->
                        <div v-if="testState.wizardStep === 4" class="wizard-step">
                            <h4>📝 Podsumowanie Testu</h4>
                            <div class="test-summary">
                                <div class="summary-section">
                                    <h5>Urządzenie:</h5>
                                    <p>{{ testState.wizardData.step1.deviceType }} - {{ testState.wizardData.step1.deviceModel }}</p>
                                </div>
                                <div class="summary-section">
                                    <h5>Test:</h5>
                                    <p>{{ testState.wizardData.step2.testType }} ({{ testState.wizardData.step2.testStandard }})</p>
                                    <p>Zakres: {{ testState.wizardData.step2.pressureRange }}</p>
                                </div>
                                <div class="summary-section">
                                    <h5>Parametry:</h5>
                                    <p>Czas: {{ testState.wizardData.step3.duration }}s, Cykle: {{ testState.wizardData.step3.cycles }}, Tolerancja: {{ testState.wizardData.step3.tolerance }}%</p>
                                </div>
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Nazwa testu:</label>
                                    <input type="text" v-model="testState.wizardData.step4.name" placeholder="Wprowadź nazwę testu" />
                                </div>
                                <div class="form-group full-width">
                                    <label>Opis testu:</label>
                                    <textarea v-model="testState.wizardData.step4.description" placeholder="Opcjonalny opis testu" rows="3"></textarea>
                                </div>
                                <div class="form-group checkbox-group">
                                    <label>
                                        <input type="checkbox" v-model="testState.wizardData.step4.saveAsTemplate" />
                                        Zapisz jako szablon
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Modal Footer with Navigation -->
                        <div class="modal-footer">
                            <button v-if="testState.wizardStep > 1" @click="prevWizardStep" class="btn btn-secondary">
                                ← Poprzedni
                            </button>
                            <button v-if="testState.wizardStep < 4" @click="nextWizardStep" class="btn btn-primary" 
                                    :disabled="!canProceedToNextStep">
                                Dalej →
                            </button>
                            <button v-if="testState.wizardStep === 4" @click="finishTestWizard" class="btn btn-success">
                                🏁 Zakończ test
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Custom Scenarios Modal -->
                <div v-if="testState.scenariosActive" class="modal-overlay" @click="testState.scenariosActive = false">
                    <div class="modal-content" @click.stop>
                        <div class="modal-header">
                            <h3>📈 Własne Scenariusze</h3>
                            <button class="modal-close" @click="testState.scenariosActive = false">×</button>
                        </div>
                        
                        <div class="scenarios-grid">
                            <div v-for="scenario in testState.customScenarios" :key="scenario.id" class="scenario-card">
                                <h4>{{ scenario.name }}</h4>
                                <p>{{ scenario.description }}</p>
                                <div class="scenario-meta">
                                    <span class="device-badge">{{ scenario.device }}</span>
                                    <span class="test-type">{{ scenario.testType }}</span>
                                </div>
                                <div class="scenario-actions">
                                    <button class="btn btn-primary btn-sm">Użyj</button>
                                    <button class="btn btn-secondary btn-sm">Edytuj</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <button @click="createNewScenario" class="btn btn-success">
                                + Nowy Scenariusz
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Test History Modal -->
                <div v-if="testState.historyActive" class="modal-overlay" @click="testState.historyActive = false">
                    <div class="modal-content history-modal" @click.stop>
                        <div class="modal-header">
                            <h3>📅 Historia Testów</h3>
                            <button class="modal-close" @click="testState.historyActive = false">×</button>
                        </div>
                        
                        <div class="history-filters">
                            <select v-model="testState.historyFilter">
                                <option value="all">Wszystkie testy</option>
                                <option value="completed">Zakończone</option>
                                <option value="failed">Nieudane</option>
                                <option value="in_progress">W trakcie</option>
                            </select>
                        </div>
                        
                        <div class="history-table">
                            <div class="history-header">
                                <span>Nazwa</span>
                                <span>Urządzenie</span>
                                <span>Status</span>
                                <span>Wynik</span>
                                <span>Data</span>
                                <span>Akcje</span>
                            </div>
                            <div v-for="test in testState.testHistory" :key="test.id" class="history-row">
                                <span class="test-name">{{ test.name }}</span>
                                <span class="device-info">{{ test.device.deviceType }} {{ test.device.deviceModel }}</span>
                                <span :class="['status-badge', test.status]">{{ test.status }}</span>
                                <span :class="['result-badge', test.result]">{{ test.result || '-' }}</span>
                                <span class="test-date">{{ test.date }}</span>
                                <span class="test-actions">
                                    <button class="btn btn-sm btn-secondary">Zobacz</button>
                                    <button v-if="test.result" class="btn btn-sm btn-primary">Raport</button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Test Templates Modal -->
                <div v-if="testState.templatesActive" class="modal-overlay" @click="testState.templatesActive = false">
                    <div class="modal-content templates-modal" @click.stop>
                        <div class="modal-header">
                            <h3>📋 Szablony Testów</h3>
                            <button class="modal-close" @click="testState.templatesActive = false">×</button>
                        </div>
                        
                        <div class="templates-categories">
                            <button class="category-btn active">Popularne</button>
                            <button class="category-btn">Standardowe</button>
                            <button class="category-btn">Rozszerzone</button>
                            <button class="category-btn">Szybkie</button>
                        </div>
                        
                        <div class="templates-grid">
                            <div v-for="template in testState.testTemplates" :key="template.id" 
                                 :class="['template-card', { popular: template.popular }]">
                                <div class="template-header">
                                    <h4>{{ template.name }}</h4>
                                    <span v-if="template.popular" class="popular-badge">⭐</span>
                                </div>
                                <p class="template-description">{{ template.description }}</p>
                                <div class="template-details">
                                    <div class="detail-item">
                                        <strong>Urządzenie:</strong> {{ template.device.deviceType }}
                                    </div>
                                    <div class="detail-item">
                                        <strong>Test:</strong> {{ template.test.testType }}
                                    </div>
                                    <div class="detail-item">
                                        <strong>Czas:</strong> {{ template.parameters.duration }}s
                                    </div>
                                </div>
                                <div class="template-actions">
                                    <button @click="useTemplate(template)" class="btn btn-primary">
                                        Użyj szablonu
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .test-menu-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .template-container {
            max-width: 1000px;
            margin: 0 auto;
        }
        
        .template-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        
        .back-btn {
            padding: 8px 16px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .back-btn:hover {
            background: #5a6268;
        }
        
        .template-title {
            margin: 0;
            color: #333;
            font-size: 1.8em;
        }
        
        .vue-badge {
            background: #42b883;
            color: white;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 0.9em;
            font-weight: 600;
        }
        
        .test-menu-section {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        
        .menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .menu-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            border: 2px solid transparent;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 16px;
            text-align: left;
        }
        
        .menu-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .menu-card.card-blue:hover { border-color: #007bff; }
        .menu-card.card-green:hover { border-color: #28a745; }
        .menu-card.card-purple:hover { border-color: #6f42c1; }
        .menu-card.card-orange:hover { border-color: #fd7e14; }
        
        .menu-card.active {
            background: #e7f3ff;
            border-color: #007bff;
        }
        
        .card-icon {
            font-size: 2em;
            width: 60px;
            text-align: center;
        }
        
        .card-content {
            flex: 1;
        }
        
        .card-title {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 1.1em;
        }
        
        .card-description {
            margin: 0;
            color: #666;
            font-size: 0.9em;
        }
        
        .card-arrow {
            font-size: 1.2em;
            color: #007bff;
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .menu-card:hover .card-arrow {
            opacity: 1;
        }
        
        .export-section {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        
        .export-title {
            margin: 0 0 20px 0;
            color: #333;
            font-size: 1.3em;
        }
        
        .export-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
            margin-bottom: 16px;
        }
        
        .btn-export {
            padding: 12px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            position: relative;
        }
        
        .btn-export:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .btn-export:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .btn-blue { background: #007bff; color: white; }
        .btn-green { background: #28a745; color: white; }
        .btn-purple { background: #6f42c1; color: white; }
        .btn-red { background: #dc3545; color: white; }
        
        .btn-spinner {
            animation: spin 1s linear infinite;
        }
        
        .export-description {
            margin: 0;
            color: #666;
            font-size: 0.9em;
            text-align: center;
        }
        
        .status-display {
            background: rgba(255,255,255,0.9);
            padding: 16px;
            border-radius: 8px;
            color: #333;
        }
        
        .status-display p {
            margin: 8px 0;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `
};

// Export component for use
window.TestMenuTemplate = TestMenuTemplate;
console.log('🔶 Vue TestMenuTemplate component loaded');
