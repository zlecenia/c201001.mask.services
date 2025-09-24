<template>
  <div class="security-settings">
    <h3>{{ $t(TRANSLATION_KEYS.security) || 'Ustawienia bezpieczeństwa' }}</h3>
    
    <div class="settings-grid">
      <div class="setting-group">
        <label :for="passwordPolicyId">{{ $t(TRANSLATION_KEYS.passwordPolicy) || 'Polityka haseł' }}:</label>
        <select 
          :id="passwordPolicyId"
          :value="settings.passwordPolicy" 
          @change="updateSetting('passwordPolicy', $event.target.value)"
          class="setting-input"
        >
          <option value="weak">{{ $t(TRANSLATION_KEYS.weakPolicy) || 'Słaba (min. 4 znaki)' }}</option>
          <option value="medium">{{ $t(TRANSLATION_KEYS.mediumPolicy) || 'Średnia (min. 8 znaków, cyfry)' }}</option>
          <option value="strong">{{ $t(TRANSLATION_KEYS.strongPolicy) || 'Silna (min. 12 znaków, cyfry, symbole)' }}</option>
        </select>
      </div>

      <div class="setting-group">
        <label :for="sessionTimeoutId">{{ $t(TRANSLATION_KEYS.sessionTimeout) || 'Timeout sesji' }}:</label>
        <div class="input-group">
          <input 
            :id="sessionTimeoutId"
            type="number" 
            :value="settings.sessionTimeout" 
            @input="updateSetting('sessionTimeout', parseInt($event.target.value))"
            :min="MIN_SESSION_TIMEOUT" 
            :max="MAX_SESSION_TIMEOUT"
            class="setting-input"
          />
          <span class="input-unit">{{ $t(TRANSLATION_KEYS.minutes) || 'minut' }}</span>
        </div>
      </div>

      <div class="setting-group">
        <label :for="maxFailedLoginsId">{{ $t(TRANSLATION_KEYS.maxFailedLogins) || 'Max nieudanych logowań' }}:</label>
        <input 
          :id="maxFailedLoginsId"
          type="number" 
          :value="settings.maxFailedLogins" 
          @input="updateSetting('maxFailedLogins', parseInt($event.target.value))"
          min="3" 
          max="10"
          class="setting-input"
        />
      </div>

      <div class="setting-group checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="settings.enableAuditLog"
            @change="updateSetting('enableAuditLog', $event.target.checked)"
            class="checkbox-input"
          />
          <span class="checkmark"></span>
          <span class="checkbox-text">
            {{ $t(TRANSLATION_KEYS.enableAuditLog) || 'Włącz dziennik audytu' }}
          </span>
        </label>
        <small class="setting-help">
          {{ $t(TRANSLATION_KEYS.auditLogHelp) || 'Rejestruje wszystkie działania użytkowników w systemie' }}
        </small>
      </div>

      <div class="setting-group checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="settings.requirePasswordChange"
            @change="updateSetting('requirePasswordChange', $event.target.checked)"
            class="checkbox-input"
          />
          <span class="checkmark"></span>
          <span class="checkbox-text">
            {{ $t(TRANSLATION_KEYS.requirePasswordChange) || 'Wymagaj zmiany hasła' }}
          </span>
        </label>
      </div>

      <div v-if="settings.requirePasswordChange" class="setting-group">
        <label :for="passwordChangeIntervalId">{{ $t(TRANSLATION_KEYS.passwordChangeInterval) || 'Interwał zmiany hasła' }}:</label>
        <div class="input-group">
          <input 
            :id="passwordChangeIntervalId"
            type="number" 
            :value="settings.passwordChangeInterval" 
            @input="updateSetting('passwordChangeInterval', parseInt($event.target.value))"
            min="30" 
            max="365"
            class="setting-input"
          />
          <span class="input-unit">{{ $t(TRANSLATION_KEYS.days) || 'dni' }}</span>
        </div>
      </div>

      <div class="setting-group checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="settings.enableTwoFactor || false"
            @change="updateSetting('enableTwoFactor', $event.target.checked)"
            class="checkbox-input"
          />
          <span class="checkmark"></span>
          <span class="checkbox-text">
            {{ $t(TRANSLATION_KEYS.enableTwoFactor) || 'Uwierzytelnianie dwuskładnikowe' }}
          </span>
        </label>
        <small class="setting-help">
          {{ $t(TRANSLATION_KEYS.twoFactorHelp) || 'Dodatkowa warstwa zabezpieczeń przy logowaniu' }}
        </small>
      </div>

      <div class="setting-group checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="settings.enableSSLOnly || false"
            @change="updateSetting('enableSSLOnly', $event.target.checked)"
            class="checkbox-input"
          />
          <span class="checkmark"></span>
          <span class="checkbox-text">
            {{ $t(TRANSLATION_KEYS.enableSSLOnly) || 'Wymagaj połączenia SSL' }}
          </span>
        </label>
        <small class="setting-help">
          {{ $t(TRANSLATION_KEYS.sslOnlyHelp) || 'Wymusza szyfrowane połączenia HTTPS' }}
        </small>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SecuritySettings',
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
      MIN_SESSION_TIMEOUT: 15, // minutes
      MAX_SESSION_TIMEOUT: 240, // 4 hours
      MIN_FAILED_LOGINS: 3,
      MAX_FAILED_LOGINS: 10,
      MIN_PASSWORD_CHANGE_DAYS: 30,
      MAX_PASSWORD_CHANGE_DAYS: 365,
      
      // Security levels
      PASSWORD_POLICIES: {
        weak: { minLength: 4, requireNumbers: false, requireSymbols: false },
        medium: { minLength: 8, requireNumbers: true, requireSymbols: false },
        strong: { minLength: 12, requireNumbers: true, requireSymbols: true }
      },
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      INPUT_MIN_HEIGHT: 40, // px
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        security: 'settings.security',
        passwordPolicy: 'settings.password_policy',
        weakPolicy: 'settings.weak_policy',
        mediumPolicy: 'settings.medium_policy',
        strongPolicy: 'settings.strong_policy',
        sessionTimeout: 'settings.session_timeout',
        maxFailedLogins: 'settings.max_failed_logins',
        enableAuditLog: 'settings.enable_audit_log',
        auditLogHelp: 'settings.audit_log_help',
        requirePasswordChange: 'settings.require_password_change',
        passwordChangeInterval: 'settings.password_change_interval',
        enableTwoFactor: 'settings.enable_two_factor',
        twoFactorHelp: 'settings.two_factor_help',
        enableSSLOnly: 'settings.enable_ssl_only',
        sslOnlyHelp: 'settings.ssl_only_help',
        minutes: 'settings.minutes',
        days: 'settings.days'
      }
    }
  },
  computed: {
    passwordPolicyId() {
      return `password-policy-${this.$attrs.id || 'default'}`;
    },
    sessionTimeoutId() {
      return `session-timeout-${this.$attrs.id || 'default'}`;
    },
    maxFailedLoginsId() {
      return `max-failed-logins-${this.$attrs.id || 'default'}`;
    },
    passwordChangeIntervalId() {
      return `password-change-interval-${this.$attrs.id || 'default'}`;
    }
  },
  methods: {
    updateSetting(key, value) {
      // Validate values
      if (key === 'sessionTimeout') {
        value = Math.max(this.MIN_SESSION_TIMEOUT, Math.min(this.MAX_SESSION_TIMEOUT, value));
      } else if (key === 'maxFailedLogins') {
        value = Math.max(this.MIN_FAILED_LOGINS, Math.min(this.MAX_FAILED_LOGINS, value));
      } else if (key === 'passwordChangeInterval') {
        value = Math.max(this.MIN_PASSWORD_CHANGE_DAYS, Math.min(this.MAX_PASSWORD_CHANGE_DAYS, value));
      }
      
      this.$emit('setting-updated', { key, value });
    },
    
    getPasswordPolicyDescription(policy) {
      const config = this.PASSWORD_POLICIES[policy];
      if (!config) return '';
      
      let description = `Min. ${config.minLength} znaków`;
      if (config.requireNumbers) description += ', cyfry';
      if (config.requireSymbols) description += ', symbole';
      
      return description;
    }
  }
}
</script>

<style scoped>
.security-settings h3 {
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
  min-height: 44px;
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

/* Security-specific styling */
.setting-group:has(.checkbox-input:checked[type="checkbox"]) {
  background: #f0f9f0;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #28a745;
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

/* High security indicators */
.setting-group.high-security {
  border: 2px solid #ffc107;
  background: #fff9e6;
  border-radius: 6px;
  padding: 1rem;
}

.setting-group.critical-security {
  border: 2px solid #dc3545;
  background: #ffeaea;
  border-radius: 6px;
  padding: 1rem;
}
</style>
