/**
 * MASKSERVICE C20 - Alarm Management Module
 * Centralized alarm handling and notification system
 */

class AlarmManagement {
    constructor() {
        this.activeAlarms = new Map();
        this.alarmHistory = [];
        this.alarmConfig = new Map();
        this.soundEnabled = true;
        this.init();
    }

    init() {
        this.setupAlarmConfiguration();
        this.createAlarmUI();
    }

    setupAlarmConfiguration() {
        // Configure alarm types and their properties
        this.alarmConfig.set('PRESSURE_LOW', {
            name: 'Low Pressure',
            severity: 'HIGH',
            sound: 'beep-low.wav',
            color: '#ef4444',
            icon: '⬇️',
            autoAcknowledge: false
        });

        this.alarmConfig.set('PRESSURE_HIGH', {
            name: 'High Pressure',
            severity: 'CRITICAL',
            sound: 'beep-high.wav',
            color: '#dc2626',
            icon: '⬆️',
            autoAcknowledge: false
        });

        this.alarmConfig.set('FLOW_ABNORMAL', {
            name: 'Flow Abnormal',
            severity: 'MEDIUM',
            sound: 'beep-flow.wav',
            color: '#f97316',
            icon: '🌊',
            autoAcknowledge: true
        });

        this.alarmConfig.set('TEMPERATURE_OUT_OF_RANGE', {
            name: 'Temperature Alert',
            severity: 'LOW',
            sound: 'beep-temp.wav',
            color: '#fbbf24',
            icon: '🌡️',
            autoAcknowledge: true
        });

        this.alarmConfig.set('HUMIDITY_OUT_OF_RANGE', {
            name: 'Humidity Alert',
            severity: 'LOW',
            sound: 'beep-humidity.wav',
            color: '#fbbf24',
            icon: '💧',
            autoAcknowledge: true
        });

        this.alarmConfig.set('CALIBRATION_DUE', {
            name: 'Calibration Due',
            severity: 'HIGH',
            sound: 'beep-maintenance.wav',
            color: '#8b5cf6',
            icon: '⚙️',
            autoAcknowledge: false
        });

        this.alarmConfig.set('MAINTENANCE_OVERDUE', {
            name: 'Maintenance Overdue',
            severity: 'CRITICAL',
            sound: 'beep-urgent.wav',
            color: '#dc2626',
            icon: '🔧',
            autoAcknowledge: false
        });

        console.log('🚨 Alarm configuration initialized:', this.alarmConfig.size, 'alarm types');
    }

    createAlarmUI() {
        // Create alarm panel in the UI if it doesn't exist
        let alarmPanel = document.getElementById('alarm-panel');
        if (!alarmPanel) {
            alarmPanel = document.createElement('div');
            alarmPanel.id = 'alarm-panel';
            alarmPanel.className = 'alarm-panel hidden';
            alarmPanel.innerHTML = `
                <div class="alarm-header">
                    <h3 data-i18n="alarms.title">Active Alarms</h3>
                    <div class="alarm-controls">
                        <button id="alarm-acknowledge-all" class="btn btn-small" data-i18n="alarms.acknowledge_all">
                            Acknowledge All
                        </button>
                        <button id="alarm-mute" class="btn btn-small" data-i18n="alarms.mute">
                            Mute
                        </button>
                        <button id="alarm-close" class="btn btn-small">×</button>
                    </div>
                </div>
                <div id="alarm-list" class="alarm-list"></div>
            `;
            
            document.body.appendChild(alarmPanel);
            
            // Bind event listeners
            this.bindAlarmUIEvents();
        }
    }

    bindAlarmUIEvents() {
        // Acknowledge all alarms
        document.getElementById('alarm-acknowledge-all')?.addEventListener('click', () => {
            this.acknowledgeAllAlarms();
        });

        // Mute/unmute alarms
        document.getElementById('alarm-mute')?.addEventListener('click', (e) => {
            this.toggleSound();
            e.target.textContent = this.soundEnabled ? 'Mute' : 'Unmute';
        });

        // Close alarm panel
        document.getElementById('alarm-close')?.addEventListener('click', () => {
            this.hideAlarmPanel();
        });
    }

    // Handle incoming alarm
    handleAlarm(alarm) {
        const alarmId = this.generateAlarmId(alarm);
        
        // Check if this alarm is already active
        if (this.activeAlarms.has(alarmId)) {
            // Update existing alarm
            const existingAlarm = this.activeAlarms.get(alarmId);
            existingAlarm.count += 1;
            existingAlarm.lastOccurrence = new Date().toISOString();
        } else {
            // Create new alarm
            const newAlarm = {
                id: alarmId,
                type: this.determineAlarmType(alarm),
                sensor: alarm.sensor,
                value: alarm.value,
                threshold: alarm.threshold,
                severity: alarm.severity,
                timestamp: new Date().toISOString(),
                lastOccurrence: new Date().toISOString(),
                count: 1,
                acknowledged: false,
                autoAcknowledge: false
            };

            this.activeAlarms.set(alarmId, newAlarm);
            
            // Add to history
            this.alarmHistory.unshift({...newAlarm});
            if (this.alarmHistory.length > 1000) {
                this.alarmHistory = this.alarmHistory.slice(0, 1000);
            }

            // Trigger alarm notifications
            this.triggerAlarmNotifications(newAlarm);
        }

        this.updateAlarmDisplay();
    }

    generateAlarmId(alarm) {
        return `${alarm.sensor}_${alarm.severity}_${Date.now()}`;
    }

    determineAlarmType(alarm) {
        const sensor = alarm.sensor.toLowerCase();
        
        if (sensor.includes('pressure')) {
            return alarm.value < alarm.threshold.min ? 'PRESSURE_LOW' : 'PRESSURE_HIGH';
        } else if (sensor.includes('flow')) {
            return 'FLOW_ABNORMAL';
        } else if (sensor.includes('temperature')) {
            return 'TEMPERATURE_OUT_OF_RANGE';
        } else if (sensor.includes('humidity')) {
            return 'HUMIDITY_OUT_OF_RANGE';
        }
        
        return 'GENERAL_ALARM';
    }

    triggerAlarmNotifications(alarm) {
        const config = this.alarmConfig.get(alarm.type);
        if (!config) return;

        // Visual notification
        this.showVisualNotification(alarm, config);
        
        // Sound notification
        if (this.soundEnabled && !config.autoAcknowledge) {
            this.playAlarmSound(config.sound);
        }

        // Browser notification (if permission granted)
        this.showBrowserNotification(alarm, config);

        // Auto-acknowledge if configured
        if (config.autoAcknowledge) {
            setTimeout(() => {
                this.acknowledgeAlarm(alarm.id);
            }, 5000); // Auto-acknowledge after 5 seconds
        }
    }

    showVisualNotification(alarm, config) {
        // Flash alarm indicator
        const alarmIndicator = document.getElementById('alarm-indicator');
        if (alarmIndicator) {
            alarmIndicator.style.backgroundColor = config.color;
            alarmIndicator.classList.add('alarm-flash');
            
            setTimeout(() => {
                alarmIndicator.classList.remove('alarm-flash');
            }, 3000);
        }

        // Show alarm panel
        this.showAlarmPanel();
    }

    playAlarmSound(soundFile) {
        try {
            const audio = new Audio(`/sounds/${soundFile}`);
            audio.volume = 0.7;
            audio.play().catch(error => {
                console.warn('Could not play alarm sound:', error);
            });
        } catch (error) {
            console.warn('Alarm sound not available:', error);
        }
    }

    showBrowserNotification(alarm, config) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${config.name} - ${config.icon}`, {
                body: `${alarm.sensor}: ${alarm.value} (${alarm.threshold.min}-${alarm.threshold.max})`,
                icon: '/favicon.ico',
                tag: alarm.id,
                requireInteraction: true
            });
        }
    }

    showAlarmPanel() {
        const panel = document.getElementById('alarm-panel');
        if (panel) {
            panel.classList.remove('hidden');
        }
    }

    hideAlarmPanel() {
        const panel = document.getElementById('alarm-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    updateAlarmDisplay() {
        const alarmList = document.getElementById('alarm-list');
        if (!alarmList) return;

        // Clear current display
        alarmList.innerHTML = '';

        // Sort alarms by severity and timestamp
        const sortedAlarms = Array.from(this.activeAlarms.values()).sort((a, b) => {
            const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
            
            if (severityDiff !== 0) return severityDiff;
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        // Display alarms
        sortedAlarms.forEach(alarm => {
            const config = this.alarmConfig.get(alarm.type);
            const alarmElement = this.createAlarmElement(alarm, config);
            alarmList.appendChild(alarmElement);
        });

        // Update alarm counter
        this.updateAlarmCounter();
    }

    createAlarmElement(alarm, config) {
        const element = document.createElement('div');
        element.className = `alarm-item severity-${alarm.severity.toLowerCase()} ${alarm.acknowledged ? 'acknowledged' : ''}`;
        element.innerHTML = `
            <div class="alarm-icon">${config?.icon || '⚠️'}</div>
            <div class="alarm-content">
                <div class="alarm-title">${config?.name || alarm.type}</div>
                <div class="alarm-details">
                    <span class="alarm-sensor">${alarm.sensor}</span>
                    <span class="alarm-value">${alarm.value}</span>
                    <span class="alarm-time">${this.formatAlarmTime(alarm.timestamp)}</span>
                </div>
                ${alarm.count > 1 ? `<div class="alarm-count">×${alarm.count}</div>` : ''}
            </div>
            <div class="alarm-actions">
                <button class="btn btn-small acknowledge-btn" onclick="window.alarmManagement.acknowledgeAlarm('${alarm.id}')"
                        ${alarm.acknowledged ? 'disabled' : ''}>
                    ${alarm.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                </button>
            </div>
        `;
        
        return element;
    }

    formatAlarmTime(timestamp) {
        const now = new Date();
        const alarmTime = new Date(timestamp);
        const diffMs = now - alarmTime;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        return alarmTime.toLocaleDateString();
    }

    acknowledgeAlarm(alarmId) {
        const alarm = this.activeAlarms.get(alarmId);
        if (alarm) {
            alarm.acknowledged = true;
            alarm.acknowledgedTime = new Date().toISOString();
            this.updateAlarmDisplay();
            
            console.log(`✅ Alarm acknowledged: ${alarmId}`);
        }
    }

    acknowledgeAllAlarms() {
        this.activeAlarms.forEach(alarm => {
            alarm.acknowledged = true;
            alarm.acknowledgedTime = new Date().toISOString();
        });
        
        this.updateAlarmDisplay();
        console.log('✅ All alarms acknowledged');
    }

    clearAcknowledgedAlarms() {
        const acknowledgedAlarms = [];
        
        this.activeAlarms.forEach((alarm, id) => {
            if (alarm.acknowledged) {
                acknowledgedAlarms.push(id);
            }
        });
        
        acknowledgedAlarms.forEach(id => {
            this.activeAlarms.delete(id);
        });
        
        this.updateAlarmDisplay();
        console.log(`🗑️ Cleared ${acknowledgedAlarms.length} acknowledged alarms`);
    }

    updateAlarmCounter() {
        const counter = document.getElementById('alarm-counter');
        if (counter) {
            const activeCount = Array.from(this.activeAlarms.values())
                .filter(alarm => !alarm.acknowledged).length;
            
            counter.textContent = activeCount;
            counter.style.display = activeCount > 0 ? 'block' : 'none';
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('maskservice_alarm_sound', this.soundEnabled.toString());
        console.log(`🔊 Alarm sound ${this.soundEnabled ? 'enabled' : 'disabled'}`);
    }

    // Export alarm data for reports
    exportAlarmData() {
        return {
            active: Array.from(this.activeAlarms.values()),
            history: this.alarmHistory.slice(0, 100), // Last 100 alarms
            statistics: this.getAlarmStatistics()
        };
    }

    getAlarmStatistics() {
        const stats = {
            totalActive: this.activeAlarms.size,
            totalHistory: this.alarmHistory.length,
            bySeverity: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
            byType: {}
        };

        // Count active alarms by severity
        this.activeAlarms.forEach(alarm => {
            stats.bySeverity[alarm.severity] = (stats.bySeverity[alarm.severity] || 0) + 1;
            stats.byType[alarm.type] = (stats.byType[alarm.type] || 0) + 1;
        });

        return stats;
    }

    // Public API methods
    getActiveAlarms() {
        return this.activeAlarms;
    }

    getAlarmHistory() {
        return this.alarmHistory;
    }

    getAlarmStatistics() {
        return this.getAlarmStatistics();
    }

    isSoundEnabled() {
        return this.soundEnabled;
    }

    clearAllAlarms() {
        this.activeAlarms.clear();
        this.updateAlarmDisplay();
        this.hideAlarmPanel();
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AlarmManagement = AlarmManagement;
}
