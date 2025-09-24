<template>
  <div class="login-method-selector">
    <!-- Login Method Selection -->
    <span v-if="!isLoggedIn" class="start-buttons">
      <button 
        :class="['menu-item', { active: selectedMethod === 'scanner' }]"
        @click="selectMethod('scanner')"
        :data-i18n="TRANSLATION_KEYS.scanner"
      >
        {{ $t(TRANSLATION_KEYS.scanner) || 'Scanner' }}
      </button>
      <button 
        :class="['menu-item', 'active', { active: selectedMethod === 'keyword' }]"
        @click="selectMethod('keyword')"
        :data-i18n="TRANSLATION_KEYS.keyword"
      >
        {{ $t(TRANSLATION_KEYS.keyword) || 'Keyword' }}
      </button>
    </span>

    <!-- Role Login Buttons -->
    <span v-if="!isLoggedIn" class="login-buttons">
      <div 
        v-for="role in loginRoles" 
        :key="role.id"
        class="role-menu-container"
      >
        <button 
          :class="['menu-item', role.buttonClass, 'login-btn']"
          @click="toggleRole(role.id)"
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
  </div>
</template>

<script>
export default {
  name: 'LoginMethodSelector',
  props: {
    selectedMethod: {
      type: String,
      default: 'keyword'
    },
    isLoggedIn: {
      type: Boolean,
      default: false
    },
    loginRoles: {
      type: Array,
      required: true
    },
    expandedRole: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        scanner: 'login.scanner',
        keyword: 'login.keyword',
        loginAsOperator: 'login.login_as_operator',
        loginAsAdmin: 'login.login_as_admin',
        loginAsSuperuser: 'login.login_as_superuser',
        loginAsServiceuser: 'login.login_as_serviceuser'
      }
    }
  },
  methods: {
    selectMethod(method) {
      this.$emit('method-selected', method);
    },
    
    toggleRole(roleId) {
      this.$emit('role-toggled', roleId);
    },
    
    handleDirectLogin(role, menuItem) {
      this.$emit('direct-login', { role, menuItem });
    }
  }
}
</script>

<style scoped>
.login-method-selector {
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

.accordion-menu-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.accordion-menu-label {
  flex: 1;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
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
}
</style>
