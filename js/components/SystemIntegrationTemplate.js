/**
 * MASKTRONIC C20 - Vue.js System Integration Template Component
 * Replaces legacy settings-integration.js
 * Advanced external integration management with Vue.js reactive framework
 */

const SystemIntegrationTemplate = {
    name: 'SystemIntegrationTemplate',
    props: {
        user: { type: Object, default: () => ({}) },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['navigate', 'integration-action'],
    
    setup(props, { emit }) {
        const { reactive, computed } = Vue;
        
        const integrationState = reactive({
            isLoading: false,
            showAddForm: false,
            testingConnection: null
        });

        const integrations = reactive([
            {
                id: 1,
                name: 'SAP ERP Integration',
                type: 'erp',
                url: 'https://sap.company.com/api',
                status: 'connected',
                lastSync: '2025-09-24T10:30:00Z',
                apiKey: '****-****-****-1234'
            },
            {
                id: 2,
                name: 'Laboratory Database',
                type: 'database', 
                url: 'jdbc:postgresql://lab-db:5432/maskservice',
                status: 'error',
                lastSync: '2025-09-23T15:45:00Z',
                apiKey: '****-****-****-5678'
            },
            {
                id: 3,
                name: 'Quality Management System',
                type: 'qms',
                url: 'https://qms.company.com/webhook',
                status: 'disconnected',
                lastSync: null,
                apiKey: '****-****-****-9012'
            }
        ]);

        const newIntegration = reactive({
            name: '',
            type: 'api',
            url: '',
            apiKey: ''
        });

        const pageTitle = computed(() => 
            props.language === 'pl' ? 'Integracje Zewnętrzne' : 'External Integrations'
        );

        const integrationTypes = computed(() => [
            { value: 'api', label: 'REST API' },
            { value: 'database', label: props.language === 'pl' ? 'Baza danych' : 'Database' },
            { value: 'erp', label: 'ERP System' },
            { value: 'qms', label: 'QMS System' },
            { value: 'webhook', label: 'Webhook' }
        ]);

        const getStatusColor = (status) => {
            const colors = {
                connected: '#28a745',
                error: '#dc3545', 
                disconnected: '#6c757d'
            };
            return colors[status] || '#6c757d';
        };

        const addIntegration = () => {
            integrationState.showAddForm = true;
        };

        const saveIntegration = () => {
            if (newIntegration.name && newIntegration.url) {
                integrations.push({
                    id: Date.now(),
                    ...newIntegration,
                    status: 'disconnected',
                    lastSync: null,
                    apiKey: newIntegration.apiKey ? '****-****-****-' + newIntegration.apiKey.slice(-4) : ''
                });
                
                Object.assign(newIntegration, {
                    name: '', type: 'api', url: '', apiKey: ''
                });
                
                integrationState.showAddForm = false;
                console.log('✅ Vue: Integration added successfully');
            }
        };

        const testConnection = async (integrationId) => {
            integrationState.testingConnection = integrationId;
            
            try {
                // Simulate connection test
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const integration = integrations.find(i => i.id === integrationId);
                if (integration) {
                    integration.status = Math.random() > 0.3 ? 'connected' : 'error';
                    integration.lastSync = new Date().toISOString();
                }
                
                console.log('✅ Vue: Connection test completed');
            } catch (error) {
                console.error('❌ Vue: Connection test failed:', error);
            } finally {
                integrationState.testingConnection = null;
            }
        };

        const syncData = async () => {
            integrationState.isLoading = true;
            
            try {
                // Simulate data sync
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                integrations.forEach(integration => {
                    if (integration.status === 'connected') {
                        integration.lastSync = new Date().toISOString();
                    }
                });
                
                console.log('✅ Vue: Data synchronization completed');
                alert(props.language === 'pl' ? 
                    'Synchronizacja danych zakończona pomyślnie!' : 
                    'Data synchronization completed successfully!');
            } catch (error) {
                console.error('❌ Vue: Data sync failed:', error);
                alert(props.language === 'pl' ? 
                    'Błąd synchronizacji danych!' : 
                    'Data synchronization failed!');
            } finally {
                integrationState.isLoading = false;
            }
        };

        const deleteIntegration = (integrationId) => {
            const index = integrations.findIndex(i => i.id === integrationId);
            if (index !== -1) {
                integrations.splice(index, 1);
                console.log('✅ Vue: Integration deleted');
            }
        };

        const goBack = () => {
            emit('navigate', 'system-settings-template', props.language, 'default');
        };

        return {
            integrationState,
            integrations,
            newIntegration,
            pageTitle,
            integrationTypes,
            getStatusColor,
            addIntegration,
            saveIntegration,
            testConnection,
            syncData,
            deleteIntegration,
            goBack
        };
    },

    template: `
        <div class="integration-container">
            <div class="page-header">
                <h2>{{ pageTitle }}</h2>
                <div class="header-actions">
                    <button @click="addIntegration" class="btn btn-primary">
                        ➕ {{ language === 'pl' ? 'Dodaj integrację' : 'Add Integration' }}
                    </button>
                    <button @click="syncData" :disabled="integrationState.isLoading" class="btn btn-sync">
                        🔄 {{ language === 'pl' ? 'Synchronizuj wszystkie' : 'Sync All' }}
                    </button>
                    <button @click="goBack" class="btn btn-secondary">
                        ← {{ language === 'pl' ? 'Powrót' : 'Back' }}
                    </button>
                </div>
            </div>

            <div v-if="integrationState.showAddForm" class="add-form">
                <h3>{{ language === 'pl' ? 'Nowa integracja' : 'New Integration' }}</h3>
                <div class="form-grid">
                    <input v-model="newIntegration.name" :placeholder="language === 'pl' ? 'Nazwa integracji' : 'Integration name'">
                    <select v-model="newIntegration.type">
                        <option v-for="type in integrationTypes" :key="type.value" :value="type.value">
                            {{ type.label }}
                        </option>
                    </select>
                    <input v-model="newIntegration.url" :placeholder="language === 'pl' ? 'URL/Connection string' : 'URL/Connection string'">
                    <input v-model="newIntegration.apiKey" type="password" :placeholder="language === 'pl' ? 'Klucz API (opcjonalny)' : 'API Key (optional)'">
                </div>
                <div class="form-actions">
                    <button @click="saveIntegration" class="btn btn-success">
                        {{ language === 'pl' ? 'Zapisz' : 'Save' }}
                    </button>
                    <button @click="integrationState.showAddForm = false" class="btn btn-cancel">
                        {{ language === 'pl' ? 'Anuluj' : 'Cancel' }}
                    </button>
                </div>
            </div>

            <div class="integrations-list">
                <div v-for="integration in integrations" :key="integration.id" class="integration-card">
                    <div class="integration-header">
                        <h4>{{ integration.name }}</h4>
                        <div class="status-indicator" :style="{ backgroundColor: getStatusColor(integration.status) }">
                            {{ integration.status }}
                        </div>
                    </div>
                    
                    <div class="integration-details">
                        <div class="detail-row">
                            <span><strong>{{ language === 'pl' ? 'Typ:' : 'Type:' }}</strong> {{ integration.type.toUpperCase() }}</span>
                            <span><strong>URL:</strong> {{ integration.url }}</span>
                        </div>
                        <div class="detail-row">
                            <span><strong>{{ language === 'pl' ? 'Klucz API:' : 'API Key:' }}</strong> {{ integration.apiKey || 'N/A' }}</span>
                            <span><strong>{{ language === 'pl' ? 'Ostatnia sync:' : 'Last sync:' }}</strong> 
                                {{ integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never' }}
                            </span>
                        </div>
                    </div>
                    
                    <div class="integration-actions">
                        <button 
                            @click="testConnection(integration.id)" 
                            :disabled="integrationState.testingConnection === integration.id"
                            class="btn btn-test"
                        >
                            {{ integrationState.testingConnection === integration.id ? '🔄' : '🔍' }}
                            {{ language === 'pl' ? 'Test' : 'Test' }}
                        </button>
                        <button @click="deleteIntegration(integration.id)" class="btn btn-danger">
                            🗑️ {{ language === 'pl' ? 'Usuń' : 'Delete' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .integration-container {
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
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .btn-primary { background: #007bff; color: white; }
        .btn-secondary { background: #6c757d; color: white; }
        .btn-success { background: #28a745; color: white; }
        .btn-cancel { background: #dc3545; color: white; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-sync { background: #17a2b8; color: white; }
        .btn-test { background: #ffc107; color: #212529; }
        
        .add-form {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
        
        .integrations-list {
            display: grid;
            gap: 16px;
        }
        
        .integration-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-left: 4px solid #17a2b8;
        }
        
        .integration-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        
        .status-indicator {
            padding: 4px 12px;
            border-radius: 12px;
            color: white;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .integration-details {
            margin-bottom: 16px;
        }
        
        .detail-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 8px;
            font-size: 0.9em;
        }
        
        .integration-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
    `
};

window.SystemIntegrationTemplate = SystemIntegrationTemplate;
console.log('🔶 Vue SystemIntegrationTemplate component loaded');
