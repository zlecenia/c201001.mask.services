<template>
  <div class="security-settings">
    <div class="security-header">
      <h2>🔐 {{ $t('security.security_settings') || 'Ustawienia bezpieczeństwa' }}</h2>
      <div class="security-actions">
        <button class="btn btn-warning" @click="generateSecurityReport">
          📋 {{ $t('security.security_report') || 'Raport bezpieczeństwa' }}
        </button>
        <button class="btn btn-success" @click="saveSecuritySettings">
          💾 {{ $t('security.save_settings') || 'Zapisz ustawienia' }}
        </button>
      </div>
    </div>

    <!-- Security Overview -->
    <div class="security-overview">
      <div class="overview-card">
        <h4>{{ $t('security.security_level') || 'Poziom bezpieczeństwa' }}</h4>
        <span class="value" :class="securityLevelClass">{{ securityLevel }}</span>
        <small>{{ securityLevelDescription }}</small>
      </div>
      <div class="overview-card info">
        <h4>{{ $t('security.active_sessions') || 'Aktywne sesje' }}</h4>
        <span class="value">{{ activeSessionsCount }}</span>
        <small>{{ $t('security.current_users') || 'użytkowników' }}</small>
      </div>
      <div class="overview-card warning">
        <h4>{{ $t('security.failed_logins_today') || 'Nieudane logowania dzisiaj' }}</h4>
        <span class="value">{{ failedLoginsToday }}</span>
        <small>{{ $t('security.attempts') || 'prób' }}</small>
      </div>
      <div class="overview-card">
        <h4>{{ $t('security.last_audit') || 'Ostatni audyt' }}</h4>
        <span class="value">{{ formatDate(lastAuditDate) }}</span>
        <small>{{ $t('security.security_audit') || 'audyt bezpieczeństwa' }}</small>
      </div>
    </div>

    <!-- Authentication Settings -->
    <div class="settings-section">
      <h3>{{ $t('security.authentication') || 'Uwierzytelnianie' }}</h3>
      
      <div class="settings-grid">
        <div class="setting-group">
          <label>{{ $t('security.password_policy') || 'Polityka haseł' }}:</label>
          <select v-model="securitySettings.passwordPolicy" @change="markChanged">
            <option value="basic">{{ $t('security.basic_policy') || 'Podstawowa (min. 6 znaków)' }}</option>
            <option value="medium">{{ $t('security.medium_policy') || 'Średnia (8 znaków, cyfry)' }}</option>
            <option value="strict">{{ $t('security.strict_policy') || 'Ścisła (12 znaków, znaki specjalne)' }}</option>
          </select>
        </div>

        <div class="setting-group">
          <label>{{ $t('security.session_timeout') || 'Timeout sesji' }}:</label>
          <div class="input-group">
            <input 
              type="number" 
              v-model="securitySettings.sessionTimeout" 
              @change="markChanged"
              min="15" 
              max="480"
            >
            <span>{{ $t('security.minutes') || 'minut' }}</span>
          </div>
        </div>

        <div class="setting-group">
          <label>{{ $t('security.max_failed_logins') || 'Maksymalne nieudane logowania' }}:</label>
          <input 
            type="number" 
            v-model="securitySettings.maxFailedLogins" 
            @change="markChanged"
            min="3" 
            max="10"
          >
        </div>

        <div class="setting-group">
          <label>{{ $t('security.lockout_duration') || 'Czas blokady konta' }}:</label>
          <div class="input-group">
            <input 
              type="number" 
              v-model="securitySettings.lockoutDuration" 
              @change="markChanged"
              min="5" 
              max="60"
            >
            <span>{{ $t('security.minutes') || 'minut' }}</span>
          </div>
        </div>

        <div class="setting-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="securitySettings.requireTwoFactor" 
              @change="markChanged"
            >
            {{ $t('security.require_2fa') || 'Wymagaj dwuskładnikowej autoryzacji' }}
          </label>
        </div>

        <div class="setting-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="securitySettings.enablePasswordExpiry" 
              @change="markChanged"
            >
            {{ $t('security.password_expiry') || 'Wygasanie haseł' }}
          </label>
        </div>
      </div>
    </div>

    <!-- Audit Settings -->
    <div class="settings-section">
      <h3>{{ $t('security.audit_logging') || 'Rejestrowanie audytu' }}</h3>
      
      <div class="settings-grid">
        <div class="setting-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="securitySettings.enableAuditLog" 
              @change="markChanged"
            >
            {{ $t('security.enable_audit_log') || 'Włącz dziennik audytu' }}
          </label>
        </div>

        <div class="setting-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="securitySettings.logFailedLogins" 
              @change="markChanged"
            >
            {{ $t('security.log_failed_logins') || 'Rejestruj nieudane logowania' }}
          </label>
        </div>

        <div class="setting-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="securitySettings.logConfigChanges" 
              @change="markChanged"
            >
            {{ $t('security.log_config_changes') || 'Rejestruj zmiany konfiguracji' }}
          </label>
        </div>

        <div class="setting-group">
          <label>{{ $t('security.log_retention_days') || 'Przechowywanie logów (dni)' }}:</label>
          <input 
            type="number" 
            v-model="securitySettings.logRetentionDays" 
            @change="markChanged"
            min="30" 
            max="365"
          >
        </div>
      </div>
    </div>

    <!-- Active Sessions -->
    <div class="settings-section">
      <h3>{{ $t('security.active_sessions') || 'Aktywne sesje' }}</h3>
      
      <div class="sessions-table">
        <table>
          <thead>
            <tr>
              <th>{{ $t('security.user') || 'Użytkownik' }}</th>
              <th>{{ $t('security.role') || 'Rola' }}</th>
              <th>{{ $t('security.login_time') || 'Czas logowania' }}</th>
              <th>{{ $t('security.ip_address') || 'Adres IP' }}</th>
              <th>{{ $t('security.actions') || 'Akcje' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="session in activeSessions" :key="session.id">
              <td>{{ session.username }}</td>
              <td>
                <span :class="['role-badge', session.role.toLowerCase()]">
                  {{ session.role }}
                </span>
              </td>
              <td>{{ formatDateTime(session.loginTime) }}</td>
              <td>{{ session.ipAddress }}</td>
              <td>
                <button 
                  class="btn-action terminate" 
                  @click="terminateSession(session)"
                  :title="$t('security.terminate_session') || 'Zakończ sesję'"
                >
                  🚪
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Security Events -->
    <div class="settings-section">
      <h3>{{ $t('security.recent_events') || 'Ostatnie zdarzenia bezpieczeństwa' }}</h3>
      
      <div class="events-list">
        <div 
          v-for="event in recentSecurityEvents" 
          :key="event.id"
          class="event-item"
          :class="event.severity"
        >
          <div class="event-icon">{{ getEventIcon(event.type) }}</div>
          <div class="event-details">
            <div class="event-title">{{ event.title }}</div>
            <div class="event-description">{{ event.description }}</div>
            <div class="event-time">{{ formatDateTime(event.timestamp) }}</div>
          </div>
          <div class="event-severity">
            <span :class="['severity-badge', event.severity]">
              {{ $t(`security.${event.severity}`) || event.severity }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Changes Indicator -->
    <div v-if="hasUnsavedChanges" class="unsaved-changes">
      <div class="changes-indicator">
        <span class="changes-icon">⚠️</span>
        <span class="changes-text">{{ $t('security.unsaved_changes') || 'Masz niezapisane zmiany bezpieczeństwa' }}</span>
        <div class="changes-actions">
          <button class="btn btn-outline" @click="discardChanges">
            {{ $t('security.discard') || 'Odrzuć' }}
          </button>
          <button class="btn btn-success" @click="saveSecuritySettings">
            {{ $t('security.save') || 'Zapisz' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SecuritySettingsComponent',
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      hasUnsavedChanges: false,
      securitySettings: {
        passwordPolicy: 'medium',
        sessionTimeout: 60,
        maxFailedLogins: 5,
        lockoutDuration: 15,
        requireTwoFactor: false,
        enablePasswordExpiry: false,
        enableAuditLog: true,
        logFailedLogins: true,
        logConfigChanges: true,
        logRetentionDays: 90
      },
      activeSessions: [
        {
          id: 1,
          username: 'admin',
          role: 'ADMIN',
          loginTime: new Date().toISOString(),
          ipAddress: '192.168.1.100'
        },
        {
          id: 2,
          username: 'operator1',
          role: 'OPERATOR',
          loginTime: new Date(Date.now() - 3600000).toISOString(),
          ipAddress: '192.168.1.101'
        }
      ],
      recentSecurityEvents: [
        {
          id: 1,
          type: 'login_success',
          title: 'Udane logowanie',
          description: 'Użytkownik admin zalogował się pomyślnie',
          timestamp: new Date().toISOString(),
          severity: 'info'
        },
        {
          id: 2,
          type: 'login_failed',
          title: 'Nieudane logowanie',
          description: 'Nieudana próba logowania dla użytkownika test',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          severity: 'warning'
        },
        {
          id: 3,
          type: 'config_change',
          title: 'Zmiana konfiguracji',
          description: 'Zmieniono ustawienia bezpieczeństwa',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          severity: 'info'
        }
      ],
      lastAuditDate: '2025-01-20'
    }
  },
  computed: {
    securityLevel() {
      let score = 0;
      if (this.securitySettings.passwordPolicy === 'strict') score += 3;
      else if (this.securitySettings.passwordPolicy === 'medium') score += 2;
      else score += 1;
      
      if (this.securitySettings.requireTwoFactor) score += 2;
      if (this.securitySettings.enableAuditLog) score += 1;
      if (this.securitySettings.sessionTimeout <= 30) score += 1;
      
      if (score >= 6) return 'Wysoki';
      if (score >= 4) return 'Średni';
      return 'Niski';
    },
    
    securityLevelClass() {
      return {
        'security-high': this.securityLevel === 'Wysoki',
        'security-medium': this.securityLevel === 'Średni',
        'security-low': this.securityLevel === 'Niski'
      };
    },
    
    securityLevelDescription() {
      const descriptions = {
        'Wysoki': 'Zalecane dla środowisk produkcyjnych',
        'Średni': 'Odpowiedni dla większości zastosowań',
        'Niski': 'Wymaga poprawy zabezpieczeń'
      };
      return descriptions[this.securityLevel] || '';
    },
    
    activeSessionsCount() {
      return this.activeSessions.length;
    },
    
    failedLoginsToday() {
      return 3; // Mock data
    }
  },
  methods: {
    markChanged() {
      this.hasUnsavedChanges = true;
    },
    
    saveSecuritySettings() {
      console.log('Saving security settings:', this.securitySettings);
      setTimeout(() => {
        this.hasUnsavedChanges = false;
        this.showSuccessMessage(this.$t('security.settings_saved') || 'Ustawienia bezpieczeństwa zostały zapisane');
      }, 500);
    },
    
    discardChanges() {
      console.log('Discarding security changes');
      this.hasUnsavedChanges = false;
    },
    
    generateSecurityReport() {
      console.log('Generating security report');
    },
    
    terminateSession(session) {
      if (confirm(this.$t('security.confirm_terminate') || 'Czy na pewno chcesz zakończyć tę sesję?')) {
        this.activeSessions = this.activeSessions.filter(s => s.id !== session.id);
        console.log('Terminated session:', session.id);
      }
    },
    
    getEventIcon(type) {
      const icons = {
        'login_success': '✅',
        'login_failed': '❌',
        'config_change': '⚙️',
        'security_alert': '🚨',
        'default': '📋'
      };
      return icons[type] || icons.default;
    },
    
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('pl-PL');
    },
    
    formatDateTime(dateStr) {
      return new Date(dateStr).toLocaleString('pl-PL');
    },
    
    showSuccessMessage(message) {
      console.log('Success:', message);
    }
  }
}
</script>

<style scoped>
.security-settings {
  padding: 1rem;
}

.security-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.security-header h2 {
  margin: 0;
  color: #2c3e50;
}

.security-actions {
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

.security-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.overview-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.overview-card.info { border-left-color: #17a2b8; }
.overview-card.warning { border-left-color: #ffc107; }

.overview-card .value {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.value.security-high { color: #28a745; }
.value.security-medium { color: #ffc107; }
.value.security-low { color: #dc3545; }

.settings-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.settings-section h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.settings-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.sessions-table {
  overflow-x: auto;
}

.sessions-table table {
  width: 100%;
  border-collapse: collapse;
}

.sessions-table th,
.sessions-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.sessions-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.admin { background: #d4edda; color: #155724; }
.role-badge.operator { background: #d1ecf1; color: #0c5460; }

.btn-action {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action.terminate:hover {
  background: #f8d7da;
  border-color: #dc3545;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #17a2b8;
}

.event-item.warning { border-left-color: #ffc107; }
.event-item.error { border-left-color: #dc3545; }

.event-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.event-details {
  flex: 1;
}

.event-title {
  font-weight: 600;
  color: #2c3e50;
}

.event-description {
  color: #6c757d;
  font-size: 0.9rem;
}

.event-time {
  color: #6c757d;
  font-size: 0.8rem;
}

.severity-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.severity-badge.info { background: #d1ecf1; color: #0c5460; }
.severity-badge.warning { background: #fff3cd; color: #856404; }
.severity-badge.error { background: #f8d7da; color: #721c24; }

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
  .security-header {
    flex-direction: column;
    gap: 1rem;
  }

  .security-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .sessions-table {
    font-size: 0.9rem;
  }

  .event-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .changes-indicator {
    flex-direction: column;
    text-align: center;
  }
}
</style>
