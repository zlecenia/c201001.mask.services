<template>
  <div class="system-settings">
    <div class="settings-header">
      <h2>⚙️ {{ $t('settings.system_settings') || 'Ustawienia systemowe' }}</h2>
      <div class="settings-actions">
        <button class="btn btn-warning" @click="resetToDefaults">
          🔄 {{ $t('settings.reset_defaults') || 'Przywróć domyślne' }}
        </button>
        <button class="btn btn-success" @click="saveAllSettings">
          💾 {{ $t('settings.save_all') || 'Zapisz wszystkie' }}
        </button>
      </div>
    </div>

    <!-- Settings Categories -->
    <div class="settings-tabs">
      <button 
        v-for="tab in settingsTabs" 
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ $t(tab.label) || tab.defaultLabel }}
      </button>
    </div>

    <!-- General Settings -->
    <div v-if="activeTab === 'general'" class="settings-section">
      <h3>{{ $t('settings.general') || 'Ustawienia ogólne' }}</h3>
      
      <div class="settings-grid">
        <div class="setting-group">
          <label>{{ $t('settings.system_language') || 'Język systemu' }}:</label>
          <select v-model="settings.general.language" @change="markChanged">
            <option value="pl">🇵🇱 Polski</option>
            <option value="en">🇺🇸 English</option>
            <option value="de">🇩🇪 Deutsch</option>
          </select>
        </div>

        <div class="setting-group">
          <label>{{ $t('settings.timezone') || 'Strefa czasowa' }}:</label>
          <select v-model="settings.general.timezone" @change="markChanged">
            <option value="Europe/Warsaw">Europe/Warsaw (CET)</option>
            <option value="UTC">UTC</option>
            <option value="Europe/Berlin">Europe/Berlin (CET)</option>
          </select>
        </div>

        <div class="setting-group">
          <label>{{ $t('settings.date_format') || 'Format daty' }}:</label>
          <select v-model="settings.general.dateFormat" @change="markChanged">
            <option value="DD.MM.YYYY">DD.MM.YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div class="setting-group">
          <label>{{ $t('settings.auto_logout') || 'Automatyczne wylogowanie' }}:</label>
          <div class="input-group">
            <input 
              type="number" 
              v-model="settings.general.autoLogoutMinutes" 
              @change="markChanged"
              min="5" 
              max="480"
            >
            <span>{{ $t('settings.minutes') || 'minut' }}</span>
          </div>
        </div>

        <div class="setting-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="settings.general.enableSounds" 
              @change="markChanged"
            >
            {{ $t('settings.enable_sounds') || 'Włącz dźwięki systemu' }}
          </label>
        </div>

        <div class="setting-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="settings.general.enableAnimations" 
              @change="markChanged"
            >
            {{ $t('settings.enable_animations') || 'Włącz animacje' }}
          </label>
        </div>
      </div>
    </div>

    <!-- Device Settings -->
    <div v-if="activeTab === 'device'" class="settings-section">
      <h3>{{ $t('settings.device_settings') || 'Ustawienia urządzenia' }}</h3>
      
      <div class="settings-grid">
        <div class="setting-group">
          <label>{{ $t('settings.device_name') || 'Nazwa urządzenia' }}:</label>
          <input 
            type="text" 
            v-model="settings.device.name" 
            @input="markChanged"
            :placeholder="$t('settings.device_name_placeholder') || 'MASKTRONIC C20'"
          >
        </div>

        <div class="setting-group">
          <label>{{ $t('settings.device_location') || 'Lokalizacja urządzenia' }}:</label>
          <input 
            type="text" 
            v-model="settings.device.location" 
            @input="markChanged"
            :placeholder="$t('settings.location_placeholder') || 'Laboratorium 1'"
          >
        </div>

        <div class="setting-group">
          <label>{{ $t('settings.measurement_interval') || 'Interwał pomiarów' }}:</label>
          <div class="input-group">
            <input 
              type="number" 
              v-model="settings.device.measurementInterval" 
              @change="markChanged"
              min="1" 
              max="60"
            >
            <span>{{ $t('settings.seconds') || 'sekund' }}</span>
          </div>
        </div>

        <div class="setting-group">
          <label>{{ $t('settings.pressure_units') || 'Jednostki ciśnienia' }}:</label>
          <select v-model="settings.device.pressureUnits" @change="markChanged">
            <option value="Pa">Pascal (Pa)</option>
            <option value="mbar">Milibar (mbar)</option>
            <option value="mmH2O">mm H₂O</option>
            <option value="inH2O">in H₂O</option>
          </select>
        </div>

        <div class="setting-group">
          <label>{{ $t('settings.flow_units') || 'Jednostki przepływu' }}:</label>
          <select v-model="settings.device.flowUnits" @change="markChanged">
            <option value="L/min">L/min</option>
            <option value="m3/h">m³/h</option>
            <option value="CFM">CFM</option>
          </select>
        </div>

        <div class="setting-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="settings.device.autoCalibration" 
              @change="markChanged"
            >
            {{ $t('settings.auto_calibration') || 'Automatyczna kalibracja' }}
          </label>
        </div>
      </div>
    </div>

    <!-- Security Settings -->
    <div v-if="activeTab === 'security'" class="settings-section">
      <h3>{{ $t('settings.security') || 'Ustawienia bezpieczeństwa' }}</h3>
      
      <div class="settings-grid">
        <div class="setting-group">
          <label>{{ $t('settings.password_policy') || 'Polityka haseł' }}:</label>
          <select v-model="settings.security.passwordPolicy" @change="markChanged">
            <option value="basic">{{ $t('settings.basic') || 'Podstawowa' }}</option>
            <option value="medium">{{ $t('settings.medium') || 'Średnia' }}</option>
            <option value="strict">{{ $t('settings.strict') || 'Ścisła' }}</option>
          </select>
        </div>

        <div class="setting-group">
          <label>{{ $t('settings.session_timeout') || 'Timeout sesji' }}:</label>
          <div class="input-group">
            <input 
              type="number" 
              v-model="settings.security.sessionTimeout" 
              @change="markChanged"
              min="30" 
              max="1440"
            >
            <span>{{ $t('settings.minutes') || 'minut' }}</span>
          </div>
        </div>

        <div class="setting-group">
          <label>{{ $t('settings.failed_login_attempts') || 'Nieudane próby logowania' }}:</label>
          <input 
            type="number" 
            v-model="settings.security.maxFailedLogins" 
            @change="markChanged"
            min="3" 
            max="10"
          >
        </div>

        <div class="setting-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="settings.security.enableAuditLog" 
              @change="markChanged"
            >
            {{ $t('settings.enable_audit_log') || 'Włącz dziennik audytu' }}
          </label>
        </div>

        <div class="setting-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="settings.security.requirePasswordChange" 
              @change="markChanged"
            >
            {{ $t('settings.require_password_change') || 'Wymagaj zmiany hasła' }}
          </label>
        </div>

        <div class="setting-group">
          <label>{{ $t('settings.password_change_interval') || 'Interwał zmiany hasła' }}:</label>
          <div class="input-group">
            <input 
              type="number" 
              v-model="settings.security.passwordChangeInterval" 
              @change="markChanged"
              min="30" 
              max="365"
              :disabled="!settings.security.requirePasswordChange"
            >
            <span>{{ $t('settings.days') || 'dni' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Network Settings -->
    <div v-if="activeTab === 'network'" class="settings-section">
      <h3>{{ $t('settings.network') || 'Ustawienia sieciowe' }}</h3>
      
      <div class="settings-grid">
        <div class="setting-group">
          <label>{{ $t('settings.ip_address') || 'Adres IP' }}:</label>
          <input 
            type="text" 
            v-model="settings.network.ipAddress" 
            @input="markChanged"
            pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
          >
        </div>

        <div class="setting-group">
          <label>{{ $t('settings.subnet_mask') || 'Maska podsieci' }}:</label>
          <input 
            type="text" 
            v-model="settings.network.subnetMask" 
            @input="markChanged"
            pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
          >
        </div>

        <div class="setting-group">
          <label>{{ $t('settings.gateway') || 'Brama' }}:</label>
          <input 
            type="text" 
            v-model="settings.network.gateway" 
            @input="markChanged"
            pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
          >
        </div>

        <div class="setting-group">
          <label>{{ $t('settings.dns_primary') || 'DNS podstawowy' }}:</label>
          <input 
            type="text" 
            v-model="settings.network.dnsPrimary" 
            @input="markChanged"
            pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
          >
        </div>

        <div class="setting-group">
          <label>{{ $t('settings.dns_secondary') || 'DNS zapasowy' }}:</label>
          <input 
            type="text" 
            v-model="settings.network.dnsSecondary" 
            @input="markChanged"
            pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
          >
        </div>

        <div class="setting-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="settings.network.dhcpEnabled" 
              @change="markChanged"
            >
            {{ $t('settings.enable_dhcp') || 'Włącz DHCP' }}
          </label>
        </div>
      </div>
    </div>

    <!-- Changes Indicator -->
    <div v-if="hasUnsavedChanges" class="unsaved-changes">
      <div class="changes-indicator">
        <span class="changes-icon">⚠️</span>
        <span class="changes-text">{{ $t('settings.unsaved_changes') || 'Masz niezapisane zmiany' }}</span>
        <div class="changes-actions">
          <button class="btn btn-outline" @click="discardChanges">
            {{ $t('settings.discard') || 'Odrzuć' }}
          </button>
          <button class="btn btn-success" @click="saveAllSettings">
            {{ $t('settings.save') || 'Zapisz' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemSettingsComponent',
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Settings configuration
      DEFAULT_TAB: 'general',
      SAVE_DEBOUNCE_DELAY: 500, // ms
      AUTO_SAVE_INTERVAL: 30000, // 30 seconds
      
      // Validation constraints
      MIN_AUTO_LOGOUT: 5, // minutes
      MAX_AUTO_LOGOUT: 480, // 8 hours
      MIN_SESSION_TIMEOUT: 15, // minutes
      MAX_SESSION_TIMEOUT: 240, // 4 hours
      MIN_MEASUREMENT_INTERVAL: 1, // seconds
      MAX_MEASUREMENT_INTERVAL: 60, // seconds
      
      // UI configuration
      TABS_BREAKPOINT: 450, // px
      SETTING_GROUP_MIN_WIDTH: 300, // px
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      INPUT_MIN_HEIGHT: 40, // px
      CHECKBOX_SIZE: 20, // px
      
      // Animation timing
      TAB_TRANSITION_DURATION: 200, // ms
      SAVE_ANIMATION_DURATION: 300, // ms
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        // Main settings translations
        systemSettings: 'settings.system_settings',
        resetDefaults: 'settings.reset_defaults',
        saveAll: 'settings.save_all',
        
        // Tab translations
        general: 'settings.general',
        device: 'settings.device',
        security: 'settings.security',
        network: 'settings.network',
        deviceSettings: 'settings.device_settings',
        
        // General settings
        systemLanguage: 'settings.system_language',
        timezone: 'settings.timezone',
        dateFormat: 'settings.date_format',
        autoLogout: 'settings.auto_logout',
        enableSounds: 'settings.enable_sounds',
        enableAnimations: 'settings.enable_animations',
        minutes: 'settings.minutes',
        
        // Device settings
        deviceName: 'settings.device_name',
        deviceNamePlaceholder: 'settings.device_name_placeholder',
        deviceLocation: 'settings.device_location',
        measurementInterval: 'settings.measurement_interval',
        pressureUnits: 'settings.pressure_units',
        flowUnits: 'settings.flow_units',
        autoCalibration: 'settings.auto_calibration',
        seconds: 'settings.seconds',
        
        // Security settings
        passwordPolicy: 'settings.password_policy',
        sessionTimeout: 'settings.session_timeout',
        maxFailedLogins: 'settings.max_failed_logins',
        enableAuditLog: 'settings.enable_audit_log',
        requirePasswordChange: 'settings.require_password_change',
        passwordChangeInterval: 'settings.password_change_interval',
        days: 'settings.days',
        
        // Network settings
        networkMode: 'settings.network_mode',
        ipAddress: 'settings.ip_address',
        subnetMask: 'settings.subnet_mask',
        gateway: 'settings.gateway',
        dnsServers: 'settings.dns_servers',
        enableSSL: 'settings.enable_ssl',
        apiTimeout: 'settings.api_timeout',
        
        // Actions
        save: 'settings.save',
        discard: 'settings.discard',
        confirmLeave: 'settings.confirm_leave',
        unsavedChanges: 'settings.unsaved_changes',
        
        // Validation
        invalidValue: 'settings.invalid_value',
        required: 'settings.required',
        
        // Common
        loading: 'global.loading',
        error: 'global.error',
        success: 'global.success'
      },
      
      // Component state variables
      activeTab: 'general',
      hasUnsavedChanges: false,
      
      // Settings tabs configuration
      settingsTabs: [
        { id: 'general', icon: '🌐', label: 'settings.general', defaultLabel: 'Ogólne' },
        { id: 'device', icon: '📱', label: 'settings.device', defaultLabel: 'Urządzenie' },
        { id: 'security', icon: '🔐', label: 'settings.security', defaultLabel: 'Bezpieczeństwo' },
        { id: 'network', icon: '🌐', label: 'settings.network', defaultLabel: 'Sieć' }
      ],
      settings: {
        general: {
          language: 'pl',
          timezone: 'Europe/Warsaw',
          dateFormat: 'DD.MM.YYYY',
          autoLogoutMinutes: 30,
          enableSounds: true,
          enableAnimations: true
        },
        device: {
          name: 'MASKTRONIC C20-001',
          location: 'Laboratorium 1',
          measurementInterval: 5,
          pressureUnits: 'Pa',
          flowUnits: 'L/min',
          autoCalibration: true
        },
        security: {
          passwordPolicy: 'medium',
          sessionTimeout: 60,
          maxFailedLogins: 5,
          enableAuditLog: true,
          requirePasswordChange: false,
          passwordChangeInterval: 90
        },
        network: {
          ipAddress: '192.168.1.100',
          subnetMask: '255.255.255.0',
          gateway: '192.168.1.1',
          dnsPrimary: '8.8.8.8',
          dnsSecondary: '8.8.4.4',
          dhcpEnabled: false
        }
      }
    }
  },
  methods: {
    markChanged() {
      this.hasUnsavedChanges = true;
    },
    
    saveAllSettings() {
      // Implement settings save logic
      console.log('Saving all settings:', this.settings);
      
      // Mock API call
      setTimeout(() => {
        this.hasUnsavedChanges = false;
        this.showSuccessMessage(this.$t('settings.settings_saved') || 'Ustawienia zostały zapisane');
      }, 500);
    },
    
    discardChanges() {
      // Reload settings from server/storage
      console.log('Discarding changes');
      this.loadSettings();
      this.hasUnsavedChanges = false;
    },
    
    resetToDefaults() {
      if (confirm(this.$t('settings.confirm_reset') || 'Czy na pewno chcesz przywrócić ustawienia domyślne?')) {
        this.settings = {
          general: {
            language: 'pl',
            timezone: 'Europe/Warsaw',
            dateFormat: 'DD.MM.YYYY',
            autoLogoutMinutes: 30,
            enableSounds: true,
            enableAnimations: true
          },
          device: {
            name: 'MASKTRONIC C20',
            location: '',
            measurementInterval: 5,
            pressureUnits: 'Pa',
            flowUnits: 'L/min',
            autoCalibration: false
          },
          security: {
            passwordPolicy: 'basic',
            sessionTimeout: 60,
            maxFailedLogins: 3,
            enableAuditLog: false,
            requirePasswordChange: false,
            passwordChangeInterval: 90
          },
          network: {
            ipAddress: '192.168.1.100',
            subnetMask: '255.255.255.0',
            gateway: '192.168.1.1',
            dnsPrimary: '8.8.8.8',
            dnsSecondary: '8.8.4.4',
            dhcpEnabled: true
          }
        };
        this.hasUnsavedChanges = true;
      }
    },
    
    loadSettings() {
      // Load settings from server/storage
      console.log('Loading settings from server');
    },
    
    showSuccessMessage(message) {
      // Implement success notification
      console.log('Success:', message);
    }
  },
  
  mounted() {
    this.loadSettings();
  },
  
  beforeUnmount() {
    if (this.hasUnsavedChanges) {
      const confirmLeave = confirm(this.$t('settings.confirm_leave') || 'Masz niezapisane zmiany. Czy na pewno chcesz opuścić tę stronę?');
      if (!confirmLeave) {
        return false;
      }
    }
  }
}
</script>

<style scoped>
.system-settings {
  padding: 1rem;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.settings-header h2 {
  margin: 0;
  color: #2c3e50;
}

.settings-actions {
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

.btn-warning { background: #ffc107; color: #212529; }
.btn-success { background: #28a745; color: white; }
.btn-outline { background: transparent; border: 1px solid #6c757d; color: #6c757d; }

.btn:hover { transform: translateY(-1px); }

.settings-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 1rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background: #f8f9fa;
  color: #6c757d;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  transition: all 0.2s;
  font-weight: 600;
}

.tab-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.tab-btn.active {
  background: #007bff;
  color: white;
  border-bottom: 2px solid #007bff;
}

.settings-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.settings-section h3 {
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
}

.setting-group input,
.setting-group select {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.2s;
}

.setting-group input:focus,
.setting-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-group input {
  flex: 1;
}

.input-group span {
  color: #6c757d;
  font-size: 0.9rem;
  white-space: nowrap;
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

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.unsaved-changes {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  z-index: 1000;
}

.changes-indicator {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.changes-icon {
  font-size: 1.5rem;
}

.changes-text {
  flex: 1;
  font-weight: 600;
  color: #856404;
}

.changes-actions {
  display: flex;
  gap: 0.5rem;
}

/* Mobile optimizations */
@media (max-width: 450px) {
  .settings-header {
    flex-direction: column;
    gap: 1rem;
  }

  .settings-actions {
    width: 100%;
    justify-content: center;
  }

  .settings-tabs {
    flex-wrap: wrap;
    justify-content: center;
  }

  .tab-btn {
    flex: 1;
    min-width: 120px;
  }

  .settings-section {
    padding: 1rem;
  }

  .settings-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .changes-indicator {
    flex-direction: column;
    text-align: center;
  }

  .changes-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
