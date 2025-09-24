<template>
  <div class="network-settings">
    <h3>{{ $t(TRANSLATION_KEYS.network) || 'Ustawienia sieciowe' }}</h3>
    
    <div class="settings-grid">
      <div class="setting-group">
        <label :for="networkModeId">{{ $t(TRANSLATION_KEYS.networkMode) || 'Tryb sieciowy' }}:</label>
        <select 
          :id="networkModeId"
          :value="settings.networkMode" 
          @change="updateSetting('networkMode', $event.target.value)"
          class="setting-input"
        >
          <option value="dhcp">DHCP (Automatyczne)</option>
          <option value="static">Statyczne IP</option>
          <option value="wifi">Wi-Fi</option>
          <option value="ethernet">Ethernet</option>
        </select>
      </div>

      <div v-if="settings.networkMode === 'static'" class="static-network-group">
        <div class="setting-group">
          <label :for="ipAddressId">{{ $t(TRANSLATION_KEYS.ipAddress) || 'Adres IP' }}:</label>
          <input 
            :id="ipAddressId"
            type="text" 
            :value="settings.ipAddress" 
            @input="updateSetting('ipAddress', $event.target.value)"
            placeholder="192.168.1.100"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
            class="setting-input"
          />
        </div>

        <div class="setting-group">
          <label :for="subnetMaskId">{{ $t(TRANSLATION_KEYS.subnetMask) || 'Maska podsieci' }}:</label>
          <input 
            :id="subnetMaskId"
            type="text" 
            :value="settings.subnetMask" 
            @input="updateSetting('subnetMask', $event.target.value)"
            placeholder="255.255.255.0"
            class="setting-input"
          />
        </div>

        <div class="setting-group">
          <label :for="gatewayId">{{ $t(TRANSLATION_KEYS.gateway) || 'Brama domyślna' }}:</label>
          <input 
            :id="gatewayId"
            type="text" 
            :value="settings.gateway" 
            @input="updateSetting('gateway', $event.target.value)"
            placeholder="192.168.1.1"
            class="setting-input"
          />
        </div>
      </div>

      <div class="setting-group">
        <label :for="dnsServersId">{{ $t(TRANSLATION_KEYS.dnsServers) || 'Serwery DNS' }}:</label>
        <input 
          :id="dnsServersId"
          type="text" 
          :value="settings.dnsServers" 
          @input="updateSetting('dnsServers', $event.target.value)"
          placeholder="8.8.8.8, 8.8.4.4"
          class="setting-input"
        />
        <small class="setting-help">
          {{ $t(TRANSLATION_KEYS.dnsServersHelp) || 'Oddziel adresy przecinkami' }}
        </small>
      </div>

      <div class="setting-group">
        <label :for="apiTimeoutId">{{ $t(TRANSLATION_KEYS.apiTimeout) || 'Timeout API' }}:</label>
        <div class="input-group">
          <input 
            :id="apiTimeoutId"
            type="number" 
            :value="settings.apiTimeout" 
            @input="updateSetting('apiTimeout', parseInt($event.target.value))"
            :min="MIN_API_TIMEOUT" 
            :max="MAX_API_TIMEOUT"
            class="setting-input"
          />
          <span class="input-unit">{{ $t(TRANSLATION_KEYS.seconds) || 'sekund' }}</span>
        </div>
      </div>

      <div class="setting-group checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="settings.enableSSL"
            @change="updateSetting('enableSSL', $event.target.checked)"
            class="checkbox-input"
          />
          <span class="checkmark"></span>
          <span class="checkbox-text">
            {{ $t(TRANSLATION_KEYS.enableSSL) || 'Włącz SSL/TLS' }}
          </span>
        </label>
        <small class="setting-help">
          {{ $t(TRANSLATION_KEYS.sslHelp) || 'Szyfruje komunikację z serwerem' }}
        </small>
      </div>

      <div class="setting-group checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="settings.enableFirewall || false"
            @change="updateSetting('enableFirewall', $event.target.checked)"
            class="checkbox-input"
          />
          <span class="checkmark"></span>
          <span class="checkbox-text">
            {{ $t(TRANSLATION_KEYS.enableFirewall) || 'Włącz zaporę sieciową' }}
          </span>
        </label>
      </div>

      <div class="setting-group">
        <label :for="portId">{{ $t(TRANSLATION_KEYS.port) || 'Port komunikacji' }}:</label>
        <input 
          :id="portId"
          type="number" 
          :value="settings.port || 8080" 
          @input="updateSetting('port', parseInt($event.target.value))"
          :min="MIN_PORT" 
          :max="MAX_PORT"
          class="setting-input"
        />
      </div>
    </div>

    <!-- Network Status -->
    <div class="network-status">
      <h4>{{ $t(TRANSLATION_KEYS.networkStatus) || 'Status sieci' }}</h4>
      <div class="status-grid">
        <div class="status-item">
          <span class="status-label">{{ $t(TRANSLATION_KEYS.connectionStatus) || 'Status połączenia' }}:</span>
          <span :class="['status-value', connectionStatus.toLowerCase()]">
            {{ getConnectionStatusLabel(connectionStatus) }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">{{ $t(TRANSLATION_KEYS.currentIP) || 'Aktualny IP' }}:</span>
          <span class="status-value">{{ currentNetworkInfo.ip || 'N/A' }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">{{ $t(TRANSLATION_KEYS.signalStrength) || 'Siła sygnału' }}:</span>
          <span class="status-value">{{ currentNetworkInfo.signalStrength || 'N/A' }}</span>
        </div>
      </div>
      
      <div class="network-actions">
        <button @click="testConnection" class="btn btn-info" :disabled="testing">
          {{ testing ? ($t(TRANSLATION_KEYS.testing) || 'Testowanie...') : ($t(TRANSLATION_KEYS.testConnection) || 'Testuj połączenie') }}
        </button>
        <button @click="refreshNetworkInfo" class="btn btn-secondary">
          {{ $t(TRANSLATION_KEYS.refresh) || 'Odśwież' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NetworkSettings',
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
      MIN_API_TIMEOUT: 5, // seconds
      MAX_API_TIMEOUT: 300, // 5 minutes
      MIN_PORT: 1024,
      MAX_PORT: 65535,
      
      // Network validation patterns
      IP_PATTERN: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      DNS_PATTERN: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\s*,\s*((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))*$/,
      
      // Network status
      connectionStatus: 'connected',
      currentNetworkInfo: {
        ip: '192.168.1.100',
        signalStrength: '85%'
      },
      testing: false,
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      INPUT_MIN_HEIGHT: 40, // px
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        network: 'settings.network',
        networkMode: 'settings.network_mode',
        ipAddress: 'settings.ip_address',
        subnetMask: 'settings.subnet_mask',
        gateway: 'settings.gateway',
        dnsServers: 'settings.dns_servers',
        dnsServersHelp: 'settings.dns_servers_help',
        apiTimeout: 'settings.api_timeout',
        enableSSL: 'settings.enable_ssl',
        sslHelp: 'settings.ssl_help',
        enableFirewall: 'settings.enable_firewall',
        port: 'settings.port',
        networkStatus: 'settings.network_status',
        connectionStatus: 'settings.connection_status',
        currentIP: 'settings.current_ip',
        signalStrength: 'settings.signal_strength',
        testConnection: 'settings.test_connection',
        testing: 'settings.testing',
        refresh: 'settings.refresh',
        seconds: 'settings.seconds'
      }
    }
  },
  computed: {
    networkModeId() {
      return `network-mode-${this.$attrs.id || 'default'}`;
    },
    ipAddressId() {
      return `ip-address-${this.$attrs.id || 'default'}`;
    },
    subnetMaskId() {
      return `subnet-mask-${this.$attrs.id || 'default'}`;
    },
    gatewayId() {
      return `gateway-${this.$attrs.id || 'default'}`;
    },
    dnsServersId() {
      return `dns-servers-${this.$attrs.id || 'default'}`;
    },
    apiTimeoutId() {
      return `api-timeout-${this.$attrs.id || 'default'}`;
    },
    portId() {
      return `port-${this.$attrs.id || 'default'}`;
    }
  },
  methods: {
    updateSetting(key, value) {
      // Validate network-specific values
      if (key === 'ipAddress' && value && !this.IP_PATTERN.test(value)) {
        return; // Invalid IP format
      }
      if (key === 'apiTimeout') {
        value = Math.max(this.MIN_API_TIMEOUT, Math.min(this.MAX_API_TIMEOUT, value));
      }
      if (key === 'port') {
        value = Math.max(this.MIN_PORT, Math.min(this.MAX_PORT, value));
      }
      
      this.$emit('setting-updated', { key, value });
    },
    
    async testConnection() {
      this.testing = true;
      try {
        // Simulate connection test
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.connectionStatus = 'connected';
        this.$emit('network-test-result', { success: true });
      } catch (error) {
        this.connectionStatus = 'disconnected';
        this.$emit('network-test-result', { success: false, error });
      } finally {
        this.testing = false;
      }
    },
    
    async refreshNetworkInfo() {
      try {
        // Simulate network info refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.currentNetworkInfo = {
          ip: '192.168.1.100',
          signalStrength: '88%'
        };
      } catch (error) {
        console.error('Failed to refresh network info:', error);
      }
    },
    
    getConnectionStatusLabel(status) {
      const statusLabels = {
        connected: this.$t('settings.connected') || 'Połączony',
        disconnected: this.$t('settings.disconnected') || 'Rozłączony',
        connecting: this.$t('settings.connecting') || 'Łączenie...'
      };
      return statusLabels[status] || status;
    },
    
    validateIPAddress(ip) {
      return this.IP_PATTERN.test(ip);
    }
  },
  
  mounted() {
    this.refreshNetworkInfo();
  }
}
</script>

<style scoped>
.network-settings h3 {
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
  margin-bottom: 2rem;
}

.static-network-group {
  grid-column: 1 / -1;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007bff;
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

/* Network Status Section */
.network-status {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.network-status h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.status-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-bottom: 1.5rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.status-label {
  font-weight: 600;
  color: #495057;
}

.status-value {
  font-weight: 500;
  color: #2c3e50;
}

.status-value.connected {
  color: #28a745;
}

.status-value.disconnected {
  color: #dc3545;
}

.status-value.connecting {
  color: #ffc107;
}

.network-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  min-height: 44px;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #117a8b;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .settings-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .static-network-group {
    grid-template-columns: 1fr;
  }
  
  .setting-input {
    padding: 0.6rem;
    font-size: 0.85rem;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .status-item {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .network-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

.setting-input:focus,
.checkbox-label:focus-within {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Network security indicators */
.setting-group:has(.checkbox-input:checked) {
  background: #f0f9f0;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #28a745;
}

/* IP validation styling */
.setting-input:invalid {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
}

.setting-input:valid {
  border-color: #28a745;
}
</style>
