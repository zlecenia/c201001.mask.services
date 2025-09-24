/**
 * MASKSERVICE C20 - Vue.js System Screen Component
 * Replaces vanilla system-screen.html template
 * Uses global Vue APIs from vue-app.js (no duplicate destructuring)
 */

const SystemScreen = {
    name: 'SystemScreen',
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
    
    emits: ['navigate'],
    
    setup(props, { emit }) {
        // Reactive state
        const systemState = reactive({
            isLoading: true,
            showAnimation: true,
            loadingProgress: 0
        });

        // Computed properties
        const welcomeText = computed(() => {
            const textMap = {
                pl: 'Witamy w systemie',
                en: 'Welcome to the system',
                de: 'Willkommen im System'
            };
            return textMap[props.language] || 'Witamy w systemie';
        });

        const systemName = computed(() => {
            return 'MASKTRONIC C20';
        });

        const userRoleText = computed(() => {
            if (props.user.isAuthenticated) {
                const roleMap = {
                    pl: {
                        OPERATOR: 'Operator',
                        ADMIN: 'Administrator',
                        SUPERUSER: 'Superuser',
                        SERVICEUSER: 'Serwisant'
                    },
                    en: {
                        OPERATOR: 'Operator',
                        ADMIN: 'Administrator', 
                        SUPERUSER: 'Superuser',
                        SERVICEUSER: 'Service Technician'
                    },
                    de: {
                        OPERATOR: 'Bediener',
                        ADMIN: 'Administrator',
                        SUPERUSER: 'Superuser',
                        SERVICEUSER: 'Servicetechniker'
                    }
                };
                
                const langRoles = roleMap[props.language] || roleMap.pl;
                return langRoles[props.user.role] || props.user.role;
            }
            return '';
        });

        // Methods
        const startLoadingAnimation = () => {
            systemState.isLoading = true;
            systemState.showAnimation = true;
            systemState.loadingProgress = 0;

            const progressInterval = setInterval(() => {
                systemState.loadingProgress += Math.random() * 100;
                
                if (systemState.loadingProgress >= 100) {
                    systemState.loadingProgress = 100;
                    clearInterval(progressInterval);
                    
                    // Complete loading after animation
                    setTimeout(() => {
                        systemState.isLoading = false;
                        systemState.showAnimation = false;
                        
                        // Navigate to user menu after system screen
                        setTimeout(() => {
                            emit('navigate', 'user-menu-screen', props.language, 'default');
                        }, 200);
                        
                    }, 200);
                }
            }, 100);
        };

        const skipAnimation = () => {
            systemState.isLoading = false;
            systemState.showAnimation = false;
            emit('navigate', 'user-menu-screen', props.language, 'default');
        };

        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: SystemScreen component mounted');
            
            // Start loading animation after short delay
            setTimeout(() => {
                startLoadingAnimation();
            }, 200);
        });

        return {
            systemState,
            welcomeText,
            systemName,
            userRoleText,
            startLoadingAnimation,
            skipAnimation
        };
    },

    template: `
        <div class="system-screen vue-component">
            <div class="system-container">
                
                <!-- Loading Animation -->
                <div v-if="systemState.showAnimation" class="system-loading">
                    <div class="system-logo-large">
                        <div class="logo-icon">🛡️</div>
                        <h1 class="system-title">{{ systemName }}</h1>
                        <p class="system-subtitle">System testowania urządzeń ochrony osobistej</p>
                        <div class="vue-badge-large">Vue.js</div>
                    </div>
                    
                    <div class="loading-section" v-if="systemState.isLoading">
                        <div class="loading-bar">
                            <div 
                                class="loading-progress" 
                                :style="{ width: systemState.loadingProgress + '%' }"
                            ></div>
                        </div>
                        <p class="loading-text">
                            {{ systemState.loadingProgress < 50 ? 'Ładowanie systemu...' : 
                               systemState.loadingProgress < 90 ? 'Inicjalizacja modułów...' : 
                               'Prawie gotowe...' }}
                        </p>
                        <p class="loading-progress-text">{{ Math.round(systemState.loadingProgress) }}%</p>
                    </div>
                    
                    <button 
                        v-if="systemState.isLoading" 
                        class="skip-btn"
                        @click="skipAnimation"
                    >
                        Pomiń animację
                    </button>
                </div>

                <!-- Welcome Screen -->
                <div v-else class="system-welcome">
                    <div class="welcome-content">
                        <h1 class="welcome-title">{{ welcomeText }}</h1>
                        <div class="system-info">
                            <div class="system-logo">{{ systemName }}</div>
                            <div v-if="user.isAuthenticated" class="user-info">
                                <p><strong>Użytkownik:</strong> {{ user.username }}</p>
                                <p><strong>Rola:</strong> {{ userRoleText }}</p>
                            </div>
                        </div>
                        
                        <div class="system-status">
                            <div class="status-item">
                                <span class="status-dot online"></span>
                                <span>System gotowy</span>
                            </div>
                            <div class="status-item">
                                <span class="status-dot online"></span>
                                <span>Vue.js aktywny</span>
                            </div>
                        </div>
                        
                        <button 
                            class="continue-btn"
                            @click="$emit('navigate', 'user-menu-screen', language, 'default')"
                        >
                            Kontynuuj →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .system-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .system-container {
            text-align: center;
            width: 100%;
            max-width: 500px;
            padding: 40px;
        }
        
        .system-logo-large {
            margin-bottom: 40px;
        }
        
        .logo-icon {
            font-size: 4em;
            margin-bottom: 16px;
        }
        
        .system-title {
            font-size: 2.5em;
            margin: 0 0 8px 0;
            font-weight: 300;
        }
        
        .system-subtitle {
            font-size: 1.1em;
            opacity: 0.8;
            margin: 0 0 20px 0;
        }
        
        .vue-badge-large {
            display: inline-block;
            background: #42b883;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
        }
        
        .loading-section {
            margin: 40px 0;
        }
        
        .loading-bar {
            width: 100%;
            height: 6px;
            background: rgba(255,255,255,0.2);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 16px;
        }
        
        .loading-progress {
            height: 100%;
            background: linear-gradient(90deg, #42b883, #34c759);
            border-radius: 3px;
            transition: width 0.3s ease;
        }
        
        .loading-text {
            font-size: 1.1em;
            margin: 8px 0;
        }
        
        .loading-progress-text {
            font-size: 0.9em;
            opacity: 0.7;
        }
        
        .skip-btn {
            margin-top: 20px;
            padding: 8px 16px;
            background: transparent;
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .skip-btn:hover {
            background: rgba(255,255,255,0.1);
            border-color: rgba(255,255,255,0.5);
        }
        
        .welcome-title {
            font-size: 2em;
            margin-bottom: 24px;
        }
        
        .system-info {
            background: rgba(255,255,255,0.1);
            padding: 24px;
            border-radius: 8px;
            margin-bottom: 24px;
        }
        
        .system-logo {
            font-size: 1.5em;
            font-weight: 600;
            margin-bottom: 16px;
        }
        
        .user-info p {
            margin: 8px 0;
            font-size: 1.1em;
        }
        
        .system-status {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin-bottom: 32px;
        }
        
        .status-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #34c759;
        }
        
        .status-dot.online {
            background: #34c759;
            box-shadow: 0 0 8px rgba(52, 199, 89, 0.6);
        }
        
        .continue-btn {
            padding: 12px 24px;
            background: #42b883;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 1.1em;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .continue-btn:hover {
            background: #369870;
            transform: translateY(-2px);
        }
    `
};

// Export component for use
window.SystemScreen = SystemScreen;
console.log('🔶 Vue SystemScreen component loaded');
