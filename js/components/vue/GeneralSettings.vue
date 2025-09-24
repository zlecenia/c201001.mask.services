<template>
  <div class="general-settings">
    <h3>{{ $t(TRANSLATION_KEYS.general) || 'Ustawienia ogólne' }}</h3>
    
    <div class="settings-grid">
      <div class="setting-group">
        <label :for="languageSelectId">{{ $t(TRANSLATION_KEYS.systemLanguage) || 'Język systemu' }}:</label>
        <select 
          :id="languageSelectId"
          :value="settings.language" 
          @change="updateSetting('language', $event.target.value)"
          class="setting-input"
        >
          <option value="pl">🇵🇱 Polski</option>
          <option value="en">🇺🇸 English</option>
          <option value="de">🇩🇪 Deutsch</option>
        </select>
      </div>

      <div class="setting-group">
        <label :for="timezoneSelectId">{{ $t(TRANSLATION_KEYS.timezone) || 'Strefa czasowa' }}:</label>
        <select 
          :id="timezoneSelectId"
          :value="settings.timezone" 
          @change="updateSetting('timezone', $event.target.value)"
          class="setting-input"
        >
          <option value="Europe/Warsaw">Europe/Warsaw (CET)</option>
          <option value="UTC">UTC</option>
          <option value="Europe/Berlin">Europe/Berlin (CET)</option>
          <option value="Europe/London">Europe/London (GMT)</option>
          <option value="America/New_York">America/New_York (EST)</option>
        </select>
      </div>

      <div class="setting-group">
        <label :for="dateFormatSelectId">{{ $t(TRANSLATION_KEYS.dateFormat) || 'Format daty' }}:</label>
        <select 
          :id="dateFormatSelectId"
          :value="settings.dateFormat" 
          @change="updateSetting('dateFormat', $event.target.value)"
          class="setting-input"
        >
          <option value="DD.MM.YYYY">DD.MM.YYYY</option>
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
        </select>
      </div>

      <div class="setting-group">
        <label :for="autoLogoutInputId">{{ $t(TRANSLATION_KEYS.autoLogout) || 'Automatyczne wylogowanie' }}:</label>
        <div class="input-group">
          <input 
            :id="autoLogoutInputId"
            type="number" 
            :value="settings.autoLogoutMinutes" 
            @input="updateSetting('autoLogoutMinutes', parseInt($event.target.value))"
            :min="MIN_AUTO_LOGOUT" 
            :max="MAX_AUTO_LOGOUT"
            class="setting-input"
          />
          <span class="input-unit">{{ $t(TRANSLATION_KEYS.minutes) || 'minut' }}</span>
        </div>
        <small class="setting-help">
          {{ $t(TRANSLATION_KEYS.autoLogoutHelp) || `Zakres: ${MIN_AUTO_LOGOUT}-${MAX_AUTO_LOGOUT} minut` }}
        </small>
      </div>

      <div class="setting-group">
        <label :for="timeFormatSelectId">{{ $t(TRANSLATION_KEYS.timeFormat) || 'Format czasu' }}:</label>
        <select 
          :id="timeFormatSelectId"
          :value="settings.timeFormat || '24h'" 
          @change="updateSetting('timeFormat', $event.target.value)"
          class="setting-input"
        >
          <option value="24h">24-godzinny (15:30)</option>
          <option value="12h">12-godzinny (3:30 PM)</option>
        </select>
      </div>

      <div class="setting-group checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="settings.enableSounds"
            @change="updateSetting('enableSounds', $event.target.checked)"
            class="checkbox-input"
          />
          <span class="checkmark"></span>
          <span class="checkbox-text">
            {{ $t(TRANSLATION_KEYS.enableSounds) || 'Włącz dźwięki systemu' }}
          </span>
        </label>
        <small class="setting-help">
          {{ $t(TRANSLATION_KEYS.enableSoundsHelp) || 'Odtwarza dźwięki potwierdzenia i powiadomienia' }}
        </small>
      </div>

      <div class="setting-group checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="settings.enableAnimations"
            @change="updateSetting('enableAnimations', $event.target.checked)"
            class="checkbox-input"
          />
          <span class="checkmark"></span>
          <span class="checkbox-text">
            {{ $t(TRANSLATION_KEYS.enableAnimations) || 'Włącz animacje' }}
          </span>
        </label>
        <small class="setting-help">
          {{ $t(TRANSLATION_KEYS.enableAnimationsHelp) || 'Wyłączenie może poprawić wydajność na wolniejszych urządzeniach' }}
        </small>
      </div>

      <div class="setting-group checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="settings.autoSave || false"
            @change="updateSetting('autoSave', $event.target.checked)"
            class="checkbox-input"
          />
          <span class="checkmark"></span>
          <span class="checkbox-text">
            {{ $t(TRANSLATION_KEYS.autoSave) || 'Automatyczne zapisywanie' }}
          </span>
        </label>
        <small class="setting-help">
          {{ $t(TRANSLATION_KEYS.autoSaveHelp) || 'Automatycznie zapisuje zmiany co 30 sekund' }}
        </small>
      </div>

      <div class="setting-group">
        <label :for="themeSelectId">{{ $t(TRANSLATION_KEYS.theme) || 'Motyw' }}:</label>
        <select 
          :id="themeSelectId"
          :value="settings.theme || 'light'" 
          @change="updateSetting('theme', $event.target.value)"
          class="setting-input"
        >
          <option value="light">☀️ {{ $t(TRANSLATION_KEYS.lightTheme) || 'Jasny' }}</option>
          <option value="dark">🌙 {{ $t(TRANSLATION_KEYS.darkTheme) || 'Ciemny' }}</option>
          <option value="auto">🔄 {{ $t(TRANSLATION_KEYS.autoTheme) || 'Automatyczny' }}</option>
        </select>
        <small class="setting-help">
          {{ $t(TRANSLATION_KEYS.themeHelp) || 'Automatyczny dostosowuje się do ustawień systemu' }}
        </small>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GeneralSettings',
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
      MIN_AUTO_LOGOUT: 5, // minutes
      MAX_AUTO_LOGOUT: 480, // 8 hours
      
      // Default values
      DEFAULT_LANGUAGE: 'pl',
      DEFAULT_TIMEZONE: 'Europe/Warsaw',
      DEFAULT_DATE_FORMAT: 'DD.MM.YYYY',
      DEFAULT_TIME_FORMAT: '24h',
      DEFAULT_AUTO_LOGOUT: 30, // minutes
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      INPUT_MIN_HEIGHT: 40, // px
      CHECKBOX_SIZE: 20, // px
      
      // Animation timing
      SETTING_CHANGE_DEBOUNCE: 300, // ms
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        // Section title
        general: 'settings.general',
        
        // Settings labels
        systemLanguage: 'settings.system_language',
        timezone: 'settings.timezone',
        dateFormat: 'settings.date_format',
        timeFormat: 'settings.time_format',
        autoLogout: 'settings.auto_logout',
        enableSounds: 'settings.enable_sounds',
        enableAnimations: 'settings.enable_animations',
        autoSave: 'settings.auto_save',
        theme: 'settings.theme',
        
        // Theme options
        lightTheme: 'settings.light_theme',
        darkTheme: 'settings.dark_theme',
        autoTheme: 'settings.auto_theme',
        
        // Units
        minutes: 'settings.minutes',
        
        // Help text
        autoLogoutHelp: 'settings.auto_logout_help',
        enableSoundsHelp: 'settings.enable_sounds_help',
        enableAnimationsHelp: 'settings.enable_animations_help',
        autoSaveHelp: 'settings.auto_save_help',
        themeHelp: 'settings.theme_help'
      },
      
      // Debounce timer
      debounceTimer: null
    }
  },
  computed: {
    languageSelectId() {
      return `language-select-${this.$attrs.id || 'default'}`;
    },
    
    timezoneSelectId() {
      return `timezone-select-${this.$attrs.id || 'default'}`;
    },
    
    dateFormatSelectId() {
      return `date-format-select-${this.$attrs.id || 'default'}`;
    },
    
    timeFormatSelectId() {
      return `time-format-select-${this.$attrs.id || 'default'}`;
    },
    
    autoLogoutInputId() {
      return `auto-logout-input-${this.$attrs.id || 'default'}`;
    },
    
    themeSelectId() {
      return `theme-select-${this.$attrs.id || 'default'}`;
    }
  },
  methods: {
    updateSetting(key, value) {
      // Validate value
      if (key === 'autoLogoutMinutes') {
        value = Math.max(this.MIN_AUTO_LOGOUT, Math.min(this.MAX_AUTO_LOGOUT, value));
      }
      
      // Debounce the update
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      
      this.debounceTimer = setTimeout(() => {
        this.$emit('setting-updated', { key, value });
      }, this.SETTING_CHANGE_DEBOUNCE);
    },
    
    validateAutoLogoutValue(value) {
      const numValue = parseInt(value);
      return !isNaN(numValue) && numValue >= this.MIN_AUTO_LOGOUT && numValue <= this.MAX_AUTO_LOGOUT;
    },
    
    getLanguageLabel(languageCode) {
      const languages = {
        pl: '🇵🇱 Polski',
        en: '🇺🇸 English',
        de: '🇩🇪 Deutsch'
      };
      return languages[languageCode] || languageCode;
    },
    
    getTimezoneLabel(timezone) {
      const timezones = {
        'Europe/Warsaw': 'Europe/Warsaw (CET)',
        'UTC': 'UTC',
        'Europe/Berlin': 'Europe/Berlin (CET)',
        'Europe/London': 'Europe/London (GMT)',
        'America/New_York': 'America/New_York (EST)'
      };
      return timezones[timezone] || timezone;
    }
  },
  
  beforeUnmount() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}
</script>

<style scoped>
.general-settings h3 {
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
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
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
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.checkbox-text {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
}

.setting-help {
  color: #6c757d;
  font-size: 0.8rem;
  line-height: 1.4;
  font-style: italic;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .settings-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .general-settings h3 {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }
  
  .setting-input {
    padding: 0.6rem;
    font-size: 0.85rem;
  }
  
  .checkbox-label {
    gap: 0.5rem;
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

/* Very small screens */
@media (max-width: 350px) {
  .settings-grid {
    gap: 0.75rem;
  }
  
  .setting-input {
    padding: 0.5rem;
  }
  
  .setting-help {
    font-size: 0.75rem;
  }
}

/* Touch-friendly enhancements */
.setting-input,
.checkbox-label {
  min-height: 44px; /* Touch target minimum */
}

.setting-input:active {
  transform: scale(0.99);
  transition-duration: 0.1s;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .setting-input {
    border-width: 2px;
  }
  
  .checkmark {
    border-width: 3px;
  }
  
  .checkbox-input:checked + .checkmark {
    border-width: 3px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .setting-input,
  .checkmark {
    transition: none;
  }
}

/* Focus styles for accessibility */
.setting-input:focus,
.checkbox-label:focus-within {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Loading state */
.setting-group.loading {
  opacity: 0.7;
  pointer-events: none;
}

.setting-group.loading::after {
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

/* Validation states */
.setting-group.invalid .setting-input {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
}

.setting-group.valid .setting-input {
  border-color: #28a745;
}

/* Setting group animations */
.setting-group {
  animation: settingSlideIn 0.3s ease-out;
}

.setting-group:nth-child(1) { animation-delay: 0.1s; }
.setting-group:nth-child(2) { animation-delay: 0.2s; }
.setting-group:nth-child(3) { animation-delay: 0.3s; }
.setting-group:nth-child(4) { animation-delay: 0.4s; }
.setting-group:nth-child(5) { animation-delay: 0.5s; }

@keyframes settingSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Disabled state */
.setting-input:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.checkbox-input:disabled + .checkmark {
  background: #f8f9fa;
  border-color: #dee2e6;
  cursor: not-allowed;
}

.checkbox-input:disabled ~ .checkbox-text {
  color: #6c757d;
  cursor: not-allowed;
}
</style>
