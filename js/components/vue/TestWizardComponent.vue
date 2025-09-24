<template>
  <div class="test-wizard">
    <div class="wizard-header">
      <h2>🧙‍♂️ {{ $t('wizard.test_wizard') || 'Kreator testów' }}</h2>
      <div class="wizard-progress">
        <div class="progress-steps">
          <div 
            v-for="(step, index) in wizardSteps" 
            :key="step.id"
            :class="['step', { 
              active: currentStep === index, 
              completed: index < currentStep,
              disabled: index > currentStep 
            }]"
            @click="goToStep(index)"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-title">{{ $t(step.titleKey) || step.title }}</div>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="wizard-content">
      <!-- Step 1: Test Type Selection -->
      <div v-if="currentStep === 0" class="wizard-step step-test-type">
        <h3>{{ $t('wizard.select_test_type') || 'Wybierz typ testu' }}</h3>
        <div class="test-types-grid">
          <div 
            v-for="testType in availableTestTypes" 
            :key="testType.id"
            :class="['test-type-card', { selected: wizardData.testType === testType.id }]"
            @click="selectTestType(testType.id)"
          >
            <div class="test-type-icon">{{ testType.icon }}</div>
            <div class="test-type-name">{{ $t(testType.nameKey) || testType.name }}</div>
            <div class="test-type-description">{{ $t(testType.descKey) || testType.description }}</div>
            <div class="test-type-duration">⏱️ {{ testType.estimatedDuration }}</div>
          </div>
        </div>
      </div>

      <!-- Step 2: Device Selection -->
      <div v-if="currentStep === 1" class="wizard-step step-device">
        <h3>{{ $t('wizard.select_device') || 'Wybierz urządzenie' }}</h3>
        <div class="devices-list">
          <div 
            v-for="device in availableDevices" 
            :key="device.id"
            :class="['device-card', { 
              selected: wizardData.deviceId === device.id,
              unavailable: !device.available 
            }]"
            @click="selectDevice(device.id)"
          >
            <div class="device-status" :class="device.status.toLowerCase()"></div>
            <div class="device-info">
              <div class="device-name">{{ device.name }}</div>
              <div class="device-model">{{ device.model }}</div>
              <div class="device-location">📍 {{ device.location }}</div>
            </div>
            <div class="device-stats">
              <div class="stat">
                <span class="stat-label">{{ $t('wizard.last_calibration') || 'Ostatnia kalibracja' }}:</span>
                <span class="stat-value">{{ formatDate(device.lastCalibration) }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">{{ $t('wizard.tests_today') || 'Testy dzisiaj' }}:</span>
                <span class="stat-value">{{ device.testsToday }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Test Parameters -->
      <div v-if="currentStep === 2" class="wizard-step step-parameters">
        <h3>{{ $t('wizard.configure_parameters') || 'Konfiguruj parametry' }}</h3>
        <div class="parameters-form">
          <div class="parameter-groups">
            <div 
              v-for="group in testParameters" 
              :key="group.name"
              class="parameter-group"
            >
              <h4>{{ $t(group.titleKey) || group.title }}</h4>
              <div class="parameters-grid">
                <div 
                  v-for="param in group.parameters" 
                  :key="param.name"
                  class="parameter-item"
                >
                  <label>{{ $t(param.labelKey) || param.label }}:</label>
                  <div class="parameter-input">
                    <input 
                      v-if="param.type === 'number'"
                      type="number" 
                      v-model="wizardData.parameters[param.name]"
                      :min="param.min"
                      :max="param.max"
                      :step="param.step"
                    >
                    <select 
                      v-else-if="param.type === 'select'"
                      v-model="wizardData.parameters[param.name]"
                    >
                      <option 
                        v-for="option in param.options" 
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ $t(option.labelKey) || option.label }}
                      </option>
                    </select>
                    <input 
                      v-else
                      type="text" 
                      v-model="wizardData.parameters[param.name]"
                    >
                    <span class="parameter-unit">{{ param.unit }}</span>
                  </div>
                  <div class="parameter-help">{{ $t(param.helpKey) || param.help }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Review & Confirm -->
      <div v-if="currentStep === 3" class="wizard-step step-review">
        <h3>{{ $t('wizard.review_configuration') || 'Przegląd konfiguracji' }}</h3>
        <div class="review-summary">
          <div class="summary-section">
            <h4>{{ $t('wizard.test_details') || 'Szczegóły testu' }}</h4>
            <div class="summary-item">
              <span class="summary-label">{{ $t('wizard.test_type') || 'Typ testu' }}:</span>
              <span class="summary-value">{{ getTestTypeName(wizardData.testType) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">{{ $t('wizard.device') || 'Urządzenie' }}:</span>
              <span class="summary-value">{{ getDeviceName(wizardData.deviceId) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">{{ $t('wizard.estimated_duration') || 'Szacowany czas' }}:</span>
              <span class="summary-value">{{ getEstimatedDuration() }}</span>
            </div>
          </div>

          <div class="summary-section">
            <h4>{{ $t('wizard.parameters') || 'Parametry' }}</h4>
            <div class="parameters-summary">
              <div 
                v-for="(value, key) in wizardData.parameters" 
                :key="key"
                class="parameter-summary"
              >
                <span class="param-name">{{ getParameterLabel(key) }}:</span>
                <span class="param-value">{{ value }} {{ getParameterUnit(key) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="confirmation-section">
          <div class="confirmation-checkbox">
            <label>
              <input type="checkbox" v-model="wizardData.confirmed">
              {{ $t('wizard.confirm_start') || 'Potwierdzam rozpoczęcie testu z podanymi parametrami' }}
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="wizard-navigation">
      <button 
        class="btn btn-secondary" 
        @click="previousStep" 
        :disabled="currentStep === 0"
      >
        ⬅️ {{ $t('wizard.previous') || 'Poprzedni' }}
      </button>
      
      <button 
        v-if="currentStep < wizardSteps.length - 1"
        class="btn btn-primary" 
        @click="nextStep" 
        :disabled="!canProceed"
      >
        {{ $t('wizard.next') || 'Następny' }} ➡️
      </button>
      
      <button 
        v-else
        class="btn btn-success" 
        @click="startTest" 
        :disabled="!wizardData.confirmed"
      >
        🚀 {{ $t('wizard.start_test') || 'Rozpocznij test' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestWizardComponent',
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Wizard configuration
      TOTAL_STEPS: 4,
      INITIAL_STEP: 0,
      PROGRESS_STEP_WIDTH: 25, // 100% / 4 steps = 25%
      
      // Test configuration
      MIN_TEST_DURATION: 60000, // 1 minute in ms
      MAX_TEST_DURATION: 3600000, // 1 hour in ms
      DEFAULT_PARAMETER_VALUES: {
        pressure: 50,
        flow: 30,
        duration: 180
      },
      
      // Animation and UI timing
      STEP_TRANSITION_DURATION: 300,
      BUTTON_HOVER_TRANSFORM: 1, // px
      
      // Mobile breakpoints (for 400x1280 display)
      MOBILE_BREAKPOINT: 450, // px
      TOUCH_TARGET_MIN_SIZE: 44, // px
      
      // Component state variables
      currentStep: 0,
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        // Wizard section translations
        testWizard: 'wizard.test_wizard',
        selectTestType: 'wizard.select_test_type',
        selectDevice: 'wizard.select_device',
        configureParameters: 'wizard.configure_parameters',
        reviewConfiguration: 'wizard.review_configuration',
        testDetails: 'wizard.test_details',
        testType: 'wizard.test_type',
        device: 'wizard.device',
        parameters: 'wizard.parameters',
        review: 'wizard.review',
        lastCalibration: 'wizard.last_calibration',
        testsToday: 'wizard.tests_today',
        confirmStart: 'wizard.confirm_start',
        startTest: 'wizard.start_test',
        
        // Test types translations
        leakTest: 'tests.leak_test',
        leakTestDesc: 'tests.leak_test_desc',
        filtrationTest: 'tests.filtration_test',
        filtrationTestDesc: 'tests.filtration_test_desc',
        pressureTest: 'tests.pressure_test',
        pressureTestDesc: 'tests.pressure_test_desc',
        
        // Global translations
        next: 'global.next',
        back: 'global.back',
        cancel: 'global.cancel',
        loading: 'global.loading',
        error: 'global.error',
        success: 'global.success',
        warning: 'global.warning'
      },
      
      // Wizard steps configuration
      wizardSteps: [
        { id: 'type', titleKey: 'wizard.test_type', title: 'Typ testu' },
        { id: 'device', titleKey: 'wizard.device', title: 'Urządzenie' },
        { id: 'parameters', titleKey: 'wizard.parameters', title: 'Parametry' },
        { id: 'review', titleKey: 'wizard.review', title: 'Przegląd' }
      ],
      wizardData: {
        testType: null,
        deviceId: null,
        parameters: {},
        confirmed: false
      },
      availableTestTypes: [
        {
          id: 'leak_test',
          nameKey: 'tests.leak_test',
          name: 'Test szczelności',
          descKey: 'tests.leak_test_desc',
          description: 'Sprawdzenie szczelności maski przeciwgazowej',
          icon: '💨',
          estimatedDuration: '3-5 min'
        },
        {
          id: 'filtration_test',
          nameKey: 'tests.filtration_test',
          name: 'Test filtracji',
          descKey: 'tests.filtration_test_desc',
          description: 'Ocena skuteczności filtracji powietrza',
          icon: '🔬',
          estimatedDuration: '5-8 min'
        },
        {
          id: 'fit_test',
          nameKey: 'tests.fit_test',
          name: 'Test dopasowania',
          descKey: 'tests.fit_test_desc',
          description: 'Sprawdzenie dopasowania maski do twarzy',
          icon: '👤',
          estimatedDuration: '2-4 min'
        },
        {
          id: 'pressure_test',
          nameKey: 'tests.pressure_test',
          name: 'Test ciśnieniowy',
          descKey: 'tests.pressure_test_desc',
          description: 'Pomiar odporności na różnice ciśnień',
          icon: '⚡',
          estimatedDuration: '4-6 min'
        }
      ],
      availableDevices: [
        {
          id: 'device_001',
          name: 'MASKTRONIC C20-001',
          model: 'C20 Professional',
          location: 'Laboratorium A',
          status: 'READY',
          available: true,
          lastCalibration: '2025-01-20',
          testsToday: 12
        },
        {
          id: 'device_002',
          name: 'MASKTRONIC C20-002',
          model: 'C20 Professional',
          location: 'Laboratorium B',
          status: 'BUSY',
          available: false,
          lastCalibration: '2025-01-19',
          testsToday: 8
        }
      ]
    }
  },
  computed: {
    progressPercentage() {
      return ((this.currentStep + 1) / this.wizardSteps.length) * 100;
    },
    
    canProceed() {
      switch (this.currentStep) {
        case 0: return this.wizardData.testType !== null;
        case 1: return this.wizardData.deviceId !== null;
        case 2: return this.hasRequiredParameters();
        case 3: return this.wizardData.confirmed;
        default: return false;
      }
    },
    
    testParameters() {
      const testType = this.availableTestTypes.find(t => t.id === this.wizardData.testType);
      if (!testType) return [];
      
      // Return parameters based on test type
      if (testType.id === 'leak_test') {
        return [
          {
            name: 'basic',
            titleKey: 'wizard.basic_parameters',
            title: 'Parametry podstawowe',
            parameters: [
              {
                name: 'pressure',
                labelKey: 'wizard.test_pressure',
                label: 'Ciśnienie testowe',
                type: 'number',
                min: 50,
                max: 500,
                step: 10,
                unit: 'Pa',
                help: 'Ciśnienie stosowane podczas testu szczelności',
                helpKey: 'wizard.pressure_help'
              },
              {
                name: 'duration',
                labelKey: 'wizard.test_duration',
                label: 'Czas trwania',
                type: 'select',
                options: [
                  { value: 60, labelKey: 'wizard.1min', label: '1 minuta' },
                  { value: 120, labelKey: 'wizard.2min', label: '2 minuty' },
                  { value: 300, labelKey: 'wizard.5min', label: '5 minut' }
                ],
                help: 'Czas trwania testu',
                helpKey: 'wizard.duration_help'
              }
            ]
          }
        ];
      }
      
      return [];
    }
  },
  methods: {
    goToStep(stepIndex) {
      if (stepIndex <= this.currentStep || this.canProceed) {
        this.currentStep = stepIndex;
      }
    },
    
    nextStep() {
      if (this.canProceed && this.currentStep < this.wizardSteps.length - 1) {
        this.currentStep++;
      }
    },
    
    previousStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
      }
    },
    
    selectTestType(testTypeId) {
      this.wizardData.testType = testTypeId;
      this.wizardData.parameters = {};
    },
    
    selectDevice(deviceId) {
      const device = this.availableDevices.find(d => d.id === deviceId);
      if (device && device.available) {
        this.wizardData.deviceId = deviceId;
      }
    },
    
    hasRequiredParameters() {
      return Object.keys(this.wizardData.parameters).length > 0;
    },
    
    getTestTypeName(testTypeId) {
      const testType = this.availableTestTypes.find(t => t.id === testTypeId);
      return testType ? (this.$t(testType.nameKey) || testType.name) : '';
    },
    
    getDeviceName(deviceId) {
      const device = this.availableDevices.find(d => d.id === deviceId);
      return device ? device.name : '';
    },
    
    getEstimatedDuration() {
      const testType = this.availableTestTypes.find(t => t.id === this.wizardData.testType);
      return testType ? testType.estimatedDuration : '';
    },
    
    getParameterLabel(paramKey) {
      // Find parameter definition and return translated label
      for (const group of this.testParameters) {
        for (const param of group.parameters) {
          if (param.name === paramKey) {
            return this.$t(param.labelKey) || param.label;
          }
        }
      }
      return paramKey;
    },
    
    getParameterUnit(paramKey) {
      for (const group of this.testParameters) {
        for (const param of group.parameters) {
          if (param.name === paramKey) {
            return param.unit || '';
          }
        }
      }
      return '';
    },
    
    startTest() {
      if (this.wizardData.confirmed) {
        console.log('Starting test with configuration:', this.wizardData);
        this.$emit('test-started', this.wizardData);
      }
    },
    
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('pl-PL');
    }
  },
  
  mounted() {
    // Initialize default parameters
    this.wizardData.parameters = {
      pressure: 250,
      duration: 120
    };
  }
}
</script>

<style scoped>
.test-wizard {
  padding: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.wizard-header {
  margin-bottom: 2rem;
}

.wizard-header h2 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  text-align: center;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  padding: 0.5rem;
}

.step.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #007bff;
  color: white;
}

.step.completed .step-number {
  background: #28a745;
  color: white;
}

.step-title {
  font-size: 0.9rem;
  color: #6c757d;
  text-align: center;
}

.step.active .step-title {
  color: #007bff;
  font-weight: 600;
}

.progress-bar {
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #28a745);
  transition: width 0.3s ease;
}

.wizard-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  min-height: 400px;
}

.wizard-step h3 {
  margin: 0 0 2rem 0;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 1rem;
}

/* Test Type Selection */
.test-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.test-type-card {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.test-type-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,123,255,0.15);
}

.test-type-card.selected {
  border-color: #007bff;
  background: #f8f9ff;
}

.test-type-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.test-type-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.test-type-description {
  color: #6c757d;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.test-type-duration {
  color: #28a745;
  font-weight: 600;
}

/* Device Selection */
.devices-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.device-card {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.device-card:hover:not(.unavailable) {
  border-color: #007bff;
  transform: translateY(-1px);
}

.device-card.selected {
  border-color: #007bff;
  background: #f8f9ff;
}

.device-card.unavailable {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f8f9fa;
}

.device-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.device-status.ready { background: #28a745; }
.device-status.busy { background: #ffc107; }
.device-status.offline { background: #dc3545; }

.device-info {
  flex: 1;
}

.device-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.device-model {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.device-location {
  color: #6c757d;
  font-size: 0.9rem;
}

.device-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat {
  display: flex;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.stat-label {
  color: #6c757d;
}

.stat-value {
  color: #2c3e50;
  font-weight: 600;
}

/* Parameters */
.parameter-groups {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.parameter-group h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.parameters-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.parameter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.parameter-item label {
  font-weight: 600;
  color: #495057;
}

.parameter-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.parameter-input input,
.parameter-input select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.parameter-unit {
  color: #6c757d;
  font-size: 0.9rem;
  min-width: 40px;
}

.parameter-help {
  font-size: 0.8rem;
  color: #6c757d;
}

/* Review */
.review-summary {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.summary-section {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1.5rem;
}

.summary-section h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.summary-item,
.parameter-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.summary-label,
.param-name {
  color: #6c757d;
  font-weight: 600;
}

.summary-value,
.param-value {
  color: #2c3e50;
}

.confirmation-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.confirmation-checkbox label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  color: #2c3e50;
}

/* Navigation */
.wizard-navigation {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary { background: #007bff; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-success { background: #28a745; color: white; }

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Mobile optimizations */
@media (max-width: 450px) {
  .test-wizard {
    padding: 1rem;
  }

  .progress-steps {
    flex-direction: column;
    gap: 0.5rem;
  }

  .step {
    flex-direction: row;
    justify-content: flex-start;
  }

  .test-types-grid {
    grid-template-columns: 1fr;
  }

  .device-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .parameters-grid {
    grid-template-columns: 1fr;
  }

  .wizard-navigation {
    flex-direction: column;
  }

  .review-summary {
    grid-template-columns: 1fr;
  }
}
</style>
