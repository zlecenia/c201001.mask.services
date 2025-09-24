<template>
  <div class="system-integration">
    <div class="integration-header">
      <h2>🔗 {{ $t('integration.system_integration') || 'Integracje systemowe' }}</h2>
      <div class="integration-actions">
        <button class="btn btn-primary" @click="addIntegration">
          ➕ {{ $t('integration.add_integration') || 'Dodaj integrację' }}
        </button>
        <button class="btn btn-info" @click="testAllConnections">
          🔍 {{ $t('integration.test_all') || 'Testuj wszystkie' }}
        </button>
      </div>
    </div>

    <!-- Integration Overview -->
    <div class="integration-overview">
      <div class="overview-card">
        <h4>{{ $t('integration.total_integrations') || 'Łączne integracje' }}</h4>
        <span class="value">{{ totalIntegrations }}</span>
        <small>{{ $t('integration.configured') || 'skonfigurowanych' }}</small>
      </div>
      <div class="overview-card success">
        <h4>{{ $t('integration.active_connections') || 'Aktywne połączenia' }}</h4>
        <span class="value">{{ activeConnections }}</span>
        <small>{{ $t('integration.working') || 'działających' }}</small>
      </div>
      <div class="overview-card warning">
        <h4>{{ $t('integration.failed_connections') || 'Błędne połączenia' }}</h4>
        <span class="value">{{ failedConnections }}</span>
        <small>{{ $t('integration.errors') || 'błędów' }}</small>
      </div>
      <div class="overview-card info">
        <h4>{{ $t('integration.last_sync') || 'Ostatnia synchronizacja' }}</h4>
        <span class="value">{{ formatTime(lastSyncTime) }}</span>
        <small>{{ $t('integration.ago') || 'temu' }}</small>
      </div>
    </div>

    <!-- Integration Categories -->
    <div class="integration-categories">
      <div class="category-tabs">
        <button 
          v-for="category in categories" 
          :key="category.id"
          :class="['tab-btn', { active: activeCategory === category.id }]"
          @click="setActiveCategory(category.id)"
        >
          {{ category.icon }} {{ $t(category.nameKey) || category.name }}
        </button>
      </div>

      <!-- Database Integrations -->
      <div v-if="activeCategory === 'database'" class="integration-section">
        <h3>{{ $t('integration.database_connections') || 'Połączenia z bazami danych' }}</h3>
        <div class="integrations-grid">
          <div 
            v-for="db in databaseIntegrations" 
            :key="db.id"
            class="integration-card"
            :class="getConnectionClass(db.status)"
          >
            <div class="integration-icon">{{ db.icon }}</div>
            <div class="integration-info">
              <h4>{{ db.name }}</h4>
              <p>{{ db.description }}</p>
              <div class="connection-details">
                <span class="detail">{{ $t('integration.host') || 'Host' }}: {{ db.host }}</span>
                <span class="detail">{{ $t('integration.port') || 'Port' }}: {{ db.port }}</span>
                <span class="detail">{{ $t('integration.database') || 'Baza' }}: {{ db.database }}</span>
              </div>
            </div>
            <div class="integration-status">
              <span :class="['status-indicator', db.status.toLowerCase()]"></span>
              <span class="status-text">{{ $t(`integration.${db.status.toLowerCase()}`) || db.status }}</span>
            </div>
            <div class="integration-actions">
              <button class="btn-action" @click="testConnection(db)" title="Testuj">🔍</button>
              <button class="btn-action" @click="configureIntegration(db)" title="Konfiguruj">⚙️</button>
              <button 
                class="btn-action toggle" 
                @click="toggleIntegration(db)" 
                :title="db.enabled ? 'Wyłącz' : 'Włącz'"
              >
                {{ db.enabled ? '⏸️' : '▶️' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- API Integrations -->
      <div v-if="activeCategory === 'api'" class="integration-section">
        <h3>{{ $t('integration.api_connections') || 'Integracje API' }}</h3>
        <div class="integrations-grid">
          <div 
            v-for="api in apiIntegrations" 
            :key="api.id"
            class="integration-card"
            :class="getConnectionClass(api.status)"
          >
            <div class="integration-icon">{{ api.icon }}</div>
            <div class="integration-info">
              <h4>{{ api.name }}</h4>
              <p>{{ api.description }}</p>
              <div class="connection-details">
                <span class="detail">{{ $t('integration.endpoint') || 'Endpoint' }}: {{ api.endpoint }}</span>
                <span class="detail">{{ $t('integration.version') || 'Wersja' }}: {{ api.version }}</span>
                <span class="detail">{{ $t('integration.auth') || 'Uwierzytelnienie' }}: {{ api.authType }}</span>
              </div>
            </div>
            <div class="integration-status">
              <span :class="['status-indicator', api.status.toLowerCase()]"></span>
              <span class="status-text">{{ $t(`integration.${api.status.toLowerCase()}`) || api.status }}</span>
            </div>
            <div class="integration-actions">
              <button class="btn-action" @click="testConnection(api)" title="Testuj">🔍</button>
              <button class="btn-action" @click="configureIntegration(api)" title="Konfiguruj">⚙️</button>
              <button 
                class="btn-action toggle" 
                @click="toggleIntegration(api)" 
                :title="api.enabled ? 'Wyłącz' : 'Włącz'"
              >
                {{ api.enabled ? '⏸️' : '▶️' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Hardware Integrations -->
      <div v-if="activeCategory === 'hardware'" class="integration-section">
        <h3>{{ $t('integration.hardware_connections') || 'Połączenia sprzętowe' }}</h3>
        <div class="integrations-grid">
          <div 
            v-for="hw in hardwareIntegrations" 
            :key="hw.id"
            class="integration-card"
            :class="getConnectionClass(hw.status)"
          >
            <div class="integration-icon">{{ hw.icon }}</div>
            <div class="integration-info">
              <h4>{{ hw.name }}</h4>
              <p>{{ hw.description }}</p>
              <div class="connection-details">
                <span class="detail">{{ $t('integration.interface') || 'Interfejs' }}: {{ hw.interface }}</span>
                <span class="detail">{{ $t('integration.address') || 'Adres' }}: {{ hw.address }}</span>
                <span class="detail">{{ $t('integration.protocol') || 'Protokół' }}: {{ hw.protocol }}</span>
              </div>
            </div>
            <div class="integration-status">
              <span :class="['status-indicator', hw.status.toLowerCase()]"></span>
              <span class="status-text">{{ $t(`integration.${hw.status.toLowerCase()}`) || hw.status }}</span>
            </div>
            <div class="integration-actions">
              <button class="btn-action" @click="testConnection(hw)" title="Testuj">🔍</button>
              <button class="btn-action" @click="configureIntegration(hw)" title="Konfiguruj">⚙️</button>
              <button 
                class="btn-action toggle" 
                @click="toggleIntegration(hw)" 
                :title="hw.enabled ? 'Wyłącz' : 'Włącz'"
              >
                {{ hw.enabled ? '⏸️' : '▶️' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuration Modal -->
    <div v-if="showConfigModal" class="modal-overlay" @click="closeConfigModal">
      <div class="modal-content config-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('integration.configure') || 'Konfiguracja' }}: {{ selectedIntegration?.name }}</h3>
          <button class="close-btn" @click="closeConfigModal">×</button>
        </div>
        <div class="modal-body">
          <div class="config-form" v-if="selectedIntegration">
            <div class="form-group">
              <label>{{ $t('integration.name') || 'Nazwa' }}:</label>
              <input type="text" v-model="configForm.name">
            </div>
            <div class="form-group">
              <label>{{ $t('integration.description') || 'Opis' }}:</label>
              <textarea v-model="configForm.description"></textarea>
            </div>
            <div class="form-group" v-if="selectedIntegration.type === 'database'">
              <label>{{ $t('integration.connection_string') || 'String połączenia' }}:</label>
              <input type="text" v-model="configForm.connectionString">
            </div>
            <div class="form-group" v-if="selectedIntegration.type === 'api'">
              <label>{{ $t('integration.api_key') || 'Klucz API' }}:</label>
              <input type="password" v-model="configForm.apiKey">
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="configForm.enabled">
                {{ $t('integration.enable_integration') || 'Włącz integrację' }}
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeConfigModal">
            {{ $t('common.cancel') || 'Anuluj' }}
          </button>
          <button class="btn btn-primary" @click="saveConfiguration">
            {{ $t('common.save') || 'Zapisz' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemIntegrationComponent',
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      activeCategory: 'database',
      showConfigModal: false,
      selectedIntegration: null,
      configForm: {
        name: '',
        description: '',
        connectionString: '',
        apiKey: '',
        enabled: false
      },
      categories: [
        { id: 'database', nameKey: 'integration.database', name: 'Bazy danych', icon: '🗄️' },
        { id: 'api', nameKey: 'integration.api', name: 'API', icon: '🔗' },
        { id: 'hardware', nameKey: 'integration.hardware', name: 'Sprzęt', icon: '🔧' }
      ],
      databaseIntegrations: [
        {
          id: 1,
          name: 'PostgreSQL Main',
          description: 'Główna baza danych testów',
          type: 'database',
          icon: '🐘',
          host: 'localhost',
          port: 5432,
          database: 'maskservice',
          status: 'CONNECTED',
          enabled: true
        },
        {
          id: 2,
          name: 'MySQL Archive',
          description: 'Archiwum historycznych danych',
          type: 'database',
          icon: '🐬',
          host: '192.168.1.100',
          port: 3306,
          database: 'archive',
          status: 'DISCONNECTED',
          enabled: false
        }
      ],
      apiIntegrations: [
        {
          id: 3,
          name: 'Quality Management API',
          description: 'System zarządzania jakością',
          type: 'api',
          icon: '📊',
          endpoint: 'https://qms.company.com/api/v1',
          version: 'v1.2',
          authType: 'Bearer Token',
          status: 'CONNECTED',
          enabled: true
        },
        {
          id: 4,
          name: 'Notification Service',
          description: 'Serwis powiadomień email/SMS',
          type: 'api',
          icon: '📧',
          endpoint: 'https://notify.service.com/api',
          version: 'v2.0',
          authType: 'API Key',
          status: 'ERROR',
          enabled: true
        }
      ],
      hardwareIntegrations: [
        {
          id: 5,
          name: 'MASKTRONIC C20-001',
          description: 'Urządzenie testujące maski',
          type: 'hardware',
          icon: '🔬',
          interface: 'USB',
          address: 'COM3',
          protocol: 'Modbus RTU',
          status: 'CONNECTED',
          enabled: true
        },
        {
          id: 6,
          name: 'Czujnik ciśnienia',
          description: 'Zewnętrzny czujnik ciśnienia',
          type: 'hardware',
          icon: '📏',
          interface: 'RS485',
          address: '192.168.1.200',
          protocol: 'Modbus TCP',
          status: 'DISCONNECTED',
          enabled: false
        }
      ],
      lastSyncTime: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
    }
  },
  computed: {
    totalIntegrations() {
      return this.databaseIntegrations.length + this.apiIntegrations.length + this.hardwareIntegrations.length;
    },
    
    activeConnections() {
      const allIntegrations = [...this.databaseIntegrations, ...this.apiIntegrations, ...this.hardwareIntegrations];
      return allIntegrations.filter(i => i.status === 'CONNECTED').length;
    },
    
    failedConnections() {
      const allIntegrations = [...this.databaseIntegrations, ...this.apiIntegrations, ...this.hardwareIntegrations];
      return allIntegrations.filter(i => i.status === 'ERROR' || i.status === 'DISCONNECTED').length;
    }
  },
  methods: {
    setActiveCategory(categoryId) {
      this.activeCategory = categoryId;
    },
    
    getConnectionClass(status) {
      return {
        'connected': status === 'CONNECTED',
        'disconnected': status === 'DISCONNECTED',
        'error': status === 'ERROR'
      };
    },
    
    testConnection(integration) {
      console.log('Testing connection:', integration.name);
      // Simulate connection test
      integration.status = 'TESTING';
      setTimeout(() => {
        integration.status = Math.random() > 0.7 ? 'ERROR' : 'CONNECTED';
      }, 2000);
    },
    
    configureIntegration(integration) {
      this.selectedIntegration = integration;
      this.configForm = {
        name: integration.name,
        description: integration.description,
        connectionString: integration.connectionString || '',
        apiKey: integration.apiKey || '',
        enabled: integration.enabled
      };
      this.showConfigModal = true;
    },
    
    toggleIntegration(integration) {
      integration.enabled = !integration.enabled;
      if (!integration.enabled) {
        integration.status = 'DISCONNECTED';
      }
      console.log(`Integration ${integration.name} ${integration.enabled ? 'enabled' : 'disabled'}`);
    },
    
    addIntegration() {
      console.log('Adding new integration');
      // Implementation for adding new integration
    },
    
    testAllConnections() {
      console.log('Testing all connections');
      const allIntegrations = [...this.databaseIntegrations, ...this.apiIntegrations, ...this.hardwareIntegrations];
      allIntegrations.filter(i => i.enabled).forEach(integration => {
        this.testConnection(integration);
      });
    },
    
    saveConfiguration() {
      if (this.selectedIntegration) {
        Object.assign(this.selectedIntegration, this.configForm);
        console.log('Configuration saved:', this.configForm);
      }
      this.closeConfigModal();
    },
    
    closeConfigModal() {
      this.showConfigModal = false;
      this.selectedIntegration = null;
    },
    
    formatTime(dateStr) {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffMinutes < 60) {
        return `${diffMinutes} min`;
      } else if (diffMinutes < 1440) {
        return `${Math.floor(diffMinutes / 60)} h`;
      } else {
        return `${Math.floor(diffMinutes / 1440)} dni`;
      }
    }
  }
}
</script>

<style scoped>
.system-integration {
  padding: 1rem;
}

.integration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.integration-header h2 {
  margin: 0;
  color: #2c3e50;
}

.integration-actions {
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

.btn-primary { background: #007bff; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-info { background: #17a2b8; color: white; }

.btn:hover { transform: translateY(-1px); }

.integration-overview {
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

.overview-card.success { border-left-color: #28a745; }
.overview-card.warning { border-left-color: #ffc107; }
.overview-card.info { border-left-color: #17a2b8; }

.overview-card .value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.category-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e9ecef;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #6c757d;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  font-weight: 600;
}

.tab-btn.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-btn:hover {
  color: #007bff;
}

.integration-section h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
}

.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));  
  gap: 1.5rem;
}

.integration-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #6c757d;
  transition: all 0.3s ease;
}

.integration-card.connected {
  border-left-color: #28a745;
}

.integration-card.disconnected {
  border-left-color: #ffc107;
}

.integration-card.error {
  border-left-color: #dc3545;
}

.integration-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.integration-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
}

.integration-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.integration-info p {
  margin: 0 0 1rem 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.connection-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.detail {
  font-size: 0.8rem;
  color: #6c757d;
}

.integration-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.connected { background: #28a745; }
.status-indicator.disconnected { background: #ffc107; }
.status-indicator.error { background: #dc3545; }

.status-text {
  font-size: 0.9rem;
  font-weight: 600;
}

.integration-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-action {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.btn-action:hover { background: #e9ecef; }
.btn-action.toggle:hover { background: #fff3cd; }

/* Modal Styles */
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
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 1.5rem;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #495057;
}

.form-group input,
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.form-group label input[type="checkbox"] {
  margin-right: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

/* Mobile optimizations */
@media (max-width: 450px) {
  .integration-header {
    flex-direction: column;
    gap: 1rem;
  }

  .integration-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-tabs {
    flex-direction: column;
  }

  .integrations-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .connection-details {
    font-size: 0.75rem;
  }
}
</style>
