/**
 * MASKTRONIC C20 - Vue.js System Standards Template Component
 * Replaces legacy settings-standards.js
 * Advanced standards validation and compliance management with Vue.js reactive framework
 */

const SystemStandardsTemplate = {
    name: 'SystemStandardsTemplate',
    props: {
        user: { type: Object, default: () => ({}) },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['navigate', 'standards-action'],
    
    setup(props, { emit }) {
        const { reactive, computed } = Vue;
        
        const standardsState = reactive({
            isLoading: false,
            showAddForm: false,
            validationInProgress: false
        });

        const standards = reactive([
            {
                id: 1,
                code: 'EN 149:2001+A1:2009',
                name: 'Respiratory protective devices - Filtering half masks',
                category: 'pp_mask',
                status: 'active',
                validationDate: '2025-01-15',
                expiryDate: '2026-01-15',
                compliance: 'compliant',
                requirements: ['Filtration efficiency ≥94%', 'Breathing resistance ≤2.4 mbar', 'CO2 clearance ≤1%']
            },
            {
                id: 2,
                code: 'EN 136:1998',
                name: 'Respiratory protective devices - Full face masks',
                category: 'full_mask',
                status: 'active',
                validationDate: '2025-02-01',
                expiryDate: '2026-02-01',
                compliance: 'compliant',
                requirements: ['Face seal leakage ≤0.05%', 'Inward leakage ≤0.1%', 'Exhalation valve function']
            },
            {
                id: 3,
                code: 'EN 137:2006',
                name: 'Respiratory protective devices - Self-contained open-circuit compressed air breathing apparatus',
                category: 'scba',
                status: 'pending_review',
                validationDate: '2025-03-10',
                expiryDate: '2026-03-10',
                compliance: 'under_review',
                requirements: ['Cylinder pressure test', 'Flow rate validation', 'Alarm system test']
            }
        ]);

        const newStandard = reactive({
            code: '',
            name: '',
            category: 'pp_mask',
            requirements: ''
        });

        const pageTitle = computed(() => 
            props.language === 'pl' ? 'Standardy i Normy' : 'Standards & Norms'
        );

        const standardCategories = computed(() => [
            { value: 'pp_mask', label: props.language === 'pl' ? 'Maska PP' : 'PP Mask' },
            { value: 'full_mask', label: props.language === 'pl' ? 'Maska pełnotwarzowa' : 'Full Face Mask' },
            { value: 'scba', label: 'SCBA' },
            { value: 'general', label: props.language === 'pl' ? 'Ogólne' : 'General' }
        ]);

        const complianceStats = computed(() => {
            const total = standards.length;
            const compliant = standards.filter(s => s.compliance === 'compliant').length;
            const underReview = standards.filter(s => s.compliance === 'under_review').length;
            const expired = standards.filter(s => new Date(s.expiryDate) < new Date()).length;
            
            return { total, compliant, underReview, expired };
        });

        const getComplianceColor = (compliance) => {
            const colors = {
                compliant: '#28a745',
                under_review: '#ffc107',
                non_compliant: '#dc3545',
                expired: '#6c757d'
            };
            return colors[compliance] || '#6c757d';
        };

        const addStandard = () => {
            standardsState.showAddForm = true;
        };

        const saveStandard = () => {
            if (newStandard.code && newStandard.name) {
                const requirements = newStandard.requirements.split('\n').filter(r => r.trim());
                
                standards.push({
                    id: Date.now(),
                    ...newStandard,
                    requirements,
                    status: 'pending_review',
                    validationDate: new Date().toISOString().split('T')[0],
                    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    compliance: 'under_review'
                });
                
                Object.assign(newStandard, {
                    code: '', name: '', category: 'pp_mask', requirements: ''
                });
                
                standardsState.showAddForm = false;
                console.log('✅ Vue: Standard added successfully');
            }
        };

        const validateAllStandards = async () => {
            standardsState.validationInProgress = true;
            
            try {
                // Simulate validation process
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                standards.forEach(standard => {
                    // Simulate validation results
                    if (standard.compliance === 'under_review') {
                        standard.compliance = Math.random() > 0.2 ? 'compliant' : 'non_compliant';
                        standard.validationDate = new Date().toISOString().split('T')[0];
                    }
                });
                
                console.log('✅ Vue: Standards validation completed');
                alert(props.language === 'pl' ? 
                    'Walidacja standardów zakończona pomyślnie!' : 
                    'Standards validation completed successfully!');
            } catch (error) {
                console.error('❌ Vue: Standards validation failed:', error);
                alert(props.language === 'pl' ? 
                    'Błąd walidacji standardów!' : 
                    'Standards validation failed!');
            } finally {
                standardsState.validationInProgress = false;
            }
        };

        const updateCompliance = (standardId, newCompliance) => {
            const standard = standards.find(s => s.id === standardId);
            if (standard) {
                standard.compliance = newCompliance;
                standard.validationDate = new Date().toISOString().split('T')[0];
                console.log('✅ Vue: Compliance status updated');
            }
        };

        const deleteStandard = (standardId) => {
            const index = standards.findIndex(s => s.id === standardId);
            if (index !== -1) {
                standards.splice(index, 1);
                console.log('✅ Vue: Standard deleted');
            }
        };

        const goBack = () => {
            emit('navigate', 'system-settings-template', props.language, 'default');
        };

        return {
            standardsState,
            standards,
            newStandard,
            pageTitle,
            standardCategories,
            complianceStats,
            getComplianceColor,
            addStandard,
            saveStandard,
            validateAllStandards,
            updateCompliance,
            deleteStandard,
            goBack
        };
    },

    template: `
        <div class="standards-container">
            <div class="page-header">
                <h2>{{ pageTitle }}</h2>
                <div class="header-actions">
                    <button @click="addStandard" class="btn btn-primary">
                        ➕ {{ language === 'pl' ? 'Dodaj standard' : 'Add Standard' }}
                    </button>
                    <button @click="validateAllStandards" :disabled="standardsState.validationInProgress" class="btn btn-validate">
                        {{ standardsState.validationInProgress ? '🔄' : '✅' }}
                        {{ language === 'pl' ? 'Waliduj wszystkie' : 'Validate All' }}
                    </button>
                    <button @click="goBack" class="btn btn-secondary">
                        ← {{ language === 'pl' ? 'Powrót' : 'Back' }}
                    </button>
                </div>
            </div>

            <div class="compliance-stats">
                <div class="stat-card total">
                    <h3>{{ language === 'pl' ? 'Łącznie' : 'Total' }}</h3>
                    <span class="stat-number">{{ complianceStats.total }}</span>
                </div>
                <div class="stat-card compliant">
                    <h3>{{ language === 'pl' ? 'Zgodne' : 'Compliant' }}</h3>
                    <span class="stat-number">{{ complianceStats.compliant }}</span>
                </div>
                <div class="stat-card review">
                    <h3>{{ language === 'pl' ? 'W przeglązie' : 'Under Review' }}</h3>
                    <span class="stat-number">{{ complianceStats.underReview }}</span>
                </div>
                <div class="stat-card expired">
                    <h3>{{ language === 'pl' ? 'Wygasłe' : 'Expired' }}</h3>
                    <span class="stat-number">{{ complianceStats.expired }}</span>
                </div>
            </div>

            <div v-if="standardsState.showAddForm" class="add-form">
                <h3>{{ language === 'pl' ? 'Nowy standard' : 'New Standard' }}</h3>
                <div class="form-grid">
                    <input v-model="newStandard.code" :placeholder="language === 'pl' ? 'Kod standardu (np. EN 149:2001)' : 'Standard code (e.g. EN 149:2001)'">
                    <select v-model="newStandard.category">
                        <option v-for="category in standardCategories" :key="category.value" :value="category.value">
                            {{ category.label }}
                        </option>
                    </select>
                    <input v-model="newStandard.name" :placeholder="language === 'pl' ? 'Nazwa standardu' : 'Standard name'" style="grid-column: 1 / -1;">
                    <textarea v-model="newStandard.requirements" :placeholder="language === 'pl' ? 'Wymagania (jedno na linię)' : 'Requirements (one per line)'" rows="4" style="grid-column: 1 / -1;"></textarea>
                </div>
                <div class="form-actions">
                    <button @click="saveStandard" class="btn btn-success">
                        {{ language === 'pl' ? 'Zapisz' : 'Save' }}
                    </button>
                    <button @click="standardsState.showAddForm = false" class="btn btn-cancel">
                        {{ language === 'pl' ? 'Anuluj' : 'Cancel' }}
                    </button>
                </div>
            </div>

            <div class="standards-list">
                <div v-for="standard in standards" :key="standard.id" class="standard-card">
                    <div class="standard-header">
                        <div>
                            <h4>{{ standard.code }}</h4>
                            <p class="standard-name">{{ standard.name }}</p>
                        </div>
                        <div class="compliance-badge" :style="{ backgroundColor: getComplianceColor(standard.compliance) }">
                            {{ standard.compliance.replace('_', ' ') }}
                        </div>
                    </div>
                    
                    <div class="standard-details">
                        <div class="detail-row">
                            <span><strong>{{ language === 'pl' ? 'Kategoria:' : 'Category:' }}</strong> {{ standard.category }}</span>
                            <span><strong>{{ language === 'pl' ? 'Status:' : 'Status:' }}</strong> {{ standard.status }}</span>
                        </div>
                        <div class="detail-row">
                            <span><strong>{{ language === 'pl' ? 'Walidacja:' : 'Validation:' }}</strong> {{ standard.validationDate }}</span>
                            <span><strong>{{ language === 'pl' ? 'Wygasa:' : 'Expires:' }}</strong> {{ standard.expiryDate }}</span>
                        </div>
                        
                        <div class="requirements">
                            <strong>{{ language === 'pl' ? 'Wymagania:' : 'Requirements:' }}</strong>
                            <ul>
                                <li v-for="req in standard.requirements" :key="req">{{ req }}</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="standard-actions">
                        <select @change="updateCompliance(standard.id, $event.target.value)" :value="standard.compliance" class="compliance-select">
                            <option value="compliant">{{ language === 'pl' ? 'Zgodny' : 'Compliant' }}</option>
                            <option value="under_review">{{ language === 'pl' ? 'W przeglązie' : 'Under Review' }}</option>
                            <option value="non_compliant">{{ language === 'pl' ? 'Niezgodny' : 'Non-compliant' }}</option>
                        </select>
                        <button @click="deleteStandard(standard.id)" class="btn btn-danger">
                            🗑️ {{ language === 'pl' ? 'Usuń' : 'Delete' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .standards-container {
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
        .btn-validate { background: #28a745; color: white; }
        
        .compliance-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        
        .stat-card {
            background: white;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-left: 4px solid #007bff;
        }
        
        .stat-card.compliant { border-left-color: #28a745; }
        .stat-card.review { border-left-color: #ffc107; }
        .stat-card.expired { border-left-color: #dc3545; }
        
        .stat-card h3 {
            margin: 0 0 8px 0;
            font-size: 0.9em;
            color: #666;
        }
        
        .stat-number {
            font-size: 1.8em;
            font-weight: 600;
            color: #333;
        }
        
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
        
        .form-grid input, .form-grid select, .form-grid textarea {
            padding: 10px;
            border: 2px solid #e9ecef;
            border-radius: 6px;
        }
        
        .form-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }
        
        .standards-list {
            display: grid;
            gap: 16px;
        }
        
        .standard-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-left: 4px solid #28a745;
        }
        
        .standard-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
        }
        
        .standard-name {
            margin: 4px 0 0 0;
            color: #666;
            font-size: 0.9em;
        }
        
        .compliance-badge {
            padding: 6px 12px;
            border-radius: 12px;
            color: white;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: capitalize;
        }
        
        .standard-details {
            margin-bottom: 16px;
        }
        
        .detail-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 8px;
            font-size: 0.9em;
        }
        
        .requirements {
            margin-top: 12px;
            font-size: 0.9em;
        }
        
        .requirements ul {
            margin: 8px 0;
            padding-left: 20px;
        }
        
        .requirements li {
            margin-bottom: 4px;
            color: #555;
        }
        
        .standard-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            align-items: center;
        }
        
        .compliance-select {
            padding: 6px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9em;
        }
    `
};

window.SystemStandardsTemplate = SystemStandardsTemplate;
console.log('🔶 Vue SystemStandardsTemplate component loaded');
