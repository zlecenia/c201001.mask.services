/**
 * MASKSERVICE C20 - Vue.js Service Menu Template Component
 * Replaces vanilla service-menu-template.html
 * Advanced service menu with diagnostics, calibration, and maintenance
 */


const ServiceMenuTemplate = {
    name: 'ServiceMenuTemplate',
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
    
    emits: ['navigate', 'service-action'],
    
    setup(props, { emit }) {
        // Reactive state
        const serviceState = reactive({
            activeService: null,
            isExecuting: false,
            lastAction: null,
            systemStatus: 'operational'
        });

        const diagnosticsData = reactive({
            cpuUsage: 45,
            memoryUsage: 62,
            diskUsage: 38,
            networkStatus: 'connected',
            serviceHealth: 'healthy',
            lastCheck: null
        });

        const calibrationData = reactive({
            sensors: [
                { name: 'Pressure Sensor', status: 'calibrated', lastCalibration: '2025-09-20', nextDue: '2025-12-20' },
                { name: 'Flow Sensor', status: 'needs_calibration', lastCalibration: '2025-08-15', nextDue: '2025-11-15' },
                { name: 'Temperature Sensor', status: 'calibrated', lastCalibration: '2025-09-18', nextDue: '2025-12-18' }
            ],
            autoCalibration: false,
            calibrationInProgress: false
        });

        const backupData = reactive({
            lastBackup: '2025-09-23T08:30:00Z',
            backupSize: '2.4 GB',
            autoBackup: true,
            backupLocation: '/backup/maskservice/',
            backupStatus: 'completed'
        });

        // Computed properties
        const pageTitle = computed(() => {
            const titleMap = {
                pl: 'Menu Serwisowe',
                en: 'Service Menu',
                de: 'Service-Menü'
            };
            return titleMap[props.language] || 'Menu Serwisowe';
        });

        const serviceCards = computed(() => [
            {
                id: 'diagnostics',
                title: props.language === 'pl' ? 'Diagnostyka Systemu' : 'System Diagnostics',
                description: props.language === 'pl' ? 'Sprawdź stan systemu i wydajność' : 'Check system status and performance',
                icon: '🔍',
                status: diagnosticsData.serviceHealth,
                color: 'blue',
                badge: `${diagnosticsData.cpuUsage}% CPU`
            },
            {
                id: 'calibration',
                title: props.language === 'pl' ? 'Kalibracja Sensorów' : 'Sensor Calibration',
                description: props.language === 'pl' ? 'Kalibruj i skonfiguruj sensory' : 'Calibrate and configure sensors',
                icon: '⚙️',
                status: calibrationData.sensors.some(s => s.status === 'needs_calibration') ? 'warning' : 'healthy',
                color: 'orange',
                badge: `${calibrationData.sensors.filter(s => s.status === 'needs_calibration').length} wymagają`
            },
            {
                id: 'backup',
                title: props.language === 'pl' ? 'Kopia Zapasowa' : 'Data Backup',
                description: props.language === 'pl' ? 'Zarządzaj kopiami zapasowymi danych' : 'Manage data backups',
                icon: '💾',
                status: backupData.backupStatus,
                color: 'green',
                badge: backupData.backupSize
            },
            {
                id: 'maintenance',
                title: props.language === 'pl' ? 'Konserwacja' : 'Maintenance',
                description: props.language === 'pl' ? 'Harmonogram i zadania konserwacji' : 'Maintenance schedule and tasks',
                icon: '🔧',
                status: 'scheduled',
                color: 'purple',
                badge: props.language === 'pl' ? 'Zaplanowane' : 'Scheduled'
            },
            {
                id: 'logs',
                title: props.language === 'pl' ? 'Logi Systemu' : 'System Logs',
                description: props.language === 'pl' ? 'Przeglądaj i analizuj logi systemowe' : 'View and analyze system logs',
                icon: '📋',
                status: 'available',
                color: 'teal',
                badge: props.language === 'pl' ? 'Dostępne' : 'Available'
            },
            {
                id: 'advanced',
                title: props.language === 'pl' ? 'Ustawienia Zaawansowane' : 'Advanced Settings',
                description: props.language === 'pl' ? 'Konfiguracja ekspertów systemu' : 'Expert system configuration',
                icon: '⚡',
                status: 'expert',
                color: 'red',
                badge: props.language === 'pl' ? 'Ekspert' : 'Expert'
            }
        ]);

        // Methods
        const executeService = async (serviceId) => {
            console.log(`🔶 Vue: Executing service: ${serviceId}`);
            serviceState.activeService = serviceId;
            serviceState.isExecuting = true;

            try {
                // Integrate with existing service system if available
                if (window.ServiceManager && window.ServiceManager[serviceId]) {
                    await window.ServiceManager[serviceId]();
                } else {
                    // Vue-only service execution
                    await executeServiceAction(serviceId);
                }

                serviceState.lastAction = {
                    service: serviceId,
                    timestamp: new Date(),
                    result: 'success'
                };

                emit('service-action', { service: serviceId, status: 'completed' });
                console.log(`✅ Vue: Service ${serviceId} completed successfully`);

            } catch (error) {
                console.error(`❌ Vue: Service ${serviceId} failed:`, error);
                serviceState.lastAction = {
                    service: serviceId,
                    timestamp: new Date(),
                    result: 'error',
                    error: error.message
                };
            } finally {
                serviceState.isExecuting = false;
                serviceState.activeService = null;
            }
        };

        const executeServiceAction = async (serviceId) => {
            // Simulate service execution times
            const executionTimes = {
                diagnostics: 3000,
                calibration: 5000,
                backup: 4000,
                maintenance: 2000,
                logs: 1000,
                advanced: 1500
            };

            await new Promise(resolve => setTimeout(resolve, executionTimes[serviceId] || 2000));

            // Update relevant data based on service
            switch (serviceId) {
                case 'diagnostics':
                    diagnosticsData.cpuUsage = Math.max(20, Math.min(80, diagnosticsData.cpuUsage + (Math.random() - 0.5) * 10));
                    diagnosticsData.memoryUsage = Math.max(30, Math.min(90, diagnosticsData.memoryUsage + (Math.random() - 0.5) * 8));
                    diagnosticsData.diskUsage = Math.max(20, Math.min(70, diagnosticsData.diskUsage + (Math.random() - 0.5) * 5));
                    diagnosticsData.lastCheck = new Date();
                    break;
                    
                case 'calibration':
                    // Simulate calibration completion
                    calibrationData.sensors.forEach(sensor => {
                        if (sensor.status === 'needs_calibration') {
                            sensor.status = 'calibrated';
                            sensor.lastCalibration = new Date().toISOString().split('T')[0];
                        }
                    });
                    break;
                    
                case 'backup':
                    backupData.lastBackup = new Date().toISOString();
                    backupData.backupSize = `${(Math.random() * 2 + 2).toFixed(1)} GB`;
                    backupData.backupStatus = 'completed';
                    break;
            }
        };

        const runDiagnostics = () => executeService('diagnostics');
        const startCalibration = () => executeService('calibration');
        const createBackup = () => executeService('backup');
        const openMaintenance = () => executeService('maintenance');
        const viewLogs = () => executeService('logs');
        const openAdvanced = () => executeService('advanced');

        const exportServiceReport = () => {
            const reportData = {
                timestamp: new Date().toISOString(),
                user: props.user.username,
                systemStatus: serviceState.systemStatus,
                diagnostics: diagnosticsData,
                calibration: calibrationData,
                backup: backupData,
                lastAction: serviceState.lastAction
            };

            const content = JSON.stringify(reportData, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `service-report-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('✅ Vue: Service report exported successfully');
        };

        const goBack = () => {
            console.log('🔶 Vue: Returning to user menu');
            emit('navigate', 'user-menu-screen', props.language, 'default');
        };

        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: ServiceMenuTemplate component mounted');
            
            // Initial diagnostics check
            setTimeout(() => {
                diagnosticsData.lastCheck = new Date();
            }, 1000);
        });

        return {
            serviceState,
            diagnosticsData,
            calibrationData,
            backupData,
            pageTitle,
            serviceCards,
            executeService,
            runDiagnostics,
            startCalibration,
            createBackup,
            openMaintenance,
            viewLogs,
            openAdvanced,
            exportServiceReport,
            goBack
        };
    },

    template: `
        <div class="service-menu-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="header-actions">
                        <div class="system-status" :class="'status-' + serviceState.systemStatus">
                            <span class="status-dot"></span>
                            <span>{{ serviceState.systemStatus.toUpperCase() }}</span>
                        </div>
                        <button class="export-btn" @click="exportServiceReport">
                            📤 Raport
                        </button>
                        <div class="vue-badge">Vue</div>
                    </div>
                </div>

                <!-- Service Grid -->
                <div class="service-grid">
                    <div 
                        v-for="service in serviceCards" 
                        :key="service.id"
                        class="service-card"
                        :class="[
                            'service-' + service.color,
                            'status-' + service.status,
                            { 
                                'active': serviceState.activeService === service.id,
                                'executing': serviceState.isExecuting && serviceState.activeService === service.id
                            }
                        ]"
                        @click="executeService(service.id)"
                        :disabled="serviceState.isExecuting"
                    >
                        <div class="service-header">
                            <div class="service-icon">{{ service.icon }}</div>
                            <div class="service-badge" :class="'badge-' + service.status">
                                {{ service.badge }}
                            </div>
                        </div>
                        
                        <div class="service-content">
                            <h3 class="service-title">{{ service.title }}</h3>
                            <p class="service-description">{{ service.description }}</p>
                        </div>
                        
                        <div class="service-status">
                            <div v-if="serviceState.isExecuting && serviceState.activeService === service.id" class="executing-indicator">
                                <div class="spinner"></div>
                                <span>{{ language === 'pl' ? 'Wykonywanie...' : 'Executing...' }}</span>
                            </div>
                            <div v-else class="status-indicator" :class="'indicator-' + service.status">
                                {{ service.status === 'healthy' ? '✅' : 
                                   service.status === 'warning' ? '⚠️' : 
                                   service.status === 'completed' ? '✅' : 
                                   service.status === 'scheduled' ? '📅' : 
                                   service.status === 'available' ? '📋' : 
                                   service.status === 'expert' ? '⚡' : '🔵' }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Service Details -->
                <div v-if="serviceState.lastAction" class="service-details">
                    <h3>{{ language === 'pl' ? 'Ostatnia akcja' : 'Last Action' }}</h3>
                    <div class="action-summary">
                        <div class="action-info">
                            <strong>{{ serviceState.lastAction.service }}</strong>
                            <span class="action-time">{{ serviceState.lastAction.timestamp.toLocaleString() }}</span>
                        </div>
                        <div class="action-result" :class="'result-' + serviceState.lastAction.result">
                            {{ serviceState.lastAction.result === 'success' ? '✅ Sukces' : '❌ Błąd' }}
                        </div>
                    </div>
                    <div v-if="serviceState.lastAction.error" class="action-error">
                        {{ serviceState.lastAction.error }}
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="quick-stats">
                    <div class="stat-card">
                        <h4>{{ language === 'pl' ? 'Diagnostyka' : 'Diagnostics' }}</h4>
                        <div class="stat-grid">
                            <div class="stat-item">
                                <span class="stat-label">CPU:</span>
                                <span class="stat-value">{{ diagnosticsData.cpuUsage }}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">{{ language === 'pl' ? 'Pamięć:' : 'Memory:' }}</span>
                                <span class="stat-value">{{ diagnosticsData.memoryUsage }}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">{{ language === 'pl' ? 'Dysk:' : 'Disk:' }}</span>
                                <span class="stat-value">{{ diagnosticsData.diskUsage }}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">{{ language === 'pl' ? 'Sieć:' : 'Network:' }}</span>
                                <span class="stat-value">{{ diagnosticsData.networkStatus }}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <h4>{{ language === 'pl' ? 'Kalibracja' : 'Calibration' }}</h4>
                        <div class="sensor-list">
                            <div 
                                v-for="sensor in calibrationData.sensors" 
                                :key="sensor.name"
                                class="sensor-item"
                                :class="'sensor-' + sensor.status.replace('_', '-')"
                            >
                                <span class="sensor-name">{{ sensor.name }}</span>
                                <span class="sensor-status">
                                    {{ sensor.status === 'calibrated' ? '✅' : '⚠️' }}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <h4>{{ language === 'pl' ? 'Backup' : 'Backup' }}</h4>
                        <div class="backup-info">
                            <div class="backup-item">
                                <span class="backup-label">{{ language === 'pl' ? 'Ostatni:' : 'Last:' }}</span>
                                <span class="backup-value">{{ new Date(backupData.lastBackup).toLocaleDateString() }}</span>
                            </div>
                            <div class="backup-item">
                                <span class="backup-label">{{ language === 'pl' ? 'Rozmiar:' : 'Size:' }}</span>
                                <span class="backup-value">{{ backupData.backupSize }}</span>
                            </div>
                            <div class="backup-item">
                                <span class="backup-label">{{ language === 'pl' ? 'Status:' : 'Status:' }}</span>
                                <span class="backup-value">✅ {{ backupData.backupStatus }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .service-menu-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        
        .system-status {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9em;
        }
        
        .system-status.status-operational {
            background: #d4edda;
            color: #155724;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #28a745;
            animation: pulse 2s infinite;
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
        
        .service-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }
        
        .service-card {
            background: white;
            padding: 24px;
            border-radius: 16px;
            border: 3px solid transparent;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }
        
        .service-card:hover:not(:disabled) {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }
        
        .service-card:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        .service-card.executing {
            border-color: #007bff;
            animation: executeGlow 1.5s infinite;
        }
        
        .service-card.service-blue { border-left: 6px solid #007bff; }
        .service-card.service-orange { border-left: 6px solid #fd7e14; }
        .service-card.service-green { border-left: 6px solid #28a745; }
        .service-card.service-purple { border-left: 6px solid #6f42c1; }
        .service-card.service-teal { border-left: 6px solid #20c997; }
        .service-card.service-red { border-left: 6px solid #dc3545; }
        
        .service-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
        }
        
        .service-icon {
            font-size: 2.5em;
            line-height: 1;
        }
        
        .service-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 600;
        }
        
        .badge-healthy { background: #d4edda; color: #155724; }
        .badge-warning { background: #fff3cd; color: #856404; }
        .badge-completed { background: #d4edda; color: #155724; }
        .badge-scheduled { background: #e2e3e5; color: #383d41; }
        .badge-available { background: #d1ecf1; color: #0c5460; }
        .badge-expert { background: #f8d7da; color: #721c24; }
        
        .service-content {
            margin-bottom: 16px;
        }
        
        .service-title {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 1.3em;
        }
        
        .service-description {
            margin: 0;
            color: #666;
            line-height: 1.4;
        }
        
        .service-status {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .executing-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #007bff;
            font-weight: 600;
        }
        
        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid #e9ecef;
            border-top: 2px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        .status-indicator {
            font-size: 1.5em;
        }
        
        .service-details {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        
        .service-details h3 {
            margin: 0 0 16px 0;
            color: #333;
        }
        
        .action-summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .action-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .action-time {
            font-size: 0.9em;
            color: #666;
        }
        
        .action-result {
            font-weight: 600;
        }
        
        .result-success { color: #28a745; }
        .result-error { color: #dc3545; }
        
        .action-error {
            margin-top: 8px;
            padding: 8px;
            background: #f8d7da;
            color: #721c24;
            border-radius: 4px;
            font-size: 0.9em;
        }
        
        .quick-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .stat-card h4 {
            margin: 0 0 16px 0;
            color: #333;
            font-size: 1.1em;
        }
        
        .stat-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        
        .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .stat-label {
            font-size: 0.9em;
            color: #666;
        }
        
        .stat-value {
            font-weight: 600;
            color: #333;
        }
        
        .sensor-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .sensor-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            border-radius: 6px;
        }
        
        .sensor-item.sensor-calibrated {
            background: #d4edda;
        }
        
        .sensor-item.sensor-needs-calibration {
            background: #fff3cd;
        }
        
        .sensor-name {
            font-size: 0.9em;
        }
        
        .backup-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .backup-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .backup-label {
            font-size: 0.9em;
            color: #666;
        }
        
        .backup-value {
            font-weight: 600;
            color: #333;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes executeGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 123, 255, 0.3); }
            50% { box-shadow: 0 0 30px rgba(0, 123, 255, 0.6); }
        }
    `
};

// Export component for use
window.ServiceMenuTemplate = ServiceMenuTemplate;
console.log('🔶 Vue ServiceMenuTemplate component loaded');
