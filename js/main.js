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
                }
            }
        });
        
        // Use i18n
        app.use(i18n);
        
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
