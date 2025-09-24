/**
 * MASKSERVICE C20 - Vue.js Workshop Maintenance Template Component
 * Replaces vanilla workshop-maintenance-template.html
 * Advanced maintenance scheduling with calendar and task management
 */


const WorkshopMaintenanceTemplate = {
    name: 'WorkshopMaintenanceTemplate',
    props: {
        user: { type: Object, default: () => ({}) },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['navigate', 'maintenance-action'],
    
    setup(props, { emit }) {
        const maintenanceState = reactive({
            currentDate: new Date(),
            selectedDate: null,
            showAddTask: false,
            editingTask: null,
            viewMode: 'calendar'
        });

        const maintenanceTasks = reactive([
            {
                id: 1,
                device: 'PP-MASK-001',
                task: 'Quarterly Check',
                date: '2025-09-25',
                status: 'pending',
                priority: 'medium',
                assignedTo: 'Jan Kowalski',
                estimatedDuration: 120,
                description: 'Pełny przegląd kwartalny urządzenia'
            },
            {
                id: 2,
                device: 'SCBA-007',
                task: 'Filter Replacement',
                date: '2025-09-26',
                status: 'scheduled',
                priority: 'high',
                assignedTo: 'Anna Nowak',
                estimatedDuration: 45,
                description: 'Wymiana filtrów HEPA'
            },
            {
                id: 3,
                device: 'NP-MASK-003',
                task: 'Calibration Check',
                date: '2025-09-24',
                status: 'completed',
                priority: 'low',
                assignedTo: 'Piotr Wiśniewski',
                estimatedDuration: 60,
                description: 'Kontrola kalibracji sensorów'
            },
            {
                id: 4,
                device: 'PP-MASK-002',
                task: 'Valve Inspection',
                date: '2025-09-27',
                status: 'overdue',
                priority: 'critical',
                assignedTo: 'Maria Zielińska',
                estimatedDuration: 90,
                description: 'Inspekcja zaworów bezpieczeństwa'
            }
        ]);

        const newTask = reactive({
            device: '',
            task: '',
            date: '',
            priority: 'medium',
            assignedTo: '',
            estimatedDuration: 60,
            description: ''
        });

        const pageTitle = computed(() => props.language === 'pl' ? 'Harmonogram Konserwacji' : 'Maintenance Schedule');

        const currentMonth = computed(() => {
            const months = props.language === 'pl' ? 
                ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
                 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'] :
                ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'];
            
            return `${months[maintenanceState.currentDate.getMonth()]} ${maintenanceState.currentDate.getFullYear()}`;
        });

        const tasksByDate = computed(() => {
            const grouped = {};
            maintenanceTasks.forEach(task => {
                if (!grouped[task.date]) {
                    grouped[task.date] = [];
                }
                grouped[task.date].push(task);
            });
            return grouped;
        });

        const filteredTasks = computed(() => {
            if (maintenanceState.selectedDate) {
                return maintenanceTasks.filter(task => task.date === maintenanceState.selectedDate);
            }
            return maintenanceTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        });

        const maintenanceStats = computed(() => ({
            total: maintenanceTasks.length,
            pending: maintenanceTasks.filter(t => t.status === 'pending').length,
            scheduled: maintenanceTasks.filter(t => t.status === 'scheduled').length,
            completed: maintenanceTasks.filter(t => t.status === 'completed').length,
            overdue: maintenanceTasks.filter(t => t.status === 'overdue').length
        }));

        const priorityOptions = computed(() => [
            { value: 'low', label: props.language === 'pl' ? 'Niski' : 'Low', color: '#4caf50' },
            { value: 'medium', label: props.language === 'pl' ? 'Średni' : 'Medium', color: '#ff9800' },
            { value: 'high', label: props.language === 'pl' ? 'Wysoki' : 'High', color: '#f44336' },
            { value: 'critical', label: props.language === 'pl' ? 'Krytyczny' : 'Critical', color: '#9c27b0' }
        ]);

        const statusOptions = computed(() => [
            { value: 'pending', label: props.language === 'pl' ? 'Oczekujące' : 'Pending' },
            { value: 'scheduled', label: props.language === 'pl' ? 'Zaplanowane' : 'Scheduled' },
            { value: 'completed', label: props.language === 'pl' ? 'Ukończone' : 'Completed' },
            { value: 'overdue', label: props.language === 'pl' ? 'Przeterminowane' : 'Overdue' }
        ]);

        const previousMonth = () => {
            const newDate = new Date(maintenanceState.currentDate);
            newDate.setMonth(newDate.getMonth() - 1);
            maintenanceState.currentDate = newDate;
        };

        const nextMonth = () => {
            const newDate = new Date(maintenanceState.currentDate);
            newDate.setMonth(newDate.getMonth() + 1);
            maintenanceState.currentDate = newDate;
        };

        const selectDate = (date) => {
            maintenanceState.selectedDate = maintenanceState.selectedDate === date ? null : date;
        };

        const addTask = () => {
            if (!newTask.device || !newTask.task || !newTask.date) return;

            const task = {
                id: Date.now(),
                ...newTask,
                status: 'scheduled'
            };

            maintenanceTasks.push(task);
            Object.assign(newTask, {
                device: '', task: '', date: '', priority: 'medium', 
                assignedTo: '', estimatedDuration: 60, description: ''
            });
            maintenanceState.showAddTask = false;

            emit('maintenance-action', { action: 'added', task });
        };

        const editTask = (task) => {
            maintenanceState.editingTask = { ...task };
        };

        const saveTask = () => {
            const index = maintenanceTasks.findIndex(t => t.id === maintenanceState.editingTask.id);
            if (index !== -1) {
                Object.assign(maintenanceTasks[index], maintenanceState.editingTask);
                maintenanceState.editingTask = null;
                emit('maintenance-action', { action: 'updated', task: maintenanceTasks[index] });
            }
        };

        const updateTaskStatus = (taskId, newStatus) => {
            const task = maintenanceTasks.find(t => t.id === taskId);
            if (task) {
                task.status = newStatus;
                emit('maintenance-action', { action: 'status_updated', task });
            }
        };

        const deleteTask = (taskId) => {
            if (confirm(props.language === 'pl' ? 'Czy na pewno chcesz usunąć to zadanie?' : 'Are you sure?')) {
                const index = maintenanceTasks.findIndex(t => t.id === taskId);
                if (index !== -1) {
                    const deleted = maintenanceTasks.splice(index, 1)[0];
                    emit('maintenance-action', { action: 'deleted', task: deleted });
                }
            }
        };

        const getStatusColor = (status) => {
            const colors = {
                pending: '#ff9800',
                scheduled: '#2196f3',
                completed: '#4caf50',
                overdue: '#f44336'
            };
            return colors[status] || '#666';
        };

        const goBack = () => {
            console.log('🔶 Vue: Returning to workshop menu');
            emit('navigate', 'workshop-template', props.language, 'default');
        };

        onMounted(() => {
            console.log('🔶 Vue: WorkshopMaintenanceTemplate component mounted');
            
            // Set default date range
            const today = new Date();
            newTask.date = today.toISOString().split('T')[0];
        });

        return {
            maintenanceState, maintenanceTasks, newTask, pageTitle, currentMonth,
            tasksByDate, filteredTasks, maintenanceStats, priorityOptions, statusOptions,
            previousMonth, nextMonth, selectDate, addTask, editTask, saveTask,
            updateTaskStatus, deleteTask, getStatusColor, goBack
        };
    },

    template: `
        <div class="workshop-maintenance-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="header-actions">
                        <button class="view-btn" @click="maintenanceState.viewMode = maintenanceState.viewMode === 'calendar' ? 'list' : 'calendar'">
                            {{ maintenanceState.viewMode === 'calendar' ? '📋' : '📅' }}
                        </button>
                        <button class="add-btn" @click="maintenanceState.showAddTask = !maintenanceState.showAddTask">
                            ➕ {{ language === 'pl' ? 'Dodaj zadanie' : 'Add Task' }}
                        </button>
                        <div class="vue-badge">Vue</div>
                    </div>
                </div>

                <!-- Maintenance Stats -->
                <div class="maintenance-stats">
                    <div class="stat-card total">
                        <h3>{{ language === 'pl' ? 'Wszystkie' : 'Total' }}</h3>
                        <span class="stat-number">{{ maintenanceStats.total }}</span>
                    </div>
                    <div class="stat-card pending">
                        <h3>{{ language === 'pl' ? 'Oczekujące' : 'Pending' }}</h3>
                        <span class="stat-number">{{ maintenanceStats.pending }}</span>
                    </div>
                    <div class="stat-card scheduled">
                        <h3>{{ language === 'pl' ? 'Zaplanowane' : 'Scheduled' }}</h3>
                        <span class="stat-number">{{ maintenanceStats.scheduled }}</span>
                    </div>
                    <div class="stat-card completed">
                        <h3>{{ language === 'pl' ? 'Ukończone' : 'Completed' }}</h3>
                        <span class="stat-number">{{ maintenanceStats.completed }}</span>
                    </div>
                    <div class="stat-card overdue">
                        <h3>{{ language === 'pl' ? 'Przeterminowane' : 'Overdue' }}</h3>
                        <span class="stat-number">{{ maintenanceStats.overdue }}</span>
                    </div>
                </div>

                <!-- Calendar Navigation -->
                <div v-if="maintenanceState.viewMode === 'calendar'" class="calendar-section">
                    <div class="calendar-header">
                        <button class="nav-btn" @click="previousMonth">‹</button>
                        <h3 class="calendar-title">{{ currentMonth }}</h3>
                        <button class="nav-btn" @click="nextMonth">›</button>
                    </div>
                </div>

                <!-- Add Task Form -->
                <div v-if="maintenanceState.showAddTask" class="add-task-form">
                    <h3>{{ language === 'pl' ? 'Nowe zadanie konserwacji' : 'New Maintenance Task' }}</h3>
                    <div class="form-grid">
                        <input v-model="newTask.device" :placeholder="language === 'pl' ? 'Urządzenie' : 'Device'" />
                        <input v-model="newTask.task" :placeholder="language === 'pl' ? 'Zadanie' : 'Task'" />
                        <input v-model="newTask.date" type="date" />
                        <select v-model="newTask.priority">
                            <option v-for="priority in priorityOptions" :key="priority.value" :value="priority.value">
                                {{ priority.label }}
                            </option>
                        </select>
                        <input v-model="newTask.assignedTo" :placeholder="language === 'pl' ? 'Przydzielony do' : 'Assigned To'" />
                        <input v-model.number="newTask.estimatedDuration" type="number" :placeholder="language === 'pl' ? 'Czas (min)' : 'Duration (min)'" />
                    </div>
                    <textarea v-model="newTask.description" :placeholder="language === 'pl' ? 'Opis zadania' : 'Task description'" rows="3"></textarea>
                    <div class="form-actions">
                        <button @click="addTask" class="save-btn">{{ language === 'pl' ? 'Dodaj' : 'Add' }}</button>
                        <button @click="maintenanceState.showAddTask = false" class="cancel-btn">{{ language === 'pl' ? 'Anuluj' : 'Cancel' }}</button>
                    </div>
                </div>

                <!-- Task List -->
                <div class="tasks-section">
                    <div v-if="maintenanceState.selectedDate" class="date-filter">
                        <span>{{ language === 'pl' ? 'Zadania na dzień:' : 'Tasks for:' }} {{ maintenanceState.selectedDate }}</span>
                        <button @click="maintenanceState.selectedDate = null" class="clear-filter">✕</button>
                    </div>
                    
                    <div class="tasks-list">
                        <div 
                            v-for="task in filteredTasks" 
                            :key="task.id"
                            class="task-item"
                            :class="'status-' + task.status"
                        >
                            <div class="task-main">
                                <div class="task-info">
                                    <h4 class="task-title">{{ task.device }} - {{ task.task }}</h4>
                                    <div class="task-details">
                                        <span class="task-date">📅 {{ task.date }}</span>
                                        <span class="task-assigned">👤 {{ task.assignedTo }}</span>
                                        <span class="task-duration">⏱️ {{ task.estimatedDuration }}min</span>
                                    </div>
                                    <p class="task-description">{{ task.description }}</p>
                                </div>
                                
                                <div class="task-priority" :style="{ color: priorityOptions.find(p => p.value === task.priority)?.color }">
                                    {{ priorityOptions.find(p => p.value === task.priority)?.label }}
                                </div>
                            </div>
                            
                            <div class="task-status">
                                <select 
                                    :value="task.status" 
                                    @change="updateTaskStatus(task.id, $event.target.value)"
                                    class="status-select"
                                    :style="{ color: getStatusColor(task.status) }"
                                >
                                    <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                                        {{ status.label }}
                                    </option>
                                </select>
                            </div>
                            
                            <div class="task-actions">
                                <button @click="editTask(task)" class="action-btn edit" :title="language === 'pl' ? 'Edytuj' : 'Edit'">✏️</button>
                                <button @click="selectDate(task.date)" class="action-btn calendar" :title="language === 'pl' ? 'Pokaż datę' : 'Show Date'">📅</button>
                                <button @click="deleteTask(task.id)" class="action-btn delete" :title="language === 'pl' ? 'Usuń' : 'Delete'">🗑️</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Edit Task Modal -->
                <div v-if="maintenanceState.editingTask" class="modal-overlay" @click="maintenanceState.editingTask = null">
                    <div class="modal-content" @click.stop>
                        <h3>{{ language === 'pl' ? 'Edytuj zadanie' : 'Edit Task' }}</h3>
                        <div class="form-grid">
                            <input v-model="maintenanceState.editingTask.device" :placeholder="language === 'pl' ? 'Urządzenie' : 'Device'" />
                            <input v-model="maintenanceState.editingTask.task" :placeholder="language === 'pl' ? 'Zadanie' : 'Task'" />
                            <input v-model="maintenanceState.editingTask.date" type="date" />
                            <select v-model="maintenanceState.editingTask.priority">
                                <option v-for="priority in priorityOptions" :key="priority.value" :value="priority.value">
                                    {{ priority.label }}
                                </option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button @click="saveTask" class="save-btn">{{ language === 'pl' ? 'Zapisz' : 'Save' }}</button>
                            <button @click="maintenanceState.editingTask = null" class="cancel-btn">{{ language === 'pl' ? 'Anuluj' : 'Cancel' }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .workshop-maintenance-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%);
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
        
        .maintenance-stats {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px; margin-bottom: 24px;
        }
        
        .stat-card {
            background: white; padding: 16px; border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;
            border-left: 4px solid #2196f3;
        }
        
        .stat-card.pending { border-left-color: #ff9800; }
        .stat-card.scheduled { border-left-color: #2196f3; }
        .stat-card.completed { border-left-color: #4caf50; }
        .stat-card.overdue { border-left-color: #f44336; }
        
        .stat-card h3 { margin: 0 0 8px 0; font-size: 0.9em; color: #666; }
        .stat-number { font-size: 1.8em; font-weight: 600; color: #333; }
        
        .calendar-section {
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .calendar-header {
            display: flex; align-items: center; justify-content: space-between;
        }
        
        .nav-btn {
            padding: 8px 12px; background: #f8f9fa; border: 1px solid #ddd;
            border-radius: 4px; cursor: pointer; font-size: 1.2em;
        }
        
        .calendar-title { margin: 0; color: #333; }
        
        .add-task-form {
            background: white; padding: 24px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .form-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px; margin-bottom: 16px;
        }
        
        .form-grid input, .form-grid select, textarea {
            padding: 8px; border: 2px solid #e9ecef; border-radius: 4px;
        }
        
        textarea { grid-column: 1 / -1; margin-bottom: 16px; }
        
        .form-actions, .modal-actions {
            display: flex; gap: 12px; justify-content: flex-end;
        }
        
        .save-btn { background: #28a745; color: white; }
        .cancel-btn { background: #6c757d; color: white; }
        .save-btn, .cancel-btn {
            padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;
        }
        
        .tasks-section {
            background: white; padding: 24px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .date-filter {
            display: flex; align-items: center; justify-content: space-between;
            padding: 12px; background: #e3f2fd; border-radius: 6px; margin-bottom: 16px;
        }
        
        .clear-filter { background: none; border: none; cursor: pointer; font-size: 1.2em; }
        
        .tasks-list { display: flex; flex-direction: column; gap: 12px; }
        
        .task-item {
            display: flex; align-items: center; gap: 16px; padding: 16px;
            border-radius: 8px; background: #f8f9fa; position: relative;
        }
        
        .task-item.status-pending { border-left: 4px solid #ff9800; }
        .task-item.status-scheduled { border-left: 4px solid #2196f3; }
        .task-item.status-completed { border-left: 4px solid #4caf50; }
        .task-item.status-overdue { border-left: 4px solid #f44336; background: #ffeaea; }
        
        .task-main { flex: 1; }
        .task-title { margin: 0 0 8px 0; color: #333; }
        .task-details { display: flex; gap: 16px; margin-bottom: 8px; }
        .task-details span { font-size: 0.9em; color: #666; }
        .task-description { margin: 0; color: #666; font-size: 0.9em; }
        
        .task-priority { font-weight: 600; padding: 4px 8px; border-radius: 4px; }
        
        .status-select {
            padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px;
            font-weight: 600;
        }
        
        .task-actions {
            display: flex; gap: 8px;
        }
        
        .action-btn {
            padding: 4px 6px; border: none; border-radius: 4px;
            cursor: pointer; transition: all 0.3s;
        }
        
        .action-btn.edit { background: #fff3cd; }
        .action-btn.calendar { background: #e3f2fd; }
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

window.WorkshopMaintenanceTemplate = WorkshopMaintenanceTemplate;
console.log('🔶 Vue WorkshopMaintenanceTemplate component loaded');
