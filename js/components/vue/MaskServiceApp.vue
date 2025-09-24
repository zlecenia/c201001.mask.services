<template>
  <div id="app" class="container">
    <!-- Header Component -->
    <AppHeader 
      :device-status="deviceStatus"
      :device-info="deviceInfo"
      @language-changed="handleLanguageChange"
    />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Login Screen -->
      <LoginScreen 
        v-if="!currentUser"
        @user-logged-in="handleUserLogin"
      />

      <!-- User Menu Screen -->
      <UserMenuScreen 
        v-else
        :current-user="currentUser"
        :menu-items="userMenuItems"
        @menu-selected="handleMenuSelection"
        @logout="handleLogout"
      />
    </main>

    <!-- Pressure Panel -->
    <PressurePanel 
      v-if="showPressurePanel"
      :pressure-data="pressureData"
    />

    <!-- Footer Component -->
    <AppFooter 
      :current-user="currentUser"
      :current-time="currentTime"
    />
  </div>
</template>

<script>
export default {
  name: 'MaskServiceApp',
  components: {
    AppHeader: () => import('./AppHeader.vue'),
    AppFooter: () => import('./AppFooter.vue'),
    LoginScreen: () => import('./LoginScreen.vue'),
    UserMenuScreen: () => import('./UserMenuScreen.vue'),
    PressurePanel: () => import('./PressurePanel.vue')
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Application configuration
      APP_NAME: 'MASKSERVICE C20',
      APP_VERSION: '3.0',
      DEFAULT_DEVICE_NAME: 'CONNECT',
      DEFAULT_DEVICE_TYPE: '500',
      
      // Device status types
      DEVICE_STATUS_TYPES: {
        ONLINE: 'ONLINE',
        OFFLINE: 'OFFLINE',
        CONNECTING: 'CONNECTING',
        ERROR: 'ERROR'
      },
      
      // Timer intervals
      TIME_UPDATE_INTERVAL: 1000, // ms
      PRESSURE_SIMULATION_INTERVAL: 1000, // ms
      
      // Pressure simulation configuration
      PRESSURE_DEFAULTS: {
        low: { value: 10, unit: 'mbar', range: [8, 12] },
        medium: { value: 20, unit: 'bar', range: [18, 22] },
        high: { value: 30, unit: 'bar', range: [28, 32] }
      },
      PRESSURE_HISTORY_LENGTH: 60, // data points
      
      // Component visibility rules
      PRESSURE_PANEL_ROLES: ['OPERATOR', 'SERWISANT'],
      
      // Animation configuration
      TRANSITION_DURATION: 300, // ms
      COMPONENT_FADE_DURATION: 300, // ms
      
      // Mobile configuration (for 400x1280 display)
      MOBILE_BREAKPOINT: 450, // px
      TOUCH_TARGET_MIN_SIZE: 44, // px
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        // Application titles
        appTitle: 'app.title',
        appVersion: 'app.version',
        
        // Device status
        deviceOnline: 'device.online',
        deviceOffline: 'device.offline',
        deviceConnecting: 'device.connecting',
        deviceError: 'device.error',
        
        // Navigation
        menuNavigation: 'menu.navigation',
        userLoggedIn: 'user.logged_in',
        userLoggedOut: 'user.logged_out',
        
        // Roles
        roleOperator: 'roles.OPERATOR',
        roleAdmin: 'roles.ADMIN',
        roleServiceuser: 'roles.SERVICEUSER',
        roleSuperuser: 'roles.SUPERUSER',
        
        // Menu items
        testWizard: 'menu.test_wizard',
        quickTest: 'menu.quick_test',
        testScenarios: 'menu.test_scenarios',
        deviceHistory: 'menu.device_history',
        reportsView: 'menu.reports_view',
        reportsBatch: 'menu.reports_batch',
        reportsSchedule: 'menu.reports_schedule',
        usersManagement: 'menu.users_management',
        systemSettings: 'menu.system_settings',
        workshopInventory: 'menu.workshop_inventory',
        workshopMaintenance: 'menu.workshop_maintenance',
        workshopParts: 'menu.workshop_parts',
        workshopTools: 'menu.workshop_tools',
        deviceDiagnostics: 'menu.device_diagnostics',
        systemConfig: 'menu.system_config',
        advancedDiagnostics: 'menu.advanced_diagnostics',
        securitySettings: 'menu.security_settings',
        backupRestore: 'menu.backup_restore',
        auditLogs: 'menu.audit_logs',
        networkConfig: 'menu.network_config',
        
        // Menu descriptions
        guidedTestSetup: 'menu.guided_test_setup',
        fastDeviceTesting: 'menu.fast_device_testing',
        advancedTestConfig: 'menu.advanced_test_config',
        manageTestTemplates: 'menu.manage_test_templates',
        viewTestHistory: 'menu.view_test_history',
        browseTestReports: 'menu.browse_test_reports',
        generateBulkReports: 'menu.generate_bulk_reports',
        automatedReporting: 'menu.automated_reporting',
        manageSystemUsers: 'menu.manage_system_users',
        configureSystem: 'menu.configure_system',
        manageSpareParts: 'menu.manage_spare_parts',
        scheduleMaintenance: 'menu.schedule_maintenance',
        partsCatalog: 'menu.parts_catalog',
        calibrationTools: 'menu.calibration_tools',
        deviceAnalysis: 'menu.device_analysis',
        coreSystemSettings: 'menu.core_system_settings',
        deepSystemAnalysis: 'menu.deep_system_analysis',
        securityConfiguration: 'menu.security_configuration',
        dataManagement: 'menu.data_management',
        systemAuditTrail: 'menu.system_audit_trail',
        networkSettings: 'menu.network_settings',
        
        // System messages
        appInitialized: 'system.app_initialized',
        languageChanged: 'system.language_changed',
        loading: 'global.loading'
      },
      
      // Component state variables
      currentUser: null,
      deviceStatus: 'OFFLINE',
      deviceInfo: {
        name: 'CONNECT',
        type: '500',
        url: 'c201001.mask.services'
      },
      currentTime: new Date().toLocaleTimeString(),
      pressureData: {
        low: { value: 10, unit: 'mbar', history: Array(60).fill(10) },
        medium: { value: 20, unit: 'bar', history: Array(60).fill(20) },
        high: { value: 30, unit: 'bar', history: Array(60).fill(30) }
      },
      menuSelectionHistory: [],
      
      // Timer references
      timeInterval: null,
      pressureSimulation: null
    }
  },
  computed: {
    showPressurePanel() {
      return this.currentUser && ['OPERATOR', 'SERWISANT'].includes(this.currentUser.role);
    },
    
    userMenuItems() {
      if (!this.currentUser) return [];
      
      const menuConfig = {
        OPERATOR: [
          { id: 'test_wizard', icon: '🧙', label: 'Test Wizard', description: 'Guided test setup' },
          { id: 'test_quick', icon: '⚡', label: 'Quick Test', description: 'Fast device testing' },
          { id: 'device_history', icon: '📜', label: 'Device History', description: 'View test history' },
          { id: 'reports_view', icon: '📄', label: 'View Reports', description: 'Browse test reports' }
        ],
        ADMIN: [
          { id: 'test_wizard', icon: '🧙', label: 'Test Wizard', description: 'Advanced test configuration' },
          { id: 'test_scenarios', icon: '📋', label: 'Test Scenarios', description: 'Manage test templates' },
          { id: 'reports_batch', icon: '📊', label: 'Batch Reports', description: 'Generate bulk reports' },
          { id: 'reports_schedule', icon: '⏰', label: 'Report Schedule', description: 'Automated reporting' },
          { id: 'users_management', icon: '👥', label: 'User Management', description: 'Manage system users' },
          { id: 'settings_system', icon: '⚙️', label: 'System Settings', description: 'Configure system' }
        ],
        SERVICEUSER: [
          { id: 'workshop_inventory', icon: '📦', label: 'Inventory', description: 'Manage spare parts' },
          { id: 'workshop_maintenance', icon: '🔧', label: 'Maintenance', description: 'Schedule maintenance' },
          { id: 'workshop_parts', icon: '🛠️', label: 'Spare Parts', description: 'Parts catalog' },
          { id: 'workshop_tools', icon: '🔨', label: 'Tools', description: 'Calibration tools' },
          { id: 'device_diagnostics', icon: '🔍', label: 'Diagnostics', description: 'Device analysis' }
        ],
        SUPERUSER: [
          { id: 'system_config', icon: '🔧', label: 'System Config', description: 'Core system settings' },
          { id: 'advanced_diagnostics', icon: '🔬', label: 'Advanced Diagnostics', description: 'Deep system analysis' },
          { id: 'security_settings', icon: '🔐', label: 'Security', description: 'Security configuration' },
          { id: 'backup_restore', icon: '💾', label: 'Backup & Restore', description: 'Data management' },
          { id: 'audit_logs', icon: '📋', label: 'Audit Logs', description: 'System audit trail' },
          { id: 'network_config', icon: '🌐', label: 'Network Config', description: 'Network settings' }
        ]
      };
      
      return menuConfig[this.currentUser.role] || [];
    }
  },
  methods: {
    handleUserLogin(userData) {
      this.currentUser = userData;
      this.deviceStatus = 'ONLINE';
      this.startPressureSimulation();
      console.log(`🎯 User logged in: ${userData.role}`);
    },
    
    handleLogout() {
      this.currentUser = null;
      this.deviceStatus = 'OFFLINE';
      this.menuSelectionHistory = [];
      console.log('👋 User logged out');
    },
    
    handleMenuSelection(menuItem) {
      this.menuSelectionHistory.push({
        item: menuItem,
        timestamp: new Date().toISOString()
      });
      
      console.log(`📂 Menu selected: ${menuItem.id}`);
      
      // Emit to parent or handle navigation
      this.$emit('menu-navigation', menuItem);
    },
    
    handleLanguageChange(language) {
      this.$emit('language-changed', language);
      console.log(`🌐 Language changed to: ${language}`);
    },
    
    startPressureSimulation() {
      if (this.pressureSimulation) {
        clearInterval(this.pressureSimulation);
      }
      
      this.pressureSimulation = setInterval(() => {
        this.updatePressureData('low', 10 + Math.random() * 2);
        this.updatePressureData('medium', 20 + Math.random() * 2);
        this.updatePressureData('high', 30 + Math.random() * 2);
      }, 1000);
    },
    
    updatePressureData(type, value) {
      if (this.pressureData[type]) {
        this.pressureData[type].value = parseFloat(value.toFixed(1));
        this.pressureData[type].history.shift();
        this.pressureData[type].history.push(this.pressureData[type].value);
      }
    },
    
    updateTime() {
      this.currentTime = new Date().toLocaleTimeString();
    }
  },
  
  mounted() {
    // Update time every second
    this.timeInterval = setInterval(this.updateTime, 1000);
    
    // Initialize translations
    this.$emit('app-initialized');
    
    console.log('🚀 MaskService App mounted');
  },
  
  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    if (this.pressureSimulation) {
      clearInterval(this.pressureSimulation);
    }
  }
}
</script>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  background: #f5f5f5;
}

.main-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Animation for component transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .container {
    font-size: 14px;
  }
}

/* Loading state */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 16px;
  color: #666;
}

.loading::before {
  content: '⏳';
  margin-right: 8px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
