<template>
  <div class="workshop-maintenance">
    <div class="maintenance-header">
      <h2>🔧 {{ $t('workshop.maintenance_management') || 'Zarządzanie konserwacją' }}</h2>
      <div class="maintenance-actions">
        <button class="btn btn-primary" @click="createMaintenanceTask">
          ➕ {{ $t('workshop.new_task') || 'Nowe zadanie' }}
        </button>
        <button class="btn btn-secondary" @click="generateReport">
          📊 {{ $t('workshop.generate_report') || 'Generuj raport' }}
        </button>
      </div>
    </div>

    <!-- Maintenance Overview -->
    <div class="maintenance-overview">
      <div class="overview-card urgent">
        <h4>{{ $t('workshop.urgent_tasks') || 'Pilne zadania' }}</h4>
        <span class="value">{{ urgentTasksCount }}</span>
        <small>{{ $t('workshop.require_attention') || 'wymagają uwagi' }}</small>
      </div>
      <div class="overview-card warning">
        <h4>{{ $t('workshop.due_today') || 'Dzisiaj' }}</h4>
        <span class="value">{{ todayTasksCount }}</span>
        <small>{{ $t('workshop.tasks') || 'zadań' }}</small>
      </div>
      <div class="overview-card info">
        <h4>{{ $t('workshop.this_week') || 'Ten tydzień' }}</h4>
        <span class="value">{{ weekTasksCount }}</span>
        <small>{{ $t('workshop.scheduled') || 'zaplanowanych' }}</small>
      </div>
      <div class="overview-card">
        <h4>{{ $t('workshop.completed') || 'Ukończone' }}</h4>
        <span class="value">{{ completedTasksCount }}</span>
        <small>{{ $t('workshop.this_month') || 'w tym miesiącu' }}</small>
      </div>
    </div>

    <!-- Task Filters -->
    <div class="task-filters">
      <div class="filter-group">
        <label>{{ $t('workshop.status') || 'Status' }}:</label>
        <select v-model="selectedStatus" @change="filterTasks">
          <option value="ALL">{{ $t('workshop.all_statuses') || 'Wszystkie' }}</option>
          <option value="PENDING">{{ $t('workshop.pending') || 'Oczekujące' }}</option>
          <option value="IN_PROGRESS">{{ $t('workshop.in_progress') || 'W trakcie' }}</option>
          <option value="COMPLETED">{{ $t('workshop.completed') || 'Ukończone' }}</option>
          <option value="OVERDUE">{{ $t('workshop.overdue') || 'Przeterminowane' }}</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>{{ $t('workshop.priority') || 'Priorytet' }}:</label>
        <select v-model="selectedPriority" @change="filterTasks">
          <option value="ALL">{{ $t('workshop.all_priorities') || 'Wszystkie' }}</option>
          <option value="HIGH">{{ $t('workshop.high') || 'Wysoki' }}</option>
          <option value="MEDIUM">{{ $t('workshop.medium') || 'Średni' }}</option>
          <option value="LOW">{{ $t('workshop.low') || 'Niski' }}</option>
        </select>
      </div>

      <div class="filter-group">
        <input 
          type="text" 
          v-model="searchQuery"
          @input="filterTasks"
          :placeholder="$t('workshop.search_tasks') || 'Szukaj zadań...'"
          class="search-input"
        >
      </div>
    </div>

    <!-- Maintenance Tasks Table -->
    <div class="tasks-table-container">
      <table class="tasks-table">
        <thead>
          <tr>
            <th>{{ $t('workshop.task_id') || 'ID' }}</th>
            <th>{{ $t('workshop.title') || 'Tytuł' }}</th>
            <th>{{ $t('workshop.device') || 'Urządzenie' }}</th>
            <th>{{ $t('workshop.priority') || 'Priorytet' }}</th>
            <th>{{ $t('workshop.due_date') || 'Termin' }}</th>
            <th>{{ $t('workshop.status') || 'Status' }}</th>
            <th>{{ $t('workshop.assigned_to') || 'Przypisane' }}</th>
            <th>{{ $t('workshop.actions') || 'Akcje' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in filteredTasks" :key="task.id" :class="getTaskRowClass(task)">
            <td>{{ task.id }}</td>
            <td>
              <div class="task-title">
                <span>{{ task.title }}</span>
                <small v-if="task.description">{{ task.description }}</small>
              </div>
            </td>
            <td>{{ task.device }}</td>
            <td>
              <span :class="['priority-badge', task.priority.toLowerCase()]">
                {{ $t(`workshop.${task.priority.toLowerCase()}`) || task.priority }}
              </span>
            </td>
            <td>
              <span :class="{ 'overdue': isOverdue(task.dueDate) }">
                {{ formatDate(task.dueDate) }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', task.status.toLowerCase()]">
                {{ $t(`workshop.${task.status.toLowerCase()}`) || task.status }}
              </span>
            </td>
            <td>{{ task.assignedTo }}</td>
            <td>
              <div class="task-actions">
                <button class="btn-action" @click="viewTask(task)" title="Podgląd">👁️</button>
                <button class="btn-action" @click="editTask(task)" title="Edytuj">✏️</button>
                <button class="btn-action complete" @click="completeTask(task)" title="Ukończ">✅</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Task Details Modal -->
    <div v-if="showTaskModal" class="modal-overlay" @click="closeTaskModal">
      <div class="modal-content task-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ modalTask?.title || 'Szczegóły zadania' }}</h3>
          <button class="close-btn" @click="closeTaskModal">×</button>
        </div>
        <div class="modal-body">
          <div class="task-details">
            <div class="detail-row">
              <label>{{ $t('workshop.task_id') || 'ID' }}:</label>
              <span>{{ modalTask?.id }}</span>
            </div>
            <div class="detail-row">
              <label>{{ $t('workshop.device') || 'Urządzenie' }}:</label>
              <span>{{ modalTask?.device }}</span>
            </div>
            <div class="detail-row">
              <label>{{ $t('workshop.priority') || 'Priorytet' }}:</label>
              <span :class="['priority-badge', modalTask?.priority.toLowerCase()]">
                {{ modalTask?.priority }}
              </span>
            </div>
            <div class="detail-row">
              <label>{{ $t('workshop.description') || 'Opis' }}:</label>
              <p>{{ modalTask?.description }}</p>
            </div>
            <div class="detail-row">
              <label>{{ $t('workshop.assigned_to') || 'Przypisane' }}:</label>
              <span>{{ modalTask?.assignedTo }}</span>
            </div>
            <div class="detail-row">
              <label>{{ $t('workshop.created') || 'Utworzone' }}:</label>
              <span>{{ formatDateTime(modalTask?.createdDate) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeTaskModal">
            {{ $t('common.close') || 'Zamknij' }}
          </button>
          <button class="btn btn-primary" @click="editTask(modalTask)">
            {{ $t('workshop.edit') || 'Edytuj' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkshopMaintenanceComponent',
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Filter configuration
      DEFAULT_STATUS_FILTER: 'ALL',
      DEFAULT_PRIORITY_FILTER: 'ALL',
      SEARCH_DEBOUNCE_DELAY: 300, // ms
      
      // Task management configuration
      MAX_TASKS_DISPLAY: 100,
      TASKS_PER_PAGE: 20,
      AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
      
      // Modal configuration
      MODAL_ANIMATION_DURATION: 200, // ms
      MODAL_MAX_WIDTH: 600, // px
      
      // Date/time configuration
      DATE_FORMAT_OPTIONS: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      },
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      TABLE_MIN_WIDTH: 800, // px for mobile scroll
      
      // Task priority levels
      PRIORITY_LEVELS: {
        HIGH: { weight: 3, color: '#dc3545' },
        MEDIUM: { weight: 2, color: '#ffc107' },
        LOW: { weight: 1, color: '#17a2b8' }
      },
      
      // Task status types
      STATUS_TYPES: {
        PENDING: { label: 'Oczekujące', color: '#6c757d' },
        IN_PROGRESS: { label: 'W trakcie', color: '#17a2b8' },
        COMPLETED: { label: 'Ukończone', color: '#28a745' },
        OVERDUE: { label: 'Przeterminowane', color: '#dc3545' }
      },
      
      // Component state variables
      selectedStatus: 'ALL',
      selectedPriority: 'ALL',
      searchQuery: '',
      showTaskModal: false,
      modalTask: null,
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        // Workshop section translations
        maintenanceManagement: 'workshop.maintenance_management',
        newTask: 'workshop.new_task',
        generateReport: 'workshop.generate_report',
        urgentTasks: 'workshop.urgent_tasks',
        dueToday: 'workshop.due_today',
        thisWeek: 'workshop.this_week',
        completed: 'workshop.completed',
        thisMonth: 'workshop.this_month',
        requireAttention: 'workshop.require_attention',
        tasks: 'workshop.tasks',
        scheduled: 'workshop.scheduled',
        
        // Task management translations
        status: 'workshop.status',
        priority: 'workshop.priority',
        searchTasks: 'workshop.search_tasks',
        taskId: 'workshop.task_id',
        title: 'workshop.title',
        device: 'workshop.device',
        dueDate: 'workshop.due_date',
        assignedTo: 'workshop.assigned_to',
        actions: 'workshop.actions',
        
        // Status translations
        allStatuses: 'workshop.all_statuses',
        pending: 'workshop.pending',
        inProgress: 'workshop.in_progress',
        overdue: 'workshop.overdue',
        
        // Priority translations
        allPriorities: 'workshop.all_priorities',
        high: 'workshop.high',
        medium: 'workshop.medium',
        low: 'workshop.low',
        
        // Modal translations
        taskDetails: 'workshop.task_details',
        description: 'workshop.description',
        created: 'workshop.created',
        edit: 'workshop.edit',
        
        // Common translations
        close: 'common.close',
        cancel: 'common.cancel',
        save: 'common.save',
        delete: 'common.delete',
        confirm: 'common.confirm'
      },
      
      // Maintenance tasks data
      maintenanceTasks: [
        {
          id: 'MT001',
          title: 'Wymiana filtra HEPA',
          description: 'Rutynowa wymiana filtra głównego systemu wentylacji',
          device: 'MASKTRONIC C20-001',
          priority: 'HIGH',
          status: 'PENDING',
          dueDate: '2025-01-25',
          assignedTo: 'Jan Kowalski',
          createdDate: '2025-01-20T10:00:00'
        },
        {
          id: 'MT002',
          title: 'Kalibracja czujników ciśnienia',
          description: 'Miesięczna kalibracja czujników ciśnienia zgodnie z normą',
          device: 'MASKTRONIC C20-002',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          dueDate: '2025-01-26',
          assignedTo: 'Anna Nowak',
          createdDate: '2025-01-21T14:30:00'
        },
        {
          id: 'MT003',
          title: 'Przegląd techniczny roczny',
          description: 'Pełny przegląd techniczny urządzenia',
          device: 'MASKTRONIC C20-003',
          priority: 'HIGH',
          status: 'OVERDUE',
          dueDate: '2025-01-23',
          assignedTo: 'Piotr Wiśniewski',
          createdDate: '2025-01-15T09:00:00'
        }
      ]
    }
  },
  computed: {
    filteredTasks() {
      let tasks = [...this.maintenanceTasks];
      
      if (this.selectedStatus !== 'ALL') {
        tasks = tasks.filter(task => task.status === this.selectedStatus);
      }
      
      if (this.selectedPriority !== 'ALL') {
        tasks = tasks.filter(task => task.priority === this.selectedPriority);
      }
      
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        tasks = tasks.filter(task => 
          task.title.toLowerCase().includes(query) ||
          task.device.toLowerCase().includes(query) ||
          task.assignedTo.toLowerCase().includes(query)
        );
      }
      
      return tasks;
    },
    
    urgentTasksCount() {
      return this.maintenanceTasks.filter(task => 
        task.priority === 'HIGH' && task.status !== 'COMPLETED'
      ).length;
    },
    
    todayTasksCount() {
      const today = new Date().toISOString().split('T')[0];
      return this.maintenanceTasks.filter(task => 
        task.dueDate === today && task.status !== 'COMPLETED'
      ).length;
    },
    
    weekTasksCount() {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return this.maintenanceTasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate <= nextWeek && task.status !== 'COMPLETED';
      }).length;
    },
    
    completedTasksCount() {
      const thisMonth = new Date().toISOString().slice(0, 7);
      return this.maintenanceTasks.filter(task => 
        task.status === 'COMPLETED' && task.dueDate.startsWith(thisMonth)
      ).length;
    }
  },
  methods: {
    filterTasks() {
      // Filtering is handled by computed property
    },
    
    getTaskRowClass(task) {
      if (task.status === 'OVERDUE') return 'overdue-row';
      if (task.priority === 'HIGH') return 'high-priority-row';
      return '';
    },
    
    isOverdue(dueDate) {
      return new Date(dueDate) < new Date();
    },
    
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('pl-PL');
    },
    
    formatDateTime(dateStr) {
      return new Date(dateStr).toLocaleString('pl-PL');
    },
    
    viewTask(task) {
      this.modalTask = task;
      this.showTaskModal = true;
    },
    
    editTask(task) {
      console.log('Editing task:', task.id);
      // Implement edit functionality
    },
    
    completeTask(task) {
      task.status = 'COMPLETED';
      console.log('Completed task:', task.id);
    },
    
    createMaintenanceTask() {
      console.log('Creating new maintenance task');
      // Implement task creation
    },
    
    generateReport() {
      console.log('Generating maintenance report');
      // Implement report generation
    },
    
    closeTaskModal() {
      this.showTaskModal = false;
      this.modalTask = null;
    }
  }
}
</script>

<style scoped>
.workshop-maintenance {
  padding: 1rem;
  max-width: 100%;
}

.maintenance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.maintenance-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.maintenance-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.maintenance-overview {
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
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.overview-card.urgent {
  border-left-color: #dc3545;
}

.overview-card.warning {
  border-left-color: #ffc107;
}

.overview-card.info {
  border-left-color: #17a2b8;
}

.overview-card h4 {
  margin: 0 0 0.5rem 0;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.overview-card .value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.overview-card small {
  color: #6c757d;
  font-size: 0.8rem;
}

.task-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

.filter-group select,
.search-input {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  min-width: 120px;
}

.search-input {
  min-width: 200px;
}

.tasks-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tasks-table {
  width: 100%;
  border-collapse: collapse;
}

.tasks-table th,
.tasks-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.tasks-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.tasks-table tr:hover {
  background: #f8f9fa;
}

.overdue-row {
  background: #ffeaea !important;
}

.high-priority-row {
  background: #fff3cd !important;
}

.task-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.task-title small {
  color: #6c757d;
  font-size: 0.8rem;
}

.priority-badge,
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority-badge.high {
  background: #ffeaea;
  color: #721c24;
}

.priority-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.priority-badge.low {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.pending {
  background: #e2e3e5;
  color: #383d41;
}

.status-badge.in_progress {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.overdue {
  background: #f8d7da;
  color: #721c24;
}

.overdue {
  color: #dc3545;
  font-weight: 600;
}

.task-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-action {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-action:hover {
  background: #e9ecef;
}

.btn-action.complete:hover {
  background: #d4edda;
  border-color: #c3e6cb;
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

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.detail-row label {
  font-weight: 600;
  color: #495057;
  min-width: 120px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .maintenance-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .maintenance-actions {
    flex-direction: column;
  }

  .maintenance-overview {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .task-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .tasks-table-container {
    overflow-x: auto;
  }

  .tasks-table {
    min-width: 800px;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .detail-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-row label {
    min-width: auto;
  }
}
</style>
