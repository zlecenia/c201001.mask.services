export default {
  name: 'LoginScreen',
  template: `
    <div class="login-screen screen active">
      <div class="menu-container">
        <div class="menu-layout">
          <div class="menu-sidebar">
            <!-- Login Method Selection -->
            <span class="start-buttons">
              <button 
                :class="['menu-item', { active: selectedMethod === 'scanner' }]"
                @click="selectLoginMethod('scanner')"
              >
                Scanner
              </button>
              <button 
                :class="['menu-item', 'active', { active: selectedMethod === 'keyword' }]"
                @click="selectLoginMethod('keyword')"
              >
                Keyword
              </button>
            </span>

            <!-- Role Login Buttons -->
            <span class="login-buttons">
              <div 
                v-for="role in loginRoles" 
                :key="role.id"
                class="role-menu-container"
              >
                <button 
                  :class="['menu-item', role.buttonClass, 'login-btn']"
                  @click="handleRoleLogin(role.id)"
                  :title="role.description"
                >
                  Login as {{ role.id }}
                </button>
              </div>
            </span>
          </div>

          <!-- Login Form Content -->
          <div class="menu-content">
            <!-- Keyword Login -->
            <div v-if="selectedMethod === 'keyword'" class="login-method active">
              <h2>User Login By Keyword</h2>
              
              <div class="login-form">
                <div class="password-container">
                  <input 
                    type="password" 
                    v-model="password"
                    placeholder="Enter password"
                    class="password-input"
                    @keyup.enter="handlePasswordLogin"
                  >
                  <span class="toggle-password" @click="togglePasswordVisibility">
                    {{ showPassword ? '🙈' : '👁️' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Scanner Login -->
            <div v-else-if="selectedMethod === 'scanner'" class="login-method active">
              <h2>User Login by QR-CODE / BARCODE</h2>
              
              <div class="scanner-interface">
                <div class="scanner-status">
                  <div class="scanner-icon">📷</div>
                  <p>Scanner not detected</p>
                  <button class="btn btn-secondary" @click="selectLoginMethod('keyword')">
                    Use keyboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  emits: ['user-logged-in'],
  data() {
    return {
      selectedMethod: 'keyword',
      password: '',
      showPassword: false,
      loginRoles: [
        { id: 'OPERATOR', buttonClass: 'operator', description: 'Test operations' },
        { id: 'ADMIN', buttonClass: 'admin', description: 'System administration' },
        { id: 'SERVICEUSER', buttonClass: 'service', description: 'Workshop services' },
        { id: 'SUPERUSER', buttonClass: 'super', description: 'Full system access' }
      ]
    }
  },
  methods: {
    selectLoginMethod(method) {
      this.selectedMethod = method;
    },
    
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
      const input = this.$refs.passwordInput;
      if (input) {
        input.type = this.showPassword ? 'text' : 'password';
      }
    },
    
    handlePasswordLogin() {
      if (this.password) {
        const role = this.determineRoleFromPassword(this.password);
        if (role) {
          this.loginUser(role);
        } else {
          alert('Invalid password');
        }
      }
    },
    
    handleRoleLogin(role) {
      this.loginUser(role);
    },
    
    determineRoleFromPassword(password) {
      const passwordMap = {
        'operator': 'OPERATOR',
        'admin': 'ADMIN', 
        'service': 'SERVICEUSER',
        'super': 'SUPERUSER'
      };
      return passwordMap[password.toLowerCase()] || null;
    },
    
    loginUser(role) {
      const userData = {
        role: role,
        username: role.toLowerCase(),
        loginTime: new Date().toISOString()
      };
      
      this.$emit('user-logged-in', userData);
      this.password = '';
    },
    
    injectStyles() {
      if (document.getElementById('login-screen-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'login-screen-styles';
      style.textContent = `
        .login-screen {
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
        }

        .start-buttons, .login-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .menu-item {
          background: #2c3e50;
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
          text-align: left;
        }

        .menu-item:hover {
          background: #3498db;
          transform: translateY(-1px);
        }

        .menu-item.active {
          background: #3498db;
          box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
        }

        .menu-item.operator {
          background: #27ae60;
        }
        
        .menu-item.admin {
          background: #e74c3c;
        }
        
        .menu-item.service {
          background: #f39c12;
        }
        
        .menu-item.super {
          background: #9b59b6;
        }

        .menu-content {
          flex: 1;
          padding: 2rem;
          background: #ecf0f1;
          display: flex;
          flex-direction: column;
        }

        .login-method h2 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .login-form {
          max-width: 400px;
        }

        .password-container {
          position: relative;
          margin-bottom: 1rem;
        }

        .password-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #bdc3c7;
          border-radius: 6px;
          font-size: 1rem;
          background: white;
        }

        .password-input:focus {
          outline: none;
          border-color: #3498db;
        }

        .toggle-password {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          font-size: 1.2rem;
        }

        .scanner-interface {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }

        .scanner-status {
          text-align: center;
          color: #7f8c8d;
        }

        .scanner-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 1rem;
        }

        .btn-secondary {
          background: #95a5a6;
          color: white;
        }

        .btn-secondary:hover {
          background: #7f8c8d;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .menu-layout {
            flex-direction: column;
          }
          
          .menu-sidebar {
            width: 100%;
            padding: 0.5rem;
          }
          
          .start-buttons, .login-buttons {
            flex-direction: row;
            flex-wrap: wrap;
          }
          
          .menu-content {
            padding: 1rem;
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
