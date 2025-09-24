/**
 * MASKTRONIC C20 - Custom Scenarios Component (Modular)
 * Extracted from TestMenuTemplate.js for better maintainability
 * Handles custom test scenarios management
 */

const CustomScenariosComponent = {
    name: 'CustomScenariosComponent',
    props: {
        user: { type: Object, required: true },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['scenario-selected', 'scenario-created'],
    
    setup(props, { emit }) {
        // Vue.js imports
        const { reactive, computed, onMounted } = Vue;
        
        // Custom Scenarios State
        const scenariosState = reactive({
            active: false,
            scenarios: [],
            selectedScenario: null,
            isCreating: false,
            newScenario: {
                name: '',
                description: '',
                deviceType: '',
                testType: '',
                parameters: {}
            }
        });
        
        // Custom Scenarios Methods
        const showCustomScenarios = () => {
            console.log('📈 Opening Custom Scenarios management');
            scenariosState.active = true;
            loadCustomScenarios();
        };
        
        const loadCustomScenarios = () => {
            // Mock scenarios data
            scenariosState.scenarios = [
                {
                    id: 'scenario_001',
                    name: 'FFP2 Filtration Test',
                    description: 'Standard filtration test for FFP2 masks',
                    deviceType: 'ffp2',
                    testType: 'filtration',
                    createdBy: 'admin',
                    createdAt: '2024-01-15',
                    parameters: { duration: 300, pressure: 150, cycles: 3 }
                },
                {
                    id: 'scenario_002', 
                    name: 'Surgical Mask Breathability',
                    description: 'Breathability test for surgical masks',
                    deviceType: 'surgical',
                    testType: 'breathability',
                    createdBy: 'tech-user',
                    createdAt: '2024-01-10',
                    parameters: { duration: 180, pressure: 100, cycles: 1 }
                }
            ];
            
            console.log(`📈 Loaded ${scenariosState.scenarios.length} custom scenarios`);
        };
        
        const createNewScenario = () => {
            scenariosState.isCreating = true;
            scenariosState.newScenario = {
                name: '',
                description: '',
                deviceType: '',
                testType: '',
                parameters: {}
            };
        };
        
        const saveNewScenario = () => {
            const scenario = {
                id: `scenario_${Date.now()}`,
                ...scenariosState.newScenario,
                createdBy: props.user.username || 'Unknown',
                createdAt: new Date().toISOString().split('T')[0]
            };
            
            scenariosState.scenarios.push(scenario);
            scenariosState.isCreating = false;
            
            console.log('✅ New scenario created:', scenario);
            emit('scenario-created', scenario);
        };
        
        const selectScenario = (scenario) => {
            scenariosState.selectedScenario = scenario;
            console.log('📈 Selected scenario:', scenario.name);
            emit('scenario-selected', scenario);
        };
        
        const closeScenarios = () => {
            scenariosState.active = false;
            scenariosState.isCreating = false;
        };
        
        // Computed properties
        const scenarioCount = computed(() => scenariosState.scenarios.length);
        
        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: CustomScenariosComponent mounted');
        });
        
        return {
            scenariosState,
            scenarioCount,
            showCustomScenarios,
            loadCustomScenarios,
            createNewScenario,
            saveNewScenario,
            selectScenario,
            closeScenarios
        };
    },
    
    template: `
        <div v-if="scenariosState.active" class="scenarios-modal">
            <div class="modal-overlay" @click="closeScenarios"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h3>📈 Custom Scenarios ({{ scenarioCount }})</h3>
                    <button @click="closeScenarios" class="close-btn">✕</button>
                </div>
                
                <div class="modal-body">
                    <div class="scenarios-actions">
                        <button @click="createNewScenario" class="btn btn-primary">
                            ➕ Create New Scenario
                        </button>
                    </div>
                    
                    <div v-if="scenariosState.isCreating" class="scenario-form">
                        <h4>Create New Scenario</h4>
                        <div class="form-group">
                            <label>Name:</label>
                            <input v-model="scenariosState.newScenario.name" type="text">
                        </div>
                        <div class="form-group">
                            <label>Description:</label>
                            <textarea v-model="scenariosState.newScenario.description"></textarea>
                        </div>
                        <div class="form-actions">
                            <button @click="saveNewScenario" class="btn btn-success">Save</button>
                            <button @click="scenariosState.isCreating = false" class="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                    
                    <div class="scenarios-list">
                        <div v-for="scenario in scenariosState.scenarios" 
                             :key="scenario.id" 
                             class="scenario-item"
                             @click="selectScenario(scenario)">
                            <div class="scenario-info">
                                <h4>{{ scenario.name }}</h4>
                                <p>{{ scenario.description }}</p>
                                <small>Created by {{ scenario.createdBy }} on {{ scenario.createdAt }}</small>
                            </div>
                            <div class="scenario-type">
                                {{ scenario.deviceType }} - {{ scenario.testType }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    style: `
        .scenarios-modal {
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
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
        }
        
        .modal-container {
            position: relative;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            width: 90%;
            max-width: 700px;
            max-height: 80vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
            background: #f8f9fa;
        }
        
        .modal-body {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }
        
        .scenarios-actions {
            margin-bottom: 20px;
        }
        
        .scenario-form {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 12px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 4px;
            font-weight: 600;
        }
        
        .form-group input, .form-group textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 6px;
        }
        
        .form-actions {
            display: flex;
            gap: 12px;
        }
        
        .scenarios-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .scenario-item {
            padding: 16px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .scenario-item:hover {
            border-color: #007bff;
            background: #f8f9fa;
        }
        
        .scenario-info h4 {
            margin: 0 0 8px 0;
            color: #333;
        }
        
        .scenario-info p {
            margin: 0 0 8px 0;
            color: #666;
            font-size: 0.9em;
        }
        
        .scenario-info small {
            color: #999;
            font-size: 0.8em;
        }
        
        .scenario-type {
            background: #e9ecef;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 0.8em;
            color: #666;
        }
        
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .btn-primary { background: #007bff; color: white; }
        .btn-success { background: #28a745; color: white; }
        .btn-secondary { background: #6c757d; color: white; }
        
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 1.5em;
            cursor: pointer;
            color: #666;
            padding: 4px;
        }
    `
};

window.CustomScenariosComponent = CustomScenariosComponent;
console.log('📈 Vue CustomScenariosComponent loaded');
