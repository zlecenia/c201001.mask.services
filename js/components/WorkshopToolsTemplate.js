/**
 * MASKSERVICE C20 - Vue.js Workshop Tools Template Component
 * Replaces vanilla workshop-tools-template.html
 * Advanced calibration tools management with scheduling and tracking
 */

const { ref, reactive, computed, onMounted } = Vue;

const WorkshopToolsTemplate = {
    name: 'WorkshopToolsTemplate',
    props: {
        user: { type: Object, default: () => ({}) },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['navigate', 'tools-action'],
    
    setup(props, { emit }) {
        const toolsState = reactive({
            viewMode: 'grid',
            showAddTool: false,
            editingTool: null,
            filterStatus: 'all'
        });

        const calibrationTools = reactive([
            {
                id: 1,
                name: 'Pressure Tester',
                model: 'PT-2000',
                category: 'pressure',
                status: 'calibrated',
                lastCalibration: '2025-08-15',
                nextDue: '2025-11-15',
                calibrationInterval: 90,
                accuracy: '±0.1%',
                range: '0-100 kPa',
                location: 'Lab A-01',
                responsible: 'Jan Kowalski'
            },
            {
                id: 2,
                name: 'Flow Meter',
                model: 'FM-500',
                category: 'flow',
                status: 'due',
                lastCalibration: '2025-06-20',
                nextDue: '2025-09-20',
                calibrationInterval: 90,
                accuracy: '±2%',
                range: '0.1-50 L/min',
                location: 'Lab B-02',
                responsible: 'Anna Nowak'
            },
            {
                id: 3,
                name: 'Digital Multimeter',
                model: 'DMM-1000',
                category: 'electrical',
                status: 'overdue',
                lastCalibration: '2025-03-10',
                nextDue: '2025-06-10',
                calibrationInterval: 90,
                accuracy: '±0.05%',
                range: '0-1000V',
                location: 'Electrical Lab',
                responsible: 'Piotr Wiśniewski'
            },
            {
                id: 4,
                name: 'Temperature Probe',
                model: 'TP-300',
                category: 'temperature',
                status: 'calibrated',
                lastCalibration: '2025-09-01',
                nextDue: '2025-12-01',
                calibrationInterval: 90,
                accuracy: '±0.2°C',
                range: '-40 to +150°C',
                location: 'Climate Lab',
                responsible: 'Maria Zielińska'
            }
        ]);

        const newTool = reactive({
            name: '', model: '', category: 'pressure', calibrationInterval: 90,
            accuracy: '', range: '', location: '', responsible: ''
        });

        const pageTitle = computed(() => props.language === 'pl' ? 'Narzędzia Kalibracyjne' : 'Calibration Tools');

        const toolCategories = computed(() => [
            { value: 'pressure', label: props.language === 'pl' ? 'Ciśnienie' : 'Pressure', icon: '⚡' },
            { value: 'flow', label: props.language === 'pl' ? 'Przepływ' : 'Flow', icon: '🌊' },
            { value: 'electrical', label: props.language === 'pl' ? 'Elektryczne' : 'Electrical', icon: '🔌' },
            { value: 'temperature', label: props.language === 'pl' ? 'Temperatura' : 'Temperature', icon: '🌡️' }
        ]);

        const statusOptions = computed(() => [
            { value: 'all', label: props.language === 'pl' ? 'Wszystkie' : 'All' },
            { value: 'calibrated', label: props.language === 'pl' ? 'Skalibrowane' : 'Calibrated' },
            { value: 'due', label: props.language === 'pl' ? 'Do kalibracji' : 'Due' },
            { value: 'overdue', label: props.language === 'pl' ? 'Przeterminowane' : 'Overdue' }
        ]);

        const filteredTools = computed(() => {
            let filtered = [...calibrationTools];
            
            if (toolsState.filterStatus !== 'all') {
                filtered = filtered.filter(tool => tool.status === toolsState.filterStatus);
            }
            
            return filtered.sort((a, b) => {
                const statusPriority = { overdue: 0, due: 1, calibrated: 2 };
                return statusPriority[a.status] - statusPriority[b.status];
            });
        });

        const toolsStats = computed(() => ({
            total: calibrationTools.length,
            calibrated: calibrationTools.filter(t => t.status === 'calibrated').length,
            due: calibrationTools.filter(t => t.status === 'due').length,
            overdue: calibrationTools.filter(t => t.status === 'overdue').length
        }));

        const updateToolStatus = (tool) => {
            const now = new Date();
            const nextDue = new Date(tool.nextDue);
            const daysDiff = Math.ceil((nextDue - now) / (1000 * 60 * 60 * 24));
            
            if (daysDiff < 0) {
                tool.status = 'overdue';
            } else if (daysDiff <= 7) {
                tool.status = 'due';
            } else {
                tool.status = 'calibrated';
            }
        };

        const getStatusColor = (status) => {
            const colors = {
                calibrated: '#4caf50',
                due: '#ff9800',
                overdue: '#f44336'
            };
            return colors[status] || '#666';
        };

        const getDaysUntilDue = (nextDue) => {
            const now = new Date();
            const due = new Date(nextDue);
            const daysDiff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
            return daysDiff;
        };

        const addTool = () => {
            if (!newTool.name || !newTool.model) return;
            
            const now = new Date();
            const nextDue = new Date(now.getTime() + (newTool.calibrationInterval * 24 * 60 * 60 * 1000));
            
            const tool = {
                id: Date.now(),
                ...newTool,
                status: 'calibrated',
                lastCalibration: now.toISOString().split('T')[0],
                nextDue: nextDue.toISOString().split('T')[0]
            };
            
            calibrationTools.push(tool);
            Object.assign(newTool, {
                name: '', model: '', category: 'pressure', calibrationInterval: 90,
                accuracy: '', range: '', location: '', responsible: ''
            });
            toolsState.showAddTool = false;
            
            emit('tools-action', { action: 'added', tool });
        };

        const calibrateTool = (toolId) => {
            const tool = calibrationTools.find(t => t.id === toolId);
            if (tool) {
                const now = new Date();
                const nextDue = new Date(now.getTime() + (tool.calibrationInterval * 24 * 60 * 60 * 1000));
                
                tool.lastCalibration = now.toISOString().split('T')[0];
                tool.nextDue = nextDue.toISOString().split('T')[0];
                tool.status = 'calibrated';
                
                emit('tools-action', { action: 'calibrated', tool });
                console.log(`✅ Vue: Tool calibrated: ${tool.name}`);
            }
        };

        const editTool = (tool) => {
            toolsState.editingTool = { ...tool };
        };

        const saveTool = () => {
            const index = calibrationTools.findIndex(t => t.id === toolsState.editingTool.id);
            if (index !== -1) {
                updateToolStatus(toolsState.editingTool);
                Object.assign(calibrationTools[index], toolsState.editingTool);
                toolsState.editingTool = null;
                emit('tools-action', { action: 'updated', tool: calibrationTools[index] });
            }
        };

        const deleteTool = (toolId) => {
            if (confirm(props.language === 'pl' ? 'Czy na pewno chcesz usunąć to narzędzie?' : 'Are you sure?')) {
                const index = calibrationTools.findIndex(t => t.id === toolId);
                if (index !== -1) {
                    const deleted = calibrationTools.splice(index, 1)[0];
                    emit('tools-action', { action: 'deleted', tool: deleted });
                }
            }
        };

        const goBack = () => {
            console.log('🔶 Vue: Returning to workshop menu');
            emit('navigate', 'workshop-template', props.language, 'default');
        };

        onMounted(() => {
            console.log('🔶 Vue: WorkshopToolsTemplate component mounted');
            
            // Update tool statuses on mount
            calibrationTools.forEach(updateToolStatus);
        });

        return {
            toolsState, calibrationTools, newTool, pageTitle, toolCategories, statusOptions,
            filteredTools, toolsStats, getStatusColor, getDaysUntilDue,
            addTool, calibrateTool, editTool, saveTool, deleteTool, goBack
        };
    },

    template: `
        <div class="workshop-tools-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="header-actions">
                        <button class="view-btn" @click="toolsState.viewMode = toolsState.viewMode === 'grid' ? 'list' : 'grid'">
                            {{ toolsState.viewMode === 'grid' ? '📋' : '🔲' }}
                        </button>
                        <button class="add-btn" @click="toolsState.showAddTool = !toolsState.showAddTool">
                            ➕ {{ language === 'pl' ? 'Dodaj narzędzie' : 'Add Tool' }}
                        </button>
                        <div class="vue-badge">Vue</div>
                    </div>
                </div>

                <!-- Tools Stats -->
                <div class="tools-stats">
                    <div class="stat-card total">
                        <h3>{{ language === 'pl' ? 'Wszystkie' : 'Total' }}</h3>
                        <span class="stat-number">{{ toolsStats.total }}</span>
                    </div>
                    <div class="stat-card calibrated">
                        <h3>{{ language === 'pl' ? 'Skalibrowane' : 'Calibrated' }}</h3>
                        <span class="stat-number">{{ toolsStats.calibrated }}</span>
                    </div>
                    <div class="stat-card due">
                        <h3>{{ language === 'pl' ? 'Do kalibracji' : 'Due' }}</h3>
                        <span class="stat-number">{{ toolsStats.due }}</span>
                    </div>
                    <div class="stat-card overdue">
                        <h3>{{ language === 'pl' ? 'Przeterminowane' : 'Overdue' }}</h3>
                        <span class="stat-number">{{ toolsStats.overdue }}</span>
                    </div>
                </div>

                <!-- Filter -->
                <div class="tools-filter">
                    <select v-model="toolsState.filterStatus" class="filter-select">
                        <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                            {{ status.label }}
                        </option>
                    </select>
                </div>

                <!-- Add Tool Form -->
                <div v-if="toolsState.showAddTool" class="add-tool-form">
                    <h3>{{ language === 'pl' ? 'Nowe narzędzie kalibracyjne' : 'New Calibration Tool' }}</h3>
                    <div class="form-grid">
                        <input v-model="newTool.name" :placeholder="language === 'pl' ? 'Nazwa narzędzia' : 'Tool name'" />
                        <input v-model="newTool.model" :placeholder="language === 'pl' ? 'Model' : 'Model'" />
                        <select v-model="newTool.category">
                            <option v-for="cat in toolCategories" :key="cat.value" :value="cat.value">
                                {{ cat.icon }} {{ cat.label }}
                            </option>
                        </select>
                        <input v-model.number="newTool.calibrationInterval" type="number" :placeholder="language === 'pl' ? 'Interwał (dni)' : 'Interval (days)'" />
                        <input v-model="newTool.accuracy" :placeholder="language === 'pl' ? 'Dokładność' : 'Accuracy'" />
                        <input v-model="newTool.range" :placeholder="language === 'pl' ? 'Zakres' : 'Range'" />
                        <input v-model="newTool.location" :placeholder="language === 'pl' ? 'Lokalizacja' : 'Location'" />
                        <input v-model="newTool.responsible" :placeholder="language === 'pl' ? 'Odpowiedzialny' : 'Responsible'" />
                    </div>
                    <div class="form-actions">
                        <button @click="addTool" class="save-btn">{{ language === 'pl' ? 'Dodaj' : 'Add' }}</button>
                        <button @click="toolsState.showAddTool = false" class="cancel-btn">{{ language === 'pl' ? 'Anuluj' : 'Cancel' }}</button>
                    </div>
                </div>

                <!-- Tools Grid/List -->
                <div :class="'tools-' + toolsState.viewMode">
                    <div 
                        v-for="tool in filteredTools" 
                        :key="tool.id"
                        class="tool-item"
                        :class="'status-' + tool.status"
                    >
                        <div class="tool-header">
                            <h4 class="tool-name">{{ tool.name }}</h4>
                            <div class="tool-category">
                                {{ toolCategories.find(c => c.value === tool.category)?.icon }} 
                                {{ toolCategories.find(c => c.value === tool.category)?.label }}
                            </div>
                        </div>
                        
                        <div class="tool-info">
                            <div class="tool-model">{{ tool.model }}</div>
                            <div class="tool-specs">
                                <span>{{ language === 'pl' ? 'Dokładność:' : 'Accuracy:' }} {{ tool.accuracy }}</span>
                                <span>{{ language === 'pl' ? 'Zakres:' : 'Range:' }} {{ tool.range }}</span>
                                <span>{{ language === 'pl' ? 'Lokalizacja:' : 'Location:' }} {{ tool.location }}</span>
                            </div>
                        </div>
                        
                        <div class="calibration-info">
                            <div class="calibration-dates">
                                <div>{{ language === 'pl' ? 'Ostatnia:' : 'Last:' }} {{ tool.lastCalibration }}</div>
                                <div>{{ language === 'pl' ? 'Następna:' : 'Next:' }} {{ tool.nextDue }}</div>
                                <div class="days-info" :style="{ color: getStatusColor(tool.status) }">
                                    {{ getDaysUntilDue(tool.nextDue) }} {{ language === 'pl' ? 'dni' : 'days' }}
                                </div>
                            </div>
                        </div>
                        
                        <div class="tool-status">
                            <span 
                                class="status-badge" 
                                :style="{ backgroundColor: getStatusColor(tool.status) }"
                            >
                                {{ tool.status === 'calibrated' ? (language === 'pl' ? 'Skalibrowane' : 'Calibrated') :
                                   tool.status === 'due' ? (language === 'pl' ? 'Do kalibracji' : 'Due') :
                                   (language === 'pl' ? 'Przeterminowane' : 'Overdue') }}
                            </span>
                        </div>
                        
                        <div class="tool-actions">
                            <button 
                                v-if="tool.status !== 'calibrated'"
                                @click="calibrateTool(tool.id)" 
                                class="action-btn calibrate" 
                                :title="language === 'pl' ? 'Kalibruj' : 'Calibrate'"
                            >
                                🔧
                            </button>
                            <button @click="editTool(tool)" class="action-btn edit" :title="language === 'pl' ? 'Edytuj' : 'Edit'">✏️</button>
                            <button @click="deleteTool(tool.id)" class="action-btn delete" :title="language === 'pl' ? 'Usuń' : 'Delete'">🗑️</button>
                        </div>
                    </div>
                </div>

                <!-- Edit Tool Modal -->
                <div v-if="toolsState.editingTool" class="modal-overlay" @click="toolsState.editingTool = null">
                    <div class="modal-content" @click.stop>
                        <h3>{{ language === 'pl' ? 'Edytuj narzędzie' : 'Edit Tool' }}</h3>
                        <div class="form-grid">
                            <input v-model="toolsState.editingTool.name" :placeholder="language === 'pl' ? 'Nazwa' : 'Name'" />
                            <input v-model="toolsState.editingTool.model" :placeholder="language === 'pl' ? 'Model' : 'Model'" />
                            <input v-model="toolsState.editingTool.accuracy" :placeholder="language === 'pl' ? 'Dokładność' : 'Accuracy'" />
                            <input v-model="toolsState.editingTool.range" :placeholder="language === 'pl' ? 'Zakres' : 'Range'" />
                        </div>
                        <div class="modal-actions">
                            <button @click="saveTool" class="save-btn">{{ language === 'pl' ? 'Zapisz' : 'Save' }}</button>
                            <button @click="toolsState.editingTool = null" class="cancel-btn">{{ language === 'pl' ? 'Anuluj' : 'Cancel' }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .workshop-tools-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .template-container { max-width: 1400px; margin: 0 auto; }
        
        .template-header {
            display: flex; align-items: center; justify-content: space-between;
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .back-btn, .view-btn, .add-btn { 
            padding: 8px 16px; border: none; border-radius: 6px; 
            cursor: pointer; font-weight: 500; transition: all 0.3s; margin-right: 8px;
        }
        .back-btn { background: #6c757d; color: white; }
        .view-btn { background: #17a2b8; color: white; }
        .add-btn { background: #28a745; color: white; }
        
        .vue-badge { 
            background: #42b883; color: white; padding: 6px 12px; 
            border-radius: 16px; font-size: 0.9em; font-weight: 600; 
        }
        
        .tools-stats {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px; margin-bottom: 24px;
        }
        
        .stat-card {
            background: white; padding: 16px; border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;
            border-left: 4px solid #2196f3;
        }
        
        .stat-card.calibrated { border-left-color: #4caf50; }
        .stat-card.due { border-left-color: #ff9800; }
        .stat-card.overdue { border-left-color: #f44336; }
        
        .stat-card h3 { margin: 0 0 8px 0; font-size: 0.9em; color: #666; }
        .stat-number { font-size: 1.6em; font-weight: 600; color: #333; }
        
        .tools-filter {
            background: white; padding: 16px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .filter-select {
            padding: 8px 12px; border: 2px solid #e9ecef; border-radius: 6px;
        }
        
        .add-tool-form {
            background: white; padding: 24px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .form-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px; margin-bottom: 16px;
        }
        
        .form-grid input, .form-grid select {
            padding: 8px; border: 2px solid #e9ecef; border-radius: 4px;
        }
        
        .form-actions, .modal-actions {
            display: flex; gap: 12px; justify-content: flex-end;
        }
        
        .save-btn { background: #28a745; color: white; }
        .cancel-btn { background: #6c757d; color: white; }
        .save-btn, .cancel-btn {
            padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;
        }
        
        .tools-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;
        }
        
        .tools-list { display: flex; flex-direction: column; gap: 12px; }
        
        .tool-item {
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); position: relative;
        }
        
        .tool-item.status-calibrated { border-left: 4px solid #4caf50; }
        .tool-item.status-due { border-left: 4px solid #ff9800; }
        .tool-item.status-overdue { border-left: 4px solid #f44336; }
        
        .tool-header { margin-bottom: 12px; }
        .tool-name { margin: 0 0 4px 0; color: #333; }
        .tool-category { font-size: 0.9em; color: #666; }
        
        .tool-model { font-weight: 600; margin-bottom: 8px; color: #555; }
        
        .tool-specs { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
        .tool-specs span { font-size: 0.9em; color: #666; }
        
        .calibration-dates { font-size: 0.9em; }
        .calibration-dates div { margin-bottom: 4px; }
        .days-info { font-weight: 600; }
        
        .status-badge {
            color: white; padding: 4px 8px; border-radius: 4px;
            font-size: 0.8em; font-weight: 600;
        }
        
        .tool-actions {
            position: absolute; top: 20px; right: 20px;
            display: flex; gap: 8px;
        }
        
        .action-btn {
            padding: 4px 6px; border: none; border-radius: 4px;
            cursor: pointer; transition: all 0.3s;
        }
        
        .action-btn.calibrate { background: #28a745; color: white; }
        .action-btn.edit { background: #fff3cd; }
        .action-btn.delete { background: #f8d7da; }
        
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
            z-index: 1000;
        }
        
        .modal-content {
            background: white; padding: 24px; border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2); min-width: 400px;
        }
    `
};

window.WorkshopToolsTemplate = WorkshopToolsTemplate;
console.log('🔶 Vue WorkshopToolsTemplate component loaded');
