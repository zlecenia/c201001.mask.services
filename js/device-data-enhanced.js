/**
 * MASKSERVICE C20 - Enhanced Device Data Module (Orchestrator)
 * Coordinates modular components for sensor monitoring, pressure visualization, 
 * device history, and alarm management
 */

class DeviceDataEnhanced {
    constructor() {
        this.sensorMonitoring = null;
        this.pressureVisualization = null;
        this.deviceHistory = null;
        this.alarmManagement = null;
        this.init();
    }

    init() {
        this.initializeModularComponents();
        this.setupComponentIntegration();
        this.setupGlobalReferences();
        console.log('✅ DeviceDataEnhanced orchestrator initialized');
    }

    initializeModularComponents() {
        // Initialize modular components with error handling
        try {
            this.sensorMonitoring = new SensorMonitoring();
            this.pressureVisualization = new PressureVisualization();
            this.deviceHistory = new DeviceHistory();
            this.alarmManagement = new AlarmManagement();
            console.log('✅ All modular components initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing modular components:', error);
        }
    }

    setupComponentIntegration() {
        if (!this.sensorMonitoring || !this.pressureVisualization || !this.alarmManagement) {
            console.warn('⚠️ Cannot setup component integration - missing components');
            return;
        }

        // Integrate pressure visualization with sensor monitoring
        const originalUpdateDisplay = this.sensorMonitoring.updateDisplay.bind(this.sensorMonitoring);
        this.sensorMonitoring.updateDisplay = () => {
            originalUpdateDisplay();
            // Update pressure charts when sensor data updates
            this.pressureVisualization.updateCharts(this.sensorMonitoring.getSensorPanel());
        };

        // Handle alarms from sensor monitoring
        this.sensorMonitoring.onAlarm = (alarm) => {
            this.alarmManagement.handleAlarm(alarm);
        };
    }

    setupGlobalReferences() {
        // Make components globally accessible for backward compatibility
        window.sensorMonitoring = this.sensorMonitoring;
        window.pressureVisualization = this.pressureVisualization;
        window.deviceHistory = this.deviceHistory;
        window.alarmManagement = this.alarmManagement;
    }

    // DELEGATION METHODS - Forward calls to appropriate modular components

    // Sensor Monitoring Delegation
    initializeSensorPanel() {
        return this.sensorMonitoring?.initializeSensorPanel();
    }

    startRealTimeMonitoring() {
        return this.sensorMonitoring?.startRealTimeMonitoring();
    }

    stopRealTimeMonitoring() {
        return this.sensorMonitoring?.stopRealTimeMonitoring();
    }

    updateSensorReadings() {
        return this.sensorMonitoring?.updateSensorReadings();
    }

    getSensorPanel() {
        return this.sensorMonitoring?.getSensorPanel();
    }

    getSensorData() {
        return this.sensorMonitoring?.getSensorData();
    }

    // Pressure Visualization Delegation
    initializePressureCharts() {
        return this.pressureVisualization?.initializePressureCharts();
    }

    updatePressureCharts() {
        return this.pressureVisualization?.updatePressureCharts();
    }

    renderPressureChart(type) {
        return this.pressureVisualization?.renderPressureChart(type);
    }

    // Device History Delegation
    loadDeviceHistory() {
        return this.deviceHistory?.loadDeviceHistory();
    }

    getDeviceHistory(deviceSerial) {
        return this.deviceHistory?.getDeviceHistory(deviceSerial);
    }

    calculatePredictiveMaintenance(deviceSerial) {
        return this.deviceHistory?.calculatePredictiveMaintenance(deviceSerial);
    }

    // Alarm Management Delegation
    checkAlarms() {
        return this.alarmManagement?.checkAlarms();
    }

    handleAlarms(alarms) {
        return this.alarmManagement?.handleAlarms(alarms);
    }

    clearAllAlarms() {
        return this.alarmManagement?.clearAllAlarms();
    }

    // UI DISPLAY METHODS - Generate HTML templates for views
    showEnhancedDeviceData() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getEnhancedDeviceDataHTML();
            // Start monitoring when device data view is shown
            this.startRealTimeMonitoring();
        }
    }

    showRealtimeSensors() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getRealtimeSensorsHTML();
            // Start monitoring when sensor view is shown
            this.startRealTimeMonitoring();
        }
    }

    showDeviceHistory() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getDeviceHistoryHTML();
            // Load device history data
            this.loadDeviceHistory();
        }
    }

    // HTML TEMPLATE GENERATORS
    getEnhancedDeviceDataHTML() {
        return `
            <div class="device-data-enhanced">
                <h2 data-i18n="device.enhanced_data">Enhanced Device Data</h2>
                <div class="device-tabs">
                    <button onclick="deviceDataEnhanced.showRealtimeSensors()" data-i18n="device.realtime_sensors">Real-time Sensors</button>
                    <button onclick="deviceDataEnhanced.showDeviceHistory()" data-i18n="device.device_history">Device History</button>
                </div>
                <div class="device-content">
                    ${this.getRealtimeSensorsHTML()}
                </div>
            </div>
        `;
    }

    getRealtimeSensorsHTML() {
        return `
            <div class="device-data-panel">
                <h3 data-i18n="device.realtime_sensors">Real-time Sensors</h3>
                <div class="sensors-grid">
                    <div id="pressure-panel" class="sensor-group">
                        <h4 data-i18n="device.pressure_sensors">Pressure Sensors</h4>
                        <div class="pressure-items">
                            <div class="pressure-item">
                                <span data-i18n="device.pressure_low">Low</span>
                                <div id="pressure-low-dia" class="pressure-dia"></div>
                            </div>
                            <div class="pressure-item">
                                <span data-i18n="device.pressure_medium">Medium</span>
                                <div id="pressure-medium-dia" class="pressure-dia"></div>
                            </div>
                            <div class="pressure-item">
                                <span data-i18n="device.pressure_high">High</span>
                                <div id="pressure-high-dia" class="pressure-dia"></div>
                            </div>
                        </div>
                    </div>
                    <div class="sensor-group">
                        <h4 data-i18n="device.other_sensors">Other Sensors</h4>
                        <div class="sensor-readings">
                            <div class="sensor-reading">
                                <span data-i18n="device.temperature">Temperature:</span>
                                <span id="temp-value">--°C</span>
                            </div>
                            <div class="sensor-reading">
                                <span data-i18n="device.humidity">Humidity:</span>
                                <span id="humidity-value">--%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="device-actions">
                    <button onclick="deviceDataEnhanced.exportDeviceData()" data-i18n="device.export_data">Export Data</button>
                    <button onclick="deviceDataEnhanced.scheduleMaintenance()" data-i18n="device.schedule_maintenance">Schedule Maintenance</button>
                    <button onclick="deviceDataEnhanced.calibrateDevice()" data-i18n="device.calibrate">Calibrate Device</button>
                </div>
            </div>
        `;
    }

    getDeviceHistoryHTML() {
        return `
            <div class="device-history-panel">
                <h3 data-i18n="device.history_title">Device History</h3>
                <div class="history-content">
                    <div class="history-section">
                        <h4 data-i18n="device.test_history">Test History</h4>
                        <div id="test-history-content">
                            <p data-i18n="device.history_loading">Loading device history...</p>
                        </div>
                    </div>
                    <div class="history-section">
                        <h4 data-i18n="device.maintenance_history">Maintenance History</h4>
                        <div id="maintenance-history-content">
                            <p data-i18n="device.history_loading">Loading maintenance history...</p>
                        </div>
                    </div>
                    <div class="history-section">
                        <h4 data-i18n="device.predictive_maintenance">Predictive Maintenance</h4>
                        <div id="predictive-maintenance-content">
                            <p data-i18n="device.calculating">Calculating recommendations...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ACTION METHODS - Simple delegates for UI actions
    exportDeviceData() {
        console.log('📊 Exporting device data...');
        if (window.InlineDialog) {
            window.InlineDialog.show({
                title: 'Export Device Data',
                message: 'Select export format:',
                buttons: [
                    { text: 'CSV', action: () => this.exportData('csv') },
                    { text: 'JSON', action: () => this.exportData('json') },
                    { text: 'Cancel', action: 'close' }
                ]
            });
        } else {
            alert('Export funkcjonalność dostępna wkrótce!');
        }
    }

    scheduleMaintenance() {
        console.log('🔧 Scheduling maintenance...');
        if (window.InlineDialog) {
            window.InlineDialog.show({
                title: 'Schedule Maintenance',
                message: 'Maintenance scheduling will be available soon.',
                buttons: [{ text: 'OK', action: 'close' }]
            });
        } else {
            alert('Planowanie konserwacji dostępne wkrótce!');
        }
    }

    calibrateDevice() {
        console.log('⚖️ Starting device calibration...');
        if (window.InlineDialog) {
            window.InlineDialog.show({
                title: 'Device Calibration',
                message: 'Device calibration will be available soon.',
                buttons: [{ text: 'OK', action: 'close' }]
            });
        } else {
            alert('Kalibracja urządzenia dostępna wkrótce!');
        }
    }

    exportData(format) {
        const data = this.getSensorData();
        console.log(`Exporting data in ${format} format:`, data);
        // Implementation will be handled by a dedicated export module
    }

    // CLEANUP AND LIFECYCLE MANAGEMENT
    destroy() {
        if (this.sensorMonitoring) {
            this.sensorMonitoring.stopRealTimeMonitoring();
        }
        if (this.alarmManagement) {
            this.alarmManagement.clearAllAlarms();
        }
        console.log('🗑️ DeviceDataEnhanced orchestrator destroyed');
    }
}

// Create global instance
window.deviceDataEnhanced = new DeviceDataEnhanced();

console.log('✅ Enhanced Device Data Module (Orchestrator) loaded - fully modularized');
