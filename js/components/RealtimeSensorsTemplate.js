/**
 * MASKSERVICE C20 - Vue.js Realtime Sensors Template Component
 * Replaces vanilla realtime-sensors-template.html
 * Advanced real-time sensor monitoring dashboard
 */


const RealtimeSensorsTemplate = {
    name: 'RealtimeSensorsTemplate',
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
    
    emits: ['navigate', 'sensor-alert'],
    
    setup(props, { emit }) {
        // Reactive state
        const sensorState = reactive({
            isLive: true,
            updateInterval: null,
            refreshRate: 500, // ms
            alertsEnabled: true,
            recordingData: false,
            dataHistory: []
        });

        const sensors = reactive([
            {
                id: 'pressure',
                name: props.language === 'pl' ? 'Ciśnienie' : 'Pressure',
                value: 15.2,
                unit: 'kPa',
                min: 10,
                max: 25,
                status: 'normal',
                icon: '🌬️',
                color: 'blue',
                trend: 'stable',
                lastAlert: null
            },
            {
                id: 'flow_rate',
                name: props.language === 'pl' ? 'Przepływ' : 'Flow Rate',
                value: 2.8,
                unit: 'L/min',
                min: 1.5,
                max: 5.0,
                status: 'normal',
                icon: '🌊',
                color: 'cyan',
                trend: 'rising',
                lastAlert: null
            },
            {
                id: 'resistance',
                name: props.language === 'pl' ? 'Opór' : 'Resistance',
                value: 125,
                unit: 'Pa·s/L',
                min: 50,
                max: 200,
                status: 'normal',
                icon: '⚡',
                color: 'yellow',
                trend: 'falling',
                lastAlert: null
            },
            {
                id: 'leak_rate',
                name: props.language === 'pl' ? 'Wskaźnik nieszczelności' : 'Leak Rate',
                value: 0.02,
                unit: 'L/min',
                min: 0,
                max: 0.1,
                status: 'normal',
                icon: '🔍',
                color: 'green',
                trend: 'stable',
                lastAlert: null
            },
            {
                id: 'co2_level',
                name: props.language === 'pl' ? 'Poziom CO₂' : 'CO₂ Level',
                value: 450,
                unit: 'ppm',
                min: 300,
                max: 1000,
                status: 'normal',
                icon: '🌫️',
                color: 'purple',
                trend: 'rising',
                lastAlert: null
            },
            {
                id: 'particle_count',
                name: props.language === 'pl' ? 'Liczba cząsteczek' : 'Particle Count',
                value: 2500,
                unit: '#/cm³',
                min: 0,
                max: 10000,
                status: 'normal',
                icon: '✨',
                color: 'orange',
                trend: 'falling',
                lastAlert: null
            }
        ]);

        // Computed properties
        const pageTitle = computed(() => {
            const titleMap = {
                pl: 'Sensory w Czasie Rzeczywistym',
                en: 'Real-time Sensors',
                de: 'Echtzeit-Sensoren'
            };
            return titleMap[props.language] || 'Sensory w Czasie Rzeczywistym';
        });

        const sensorStats = computed(() => ({
            total: sensors.length,
            normal: sensors.filter(s => s.status === 'normal').length,
            warning: sensors.filter(s => s.status === 'warning').length,
            critical: sensors.filter(s => s.status === 'critical').length
        }));

        const systemStatus = computed(() => {
            const criticalCount = sensorStats.value.critical;
            const warningCount = sensorStats.value.warning;
            
            if (criticalCount > 0) return 'critical';
            if (warningCount > 0) return 'warning';
            return 'normal';
        });

        // Methods
        const updateSensorData = () => {
            sensors.forEach(sensor => {
                // Simulate realistic sensor readings with trends
                let change = 0;
                
                switch (sensor.trend) {
                    case 'rising':
                        change = Math.random() * 0.2 + 0.05; // Slight upward trend
                        break;
                    case 'falling':
                        change = -(Math.random() * 0.2 + 0.05); // Slight downward trend
                        break;
                    case 'stable':
                    default:
                        change = (Math.random() - 0.5) * 0.1; // Small random fluctuation
                        break;
                }
                
                // Apply change based on sensor type
                const baseChange = sensor.value * 0.02; // 2% of current value
                sensor.value += baseChange * change;
                
                // Keep within reasonable bounds
                sensor.value = Math.max(sensor.min * 0.8, Math.min(sensor.max * 1.2, sensor.value));
                
                // Round to appropriate decimal places
                sensor.value = Math.round(sensor.value * 100) / 100;
                
                // Update status based on thresholds
                const oldStatus = sensor.status;
                if (sensor.value < sensor.min * 0.9 || sensor.value > sensor.max * 1.1) {
                    sensor.status = 'critical';
                } else if (sensor.value < sensor.min || sensor.value > sensor.max) {
                    sensor.status = 'warning';
                } else {
                    sensor.status = 'normal';
                }
                
                // Trigger alerts for status changes
                if (oldStatus !== sensor.status && sensor.status !== 'normal' && sensorState.alertsEnabled) {
                    triggerAlert(sensor, oldStatus);
                }
                
                // Randomly change trends occasionally
                if (Math.random() < 0.05) {
                    const trends = ['stable', 'rising', 'falling'];
                    sensor.trend = trends[Math.floor(Math.random() * trends.length)];
                }
            });
            
            // Record data if recording is enabled
            if (sensorState.recordingData) {
                recordDataPoint();
            }
        };

        const triggerAlert = (sensor, oldStatus) => {
            const alert = {
                timestamp: new Date(),
                sensor: sensor.name,
                oldStatus,
                newStatus: sensor.status,
                value: sensor.value,
                unit: sensor.unit
            };
            
            sensor.lastAlert = alert;
            emit('sensor-alert', alert);
            
            console.log(`🚨 Vue: Sensor alert - ${sensor.name}: ${oldStatus} → ${sensor.status} (${sensor.value}${sensor.unit})`);
        };

        const recordDataPoint = () => {
            const dataPoint = {
                timestamp: new Date(),
                sensors: sensors.map(s => ({
                    id: s.id,
                    value: s.value,
                    status: s.status
                }))
            };
            
            sensorState.dataHistory.push(dataPoint);
            
            // Keep only last 1000 data points
            if (sensorState.dataHistory.length > 1000) {
                sensorState.dataHistory.shift();
            }
        };

        const startRealtimeUpdates = () => {
            sensorState.isLive = true;
            sensorState.updateInterval = setInterval(updateSensorData, sensorState.refreshRate);
            console.log(`🔶 Vue: Real-time sensor updates started (${sensorState.refreshRate}ms)`);
        };

        const stopRealtimeUpdates = () => {
            sensorState.isLive = false;
            if (sensorState.updateInterval) {
                clearInterval(sensorState.updateInterval);
                sensorState.updateInterval = null;
            }
            console.log('🔶 Vue: Real-time sensor updates stopped');
        };

        const toggleRecording = () => {
            sensorState.recordingData = !sensorState.recordingData;
            console.log(`🔶 Vue: Data recording ${sensorState.recordingData ? 'started' : 'stopped'}`);
        };

        const exportSensorData = () => {
            const exportData = {
                timestamp: new Date().toISOString(),
                user: props.user.username,
                sensors: sensors.map(s => ({...s})),
                history: sensorState.dataHistory,
                systemStatus: systemStatus.value,
                recordingEnabled: sensorState.recordingData
            };
            
            const content = JSON.stringify(exportData, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sensor-data-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ Vue: Sensor data exported successfully');
        };

        const changeRefreshRate = (newRate) => {
            sensorState.refreshRate = newRate;
            
            if (sensorState.isLive) {
                stopRealtimeUpdates();
                startRealtimeUpdates();
            }
        };

        const goBack = () => {
            console.log('🔶 Vue: Returning to device data');
            emit('navigate', 'device-data', props.language, 'default');
        };

        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: RealtimeSensorsTemplate component mounted');
            startRealtimeUpdates();
        });

        onUnmounted(() => {
            console.log('🔶 Vue: RealtimeSensorsTemplate component unmounted');
            stopRealtimeUpdates();
        });

        return {
            sensorState,
            sensors,
            pageTitle,
            sensorStats,
            systemStatus,
            updateSensorData,
            startRealtimeUpdates,
            stopRealtimeUpdates,
            toggleRecording,
            exportSensorData,
            changeRefreshRate,
            goBack
        };
    },

    template: `
        <div class="realtime-sensors-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="header-actions">
                        <div class="system-status" :class="'status-' + systemStatus">
                            <span class="status-indicator"></span>
                            <span>{{ systemStatus.toUpperCase() }}</span>
                        </div>
                        <div class="vue-badge">Vue</div>
                    </div>
                </div>

                <!-- Control Panel -->
                <div class="control-panel">
                    <div class="controls-left">
                        <button 
                            class="control-btn"
                            :class="{ active: sensorState.isLive }"
                            @click="sensorState.isLive ? stopRealtimeUpdates() : startRealtimeUpdates()"
                        >
                            {{ sensorState.isLive ? '⏸️ Zatrzymaj' : '▶️ Start' }}
                        </button>
                        
                        <button 
                            class="control-btn"
                            :class="{ active: sensorState.recordingData }"
                            @click="toggleRecording"
                        >
                            {{ sensorState.recordingData ? '⏺️ Nagrywanie...' : '⏺️ Nagraj' }}
                        </button>
                        
                        <select 
                            v-model="sensorState.refreshRate"
                            @change="changeRefreshRate(sensorState.refreshRate)"
                            class="refresh-rate-select"
                        >
                            <option value="100">100ms</option>
                            <option value="250">250ms</option>
                            <option value="500">500ms</option>
                            <option value="1000">1s</option>
                            <option value="2000">2s</option>
                        </select>
                    </div>
                    
                    <div class="controls-right">
                        <div class="sensor-stats">
                            <span class="stat-item normal">✅ {{ sensorStats.normal }}</span>
                            <span class="stat-item warning">⚠️ {{ sensorStats.warning }}</span>
                            <span class="stat-item critical">🚨 {{ sensorStats.critical }}</span>
                        </div>
                        
                        <button class="export-btn" @click="exportSensorData">
                            📤 Eksport
                        </button>
                    </div>
                </div>

                <!-- Sensors Grid -->
                <div class="sensors-section">
                    <div class="sensors-grid">
                        <div 
                            v-for="sensor in sensors" 
                            :key="sensor.id"
                            class="sensor-card"
                            :class="[
                                'sensor-' + sensor.color,
                                'status-' + sensor.status,
                                { 'has-alert': sensor.lastAlert }
                            ]"
                        >
                            <div class="sensor-header">
                                <div class="sensor-icon">{{ sensor.icon }}</div>
                                <h3 class="sensor-name">{{ sensor.name }}</h3>
                                <div class="sensor-trend" :class="'trend-' + sensor.trend">
                                    {{ sensor.trend === 'rising' ? '↗️' : sensor.trend === 'falling' ? '↘️' : '→' }}
                                </div>
                            </div>
                            
                            <div class="sensor-value-section">
                                <div class="sensor-value">{{ sensor.value }}</div>
                                <div class="sensor-unit">{{ sensor.unit }}</div>
                            </div>
                            
                            <div class="sensor-status-bar">
                                <div class="status-text" :class="'text-' + sensor.status">
                                    {{ sensor.status === 'normal' ? 'Normalny' : 
                                       sensor.status === 'warning' ? 'Ostrzeżenie' : 'Krytyczny' }}
                                </div>
                                <div class="status-indicator" :class="'indicator-' + sensor.status"></div>
                            </div>
                            
                            <div class="sensor-range">
                                <span class="range-text">{{ sensor.min }} - {{ sensor.max }} {{ sensor.unit }}</span>
                            </div>
                            
                            <div v-if="sensor.lastAlert" class="sensor-alert">
                                <small>⚠️ {{ sensor.lastAlert.timestamp.toLocaleTimeString() }}</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Live Status -->
                <div class="live-status">
                    <div class="live-indicator" :class="{ active: sensorState.isLive }">
                        <div class="pulse-dot" v-if="sensorState.isLive"></div>
                        <span>{{ sensorState.isLive ? 'NA ŻYWO' : 'ZATRZYMANO' }}</span>
                    </div>
                    
                    <div class="data-info">
                        <span>Odświeżanie: {{ sensorState.refreshRate }}ms</span>
                        <span v-if="sensorState.recordingData">
                            | Nagrane punkty: {{ sensorState.dataHistory.length }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .realtime-sensors-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
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
        
        .system-status.status-normal {
            background: #d4edda;
            color: #155724;
        }
        
        .system-status.status-warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .system-status.status-critical {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: pulse 1.5s infinite;
        }
        
        .status-normal .status-indicator { background: #28a745; }
        .status-warning .status-indicator { background: #ffc107; }
        .status-critical .status-indicator { background: #dc3545; }
        
        .vue-badge {
            background: #42b883;
            color: white;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 0.9em;
            font-weight: 600;
        }
        
        .control-panel {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        
        .controls-left, .controls-right {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        
        .control-btn {
            padding: 10px 16px;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .control-btn:hover {
            background: #f8f9fa;
        }
        
        .control-btn.active {
            background: #42b883;
            color: white;
            border-color: #42b883;
        }
        
        .refresh-rate-select {
            padding: 8px 12px;
            border: 2px solid #dee2e6;
            border-radius: 6px;
            background: white;
        }
        
        .sensor-stats {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        
        .stat-item {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.9em;
            font-weight: 600;
        }
        
        .stat-item.normal { background: #d4edda; color: #155724; }
        .stat-item.warning { background: #fff3cd; color: #856404; }
        .stat-item.critical { background: #f8d7da; color: #721c24; }
        
        .export-btn {
            padding: 10px 16px;
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
        
        .sensors-section {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        
        .sensors-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }
        
        .sensor-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            border: 3px solid #e9ecef;
            transition: all 0.3s;
            position: relative;
        }
        
        .sensor-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .sensor-card.status-warning {
            border-color: #ffc107;
            background: #fff8e1;
        }
        
        .sensor-card.status-critical {
            border-color: #dc3545;
            background: #ffeaea;
            animation: alertBlink 2s infinite;
        }
        
        @keyframes alertBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }
        
        .sensor-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }
        
        .sensor-icon {
            font-size: 1.8em;
        }
        
        .sensor-name {
            flex: 1;
            margin: 0 12px 0 12px;
            font-size: 1.1em;
            color: #333;
        }
        
        .sensor-trend {
            font-size: 1.2em;
        }
        
        .sensor-value-section {
            text-align: center;
            margin-bottom: 16px;
        }
        
        .sensor-value {
            font-size: 2.2em;
            font-weight: 600;
            color: #333;
            line-height: 1;
        }
        
        .sensor-unit {
            font-size: 0.9em;
            color: #666;
            margin-top: 4px;
        }
        
        .sensor-status-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .status-text {
            font-weight: 600;
        }
        
        .text-normal { color: #28a745; }
        .text-warning { color: #ffc107; }
        .text-critical { color: #dc3545; }
        
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        
        .indicator-normal { background: #28a745; }
        .indicator-warning { background: #ffc107; }
        .indicator-critical { background: #dc3545; }
        
        .sensor-range {
            text-align: center;
            font-size: 0.8em;
            color: #666;
            margin-bottom: 8px;
        }
        
        .sensor-alert {
            text-align: center;
            color: #dc3545;
        }
        
        .live-status {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .live-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
        }
        
        .live-indicator.active {
            color: #28a745;
        }
        
        .pulse-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #dc3545;
            animation: pulse 1s infinite;
        }
        
        .live-indicator.active .pulse-dot {
            background: #28a745;
        }
        
        .data-info {
            font-size: 0.9em;
            color: #666;
        }
        
        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
        }
    `
};

// Export component for use
window.RealtimeSensorsTemplate = RealtimeSensorsTemplate;
console.log('🔶 Vue RealtimeSensorsTemplate component loaded');
