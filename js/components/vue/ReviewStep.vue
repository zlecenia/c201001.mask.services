<template>
  <div class="review-step">
    <h3>{{ $t(TRANSLATION_KEYS.reviewConfiguration) || 'Przegląd konfiguracji' }}</h3>
    <div class="review-summary">
      <!-- Test Details Section -->
      <div class="summary-section">
        <h4>{{ $t(TRANSLATION_KEYS.testDetails) || 'Szczegóły testu' }}</h4>
        <div class="summary-item">
          <span class="summary-label">{{ $t(TRANSLATION_KEYS.testType) || 'Typ testu' }}:</span>
          <span class="summary-value">{{ getTestTypeName(testType) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">{{ $t(TRANSLATION_KEYS.device) || 'Urządzenie' }}:</span>
          <span class="summary-value">{{ getDeviceName(deviceId) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">{{ $t(TRANSLATION_KEYS.estimatedDuration) || 'Szacowany czas' }}:</span>
          <span class="summary-value">{{ getEstimatedDuration() }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">{{ $t(TRANSLATION_KEYS.startTime) || 'Czas rozpoczęcia' }}:</span>
          <span class="summary-value">{{ formatCurrentTime() }}</span>
        </div>
      </div>

      <!-- Parameters Section -->
      <div class="summary-section">
        <h4>{{ $t(TRANSLATION_KEYS.parameters) || 'Parametry' }}</h4>
        <div 
          v-for="(value, key) in parameters" 
          :key="key"
          class="parameter-summary"
        >
          <span class="param-name">{{ getParameterLabel(key) }}:</span>
          <span class="param-value">{{ value }} {{ getParameterUnit(key) }}</span>
        </div>
      </div>

      <!-- Safety Information -->
      <div class="summary-section safety-section">
        <h4>{{ $t(TRANSLATION_KEYS.safetyInfo) || 'Informacje bezpieczeństwa' }}</h4>
        <div class="safety-warnings">
          <div class="safety-item">
            <span class="safety-icon">⚠️</span>
            <span class="safety-text">{{ $t(TRANSLATION_KEYS.safetyWarning1) || 'Upewnij się, że maska jest prawidłowo założona' }}</span>
          </div>
          <div class="safety-item">
            <span class="safety-icon">🔒</span>
            <span class="safety-text">{{ $t(TRANSLATION_KEYS.safetyWarning2) || 'Nie przeszkadzaj w trakcie testu' }}</span>
          </div>
          <div class="safety-item">
            <span class="safety-icon">📋</span>
            <span class="safety-text">{{ $t(TRANSLATION_KEYS.safetyWarning3) || 'Zapisz wyniki po zakończeniu testu' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Section -->
    <div class="confirmation-section">
      <div class="confirmation-checkbox">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="confirmed"
            @change="updateConfirmation($event.target.checked)"
            class="checkbox-input"
          />
          <span class="checkmark"></span>
          <span class="checkbox-text">
            {{ $t(TRANSLATION_KEYS.confirmStart) || 'Potwierdzam rozpoczęcie testu z podanymi parametrami' }}
          </span>
        </label>
      </div>
      
      <!-- Additional confirmations based on test type -->
      <div v-if="requiresAdditionalConfirmation" class="additional-confirmations">
        <div class="confirmation-checkbox">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              :checked="safetyConfirmed"
              @change="updateSafetyConfirmation($event.target.checked)"
              class="checkbox-input"
            />
            <span class="checkmark"></span>
            <span class="checkbox-text">
              {{ $t(TRANSLATION_KEYS.safetyConfirm) || 'Potwierdzam zapoznanie się z procedurami bezpieczeństwa' }}
            </span>
          </label>
        </div>
      </div>
    </div>

    <!-- Test Preview -->
    <div v-if="confirmed" class="test-preview">
      <div class="preview-timeline">
        <h4>{{ $t(TRANSLATION_KEYS.testTimeline) || 'Harmonogram testu' }}</h4>
        <div class="timeline-steps">
          <div 
            v-for="(step, index) in testSteps" 
            :key="step.id"
            class="timeline-step"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-info">
              <div class="step-name">{{ $t(step.nameKey) || step.name }}</div>
              <div class="step-duration">{{ step.duration }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReviewStep',
  props: {
    testType: {
      type: String,
      required: true
    },
    deviceId: {
      type: String,
      required: true
    },
    parameters: {
      type: Object,
      default: () => ({})
    },
    confirmed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Time formatting configuration
      TIME_FORMAT_OPTIONS: {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      },
      
      // Duration calculation
      BASE_TEST_DURATION: 180, // seconds
      PREPARATION_TIME: 30, // seconds
      CLEANUP_TIME: 60, // seconds
      
      // UI configuration
      TIMELINE_ANIMATION_DELAY: 100, // ms between step animations
      CONFIRMATION_ANIMATION_DURATION: 200, // ms
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      CHECKBOX_SIZE: 20, // px
      
      // Component state
      safetyConfirmed: false,
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        reviewConfiguration: 'wizard.review_configuration',
        testDetails: 'wizard.test_details',
        testType: 'wizard.test_type',
        device: 'wizard.device',
        parameters: 'wizard.parameters',
        estimatedDuration: 'wizard.estimated_duration',
        startTime: 'wizard.start_time',
        confirmStart: 'wizard.confirm_start',
        safetyInfo: 'wizard.safety_info',
        safetyWarning1: 'wizard.safety_warning_1',
        safetyWarning2: 'wizard.safety_warning_2',
        safetyWarning3: 'wizard.safety_warning_3',
        safetyConfirm: 'wizard.safety_confirm',
        testTimeline: 'wizard.test_timeline',
        
        // Test types
        leakTest: 'tests.leak_test',
        filtrationTest: 'tests.filtration_test',
        pressureTest: 'tests.pressure_test',
        flowTest: 'tests.flow_test',
        
        // Parameters
        testPressure: 'parameters.test_pressure',
        flowRate: 'parameters.flow_rate',
        testDuration: 'parameters.test_duration',
        qualityLevel: 'parameters.quality_level',
        
        // Units
        unitPressure: 'units.kpa',
        unitFlow: 'units.lpm',
        unitTime: 'units.seconds',
        
        // Test steps
        preparation: 'test_steps.preparation',
        calibration: 'test_steps.calibration',
        testing: 'test_steps.testing',
        analysis: 'test_steps.analysis',
        cleanup: 'test_steps.cleanup'
      },
      
      // Test type definitions
      TEST_TYPE_DEFINITIONS: {
        leak_test: {
          nameKey: 'tests.leak_test',
          name: 'Test szczelności',
          estimatedDuration: '3-5 min'
        },
        filtration_test: {
          nameKey: 'tests.filtration_test',
          name: 'Test filtracji',
          estimatedDuration: '5-8 min'
        },
        pressure_test: {
          nameKey: 'tests.pressure_test',
          name: 'Test ciśnieniowy',
          estimatedDuration: '2-4 min'
        },
        flow_test: {
          nameKey: 'tests.flow_test',
          name: 'Test przepływu',
          estimatedDuration: '4-6 min'
        }
      },
      
      // Device definitions (simplified for display)
      DEVICE_DEFINITIONS: {
        masktronic_c20_001: 'MASKTRONIC C20-001',
        masktronic_c20_002: 'MASKTRONIC C20-002', 
        masktronic_c20_003: 'MASKTRONIC C20-003',
        masktronic_c20_004: 'MASKTRONIC C20-004'
      },
      
      // Parameter definitions
      PARAMETER_DEFINITIONS: {
        testPressure: { labelKey: 'parameters.test_pressure', label: 'Ciśnienie testowe', unit: 'kPa' },
        flowRate: { labelKey: 'parameters.flow_rate', label: 'Przepływ', unit: 'L/min' },
        testDuration: { labelKey: 'parameters.test_duration', label: 'Czas testu', unit: 's' },
        qualityLevel: { labelKey: 'parameters.quality_level', label: 'Poziom jakości', unit: '' }
      }
    }
  },
  computed: {
    requiresAdditionalConfirmation() {
      // Some test types require additional safety confirmation
      return ['pressure_test', 'filtration_test'].includes(this.testType);
    },
    
    testSteps() {
      return [
        {
          id: 'preparation',
          nameKey: this.TRANSLATION_KEYS.preparation,
          name: 'Przygotowanie',
          duration: '30s'
        },
        {
          id: 'calibration',
          nameKey: this.TRANSLATION_KEYS.calibration,
          name: 'Kalibracja',
          duration: '45s'
        },
        {
          id: 'testing',
          nameKey: this.TRANSLATION_KEYS.testing,
          name: 'Wykonanie testu',
          duration: this.getTestDuration()
        },
        {
          id: 'analysis',
          nameKey: this.TRANSLATION_KEYS.analysis,
          name: 'Analiza wyników',
          duration: '30s'
        },
        {
          id: 'cleanup',
          nameKey: this.TRANSLATION_KEYS.cleanup,
          name: 'Zakończenie',
          duration: '15s'
        }
      ];
    },
    
    allConfirmed() {
      return this.confirmed && (!this.requiresAdditionalConfirmation || this.safetyConfirmed);
    }
  },
  methods: {
    getTestTypeName(testType) {
      const definition = this.TEST_TYPE_DEFINITIONS[testType];
      return definition ? (this.$t(definition.nameKey) || definition.name) : testType;
    },
    
    getDeviceName(deviceId) {
      return this.DEVICE_DEFINITIONS[deviceId] || deviceId;
    },
    
    getEstimatedDuration() {
      const definition = this.TEST_TYPE_DEFINITIONS[this.testType];
      return definition ? definition.estimatedDuration : '5-10 min';
    },
    
    getTestDuration() {
      return this.parameters.testDuration ? `${this.parameters.testDuration}s` : '180s';
    },
    
    formatCurrentTime() {
      return new Date().toLocaleTimeString('pl-PL', this.TIME_FORMAT_OPTIONS);
    },
    
    getParameterLabel(parameterKey) {
      const definition = this.PARAMETER_DEFINITIONS[parameterKey];
      return definition ? (this.$t(definition.labelKey) || definition.label) : parameterKey;
    },
    
    getParameterUnit(parameterKey) {
      const definition = this.PARAMETER_DEFINITIONS[parameterKey];
      return definition ? definition.unit : '';
    },
    
    updateConfirmation(confirmed) {
      this.$emit('confirmation-changed', { confirmed, safetyConfirmed: this.safetyConfirmed });
    },
    
    updateSafetyConfirmation(safetyConfirmed) {
      this.safetyConfirmed = safetyConfirmed;
      this.$emit('confirmation-changed', { confirmed: this.confirmed, safetyConfirmed });
    }
  },
  
  watch: {
    allConfirmed(newValue) {
      this.$emit('all-confirmed', newValue);
    }
  }
}
</script>

<style scoped>
.review-step h3 {
  margin: 0 0 2rem 0;
  color: #2c3e50;
  text-align: center;
  font-size: 1.5rem;
}

.review-summary {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-bottom: 2rem;
}

.summary-section {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}

.summary-section h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
  font-size: 1.1rem;
}

.summary-item,
.parameter-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.summary-item:last-child,
.parameter-summary:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.summary-label,
.param-name {
  color: #6c757d;
  font-weight: 600;
  flex: 1;
}

.summary-value,
.param-value {
  color: #2c3e50;
  font-weight: 600;
  text-align: right;
}

.safety-section {
  border-color: #ffc107;
  background: linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%);
}

.safety-warnings {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.safety-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.safety-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.safety-text {
  color: #856404;
  font-weight: 500;
  line-height: 1.4;
}

.confirmation-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 2px solid #e9ecef;
  margin-bottom: 2rem;
}

.additional-confirmations {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.confirmation-checkbox {
  margin-bottom: 1rem;
}

.confirmation-checkbox:last-child {
  margin-bottom: 0;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: #2c3e50;
  line-height: 1.4;
  min-height: 44px; /* Touch target */
  align-items: center;
}

.checkbox-input {
  opacity: 0;
  position: absolute;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ced4da;
  border-radius: 4px;
  flex-shrink: 0;
  position: relative;
  transition: all 0.2s;
  background: white;
}

.checkbox-input:checked + .checkmark {
  background: #007bff;
  border-color: #007bff;
}

.checkbox-input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.checkbox-input:focus + .checkmark {
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
}

.checkbox-text {
  flex: 1;
}

.test-preview {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  animation: slideIn 0.3s ease-out;
}

.preview-timeline h4 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  text-align: center;
}

.timeline-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  animation: stepSlideIn 0.3s ease-out;
}

.timeline-step:nth-child(1) { animation-delay: 0.1s; }
.timeline-step:nth-child(2) { animation-delay: 0.2s; }
.timeline-step:nth-child(3) { animation-delay: 0.3s; }
.timeline-step:nth-child(4) { animation-delay: 0.4s; }
.timeline-step:nth-child(5) { animation-delay: 0.5s; }

.step-number {
  width: 30px;
  height: 30px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-info {
  flex: 1;
}

.step-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.step-duration {
  color: #6c757d;
  font-size: 0.9rem;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .review-summary {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .summary-section {
    padding: 1rem;
  }
  
  .review-step h3 {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
  }
  
  .summary-item,
  .parameter-summary {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .summary-value,
  .param-value {
    text-align: left;
    font-size: 1.1rem;
    color: #007bff;
  }
  
  .confirmation-section {
    padding: 1rem;
  }
  
  .timeline-steps {
    gap: 0.75rem;
  }
  
  .timeline-step {
    padding: 0.5rem;
  }
}

/* Very small screens */
@media (max-width: 350px) {
  .summary-section {
    padding: 0.75rem;
  }
  
  .confirmation-section {
    padding: 0.75rem;
  }
  
  .safety-item {
    gap: 0.5rem;
  }
  
  .checkbox-label {
    gap: 0.5rem;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes stepSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .checkmark {
    border-width: 3px;
  }
  
  .summary-section {
    border-width: 2px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .test-preview,
  .timeline-step {
    animation: none;
  }
  
  .checkmark {
    transition: none;
  }
}

/* Touch enhancements */
.checkbox-label:active .checkmark {
  transform: scale(0.95);
}

/* Focus styles for accessibility */
.checkbox-label:focus-within {
  outline: 2px solid #007bff;
  outline-offset: 2px;
  border-radius: 4px;
}
</style>
