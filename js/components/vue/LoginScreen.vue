<template>
  <div class="login-screen screen active">
    <div class="menu-container">
      <div class="menu-layout">
        <div class="menu-sidebar">
          <!-- Login Method Selection - Only show when not logged in -->
          <span v-if="!isLoggedIn" class="start-buttons">
            <button 
              :class="['menu-item', { active: selectedMethod === 'scanner' }]"
              @click="selectLoginMethod('scanner')"
              :data-i18n="'login.scanner'"
            >
              {{ $t('login.scanner') || 'Scanner' }}
            </button>
            <button 
              :class="['menu-item', 'active', { active: selectedMethod === 'keyword' }]"
              @click="selectLoginMethod('keyword')"
              :data-i18n="'login.keyword'"
            >
              {{ $t('login.keyword') || 'Keyword' }}
            </button>
          </span>

          <!-- Role Login Buttons - Only show when not logged in -->
          <span v-if="!isLoggedIn" class="login-buttons">
            <div 
              v-for="role in loginRoles" 
              :key="role.id"
              class="role-menu-container"
            >
              <button 
                :class="['menu-item', role.buttonClass, 'login-btn']"
                @click="toggleRoleMenu(role.id)"
                :title="role.description"
              >
                {{ $t(`login.login_as_${role.id.toLowerCase()}`) || `Login as ${role.id}` }}
              </button>
              
              <!-- Role Menu Expansion as Accordion -->
              <div 
                :class="['role-submenu-accordion', { 'expanded': expandedRole === role.id }]"
              >
                <div class="accordion-content">
                  <div 
                    v-for="menuItem in role.menuItems" 
                    :key="menuItem.id"
                    class="accordion-menu-item"
                    @click="handleDirectLogin(role.id, menuItem)"
                  >
                    <span class="accordion-menu-icon">{{ menuItem.icon }}</span>
                    <span class="accordion-menu-label">{{ menuItem.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </span>

          <!-- Post-login menu - Show after login -->
          <div v-if="isLoggedIn" class="post-login-menu">
            <!-- Current User Info -->
            <div class="user-info-card">
              <div class="user-avatar">{{ getUserAvatar(currentUserRole) }}</div>
              <div class="user-details">
                <div class="user-role">{{ currentUserRole }}</div>
                <div class="user-status">{{ $t('login.logged_in') || 'Zalogowany' }}</div>
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
                <span class="accordion-menu-label">{{ menuItem.label }}</span>
              </div>
            </div>

            <!-- Logout Button at Bottom -->
            <div class="logout-section">
              <button class="logout-btn" @click="handleLogout">
                🚪 {{ $t('menu.logout') || 'Wyloguj' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Login Form Content -->
        <div class="menu-content">
          <!-- Keyword Login -->
          <div v-if="selectedMethod === 'keyword'" class="login-method active">
            <h2 :data-i18n="'login.user_login_by_keyword'">
              {{ $t('login.user_login_by_keyword') || 'User Login By Keyword' }}
            </h2>
            
            <div class="login-form">
              <div class="password-container">
                <input 
                  type="password" 
                  v-model="password"
                  :placeholder="$t('login.password_placeholder') || 'Enter password'"
                  class="password-input"
                  @keyup.enter="handlePasswordLogin"
                  @focus="showVirtualKeyboard = true"
                  readonly
                  inputmode="none"
                  autocomplete="off"
                  ref="passwordInput"
                >
                <span class="toggle-password" @click="togglePasswordVisibility">
                  {{ showPassword ? '🙈' : '👁️' }}
                </span>
              </div>

              <!-- Virtual Keyboard -->
              <VirtualKeyboard 
                v-if="showVirtualKeyboard"
                @key-press="handleKeyPress"
                @close="showVirtualKeyboard = false"
              />
            </div>
          </div>

          <!-- Scanner Login -->
          <div v-else-if="selectedMethod === 'scanner'" class="login-method active">
            <h2 :data-i18n="'login.user_login_by_scanner'">
              {{ $t('login.user_login_by_scanner') || 'User Login by QR-CODE / BARCODE' }}
            </h2>
            
            <div class="scanner-interface">
              <div class="scanner-status">
                <div class="scanner-icon">📷</div>
                <p>{{ $t('login.scanner_not_detected') || 'Scanner not detected' }}</p>
                <button class="btn btn-secondary" @click="selectLoginMethod('keyword')">
                  {{ $t('login.use_keyboard') || 'Use keyboard' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginScreen',
  components: {
    VirtualKeyboard: () => import('./VirtualKeyboard.vue')
  },
  data() {
    return {
      selectedMethod: 'keyword',
      password: '',
      showPassword: false,
      showVirtualKeyboard: false,
      expandedRole: null,
      isLoggedIn: false,
      currentUserRole: null,
      loginRoles: [
        {
          id: 'OPERATOR',
          buttonClass: 'btn-gray',
          description: 'Basic system operations',
          menuItems: [
            { id: 'test_wizard', icon: '🧙', label: 'Test Wizard' },
            { id: 'test_quick', icon: '⚡', label: 'Quick Test' },
            { id: 'device_history', icon: '📜', label: 'Device History' },
            { id: 'reports_view', icon: '📄', label: 'View Reports' }
          ]
        },
        {
          id: 'ADMIN',
          buttonClass: 'btn-green',
          description: 'Administrative functions',
          menuItems: [
            { id: 'test_wizard', icon: '🧙', label: 'Test Wizard' },
            { id: 'test_scenarios', icon: '📋', label: 'Test Scenarios' },
            { id: 'reports_batch', icon: '📊', label: 'Batch Reports' },
            { id: 'reports_schedule', icon: '⏰', label: 'Report Schedule' },
            { id: 'users_management', icon: '👥', label: 'User Management' },
            { id: 'settings_system', icon: '⚙️', label: 'System Settings' }
          ]
        },
        {
          id: 'SERVICEUSER',
          buttonClass: 'btn-yellow',
          description: 'Workshop and maintenance',
          menuItems: [
            { id: 'workshop_inventory', icon: '📦', label: 'Workshop Inventory' },
            { id: 'workshop_maintenance', icon: '🔧', label: 'Maintenance' },
            { id: 'workshop_parts', icon: '🛠️', label: 'Spare Parts' },
            { id: 'workshop_tools', icon: '🔨', label: 'Calibration Tools' },
            { id: 'device_diagnostics', icon: '🔍', label: 'Device Diagnostics' }
          ]
        },
        {
          id: 'SUPERUSER',
          buttonClass: 'btn-red',
          description: 'Full system access',
          menuItems: [
            { id: 'system_config', icon: '🔧', label: 'System Configuration' },
            { id: 'advanced_diagnostics', icon: '🔬', label: 'Advanced Diagnostics' },
            { id: 'security_settings', icon: '🔐', label: 'Security Settings' },
            { id: 'backup_restore', icon: '💾', label: 'Backup & Restore' },
            { id: 'audit_logs', icon: '📋', label: 'Audit Logs' },
            { id: 'network_config', icon: '🌐', label: 'Network Configuration' }
          ]
        }
      ]
    }
  },
  computed: {
    currentRoleMenuItems() {
      if (!this.currentUserRole) return [];
      
      const roleConfig = this.loginRoles.find(role => role.id === this.currentUserRole);
      return roleConfig ? roleConfig.menuItems : [];
    }
  },
  methods: {
    selectLoginMethod(method) {
      this.selectedMethod = method;
      this.password = '';
      this.showVirtualKeyboard = false;
    },

    toggleRoleMenu(roleId) {
      this.expandedRole = this.expandedRole === roleId ? null : roleId;
    },

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
      const input = this.$refs.passwordInput;
      if (input) {
        input.type = this.showPassword ? 'text' : 'password';
      }
    },

    handleKeyPress(key) {
      if (key === 'Backspace') {
        this.password = this.password.slice(0, -1);
      } else if (key === 'Enter') {
        this.handlePasswordLogin();
      } else if (key === 'Space') {
        this.password += ' ';
      } else if (key.length === 1) {
        this.password += key;
      }

      // Update input field
      if (this.$refs.passwordInput) {
        this.$refs.passwordInput.removeAttribute('readonly');
        this.$refs.passwordInput.focus();
        this.$refs.passwordInput.setAttribute('readonly', 'readonly');
      }
    },

    handlePasswordLogin() {
      if (!this.password.trim()) {
        this.showError(this.$t('login.enter_password') || 'Please enter password');
        return;
      }

      // Simple password validation (length-based for demo)
      if (this.password.length >= 4) {
        const role = this.determineRoleFromPassword(this.password);
        this.performLogin(role);
      } else {
        this.showError(this.$t('login.invalid_credentials') || 'Invalid credentials');
      }
    },

    handleDirectLogin(role, selectedMenuItem = null) {
      this.performLogin(role, selectedMenuItem);
    },

    determineRoleFromPassword(password) {
      // Simple role determination based on password length/content
      if (password.toLowerCase().includes('admin')) return 'ADMIN';
      if (password.toLowerCase().includes('service')) return 'SERVICEUSER';
      if (password.toLowerCase().includes('super')) return 'SUPERUSER';
      return 'OPERATOR'; // Default role
    },

    performLogin(role, selectedMenuItem = null) {
      const userData = {
        role: role,
        loginTime: new Date().toISOString(),
        selectedMenuItem: selectedMenuItem
      };

      // Update login state
      this.isLoggedIn = true;
      this.currentUserRole = role;

      // Reset form
      this.password = '';
      this.showVirtualKeyboard = false;
      this.expandedRole = null;

      // Emit login event
      this.$emit('user-logged-in', userData);
      
      console.log(`🎯 User logged in as ${role}`, selectedMenuItem);
    },

    handleLogout() {
      this.isLoggedIn = false;
      this.currentUserRole = null;
      this.expandedRole = null;
      this.$emit('user-logged-out');
      console.log('👋 User logged out');
    },

    selectMenuItem(menuItem) {
      console.log('📂 Selected menu item:', menuItem.id);
      this.$emit('menu-item-selected', menuItem);
    },

    getUserAvatar(role) {
      const avatars = {
        'OPERATOR': '👨‍🔧',
        'ADMIN': '👨‍💼', 
        'SERVICEUSER': '👨‍🔬',
        'SUPERUSER': '👨‍💻'
      };
      return avatars[role] || '👤';
    },

    showError(message) {
      // Simple error display - can be enhanced with proper notification system
      alert(message);
    }
  },

  mounted() {
    // Focus password input when keyboard method is selected
    if (this.selectedMethod === 'keyword') {
      this.$nextTick(() => {
        if (this.$refs.passwordInput) {
          this.$refs.passwordInput.focus();
        }
      });
    }
  }
}
</script>

<style scoped>
.login-screen {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.menu-container {
  width: 100%;
  max-width: 1200px;
  height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.menu-layout {
  display: flex;
  height: 100%;
}

.menu-sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.start-buttons, .login-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.menu-item {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: left;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.menu-item.active {
  background: #3498db;
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
}

.btn-gray { background: #6c757d; }
.btn-green { background: #28a745; }
.btn-yellow { background: #ffc107; color: #212529; }
.btn-red { background: #dc3545; }

.role-menu-container {
  position: relative;
}

/* Accordion-style submenu */
.role-submenu-accordion {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0 0 6px 6px;
}

.role-submenu-accordion.expanded {
  max-height: 300px;
}

.accordion-content {
  padding: 0.5rem 0;
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

/* Post-login menu styles */
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

.menu-content {
  flex: 1;
  padding: 2rem;
  background: #f8f9fa;
}

.login-method h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  text-align: center;
}

.login-form {
  max-width: 400px;
  margin: 0 auto;
}

.password-container {
  position: relative;
  margin-bottom: 2rem;
}

.password-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 1.1rem;
  transition: border-color 0.2s;
}

.password-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1.2rem;
  user-select: none;
}

.scanner-interface {
  text-align: center;
  padding: 3rem 1rem;
}

.scanner-status {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
}

.scanner-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
  transform: translateY(-1px);
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
    overflow-y: auto;
  }
  
  .start-buttons, .login-buttons {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .menu-item {
    flex: 1;
    min-width: 120px;
    text-align: center;
    padding: 0.5rem;
    font-size: 0.8rem;
  }
  
  .menu-content {
    padding: 1rem;
  }
  
  .login-method h2 {
    font-size: 1.2rem;
  }
  
  .password-input {
    padding: 0.75rem;
    font-size: 1rem;
  }
}
</style>
