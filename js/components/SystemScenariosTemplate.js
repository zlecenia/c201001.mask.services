/**
 * MASKTRONIC C20 - Vue.js System Scenarios Template Component
 * Replaces legacy settings-scenarios.js
 * Advanced test scenario management with Vue.js reactive framework
 */

const SystemScenariosTemplate = {
    name: 'SystemScenariosTemplate',
    props: {
        user: { type: Object, default: () => ({}) },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['navigate', 'scenarios-action'],
    
    setup(props, { emit }) {
        const { reactive, computed } = Vue;
        
        const scenariosState = reactive({
            isLoading: false,
            showCreateForm: false,
            editingScenario: null
        });

        const testScenarios = reactive([
            {
                id: 1,
                name: 'FF P3 Standard Test',
                type: 'pp_mask',
                standard: 'EN 149:2001',
                status: 'active',
                parameters: { flow: '95L/min', pressure: '10mbar' },
                createdDate: '2025-09-01'
            },
            {
                id: 2,
                name: 'SCBA Integration Test', 
                type: 'scba',
                standard: 'EN 137:2006',
                status: 'draft',
                parameters: { flow: '120L/min', pressure: '15mbar' },
                createdDate: '2025-09-15'
            }
        ]);

        const newScenario = reactive({
            name: '',
            type: 'pp_mask',
            standard: '',
            parameters: { flow: '', pressure: '' }
        });

        const pageTitle = computed(() => 
            props.language === 'pl' ? 'Scenariusze Testowe' : 'Test Scenarios'
        );

        const scenarioTypes = computed(() => [
            { value: 'pp_mask', label: props.language === 'pl' ? 'Maska PP' : 'PP Mask' },
            { value: 'np_mask', label: props.language === 'pl' ? 'Maska NP' : 'NP Mask' },
            { value: 'scba', label: 'SCBA' }
        ]);

        const createScenario = () => {
            scenariosState.showCreateForm = true;
        };

        const saveScenario = () => {
            if (newScenario.name && newScenario.standard) {
                testScenarios.push({
                    id: Date.now(),
                    ...newScenario,
                    status: 'draft',
                    createdDate: new Date().toISOString().split('T')[0]
                });
                
                Object.assign(newScenario, {
                    name: '', type: 'pp_mask', standard: '', 
                    parameters: { flow: '', pressure: '' }
                });
                
                scenariosState.showCreateForm = false;
                console.log('✅ Vue: Test scenario created');
            }
        };

        const deleteScenario = (scenarioId) => {
            const index = testScenarios.findIndex(s => s.id === scenarioId);
            if (index !== -1) {
                testScenarios.splice(index, 1);
                console.log('✅ Vue: Test scenario deleted');
            }
        };

        const goBack = () => {
            emit('navigate', 'system-settings-template', props.language, 'default');
        };

        return {
            scenariosState,
            testScenarios,
            newScenario,
            pageTitle,
            scenarioTypes,
            createScenario,
            saveScenario,
            deleteScenario,
            goBack
        };
    },

    template: `
        <div class="scenarios-container">
            <div class="page-header">
                <h2>{{ pageTitle }}</h2>
                <div class="header-actions">
                    <button @click="createScenario" class="btn btn-primary">
                        ➕ {{ language === 'pl' ? 'Nowy scenariusz' : 'New Scenario' }}
                    </button>
                    <button @click="goBack" class="btn btn-secondary">
                        ← {{ language === 'pl' ? 'Powrót' : 'Back' }}
                    </button>
                </div>
            </div>

            <div v-if="scenariosState.showCreateForm" class="create-form">
                <h3>{{ language === 'pl' ? 'Nowy scenariusz testowy' : 'New Test Scenario' }}</h3>
                <div class="form-grid">
                    <input v-model="newScenario.name" :placeholder="language === 'pl' ? 'Nazwa scenariusza' : 'Scenario name'">
                    <select v-model="newScenario.type">
                        <option v-for="type in scenarioTypes" :key="type.value" :value="type.value">
                            {{ type.label }}
                        </option>
                    </select>
                    <input v-model="newScenario.standard" :placeholder="language === 'pl' ? 'Standard (np. EN 149:2001)' : 'Standard (e.g. EN 149:2001)'">
                    <input v-model="newScenario.parameters.flow" :placeholder="language === 'pl' ? 'Przepływ (L/min)' : 'Flow (L/min)'">
                    <input v-model="newScenario.parameters.pressure" :placeholder="language === 'pl' ? 'Ciśnienie (mbar)' : 'Pressure (mbar)'">
                </div>
                <div class="form-actions">
                    <button @click="saveScenario" class="btn btn-success">
                        {{ language === 'pl' ? 'Zapisz' : 'Save' }}
                    </button>
                    <button @click="scenariosState.showCreateForm = false" class="btn btn-cancel">
                        {{ language === 'pl' ? 'Anuluj' : 'Cancel' }}
                    </button>
                </div>
            </div>

            <div class="scenarios-list">
                <div v-for="scenario in testScenarios" :key="scenario.id" class="scenario-card">
                    <div class="scenario-header">
                        <h4>{{ scenario.name }}</h4>
                        <span :class="['status-badge', scenario.status]">{{ scenario.status }}</span>
                    </div>
                    <div class="scenario-details">
                        <span><strong>{{ language === 'pl' ? 'Typ:' : 'Type:' }}</strong> {{ scenario.type }}</span>
                        <span><strong>{{ language === 'pl' ? 'Standard:' : 'Standard:' }}</strong> {{ scenario.standard }}</span>
                        <span><strong>{{ language === 'pl' ? 'Przepływ:' : 'Flow:' }}</strong> {{ scenario.parameters.flow }}</span>
                        <span><strong>{{ language === 'pl' ? 'Ciśnienie:' : 'Pressure:' }}</strong> {{ scenario.parameters.pressure }}</span>
                    </div>
                    <div class="scenario-actions">
                        <button @click="deleteScenario(scenario.id)" class="btn btn-danger">
                            🗑️ {{ language === 'pl' ? 'Usuń' : 'Delete' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .scenarios-container {
            padding: 20px;
        }
        
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            border-bottom: 2px solid #4facfe;
            padding-bottom: 12px;
        }
        
        .header-actions {
            display: flex;
            gap: 12px;
        }
        
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .btn-primary { background: #007bff; color: white; }
        .btn-secondary { background: #6c757d; color: white; }
        .btn-success { background: #28a745; color: white; }
        .btn-cancel { background: #dc3545; color: white; }
        .btn-danger { background: #dc3545; color: white; }
        
        .create-form {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin-bottom: 16px;
        }
        
        .form-grid input, .form-grid select {
            padding: 10px;
            border: 2px solid #e9ecef;
            border-radius: 6px;
        }
        
        .form-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }
        
        .scenarios-list {
            display: grid;
            gap: 16px;
        }
        
        .scenario-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-left: 4px solid #007bff;
        }
        
        .scenario-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 600;
        }
        
        .status-badge.active { background: #d4edda; color: #155724; }
        .status-badge.draft { background: #fff3cd; color: #856404; }
        
        .scenario-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-bottom: 16px;
            font-size: 0.9em;
        }
        
        .scenario-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
    `
};

window.SystemScenariosTemplate = SystemScenariosTemplate;
console.log('🔶 Vue SystemScenariosTemplate component loaded');
