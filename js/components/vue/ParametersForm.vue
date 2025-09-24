<template>
  <div class="parameters-form">
    <h3>{{ $t(TRANSLATION_KEYS.configureParameters) || 'Konfiguruj parametry' }}</h3>
    <div class="parameters-container">
      <div class="parameter-groups">
        <div 
          v-for="group in parameterGroups" 
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
              <label :for="param.name">{{ $t(param.labelKey) || param.label }}:</label>
              <div class="parameter-input">
                <input 
                  v-if="param.type === 'number'"
                  :id="param.name"
                  type="number"
                  :value="getParameterValue(param.name)"
                  :min="param.min"
                  :max="param.max"
                  :step="param.step"
                  @input="updateParameter(param.name, $event.target.value)"
                  class="form-input"
                />
                <select 
                  v-else-if="param.type === 'select'"
                  :id="param.name"
                  :value="getParameterValue(param.name)"
                  @change="updateParameter(param.name, $event.target.value)"
                  class="form-select"
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
                  :id="param.name"
                  :type="param.type || 'text'"
                  :value="getParameterValue(param.name)"
                  @input="updateParameter(param.name, $event.target.value)"
                  class="form-input"
                />
                <span class="parameter-unit">{{ param.unit }}</span>
              </div>
              <div class="parameter-help">{{ $t(param.helpKey) || param.help }}</div>
              <div v-if="getParameterError(param.name)" class="parameter-error">
                {{ getParameterError(param.name) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Parameter Validation Summary -->
      <div v-if="hasValidationErrors" class="validation-summary">
        <h4>{{ $t(TRANSLATION_KEYS.validationErrors) || 'Błędy walidacji' }}</h4>
        <ul>
          <li v-for="error in validationErrors" :key="error.parameter">
            {{ error.message }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ParametersForm',
  props: {
    testType: {
      type: String,
      required: true
    },
    parameters: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Form configuration
      VALIDATION_DEBOUNCE_DELAY: 300, // ms
      INPUT_UPDATE_DELAY: 100, // ms
      
      // Parameter constraints
      MIN_PRESSURE: 0,
      MAX_PRESSURE: 100,
      MIN_FLOW: 0,
      MAX_FLOW: 200,
      MIN_DURATION: 30, // seconds
      MAX_DURATION: 1800, // 30 minutes
      
      // Grid configuration
      GRID_MIN_COLUMN_WIDTH: 300, // px
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      INPUT_MIN_HEIGHT: 40, // px
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        configureParameters: 'wizard.configure_parameters',
        validationErrors: 'wizard.validation_errors',
        
        // Parameter groups
        pressureGroup: 'parameters.pressure_group',
        flowGroup: 'parameters.flow_group',
        durationGroup: 'parameters.duration_group',
        qualityGroup: 'parameters.quality_group',
        
        // Parameters
        testPressure: 'parameters.test_pressure',
        flowRate: 'parameters.flow_rate',
        testDuration: 'parameters.test_duration',
        qualityLevel: 'parameters.quality_level',
        temperatureCompensation: 'parameters.temperature_compensation',
        humidityCompensation: 'parameters.humidity_compensation',
        
        // Units
        unitPressure: 'units.pressure',
        unitFlow: 'units.flow',
        unitTime: 'units.time',
        unitPercent: 'units.percent',
        
        // Help text
        pressureHelp: 'parameters.pressure_help',
        flowHelp: 'parameters.flow_help',
        durationHelp: 'parameters.duration_help',
        qualityHelp: 'parameters.quality_help'
      },
      
      // Parameter validation errors
      validationErrors: [],
      validationTimer: null
    }
  },
  computed: {
    parameterGroups() {
      // Different parameter groups based on test type
      const baseGroups = [
        {
          name: 'pressure',
          titleKey: this.TRANSLATION_KEYS.pressureGroup,
          title: 'Parametry ciśnieniowe',
          parameters: [
            {
              name: 'testPressure',
              labelKey: this.TRANSLATION_KEYS.testPressure,
              label: 'Ciśnienie testowe',
              type: 'number',
              min: this.MIN_PRESSURE,
              max: this.MAX_PRESSURE,
              step: 0.1,
              unit: 'kPa',
              helpKey: this.TRANSLATION_KEYS.pressureHelp,
              help: 'Ustaw ciśnienie testowe w zakresie 0-100 kPa'
            }
          ]
        },
        {
          name: 'flow',
          titleKey: this.TRANSLATION_KEYS.flowGroup,
          title: 'Parametry przepływu',
          parameters: [
            {
              name: 'flowRate',
              labelKey: this.TRANSLATION_KEYS.flowRate,
              label: 'Przepływ',
              type: 'number',
              min: this.MIN_FLOW,
              max: this.MAX_FLOW,
              step: 1,
              unit: 'L/min',
              helpKey: this.TRANSLATION_KEYS.flowHelp,
              help: 'Ustaw przepływ powietrza w L/min'
            }
          ]
        },
        {
          name: 'duration',
          titleKey: this.TRANSLATION_KEYS.durationGroup,
          title: 'Czas trwania',
          parameters: [
            {
              name: 'testDuration',
              labelKey: this.TRANSLATION_KEYS.testDuration,
              label: 'Czas testu',
              type: 'number',
              min: this.MIN_DURATION,
              max: this.MAX_DURATION,
              step: 10,
              unit: 's',
              helpKey: this.TRANSLATION_KEYS.durationHelp,
              help: 'Czas trwania testu w sekundach'
            }
          ]
        }
      ];

      // Add test-type specific parameters
      if (this.testType === 'filtration_test') {
        baseGroups.push({
          name: 'quality',
          titleKey: this.TRANSLATION_KEYS.qualityGroup,
          title: 'Parametry jakości',
          parameters: [
            {
              name: 'qualityLevel',
              labelKey: this.TRANSLATION_KEYS.qualityLevel,
              label: 'Poziom jakości',
              type: 'select',
              options: [
                { value: 'standard', labelKey: 'quality.standard', label: 'Standardowy' },
                { value: 'high', labelKey: 'quality.high', label: 'Wysoki' },
                { value: 'premium', labelKey: 'quality.premium', label: 'Premium' }
              ],
              helpKey: this.TRANSLATION_KEYS.qualityHelp,
              help: 'Wybierz poziom jakości testu'
            }
          ]
        });
      }

      return baseGroups;
    },
    
    hasValidationErrors() {
      return this.validationErrors.length > 0;
    }
  },
  methods: {
    getParameterValue(parameterName) {
      return this.parameters[parameterName] || this.getDefaultValue(parameterName);
    },
    
    getDefaultValue(parameterName) {
      const defaults = {
        testPressure: 50,
        flowRate: 30,
        testDuration: 180,
        qualityLevel: 'standard'
      };
      return defaults[parameterName] || '';
    },
    
    updateParameter(parameterName, value) {
      // Convert to appropriate type
      const param = this.findParameter(parameterName);
      let processedValue = value;
      
      if (param && param.type === 'number') {
        processedValue = parseFloat(value) || 0;
      }
      
      this.$emit('parameter-updated', { name: parameterName, value: processedValue });
      
      // Debounced validation
      this.scheduleValidation();
    },
    
    findParameter(parameterName) {
      for (const group of this.parameterGroups) {
        const param = group.parameters.find(p => p.name === parameterName);
        if (param) return param;
      }
      return null;
    },
    
    validateParameters() {
      this.validationErrors = [];
      
      for (const group of this.parameterGroups) {
        for (const param of group.parameters) {
          const value = this.getParameterValue(param.name);
          const error = this.validateSingleParameter(param, value);
          if (error) {
            this.validationErrors.push({
              parameter: param.name,
              message: error
            });
          }
        }
      }
      
      this.$emit('validation-changed', {
        isValid: this.validationErrors.length === 0,
        errors: this.validationErrors
      });
    },
    
    validateSingleParameter(param, value) {
      if (param.type === 'number') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return `${param.label}: wartość musi być liczbą`;
        }
        if (param.min !== undefined && numValue < param.min) {
          return `${param.label}: wartość nie może być mniejsza niż ${param.min}`;
        }
        if (param.max !== undefined && numValue > param.max) {
          return `${param.label}: wartość nie może być większa niż ${param.max}`;
        }
      }
      
      if (!value && param.required) {
        return `${param.label}: pole jest wymagane`;
      }
      
      return null;
    },
    
    getParameterError(parameterName) {
      const error = this.validationErrors.find(e => e.parameter === parameterName);
      return error ? error.message : null;
    },
    
    scheduleValidation() {
      if (this.validationTimer) {
        clearTimeout(this.validationTimer);
      }
      this.validationTimer = setTimeout(() => {
        this.validateParameters();
      }, this.VALIDATION_DEBOUNCE_DELAY);
    }
  },
  
  mounted() {
    this.validateParameters();
  },
  
  beforeUnmount() {
    if (this.validationTimer) {
      clearTimeout(this.validationTimer);
    }
  }
}
</script>

<style scoped>
.parameters-form h3 {
  margin: 0 0 2rem 0;
  color: #2c3e50;
  text-align: center;
  font-size: 1.5rem;
}

.parameters-container {
  max-width: 800px;
  margin: 0 auto;
}

.parameter-groups {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.parameter-group {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}

.parameter-group h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
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
  font-size: 0.9rem;
}

.parameter-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-input,
.form-select {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-height: 40px;
  background: white;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-input:invalid,
.form-select:invalid {
  border-color: #dc3545;
}

.parameter-unit {
  color: #6c757d;
  font-size: 0.9rem;
  min-width: 40px;
  font-weight: 600;
}

.parameter-help {
  font-size: 0.8rem;
  color: #6c757d;
  line-height: 1.4;
}

.parameter-error {
  font-size: 0.8rem;
  color: #dc3545;
  font-weight: 600;
}

.validation-summary {
  margin-top: 2rem;
  padding: 1rem 1.5rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  color: #721c24;
}

.validation-summary h4 {
  margin: 0 0 0.5rem 0;
  color: #721c24;
}

.validation-summary ul {
  margin: 0;
  padding-left: 1.5rem;
}

.validation-summary li {
  margin-bottom: 0.25rem;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .parameters-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .parameter-group {
    padding: 1rem;
  }
  
  .parameters-form h3 {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
  }
  
  .form-input,
  .form-select {
    padding: 0.6rem;
    font-size: 0.85rem;
  }
  
  .parameter-input {
    flex-wrap: wrap;
  }
  
  .parameter-unit {
    order: 3;
    width: 100%;
    text-align: center;
    margin-top: 0.25rem;
  }
}

/* Very small screens */
@media (max-width: 350px) {
  .parameter-groups {
    gap: 1rem;
  }
  
  .parameter-group {
    padding: 0.75rem;
  }
  
  .parameters-grid {
    gap: 0.75rem;
  }
  
  .form-input,
  .form-select {
    padding: 0.5rem;
  }
}

/* Touch-friendly enhancements */
.form-input,
.form-select {
  min-height: 44px; /* Touch target minimum */
}

.form-input:active,
.form-select:active {
  transform: scale(0.99);
  transition-duration: 0.1s;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .form-input,
  .form-select {
    border-width: 3px;
  }
  
  .parameter-group {
    border-width: 2px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .form-input,
  .form-select {
    transition: none;
  }
}

/* Loading state */
.parameter-item.loading {
  opacity: 0.7;
  pointer-events: none;
}

.parameter-item.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 1rem;
  width: 16px;
  height: 16px;
  margin-top: -8px;
  border: 2px solid #007bff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Parameter validation states */
.parameter-item.valid .form-input,
.parameter-item.valid .form-select {
  border-color: #28a745;
}

.parameter-item.invalid .form-input,
.parameter-item.invalid .form-select {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

/* Smooth transitions for validation */
.parameter-error {
  animation: errorSlideIn 0.3s ease-out;
}

@keyframes errorSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
