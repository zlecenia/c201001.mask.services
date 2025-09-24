/**
 * MASKTRONIC C20 - Vue.js User Data Template Component
 * Replaces vanilla user-data-template.html
 * Display user information and session data
 */


const UserDataTemplate = {
    name: 'UserDataTemplate',
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
    
    emits: ['navigate', 'user-updated'],
    
    setup(props, { emit }) {
        // Vue.js imports - CRITICAL FIX for regression
        const { reactive, computed, onMounted, onUnmounted } = Vue;
        
        // Reactive state
        const userState = reactive({
            loginTime: null,
            lastActivity: null,
            sessionDuration: 0,
            activityTimer: null,
            isEditing: false,
            editableData: {
                displayName: '',
                email: '',
                department: ''
            }
        });

        // Computed properties
        const pageTitle = computed(() => {
            const titleMap = {
                pl: 'Dane Użytkownika',
                en: 'User Data',
                de: 'Benutzerdaten'
            };
            return titleMap[props.language] || 'Dane Użytkownika';
        });

        const userRoleText = computed(() => {
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
                }
            };
            const langRoles = roleMap[props.language] || roleMap.pl;
            const userRole = props.user?.role || 'GUEST';
            return langRoles[userRole] || userRole;
        });

        const formatTime = (date) => {
            if (!date) return '---';
            return date.toLocaleString(props.language === 'pl' ? 'pl-PL' : 'en-US');
        };

        const formatDuration = (seconds) => {
            if (!seconds) return '0s';
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            
            if (hours > 0) {
                return `${hours}h ${minutes}m ${secs}s`;
            } else if (minutes > 0) {
                return `${minutes}m ${secs}s`;
            } else {
                return `${secs}s`;
            }
        };

        const sessionInfo = computed(() => ({
            loginTime: formatTime(userState.loginTime),
            lastActivity: formatTime(userState.lastActivity),
            sessionDuration: formatDuration(userState.sessionDuration)
        }));

        const userPermissions = computed(() => {
            const permissionMap = {
                OPERATOR: ['read_devices', 'run_tests', 'view_reports'],
                ADMIN: ['read_devices', 'run_tests', 'view_reports', 'manage_users', 'system_settings'],
                SUPERUSER: ['read_devices', 'run_tests', 'view_reports', 'manage_users', 'system_settings', 'advanced_config', 'integrations'],
                SERVICEUSER: ['read_devices', 'run_tests', 'view_reports', 'service_mode', 'diagnostics', 'calibration']
            };
            
            return permissionMap[props.user.role] || [];
        });

        // Methods
        const updateActivity = () => {
            userState.lastActivity = new Date();
            userState.sessionDuration += 1;
        };

        const startActivityTimer = () => {
            userState.activityTimer = setInterval(updateActivity, 1000);
        };

        const stopActivityTimer = () => {
            if (userState.activityTimer) {
                clearInterval(userState.activityTimer);
                userState.activityTimer = null;
            }
        };

        const toggleEdit = () => {
            userState.isEditing = !userState.isEditing;
            
            if (userState.isEditing) {
                // Initialize editable data
                userState.editableData = {
                    displayName: props.user.displayName || props.user.username,
                    email: props.user.email || '',
                    department: props.user.department || ''
                };
            }
        };

        const saveUserData = async () => {
            console.log('🔶 Vue: Saving user data...', userState.editableData);
            
            try {
                // Integrate with existing user management system if available
                if (window.UserManager && window.UserManager.updateUser) {
                    await window.UserManager.updateUser(props.user.username, userState.editableData);
                } else {
                    // Vue-only simulation
                    await simulateUserUpdate();
                }
                
                // Emit update event
                emit('user-updated', {
                    ...props.user,
                    ...userState.editableData
                });
                
                userState.isEditing = false;
                console.log('✅ Vue: User data saved successfully');
                
            } catch (error) {
                console.error('❌ Vue: Failed to save user data:', error);
                alert('Błąd podczas zapisywania danych użytkownika');
            }
        };

        const simulateUserUpdate = async () => {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Here would normally be an API call to update user data
            console.log('🔶 Vue: User data update simulated');
        };

        const exportUserData = async () => {
            console.log('🔶 Vue: Exporting user data...');
            
            const userData = {
                username: props.user.username,
                role: props.user.role,
                displayName: userState.editableData.displayName,
                email: userState.editableData.email,
                department: userState.editableData.department,
                permissions: userPermissions.value,
                session: {
                    loginTime: userState.loginTime?.toISOString(),
                    lastActivity: userState.lastActivity?.toISOString(),
                    sessionDuration: userState.sessionDuration
                },
                exportTime: new Date().toISOString()
            };
            
            // Create and download JSON file
            const content = JSON.stringify(userData, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `user-data-${props.user.username}-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ Vue: User data exported successfully');
        };

        const goBack = () => {
            console.log('🔶 Vue: Returning to user menu');
            emit('navigate', 'user-menu-screen', props.language, 'default');
        };

        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: UserDataTemplate component mounted');
            
            // Initialize session data
            userState.loginTime = new Date();
            userState.lastActivity = new Date();
            userState.sessionDuration = 0;
            
            // Start activity timer
            startActivityTimer();
            
            // Initialize editable data
            userState.editableData = {
                displayName: props.user.displayName || props.user.username,
                email: props.user.email || '',
                department: props.user.department || ''
            };
        });

        onUnmounted(() => {
            console.log('🔶 Vue: UserDataTemplate component unmounted');
            stopActivityTimer();
        });

        return {
            userState,
            pageTitle,
            userRoleText,
            sessionInfo,
            userPermissions,
            toggleEdit,
            saveUserData,
            exportUserData,
            goBack
        };
    },

    template: `
        <div class="user-data-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="header-actions">
                        <button class="export-btn" @click="exportUserData">
                            📤 Eksport
                        </button>
                        <div class="vue-badge">Vue</div>
                    </div>
                </div>

                <!-- User Info Grid -->
                <div class="user-info-section">
                    <div class="user-info-grid">
                        
                        <!-- Current User Card -->
                        <div class="info-card">
                            <h3>{{ language === 'pl' ? 'Aktualny użytkownik' : 'Current User' }}</h3>
                            <div class="user-details">
                                <div class="detail-row">
                                    <span class="label">{{ language === 'pl' ? 'Nazwa użytkownika:' : 'Username:' }}</span>
                                    <span class="value">{{ user.username || '---' }}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">{{ language === 'pl' ? 'Rola:' : 'Role:' }}</span>
                                    <span class="value role-badge" :class="'role-' + user.role?.toLowerCase()">
                                        {{ userRoleText }}
                                    </span>
                                </div>
                                <div v-if="!userState.isEditing" class="detail-row">
                                    <span class="label">{{ language === 'pl' ? 'Nazwa wyświetlana:' : 'Display Name:' }}</span>
                                    <span class="value">{{ userState.editableData.displayName || '---' }}</span>
                                </div>
                                <div v-if="!userState.isEditing" class="detail-row">
                                    <span class="label">Email:</span>
                                    <span class="value">{{ userState.editableData.email || '---' }}</span>
                                </div>
                                <div v-if="!userState.isEditing" class="detail-row">
                                    <span class="label">{{ language === 'pl' ? 'Dział:' : 'Department:' }}</span>
                                    <span class="value">{{ userState.editableData.department || '---' }}</span>
                                </div>
                            </div>
                            
                            <!-- Edit Mode -->
                            <div v-if="userState.isEditing" class="edit-form">
                                <div class="form-group">
                                    <label>{{ language === 'pl' ? 'Nazwa wyświetlana:' : 'Display Name:' }}</label>
                                    <input v-model="userState.editableData.displayName" type="text" class="form-input">
                                </div>
                                <div class="form-group">
                                    <label>Email:</label>
                                    <input v-model="userState.editableData.email" type="email" class="form-input">
                                </div>
                                <div class="form-group">
                                    <label>{{ language === 'pl' ? 'Dział:' : 'Department:' }}</label>
                                    <input v-model="userState.editableData.department" type="text" class="form-input">
                                </div>
                                <div class="form-actions">
                                    <button class="save-btn" @click="saveUserData">💾 Zapisz</button>
                                    <button class="cancel-btn" @click="toggleEdit">❌ Anuluj</button>
                                </div>
                            </div>
                            
                            <button v-if="!userState.isEditing" class="edit-btn" @click="toggleEdit">
                                ✏️ Edytuj
                            </button>
                        </div>

                        <!-- Session Info Card -->
                        <div class="info-card">
                            <h3>{{ language === 'pl' ? 'Informacje o sesji' : 'Session Info' }}</h3>
                            <div class="session-details">
                                <div class="detail-row">
                                    <span class="label">{{ language === 'pl' ? 'Czas logowania:' : 'Login time:' }}</span>
                                    <span class="value">{{ sessionInfo.loginTime }}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">{{ language === 'pl' ? 'Ostatnia aktywność:' : 'Last activity:' }}</span>
                                    <span class="value">{{ sessionInfo.lastActivity }}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">{{ language === 'pl' ? 'Czas sesji:' : 'Session duration:' }}</span>
                                    <span class="value">{{ sessionInfo.sessionDuration }}</span>
                                </div>
                                <div class="status-indicator">
                                    <span class="status-dot online"></span>
                                    <span>{{ language === 'pl' ? 'Aktywny' : 'Active' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Permissions Card -->
                        <div class="info-card">
                            <h3>{{ language === 'pl' ? 'Uprawnienia' : 'Permissions' }}</h3>
                            <div class="permissions-list">
                                <div 
                                    v-for="permission in userPermissions" 
                                    :key="permission"
                                    class="permission-item"
                                >
                                    <span class="permission-icon">✅</span>
                                    <span class="permission-name">{{ permission.replace('_', ' ') }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Statistics Card -->
                        <div class="info-card">
                            <h3>{{ language === 'pl' ? 'Statystyki' : 'Statistics' }}</h3>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-value">{{ Math.floor(userState.sessionDuration / 60) }}</div>
                                    <div class="stat-label">{{ language === 'pl' ? 'Minuty online' : 'Minutes online' }}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">{{ userPermissions.length }}</div>
                                    <div class="stat-label">{{ language === 'pl' ? 'Uprawnienia' : 'Permissions' }}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">🔶</div>
                                    <div class="stat-label">Vue Active</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .user-data-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .template-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .template-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        
        .back-btn {
            padding: 8px 16px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .back-btn:hover {
            background: #5a6268;
        }
        
        .template-title {
            margin: 0;
            color: #333;
            font-size: 1.8em;
        }
        
        .header-actions {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        
        .export-btn {
            padding: 8px 16px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .export-btn:hover {
            background: #218838;
        }
        
        .vue-badge {
            background: #42b883;
            color: white;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 0.9em;
            font-weight: 600;
        }
        
        .user-info-section {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .user-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e9ecef;
        }
        
        .info-card h3 {
            margin: 0 0 16px 0;
            color: #333;
            font-size: 1.2em;
            border-bottom: 2px solid #42b883;
            padding-bottom: 8px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .label {
            font-weight: 600;
            color: #666;
        }
        
        .value {
            color: #333;
        }
        
        .role-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.9em;
            font-weight: 600;
            color: white;
        }
        
        .role-badge.role-operator { background: #3498db; }
        .role-badge.role-admin { background: #27ae60; }
        .role-badge.role-superuser { background: #9b59b6; }
        .role-badge.role-serviceuser { background: #e67e22; }
        
        .edit-form {
            margin: 16px 0;
        }
        
        .form-group {
            margin-bottom: 16px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 4px;
            font-weight: 600;
            color: #666;
        }
        
        .form-input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #42b883;
            box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
        }
        
        .form-actions {
            display: flex;
            gap: 8px;
        }
        
        .save-btn, .cancel-btn, .edit-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .save-btn {
            background: #28a745;
            color: white;
        }
        
        .save-btn:hover {
            background: #218838;
        }
        
        .cancel-btn {
            background: #dc3545;
            color: white;
        }
        
        .cancel-btn:hover {
            background: #c82333;
        }
        
        .edit-btn {
            background: #007bff;
            color: white;
            margin-top: 16px;
            width: 100%;
        }
        
        .edit-btn:hover {
            background: #0056b3;
        }
        
        .status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 8px;
        }
        
        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        
        .status-dot.online {
            background: #28a745;
            box-shadow: 0 0 8px rgba(40, 167, 69, 0.6);
        }
        
        .permissions-list {
            display: grid;
            gap: 8px;
        }
        
        .permission-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 0;
        }
        
        .permission-name {
            text-transform: capitalize;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
            gap: 16px;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-value {
            font-size: 1.5em;
            font-weight: 600;
            color: #42b883;
        }
        
        .stat-label {
            font-size: 0.8em;
            color: #666;
            margin-top: 4px;
        }
    `
};

// Export component for use
window.UserDataTemplate = UserDataTemplate;
console.log('🔶 Vue UserDataTemplate component loaded');
