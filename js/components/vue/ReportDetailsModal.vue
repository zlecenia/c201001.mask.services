<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content report-modal" @click.stop>
      <div class="modal-header">
        <h3>{{ report?.testName || ($t(TRANSLATION_KEYS.reportDetails) || 'Szczegóły raportu') }}</h3>
        <button class="close-btn" @click="closeModal" :title="$t(TRANSLATION_KEYS.close) || 'Zamknij'">×</button>
      </div>

      <div class="modal-body">
        <div class="report-details-full">
          <!-- Basic Information -->
          <div class="detail-section">
            <h4>{{ $t(TRANSLATION_KEYS.basicInfo) || 'Informacje podstawowe' }}</h4>
            <div class="detail-grid">
              <div class="detail-row">
                <label>{{ $t(TRANSLATION_KEYS.reportId) || 'ID raportu' }}:</label>
                <span>{{ report?.id }}</span>
              </div>
              <div class="detail-row">
                <label>{{ $t(TRANSLATION_KEYS.testName) || 'Nazwa testu' }}:</label>
                <span>{{ report?.testName }}</span>
              </div>
              <div class="detail-row">
                <label>{{ $t(TRANSLATION_KEYS.testType) || 'Typ testu' }}:</label>
                <span>{{ report?.testType }}</span>
              </div>
              <div class="detail-row">
                <label>{{ $t(TRANSLATION_KEYS.device) || 'Urządzenie' }}:</label>
                <span>{{ report?.deviceName }}</span>
              </div>
              <div class="detail-row">
                <label>{{ $t(TRANSLATION_KEYS.operator) || 'Operator' }}:</label>
                <span>{{ report?.operator }}</span>
              </div>
              <div class="detail-row">
                <label>{{ $t(TRANSLATION_KEYS.createdAt) || 'Data utworzenia' }}:</label>
                <span>{{ formatDateTime(report?.createdAt) }}</span>
              </div>
              <div class="detail-row">
                <label>{{ $t(TRANSLATION_KEYS.duration) || 'Czas trwania' }}:</label>
                <span>{{ formatDuration(report?.duration) }}</span>
              </div>
            </div>
          </div>

          <!-- Test Results -->
          <div class="detail-section">
            <h4>{{ $t(TRANSLATION_KEYS.testResults) || 'Wyniki testów' }}</h4>
            <div class="test-results">
              <div class="result-summary">
                <span :class="['result-badge', 'large', report?.result?.toLowerCase()]">
                  {{ getResultLabel(report?.result) }}
                </span>
                <span :class="['status-badge', 'large', report?.status?.toLowerCase()]">
                  {{ getStatusLabel(report?.status) }}
                </span>
              </div>
              
              <div v-if="report?.measurements?.length" class="measurements-list">
                <div 
                  v-for="measurement in report.measurements" 
                  :key="measurement.parameter"
                  class="measurement-item"
                >
                  <div class="measurement-info">
                    <span class="measurement-parameter">{{ measurement.parameter }}</span>
                    <span class="measurement-value">
                      {{ measurement.value }} {{ measurement.unit }}
                    </span>
                  </div>
                  <span :class="['measurement-status', measurement.status?.toLowerCase()]">
                    {{ getStatusLabel(measurement.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Technical Details -->
          <div v-if="report?.technicalDetails" class="detail-section">
            <h4>{{ $t(TRANSLATION_KEYS.technicalDetails) || 'Szczegóły techniczne' }}</h4>
            <div class="technical-details">
              <div v-for="(value, key) in report.technicalDetails" :key="key" class="detail-row">
                <label>{{ formatTechnicalLabel(key) }}:</label>
                <span>{{ value }}</span>
              </div>
            </div>
          </div>

          <!-- Environmental Conditions -->
          <div v-if="report?.environmentalConditions" class="detail-section">
            <h4>{{ $t(TRANSLATION_KEYS.environmentalConditions) || 'Warunki środowiskowe' }}</h4>
            <div class="environmental-grid">
              <div class="environmental-item">
                <span class="env-label">{{ $t(TRANSLATION_KEYS.temperature) || 'Temperatura' }}:</span>
                <span class="env-value">{{ report.environmentalConditions.temperature }}°C</span>
              </div>
              <div class="environmental-item">
                <span class="env-label">{{ $t(TRANSLATION_KEYS.humidity) || 'Wilgotność' }}:</span>
                <span class="env-value">{{ report.environmentalConditions.humidity }}%</span>
              </div>
              <div class="environmental-item">
                <span class="env-label">{{ $t(TRANSLATION_KEYS.pressure) || 'Ciśnienie' }}:</span>
                <span class="env-value">{{ report.environmentalConditions.pressure }} hPa</span>
              </div>
            </div>
          </div>

          <!-- Notes and Comments -->
          <div v-if="report?.notes" class="detail-section">
            <h4>{{ $t(TRANSLATION_KEYS.notesComments) || 'Notatki i komentarze' }}</h4>
            <div class="notes-content">
              {{ report.notes }}
            </div>
          </div>

          <!-- Attachments -->
          <div v-if="report?.attachments?.length" class="detail-section">
            <h4>{{ $t(TRANSLATION_KEYS.attachments) || 'Załączniki' }}</h4>
            <div class="attachments-list">
              <div 
                v-for="attachment in report.attachments" 
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
        <button class="btn btn-primary" @click="downloadReport">
          {{ $t(TRANSLATION_KEYS.download) || 'Pobierz' }}
        </button>
        <button 
          v-if="report?.status === 'COMPLETED'"
          class="btn btn-info" 
          @click="shareReport"
        >
          {{ $t(TRANSLATION_KEYS.share) || 'Udostępnij' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportDetailsModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    report: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Modal configuration
      MODAL_MAX_WIDTH: 700, // px
      MODAL_MAX_HEIGHT: '90vh',
      MODAL_ANIMATION_DURATION: 300, // ms
      
      // Date/time formatting
      DATE_TIME_FORMAT_OPTIONS: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      },
      
      // Duration formatting
      DURATION_UNITS: {
        SECONDS: 's',
        MINUTES: 'min',
        HOURS: 'h'
      },
      
      // Environmental conditions ranges
      ENVIRONMENTAL_RANGES: {
        temperature: { min: 15, max: 35, unit: '°C' },
        humidity: { min: 30, max: 70, unit: '%' },
        pressure: { min: 900, max: 1100, unit: 'hPa' }
      },
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      BUTTON_MIN_HEIGHT: 40, // px
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        // Modal header
        reportDetails: 'reports.report_details',
        close: 'common.close',
        
        // Sections
        basicInfo: 'reports.basic_info',
        testResults: 'reports.test_results',
        technicalDetails: 'reports.technical_details',
        environmentalConditions: 'reports.environmental_conditions',
        notesComments: 'reports.notes_comments',
        attachments: 'reports.attachments',
        
        // Basic info fields
        reportId: 'reports.report_id',
        testName: 'reports.test_name',
        testType: 'reports.test_type',
        device: 'reports.device',
        operator: 'reports.operator',
        createdAt: 'reports.created_at',
        duration: 'reports.duration',
        
        // Environmental conditions
        temperature: 'reports.temperature',
        humidity: 'reports.humidity',
        pressure: 'reports.pressure',
        
        // Actions
        download: 'reports.download',
        share: 'reports.share',
        
        // Status labels
        completed: 'reports.completed',
        pending: 'reports.pending',
        failed: 'reports.failed',
        
        // Result labels
        passed: 'reports.passed'
      },
      
      // Status and result mappings
      STATUS_LABELS: {
        COMPLETED: 'Ukończony',
        PENDING: 'Oczekujący',
        FAILED: 'Nieudany',
        CANCELLED: 'Anulowany',
        PASSED: 'Zaliczony'
      },
      
      RESULT_LABELS: {
        PASSED: 'Zaliczony',
        FAILED: 'Niezaliczony',
        PENDING: 'Oczekujący'
      },
      
      // Technical label mappings
      TECHNICAL_LABEL_MAP: {
        sensorCalibration: 'Kalibracja czujników',
        measurementAccuracy: 'Dokładność pomiaru',
        systemVersion: 'Wersja systemu',
        deviceSerial: 'Numer seryjny urządzenia',
        testStandard: 'Standard testowania',
        qualityLevel: 'Poziom jakości'
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
    
    downloadReport() {
      this.$emit('download', this.report);
    },
    
    shareReport() {
      this.$emit('share', this.report);
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
    
    formatTechnicalLabel(key) {
      return this.TECHNICAL_LABEL_MAP[key] || key.replace(/([A-Z])/g, ' $1').toLowerCase();
    },
    
    downloadAttachment(attachment) {
      this.$emit('attachment-download', attachment);
    },
    
    handleEscapeKey(event) {
      if (event.key === 'Escape') {
        this.closeModal();
      }
    },
    
    isEnvironmentalValueNormal(type, value) {
      const range = this.ENVIRONMENTAL_RANGES[type];
      if (!range || !value) return true;
      
      const numValue = parseFloat(value);
      return numValue >= range.min && numValue <= range.max;
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
  max-width: 700px;
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

.report-details-full {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-section {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1.5rem;
  background: #fefefe;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.detail-grid {
  display: grid;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 24px;
}

.detail-row label {
  font-weight: 600;
  color: #495057;
  min-width: 140px;
}

.detail-row span {
  flex: 1;
  color: #2c3e50;
  text-align: right;
}

.result-summary {
  text-align: center;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.result-badge,
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
}

.result-badge.large,
.status-badge.large {
  padding: 0.5rem 1rem;
  font-size: 1rem;
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

.measurements-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.measurement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #e9ecef;
}

.measurement-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.measurement-parameter {
  font-weight: 600;
  color: #2c3e50;
}

.measurement-value {
  color: #495057;
  font-family: monospace;
  font-size: 0.9rem;
}

.measurement-status {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
}

.measurement-status.passed {
  background: #d4edda;
  color: #155724;
}

.measurement-status.failed {
  background: #f8d7da;
  color: #721c24;
}

.technical-details {
  display: grid;
  gap: 0.5rem;
}

.environmental-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.environmental-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  text-align: center;
}

.env-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
}

.env-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
  font-family: monospace;
}

.notes-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #007bff;
  white-space: pre-wrap;
  line-height: 1.5;
  font-style: italic;
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

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #117a8b;
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
  
  .detail-section {
    padding: 1rem;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .detail-row label {
    min-width: auto;
    font-size: 0.9rem;
  }
  
  .detail-row span {
    text-align: left;
  }
  
  .result-summary {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .environmental-grid {
    grid-template-columns: 1fr;
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
  
  .detail-section {
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
  
  .detail-section {
    border-width: 2px;
  }
  
  .result-badge,
  .status-badge,
  .measurement-status {
    border: 1px solid currentColor;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .modal-content,
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

/* Environmental value status indicators */
.env-value.warning {
  color: #f57c00;
}

.env-value.danger {
  color: #dc3545;
}

.environmental-item.warning {
  border-left: 4px solid #ffc107;
}

.environmental-item.danger {
  border-left: 4px solid #dc3545;
}

/* Print styles */
@media print {
  .modal-overlay {
    position: static;
    background: none;
    padding: 0;
  }
  
  .modal-header,
  .modal-footer {
    display: none;
  }
  
  .modal-content {
    box-shadow: none;
    max-height: none;
    overflow: visible;
  }
  
  .detail-section {
    break-inside: avoid;
  }
}
</style>
