/**
 * MASKTRONIC C20 - Vue.js Reports Schedule Template Component
 * Replaces vanilla reports-schedule-template.html
 * Advanced report scheduling with CRON expressions and automation
 */


const ReportsScheduleTemplate = {
    name: 'ReportsScheduleTemplate',
    props: {
        user: { type: Object, default: () => ({}) },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['navigate', 'schedule-action'],
    
    setup(props, { emit }) {
        const scheduleState = reactive({
            showAddSchedule: false,
            editingSchedule: null,
            isLoading: false
        });

        const schedules = reactive([
            {
                id: 1,
                name: 'Daily Test Summary',
                description: 'Codzienny raport podsumowujący testy',
                frequency: 'daily',
                time: '18:00',
                format: 'pdf',
                recipients: ['admin@maskservice.com'],
                active: true,
                lastRun: '2025-09-23T18:00:00Z',
                nextRun: '2025-09-24T18:00:00Z',
                cron: '0 18 * * *'
            },
            {
                id: 2,
                name: 'Weekly Performance Report',
                description: 'Tygodniowy raport wydajności',
                frequency: 'weekly',
                time: '09:00',
                format: 'excel',
                recipients: ['manager@maskservice.com'],
                active: true,
                lastRun: '2025-09-16T09:00:00Z',
                nextRun: '2025-09-30T09:00:00Z',
                cron: '0 9 * * 1'
            },
            {
                id: 3,
                name: 'Monthly Device Status',
                description: 'Miesięczny status urządzeń',
                frequency: 'monthly',
                time: '08:00',
                format: 'json',
                recipients: ['tech@maskservice.com'],
                active: false,
                lastRun: '2025-08-01T08:00:00Z',
                nextRun: '2025-10-01T08:00:00Z',
                cron: '0 8 1 * *'
            }
        ]);

        const newSchedule = reactive({
            name: '',
            description: '',
            frequency: 'daily',
            time: '09:00',
            format: 'pdf',
            recipients: [''],
            active: true
        });

        const pageTitle = computed(() => props.language === 'pl' ? 'Harmonogram Raportów' : 'Reports Schedule');

        const frequencyOptions = computed(() => [
            { value: 'hourly', label: props.language === 'pl' ? 'Co godzinę' : 'Hourly' },
            { value: 'daily', label: props.language === 'pl' ? 'Codziennie' : 'Daily' },
            { value: 'weekly', label: props.language === 'pl' ? 'Tygodniowo' : 'Weekly' },
            { value: 'monthly', label: props.language === 'pl' ? 'Miesięcznie' : 'Monthly' },
            { value: 'quarterly', label: props.language === 'pl' ? 'Kwartalnie' : 'Quarterly' }
        ]);

        const formatOptions = computed(() => [
            { value: 'pdf', label: 'PDF', icon: '📄' },
            { value: 'excel', label: 'Excel', icon: '📊' },
            { value: 'csv', label: 'CSV', icon: '📋' },
            { value: 'json', label: 'JSON', icon: '🗂️' }
        ]);

        const generateCron = (frequency, time) => {
            const [hour, minute] = time.split(':');
            const cronExpressions = {
                hourly: `0 ${minute} * * *`,
                daily: `${minute} ${hour} * * *`,
                weekly: `${minute} ${hour} * * 1`,
                monthly: `${minute} ${hour} 1 * *`,
                quarterly: `${minute} ${hour} 1 */3 *`
            };
            return cronExpressions[frequency] || '0 9 * * *';
        };

        const addSchedule = () => {
            if (!newSchedule.name.trim()) return;

            const schedule = {
                id: Date.now(),
                ...newSchedule,
                recipients: newSchedule.recipients.filter(email => email.trim()),
                cron: generateCron(newSchedule.frequency, newSchedule.time),
                lastRun: null,
                nextRun: calculateNextRun(newSchedule.frequency, newSchedule.time)
            };

            schedules.push(schedule);
            resetNewSchedule();
            scheduleState.showAddSchedule = false;
            
            emit('schedule-action', { action: 'added', schedule });
            console.log(`✅ Vue: Schedule added: ${schedule.name}`);
        };

        const editSchedule = (schedule) => {
            scheduleState.editingSchedule = { ...schedule };
        };

        const saveSchedule = () => {
            const index = schedules.findIndex(s => s.id === scheduleState.editingSchedule.id);
            if (index !== -1) {
                const updated = {
                    ...scheduleState.editingSchedule,
                    cron: generateCron(scheduleState.editingSchedule.frequency, scheduleState.editingSchedule.time),
                    nextRun: calculateNextRun(scheduleState.editingSchedule.frequency, scheduleState.editingSchedule.time)
                };
                
                Object.assign(schedules[index], updated);
                scheduleState.editingSchedule = null;
                
                emit('schedule-action', { action: 'updated', schedule: updated });
                console.log(`✅ Vue: Schedule updated: ${updated.name}`);
            }
        };

        const toggleSchedule = (scheduleId) => {
            const schedule = schedules.find(s => s.id === scheduleId);
            if (schedule) {
                schedule.active = !schedule.active;
                emit('schedule-action', { action: 'toggled', schedule });
                console.log(`🔶 Vue: Schedule ${schedule.active ? 'enabled' : 'disabled'}: ${schedule.name}`);
            }
        };

        const deleteSchedule = (scheduleId) => {
            if (confirm(props.language === 'pl' ? 'Czy na pewno chcesz usunąć ten harmonogram?' : 'Are you sure you want to delete this schedule?')) {
                const index = schedules.findIndex(s => s.id === scheduleId);
                if (index !== -1) {
                    const deleted = schedules.splice(index, 1)[0];
                    emit('schedule-action', { action: 'deleted', schedule: deleted });
                    console.log(`🔶 Vue: Schedule deleted: ${deleted.name}`);
                }
            }
        };

        const runScheduleNow = async (scheduleId) => {
            const schedule = schedules.find(s => s.id === scheduleId);
            if (schedule) {
                scheduleState.isLoading = true;
                
                try {
                    // Simulate report generation
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    schedule.lastRun = new Date().toISOString();
                    schedule.nextRun = calculateNextRun(schedule.frequency, schedule.time);
                    
                    emit('schedule-action', { action: 'executed', schedule });
                    console.log(`✅ Vue: Schedule executed: ${schedule.name}`);
                    
                    alert(`${props.language === 'pl' ? 'Raport wygenerowany' : 'Report generated'}: ${schedule.name}`);
                    
                } catch (error) {
                    console.error(`❌ Vue: Schedule execution failed: ${schedule.name}`, error);
                    alert(`${props.language === 'pl' ? 'Błąd generowania raportu' : 'Report generation failed'}`);
                } finally {
                    scheduleState.isLoading = false;
                }
            }
        };

        const calculateNextRun = (frequency, time) => {
            const now = new Date();
            const [hour, minute] = time.split(':').map(Number);
            
            const next = new Date(now);
            next.setHours(hour, minute, 0, 0);
            
            switch (frequency) {
                case 'hourly':
                    if (next <= now) next.setHours(next.getHours() + 1);
                    break;
                case 'daily':
                    if (next <= now) next.setDate(next.getDate() + 1);
                    break;
                case 'weekly':
                    next.setDate(next.getDate() + (8 - next.getDay()) % 7);
                    if (next <= now) next.setDate(next.getDate() + 7);
                    break;
                case 'monthly':
                    next.setDate(1);
                    next.setMonth(next.getMonth() + 1);
                    break;
            }
            
            return next.toISOString();
        };

        const resetNewSchedule = () => {
            Object.assign(newSchedule, {
                name: '', description: '', frequency: 'daily', time: '09:00',
                format: 'pdf', recipients: [''], active: true
            });
        };

        const addRecipient = () => {
            newSchedule.recipients.push('');
        };

        const removeRecipient = (index) => {
            newSchedule.recipients.splice(index, 1);
        };

        const goBack = () => {
            console.log('🔶 Vue: Returning to reports menu');
            emit('navigate', 'reports-view-template', props.language, 'default');
        };

        onMounted(() => {
            console.log('🔶 Vue: ReportsScheduleTemplate component mounted');
        });

        return {
            scheduleState, schedules, newSchedule, pageTitle, frequencyOptions, formatOptions,
            addSchedule, editSchedule, saveSchedule, toggleSchedule, deleteSchedule,
            runScheduleNow, addRecipient, removeRecipient, goBack
        };
    },

    template: `
        <div class="reports-schedule-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="header-actions">
                        <button class="add-btn" @click="scheduleState.showAddSchedule = !scheduleState.showAddSchedule">
                            ➕ {{ language === 'pl' ? 'Nowy harmonogram' : 'New Schedule' }}
                        </button>
                        <div class="vue-badge">Vue</div>
                    </div>
                </div>

                <!-- Add Schedule Form -->
                <div v-if="scheduleState.showAddSchedule" class="add-schedule-form">
                    <h3>{{ language === 'pl' ? 'Nowy harmonogram raportów' : 'New Report Schedule' }}</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>{{ language === 'pl' ? 'Nazwa' : 'Name' }}:</label>
                            <input v-model="newSchedule.name" type="text" :placeholder="language === 'pl' ? 'Nazwa harmonogramu' : 'Schedule name'" />
                        </div>
                        <div class="form-group">
                            <label>{{ language === 'pl' ? 'Opis' : 'Description' }}:</label>
                            <input v-model="newSchedule.description" type="text" :placeholder="language === 'pl' ? 'Opis raportu' : 'Report description'" />
                        </div>
                        <div class="form-group">
                            <label>{{ language === 'pl' ? 'Częstotliwość' : 'Frequency' }}:</label>
                            <select v-model="newSchedule.frequency">
                                <option v-for="freq in frequencyOptions" :key="freq.value" :value="freq.value">
                                    {{ freq.label }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>{{ language === 'pl' ? 'Godzina' : 'Time' }}:</label>
                            <input v-model="newSchedule.time" type="time" />
                        </div>
                        <div class="form-group">
                            <label>{{ language === 'pl' ? 'Format' : 'Format' }}:</label>
                            <select v-model="newSchedule.format">
                                <option v-for="format in formatOptions" :key="format.value" :value="format.value">
                                    {{ format.icon }} {{ format.label }}
                                </option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="recipients-section">
                        <label>{{ language === 'pl' ? 'Odbiorcy email' : 'Email Recipients' }}:</label>
                        <div v-for="(recipient, index) in newSchedule.recipients" :key="index" class="recipient-row">
                            <input v-model="newSchedule.recipients[index]" type="email" :placeholder="language === 'pl' ? 'adres@email.com' : 'email@address.com'" />
                            <button v-if="newSchedule.recipients.length > 1" @click="removeRecipient(index)" class="remove-btn">🗑️</button>
                        </div>
                        <button @click="addRecipient" class="add-recipient-btn">➕ {{ language === 'pl' ? 'Dodaj odbiorcę' : 'Add Recipient' }}</button>
                    </div>
                    
                    <div class="form-actions">
                        <button @click="addSchedule" class="save-btn">{{ language === 'pl' ? 'Zapisz harmonogram' : 'Save Schedule' }}</button>
                        <button @click="scheduleState.showAddSchedule = false" class="cancel-btn">{{ language === 'pl' ? 'Anuluj' : 'Cancel' }}</button>
                    </div>
                </div>

                <!-- Schedule List -->
                <div class="schedule-list">
                    <div v-for="schedule in schedules" :key="schedule.id" class="schedule-item" :class="{ inactive: !schedule.active }">
                        <div class="schedule-main">
                            <div class="schedule-info">
                                <h3 class="schedule-name">{{ schedule.name }}</h3>
                                <p class="schedule-description">{{ schedule.description }}</p>
                                <div class="schedule-details">
                                    <span class="frequency">{{ schedule.frequency }}</span>
                                    <span class="time">{{ schedule.time }}</span>
                                    <span class="format">{{ schedule.format.toUpperCase() }}</span>
                                </div>
                            </div>
                            
                            <div class="schedule-status">
                                <div class="status-badge" :class="{ active: schedule.active, inactive: !schedule.active }">
                                    {{ schedule.active ? (language === 'pl' ? 'Aktywny' : 'Active') : (language === 'pl' ? 'Nieaktywny' : 'Inactive') }}
                                </div>
                                <div class="next-run">
                                    {{ language === 'pl' ? 'Następne:' : 'Next:' }} {{ new Date(schedule.nextRun).toLocaleString() }}
                                </div>
                                <div v-if="schedule.lastRun" class="last-run">
                                    {{ language === 'pl' ? 'Ostatnie:' : 'Last:' }} {{ new Date(schedule.lastRun).toLocaleString() }}
                                </div>
                            </div>
                        </div>
                        
                        <div class="schedule-actions">
                            <button @click="runScheduleNow(schedule.id)" :disabled="scheduleState.isLoading" class="action-btn run" :title="language === 'pl' ? 'Uruchom teraz' : 'Run Now'">
                                {{ scheduleState.isLoading ? '⏳' : '▶️' }}
                            </button>
                            <button @click="editSchedule(schedule)" class="action-btn edit" :title="language === 'pl' ? 'Edytuj' : 'Edit'">✏️</button>
                            <button @click="toggleSchedule(schedule.id)" class="action-btn toggle" :title="schedule.active ? (language === 'pl' ? 'Wyłącz' : 'Disable') : (language === 'pl' ? 'Włącz' : 'Enable')">
                                {{ schedule.active ? '⏸️' : '▶️' }}
                            </button>
                            <button @click="deleteSchedule(schedule.id)" class="action-btn delete" :title="language === 'pl' ? 'Usuń' : 'Delete'">🗑️</button>
                        </div>
                    </div>
                </div>

                <!-- Edit Schedule Modal -->
                <div v-if="scheduleState.editingSchedule" class="modal-overlay" @click="scheduleState.editingSchedule = null">
                    <div class="modal-content" @click.stop>
                        <h3>{{ language === 'pl' ? 'Edytuj harmonogram' : 'Edit Schedule' }}</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>{{ language === 'pl' ? 'Nazwa' : 'Name' }}:</label>
                                <input v-model="scheduleState.editingSchedule.name" type="text" />
                            </div>
                            <div class="form-group">
                                <label>{{ language === 'pl' ? 'Częstotliwość' : 'Frequency' }}:</label>
                                <select v-model="scheduleState.editingSchedule.frequency">
                                    <option v-for="freq in frequencyOptions" :key="freq.value" :value="freq.value">
                                        {{ freq.label }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>{{ language === 'pl' ? 'Godzina' : 'Time' }}:</label>
                                <input v-model="scheduleState.editingSchedule.time" type="time" />
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button @click="saveSchedule" class="save-btn">{{ language === 'pl' ? 'Zapisz' : 'Save' }}</button>
                            <button @click="scheduleState.editingSchedule = null" class="cancel-btn">{{ language === 'pl' ? 'Anuluj' : 'Cancel' }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .reports-schedule-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .template-container { max-width: 1200px; margin: 0 auto; }
        
        .template-header {
            display: flex; align-items: center; justify-content: space-between;
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .back-btn, .add-btn { 
            padding: 8px 16px; border: none; border-radius: 6px; 
            cursor: pointer; font-weight: 500; transition: all 0.3s; 
        }
        .back-btn { background: #6c757d; color: white; }
        .add-btn { background: #28a745; color: white; }
        
        .vue-badge { 
            background: #42b883; color: white; padding: 6px 12px; 
            border-radius: 16px; font-size: 0.9em; font-weight: 600; 
        }
        
        .add-schedule-form {
            background: white; padding: 24px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .form-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px; margin-bottom: 20px;
        }
        
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-weight: 600; color: #333; }
        .form-group input, .form-group select {
            padding: 10px; border: 2px solid #e9ecef; border-radius: 6px;
            transition: border-color 0.3s;
        }
        .form-group input:focus, .form-group select:focus {
            border-color: #9c27b0; outline: none;
        }
        
        .recipients-section { margin-bottom: 20px; }
        .recipient-row {
            display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
        }
        .recipient-row input { flex: 1; }
        .remove-btn, .add-recipient-btn {
            padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;
        }
        .remove-btn { background: #dc3545; color: white; }
        .add-recipient-btn { background: #17a2b8; color: white; }
        
        .form-actions, .modal-actions {
            display: flex; gap: 12px; justify-content: flex-end;
        }
        
        .save-btn { background: #28a745; color: white; }
        .cancel-btn { background: #6c757d; color: white; }
        .save-btn, .cancel-btn {
            padding: 10px 20px; border: none; border-radius: 6px;
            cursor: pointer; font-weight: 500;
        }
        
        .schedule-list { display: flex; flex-direction: column; gap: 16px; }
        
        .schedule-item {
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.3s;
            position: relative;
        }
        
        .schedule-item.inactive { opacity: 0.7; }
        
        .schedule-main {
            display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;
        }
        
        .schedule-name { margin: 0 0 8px 0; color: #333; font-size: 1.2em; }
        .schedule-description { margin: 0 0 12px 0; color: #666; }
        
        .schedule-details {
            display: flex; gap: 12px; flex-wrap: wrap;
        }
        
        .schedule-details span {
            padding: 4px 8px; background: #f8f9fa; border-radius: 4px;
            font-size: 0.9em; color: #495057;
        }
        
        .status-badge {
            padding: 6px 12px; border-radius: 16px; font-size: 0.9em; font-weight: 600;
            margin-bottom: 8px;
        }
        
        .status-badge.active { background: #d4edda; color: #155724; }
        .status-badge.inactive { background: #f8d7da; color: #721c24; }
        
        .next-run, .last-run {
            font-size: 0.9em; color: #666; margin-bottom: 4px;
        }
        
        .schedule-actions {
            position: absolute; top: 20px; right: 20px;
            display: flex; gap: 8px;
        }
        
        .action-btn {
            padding: 6px 8px; border: none; border-radius: 4px;
            cursor: pointer; font-size: 0.9em; transition: all 0.3s;
        }
        
        .action-btn.run { background: #28a745; color: white; }
        .action-btn.edit { background: #ffc107; }
        .action-btn.toggle { background: #17a2b8; color: white; }
        .action-btn.delete { background: #dc3545; color: white; }
        
        .action-btn:hover { transform: scale(1.1); }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
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

window.ReportsScheduleTemplate = ReportsScheduleTemplate;
console.log('🔶 Vue ReportsScheduleTemplate component loaded');
