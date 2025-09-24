<template>
  <div class="login-form-content">
    <!-- Keyword Login -->
    <div v-if="selectedMethod === 'keyword'" class="login-method active">
      <h2 :data-i18n="TRANSLATION_KEYS.userLoginByKeyword">
        {{ $t(TRANSLATION_KEYS.userLoginByKeyword) || 'User Login By Keyword' }}
      </h2>
      
      <div class="login-form">
        <div class="password-container">
          <input 
            ref="passwordInput"
            type="password" 
            v-model="password"
            :placeholder="$t(TRANSLATION_KEYS.passwordPlaceholder) || 'Enter password'"
            :data-i18n="TRANSLATION_KEYS.passwordPlaceholder"
            class="password-input"
            readonly
            @click="showVirtualKeyboard = true"
            @keyup.enter="handleLogin"
          />
          <span 
            class="toggle-password" 
            @click="togglePasswordVisibility"
            :title="showPassword ? 'Hide password' : 'Show password'"
          >
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </span>
        </div>
        
        <!-- Virtual Keyboard Integration -->
        <VirtualKeyboard 
          v-if="showVirtualKeyboard && virtualKeyboardEnabled"
          @key-press="handleKeyPress"
          @close="showVirtualKeyboard = false"
        />
      </div>
    </div>

    <!-- Scanner Login -->
    <div v-else-if="selectedMethod === 'scanner'" class="login-method active">
      <h2 :data-i18n="TRANSLATION_KEYS.userLoginByScanner">
        {{ $t(TRANSLATION_KEYS.userLoginByScanner) || 'User Login by QR-CODE / BARCODE' }}
      </h2>
      
      <div class="scanner-interface">
        <div class="scanner-status">
          <div class="scanner-icon">📷</div>
          <p>{{ $t(TRANSLATION_KEYS.scannerNotDetected) || 'Scanner not detected' }}</p>
          <p>{{ $t(TRANSLATION_KEYS.codeNotRead) || 'Code could not be read correctly' }}</p>
          <div class="scanner-fallback">
            <button class="btn btn-secondary" @click="switchToKeyboard">
              {{ $t(TRANSLATION_KEYS.useKeyboard) || 'Use keyboard' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginFormContent',
  components: {
    VirtualKeyboard: () => import('./VirtualKeyboard.vue').catch(() => null)
  },
  props: {
    selectedMethod: {
      type: String,
      required: true
    },
    password: {
      type: String,
      default: ''
    },
    showPassword: {
      type: Boolean,
      default: false
    },
    showVirtualKeyboard: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Virtual keyboard configuration
      VIRTUAL_KEYBOARD_ENABLED: true,
      PASSWORD_MIN_LENGTH: 4,
      
      // Input configuration
      PASSWORD_INPUT_READONLY: true, // Prevent system keyboard
      FOCUS_DELAY: 100,
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        // Login form translations
        userLoginByKeyword: 'login.user_login_by_keyword',
        userLoginByScanner: 'login.user_login_by_scanner',
        password: 'login.password',
        passwordPlaceholder: 'login.password_placeholder',
        enterPassword: 'login.enter_password',
        scannerNotDetected: 'login.scanner_not_detected',
        codeNotRead: 'login.code_not_read',
        useKeyboard: 'login.use_keyboard',
        loginFailed: 'login.login_failed',
        invalidCredentials: 'login.invalid_credentials',
        
        // Global translations
        loading: 'global.loading',
        error: 'global.error'
      },
      
      // Component state
      virtualKeyboardEnabled: true
    }
  },
  computed: {
    isPasswordValid() {
      return this.password && this.password.length >= this.PASSWORD_MIN_LENGTH;
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.$emit('toggle-password');
    },
    
    handleKeyPress(key) {
      this.$emit('key-press', key);
    },
    
    handleLogin() {
      if (this.isPasswordValid) {
        this.$emit('login-attempt');
      } else {
        this.$emit('show-error', this.$t(this.TRANSLATION_KEYS.enterPassword) || 'Please enter password');
      }
    },
    
    switchToKeyboard() {
      this.$emit('method-change', 'keyword');
    }
  },
  mounted() {
    // Focus password input when keyword method is selected
    if (this.selectedMethod === 'keyword') {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.$refs.passwordInput) {
            this.$refs.passwordInput.focus();
          }
        }, this.FOCUS_DELAY);
      });
    }
  },
  watch: {
    selectedMethod(newMethod) {
      if (newMethod === 'keyword') {
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.passwordInput) {
              this.$refs.passwordInput.focus();
            }
          }, this.FOCUS_DELAY);
        });
      }
    }
  }
}
</script>

<style scoped>
.login-form-content {
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
  background: white;
  box-sizing: border-box;
}

.password-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.password-input[readonly] {
  cursor: pointer;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1.2rem;
  user-select: none;
  transition: opacity 0.2s;
}

.toggle-password:hover {
  opacity: 0.7;
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
  max-width: 400px;
  margin: 0 auto;
}

.scanner-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.scanner-status p {
  margin: 0.5rem 0;
  color: #6c757d;
}

.scanner-fallback {
  margin-top: 2rem;
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
  .login-form-content {
    padding: 1rem;
  }
  
  .login-method h2 {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }
  
  .password-input {
    padding: 0.75rem;
    font-size: 1rem;
  }
  
  .scanner-interface {
    padding: 2rem 0.5rem;
  }
  
  .scanner-status {
    padding: 1.5rem 1rem;
  }
  
  .scanner-icon {
    font-size: 3rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

/* Touch-friendly targets for 400x1280 display */
.password-input,
.toggle-password,
.btn {
  min-height: 44px; /* Touch target minimum */
  min-width: 44px;
}

.toggle-password {
  padding: 0.5rem;
  border-radius: 4px;
}

.toggle-password:active {
  background: rgba(0, 0, 0, 0.1);
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .password-input {
    border-width: 3px;
  }
  
  .scanner-status {
    border-width: 3px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .password-input,
  .btn,
  .toggle-password {
    transition: none;
  }
}
</style>
