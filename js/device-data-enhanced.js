/**
 * MASKSERVICE C20 - Enhanced Device Data Module
 * Real-time sensor monitoring, device history, and predictive maintenance
 */

class DeviceDataEnhanced {
    constructor() {
        this.sensorData = new Map();
        this.deviceHistory = new Map();
        this.alarmThresholds = new Map();
        this.updateInterval = null;
        this.isMonitoring = false;
        this.init();
    }

    init() {
        this.initializeSensorPanel();
        this.loadDeviceHistory();
        this.setupAlarmThresholds();
        this.startRealTimeMonitoring();
    }

    // Panel czujników w czasie rzeczywistym
    sensorPanel = {
        pressure: {
            low: { min: 8, max: 12, unit: 'mbar', alarm: true, current: 10.0 },
            medium: { min: 18, max: 22, unit: 'bar', alarm: true, current: 20.0 },
            high: { min: 28, max: 32, unit: 'bar', alarm: true, current: 30.0 }
        },
        flow: {
            inlet: { current: 0, unit: 'l/min', max: 50, alarm: true },
            outlet: { current: 0, unit: 'l/min', max: 45, alarm: true }
        },
        temperature: { current: 22.5, unit: '°C', min: 18, max: 35, alarm: true },
        humidity: { current: 45, unit: '%', min: 30, max: 70, alarm: true }
    };

    initializeSensorPanel() {
        // Initialize sensor readings with default values
        Object.keys(this.sensorPanel).forEach(sensorType => {
            const sensor = this.sensorPanel[sensorType];
            if (sensor.pressure) {
                // Pressure has sub-sensors
                Object.keys(sensor).forEach(subType => {
                    this.sensorData.set(`${sensorType}_${subType}`, sensor[subType].current);
                });
            } else if (sensor.flow) {
                // Flow has inlet/outlet
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
        this.updateInterval = setInterval(() => {
            this.updateSensorReadings();
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

    destroy() {
        this.stopRealTimeMonitoring();
    }
}

// Create global instance
window.deviceDataEnhanced = new DeviceDataEnhanced();

console.log('✅ Enhanced Device Data Module loaded');
