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
                Object.keys(sensor).forEach(flowType => {
                    this.sensorData.set(`${sensorType}_${flowType}`, sensor[flowType].current);
                });
            } else {
                // Simple sensor
                this.sensorData.set(sensorType, sensor.current);
            }
        });
    }

    setupAlarmThresholds() {
        // Set up alarm thresholds for each sensor
        this.alarmThresholds.set('pressure_low', { min: 8, max: 12 });
        this.alarmThresholds.set('pressure_medium', { min: 18, max: 22 });
        this.alarmThresholds.set('pressure_high', { min: 28, max: 32 });
        this.alarmThresholds.set('flow_inlet', { min: 0, max: 50 });
        this.alarmThresholds.set('flow_outlet', { min: 0, max: 45 });
        this.alarmThresholds.set('temperature', { min: 18, max: 35 });
        this.alarmThresholds.set('humidity', { min: 30, max: 70 });
    }

    startRealTimeMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.initializePressureCharts();
        this.updateInterval = setInterval(() => {
            this.updateSensorReadings();
            this.updatePressureCharts();
            this.checkAlarms();
            this.updateDisplay();
        }, 1000); // Update every second

        console.log('✅ Real-time sensor monitoring started');
    }

    stopRealTimeMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isMonitoring = false;
        console.log('🛑 Real-time sensor monitoring stopped');
    }

    // Pressure visualization methods
    initializePressureCharts() {
        const pressureTypes = ['low', 'medium', 'high'];
        pressureTypes.forEach(type => {
            const chartContainer = document.getElementById(`pressure-${type}-dia`);
            if (chartContainer) {
                chartContainer.innerHTML = '<div class="pressure-chart-container"></div>';
                // Initialize with 60 empty data points
                this.pressureHistory[type] = new Array(60).fill(0);
                this.renderPressureChart(type);
            }
        });
    }

    updatePressureCharts() {
        // Get current pressure values
        const currentPressures = {
            low: this.sensorPanel.pressure.low.current,
            medium: this.sensorPanel.pressure.medium.current,
            high: this.sensorPanel.pressure.high.current
        };

        // Update history arrays (shift left and add new value)
        Object.keys(currentPressures).forEach(type => {
            this.pressureHistory[type].shift(); // Remove oldest value
            this.pressureHistory[type].push(currentPressures[type]); // Add new value
            this.renderPressureChart(type);
        });
    }

    renderPressureChart(type) {
        const chartContainer = document.querySelector(`#pressure-${type}-dia .pressure-chart-container`);
        if (!chartContainer) return;

        const data = this.pressureHistory[type];
        const maxValue = Math.max(...data) || 1; // Avoid division by zero
        const minValue = Math.min(...data) || 0;
        const range = maxValue - minValue || 1;

        // Clear existing chart
        chartContainer.innerHTML = '';

        // Create chart lines (60 data points)
        data.forEach((value, index) => {
            const line = document.createElement('div');
            line.className = 'pressure-chart-line';
            
            // Calculate height as percentage (0-100%)
            const normalizedValue = ((value - minValue) / range) * 100;
            const height = Math.max(2, normalizedValue); // Minimum 2% height for visibility
            
            line.style.height = `${height}%`;
            line.style.left = `${(index / 59) * 100}%`;
            line.style.backgroundColor = this.getPressureColor(type, value);
            
            chartContainer.appendChild(line);
        });
    }

    getPressureColor(type, value) {
        const sensor = this.sensorPanel.pressure[type];
        if (!sensor) return '#fbbf24'; // Default yellow
        
        // Color based on pressure ranges
        if (value < sensor.min) {
            return '#ef4444'; // Red for low values
        } else if (value > sensor.max) {
            return '#f97316'; // Orange for high values
        } else {
            return '#22c55e'; // Green for normal range
        }
    }

    updateSensorReadings() {
        // Simulate sensor readings with realistic fluctuations
        const sensors = this.sensorPanel;

        // Update pressure sensors
        sensors.pressure.low.current = this.simulateReading(10.0, 0.5, 8, 12);
        sensors.pressure.medium.current = this.simulateReading(20.0, 1.0, 18, 22);
        sensors.pressure.high.current = this.simulateReading(30.0, 1.5, 28, 32);

        // Update flow sensors
        sensors.flow.inlet.current = this.simulateReading(25.0, 5.0, 0, 50);
        sensors.flow.outlet.current = sensors.flow.inlet.current * 0.95; // Slight loss

        // Update environmental sensors
        sensors.temperature.current = this.simulateReading(22.5, 2.0, 18, 35);
        sensors.humidity.current = this.simulateReading(45.0, 10.0, 30, 70);

        // Store readings in sensor data map
        this.sensorData.set('pressure_low', sensors.pressure.low.current);
        this.sensorData.set('pressure_medium', sensors.pressure.medium.current);
        this.sensorData.set('pressure_high', sensors.pressure.high.current);
        this.sensorData.set('flow_inlet', sensors.flow.inlet.current);
        this.sensorData.set('flow_outlet', sensors.flow.outlet.current);
        this.sensorData.set('temperature', sensors.temperature.current);
        this.sensorData.set('humidity', sensors.humidity.current);
    }

    simulateReading(baseValue, variation, min, max) {
        const randomVariation = (Math.random() - 0.5) * variation * 2;
        const newValue = baseValue + randomVariation;
        return Math.max(min, Math.min(max, newValue));
    }

    checkAlarms() {
        const alarms = [];
        
        this.alarmThresholds.forEach((threshold, sensorName) => {
            const currentValue = this.sensorData.get(sensorName);
            if (currentValue < threshold.min || currentValue > threshold.max) {
                alarms.push({
                    sensor: sensorName,
                    value: currentValue,
                    threshold: threshold,
                    type: currentValue < threshold.min ? 'LOW' : 'HIGH'
                });
            }
        });

        if (alarms.length > 0) {
            this.handleAlarms(alarms);
        }
    }

    handleAlarms(alarms) {
        alarms.forEach(alarm => {
            console.warn(`🚨 ALARM: ${alarm.sensor} = ${alarm.value.toFixed(2)} (${alarm.type})`);
            this.showAlarmNotification(alarm);
        });
    }

    showAlarmNotification(alarm) {
        // Create alarm notification element
        const notification = document.createElement('div');
        notification.className = 'alarm-notification';
        notification.innerHTML = `
            <div class="alarm-content">
                <span class="alarm-icon">⚠️</span>
                <span class="alarm-text">ALARM: ${alarm.sensor} - ${alarm.value.toFixed(2)}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    updateDisplay() {
        // Update pressure panel display
        const pressureLow = document.getElementById('pressure-low');
        const pressureMedium = document.getElementById('pressure-medium');
        const pressureHigh = document.getElementById('pressure-high');

        if (pressureLow) {
            pressureLow.textContent = `${this.sensorPanel.pressure.low.current.toFixed(1)}`;
        }
        if (pressureMedium) {
            pressureMedium.textContent = `${this.sensorPanel.pressure.medium.current.toFixed(1)}`;
        }
        if (pressureHigh) {
            pressureHigh.textContent = `${this.sensorPanel.pressure.high.current.toFixed(1)}`;
        }

        // Update device data template if visible
        const tempValue = document.getElementById('temp-value');
        const humidityValue = document.getElementById('humidity-value');
        
        if (tempValue) {
            tempValue.textContent = `${this.sensorPanel.temperature.current.toFixed(1)}${this.sensorPanel.temperature.unit}`;
        }
        if (humidityValue) {
            humidityValue.textContent = `${this.sensorPanel.humidity.current.toFixed(0)}${this.sensorPanel.humidity.unit}`;
        }

        // Update enhanced sensor display if visible
        this.updateEnhancedSensorDisplay();
    }

    updateEnhancedSensorDisplay() {
        const displays = [
            { id: 'flow-inlet-reading', value: this.sensorPanel.flow.inlet.current, unit: this.sensorPanel.flow.inlet.unit },
            { id: 'flow-outlet-reading', value: this.sensorPanel.flow.outlet.current, unit: this.sensorPanel.flow.outlet.unit },
            { id: 'pressure-low-reading', value: this.sensorPanel.pressure.low.current, unit: this.sensorPanel.pressure.low.unit },
            { id: 'pressure-med-reading', value: this.sensorPanel.pressure.medium.current, unit: this.sensorPanel.pressure.medium.unit },
            { id: 'pressure-high-reading', value: this.sensorPanel.pressure.high.current, unit: this.sensorPanel.pressure.high.unit }
        ];

        displays.forEach(display => {
            const element = document.getElementById(display.id);
            if (element) {
                element.textContent = `${display.value.toFixed(1)} ${display.unit}`;
            }
        });
    }

    // Historia urządzenia i predykcyjna konserwacja
    loadDeviceHistory() {
        // Mock device history data
        const mockHistory = {
            'PP001': {
                lastTests: [
                    { date: '2024-01-15', result: 'PASS', scenario: 'scenario_1' },
                    { date: '2023-07-10', result: 'PASS', scenario: 'scenario_2' },
                    { date: '2023-01-05', result: 'FAIL', scenario: 'scenario_2' }
                ],
                maintenanceLog: [
                    { date: '2024-01-20', action: 'Filter replacement', technician: 'Jan Kowalski' },
                    { date: '2023-12-15', action: 'Seal inspection', technician: 'Anna Nowak' }
                ],
                calibrationDates: ['2024-01-01', '2023-07-01', '2023-01-01'],
                failureHistory: [
                    { date: '2023-01-05', issue: 'Pressure leak', resolution: 'Seal replacement' }
                ]
            }
        };

        mockHistory['PP001'].deviceHistory = mockHistory['PP001'];
        this.deviceHistory.set('PP001', mockHistory['PP001']);
    }

    // Predykcyjna konserwacja
    predictiveMaintenance = {
        nextTestDate: null,
        componentsToCheck: [],
        estimatedLifespan: null,
        riskFactors: []
    };

    calculatePredictiveMaintenance(deviceSerial) {
        const history = this.deviceHistory.get(deviceSerial);
        if (!history) return null;

        const lastTest = history.lastTests[0];
        const testInterval = this.calculateTestInterval(history.lastTests);
        
        // Calculate next test date
        const nextTestDate = new Date(lastTest.date);
        nextTestDate.setMonth(nextTestDate.getMonth() + testInterval);

        // Identify components to check based on failure history
        const componentsToCheck = this.identifyMaintenanceComponents(history);

        // Estimate lifespan based on usage patterns
        const estimatedLifespan = this.estimateDeviceLifespan(history);

        // Calculate risk factors
        const riskFactors = this.calculateRiskFactors(history);

        return {
            nextTestDate,
            componentsToCheck,
            estimatedLifespan,
            riskFactors
        };
    }

    calculateTestInterval(testHistory) {
        // Calculate average interval between tests
        if (testHistory.length < 2) return 6; // Default 6 months

        const intervals = [];
        for (let i = 1; i < testHistory.length; i++) {
            const current = new Date(testHistory[i-1].date);
            const previous = new Date(testHistory[i].date);
            const diffMonths = (current - previous) / (1000 * 60 * 60 * 24 * 30);
            intervals.push(diffMonths);
        }

        return Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
    }

    identifyMaintenanceComponents(history) {
        const components = new Set();
        
        // Based on failure history
        history.failureHistory.forEach(failure => {
            if (failure.issue.includes('pressure')) components.add('pressure_system');
            if (failure.issue.includes('seal')) components.add('seals');
            if (failure.issue.includes('valve')) components.add('valves');
            if (failure.issue.includes('filter')) components.add('filters');
        });

        // Based on maintenance log
        history.maintenanceLog.forEach(maintenance => {
            if (maintenance.action.includes('Filter')) components.add('filters');
            if (maintenance.action.includes('Seal')) components.add('seals');
        });

        return Array.from(components);
    }

    estimateDeviceLifespan(history) {
        // Simple lifespan estimation based on test frequency and failure rate
        const totalTests = history.lastTests.length;
        const failures = history.failureHistory.length;
        const failureRate = failures / totalTests;

        // Base lifespan in years, reduced by failure rate
        const baseLifespan = 10;
        const adjustedLifespan = baseLifespan * (1 - failureRate * 0.5);

        return Math.max(5, Math.round(adjustedLifespan)); // Minimum 5 years
    }

    calculateRiskFactors(history) {
        const risks = [];
        
        // High failure rate
        const failureRate = history.failureHistory.length / history.lastTests.length;
        if (failureRate > 0.2) {
            risks.push({ type: 'HIGH_FAILURE_RATE', severity: 'HIGH' });
        }

        // Overdue maintenance
        const lastMaintenance = new Date(history.maintenanceLog[0]?.date || '2020-01-01');
        const monthsSinceMaintenance = (new Date() - lastMaintenance) / (1000 * 60 * 60 * 24 * 30);
        if (monthsSinceMaintenance > 6) {
            risks.push({ type: 'OVERDUE_MAINTENANCE', severity: 'MEDIUM' });
        }

        // Calibration due
        const lastCalibration = new Date(history.calibrationDates[0] || '2020-01-01');
        const monthsSinceCalibration = (new Date() - lastCalibration) / (1000 * 60 * 60 * 24 * 30);
        if (monthsSinceCalibration > 12) {
            risks.push({ type: 'CALIBRATION_DUE', severity: 'HIGH' });
        }

        return risks;
    }

    // Enhanced device data template
    getEnhancedDeviceDataHTML() {
        const currentDevice = 'PP001'; // Mock current device
        const maintenance = this.calculatePredictiveMaintenance(currentDevice);
        const history = this.deviceHistory.get(currentDevice);

        return `
            <div class="device-data-enhanced">
                <div class="device-header">
                    <h2>Dane urządzenia - Rozszerzone</h2>
                    <div class="device-status-indicator">
                        <span class="status-dot online"></span>
                        <span>ONLINE</span>
                    </div>
                </div>

                <!-- Real-time Sensor Panel -->
                <div class="sensor-panel-enhanced">
                    <h3>Czujniki w czasie rzeczywistym</h3>
                    <div class="sensor-grid">
                        <div class="sensor-group pressure-group">
                            <h4>Ciśnienie</h4>
                            <div class="sensor-readings">
                                <div class="sensor-item">
                                    <span class="sensor-label">Niskie:</span>
                                    <span class="sensor-value" id="pressure-low-enhanced">${this.sensorPanel.pressure.low.current.toFixed(1)} ${this.sensorPanel.pressure.low.unit}</span>
                                    <div class="sensor-range">(${this.sensorPanel.pressure.low.min}-${this.sensorPanel.pressure.low.max} ${this.sensorPanel.pressure.low.unit})</div>
                                </div>
                                <div class="sensor-item">
                                    <span class="sensor-label">Średnie:</span>
                                    <span class="sensor-value" id="pressure-medium-enhanced">${this.sensorPanel.pressure.medium.current.toFixed(1)} ${this.sensorPanel.pressure.medium.unit}</span>
                                    <div class="sensor-range">(${this.sensorPanel.pressure.medium.min}-${this.sensorPanel.pressure.medium.max} ${this.sensorPanel.pressure.medium.unit})</div>
                                </div>
                                <div class="sensor-item">
                                    <span class="sensor-label">Wysokie:</span>
                                    <span class="sensor-value" id="pressure-high-enhanced">${this.sensorPanel.pressure.high.current.toFixed(1)} ${this.sensorPanel.pressure.high.unit}</span>
                                    <div class="sensor-range">(${this.sensorPanel.pressure.high.min}-${this.sensorPanel.pressure.high.max} ${this.sensorPanel.pressure.high.unit})</div>
                                </div>
                            </div>
                        </div>

                        <div class="sensor-group flow-group">
                            <h4>Przepływ</h4>
                            <div class="sensor-readings">
                                <div class="sensor-item">
                                    <span class="sensor-label">Wlot:</span>
                                    <span class="sensor-value" id="flow-inlet-enhanced">${this.sensorPanel.flow.inlet.current.toFixed(1)} ${this.sensorPanel.flow.inlet.unit}</span>
                                </div>
                                <div class="sensor-item">
                                    <span class="sensor-label">Wylot:</span>
                                    <span class="sensor-value" id="flow-outlet-enhanced">${this.sensorPanel.flow.outlet.current.toFixed(1)} ${this.sensorPanel.flow.outlet.unit}</span>
                                </div>
                            </div>
                        </div>

                        <div class="sensor-group environment-group">
                            <h4>Środowisko</h4>
                            <div class="sensor-readings">
                                <div class="sensor-item">
                                    <span class="sensor-label">Temperatura:</span>
                                    <span class="sensor-value" id="temperature-enhanced">${this.sensorPanel.temperature.current.toFixed(1)}${this.sensorPanel.temperature.unit}</span>
                                </div>
                                <div class="sensor-item">
                                    <span class="sensor-label">Wilgotność:</span>
                                    <span class="sensor-value" id="humidity-enhanced">${this.sensorPanel.humidity.current.toFixed(0)}${this.sensorPanel.humidity.unit}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Device History -->
                <div class="device-history-section">
                    <h3>Historia urządzenia</h3>
                    <div class="history-tabs">
                        <button class="tab-btn active" onclick="deviceDataEnhanced.showHistoryTab('tests')">Ostatnie testy</button>
                        <button class="tab-btn" onclick="deviceDataEnhanced.showHistoryTab('maintenance')">Konserwacja</button>
                        <button class="tab-btn" onclick="deviceDataEnhanced.showHistoryTab('calibration')">Kalibracja</button>
                        <button class="tab-btn" onclick="deviceDataEnhanced.showHistoryTab('failures')">Awarie</button>
                    </div>
                    <div class="history-content" id="history-content">
                        ${this.getTestHistoryHTML(history?.lastTests || [])}
                    </div>
                </div>

                <!-- Predictive Maintenance -->
                <div class="predictive-maintenance-section">
                    <h3>Predykcyjna konserwacja</h3>
                    <div class="maintenance-info">
                        <div class="maintenance-item">
                            <span class="maintenance-label">Następny test:</span>
                            <span class="maintenance-value">${maintenance?.nextTestDate?.toLocaleDateString() || 'N/A'}</span>
                        </div>
                        <div class="maintenance-item">
                            <span class="maintenance-label">Komponenty do sprawdzenia:</span>
                            <span class="maintenance-value">${maintenance?.componentsToCheck?.join(', ') || 'Brak'}</span>
                        </div>
                        <div class="maintenance-item">
                            <span class="maintenance-label">Szacowana żywotność:</span>
                            <span class="maintenance-value">${maintenance?.estimatedLifespan || 'N/A'} lat</span>
                        </div>
                    </div>
                    ${maintenance?.riskFactors?.length > 0 ? this.getRiskFactorsHTML(maintenance.riskFactors) : ''}
                </div>

                <div class="device-actions">
                    <button class="btn btn-primary" onclick="deviceDataEnhanced.exportDeviceData()">📊 Eksportuj dane</button>
                    <button class="btn btn-secondary" onclick="deviceDataEnhanced.scheduleMaintenance()">🔧 Zaplanuj konserwację</button>
                    <button class="btn btn-warning" onclick="deviceDataEnhanced.calibrateDevice()">⚙️ Kalibruj</button>
                </div>
            </div>
        `;
    }

    // Real-time Sensors HTML template
    getRealtimeSensorsHTML() {
        return `
            <div class="device-data-enhanced">
                <div class="device-header">
                    <h2>Czujniki w czasie rzeczywistym</h2>
                    <div class="device-status-indicator">
                        <span class="status-dot online"></span>
                        <span>ONLINE</span>
                    </div>
                </div>

                <!-- Real-time Sensor Panel -->
                <div class="sensor-panel-enhanced">
                    <h3>Monitoring sensorów w czasie rzeczywistym</h3>
                    <div class="sensor-grid">
                        <div class="sensor-group pressure-group">
                            <h4>Ciśnienie</h4>
                            <div class="sensor-readings">
                                <div class="sensor-item">
                                    <span class="sensor-label">Niskie:</span>
                                    <span class="sensor-value" id="pressure-low-enhanced">${this.sensorPanel.pressure.low.current.toFixed(1)} ${this.sensorPanel.pressure.low.unit}</span>
                                    <div class="sensor-range">(${this.sensorPanel.pressure.low.min}-${this.sensorPanel.pressure.low.max} ${this.sensorPanel.pressure.low.unit})</div>
                                </div>
                                <div class="sensor-item">
                                    <span class="sensor-label">Średnie:</span>
                                    <span class="sensor-value" id="pressure-medium-enhanced">${this.sensorPanel.pressure.medium.current.toFixed(1)} ${this.sensorPanel.pressure.medium.unit}</span>
                                    <div class="sensor-range">(${this.sensorPanel.pressure.medium.min}-${this.sensorPanel.pressure.medium.max} ${this.sensorPanel.pressure.medium.unit})</div>
                                </div>
                                <div class="sensor-item">
                                    <span class="sensor-label">Wysokie:</span>
                                    <span class="sensor-value" id="pressure-high-enhanced">${this.sensorPanel.pressure.high.current.toFixed(1)} ${this.sensorPanel.pressure.high.unit}</span>
                                    <div class="sensor-range">(${this.sensorPanel.pressure.high.min}-${this.sensorPanel.pressure.high.max} ${this.sensorPanel.pressure.high.unit})</div>
                                </div>
                            </div>
                        </div>

                        <div class="sensor-group flow-group">
                            <h4>Przepływ</h4>
                            <div class="sensor-readings">
                                <div class="sensor-item">
                                    <span class="sensor-label">Wlot:</span>
                                    <span class="sensor-value" id="flow-inlet-enhanced">${this.sensorPanel.flow.inlet.current.toFixed(1)} ${this.sensorPanel.flow.inlet.unit}</span>
                                </div>
                                <div class="sensor-item">
                                    <span class="sensor-label">Wylot:</span>
                                    <span class="sensor-value" id="flow-outlet-enhanced">${this.sensorPanel.flow.outlet.current.toFixed(1)} ${this.sensorPanel.flow.outlet.unit}</span>
                                </div>
                            </div>
                        </div>

                        <div class="sensor-group environment-group">
                            <h4>Środowisko</h4>
                            <div class="sensor-readings">
                                <div class="sensor-item">
                                    <span class="sensor-label">Temperatura:</span>
                                    <span class="sensor-value" id="temperature-enhanced">${this.sensorPanel.temperature.current.toFixed(1)}${this.sensorPanel.temperature.unit}</span>
                                </div>
                                <div class="sensor-item">
                                    <span class="sensor-label">Wilgotność:</span>
                                    <span class="sensor-value" id="humidity-enhanced">${this.sensorPanel.humidity.current.toFixed(0)}${this.sensorPanel.humidity.unit}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sensor Actions -->
                <div class="device-actions">
                    <button class="btn btn-primary" onclick="deviceDataEnhanced.exportSensorData()">📊 Eksportuj dane sensorów</button>
                    <button class="btn btn-warning" onclick="deviceDataEnhanced.calibrateDevice()">⚙️ Kalibruj sensory</button>
                    <button class="btn btn-secondary" onclick="deviceDataEnhanced.showAlarmSettings()">🔔 Ustawienia alarmów</button>
                </div>
            </div>
        `;
    }

    // Device History HTML template
    getDeviceHistoryHTML() {
        const currentDevice = 'PP001'; // Mock current device
        const maintenance = this.calculatePredictiveMaintenance(currentDevice);
        const history = this.deviceHistory.get(currentDevice);

        return `
            <div class="device-data-enhanced">
                <div class="device-header">
                    <h2>Historia urządzenia</h2>
                    <div class="device-status-indicator">
                        <span class="status-dot online"></span>
                        <span>PP001</span>
                    </div>
                </div>

                <!-- Device History -->
                <div class="device-history-section">
                    <h3>Historia urządzenia</h3>
                    <div class="history-tabs">
                        <button class="tab-btn active" onclick="deviceDataEnhanced.showHistoryTab('tests')">Ostatnie testy</button>
                        <button class="tab-btn" onclick="deviceDataEnhanced.showHistoryTab('maintenance')">Konserwacja</button>
                        <button class="tab-btn" onclick="deviceDataEnhanced.showHistoryTab('calibration')">Kalibracja</button>
                        <button class="tab-btn" onclick="deviceDataEnhanced.showHistoryTab('failures')">Awarie</button>
                    </div>
                    <div class="history-content" id="history-content">
                        ${this.getTestHistoryHTML(history?.lastTests || [])}
                    </div>
                </div>

                <!-- Predictive Maintenance -->
                <div class="predictive-maintenance-section">
                    <h3>Predykcyjna konserwacja</h3>
                    <div class="maintenance-info">
                        <div class="maintenance-item">
                            <span class="maintenance-label">Następny test:</span>
                            <span class="maintenance-value">${maintenance?.nextTestDate?.toLocaleDateString() || 'N/A'}</span>
                        </div>
                        <div class="maintenance-item">
                            <span class="maintenance-label">Komponenty do sprawdzenia:</span>
                            <span class="maintenance-value">${maintenance?.componentsToCheck?.join(', ') || 'Brak'}</span>
                        </div>
                        <div class="maintenance-item">
                            <span class="maintenance-label">Szacowana żywotność:</span>
                            <span class="maintenance-value">${maintenance?.estimatedLifespan || 'N/A'} lat</span>
                        </div>
                    </div>
                    ${maintenance?.riskFactors?.length > 0 ? this.getRiskFactorsHTML(maintenance.riskFactors) : ''}
                </div>

                <!-- History Actions -->
                <div class="device-actions">
                    <button class="btn btn-primary" onclick="deviceDataEnhanced.exportDeviceData()">📊 Eksportuj historię</button>
                    <button class="btn btn-secondary" onclick="deviceDataEnhanced.scheduleMaintenance()">🔧 Zaplanuj konserwację</button>
                    <button class="btn btn-info" onclick="deviceDataEnhanced.generateReport()">📋 Generuj raport</button>
                </div>
            </div>
        `;
    }

    getTestHistoryHTML(tests) {
        if (!tests || tests.length === 0) {
            return '<p>Brak danych o testach</p>';
        }

        return `
            <div class="test-history">
                ${tests.map(test => `
                    <div class="history-item">
                        <div class="item-date">${test.date}</div>
                        <div class="item-result ${test.result.toLowerCase()}">${test.result}</div>
                        <div class="item-scenario">${test.scenario}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getRiskFactorsHTML(riskFactors) {
        return `
            <div class="risk-factors">
                <h4>Czynniki ryzyka:</h4>
                ${riskFactors.map(risk => `
                    <div class="risk-item ${risk.severity.toLowerCase()}">
                        <span class="risk-icon">⚠️</span>
                        <span class="risk-text">${this.getRiskText(risk.type)}</span>
                        <span class="risk-severity">${risk.severity}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getRiskText(riskType) {
        const riskTexts = {
            'HIGH_FAILURE_RATE': 'Wysoki wskaźnik awarii',
            'OVERDUE_MAINTENANCE': 'Zaległa konserwacja',
            'CALIBRATION_DUE': 'Wymagana kalibracja'
        };
        return riskTexts[riskType] || riskType;
    }

    // Event handlers
    showHistoryTab(tabType) {
        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        const content = document.getElementById('history-content');
        const history = this.deviceHistory.get('PP001');

        switch(tabType) {
            case 'tests':
                content.innerHTML = this.getTestHistoryHTML(history?.lastTests || []);
                break;
            case 'maintenance':
                content.innerHTML = this.getMaintenanceHistoryHTML(history?.maintenanceLog || []);
                break;
            case 'calibration':
                content.innerHTML = this.getCalibrationHistoryHTML(history?.calibrationDates || []);
                break;
            case 'failures':
                content.innerHTML = this.getFailureHistoryHTML(history?.failureHistory || []);
                break;
        }
    }

    getMaintenanceHistoryHTML(maintenance) {
        if (!maintenance || maintenance.length === 0) {
            return '<p>Brak danych o konserwacji</p>';
        }

        return `
            <div class="maintenance-history">
                ${maintenance.map(item => `
                    <div class="history-item">
                        <div class="item-date">${item.date}</div>
                        <div class="item-action">${item.action}</div>
                        <div class="item-technician">${item.technician}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getCalibrationHistoryHTML(calibrations) {
        if (!calibrations || calibrations.length === 0) {
            return '<p>Brak danych o kalibracji</p>';
        }

        return `
            <div class="calibration-history">
                ${calibrations.map(date => `
                    <div class="history-item">
                        <div class="item-date">${date}</div>
                        <div class="item-status">Zakończona</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getFailureHistoryHTML(failures) {
        if (!failures || failures.length === 0) {
            return '<p>Brak historii awarii</p>';
        }

        return `
            <div class="failure-history">
                ${failures.map(failure => `
                    <div class="history-item">
                        <div class="item-date">${failure.date}</div>
                        <div class="item-issue">${failure.issue}</div>
                        <div class="item-resolution">${failure.resolution}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Action methods
    exportDeviceData() {
        console.log('Exporting device data...');
        alert('Funkcja eksportu danych urządzenia - wkrótce dostępna!');
    }

    scheduleMaintenance() {
        console.log('Scheduling maintenance...');
        alert('Funkcja planowania konserwacji - wkrótce dostępna!');
    }

    calibrateDevice() {
        console.log('Starting device calibration...');
        alert('Funkcja kalibracji urządzenia - wkrótce dostępna!');
    }

    // Public methods for template integration
    showEnhancedDeviceData() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getEnhancedDeviceDataHTML();
        }
    }

    showRealtimeSensors() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getRealtimeSensorsHTML();
        }
    }

    showDeviceHistory() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getDeviceHistoryHTML();
        }
    }

    // Delegation methods for UI display (backward compatibility)
    showRealtimeSensors() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getRealtimeSensorsHTML();
        }
    }

    showDeviceHistory() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getDeviceHistoryHTML();
        }
    }

    getRealtimeSensorsHTML() {
        return `
            <div class="device-data-panel">
                <h2 data-i18n="device.realtime_sensors">Real-time Sensors</h2>
                <div class="sensors-grid">
                    <div id="pressure-panel" class="sensor-group">
                        <h3 data-i18n="device.pressure_sensors">Pressure Sensors</h3>
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
                </div>
            </div>
        `;
    }

    getDeviceHistoryHTML() {
        return `
            <div class="device-history-panel">
                <h2 data-i18n="device.history_title">Device History</h2>
                <div class="history-content">
                    <p data-i18n="device.history_loading">Loading device history...</p>
                </div>
            </div>
        `;
    }

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

console.log('✅ Enhanced Device Data Module (Orchestrator) loaded');
