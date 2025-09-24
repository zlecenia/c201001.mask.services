<template>
  <div class="maintenance-table">
    <div class="table-container">
      <table class="tasks-table">
        <thead>
          <tr>
            <th>{{ $t(TRANSLATION_KEYS.taskId) || 'ID' }}</th>
            <th>{{ $t(TRANSLATION_KEYS.title) || 'Tytuł' }}</th>
            <th>{{ $t(TRANSLATION_KEYS.device) || 'Urządzenie' }}</th>
            <th>{{ $t(TRANSLATION_KEYS.priority) || 'Priorytet' }}</th>
            <th>{{ $t(TRANSLATION_KEYS.dueDate) || 'Termin' }}</th>
            <th>{{ $t(TRANSLATION_KEYS.status) || 'Status' }}</th>
            <th>{{ $t(TRANSLATION_KEYS.assignedTo) || 'Przypisane' }}</th>
            <th>{{ $t(TRANSLATION_KEYS.actions) || 'Akcje' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="task in tasks" 
            :key="task.id" 
            :class="getTaskRowClass(task)"
          >
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
                {{ getPriorityLabel(task.priority) }}
              </span>
            </td>
            <td>
              <span :class="{ overdue: isOverdue(task.dueDate) }">
                {{ formatDate(task.dueDate) }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', task.status.toLowerCase()]">
                {{ getStatusLabel(task.status) }}
              </span>
            </td>
            <td>{{ task.assignedTo }}</td>
            <td>
              <div class="task-actions">
                <button 
                  class="btn-action view" 
                  @click="viewTask(task)" 
                  :title="$t(TRANSLATION_KEYS.view) || 'Zobacz'"
                >
                  👁️
                </button>
                <button 
                  class="btn-action edit" 
                  @click="editTask(task)" 
                  :title="$t(TRANSLATION_KEYS.edit) || 'Edytuj'"
                >
                  ✏️
                </button>
                <button 
                  v-if="task.status !== 'COMPLETED'"
                  class="btn-action complete" 
                  @click="completeTask(task)" 
                  :title="$t(TRANSLATION_KEYS.complete) || 'Ukończ'"
                >
                  ✅
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="tasks.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>{{ $t(TRANSLATION_KEYS.noTasks) || 'Brak zadań' }}</h3>
      <p>{{ $t(TRANSLATION_KEYS.noTasksMessage) || 'Nie znaleziono żadnych zadań konserwacyjnych.' }}</p>
      <button class="btn btn-primary" @click="createTask">
        {{ $t(TRANSLATION_KEYS.createFirstTask) || 'Utwórz pierwsze zadanie' }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>{{ $t(TRANSLATION_KEYS.loading) || 'Ładowanie...' }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaintenanceTable',
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Table configuration
      TABLE_MIN_WIDTH: 800, // px for mobile scroll
      ROW_HEIGHT: 60, // px
      ACTIONS_COLUMN_WIDTH: 120, // px
      
      // Date configuration
      DATE_FORMAT_OPTIONS: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      },
      
      // Overdue calculation
      OVERDUE_THRESHOLD_HOURS: 0, // Consider overdue immediately after due date
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      ACTION_BUTTON_SIZE: 32, // px
      
      // Animation timing
      ROW_HOVER_DURATION: 200, // ms
      BADGE_ANIMATION_DURATION: 150, // ms
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        // Table headers
        taskId: 'workshop.task_id',
        title: 'workshop.title',
        device: 'workshop.device',
        priority: 'workshop.priority',
        dueDate: 'workshop.due_date',
        status: 'workshop.status',
        assignedTo: 'workshop.assigned_to',
        actions: 'workshop.actions',
        
        // Actions
        view: 'workshop.view',
        edit: 'workshop.edit',
        complete: 'workshop.complete',
        
        // Status labels
        pending: 'workshop.pending',
        inProgress: 'workshop.in_progress',
        completed: 'workshop.completed',
        overdue: 'workshop.overdue',
        
        // Priority labels
        high: 'workshop.high',
        medium: 'workshop.medium',
        low: 'workshop.low',
        
        // Empty state
        noTasks: 'workshop.no_tasks',
        noTasksMessage: 'workshop.no_tasks_message',
        createFirstTask: 'workshop.create_first_task',
        
        // Loading
        loading: 'global.loading'
      },
      
      // Status and priority mappings
      STATUS_LABELS: {
        PENDING: 'Oczekujące',
        IN_PROGRESS: 'W trakcie',
        COMPLETED: 'Ukończone',
        OVERDUE: 'Przeterminowane'
      },
      
      PRIORITY_LABELS: {
        HIGH: 'Wysoki',
        MEDIUM: 'Średni',
        LOW: 'Niski'
      },
      
      // Row class mappings
      PRIORITY_ROW_CLASSES: {
        HIGH: 'high-priority-row',
        MEDIUM: 'medium-priority-row',
        LOW: 'low-priority-row'
      }
    }
  },
  methods: {
    getTaskRowClass(task) {
      const classes = [];
      
      if (this.isOverdue(task.dueDate) && task.status !== 'COMPLETED') {
        classes.push('overdue-row');
      }
      
      if (task.priority === 'HIGH' && task.status !== 'COMPLETED') {
        classes.push('high-priority-row');
      }
      
      if (task.status === 'COMPLETED') {
        classes.push('completed-row');
      }
      
      return classes;
    },
    
    isOverdue(dueDate) {
      if (!dueDate) return false;
      
      const now = new Date();
      const due = new Date(dueDate);
      const hoursDiff = (now - due) / (1000 * 60 * 60);
      
      return hoursDiff > this.OVERDUE_THRESHOLD_HOURS;
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', this.DATE_FORMAT_OPTIONS);
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
      }
    },
    
    getPriorityLabel(priority) {
      return this.$t(`workshop.${priority.toLowerCase()}`) || this.PRIORITY_LABELS[priority] || priority;
    },
    
    getStatusLabel(status) {
      return this.$t(`workshop.${status.toLowerCase()}`) || this.STATUS_LABELS[status] || status;
    },
    
    viewTask(task) {
      this.$emit('task-view', task);
    },
    
    editTask(task) {
      this.$emit('task-edit', task);
    },
    
    completeTask(task) {
      this.$emit('task-complete', task);
    },
    
    createTask() {
      this.$emit('task-create');
    },
    
    sortTasks(column, direction = 'asc') {
      this.$emit('tasks-sort', { column, direction });
    }
  }
}
</script>

<style scoped>
.maintenance-table {
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table-container {
  overflow-x: auto;
}

.tasks-table {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
}

.tasks-table th,
.tasks-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.tasks-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tasks-table tbody tr {
  transition: background-color 0.2s ease;
}

.tasks-table tbody tr:hover {
  background: #f8f9fa;
}

.overdue-row {
  background: #ffeaea !important;
}

.overdue-row:hover {
  background: #ffdddd !important;
}

.high-priority-row {
  background: #fff3cd !important;
}

.high-priority-row:hover {
  background: #ffecb3 !important;
}

.completed-row {
  opacity: 0.7;
}

.completed-row:hover {
  background: #d4edda !important;
}

.task-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.task-title span {
  font-weight: 500;
  color: #2c3e50;
}

.task-title small {
  color: #6c757d;
  font-size: 0.8rem;
  line-height: 1.2;
}

.priority-badge,
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
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
  justify-content: flex-start;
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
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn-action:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.btn-action.view:hover {
  background: #cce5ff;
  border-color: #80c7ff;
}

.btn-action.edit:hover {
  background: #fff3cd;
  border-color: #ffd60a;
}

.btn-action.complete:hover {
  background: #d4edda;
  border-color: #c3e6cb;
}

/* Empty State */
.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  color: #6c757d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.empty-state p {
  margin: 0 0 2rem 0;
  font-size: 0.9rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 249, 250, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e9ecef;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  color: #6c757d;
  font-weight: 500;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .tasks-table {
    min-width: 900px;
  }
  
  .tasks-table th,
  .tasks-table td {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
  
  .task-title small {
    font-size: 0.75rem;
  }
  
  .priority-badge,
  .status-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
  
  .btn-action {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
  
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .empty-icon {
    font-size: 3rem;
  }
}

/* Very small screens */
@media (max-width: 350px) {
  .tasks-table th,
  .tasks-table td {
    padding: 0.4rem;
    font-size: 0.8rem;
  }
  
  .empty-state {
    padding: 1.5rem 0.75rem;
  }
  
  .empty-icon {
    font-size: 2.5rem;
  }
}

/* Touch-friendly enhancements */
.btn-action {
  min-width: 44px;
  min-height: 44px;
}

.btn-action:active {
  transform: scale(0.95);
  transition-duration: 0.1s;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .tasks-table th {
    border-bottom-width: 2px;
  }
  
  .tasks-table td {
    border-bottom-width: 1px;
  }
  
  .priority-badge,
  .status-badge {
    border: 1px solid currentColor;
  }
  
  .btn-action {
    border-width: 2px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .tasks-table tbody tr,
  .btn-action,
  .loading-spinner {
    transition: none;
    animation: none;
  }
  
  .btn-action:hover {
    transform: none;
  }
}

/* Focus styles for accessibility */
.btn-action:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.tasks-table tbody tr:focus-within {
  background: #e3f2fd;
}

/* Sticky actions column on mobile */
@media (max-width: 600px) {
  .tasks-table td:last-child,
  .tasks-table th:last-child {
    position: sticky;
    right: 0;
    background: inherit;
    border-left: 1px solid #e9ecef;
  }
  
  .tasks-table th:last-child {
    background: #f8f9fa;
  }
}

/* Table sorting indicators */
.tasks-table th.sortable {
  cursor: pointer;
  position: relative;
  user-select: none;
}

.tasks-table th.sortable:hover {
  background: #e9ecef;
}

.tasks-table th.sortable::after {
  content: '↕️';
  position: absolute;
  right: 0.5rem;
  opacity: 0.5;
  font-size: 0.8rem;
}

.tasks-table th.sortable.asc::after {
  content: '↑';
  opacity: 1;
}

.tasks-table th.sortable.desc::after {
  content: '↓';
  opacity: 1;
}
</style>
