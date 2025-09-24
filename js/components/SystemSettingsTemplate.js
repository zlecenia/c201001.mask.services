/**
 * MASKSERVICE C20 - Vue.js System Settings Template Component
 * Replaces vanilla system-settings-template.html
 * Advanced system configuration and settings management
 */

const { ref, reactive, computed, onMounted, watch } = Vue;

const SystemSettingsTemplate = {
    name: 'SystemSettingsTemplate',
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
    
    emits: ['navigate', 'settings-changed'],
    
    setup(props, { emit }) {
        // Reactive state
        const settingsState = reactive({
            isLoading: false,
            hasUnsavedChanges: false,
            lastSaved: null,
            isValidating: false
        });

        const networkSettings = reactive({
            ipAddress: '192.168.1.10',
            port: 8080,
            dhcpEnabled: false,
            gateway: '192.168.1.1',
            dnsServer: '8.8.8.8',
            connectionTimeout: 30
        });

        const systemConfig = reactive({
            updateInterval: 5,
            debugMode: false,
            logLevel: 'INFO',
            maxLogFiles: 10,
            autoBackup: true,
            backupInterval: 24,
            dataRetention: 365
        });

        const deviceSettings = reactive({
            deviceName: 'MASKSERVICE-001',
            location: 'Production Floor',
            timezone: 'Europe/Warsaw',
            language: 'pl',
            units: 'metric',
            precision: 2
        });

        const securitySettings = reactive({
            sessionTimeout: 30,
            maxLoginAttempts: 3,
            passwordExpiry: 90,
            enableTwoFactor: false,
            encryptionLevel: 'AES256',
            auditLogging: true
        });

        // Computed properties
        const pageTitle = computed(() => {
            const titleMap = {
                pl: 'Ustawienia Systemu',
                en: 'System Settings',
                de: 'Systemeinstellungen'
            };
            return titleMap[props.language] || 'Ustawienia Systemu';
        });

        const settingsCategories = computed(() => [
            {
                id: 'network',
                name: props.language === 'pl' ? 'Ustawienia Sieci' : 'Network Settings',
                icon: '🌐',
                settings: networkSettings
            },
            {
                id: 'system',
                name: props.language === 'pl' ? 'Konfiguracja Systemu' : 'System Configuration',
                icon: '⚙️',
                settings: systemConfig
            },
            {
                id: 'device',
                name: props.language === 'pl' ? 'Ustawienia Urządzenia' : 'Device Settings',
                icon: '🔧',
                settings: deviceSettings
            },
            {
                id: 'security',
                name: props.language === 'pl' ? 'Bezpieczeństwo' : 'Security',
                icon: '🔒',
                settings: securitySettings
            }
        ]);

        const logLevelOptions = computed(() => [
            { value: 'DEBUG', label: 'Debug' },
            { value: 'INFO', label: 'Info' },
            { value: 'WARNING', label: 'Warning' },
            { value: 'ERROR', label: 'Error' },
            { value: 'CRITICAL', label: 'Critical' }
        ]);

        const timezoneOptions = computed(() => [
            { value: 'Europe/Warsaw', label: 'Europe/Warsaw (CET)' },
            { value: 'Europe/London', label: 'Europe/London (GMT)' },
            { value: 'America/New_York', label: 'America/New_York (EST)' },
            { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' }
        ]);

        // Validation
        const isValidIP = (ip) => {
            const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            return ipRegex.test(ip);
        };

        const isValidPort = (port) => {
            return port >= 1 && port <= 65535;
        };

        const validateNetworkSettings = () => {
            return isValidIP(networkSettings.ipAddress) && 
                   isValidPort(networkSettings.port) &&
                   isValidIP(networkSettings.gateway) &&
                   isValidIP(networkSettings.dnsServer);
        };

        // Methods
        const saveSettings = async () => {
            console.log('🔶 Vue: Saving system settings...');
            settingsState.isLoading = true;
            settingsState.isValidating = true;

            try {
                // Validate settings
                if (!validateNetworkSettings()) {
                    throw new Error('Invalid network settings');
                }

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Integrate with existing settings system if available
                if (window.SystemManager && window.SystemManager.saveSettings) {
                    await window.SystemManager.saveSettings({
                        network: networkSettings,
                        system: systemConfig,
                        device: deviceSettings,
                        security: securitySettings
                    });
                }

                settingsState.hasUnsavedChanges = false;
                settingsState.lastSaved = new Date();
                
                emit('settings-changed', {
                    network: networkSettings,
                    system: systemConfig,
                    device: deviceSettings,
                    security: securitySettings
                });

                console.log('✅ Vue: System settings saved successfully');

            } catch (error) {
                console.error('❌ Vue: Failed to save settings:', error);
                alert(`Błąd zapisywania ustawień: ${error.message}`);
            } finally {
                settingsState.isLoading = false;
                settingsState.isValidating = false;
            }
        };

        const resetSettings = () => {
            console.log('🔶 Vue: Resetting settings to defaults...');
            
            if (confirm(props.language === 'pl' ? 
                'Czy na pewno chcesz przywrócić ustawienia domyślne?' : 
                'Are you sure you want to reset to default settings?')) {
                
                // Reset to defaults
                Object.assign(networkSettings, {
                    ipAddress: '192.168.1.10',
                    port: 8080,
                    dhcpEnabled: false,
                    gateway: '192.168.1.1',
                    dnsServer: '8.8.8.8',
                    connectionTimeout: 30
                });

                Object.assign(systemConfig, {
                    updateInterval: 5,
                    debugMode: false,
                    logLevel: 'INFO',
                    maxLogFiles: 10,
                    autoBackup: true,
                    backupInterval: 24,
                    dataRetention: 365
                });

                settingsState.hasUnsavedChanges = true;
            }
        };

        const testConnection = async () => {
            console.log('🔶 Vue: Testing network connection...');
            settingsState.isLoading = true;

            try {
                // Simulate network test
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                if (Math.random() > 0.2) { // 80% success rate
                    alert(props.language === 'pl' ? 
                        'Test połączenia zakończony sukcesem!' : 
                        'Connection test successful!');
                } else {
                    throw new Error('Connection timeout');
                }
            } catch (error) {
                alert(props.language === 'pl' ? 
                    `Test połączenia nieudany: ${error.message}` : 
                    `Connection test failed: ${error.message}`);
            } finally {
                settingsState.isLoading = false;
            }
        };

        const exportSettings = () => {
            const settingsData = {
                network: networkSettings,
                system: systemConfig,
                device: deviceSettings,
                security: { ...securitySettings, encryptionLevel: '[REDACTED]' }, // Security
                exportInfo: {
                    timestamp: new Date().toISOString(),
                    version: '2.1.4',
                    user: props.user.username
                }
            };

            const content = JSON.stringify(settingsData, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `maskservice-settings-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('✅ Vue: Settings exported successfully');
        };

        const goBack = () => {
            if (settingsState.hasUnsavedChanges) {
                if (confirm(props.language === 'pl' ? 
                    'Masz niezapisane zmiany. Czy na pewno chcesz wyjść?' : 
                    'You have unsaved changes. Are you sure you want to leave?')) {
                    emit('navigate', 'user-menu-screen', props.language, 'default');
                }
            } else {
                emit('navigate', 'user-menu-screen', props.language, 'default');
            }
        };

        // Watchers for unsaved changes
        watch(() => [networkSettings, systemConfig, deviceSettings, securitySettings], () => {
            settingsState.hasUnsavedChanges = true;
        }, { deep: true });

        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: SystemSettingsTemplate component mounted');
        });

        return {
            settingsState,
            networkSettings,
            systemConfig,
            deviceSettings,
            securitySettings,
            pageTitle,
            settingsCategories,
            logLevelOptions,
            timezoneOptions,
            isValidIP,
            isValidPort,
            validateNetworkSettings,
            saveSettings,
            resetSettings,
            testConnection,
            exportSettings,
            goBack
        };
    },

    template: `
        <div class="system-settings-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="header-actions">
                        <div v-if="settingsState.hasUnsavedChanges" class="unsaved-indicator">
                            ⚠️ {{ language === 'pl' ? 'Niezapisane zmiany' : 'Unsaved changes' }}
                        </div>
                        <div class="vue-badge">Vue</div>
                    </div>
                </div>

                <!-- Settings Grid -->
                <div class="settings-container">
                    
                    <!-- Network Settings -->
                    <div class="settings-group">
                        <h3>🌐 {{ language === 'pl' ? 'Ustawienia Sieci' : 'Network Settings' }}</h3>
                        <div class="settings-grid">
                            <div class="setting-item">
                                <label>{{ language === 'pl' ? 'Adres IP:' : 'IP Address:' }}</label>
                                <input 
                                    v-model="networkSettings.ipAddress" 
                                    type="text" 
                                    :class="{ invalid: !isValidIP(networkSettings.ipAddress) }"
                                    placeholder="192.168.1.10"
                                />
                            </div>
                            <div class="setting-item">
                                <label>{{ language === 'pl' ? 'Port:' : 'Port:' }}</label>
                                <input 
                                    v-model.number="networkSettings.port" 
                                    type="number" 
                                    :class="{ invalid: !isValidPort(networkSettings.port) }"
                                    min="1" max="65535"
                                />
                            </div>
                            <div class="setting-item">
                                <label>{{ language === 'pl' ? 'Brama:' : 'Gateway:' }}</label>
                                <input v-model="networkSettings.gateway" type="text" />
                            </div>
                            <div class="setting-item">
                                <label>DNS:</label>
                                <input v-model="networkSettings.dnsServer" type="text" />
                            </div>
                            <div class="setting-item checkbox">
                                <label>
                                    <input v-model="networkSettings.dhcpEnabled" type="checkbox" />
                                    {{ language === 'pl' ? 'DHCP włączone' : 'DHCP enabled' }}
                                </label>
                            </div>
                            <div class="setting-item">
                                <label>{{ language === 'pl' ? 'Timeout (s):' : 'Timeout (s):' }}</label>
                                <input v-model.number="networkSettings.connectionTimeout" type="number" min="5" max="300" />
                            </div>
                        </div>
                        <button class="test-btn" @click="testConnection" :disabled="settingsState.isLoading">
                            {{ settingsState.isLoading ? '⏳ Testowanie...' : '🔍 Test połączenia' }}
                        </button>
                    </div>

                    <!-- System Configuration -->
                    <div class="settings-group">
                        <h3>⚙️ {{ language === 'pl' ? 'Konfiguracja Systemu' : 'System Configuration' }}</h3>
                        <div class="settings-grid">
                            <div class="setting-item">
                                <label>{{ language === 'pl' ? 'Interwał odświeżania (s):' : 'Update interval (s):' }}</label>
                                <input v-model.number="systemConfig.updateInterval" type="number" min="1" max="3600" />
                            </div>
                            <div class="setting-item">
                                <label>{{ language === 'pl' ? 'Poziom logów:' : 'Log level:' }}</label>
                                <select v-model="systemConfig.logLevel">
                                    <option v-for="option in logLevelOptions" :key="option.value" :value="option.value">
                                        {{ option.label }}
                                    </option>
                                </select>
                            </div>
                            <div class="setting-item">
                                <label>{{ language === 'pl' ? 'Max pliki logów:' : 'Max log files:' }}</label>
                                <input v-model.number="systemConfig.maxLogFiles" type="number" min="1" max="100" />
                            </div>
                            <div class="setting-item">
                                <label>{{ language === 'pl' ? 'Retencja danych (dni):' : 'Data retention (days):' }}</label>
                                <input v-model.number="systemConfig.dataRetention" type="number" min="1" max="3650" />
                            </div>
                            <div class="setting-item checkbox">
                                <label>
                                    <input v-model="systemConfig.debugMode" type="checkbox" />
                                    {{ language === 'pl' ? 'Tryb debug' : 'Debug mode' }}
                                </label>
                            </div>
                            <div class="setting-item checkbox">
                                <label>
                                    <input v-model="systemConfig.autoBackup" type="checkbox" />
                                    {{ language === 'pl' ? 'Auto backup' : 'Auto backup' }}
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Device Settings -->
                    <div class="settings-group">
                        <h3>🔧 {{ language === 'pl' ? 'Ustawienia Urządzenia' : 'Device Settings' }}</h3>
                        <div class="settings-grid">
                            <div class="setting-item">
                                <label>{{ language === 'pl' ? 'Nazwa urządzenia:' : 'Device name:' }}</label>
                                <input v-model="deviceSettings.deviceName" type="text" />
                            </div>
                            <div class="setting-item">
                                <label>{{ language === 'pl' ? 'Lokalizacja:' : 'Location:' }}</label>
                                <input v-model="deviceSettings.location" type="text" />
                            </div>
                            <div class="setting-item">
                                <label>{{ language === 'pl' ? 'Strefa czasowa:' : 'Timezone:' }}</label>
                                <select v-model="deviceSettings.timezone">
                                    <option v-for="tz in timezoneOptions" :key="tz.value" :value="tz.value">
                                        {{ tz.label }}
                                    </option>
                                </select>
                            </div>
                            <div class="setting-item">
                                <label>{{ language === 'pl' ? 'Precyzja:' : 'Precision:' }}</label>
                                <input v-model.number="deviceSettings.precision" type="number" min="0" max="5" />
                            </div>
                        </div>
                    </div>

                    <!-- Security Settings -->
                    <div class="settings-group">
                        <h3>🔒 {{ language === 'pl' ? 'Bezpieczeństwo' : 'Security' }}</h3>
                        <div class="settings-grid">
                            <div class="setting-item">
                                <label>{{ language === 'pl' ? 'Timeout sesji (min):' : 'Session timeout (min):' }}</label>
                                <input v-model.number="securitySettings.sessionTimeout" type="number" min="5" max="480" />
                            </div>
                            <div class="setting-item">
                                <label>{{ language === 'pl' ? 'Max próby logowania:' : 'Max login attempts:' }}</label>
                                <input v-model.number="securitySettings.maxLoginAttempts" type="number" min="1" max="10" />
                            </div>
                            <div class="setting-item checkbox">
                                <label>
                                    <input v-model="securitySettings.enableTwoFactor" type="checkbox" />
                                    {{ language === 'pl' ? 'Dwuskładnikowe uwierzytelnianie' : 'Two-factor authentication' }}
                                </label>
                            </div>
                            <div class="setting-item checkbox">
                                <label>
                                    <input v-model="securitySettings.auditLogging" type="checkbox" />
                                    {{ language === 'pl' ? 'Logowanie audytu' : 'Audit logging' }}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="actions-panel">
                    <div class="actions-left">
                        <button class="reset-btn" @click="resetSettings">
                            🔄 {{ language === 'pl' ? 'Reset' : 'Reset' }}
                        </button>
                        <button class="export-btn" @click="exportSettings">
                            📤 {{ language === 'pl' ? 'Eksport' : 'Export' }}
                        </button>
                    </div>
                    <div class="actions-right">
                        <div v-if="settingsState.lastSaved" class="last-saved">
                            {{ language === 'pl' ? 'Ostatnio zapisano:' : 'Last saved:' }} 
                            {{ settingsState.lastSaved.toLocaleTimeString() }}
                        </div>
                        <button 
                            class="save-btn" 
                            @click="saveSettings"
                            :disabled="settingsState.isLoading || !settingsState.hasUnsavedChanges"
                            :class="{ loading: settingsState.isLoading }"
                        >
                            {{ settingsState.isLoading ? '⏳ Zapisywanie...' : '💾 Zapisz ustawienia' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .system-settings-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .template-container {
            max-width: 1400px;
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
            gap: 16px;
            align-items: center;
        }
        
        .unsaved-indicator {
            padding: 6px 12px;
            background: #fff3cd;
            color: #856404;
            border-radius: 16px;
            font-size: 0.9em;
            font-weight: 600;
        }
        
        .vue-badge {
            background: #42b883;
            color: white;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 0.9em;
            font-weight: 600;
        }
        
        .settings-container {
            display: grid;
            gap: 24px;
            margin-bottom: 24px;
        }
        
        .settings-group {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .settings-group h3 {
            margin: 0 0 20px 0;
            color: #333;
            font-size: 1.3em;
            border-bottom: 2px solid #4facfe;
            padding-bottom: 8px;
        }
        
        .settings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 16px;
            margin-bottom: 16px;
        }
        
        .setting-item {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .setting-item.checkbox {
            flex-direction: row;
            align-items: center;
        }
        
        .setting-item label {
            font-weight: 600;
            color: #666;
        }
        
        .setting-item input, .setting-item select {
            padding: 10px 12px;
            border: 2px solid #e9ecef;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        .setting-item input:focus, .setting-item select:focus {
            outline: none;
            border-color: #4facfe;
        }
        
        .setting-item input.invalid {
            border-color: #dc3545;
            background: #ffeaea;
        }
        
        .setting-item input[type="checkbox"] {
            width: auto;
            margin-right: 8px;
        }
        
        .test-btn {
            padding: 10px 16px;
            background: #17a2b8;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .test-btn:hover:not(:disabled) {
            background: #138496;
        }
        
        .test-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        .actions-panel {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .actions-left, .actions-right {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        
        .reset-btn, .export-btn {
            padding: 10px 16px;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            background: #f8f9fa;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .reset-btn:hover {
            background: #e9ecef;
        }
        
        .export-btn:hover {
            background: #e9ecef;
        }
        
        .save-btn {
            padding: 12px 24px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1.1em;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .save-btn:hover:not(:disabled) {
            background: #218838;
            transform: translateY(-2px);
        }
        
        .save-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        .save-btn.loading {
            animation: pulse 1.5s infinite;
        }
        
        .last-saved {
            font-size: 0.9em;
            color: #666;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    `
};

// Export component for use
window.SystemSettingsTemplate = SystemSettingsTemplate;
console.log('🔶 Vue SystemSettingsTemplate component loaded');
