<template>
  <div class="post-login-menu">
    <!-- Current User Info -->
    <div class="user-info-card">
      <div class="user-avatar">{{ getUserAvatar(currentUserRole) }}</div>
      <div class="user-details">
        <div class="user-role">{{ $t(TRANSLATION_KEYS.rolePrefix + currentUserRole) || currentUserRole }}</div>
        <div class="user-status">{{ $t(TRANSLATION_KEYS.loggedIn) || 'Zalogowany' }}</div>
      </div>
    </div>

    <!-- Role-specific Menu Items as Accordion -->
    <div class="role-menu-accordion">
      <div 
        v-for="menuItem in currentRoleMenuItems" 
        :key="menuItem.id"
        class="accordion-menu-item main"
        @click="selectMenuItem(menuItem)"
      >
        <span class="accordion-menu-icon">{{ menuItem.icon }}</span>
        <span class="accordion-menu-label">{{ $t(getMenuItemTranslation(menuItem.id)) || menuItem.label }}</span>
      </div>
    </div>

    <!-- Logout Button at Bottom -->
    <div class="logout-section">
      <button class="logout-btn" @click="handleLogout">
        🚪 {{ $t(TRANSLATION_KEYS.logout) || 'Wyloguj' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PostLoginMenu',
  props: {
    currentUserRole: {
      type: String,
      required: true
    },
    currentRoleMenuItems: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // User avatar configuration
      USER_AVATARS: {
        'OPERATOR': '👨‍🔧',
        'ADMIN': '👨‍💼', 
        'SERVICEUSER': '👨‍🔬',
        'SUPERUSER': '👨‍💻'
      },
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        logout: 'menu.logout',
        loggedIn: 'login.logged_in',
        rolePrefix: 'roles.',
        
        // Menu item translations
        testWizard: 'menu.test_wizard',
        testQuick: 'menu.test_quick',
        testScenarios: 'menu.test_scenarios',
        userData: 'menu.user_data',
        realtimeSensors: 'menu.realtime_sensors',
        deviceHistory: 'menu.device_history',
        reportsView: 'menu.reports_view',
        reportsBatch: 'menu.reports_batch',
        reportsSchedule: 'menu.reports_schedule',
        workshopParts: 'menu.workshop_parts',
        workshopMaintenance: 'menu.workshop_maintenance',
        workshopTools: 'menu.workshop_tools',
        workshopInventory: 'menu.workshop_inventory',
        settingsScenarios: 'menu.settings_scenarios',
        settingsIntegration: 'menu.settings_integration',
        settingsStandards: 'menu.settings_standards',
        settingsSystem: 'menu.settings_system',
        users: 'menu.users',
        serviceMenu: 'menu.service_menu',
        advancedDiagnostics: 'menu.advanced_diagnostics',
        systemConfig: 'menu.system_config',
        securitySettings: 'menu.security_settings',
        backupRestore: 'menu.backup_restore',
        auditLogs: 'menu.audit_logs',
        networkConfig: 'menu.network_config',
        deviceDiagnostics: 'menu.device_diagnostics',
        usersManagement: 'menu.users_management'
      },
      
      // Menu item translation mapping
      MENU_ITEM_TRANSLATIONS: {
        'test_wizard': 'menu.test_wizard',
        'test_scenarios': 'menu.test_scenarios', 
        'reports_batch': 'menu.reports_batch',
        'reports_schedule': 'menu.reports_schedule',
        'users_management': 'menu.users',
        'settings_system': 'menu.settings_system',
        'workshop_inventory': 'menu.workshop_inventory',
        'workshop_maintenance': 'menu.workshop_maintenance',
        'workshop_parts': 'menu.workshop_parts',
        'workshop_tools': 'menu.workshop_tools',
        'device_diagnostics': 'menu.advanced_diagnostics',
        'system_config': 'menu.system_config',
        'advanced_diagnostics': 'menu.advanced_diagnostics',
        'security_settings': 'menu.security_settings',
        'backup_restore': 'menu.backup_restore',
        'audit_logs': 'menu.audit_logs',
        'network_config': 'menu.network_config'
      }
    }
  },
  methods: {
    getUserAvatar(role) {
      return this.USER_AVATARS[role] || '👤';
    },
    
    getMenuItemTranslation(menuItemId) {
      return this.MENU_ITEM_TRANSLATIONS[menuItemId] || `menu.${menuItemId}`;
    },
    
    selectMenuItem(menuItem) {
      this.$emit('menu-item-selected', menuItem);
    },
    
    handleLogout() {
      this.$emit('logout');
    }
  }
}
</script>

<style scoped>
.post-login-menu {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
}

.user-info-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  backdrop-filter: blur(5px);
}

.user-avatar {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.user-details {
  flex: 1;
}

.user-role {
  font-weight: bold;
  color: white;
  font-size: 1rem;
}

.user-status {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.role-menu-accordion {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.accordion-menu-item {
  padding: 0.5rem 1rem 0.5rem 2rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  border-left: 3px solid transparent;
}

.accordion-menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-left-color: #3498db;
  transform: translateX(3px);
}

.accordion-menu-item.main {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 0.5rem;
  border-radius: 4px;
}

.accordion-menu-item.main:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(0);
}

.accordion-menu-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.accordion-menu-label {
  flex: 1;
}

.logout-section {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.logout-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.logout-btn:hover {
  background: #c0392b;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .user-info-card {
    padding: 0.75rem;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  
  .accordion-menu-item.main {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
  
  .logout-btn {
    padding: 0.5rem 0.75rem;
  }
}
</style>
