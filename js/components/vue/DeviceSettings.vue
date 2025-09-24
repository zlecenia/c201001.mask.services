<template>
  <div class="device-settings">
    <h3>{{ $t(TRANSLATION_KEYS.deviceSettings) || 'Ustawienia urządzenia' }}</h3>
    
    <div class="settings-grid">
      <div class="setting-group">
        <label :for="deviceNameId">{{ $t(TRANSLATION_KEYS.deviceName) || 'Nazwa urządzenia' }}:</label>
        <input 
          :id="deviceNameId"
          type="text" 
          :value="settings.name" 
          @input="updateSetting('name', $event.target.value)"
          :placeholder="$t(TRANSLATION_KEYS.deviceNamePlaceholder) || 'MASKTRONIC C20'"
          class="setting-input"
        />
      </div>

      <div class="setting-group">
        <label :for="deviceLocationId">{{ $t(TRANSLATION_KEYS.deviceLocation) || 'Lokalizacja urządzenia' }}:</label>
        <input 
          :id="deviceLocationId"
          type="text" 
          :value="settings.location" 
          @input="updateSetting('location', $event.target.value)"
          class="setting-input"
        />
      </div>

      <div class="setting-group">
        <label :for="measurementIntervalId">{{ $t(TRANSLATION_KEYS.measurementInterval) || 'Interwał pomiarów' }}:</label>
        <div class="input-group">
          <input 
            :id="measurementIntervalId"
            type="number" 
            :value="settings.measurementInterval" 
            @input="updateSetting('measurementInterval', parseInt($event.target.value))"
            :min="MIN_MEASUREMENT_INTERVAL" 
            :max="MAX_MEASUREMENT_INTERVAL"
            class="setting-input"
          />
          <span class="input-unit">{{ $t(TRANSLATION_KEYS.seconds) || 'sekund' }}</span>
        </div>
      </div>

      <div class="setting-group">
        <label :for="pressureUnitsId">{{ $t(TRANSLATION_KEYS.pressureUnits) || 'Jednostki ciśnienia' }}:</label>
        <select 
          :id="pressureUnitsId"
          :value="settings.pressureUnits" 
          @change="updateSetting('pressureUnits', $event.target.value)"
          class="setting-input"
        >
          <option value="Pa">Pascal (Pa)</option>
          <option value="kPa">Kilopascal (kPa)</option>
          <option value="mmHg">mmHg</option>
          <option value="psi">PSI</option>
        </select>
      </div>

      <div class="setting-group">
        <label :for="flowUnitsId">{{ $t(TRANSLATION_KEYS.flowUnits) || 'Jednostki przepływu' }}:</label>
        <select 
          :id="flowUnitsId"
          :value="settings.flowUnits" 
          @change="updateSetting('flowUnits', $event.target.value)"
          class="setting-input"
        >
          <option value="L/min">L/min</option>
          <option value="m³/h">m³/h</option>
          <option value="cfm">CFM</option>
        </select>
      </div>

      <div class="setting-group checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="settings.autoCalibration"
            @change="updateSetting('autoCalibration', $event.target.checked)"
            class="checkbox-input"
          />
          <span class="checkmark"></span>
          <span class="checkbox-text">
            {{ $t(TRANSLATION_KEYS.autoCalibration) || 'Automatyczna kalibracja' }}
          </span>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeviceSettings',
  props: {
    settings: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Validation constraints
      MIN_MEASUREMENT_INTERVAL: 1, // seconds
      MAX_MEASUREMENT_INTERVAL: 60, // seconds
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      INPUT_MIN_HEIGHT: 40, // px
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        deviceSettings: 'settings.device_settings',
        deviceName: 'settings.device_name',
        deviceNamePlaceholder: 'settings.device_name_placeholder',
        deviceLocation: 'settings.device_location',
        measurementInterval: 'settings.measurement_interval',
        pressureUnits: 'settings.pressure_units',
        flowUnits: 'settings.flow_units',
        autoCalibration: 'settings.auto_calibration',
        seconds: 'settings.seconds'
      }
    }
  },
  computed: {
    deviceNameId() {
      return `device-name-${this.$attrs.id || 'default'}`;
    },
    deviceLocationId() {
      return `device-location-${this.$attrs.id || 'default'}`;
    },
    measurementIntervalId() {
      return `measurement-interval-${this.$attrs.id || 'default'}`;
    },
    pressureUnitsId() {
      return `pressure-units-${this.$attrs.id || 'default'}`;
    },
    flowUnitsId() {
      return `flow-units-${this.$attrs.id || 'default'}`;
    }
  },
  methods: {
    updateSetting(key, value) {
      this.$emit('setting-updated', { key, value });
    }
  }
}
</script>

<style scoped>
.device-settings h3 {
  margin: 0 0 2rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.settings-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-group label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.setting-input {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-height: 40px;
  background: white;
}

.setting-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-group .setting-input {
  flex: 1;
}

.input-unit {
  color: #6c757d;
  font-size: 0.9rem;
  white-space: nowrap;
  font-weight: 500;
}

.checkbox-group {
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  min-height: 44px;
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

.checkbox-text {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .settings-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .setting-input {
    padding: 0.6rem;
    font-size: 0.85rem;
  }
  
  .input-group {
    flex-wrap: wrap;
  }
  
  .input-unit {
    order: 3;
    width: 100%;
    text-align: center;
    margin-top: 0.25rem;
  }
}

.setting-input:focus,
.checkbox-label:focus-within {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
</style>
