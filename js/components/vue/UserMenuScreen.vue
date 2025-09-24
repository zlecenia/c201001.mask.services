<template>
  <div class="user-menu-screen screen active">
    <div class="menu-container">
      <div class="menu-layout">
        <!-- Menu Sidebar -->
        <div class="menu-sidebar" id="user-menu-items">
          <!-- Session Info -->
          <div class="session-info">
            <div class="user-welcome">
              <span class="welcome-text">{{ $t('menu.welcome') || 'Witamy' }}</span>
              <span class="user-role" :data-role="currentUser.role">{{ currentUser.role }}</span>
            </div>
            <button class="btn-logout" @click="handleLogout" :data-i18n="'menu.logout'">
              {{ $t('menu.logout') || 'Logout' }}
            </button>
          </div>

          <!-- Menu Items -->
          <div class="menu-items-container">
            <div 
              v-for="menuItem in menuItems" 
              :key="menuItem.id"
              class="menu-item"
              @click="selectMenuItem(menuItem)"
              :class="{ active: selectedMenuItem?.id === menuItem.id }"
            >
              <span class="menu-icon">{{ menuItem.icon }}</span>
              <span class="menu-label">{{ menuItem.label }}</span>
            </div>
          </div>
        </div>

        <!-- Menu Content Area -->
        <div class="menu-content" id="menu-content">
          <!-- Welcome Message -->
          <div v-if="!selectedMenuItem" class="welcome-message">
            <h2 :data-i18n="'menu.select_option'">
              {{ $t('menu.select_option') || 'Wybierz opcję z menu' }}
            </h2>
            <p :data-i18n="'system.ready'">
              {{ $t('system.ready') || 'System gotowy do pracy' }}
            </p>
          </div>

          <!-- Dynamic Content Based on Selected Menu Item -->
          <component 
            v-else
            :is="currentComponent"
            :menu-item="selectedMenuItem"
            :current-user="currentUser"
            @back-to-menu="clearSelection"
            @navigate="handleNavigation"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserMenuScreen',
  props: {
    currentUser: {
      type: Object,
      required: true
    },
    menuItems: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedMenuItem: null
    }
  },
  computed: {
    currentComponent() {
      if (!this.selectedMenuItem) return null;
      
      // Map menu item IDs to component names
      const componentMap = {
        'test_wizard': 'TestWizardComponent',
        'test_quick': 'QuickTestComponent',
        'test_scenarios': 'TestScenariosComponent',
        'device_history': 'DeviceHistoryComponent',
        'reports_view': 'ReportsViewComponent',
        'reports_batch': 'ReportsBatchCore',
        'reports_schedule': 'ReportsScheduleComponent',
        'users_management': 'UsersManagementComponent',
        'settings_system': 'SystemSettingsComponent',
        'workshop_inventory': 'WorkshopInventoryCore',
        'workshop_maintenance': 'WorkshopMaintenanceComponent',
        'workshop_parts': 'WorkshopPartsComponent',
        'workshop_tools': 'WorkshopToolsComponent',
        'device_diagnostics': 'DeviceDiagnosticsComponent',
        'system_config': 'SystemConfigComponent',
        'advanced_diagnostics': 'AdvancedDiagnosticsComponent',
        'security_settings': 'SecuritySettingsComponent',
        'backup_restore': 'BackupRestoreComponent',
        'audit_logs': 'AuditLogsComponent',
        'network_config': 'NetworkConfigComponent'
      };
      
      return componentMap[this.selectedMenuItem.id] || 'DefaultMenuComponent';
    }
  },
  components: {
    // Lazy load components
    TestWizardComponent: () => import('./TestWizardComponent.vue'),
    QuickTestComponent: () => import('./QuickTestComponent.vue'),
    TestScenariosComponent: () => import('./TestScenariosComponent.vue'),
    DeviceHistoryComponent: () => import('./DeviceHistoryComponent.vue'),
    ReportsViewComponent: () => import('./ReportsViewComponent.vue'),
    ReportsBatchCore: () => import('./ReportsBatchCore.vue'),
    ReportsScheduleComponent: () => import('./ReportsScheduleComponent.vue'),
    UsersManagementComponent: () => import('./UsersManagementComponent.vue'),
    SystemSettingsComponent: () => import('./SystemSettingsComponent.vue'),
    WorkshopInventoryCore: () => import('./WorkshopInventoryCore.vue'),
    WorkshopMaintenanceComponent: () => import('./WorkshopMaintenanceComponent.vue'),
    WorkshopPartsComponent: () => import('./WorkshopPartsComponent.vue'),
    WorkshopToolsComponent: () => import('./WorkshopToolsComponent.vue'),
    DeviceDiagnosticsComponent: () => import('./DeviceDiagnosticsComponent.vue'),
    SystemConfigComponent: () => import('./SystemConfigComponent.vue'),
    AdvancedDiagnosticsComponent: () => import('./AdvancedDiagnosticsComponent.vue'),
    SecuritySettingsComponent: () => import('./SecuritySettingsComponent.vue'),
    BackupRestoreComponent: () => import('./BackupRestoreComponent.vue'),
    AuditLogsComponent: () => import('./AuditLogsComponent.vue'),
    NetworkConfigComponent: () => import('./NetworkConfigComponent.vue'),
    DefaultMenuComponent: () => import('./DefaultMenuComponent.vue')
  },
  methods: {
    selectMenuItem(menuItem) {
      this.selectedMenuItem = menuItem;
      this.$emit('menu-selected', menuItem);
      console.log(`📂 Selected menu item: ${menuItem.id}`);
    },
    
    clearSelection() {
      this.selectedMenuItem = null;
    },
    
    handleLogout() {
      this.$emit('logout');
    },
    
    handleNavigation(navigationData) {
      this.$emit('navigate', navigationData);
    }
  }
}
</script>

<style scoped>
.user-menu-screen {
  height: 100%;
  background: #f5f5f5;
}

.menu-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.menu-sidebar {
  width: 280px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.session-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.user-welcome {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.welcome-text {
  font-size: 0.9rem;
  color: #bdc3c7;
}

.user-role {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  align-self: flex-start;
}

.btn-logout {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  width: 100%;
}

.btn-logout:hover {
  background: #c0392b;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);
}

.menu-items-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(5px);
  border-color: rgba(255, 255, 255, 0.2);
}

.menu-item.active {
  background: #3498db;
  border-color: #2980b9;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.menu-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.menu-label {
  font-size: 0.9rem;
  font-weight: 500;
}

.menu-content {
  flex: 1;
  background: white;
  overflow-y: auto;
  position: relative;
}

.welcome-message {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.welcome-message h2 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 600;
}

.welcome-message p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .menu-layout {
    flex-direction: column;
  }
  
  .menu-sidebar {
    width: 100%;
    height: auto;
    max-height: 40vh;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0.5rem;
  }
  
  .session-info {
    min-width: 200px;
    flex-shrink: 0;
  }
  
  .menu-items-container {
    flex-direction: row;
    gap: 0.5rem;
  }
  
  .menu-item {
    min-width: 120px;
    flex-shrink: 0;
    flex-direction: column;
    text-align: center;
    padding: 0.5rem;
    gap: 0.25rem;
  }
  
  .menu-icon {
    font-size: 1.5rem;
  }
  
  .menu-label {
    font-size: 0.8rem;
  }
  
  .welcome-message {
    margin: 1rem;
    padding: 2rem 1rem;
  }
  
  .welcome-message h2 {
    font-size: 1.5rem;
  }
  
  .welcome-message p {
    font-size: 1rem;
  }
}

/* Very small screens */
@media (max-width: 350px) {
  .menu-sidebar {
    padding: 0.25rem;
  }
  
  .session-info {
    min-width: 150px;
    padding: 0.5rem;
  }
  
  .user-welcome {
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }
  
  .btn-logout {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
  
  .menu-item {
    min-width: 100px;
    padding: 0.4rem;
  }
  
  .menu-icon {
    font-size: 1.2rem;
  }
  
  .menu-label {
    font-size: 0.7rem;
  }
}

/* Animations */
.menu-item {
  animation: slideInLeft 0.3s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Scrollbar styling for sidebar */
.menu-sidebar::-webkit-scrollbar {
  width: 4px;
}

.menu-sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.menu-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.menu-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
