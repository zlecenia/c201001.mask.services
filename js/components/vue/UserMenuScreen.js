export default {
  name: 'UserMenuScreen',
  template: `
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
              <button class="btn-logout" @click="handleLogout">
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
              <h2>
                {{ $t('menu.select_option') || 'Wybierz opcję z menu' }}
              </h2>
              <p>
                {{ $t('system.ready') || 'System gotowy do pracy' }}
              </p>
            </div>

            <!-- Dynamic Content Based on Selected Menu Item -->
            <div v-else class="selected-menu-content">
              <h2 class="content-title">
                <span class="content-icon">{{ selectedMenuItem.icon }}</span>
                {{ selectedMenuItem.label }}
              </h2>
              <p class="content-description">{{ selectedMenuItem.description }}</p>
              
              <div class="content-placeholder">
                <div class="placeholder-icon">🚧</div>
                <p>Feature under development</p>
                <p class="placeholder-detail">Selected: {{ selectedMenuItem.id }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  props: {
    currentUser: {
      type: Object,
      required: true
    },
    menuItems: {
      type: Array,
      default: () => []
    }
  },
  emits: ['menu-selected', 'logout'],
  data() {
    return {
      selectedMenuItem: null
    }
  },
  methods: {
    selectMenuItem(menuItem) {
      this.selectedMenuItem = menuItem;
      this.$emit('menu-selected', menuItem);
    },
    
    handleLogout() {
      this.$emit('logout');
    },
    
    injectStyles() {
      if (document.getElementById('user-menu-screen-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'user-menu-screen-styles';
      style.textContent = `
        .user-menu-screen {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .menu-container {
          flex: 1;
          display: flex;
          height: 100%;
        }

        .menu-layout {
          display: flex;
          width: 100%;
          height: 100%;
        }

        .menu-sidebar {
          width: 300px;
          background: #34495e;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
        }

        /* Session Info */
        .session-info {
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .user-welcome {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .welcome-text {
          color: #bdc3c7;
          font-size: 0.9rem;
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
          text-align: center;
        }

        .btn-logout {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn-logout:hover {
          background: #c0392b;
          transform: translateY(-1px);
        }

        /* Menu Items */
        .menu-items-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .menu-item {
          background: #2c3e50;
          color: white;
          padding: 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .menu-item:hover {
          background: #3498db;
          transform: translateY(-1px);
        }

        .menu-item.active {
          background: #3498db;
          box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
        }

        .menu-icon {
          font-size: 1.2rem;
          min-width: 24px;
          text-align: center;
        }

        .menu-label {
          font-weight: 500;
          font-size: 0.9rem;
        }

        /* Menu Content */
        .menu-content {
          flex: 1;
          padding: 2rem;
          background: #ecf0f1;
          overflow-y: auto;
        }

        .welcome-message {
          text-align: center;
          color: #7f8c8d;
          margin-top: 2rem;
        }

        .welcome-message h2 {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .selected-menu-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .content-title {
          color: #2c3e50;
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .content-icon {
          font-size: 2rem;
        }

        .content-description {
          color: #7f8c8d;
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }

        .content-placeholder {
          background: white;
          padding: 3rem;
          border-radius: 8px;
          text-align: center;
          color: #95a5a6;
          border: 2px dashed #bdc3c7;
        }

        .placeholder-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .placeholder-detail {
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          color: #bdc3c7;
          margin-top: 1rem;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .menu-layout {
            flex-direction: column;
          }
          
          .menu-sidebar {
            width: 100%;
            max-height: 40vh;
            padding: 0.5rem;
          }
          
          .menu-content {
            padding: 1rem;
          }
          
          .content-title {
            font-size: 1.4rem;
          }
          
          .content-placeholder {
            padding: 2rem 1rem;
          }
        }

        /* Very small screens */
        @media (max-width: 450px) {
          .session-info {
            padding: 0.75rem;
          }
          
          .menu-item {
            padding: 0.5rem;
          }
          
          .menu-icon {
            font-size: 1rem;
          }
          
          .menu-label {
            font-size: 0.8rem;
          }
        }
      `;
      document.head.appendChild(style);
    }
  },
  mounted() {
    this.injectStyles();
  }
}
