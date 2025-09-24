<template>
  <div class="test-reports-schedule">
    <div class="schedule-header">
      <h2>📅 {{ $t('reports.scheduled_reports') || 'Zaplanowane raporty' }}</h2>
      <div class="schedule-actions">
        <button class="btn btn-primary" @click="createSchedule">
          ➕ {{ $t('reports.new_schedule') || 'Nowy harmonogram' }}
        </button>
        <button class="btn btn-info" @click="exportSchedules">
          📤 {{ $t('reports.export_schedules') || 'Eksport harmonogramów' }}
        </button>
      </div>
    </div>

    <!-- Schedule Overview -->
    <div class="schedule-overview">
      <div class="overview-card">
        <h4>{{ $t('reports.active_schedules') || 'Aktywne harmonogramy' }}</h4>
        <span class="value">{{ activeSchedulesCount }}</span>
        <small>{{ $t('reports.running') || 'działających' }}</small>
      </div>
      <div class="overview-card info">
        <h4>{{ $t('reports.next_execution') || 'Następne wykonanie' }}</h4>
        <span class="value">{{ formatTime(nextExecutionTime) }}</span>
        <small>{{ $t('reports.scheduled') || 'zaplanowane' }}</small>
      </div>
      <div class="overview-card success">
        <h4>{{ $t('reports.success_rate') || 'Wskaźnik sukcesu' }}</h4>
        <span class="value">{{ successRate }}%</span>
        <small>{{ $t('reports.last_month') || 'ostatni miesiąc' }}</small>
      </div>
      <div class="overview-card warning">
        <h4>{{ $t('reports.failed_today') || 'Nieudane dzisiaj' }}</h4>
        <span class="value">{{ failedTodayCount }}</span>
        <small>{{ $t('reports.executions') || 'wykonań' }}</small>
      </div>
    </div>

    <!-- Schedules List -->
    <div class="schedules-list">
      <div 
        v-for="schedule in schedules" 
        :key="schedule.id"
        class="schedule-card"
        :class="{ active: schedule.enabled, inactive: !schedule.enabled }"
      >
        <div class="schedule-header-card">
          <div class="schedule-info">
            <h3>{{ schedule.name }}</h3>
            <p>{{ schedule.description }}</p>
          </div>
          <div class="schedule-status">
            <span :class="['status-badge', schedule.enabled ? 'active' : 'inactive']">
              {{ schedule.enabled ? ($t('reports.active') || 'Aktywny') : ($t('reports.inactive') || 'Nieaktywny') }}
            </span>
          </div>
        </div>

        <div class="schedule-details">
          <div class="detail-item">
            <span class="detail-label">{{ $t('reports.frequency') || 'Częstotliwość' }}:</span>
            <span class="detail-value">{{ getFrequencyText(schedule.frequency) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('reports.next_run') || 'Następne uruchomienie' }}:</span>
            <span class="detail-value">{{ formatDateTime(schedule.nextRun) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('reports.last_run') || 'Ostatnie uruchomienie' }}:</span>
            <span class="detail-value">{{ schedule.lastRun ? formatDateTime(schedule.lastRun) : 'Nigdy' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('reports.output_format') || 'Format' }}:</span>
            <span class="detail-value">{{ schedule.format }}</span>
          </div>
        </div>

        <div class="schedule-actions">
          <button class="btn-action" @click="editSchedule(schedule)" title="Edytuj">✏️</button>
          <button 
            class="btn-action toggle" 
            @click="toggleSchedule(schedule)" 
            :title="schedule.enabled ? 'Wyłącz' : 'Włącz'"
          >
            {{ schedule.enabled ? '⏸️' : '▶️' }}
          </button>
          <button class="btn-action run" @click="runScheduleNow(schedule)" title="Uruchom teraz">⚡</button>
          <button class="btn-action delete" @click="deleteSchedule(schedule)" title="Usuń">🗑️</button>
        </div>

        <!-- Execution History -->
        <div v-if="schedule.showHistory" class="execution-history">
          <h4>{{ $t('reports.execution_history') || 'Historia wykonań' }}</h4>
          <div class="history-list">
            <div 
              v-for="execution in schedule.executions" 
              :key="execution.id"
              class="history-item"
              :class="execution.status.toLowerCase()"
            >
              <div class="execution-time">{{ formatDateTime(execution.timestamp) }}</div>
              <div class="execution-status">
                <span :class="['execution-badge', execution.status.toLowerCase()]">
                  {{ getExecutionIcon(execution.status) }} {{ execution.status }}
                </span>
              </div>
              <div class="execution-duration">{{ formatDuration(execution.duration) }}</div>
            </div>
          </div>
        </div>
        
        <div class="schedule-toggle">
          <button 
            class="btn-link" 
            @click="schedule.showHistory = !schedule.showHistory"
          >
            {{ schedule.showHistory ? '▲' : '▼' }} 
            {{ $t('reports.execution_history') || 'Historia wykonań' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Schedule Modal -->
    <div v-if="showScheduleModal" class="modal-overlay" @click="closeScheduleModal">
      <div class="modal-content schedule-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? ($t('reports.edit_schedule') || 'Edytuj harmonogram') : ($t('reports.new_schedule') || 'Nowy harmonogram') }}</h3>
          <button class="close-btn" @click="closeScheduleModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>{{ $t('reports.schedule_name') || 'Nazwa harmonogramu' }}:</label>
              <input type="text" v-model="scheduleForm.name" :placeholder="$t('reports.enter_name') || 'Wprowadź nazwę'">
            </div>
            
            <div class="form-group">
              <label>{{ $t('reports.description') || 'Opis' }}:</label>
              <textarea v-model="scheduleForm.description" :placeholder="$t('reports.enter_description') || 'Wprowadź opis'"></textarea>
            </div>
            
            <div class="form-group">
              <label>{{ $t('reports.frequency') || 'Częstotliwość' }}:</label>
              <select v-model="scheduleForm.frequency">
                <option value="HOURLY">{{ $t('reports.hourly') || 'Co godzinę' }}</option>
                <option value="DAILY">{{ $t('reports.daily') || 'Codziennie' }}</option>
                <option value="WEEKLY">{{ $t('reports.weekly') || 'Co tydzień' }}</option>
                <option value="MONTHLY">{{ $t('reports.monthly') || 'Co miesiąc' }}</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>{{ $t('reports.time') || 'Godzina wykonania' }}:</label>
              <input type="time" v-model="scheduleForm.time">
            </div>
            
            <div class="form-group">
              <label>{{ $t('reports.report_type') || 'Typ raportu' }}:</label>
              <select v-model="scheduleForm.reportType">
                <option value="SUMMARY">{{ $t('reports.summary') || 'Podsumowanie' }}</option>
                <option value="DETAILED">{{ $t('reports.detailed') || 'Szczegółowy' }}</option>
                <option value="COMPARISON">{{ $t('reports.comparison') || 'Porównanie' }}</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>{{ $t('reports.output_format') || 'Format wyjściowy' }}:</label>
              <select v-model="scheduleForm.format">
                <option value="PDF">PDF</option>
                <option value="EXCEL">Excel</option>
                <option value="CSV">CSV</option>
              </select>
            </div>
            
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="scheduleForm.enabled">
                {{ $t('reports.enable_schedule') || 'Włącz harmonogram' }}
              </label>
            </div>
            
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="scheduleForm.emailNotifications">
                {{ $t('reports.email_notifications') || 'Powiadomienia email' }}
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeScheduleModal">
            {{ $t('common.cancel') || 'Anuluj' }}
          </button>
          <button class="btn btn-primary" @click="saveSchedule">
            {{ $t('common.save') || 'Zapisz' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestReportsSchedule',
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showScheduleModal: false,
      isEditMode: false,
      scheduleForm: {
        name: '',
        description: '',
        frequency: 'DAILY',
        time: '08:00',
        reportType: 'SUMMARY',
        format: 'PDF',
        enabled: true,
        emailNotifications: false
      },
      schedules: [
        {
          id: 1,
          name: 'Dzienny raport testów',
          description: 'Automatyczny raport ze wszystkich testów wykonanych w ciągu dnia',
          frequency: 'DAILY',
          time: '18:00',
          reportType: 'SUMMARY',
          format: 'PDF',
          enabled: true,
          nextRun: new Date(Date.now() + 3600000).toISOString(),
          lastRun: new Date(Date.now() - 86400000).toISOString(),
          showHistory: false,
          executions: [
            {
              id: 1,
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              status: 'SUCCESS',
              duration: 2340
            },
            {
              id: 2,
              timestamp: new Date(Date.now() - 172800000).toISOString(),
              status: 'SUCCESS',
              duration: 1890
            }
          ]
        },
        {
          id: 2,
          name: 'Tygodniowy raport porównawczy',
          description: 'Raport porównujący wyniki testów z ostatniego tygodnia',
          frequency: 'WEEKLY',
          time: '09:00',
          reportType: 'COMPARISON',
          format: 'EXCEL',
          enabled: false,
          nextRun: new Date(Date.now() + 604800000).toISOString(),
          lastRun: null,
          showHistory: false,
          executions: []
        }
      ]
    }
  },
  computed: {
    activeSchedulesCount() {
      return this.schedules.filter(s => s.enabled).length;
    },
    
    nextExecutionTime() {
      const enabledSchedules = this.schedules.filter(s => s.enabled);
      if (enabledSchedules.length === 0) return null;
      
      const nextTimes = enabledSchedules.map(s => new Date(s.nextRun));
      return Math.min(...nextTimes);
    },
    
    successRate() {
      const allExecutions = this.schedules.flatMap(s => s.executions);
      if (allExecutions.length === 0) return 100;
      
      const successful = allExecutions.filter(e => e.status === 'SUCCESS').length;
      return Math.round((successful / allExecutions.length) * 100);
    },
    
    failedTodayCount() {
      const today = new Date().toDateString();
      return this.schedules
        .flatMap(s => s.executions)
        .filter(e => e.status === 'FAILED' && new Date(e.timestamp).toDateString() === today)
        .length;
    }
  },
  methods: {
    createSchedule() {
      this.isEditMode = false;
      this.scheduleForm = {
        name: '',
        description: '',
        frequency: 'DAILY',
        time: '08:00',
        reportType: 'SUMMARY',
        format: 'PDF',
        enabled: true,
        emailNotifications: false
      };
      this.showScheduleModal = true;
    },
    
    editSchedule(schedule) {
      this.isEditMode = true;
      this.scheduleForm = { ...schedule };
      this.showScheduleModal = true;
    },
    
    saveSchedule() {
      if (this.isEditMode) {
        const index = this.schedules.findIndex(s => s.id === this.scheduleForm.id);
        if (index > -1) {
          this.schedules[index] = { ...this.scheduleForm };
        }
      } else {
        const newSchedule = {
          ...this.scheduleForm,
          id: Date.now(),
          nextRun: this.calculateNextRun(this.scheduleForm.frequency, this.scheduleForm.time),
          lastRun: null,
          showHistory: false,
          executions: []
        };
        this.schedules.push(newSchedule);
      }
      
      this.closeScheduleModal();
      console.log('Schedule saved:', this.scheduleForm);
    },
    
    toggleSchedule(schedule) {
      schedule.enabled = !schedule.enabled;
      console.log(`Schedule ${schedule.name} ${schedule.enabled ? 'enabled' : 'disabled'}`);
    },
    
    runScheduleNow(schedule) {
      console.log('Running schedule now:', schedule.name);
      // Add execution to history
      schedule.executions.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        status: 'SUCCESS',
        duration: Math.floor(Math.random() * 3000) + 1000
      });
    },
    
    deleteSchedule(schedule) {
      if (confirm(this.$t('reports.confirm_delete') || 'Czy na pewno chcesz usunąć ten harmonogram?')) {
        const index = this.schedules.findIndex(s => s.id === schedule.id);
        if (index > -1) {
          this.schedules.splice(index, 1);
        }
      }
    },
    
    exportSchedules() {
      console.log('Exporting schedules');
    },
    
    closeScheduleModal() {
      this.showScheduleModal = false;
    },
    
    calculateNextRun(frequency, time) {
      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      
      let nextRun = new Date();
      nextRun.setHours(hours, minutes, 0, 0);
      
      if (nextRun <= now) {
        switch (frequency) {
          case 'HOURLY':
            nextRun.setHours(nextRun.getHours() + 1);
            break;
          case 'DAILY':
            nextRun.setDate(nextRun.getDate() + 1);
            break;
          case 'WEEKLY':
            nextRun.setDate(nextRun.getDate() + 7);
            break;
          case 'MONTHLY':
            nextRun.setMonth(nextRun.getMonth() + 1);
            break;
        }
      }
      
      return nextRun.toISOString();
    },
    
    getFrequencyText(frequency) {
      const texts = {
        HOURLY: this.$t('reports.hourly') || 'Co godzinę',
        DAILY: this.$t('reports.daily') || 'Codziennie',
        WEEKLY: this.$t('reports.weekly') || 'Co tydzień',
        MONTHLY: this.$t('reports.monthly') || 'Co miesiąc'
      };
      return texts[frequency] || frequency;
    },
    
    getExecutionIcon(status) {
      const icons = {
        SUCCESS: '✅',
        FAILED: '❌',
        RUNNING: '⏳'
      };
      return icons[status] || '📋';
    },
    
    formatDateTime(dateStr) {
      return new Date(dateStr).toLocaleString('pl-PL');
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString('pl-PL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    },
    
    formatDuration(ms) {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      }
      return `${seconds}s`;
    }
  }
}
</script>

<style scoped>
.test-reports-schedule {
  padding: 1rem;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.schedule-header h2 {
  margin: 0;
  color: #2c3e50;
}

.schedule-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary { background: #007bff; color: white; }
.btn-info { background: #17a2b8; color: white; }
.btn-secondary { background: #6c757d; color: white; }

.btn:hover { transform: translateY(-1px); }

.schedule-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.overview-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.overview-card.info { border-left-color: #17a2b8; }
.overview-card.success { border-left-color: #28a745; }
.overview-card.warning { border-left-color: #ffc107; }

.overview-card .value {
  display: block;  
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.schedules-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #28a745;
}

.schedule-card.inactive {
  border-left-color: #6c757d;
  opacity: 0.8;
}

.schedule-header-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.schedule-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.schedule-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.schedule-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.detail-label {
  color: #6c757d;
  font-weight: 600;
}

.detail-value {
  color: #2c3e50;
}

.schedule-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.btn-action {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.btn-action:hover { background: #e9ecef; }
.btn-action.toggle:hover { background: #fff3cd; }
.btn-action.run:hover { background: #d1ecf1; }
.btn-action.delete:hover { background: #f8d7da; }

.execution-history {
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
  margin-top: 1rem;
}

.execution-history h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.9rem;
}

.execution-badge {
  padding: 0.2rem 0.4rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
}

.execution-badge.success {
  background: #d4edda;
  color: #155724;
}

.execution-badge.failed {
  background: #f8d7da;
  color: #721c24;
}

.schedule-toggle {
  text-align: center;
  margin-top: 1rem;
}

.btn-link {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-link:hover {
  text-decoration: underline;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #495057;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.form-group textarea {
  min-height: 60px;
  resize: vertical;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

/* Mobile optimizations */
@media (max-width: 450px) {
  .schedule-header {
    flex-direction: column;
    gap: 1rem;
  }

  .schedule-actions {
    width: 100%;
    justify-content: center;
  }

  .schedule-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .schedule-header-card {
    flex-direction: column;
    gap: 1rem;
  }

  .schedule-details {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .detail-item {
    flex-direction: column;
    gap: 0.25rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
