/**
 * MASKSERVICE C20 - Vue.js User Menu Screen Component
 * Replaces vanilla user-menu-screen.html template
 * Dynamic menu based on user role
 */

const { ref, reactive, computed, onMounted, nextTick } = Vue;

const UserMenuScreen = {
    name: 'UserMenuScreen',
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
    
    emits: ['navigate', 'logout'],
    
    setup(props, { emit }) {
        // Reactive state
        const menuState = reactive({
            isLoading: true,
            currentView: 'menu',
            selectedMenuItem: null
        });

        // Menu configuration based on role
        const getMenuConfig = () => {
            const baseMenus = {
                OPERATOR: [
                    { id: 'test_menu', icon: '🧪', label: 'Test Menu', description: 'Rozpocznij testy urządzeń' },
                    { id: 'device_select', icon: '🛡️', label: 'Device Selection', description: 'Wybierz urządzenie do testów' },
                    { id: 'user_data', icon: '👤', label: 'User Data', description: 'Dane użytkownika' },
                    { id: 'device_data', icon: '📊', label: 'Device Data', description: 'Dane urządzenia' },
                    { id: 'test_reports', icon: '📋', label: 'Test Reports', description: 'Raporty testów' },
                    { id: 'realtime_sensors', icon: '📡', label: 'Real-time Sensors', description: 'Czujniki w czasie rzeczywistym' },
                    { id: 'device_history', icon: '📈', label: 'Device History', description: 'Historia urządzenia' }
                ],
                ADMIN: [
                    { id: 'test_menu', icon: '🧪', label: 'Test Menu', description: 'Zarządzanie testami' },
                    { id: 'user_data', icon: '👤', label: 'User Data', description: 'Dane użytkownika' },
                    { id: 'users', icon: '👥', label: 'Users Management', description: 'Zarządzanie użytkownikami' },
                    { id: 'reports_view', icon: '📊', label: 'Reports View', description: 'Przeglądanie raportów' },
                    { id: 'reports_batch', icon: '📋', label: 'Batch Reports', description: 'Raporty zbiorcze' },
                    { id: 'reports_schedule', icon: '⏰', label: 'Reports Schedule', description: 'Harmonogram raportów' },
                    { id: 'device_history', icon: '📈', label: 'Device History', description: 'Historia urządzeń' },
                    { id: 'workshop', icon: '🔧', label: 'Workshop', description: 'Warsztat serwisowy' },
                    { id: 'settings_system', icon: '⚙️', label: 'System Settings', description: 'Ustawienia systemu' }
                ],
                SUPERUSER: [
                    { id: 'test_menu', icon: '🧪', label: 'Test Menu', description: 'Kompletne zarządzanie testami' },
                    { id: 'user_data', icon: '👤', label: 'User Data', description: 'Dane użytkownika' },
                    { id: 'users', icon: '👥', label: 'Users Management', description: 'Zarządzanie wszystkimi użytkownikami' },
                    { id: 'reports_view', icon: '📊', label: 'Reports View', description: 'Wszystkie raporty' },
                    { id: 'reports_batch', icon: '📋', label: 'Batch Reports', description: 'Raporty zbiorcze' },
                    { id: 'reports_schedule', icon: '⏰', label: 'Reports Schedule', description: 'Zaawansowany harmonogram' },
                    { id: 'device_history', icon: '📈', label: 'Device History', description: 'Pełna historia urządzeń' },
                    { id: 'workshop', icon: '🔧', label: 'Workshop', description: 'Zarządzanie warsztatem' },
                    { id: 'settings_system', icon: '⚙️', label: 'System Settings', description: 'Zaawansowane ustawienia' },
                    { id: 'settings_integration', icon: '🔗', label: 'Integrations', description: 'Integracje zewnętrzne' },
                    { id: 'settings_standards', icon: '📏', label: 'Standards', description: 'Standardy i normy' },
                    { id: 'settings_scenarios', icon: '🎯', label: 'Scenarios', description: 'Scenariusze testowe' },
                    { id: 'service_menu', icon: '🛠️', label: 'Service Menu', description: 'Menu serwisowe' },
                    { id: 'advanced_diagnostics', icon: '🔍', label: 'Advanced Diagnostics', description: 'Zaawansowana diagnostyka' },
                    { id: 'system_diagnostics', icon: '💻', label: 'System Diagnostics', description: 'Diagnostyka systemowa' }
                ],
                SERWISANT: [
                    { id: 'test_menu', icon: '🧪', label: 'Test Menu', description: 'Menu testów serwisowych' },
                    { id: 'user_data', icon: '👤', label: 'User Data', description: 'Dane serwisanta' },
                    { id: 'device_data', icon: '📊', label: 'Device Data', description: 'Dane urządzenia' },
                    { id: 'test_reports', icon: '📋', label: 'Test Reports', description: 'Raporty serwisowe' },
                    { id: 'realtime_sensors', icon: '📡', label: 'Real-time Sensors', description: 'Monitoring czujników' },
                    { id: 'device_history', icon: '📈', label: 'Device History', description: 'Historia serwisowania' },
                    { id: 'workshop_parts', icon: '🔩', label: 'Workshop Parts', description: 'Części zamienne' },
                    { id: 'workshop_maintenance', icon: '🔧', label: 'Maintenance', description: 'Harmonogram konserwacji' },
                    { id: 'workshop_tools', icon: '🛠️', label: 'Tools', description: 'Narzędzia serwisowe' },
                    { id: 'workshop_inventory', icon: '📦', label: 'Inventory', description: 'Inwentarz warsztatowy' },
                    { id: 'service_menu', icon: '⚙️', label: 'Service Menu', description: 'Menu serwisowe' },
                    { id: 'settings_system', icon: '🔧', label: 'System Settings', description: 'Ustawienia serwisowe' },
                    { id: 'settings_integration', icon: '🔗', label: 'Integrations', description: 'Integracje serwisowe' },
                    { id: 'settings_standards', icon: '📏', label: 'Standards', description: 'Standardy serwisowe' },
                    { id: 'settings_scenarios', icon: '🎯', label: 'Scenarios', description: 'Scenariusze serwisowe' },
                    { id: 'advanced_diagnostics', icon: '🔍', label: 'Advanced Diagnostics', description: 'Diagnostyka zaawansowana' },
                    { id: 'system_diagnostics', icon: '💻', label: 'System Diagnostics', description: 'Diagnostyka systemu' },
                    { id: 'calibration_tools', icon: '⚖️', label: 'Calibration Tools', description: 'Narzędzia kalibracyjne' }
                ]
            };
            
            return baseMenus[props.user.role] || baseMenus.OPERATOR;
        };

        // Computed properties
        const currentMenu = computed(() => getMenuConfig());
        
        const userRoleText = computed(() => {
            const roleMap = {
                pl: {
                    OPERATOR: 'Operator',
                    ADMIN: 'Administrator',
                    SUPERUSER: 'Superuser',
                    SERWISANT: 'Serwisant'
                }
            };
            const langRoles = roleMap[props.language] || roleMap.pl;
            return langRoles[props.user.role] || props.user.role;
        });

        const welcomeText = computed(() => {
            const textMap = {
                pl: `Witaj, ${props.user.username}`,
                en: `Welcome, ${props.user.username}`,
                de: `Willkommen, ${props.user.username}`
            };
            return textMap[props.language] || `Witaj, ${props.user.username}`;
        });

        // Methods
        const selectMenuItem = async (menuItem) => {
            console.log(`🔶 Vue: Menu item selected: ${menuItem.id}`);
            menuState.selectedMenuItem = menuItem;
            
            // Integrate with existing MenuManager if available
            if (window.MenuManager && window.MenuManager.selectMenuOption) {
                try {
                    await window.MenuManager.selectMenuOption(menuItem.id);
                } catch (error) {
                    console.error(`🔶 Vue: Menu action failed for ${menuItem.id}:`, error);
                }
            } else {
                // Fallback - emit navigation event
                emit('navigate', 'template-view', props.language, menuItem.id);
            }
        };

        const handleLogout = () => {
            console.log('🔶 Vue: Logout initiated');
            
            // Integrate with existing auth system
            if (window.AuthManager && window.AuthManager.logout) {
                window.AuthManager.logout();
            }
            
            emit('logout');
            emit('navigate', 'login-screen', props.language, 'default');
        };

        const refreshMenu = () => {
            console.log('🔶 Vue: Menu refresh initiated');
            menuState.isLoading = true;
            
            setTimeout(() => {
                menuState.isLoading = false;
            }, 500);
        };

        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: UserMenuScreen component mounted');
            console.log(`🔶 Vue: Menu loaded for role: ${props.user.role} (${currentMenu.value.length} items)`);
            
            // Finish loading
            setTimeout(() => {
                menuState.isLoading = false;
            }, 300);
        });

        return {
            menuState,
            currentMenu,
            userRoleText,
            welcomeText,
            selectMenuItem,
            handleLogout,
            refreshMenu
        };
    },

    template: `
        <div class="user-menu-screen vue-component">
            <div class="menu-container">
                
                <!-- Menu Header -->
                <div class="menu-header">
                    <div class="header-content">
                        <h1 class="welcome-text">{{ welcomeText }}</h1>
                        <div class="user-badge">
                            <span class="role-badge" :class="'role-' + user.role.toLowerCase()">
                                {{ userRoleText }}
                            </span>
                            <span class="vue-indicator">Vue</span>
                        </div>
                    </div>
                    
                    <div class="header-actions">
                        <button class="refresh-btn" @click="refreshMenu" :disabled="menuState.isLoading">
                            {{ menuState.isLoading ? '⏳' : '🔄' }}
                        </button>
                        <button class="logout-btn" @click="handleLogout">
                            🚪 Wyloguj
                        </button>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="menuState.isLoading" class="menu-loading">
                    <div class="loading-spinner"></div>
                    <p>Ładowanie menu...</p>
                </div>

                <!-- Menu Grid -->
                <div v-else class="menu-layout">
                    <div class="menu-grid">
                        <div 
                            v-for="menuItem in currentMenu" 
                            :key="menuItem.id"
                            class="menu-item"
                            :class="{ active: menuState.selectedMenuItem?.id === menuItem.id }"
                            @click="selectMenuItem(menuItem)"
                        >
                            <div class="menu-icon">{{ menuItem.icon }}</div>
                            <div class="menu-content">
                                <h3 class="menu-title">{{ menuItem.label }}</h3>
                                <p class="menu-description">{{ menuItem.description }}</p>
                            </div>
                            <div class="menu-arrow">→</div>
                        </div>
                    </div>
                    
                    <!-- Menu Stats -->
                    <div class="menu-stats">
                        <p>{{ currentMenu.length }} opcji dostępnych dla roli {{ userRoleText }}</p>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .user-menu-screen {
            min-height: 100vh;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .menu-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .menu-header {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header-content {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .welcome-text {
            margin: 0;
            color: #333;
            font-size: 1.5em;
        }
        
        .user-badge {
            display: flex;
            gap: 8px;
        }
        
        .role-badge {
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 0.9em;
            font-weight: 600;
            color: white;
        }
        
        .role-badge.role-operator { background: #3498db; }
        .role-badge.role-admin { background: #27ae60; }
        .role-badge.role-superuser { background: #9b59b6; }
        .role-badge.role-serwisant { background: #e67e22; }
        
        .vue-indicator {
            background: #42b883;
            color: white;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 0.8em;
            font-weight: 600;
        }
        
        .header-actions {
            display: flex;
            gap: 12px;
        }
        
        .refresh-btn, .logout-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .refresh-btn {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
        }
        
        .refresh-btn:hover:not(:disabled) {
            background: #e9ecef;
        }
        
        .logout-btn {
            background: #dc3545;
            color: white;
        }
        
        .logout-btn:hover {
            background: #c82333;
        }
        
        .menu-loading {
            text-align: center;
            padding: 60px 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #42b883;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
        }
        
        .menu-item {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 16px;
            border: 2px solid transparent;
        }
        
        .menu-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            border-color: #42b883;
        }
        
        .menu-item.active {
            border-color: #42b883;
            background: #f8fffe;
        }
        
        .menu-icon {
            font-size: 2em;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
            border-radius: 50%;
        }
        
        .menu-content {
            flex: 1;
        }
        
        .menu-title {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 1.1em;
        }
        
        .menu-description {
            margin: 0;
            color: #666;
            font-size: 0.9em;
            line-height: 1.4;
        }
        
        .menu-arrow {
            font-size: 1.2em;
            color: #42b883;
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .menu-item:hover .menu-arrow {
            opacity: 1;
        }
        
        .menu-stats {
            text-align: center;
            padding: 16px;
            background: rgba(255,255,255,0.8);
            border-radius: 8px;
            color: #666;
            font-size: 0.9em;
        }
    `
};

// Export component for use
window.UserMenuScreen = UserMenuScreen;
console.log('🔶 Vue UserMenuScreen component loaded');
