/**
 * MASKTRONIC C20 - Alarm Management Component (Modular)
 * Extracted from DeviceDataTemplate.js for better maintainability
 * Handles advanced alarm management, notifications, and statistics
 */

const AlarmManagementComponent = {
    name: 'AlarmManagementComponent',
    props: {
        user: { type: Object, required: true },
        sensorData: { type: Object, required: true },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['alarm-triggered', 'alarm-resolved'],
    
    setup(props, { emit }) {
        // Vue.js imports
        const { reactive, computed, onMounted, onUnmounted } = Vue;
        
        // Advanced Alarm Management State
        const alarmState = reactive({
            activeAlarms: [],
            alarmHistory: [],
            alarmThresholds: {
                temperature: { min: -10, max: 50, warning: 40, critical: 45 },
                humidity: { min: 0, max: 100, warning: 80, critical: 90 },
                pressure: { min: 950, max: 1050, warning: 30, critical: 50 },
                airQuality: { min: 0, max: 100, warning: 30, critical: 20 },
                noise: { min: 0, max: 120, warning: 85, critical: 100 },
                vibration: { min: 0, max: 5, warning: 2, critical: 3 }
            },
            alarmSettings: {
                enableSoundAlerts: true,
                enableEmailAlerts: false,
                enablePushNotifications: true,
                alarmSeverityFilter: 'all', // all, warning, critical
                autoAcknowledge: false,
                maxActiveAlarms: 50
            },
            alarmStatistics: {
                totalToday: 0,
                totalThisWeek: 0,
                totalThisMonth: 0,
                mostFrequentType: null,
                averageResolutionTime: 0
            }
        });
        
        // Advanced Alarm Management Methods
        const triggerAlarm = (type, severity, message) => {
            const alarmId = `alarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const alarm = {
                id: alarmId,
                type,
                severity,
                message,
                timestamp: new Date().toISOString(),
                acknowledged: false,
                resolved: false,
                acknowledgedBy: null,
                resolvedBy: null,
                acknowledgedAt: null,
                resolvedAt: null,
                sensorValue: props.sensorData[type] || null,
                threshold: alarmState.alarmThresholds[type] || null
            };
            
            // Add to active alarms if not at max capacity
            if (alarmState.activeAlarms.length < alarmState.alarmSettings.maxActiveAlarms) {
                alarmState.activeAlarms.unshift(alarm);
            }
            
            // Add to history
            alarmState.alarmHistory.unshift(alarm);
            
            // Update statistics
            updateAlarmStatistics(type, severity);
            
            // Play sound if enabled
            if (alarmState.alarmSettings.enableSoundAlerts) {
                playAlarmSound(severity);
            }
            
            // Send notification if enabled
            if (alarmState.alarmSettings.enablePushNotifications) {
                sendAlarmNotification(alarm);
            }
            
            console.log(`🚨 Alarm triggered: ${type} (${severity}) - ${message}`);
            console.log(`🚨 Alarm ID: ${alarmId}`);
            console.log(`🚨 Active alarms: ${alarmState.activeAlarms.length}/${alarmState.alarmSettings.maxActiveAlarms}`);
            
            emit('alarm-triggered', alarm);
            
            return alarmId;
        };
        
        const acknowledgeAlarm = (alarmId) => {
            const alarm = alarmState.activeAlarms.find(a => a.id === alarmId);
            if (alarm && !alarm.acknowledged) {
                alarm.acknowledged = true;
                alarm.acknowledgedBy = props.user.username || 'Unknown';
                alarm.acknowledgedAt = new Date().toISOString();
                
                console.log(`✅ Alarm acknowledged: ${alarmId} by ${alarm.acknowledgedBy}`);
            }
        };
        
        const resolveAlarm = (alarmId) => {
            const alarmIndex = alarmState.activeAlarms.findIndex(a => a.id === alarmId);
            if (alarmIndex !== -1) {
                const alarm = alarmState.activeAlarms[alarmIndex];
                alarm.resolved = true;
                alarm.resolvedBy = props.user.username || 'Unknown';
                alarm.resolvedAt = new Date().toISOString();
                
                // Calculate resolution time
                const resolutionTime = new Date(alarm.resolvedAt) - new Date(alarm.timestamp);
                alarm.resolutionTime = Math.round(resolutionTime / 1000); // seconds
                
                // Remove from active alarms
                alarmState.activeAlarms.splice(alarmIndex, 1);
                
                console.log(`🔧 Alarm resolved: ${alarmId} by ${alarm.resolvedBy}`);
                console.log(`🔧 Resolution time: ${alarm.resolutionTime} seconds`);
                
                emit('alarm-resolved', alarm);
            }
        };
        
        const playAlarmSound = (severity) => {
            // Simulate alarm sound (in real implementation would play actual audio)
            const soundMap = {
                'warning': '🔊 *BEEP BEEP* Warning alarm sound',
                'critical': '🔊 *LOUD ALARM* Critical alarm sound'
            };
            
            console.log(soundMap[severity] || '🔊 *BEEP* Default alarm sound');
        };
        
        const sendAlarmNotification = (alarm) => {
            // Simulate push notification (in real implementation would use service worker)
            console.log(`📱 Push notification: ${alarm.type} alarm - ${alarm.message}`);
            console.log(`📱 Severity: ${alarm.severity}`);
            console.log(`📱 Time: ${alarm.timestamp}`);
        };
        
        const updateAlarmStatistics = (type, severity) => {
            const today = new Date().toDateString();
            const thisWeek = getWeekStartDate().toDateString();
            const thisMonth = new Date().getMonth();
            
            // Update counters
            alarmState.alarmStatistics.totalToday++;
            alarmState.alarmStatistics.totalThisWeek++;
            alarmState.alarmStatistics.totalThisMonth++;
            
            // Update most frequent type
            const typeCounts = {};
            alarmState.alarmHistory.forEach(alarm => {
                typeCounts[alarm.type] = (typeCounts[alarm.type] || 0) + 1;
            });
            
            let maxCount = 0;
            let mostFrequent = null;
            for (const [alarmType, count] of Object.entries(typeCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    mostFrequent = alarmType;
                }
            }
            
            alarmState.alarmStatistics.mostFrequentType = mostFrequent;
            
            // Calculate average resolution time
            const resolvedAlarms = alarmState.alarmHistory.filter(a => a.resolved && a.resolutionTime);
            if (resolvedAlarms.length > 0) {
                const totalTime = resolvedAlarms.reduce((sum, alarm) => sum + alarm.resolutionTime, 0);
                alarmState.alarmStatistics.averageResolutionTime = Math.round(totalTime / resolvedAlarms.length);
            }
            
            console.log('📊 Alarm statistics updated:', alarmState.alarmStatistics);
        };
        
        const getWeekStartDate = () => {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - dayOfWeek);
            startDate.setHours(0, 0, 0, 0);
            return startDate;
        };
        
        // Auto-monitoring for sensor thresholds
        const checkSensorAlarms = () => {
            Object.keys(alarmState.alarmThresholds).forEach(sensorType => {
                const sensorValue = props.sensorData[sensorType];
                const thresholds = alarmState.alarmThresholds[sensorType];
                
                if (sensorValue !== undefined && thresholds) {
                    let severity = null;
                    let message = '';
                    
                    if (sensorValue < thresholds.min || sensorValue > thresholds.max) {
                        severity = 'critical';
                        message = `${sensorType} out of range: ${sensorValue}`;
                    } else if (sensorValue >= thresholds.critical || sensorValue <= thresholds.warning) {
                        severity = 'warning';
                        message = `${sensorType} approaching limits: ${sensorValue}`;
                    }
                    
                    if (severity) {
                        // Check if similar alarm already active to avoid spam
                        const existingAlarm = alarmState.activeAlarms.find(
                            a => a.type === sensorType && !a.resolved && (Date.now() - new Date(a.timestamp)) < 300000 // 5 minutes
                        );
                        
                        if (!existingAlarm) {
                            triggerAlarm(sensorType, severity, message);
                        }
                    }
                }
            });
        };
        
        // Computed properties
        const activeAlarmsCount = computed(() => alarmState.activeAlarms.length);
        const criticalAlarmsCount = computed(() => 
            alarmState.activeAlarms.filter(a => a.severity === 'critical').length
        );
        const unacknowledgedAlarmsCount = computed(() => 
            alarmState.activeAlarms.filter(a => !a.acknowledged).length
        );
        
        const filteredActiveAlarms = computed(() => {
            const filter = alarmState.alarmSettings.alarmSeverityFilter;
            if (filter === 'all') return alarmState.activeAlarms;
            return alarmState.activeAlarms.filter(a => a.severity === filter);
        });
        
        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: AlarmManagementComponent mounted');
            
            // Start periodic sensor monitoring
            alarmState.monitoringInterval = setInterval(checkSensorAlarms, 10000); // Check every 10 seconds
        });
        
        onUnmounted(() => {
            console.log('🔶 Vue: AlarmManagementComponent unmounted');
            if (alarmState.monitoringInterval) {
                clearInterval(alarmState.monitoringInterval);
            }
        });
        
        return {
            alarmState,
            activeAlarmsCount,
            criticalAlarmsCount,
            unacknowledgedAlarmsCount,
            filteredActiveAlarms,
            triggerAlarm,
            acknowledgeAlarm,
            resolveAlarm,
            checkSensorAlarms
        };
    },
    
    template: `
        <div class="alarm-management">
            <div class="alarm-header">
                <h4>🚨 Zarządzanie Alarmami</h4>
                <div class="alarm-stats">
                    <span class="stat active">Aktywne: {{ activeAlarmsCount }}</span>
                    <span class="stat critical">Krytyczne: {{ criticalAlarmsCount }}</span>
                    <span class="stat unack">Niepotwierdzone: {{ unacknowledgedAlarmsCount }}</span>
                </div>
            </div>
            
            <div class="alarm-controls">
                <select v-model="alarmState.alarmSettings.alarmSeverityFilter">
                    <option value="all">Wszystkie alarmy</option>
                    <option value="critical">Tylko krytyczne</option>
                    <option value="warning">Tylko ostrzeżenia</option>
                </select>
                
                <label class="alarm-setting">
                    <input type="checkbox" v-model="alarmState.alarmSettings.enableSoundAlerts">
                    Dźwięki alarmów
                </label>
                
                <label class="alarm-setting">
                    <input type="checkbox" v-model="alarmState.alarmSettings.enablePushNotifications">
                    Powiadomienia push
                </label>
            </div>
            
            <div class="active-alarms">
                <div v-if="filteredActiveAlarms.length === 0" class="no-alarms">
                    ✅ Brak aktywnych alarmów
                </div>
                
                <div v-for="alarm in filteredActiveAlarms" :key="alarm.id" 
                     class="alarm-item" :class="alarm.severity">
                    <div class="alarm-info">
                        <span class="alarm-type">{{ alarm.type }}</span>
                        <span class="alarm-message">{{ alarm.message }}</span>
                        <span class="alarm-time">{{ new Date(alarm.timestamp).toLocaleTimeString() }}</span>
                    </div>
                    
                    <div class="alarm-actions">
                        <button v-if="!alarm.acknowledged" 
                                @click="acknowledgeAlarm(alarm.id)"
                                class="ack-btn">
                            Potwierdź
                        </button>
                        <button @click="resolveAlarm(alarm.id)"
                                class="resolve-btn">
                            Rozwiąż
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="alarm-statistics">
                <h5>📊 Statystyki Alarmów</h5>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Dzisiaj:</span>
                        <span class="stat-value">{{ alarmState.alarmStatistics.totalToday }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Ten tydzień:</span>
                        <span class="stat-value">{{ alarmState.alarmStatistics.totalThisWeek }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Najczęstszy typ:</span>
                        <span class="stat-value">{{ alarmState.alarmStatistics.mostFrequentType || 'Brak' }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Śr. czas rozwiązania:</span>
                        <span class="stat-value">{{ alarmState.alarmStatistics.averageResolutionTime }}s</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    style: `
        .alarm-management {
            background: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .alarm-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        
        .alarm-stats {
            display: flex;
            gap: 12px;
        }
        
        .stat {
            font-size: 0.9em;
            padding: 4px 8px;
            border-radius: 4px;
        }
        
        .stat.active { background: #e3f2fd; color: #1976d2; }
        .stat.critical { background: #ffebee; color: #d32f2f; }
        .stat.unack { background: #fff3e0; color: #f57c00; }
        
        .alarm-controls {
            display: flex;
            gap: 16px;
            align-items: center;
            margin-bottom: 16px;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 6px;
        }
        
        .alarm-setting {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.9em;
        }
        
        .active-alarms {
            max-height: 300px;
            overflow-y: auto;
            margin-bottom: 16px;
        }
        
        .no-alarms {
            text-align: center;
            padding: 24px;
            color: #28a745;
            background: #f0fff4;
            border-radius: 6px;
        }
        
        .alarm-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            margin-bottom: 8px;
        }
        
        .alarm-item.warning {
            border-left: 4px solid #ffc107;
            background: #fff8e1;
        }
        
        .alarm-item.critical {
            border-left: 4px solid #dc3545;
            background: #ffebee;
        }
        
        .alarm-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .alarm-type {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.9em;
        }
        
        .alarm-time {
            font-size: 0.8em;
            color: #666;
        }
        
        .alarm-actions {
            display: flex;
            gap: 8px;
        }
        
        .ack-btn, .resolve-btn {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
        }
        
        .ack-btn {
            background: #ffc107;
            color: #212529;
        }
        
        .resolve-btn {
            background: #28a745;
            color: white;
        }
        
        .alarm-statistics {
            border-top: 1px solid #dee2e6;
            padding-top: 16px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        
        .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        
        .stat-label {
            font-size: 0.9em;
            color: #666;
        }
        
        .stat-value {
            font-weight: 600;
        }
    `
};

window.AlarmManagementComponent = AlarmManagementComponent;
console.log('🚨 Vue AlarmManagementComponent loaded');
