<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content task-modal" @click.stop>
      <div class="modal-header">
        <h3>{{ task?.title || ($t(TRANSLATION_KEYS.taskDetails) || 'Szczegóły zadania') }}</h3>
        <button class="close-btn" @click="closeModal" :title="$t(TRANSLATION_KEYS.close) || 'Zamknij'">×</button>
      </div>

      <div class="modal-body">
        <div class="task-details">
          <!-- Basic Information -->
          <div class="details-section">
            <h4>{{ $t(TRANSLATION_KEYS.basicInfo) || 'Podstawowe informacje' }}</h4>
            <div class="detail-row">
              <label>{{ $t(TRANSLATION_KEYS.taskId) || 'ID' }}:</label>
              <span>{{ task?.id }}</span>
            </div>
            <div class="detail-row">
              <label>{{ $t(TRANSLATION_KEYS.title) || 'Tytuł' }}:</label>
              <span>{{ task?.title }}</span>
            </div>
            <div class="detail-row">
              <label>{{ $t(TRANSLATION_KEYS.description) || 'Opis' }}:</label>
              <span>{{ task?.description || ($t(TRANSLATION_KEYS.noDescription) || 'Brak opisu') }}</span>
            </div>
            <div class="detail-row">
              <label>{{ $t(TRANSLATION_KEYS.device) || 'Urządzenie' }}:</label>
              <span>{{ task?.device }}</span>
            </div>
          </div>

          <!-- Status and Priority -->
          <div class="details-section">
            <h4>{{ $t(TRANSLATION_KEYS.statusPriority) || 'Status i priorytet' }}</h4>
            <div class="detail-row">
              <label>{{ $t(TRANSLATION_KEYS.status) || 'Status' }}:</label>
              <span :class="['status-badge', task?.status?.toLowerCase()]">
                {{ getStatusLabel(task?.status) }}
              </span>
            </div>
            <div class="detail-row">
              <label>{{ $t(TRANSLATION_KEYS.priority) || 'Priorytet' }}:</label>
              <span :class="['priority-badge', task?.priority?.toLowerCase()]">
                {{ getPriorityLabel(task?.priority) }}
              </span>
            </div>
            <div class="detail-row">
              <label>{{ $t(TRANSLATION_KEYS.dueDate) || 'Termin' }}:</label>
              <span :class="{ overdue: isOverdue(task?.dueDate) }">
                {{ formatDateTime(task?.dueDate) }}
                <small v-if="isOverdue(task?.dueDate)" class="overdue-indicator">
                  ({{ $t(TRANSLATION_KEYS.overdue) || 'Przeterminowane' }})
                </small>
              </span>
            </div>
          </div>

          <!-- Assignment -->
          <div class="details-section">
            <h4>{{ $t(TRANSLATION_KEYS.assignment) || 'Przypisanie' }}</h4>
            <div class="detail-row">
              <label>{{ $t(TRANSLATION_KEYS.assignedTo) || 'Przypisane do' }}:</label>
              <span>{{ task?.assignedTo || ($t(TRANSLATION_KEYS.unassigned) || 'Nieprzypisane') }}</span>
            </div>
            <div class="detail-row">
              <label>{{ $t(TRANSLATION_KEYS.created) || 'Utworzone' }}:</label>
              <span>{{ formatDateTime(task?.createdDate) }}</span>
            </div>
            <div v-if="task?.completedDate" class="detail-row">
              <label>{{ $t(TRANSLATION_KEYS.completed) || 'Ukończone' }}:</label>
              <span>{{ formatDateTime(task?.completedDate) }}</span>
            </div>
          </div>

          <!-- Progress and Notes -->
          <div v-if="task?.progress || task?.notes" class="details-section">
            <h4>{{ $t(TRANSLATION_KEYS.progressNotes) || 'Postęp i notatki' }}</h4>
            <div v-if="task?.progress" class="detail-row">
              <label>{{ $t(TRANSLATION_KEYS.progress) || 'Postęp' }}:</label>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: task.progress + '%' }"></div>
                </div>
                <span class="progress-text">{{ task.progress }}%</span>
              </div>
            </div>
            <div v-if="task?.notes" class="detail-row">
              <label>{{ $t(TRANSLATION_KEYS.notes) || 'Notatki' }}:</label>
              <div class="notes-content">{{ task.notes }}</div>
            </div>
          </div>

          <!-- Attachments -->
          <div v-if="task?.attachments?.length" class="details-section">
            <h4>{{ $t(TRANSLATION_KEYS.attachments) || 'Załączniki' }}</h4>
            <div class="attachments-list">
              <div 
                v-for="attachment in task.attachments" 
                :key="attachment.id"
                class="attachment-item"
              >
                <span class="attachment-icon">📎</span>
                <span class="attachment-name">{{ attachment.name }}</span>
                <button class="attachment-download" @click="downloadAttachment(attachment)">
                  {{ $t(TRANSLATION_KEYS.download) || 'Pobierz' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">
          {{ $t(TRANSLATION_KEYS.close) || 'Zamknij' }}
        </button>
        <button 
          v-if="task?.status !== 'COMPLETED'"
          class="btn btn-primary" 
          @click="editTask"
        >
          {{ $t(TRANSLATION_KEYS.edit) || 'Edytuj' }}
        </button>
        <button 
          v-if="task?.status !== 'COMPLETED'"
          class="btn btn-success" 
          @click="completeTask"
        >
          {{ $t(TRANSLATION_KEYS.markComplete) || 'Oznacz jako ukończone' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaintenanceTaskModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    task: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Modal configuration
      MODAL_MAX_WIDTH: 600, // px
      MODAL_MAX_HEIGHT: '90vh',
      MODAL_ANIMATION_DURATION: 300, // ms
      
      // Date/time formatting
      DATE_TIME_FORMAT_OPTIONS: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      },
      
      // Progress bar configuration
      PROGRESS_BAR_HEIGHT: 8, // px
      PROGRESS_ANIMATION_DURATION: 500, // ms
      
      // Attachment configuration
      MAX_ATTACHMENT_NAME_LENGTH: 50,
      SUPPORTED_ATTACHMENT_TYPES: ['.pdf', '.doc', '.docx', '.jpg', '.png', '.txt'],
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      BUTTON_MIN_HEIGHT: 40, // px
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        // Modal header
        taskDetails: 'workshop.task_details',
        close: 'common.close',
        
        // Sections
        basicInfo: 'workshop.basic_info',
        statusPriority: 'workshop.status_priority',
        assignment: 'workshop.assignment',
        progressNotes: 'workshop.progress_notes',
        attachments: 'workshop.attachments',
        
        // Fields
        taskId: 'workshop.task_id',
        title: 'workshop.title',
        description: 'workshop.description',
        device: 'workshop.device',
        status: 'workshop.status',
        priority: 'workshop.priority',
        dueDate: 'workshop.due_date',
        assignedTo: 'workshop.assigned_to',
        created: 'workshop.created',
        completed: 'workshop.completed',
        progress: 'workshop.progress',
        notes: 'workshop.notes',
        
        // Status labels
        pending: 'workshop.pending',
        inProgress: 'workshop.in_progress',
        overdue: 'workshop.overdue',
        
        // Priority labels
        high: 'workshop.high',
        medium: 'workshop.medium',
        low: 'workshop.low',
        
        // Actions
        edit: 'workshop.edit',
        markComplete: 'workshop.mark_complete',
        download: 'workshop.download',
        
        // States
        noDescription: 'workshop.no_description',
        unassigned: 'workshop.unassigned',
        
        // Common
        cancel: 'common.cancel',
        save: 'common.save'
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
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    
    handleOverlayClick(event) {
      // Close modal when clicking on overlay (not on modal content)
      if (event.target === event.currentTarget) {
        this.closeModal();
      }
    },
    
    editTask() {
      this.$emit('edit', this.task);
    },
    
    completeTask() {
      this.$emit('complete', this.task);
    },
    
    isOverdue(dueDate) {
      if (!dueDate) return false;
      
      const now = new Date();
      const due = new Date(dueDate);
      return now > due;
    },
    
    formatDateTime(dateString) {
      if (!dateString) return 'N/A';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', this.DATE_TIME_FORMAT_OPTIONS);
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
      }
    },
    
    getStatusLabel(status) {
      if (!status) return '';
      return this.$t(`workshop.${status.toLowerCase()}`) || this.STATUS_LABELS[status] || status;
    },
    
    getPriorityLabel(priority) {
      if (!priority) return '';
      return this.$t(`workshop.${priority.toLowerCase()}`) || this.PRIORITY_LABELS[priority] || priority;
    },
    
    downloadAttachment(attachment) {
      // Emit event for parent to handle download
      this.$emit('attachment-download', attachment);
    },
    
    handleEscapeKey(event) {
      if (event.key === 'Escape') {
        this.closeModal();
      }
    }
  },
  
  mounted() {
    document.addEventListener('keydown', this.handleEscapeKey);
  },
  
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscapeKey);
  },
  
  watch: {
    visible(newValue) {
      if (newValue) {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        
        // Focus first focusable element
        this.$nextTick(() => {
          const firstFocusable = this.$el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (firstFocusable) {
            firstFocusable.focus();
          }
        });
      } else {
        // Restore body scroll
        document.body.style.overflow = '';
      }
    }
  }
}
</script>

<style scoped>
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
  padding: 1rem;
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
  flex: 1;
  padding-right: 1rem;
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
  flex-shrink: 0;
}

.close-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.details-section {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1.5rem;
  background: #fefefe;
}

.details-section h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  min-height: 24px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row label {
  font-weight: 600;
  color: #495057;
  min-width: 120px;
  flex-shrink: 0;
}

.detail-row span,
.detail-row div {
  flex: 1;
  color: #2c3e50;
}

.priority-badge,
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
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

.overdue-indicator {
  color: #dc3545;
  font-weight: 600;
  font-size: 0.8rem;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
  transition: width 0.5s ease;
  border-radius: inherit;
}

.progress-text {
  font-weight: 600;
  color: #28a745;
  min-width: 40px;
  text-align: right;
}

.notes-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #007bff;
  white-space: pre-wrap;
  line-height: 1.5;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.attachment-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.attachment-name {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
}

.attachment-download {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: background 0.2s;
}

.attachment-download:hover {
  background: #0056b3;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  flex-shrink: 0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  min-height: 40px;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #1e7e34;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-content {
    max-width: none;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
  
  .modal-header h3 {
    font-size: 1.1rem;
  }
  
  .details-section {
    padding: 1rem;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .detail-row label {
    min-width: auto;
    font-size: 0.9rem;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn {
    width: 100%;
  }
}

/* Very small screens */
@media (max-width: 350px) {
  .modal-overlay {
    padding: 0.25rem;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 0.75rem;
  }
  
  .details-section {
    padding: 0.75rem;
  }
}

/* Touch-friendly enhancements */
.btn,
.close-btn,
.attachment-download {
  min-height: 44px; /* Touch target minimum */
}

.btn:active,
.close-btn:active,
.attachment-download:active {
  transform: scale(0.98);
  transition-duration: 0.1s;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .modal-content {
    border: 2px solid #000;
  }
  
  .details-section {
    border-width: 2px;
  }
  
  .priority-badge,
  .status-badge {
    border: 1px solid currentColor;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .modal-content,
  .progress-fill,
  .btn,
  .close-btn {
    animation: none;
    transition: none;
  }
}

/* Focus styles for accessibility */
.close-btn:focus,
.btn:focus,
.attachment-download:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Focus trap for modal */
.modal-content:focus {
  outline: none;
}
</style>
