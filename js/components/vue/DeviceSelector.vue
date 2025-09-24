<template>
  <div class="device-selector">
    <h3>{{ $t(TRANSLATION_KEYS.selectDevice) || 'Wybierz urządzenie' }}</h3>
    <div class="devices-list">
      <div 
        v-for="device in availableDevices" 
        :key="device.id"
        :class="['device-card', { 
          selected: selectedDevice === device.id,
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
            <span class="stat-label">{{ $t(TRANSLATION_KEYS.lastCalibration) || 'Ostatnia kalibracja' }}:</span>
            <span class="stat-value">{{ formatDate(device.lastCalibration) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">{{ $t(TRANSLATION_KEYS.testsToday) || 'Testy dzisiaj' }}:</span>
            <span class="stat-value">{{ device.testsToday }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeviceSelector',
  props: {
    selectedDevice: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Device configuration
      MAX_DEVICES_DISPLAY: 10,
      DEVICE_STATUS_REFRESH_INTERVAL: 30000, // 30 seconds
      
      // Animation and UI timing
      CARD_HOVER_TRANSFORM: 1, // px
      SELECTION_ANIMATION_DURATION: 200, // ms
      STATUS_UPDATE_ANIMATION: 300, // ms
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      CARD_MIN_HEIGHT: 120, // px
      
      // Date formatting
      DATE_FORMAT_OPTIONS: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      },
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        selectDevice: 'wizard.select_device',
        lastCalibration: 'wizard.last_calibration',
        testsToday: 'wizard.tests_today',
        deviceReady: 'device.ready',
        deviceBusy: 'device.busy',
        deviceOffline: 'device.offline',
        deviceUnavailable: 'device.unavailable',
        location: 'device.location',
        model: 'device.model',
        serialNumber: 'device.serial_number'
      },
      
      // Available devices configuration
      availableDevices: [
        {
          id: 'masktronic_c20_001',
          name: 'MASKTRONIC C20-001',
          model: 'C20 Standard',
          location: 'Stanowisko A1',
          status: 'ready',
          available: true,
          lastCalibration: '2025-01-20T09:00:00Z',
          testsToday: 12,
          serialNumber: 'MT-C20-001-2024'
        },
        {
          id: 'masktronic_c20_002',
          name: 'MASKTRONIC C20-002',
          model: 'C20 Advanced',
          location: 'Stanowisko B2',
          status: 'busy',
          available: false,
          lastCalibration: '2025-01-19T14:30:00Z',
          testsToday: 8,
          serialNumber: 'MT-C20-002-2024'
        },
        {
          id: 'masktronic_c20_003',
          name: 'MASKTRONIC C20-003',
          model: 'C20 Pro',
          location: 'Stanowisko C3',
          status: 'ready',
          available: true,
          lastCalibration: '2025-01-21T11:15:00Z',
          testsToday: 15,
          serialNumber: 'MT-C20-003-2024'
        },
        {
          id: 'masktronic_c20_004',
          name: 'MASKTRONIC C20-004',
          model: 'C20 Standard',
          location: 'Stanowisko D4',
          status: 'offline',
          available: false,
          lastCalibration: '2025-01-18T08:45:00Z',
          testsToday: 0,
          serialNumber: 'MT-C20-004-2024'
        }
      ],
      
      // Status refresh timer
      statusRefreshTimer: null
    }
  },
  methods: {
    selectDevice(deviceId) {
      const device = this.getDeviceById(deviceId);
      if (device && device.available) {
        this.$emit('device-selected', deviceId);
      }
    },
    
    getDeviceById(id) {
      return this.availableDevices.find(device => device.id === id);
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', this.DATE_FORMAT_OPTIONS);
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
      }
    },
    
    refreshDeviceStatuses() {
      // Simulate device status updates
      this.availableDevices.forEach(device => {
        // Random status changes for demo purposes
        if (Math.random() > 0.95) { // 5% chance of status change
          const statuses = ['ready', 'busy', 'offline'];
          const currentIndex = statuses.indexOf(device.status);
          device.status = statuses[(currentIndex + 1) % statuses.length];
          device.available = device.status === 'ready';
        }
      });
    },
    
    startStatusRefresh() {
      this.statusRefreshTimer = setInterval(() => {
        this.refreshDeviceStatuses();
      }, this.DEVICE_STATUS_REFRESH_INTERVAL);
    },
    
    stopStatusRefresh() {
      if (this.statusRefreshTimer) {
        clearInterval(this.statusRefreshTimer);
        this.statusRefreshTimer = null;
      }
    }
  },
  
  mounted() {
    this.startStatusRefresh();
  },
  
  beforeUnmount() {
    this.stopStatusRefresh();
  }
}
</script>

<style scoped>
.device-selector h3 {
  margin: 0 0 2rem 0;
  color: #2c3e50;
  text-align: center;
  font-size: 1.5rem;
}

.devices-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
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
  background: white;
  min-height: 120px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.device-card:hover:not(.unavailable) {
  border-color: #007bff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,123,255,0.15);
}

.device-card.selected {
  border-color: #007bff;
  background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
  box-shadow: 0 4px 12px rgba(0,123,255,0.2);
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
  position: relative;
}

.device-status.ready { 
  background: #28a745;
  box-shadow: 0 0 6px rgba(40, 167, 69, 0.5);
}

.device-status.busy { 
  background: #ffc107;
  box-shadow: 0 0 6px rgba(255, 193, 7, 0.5);
}

.device-status.offline { 
  background: #dc3545;
  box-shadow: 0 0 6px rgba(220, 53, 69, 0.5);
}

/* Pulsing animation for active statuses */
.device-status.ready::after,
.device-status.busy::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0.3;
  animation: statusPulse 2s infinite;
}

@keyframes statusPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.1;
  }
}

.device-info {
  flex: 1;
}

.device-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
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
  text-align: right;
  flex-shrink: 0;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.8rem;
}

.stat-value {
  color: #2c3e50;
  font-weight: 600;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .device-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }
  
  .device-info {
    width: 100%;
  }
  
  .device-stats {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
  
  .stat {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
  
  .device-selector h3 {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
  }
}

/* Very small screens */
@media (max-width: 350px) {
  .devices-list {
    gap: 0.75rem;
  }
  
  .device-card {
    padding: 0.75rem;
    min-height: 100px;
  }
  
  .device-name {
    font-size: 1rem;
  }
  
  .device-model,
  .device-location {
    font-size: 0.85rem;
  }
  
  .stat {
    font-size: 0.8rem;
  }
}

/* Touch-friendly enhancements */
.device-card {
  min-height: 44px; /* Touch target minimum */
}

.device-card:active:not(.unavailable) {
  transform: translateY(0);
  transition-duration: 0.1s;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .device-card {
    border-width: 3px;
  }
  
  .device-card.selected {
    border-width: 4px;
  }
  
  .device-status {
    border: 2px solid currentColor;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .device-card {
    transition: none;
  }
  
  .device-card:hover {
    transform: none;
  }
  
  .device-status.ready::after,
  .device-status.busy::after {
    animation: none;
  }
}

/* Selection animation */
.device-card.selected {
  animation: deviceSelect 0.3s ease-out;
}

@keyframes deviceSelect {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.01);
  }
  100% {
    transform: scale(1);
  }
}

/* Focus styles for accessibility */
.device-card:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Loading state */
.device-card.loading {
  opacity: 0.7;
  pointer-events: none;
}

.device-card.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
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

/* Unavailable overlay */
.device-card.unavailable::before {
  content: '🚫 ' + attr(data-unavailable-reason);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 249, 250, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #6c757d;
  border-radius: 6px;
}
</style>
