<template>
  <div class="reports-table">
    <div class="table-container">
      <table class="reports-table-element">
        <thead>
          <tr>
            <th>{{ $t(TRANSLATION_KEYS.id) || 'ID' }}</th>
            <th>{{ $t(TRANSLATION_KEYS.testName) || 'Nazwa testu' }}</th>
            <th>{{ $t(TRANSLATION_KEYS.device) || 'Urządzenie' }}</th>
            <th>{{ $t(TRANSLATION_KEYS.date) || 'Data' }}</th>
            <th>{{ $t(TRANSLATION_KEYS.duration) || 'Czas trwania' }}</th>
            <th>{{ $t(TRANSLATION_KEYS.result) || 'Wynik' }}</th>
            <th>{{ $t(TRANSLATION_KEYS.status) || 'Status' }}</th>
            <th>{{ $t(TRANSLATION_KEYS.actions) || 'Akcje' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="report in reports" 
            :key="report.id" 
            :class="getReportRowClass(report)"
          >
            <td>{{ report.id }}</td>
            <td>
              <div class="report-title">
                <span>{{ report.testName }}</span>
                <small v-if="report.testType">{{ report.testType }}</small>
              </div>
            </td>
            <td>{{ report.deviceName }}</td>
            <td>{{ formatDate(report.createdAt) }}</td>
            <td>{{ formatDuration(report.duration) }}</td>
            <td>
              <span :class="['result-badge', report.result?.toLowerCase()]">
                {{ getResultLabel(report.result) }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', report.status?.toLowerCase()]">
                {{ getStatusLabel(report.status) }}
              </span>
            </td>
            <td>
              <div class="report-actions">
                <button 
                  class="btn-action view" 
                  @click="viewReport(report)" 
                  :title="$t(TRANSLATION_KEYS.view) || 'Zobacz'"
                >
                  👁️
                </button>
                <button 
                  class="btn-action download" 
                  @click="downloadReport(report)" 
                  :title="$t(TRANSLATION_KEYS.download) || 'Pobierz'"
                >
                  📥
                </button>
                <button 
                  v-if="report.status === 'COMPLETED'"
                  class="btn-action share" 
                  @click="shareReport(report)" 
                  :title="$t(TRANSLATION_KEYS.share) || 'Udostępnij'"
                >
                  📤
                </button>
                <button 
                  v-if="canEditReport(report)"
                  class="btn-action edit" 
                  @click="editReport(report)" 
                  :title="$t(TRANSLATION_KEYS.edit) || 'Edytuj'"
                >
                  ✏️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="reports.length === 0" class="empty-state">
      <div class="empty-icon">📊</div>
      <h3>{{ $t(TRANSLATION_KEYS.noReports) || 'Brak raportów' }}</h3>
      <p>{{ $t(TRANSLATION_KEYS.noReportsMessage) || 'Nie znaleziono żadnych raportów testów.' }}</p>
      <button class="btn btn-primary" @click="createReport">
        {{ $t(TRANSLATION_KEYS.generateFirstReport) || 'Wygeneruj pierwszy raport' }}
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
  name: 'ReportsTable',
  props: {
    reports: {
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
      ACTIONS_COLUMN_WIDTH: 140, // px
      
      // Date formatting configuration
      DATE_FORMAT_OPTIONS: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      },
      
      // Duration formatting
      DURATION_UNITS: {
        SECONDS: 's',
        MINUTES: 'min',
        HOURS: 'h'
      },
      
      // Permissions configuration
      EDITABLE_STATUSES: ['PENDING', 'FAILED'],
      SHAREABLE_STATUSES: ['COMPLETED'],
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      ACTION_BUTTON_SIZE: 32, // px
      
      // Animation timing
      ROW_HOVER_DURATION: 200, // ms
      BADGE_ANIMATION_DURATION: 150, // ms
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        // Table headers
        id: 'reports.id',
        testName: 'reports.test_name',
        device: 'reports.device',
        date: 'reports.date',
        duration: 'reports.duration',
        result: 'reports.result',
        status: 'reports.status',
        actions: 'reports.actions',
        
        // Actions
        view: 'reports.view',
        download: 'reports.download',
        share: 'reports.share',
        edit: 'reports.edit',
        
        // Status labels
        completed: 'reports.completed',
        pending: 'reports.pending',
        failed: 'reports.failed',
        cancelled: 'reports.cancelled',
        
        // Result labels
        passed: 'reports.passed',
        
        // Empty state
        noReports: 'reports.no_reports',
        noReportsMessage: 'reports.no_reports_message',
        generateFirstReport: 'reports.generate_first_report',
        
        // Loading
        loading: 'global.loading'
      },
      
      // Status and result mappings
      STATUS_LABELS: {
        COMPLETED: 'Ukończone',
        PENDING: 'Oczekujące',
        FAILED: 'Nieudane',
        CANCELLED: 'Anulowane'
      },
      
      RESULT_LABELS: {
        PASSED: 'Zaliczony',
        FAILED: 'Niezaliczony',
        PENDING: 'Oczekujący'
      },
      
      // Row class mappings
      STATUS_ROW_CLASSES: {
        FAILED: 'failed-row',
        PENDING: 'pending-row',
        COMPLETED: 'completed-row'
      }
    }
  },
  methods: {
    getReportRowClass(report) {
      const classes = [];
      
      if (report.result === 'FAILED' && report.status === 'COMPLETED') {
        classes.push('failed-row');
      }
      
      if (report.status === 'PENDING') {
        classes.push('pending-row');
      }
      
      if (report.status === 'COMPLETED' && report.result === 'PASSED') {
        classes.push('completed-row');
      }
      
      return classes;
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
    
    formatDuration(duration) {
      if (!duration || duration === 0) return '0s';
      
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;
      
      if (hours > 0) {
        return `${hours}${this.DURATION_UNITS.HOURS} ${minutes}${this.DURATION_UNITS.MINUTES}`;
      } else if (minutes > 0) {
        return `${minutes}${this.DURATION_UNITS.MINUTES} ${seconds}${this.DURATION_UNITS.SECONDS}`;
      } else {
        return `${seconds}${this.DURATION_UNITS.SECONDS}`;
      }
    },
    
    getStatusLabel(status) {
      if (!status) return '';
      return this.$t(`reports.${status.toLowerCase()}`) || this.STATUS_LABELS[status] || status;
    },
    
    getResultLabel(result) {
      if (!result) return '';
      return this.$t(`reports.${result.toLowerCase()}`) || this.RESULT_LABELS[result] || result;
    },
    
    canEditReport(report) {
      return this.EDITABLE_STATUSES.includes(report.status);
    },
    
    viewReport(report) {
      this.$emit('report-view', report);
    },
    
    downloadReport(report) {
      this.$emit('report-download', report);
    },
    
    shareReport(report) {
      this.$emit('report-share', report);
    },
    
    editReport(report) {
      this.$emit('report-edit', report);
    },
    
    createReport() {
      this.$emit('report-create');
    },
    
    sortReports(column, direction = 'asc') {
      this.$emit('reports-sort', { column, direction });
    }
  }
}
</script>

<style scoped>
.reports-table {
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table-container {
  overflow-x: auto;
}

.reports-table-element {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
}

.reports-table-element th,
.reports-table-element td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.reports-table-element th {
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

.reports-table-element tbody tr {
  transition: background-color 0.2s ease;
}

.reports-table-element tbody tr:hover {
  background: #f8f9fa;
}

.failed-row {
  background: #ffeaea !important;
}

.failed-row:hover {
  background: #ffdddd !important;
}

.pending-row {
  background: #fff3cd !important;
}

.pending-row:hover {
  background: #ffecb3 !important;
}

.completed-row {
  background: #f0f9f0 !important;
}

.completed-row:hover {
  background: #e8f5e8 !important;
}

.report-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.report-title span {
  font-weight: 500;
  color: #2c3e50;
}

.report-title small {
  color: #6c757d;
  font-size: 0.8rem;
  line-height: 1.2;
}

.result-badge,
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.result-badge.passed {
  background: #d4edda;
  color: #155724;
}

.result-badge.failed {
  background: #f8d7da;
  color: #721c24;
}

.result-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.failed {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.cancelled {
  background: #e2e3e5;
  color: #383d41;
}

.report-actions {
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

.btn-action.download:hover {
  background: #d4edda;
  border-color: #c3e6cb;
}

.btn-action.share:hover {
  background: #fff3cd;
  border-color: #ffd60a;
}

.btn-action.edit:hover {
  background: #f8d7da;
  border-color: #f5c6cb;
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
  
  .reports-table-element {
    min-width: 900px;
  }
  
  .reports-table-element th,
  .reports-table-element td {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
  
  .report-title small {
    font-size: 0.75rem;
  }
  
  .result-badge,
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
  .reports-table-element th,
  .reports-table-element td {
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
  .reports-table-element th {
    border-bottom-width: 2px;
  }
  
  .reports-table-element td {
    border-bottom-width: 1px;
  }
  
  .result-badge,
  .status-badge {
    border: 1px solid currentColor;
  }
  
  .btn-action {
    border-width: 2px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .reports-table-element tbody tr,
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

.reports-table-element tbody tr:focus-within {
  background: #e3f2fd;
}

/* Sticky actions column on mobile */
@media (max-width: 600px) {
  .reports-table-element td:last-child,
  .reports-table-element th:last-child {
    position: sticky;
    right: 0;
    background: inherit;
    border-left: 1px solid #e9ecef;
  }
  
  .reports-table-element th:last-child {
    background: #f8f9fa;
  }
}

/* Table sorting indicators */
.reports-table-element th.sortable {
  cursor: pointer;
  position: relative;
  user-select: none;
}

.reports-table-element th.sortable:hover {
  background: #e9ecef;
}

.reports-table-element th.sortable::after {
  content: '↕️';
  position: absolute;
  right: 0.5rem;
  opacity: 0.5;
  font-size: 0.8rem;
}

.reports-table-element th.sortable.asc::after {
  content: '↑';
  opacity: 1;
}

.reports-table-element th.sortable.desc::after {
  content: '↓';
  opacity: 1;
}

/* Performance optimizations */
.reports-table-element {
  contain: layout style;
}

.reports-table-element tbody {
  contain: layout;
}

/* Scroll performance */
.table-container {
  will-change: scroll-position;
}

/* Row hover effects */
.reports-table-element tbody tr {
  position: relative;
}

.reports-table-element tbody tr::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: transparent;
  transition: background-color 0.2s ease;
}

.reports-table-element tbody tr:hover::before {
  background: #007bff;
}

.failed-row::before {
  background: #dc3545 !important;
}

.pending-row::before {
  background: #ffc107 !important;
}

.completed-row::before {
  background: #28a745 !important;
}
</style>
