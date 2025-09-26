/**
 * MASKTRONIC C20 - Vue.js Login Screen Component
 * First Vue component replacing vanilla login-screen template
 */


const LoginScreen = {
    name: 'LoginScreen',
    props: {
        user: {
            type: Object,
            default: () => ({ username: null, role: null, isAuthenticated: false })
        },
        language: {
            type: String,
            default: 'pl'
        }
    },
    
    emits: ['navigate', 'authenticate'],
    
    setup(props, { emit }) {
        // CRITICAL FIX: Import Vue 3 Composition API functions
        const { reactive, ref, computed, onMounted } = Vue;
        
        // Reactive state
        const loginState = reactive({
            password: '',
            showPassword: false,
            isLoading: false,
            selectedRole: null,
            showKeyboard: false
        });

        // Available roles for login
        const availableRoles = ref([
            { key: 'OPERATOR', label: 'Operator', color: 'blue' },
            { key: 'ADMIN', label: 'Administrator', color: 'green' },
            { key: 'SUPERUSER', label: 'Superuser', color: 'purple' },
            { key: 'SERVICEUSER', label: 'Serwisant', color: 'orange' }
        ]);

        // Computed properties
        const currentLanguageLabel = computed(() => {
            const langMap = { pl: '🇵🇱', en: '🇺🇸', de: '🇩🇪' };
            return langMap[props.language] || '🇵🇱';
        });

        const loginButtonText = computed(() => {
            const textMap = {
                pl: 'Zaloguj',
                en: 'Login',
                de: 'Anmelden'
            };
            return textMap[props.language] || 'Zaloguj';
        });

        // Methods
        const togglePasswordVisibility = () => {
            loginState.showPassword = !loginState.showPassword;
            console.log('🔶 Vue: Password visibility toggled');
        };

        const selectRole = (role) => {
            loginState.selectedRole = role;
            console.log(`🔶 Vue: Role selected: ${role.key}`);
        };

        const toggleKeyboard = () => {
            loginState.showKeyboard = !loginState.showKeyboard;
            
            // Integrate with existing virtual keyboard if available
            if (window.VirtualKeyboard) {
                if (loginState.showKeyboard) {
                    window.VirtualKeyboard.show();
                } else {
                    window.VirtualKeyboard.hide();
                }
            }
            console.log('🔶 Vue: Virtual keyboard toggled');
        };

        const changeLanguage = (newLang) => {
            console.log(`🔶 Vue: Language changing to ${newLang}`);
            
            // Integrate with existing i18n system if available
            if (window.i18nManager && window.i18nManager.changeLanguage) {
                window.i18nManager.changeLanguage(newLang);
            }
            
            emit('navigate', 'login-screen', newLang, 'default');
        };

        const handleLogin = async () => {
            if (!loginState.selectedRole) {
                alert('Wybierz rolę użytkownika');
                return;
            }

            loginState.isLoading = true;
            console.log(`🔶 Vue: Attempting login as ${loginState.selectedRole.key}`);

            try {
                // Simulate authentication delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Integrate with existing auth system if available
                if (window.AuthManager && window.AuthManager.login) {
                    const authResult = await window.AuthManager.login(
                        loginState.selectedRole.key.toLowerCase(),
                        loginState.password || 'default'
                    );
                    
                    if (authResult.success) {
                        emit('authenticate', authResult.username, authResult.role);
                        emit('navigate', 'system-screen', props.language, 'default');
                    } else {
                        alert(authResult.message || 'Login failed');
                    }
                } else {
                    // Fallback authentication
                    const username = loginState.selectedRole.key.toLowerCase();
                    emit('authenticate', username, loginState.selectedRole.key);
                    emit('navigate', 'system-screen', props.language, 'default');
                }
                
            } catch (error) {
                console.error('🔶 Vue: Login error:', error);
                alert('Błąd logowania');
            } finally {
                loginState.isLoading = false;
            }
        };

        const handleScannerLogin = () => {
            console.log('🔶 Vue: Scanner login initiated');
            // Implement scanner functionality
            alert('Scanner login - coming soon in Vue!');
        };

        const handleKeywordLogin = () => {
            console.log('🔶 Vue: Keyword login initiated');
            // Implement keyword functionality
            alert('Keyword login - coming soon in Vue!');
        };

        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: LoginScreen component mounted');
            
            // Focus on password input if available
            const passwordInput = document.querySelector('#vue-password-input');
            if (passwordInput) {
                passwordInput.focus();
            }
        });

        return {
            loginState,
            availableRoles,
            currentLanguageLabel,
            loginButtonText,
            togglePasswordVisibility,
            selectRole,
            toggleKeyboard,
            changeLanguage,
            handleLogin,
            handleScannerLogin,
            handleKeywordLogin
        };
    },

    template: `
        <div class="login-screen vue-component">
            <div class="login-container">
                <!-- Header -->
                <div class="login-header">
                    <h1>MASKTRONIC C20 <span class="vue-badge">Vue</span></h1>
                    <p>System testowania urządzeń ochrony osobistej</p>
                </div>

                <!-- Language Selector -->
                <div class="language-selector">
                    <button @click="changeLanguage('pl')" :class="{ active: language === 'pl' }">🇵🇱</button>
                    <button @click="changeLanguage('en')" :class="{ active: language === 'en' }">🇺🇸</button>
                    <button @click="changeLanguage('de')" :class="{ active: language === 'de' }">🇩🇪</button>
                </div>

                <!-- Login Methods -->
                <div class="login-methods">
                    <button class="login-method-btn scanner-btn" @click="handleScannerLogin">
                        <i class="icon-scanner">📱</i>
                        <span>Scanner</span>
                    </button>
                    
                    <button class="login-method-btn keyword-btn" @click="handleKeywordLogin">
                        <i class="icon-keyboard">⌨️</i>
                        <span>Keyword</span>
                    </button>
                </div>

                <!-- Role Selection -->
                <div class="role-selection">
                    <h3>Wybierz rolę:</h3>
                    <div class="role-buttons">
                        <button 
                            v-for="role in availableRoles" 
                            :key="role.key"
                            class="role-btn"
                            :class="[
                                'role-' + role.color,
                                { active: loginState.selectedRole?.key === role.key }
                            ]"
                            @click="selectRole(role)"
                        >
                            Login as {{ role.label }}
                        </button>
                    </div>
                </div>

                <!-- Password Input -->
                <div class="password-section" v-if="loginState.selectedRole">
                    <div class="password-input-group">
                        <input 
                            id="vue-password-input"
                            v-model="loginState.password"
                            :type="loginState.showPassword ? 'text' : 'password'"
                            placeholder="Hasło (opcjonalne)"
                            class="password-input"
                            @keyup.enter="handleLogin"
                        />
                        <button 
                            class="password-toggle"
                            @click="togglePasswordVisibility"
                            type="button"
                        >
                            {{ loginState.showPassword ? '🙈' : '👁️' }}
                        </button>
                    </div>
                    
                    <button 
                        class="keyboard-toggle-btn"
                        @click="toggleKeyboard"
                        :class="{ active: loginState.showKeyboard }"
                    >
                        Użyj klawiatury
                    </button>
                </div>

                <!-- Login Button -->
                <div class="login-action" v-if="loginState.selectedRole">
                    <button 
                        class="login-btn"
                        :class="{ loading: loginState.isLoading }"
                        @click="handleLogin"
                        :disabled="loginState.isLoading"
                    >
                        <span v-if="!loginState.isLoading">{{ loginButtonText }}</span>
                        <span v-else>Logowanie...</span>
                    </button>
                </div>

                <!-- Footer -->
                <div class="login-footer">
                    <p>🔶 Vue.js Component Active</p>
                    <p>Version 22.25.1001 | {{ new Date().getFullYear() }}</p>
                </div>
            </div>
        </div>
    `,

    style: `
        .vue-component {
            animation: vue-fade-in 0.5s ease-in-out;
        }
        
        .vue-badge {
            background: #42b883;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.7em;
            margin-left: 8px;
        }
        
        .login-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .login-container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 420px;
            text-align: center;
        }
        
        .login-header h1 {
            color: #333;
            margin-bottom: 8px;
            font-size: 1.8em;
        }
        
        .language-selector {
            margin: 20px 0;
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        
        .language-selector button {
            padding: 8px 12px;
            border: 2px solid #ddd;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .language-selector button.active {
            border-color: #42b883;
            background: #42b883;
            color: white;
        }
        
        .role-buttons {
            display: grid;
            gap: 12px;
            margin: 20px 0;
        }
        
        .role-btn {
            padding: 12px 20px;
            border: 2px solid #ddd;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 500;
        }
        
        .role-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .role-btn.active {
            border-color: #42b883;
            background: #42b883;
            color: white;
        }
        
        .password-input-group {
            display: flex;
            margin: 15px 0;
        }
        
        .password-input {
            flex: 1;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 6px 0 0 6px;
            font-size: 16px;
        }
        
        .password-toggle {
            padding: 12px;
            border: 2px solid #ddd;
            border-left: none;
            border-radius: 0 6px 6px 0;
            background: #f8f9fa;
            cursor: pointer;
        }
        
        .login-btn {
            width: 100%;
            padding: 15px;
            background: #42b883;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .login-btn:hover:not(:disabled) {
            background: #369870;
            transform: translateY(-2px);
        }
        
        .login-btn.loading {
            background: #ccc;
            cursor: not-allowed;
        }
        
        @keyframes vue-fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `
};

// Export component for use
window.LoginScreen = LoginScreen;
console.log('🔶 Vue LoginScreen component loaded');
