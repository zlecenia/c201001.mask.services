/**
 * MASKSERVICE C20 - Vue.js Test Menu Template Component
 * Replaces vanilla test-menu-template.html
 * Interactive test menu with export functionality
 */

const { ref, reactive, computed, onMounted } = Vue;

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
            testData: []
        });

        // Test menu options
        const testOptions = computed(() => [
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
            
            // Integrate with existing test system if available
            if (window.TestManager && window.TestManager.selectTestOption) {
                try {
                    await window.TestManager.selectTestOption(option.id);
                } catch (error) {
                    console.error(`🔶 Vue: Test selection failed for ${option.id}:`, error);
                }
            }
            
            // Emit event for parent component
            emit('test-selected', option);
            
            // Simulate navigation or further action
            setTimeout(() => {
                emit('navigate', 'device-select', props.language, option.id);
            }, 500);
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
            testState,
            testOptions,
            exportFormats,
            pageTitle,
            exportTitle,
            selectTestOption,
            exportTestData,
            goBack
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
