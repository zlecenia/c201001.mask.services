// === MAIN VUE APPLICATION INITIALIZATION ===

const { createApp } = Vue;
const { createI18n } = VueI18n;

// Translation loading utility
async function loadTranslations() {
    try {
        const [plRes, enRes, deRes] = await Promise.all([
            fetch('/locales/pl.json').catch(() => ({ json: () => ({}) })),
            fetch('/locales/en.json').catch(() => ({ json: () => ({}) })),
            fetch('/locales/de.json').catch(() => ({ json: () => ({}) }))
        ]);
        
        const [pl, en, de] = await Promise.all([
            plRes.json ? plRes.json() : {},
            enRes.json ? enRes.json() : {},
            deRes.json ? deRes.json() : {}
        ]);
        
        return { pl, en, de };
    } catch (error) {
        console.error('Translation loading failed:', error);
        // Fallback translations
        return {
            pl: {
                global: { loading: 'Ładowanie...', error: 'Błąd', retry: 'Spróbuj ponownie' },
                app: { title: 'MASKSERVICE C20', initializing: 'Inicjalizacja...' }
            },
            en: {
                global: { loading: 'Loading...', error: 'Error', retry: 'Try again' },
                app: { title: 'MASKSERVICE C20', initializing: 'Initializing...' }
            },
            de: {
                global: { loading: 'Laden...', error: 'Fehler', retry: 'Erneut versuchen' },
                app: { title: 'MASKSERVICE C20', initializing: 'Initialisierung...' }
            }
        };
    }
}

// Initialize Vue application
async function initializeApp() {
    try {
        // Load translations
        const messages = await loadTranslations();
        
        // Create i18n instance
        const i18n = createI18n({
            locale: localStorage.getItem('app-language') || 'pl',
            fallbackLocale: 'en',
            messages,
            legacy: false,
            globalInjection: true
        });
        
        // Create Vue app with minimal configuration
        const app = createApp({
            name: 'MaskServiceVueApp',
            data() {
                return {
                    isLoading: true,
                    hasError: false,
                    errorMessage: '',
                    currentRoute: null,
                    navigationHistory: [],
                    currentUser: null,
                    sessionTimeout: null,
                    APP_NAME: 'MASKSERVICE C20',
                    APP_VERSION: '3.0 Vue',
                    BUILD_DATE: new Date().toISOString().split('T')[0],
                    initStartTime: performance.now(),
                    componentLoadTimes: {},
                    FEATURES: {
                        PRESSURE_SIMULATION: true,
                        VIRTUAL_KEYBOARD: true,
                        OFFLINE_MODE: false,
                        DEBUG_MODE: false
                    }
                }
            },
            
            async mounted() {
                console.log('🚀 Vue App mounting...');
                
                try {
                    // Initialize app components
                    await this.initializeComponents();
                    
                    // Setup event listeners
                    this.setupEventListeners();
                    
                    // Check for saved session
                    this.restoreSession();
                    
                    // Mark as loaded
                    this.isLoading = false;
                    
                    const loadTime = performance.now() - this.initStartTime;
                    console.log(`✅ Vue App initialized in ${loadTime.toFixed(2)}ms`);
                    
                } catch (error) {
                    console.error('❌ App initialization failed:', error);
                    this.hasError = true;
                    this.errorMessage = error.message || 'Unknown initialization error';
                    this.isLoading = false;
                }
            },
            
            methods: {
                async initializeComponents() {
                    console.log('📦 Initializing components...');
                    // Component initialization will be handled by existing Vue component files
                    return true;
                },
                
                setupEventListeners() {
                    // Global error handler
                    window.addEventListener('error', (event) => {
                        console.error('Global error:', event.error);
                        this.handleGlobalError(event.error);
                    });
                    
                    // Unhandled promise rejection handler
                    window.addEventListener('unhandledrejection', (event) => {
                        console.error('Unhandled promise rejection:', event.reason);
                        this.handleGlobalError(new Error(event.reason));
                    });
                    
                    // Visibility change handler
                    document.addEventListener('visibilitychange', () => {
                        if (document.hidden) {
                            console.log('📱 App went to background');
                        } else {
                            console.log('📱 App came to foreground');
                        }
                    });
                },
                
                restoreSession() {
                    try {
                        const savedSession = localStorage.getItem('maskservice-session');
                        if (savedSession) {
                            const sessionData = JSON.parse(savedSession);
                            if (sessionData.expiresAt > Date.now()) {
                                this.currentUser = sessionData.user;
                                console.log('🔄 Session restored:', sessionData.user.role);
                            } else {
                                localStorage.removeItem('maskservice-session');
                                console.log('⏰ Expired session removed');
                            }
                        }
                    } catch (error) {
                        console.error('Session restoration failed:', error);
                        localStorage.removeItem('maskservice-session');
                    }
                },
                
                handleGlobalError(error) {
                    if (!this.hasError) {
                        this.hasError = true;
                        this.errorMessage = error.message || 'Unknown error occurred';
                        this.isLoading = false;
                    }
                },
                
                retryInitialization() {
                    console.log('🔄 Retrying initialization...');
                    this.hasError = false;
                    this.errorMessage = '';
                    this.isLoading = true;
                    this.initStartTime = performance.now();
                    
                    // Retry after brief delay
                    setTimeout(() => {
                        this.initializeComponents().then(() => {
                            this.isLoading = false;
                        }).catch((error) => {
                            this.handleGlobalError(error);
                        });
                    }, 500);
                },
                
                // Mock login method for role selection
                mockLogin(role) {
                    console.log(`🚀 Mock login as ${role}`);
                    
                    // Update current user
                    this.currentUser = {
                        username: `demo_${role.toLowerCase()}`,
                        role: role,
                        isAuthenticated: true,
                        loginTime: new Date().toISOString()
                    };
                    
                    // Set current route based on role
                    switch(role) {
                        case 'OPERATOR':
                            this.currentRoute = 'user-menu';
                            break;
                        case 'ADMIN':
                            this.currentRoute = 'system';
                            break;
                        case 'SERVICEUSER':
                            this.currentRoute = 'user-menu';
                            break;
                        default:
                            this.currentRoute = 'login';
                    }
                    
                    // Store session in localStorage
                    localStorage.setItem('maskservice-session', JSON.stringify(this.currentUser));
                    localStorage.setItem('maskservice-route', this.currentRoute);
                    
                    console.log(`✅ Logged in as ${role}, navigating to ${this.currentRoute}`);
                    
                    // Trigger component update
                    this.$nextTick(() => {
                        console.log('🔄 Component updated after login');
                    });
                }
            },
            
            // Add missing template for proper rendering
            template: `
                <div v-if="isLoading" class="app-loading">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">{{ $t('global.loading') || 'Ładowanie...' }}</div>
                    <div class="loading-subtitle">{{ $t('app.initializing') || 'Inicjalizacja systemu MASKSERVICE C20' }}</div>
                </div>
                
                <div v-else-if="hasError" class="app-error">
                    <h2>{{ $t('global.error') || 'Błąd aplikacji' }}</h2>
                    <p>{{ errorMessage }}</p>
                    <button @click="retryInitialization" class="btn btn-primary">
                        {{ $t('global.retry') || 'Spróbuj ponownie' }}
                    </button>
                </div>
                
                <div v-else>
                    <!-- Main app content rendered by Vue components -->
                    <LoginScreen v-if="currentRoute === 'login'"></LoginScreen>
                    <UserMenuScreen v-else-if="currentRoute === 'user-menu'"></UserMenuScreen>
                    <SystemScreen v-else-if="currentRoute === 'system'"></SystemScreen>
                    
                    <!-- Default fallback content -->
                    <div v-if="!currentRoute" class="welcome-container">
                        <div class="welcome-header">
                            <h1>🔧 {{ APP_NAME }}</h1>
                            <p>Version {{ APP_VERSION }} - Build {{ BUILD_DATE }}</p>
                        </div>
                        
                        <div class="role-selection">
                            <h2>{{ $t('login.selectRole') || 'Wybierz rolę użytkownika' }}</h2>
                            
                            <div class="role-buttons">
                                <button @click="mockLogin('OPERATOR')" class="btn btn-operator">
                                    🔧 {{ $t('roles.operator') || 'OPERATOR' }}
                                </button>
                                <button @click="mockLogin('ADMIN')" class="btn btn-admin">
                                    ⚙️ {{ $t('roles.admin') || 'ADMIN' }}
                                </button>
                                <button @click="mockLogin('SERVICEUSER')" class="btn btn-service">
                                    🛠️ {{ $t('roles.serviceuser') || 'SERVICEUSER' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `
        });
        
        // Use i18n
        app.use(i18n);
        
        // Register Vue components before mounting
        console.log('📦 Registering Vue components...');
        
        // Main screen components
        if (window.LoginScreen) {
            app.component('LoginScreen', window.LoginScreen);
            console.log('✅ LoginScreen component registered');
        } else {
            console.warn('⚠️ LoginScreen component not found in window');
        }
        
        if (window.UserMenuScreen) {
            app.component('UserMenuScreen', window.UserMenuScreen);
            console.log('✅ UserMenuScreen component registered');
        } else {
            console.warn('⚠️ UserMenuScreen component not found in window');
        }
        
        if (window.SystemScreen) {
            app.component('SystemScreen', window.SystemScreen);
            console.log('✅ SystemScreen component registered');
        } else {
            console.warn('⚠️ SystemScreen component not found in window');
        }
        
        // Template components
        if (window.TestMenuTemplate) {
            app.component('TestMenuTemplate', window.TestMenuTemplate);
            console.log('✅ TestMenuTemplate component registered');
        }
        
        if (window.UserDataTemplate) {
            app.component('UserDataTemplate', window.UserDataTemplate);
            console.log('✅ UserDataTemplate component registered');
        }
        
        if (window.SystemSettingsTemplate) {
            app.component('SystemSettingsTemplate', window.SystemSettingsTemplate);
            console.log('✅ SystemSettingsTemplate component registered');
        }
        
        if (window.WorkshopTemplate) {
            app.component('WorkshopTemplate', window.WorkshopTemplate);
            console.log('✅ WorkshopTemplate component registered');
        }
        
        if (window.TestReportsTemplate) {
            app.component('TestReportsTemplate', window.TestReportsTemplate);
            console.log('✅ TestReportsTemplate component registered');
        }
        
        if (window.DeviceDataTemplate) {
            app.component('DeviceDataTemplate', window.DeviceDataTemplate);
            console.log('✅ DeviceDataTemplate component registered');
        }
        
        if (window.RealtimeSensorsTemplate) {
            app.component('RealtimeSensorsTemplate', window.RealtimeSensorsTemplate);
            console.log('✅ RealtimeSensorsTemplate component registered');
        }
        
        console.log('🎯 Vue component registration completed');
        
        // Global error handler for Vue
        app.config.errorHandler = (error, instance, info) => {
            console.error('Vue error:', error, info);
        };
        
        // Mount the app
        const mountedApp = app.mount('#app');
        
        // Global app reference
        window.MaskServiceVueApp = mountedApp;
        
        console.log('🎯 Vue.js App successfully initialized!');
        
    } catch (error) {
        console.error('❌ Critical initialization error:', error);
        
        // Fallback error display
        document.getElementById('app').innerHTML = `
            <div class="app-error">
                <h2>Błąd inicjalizacji aplikacji / Application Initialization Error</h2>
                <p><strong>Error:</strong> ${error.message}</p>
                <p>Please refresh the page or contact support.</p>
                <button onclick="window.location.reload()" class="btn btn-primary">
                    Odśwież stronę / Refresh Page
                </button>
            </div>
        `;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`📊 Page fully loaded in ${loadTime.toFixed(2)}ms`);
});

console.log('🔶 Vue.js main.js initialization script loaded');
