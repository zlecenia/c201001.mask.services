/**
 * MASKSERVICE C20 - Sensor Monitoring Module
 * Real-time sensor data monitoring and updates
 */

class SensorMonitoring {
    constructor() {
        this.sensorData = new Map();
        this.updateInterval = null;
        this.isMonitoring = false;
        this.init();
    }

    init() {
        this.initializeSensorPanel();
        this.setupAlarmThresholds();
        this.startMonitoring(); // Automatycznie uruchom monitoring
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

    alarmThresholds = new Map();

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
        // Configure alarm thresholds for each sensor
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
        sensors.flow.inlet.current = this.simulateReading(25.0, 2.0, 0, 50);
        sensors.flow.outlet.current = this.simulateReading(23.0, 1.8, 0, 45);

        // Update environmental sensors
        sensors.temperature.current = this.simulateReading(22.5, 0.3, 18, 35);
        sensors.humidity.current = this.simulateReading(45, 2.0, 30, 70);

        // Update sensor data map
        this.sensorData.set('pressure_low', sensors.pressure.low.current);
        this.sensorData.set('pressure_medium', sensors.pressure.medium.current);
        this.sensorData.set('pressure_high', sensors.pressure.high.current);
        this.sensorData.set('flow_inlet', sensors.flow.inlet.current);
        this.sensorData.set('flow_outlet', sensors.flow.outlet.current);
        this.sensorData.set('temperature', sensors.temperature.current);
        this.sensorData.set('humidity', sensors.humidity.current);
    }

    simulateReading(baseValue, variance, min, max) {
        // Generate realistic fluctuations around base value
        const variation = (Math.random() - 0.5) * variance * 2;
        let newValue = baseValue + variation;
        
        // Ensure value stays within bounds
        newValue = Math.max(min, Math.min(max, newValue));
        
        return Math.round(newValue * 10) / 10; // Round to 1 decimal place
    }

    checkAlarms() {
        this.alarmThresholds.forEach((threshold, sensorKey) => {
            const currentValue = this.sensorData.get(sensorKey);
            if (currentValue !== undefined) {
                const isOutOfRange = currentValue < threshold.min || currentValue > threshold.max;
                
                if (isOutOfRange) {
                    this.triggerAlarm(sensorKey, currentValue, threshold);
                }
            }
        });
    }

    triggerAlarm(sensorKey, currentValue, threshold) {
        const alarm = {
            sensor: sensorKey,
            value: currentValue,
            threshold: threshold,
            timestamp: new Date().toISOString(),
            severity: this.getAlarmSeverity(currentValue, threshold)
        };

        console.warn(`🚨 Sensor alarm: ${sensorKey} = ${currentValue} (range: ${threshold.min}-${threshold.max})`);
        
        // Emit alarm event for other modules to handle
        if (window.deviceDataEnhanced) {
            window.deviceDataEnhanced.handleAlarm(alarm);
        }
    }

    getAlarmSeverity(value, threshold) {
        const range = threshold.max - threshold.min;
        const center = (threshold.max + threshold.min) / 2;
        const deviation = Math.abs(value - center);
        
        if (deviation > range) return 'CRITICAL';
        if (deviation > range * 0.7) return 'HIGH';
        if (deviation > range * 0.4) return 'MEDIUM';
        return 'LOW';
    }

    updateDisplay() {
        // Update sensor display panels
        Object.keys(this.sensorPanel).forEach(sensorType => {
            const sensor = this.sensorPanel[sensorType];
            
            if (sensor.pressure) {
                // Update pressure displays
                Object.keys(sensor).forEach(subType => {
                    this.updateSensorElement(`${sensorType}-${subType}`, sensor[subType]);
                });
            } else if (sensor.flow) {
                // Update flow displays
                Object.keys(sensor).forEach(flowType => {
                    this.updateSensorElement(`${sensorType}-${flowType}`, sensor[flowType]);
                });
            } else {
                // Update simple sensor display
                this.updateSensorElement(sensorType, sensor);
            }
        });
    }

    updateSensorElement(elementId, sensorData) {
        const element = document.getElementById(elementId);
        if (element) {
            const valueElement = element.querySelector('.sensor-value');
            const unitElement = element.querySelector('.sensor-unit');
            
            if (valueElement) {
                valueElement.textContent = sensorData.current.toFixed(1);
            }
            if (unitElement && sensorData.unit) {
                unitElement.textContent = sensorData.unit;
            }
            
            // Update alarm status
            const isInRange = sensorData.current >= (sensorData.min || 0) && 
                             sensorData.current <= (sensorData.max || Infinity);
            
            element.classList.toggle('alarm', !isInRange);
        }
    }

    // Monitoring control methods
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.updateInterval = setInterval(() => {
            this.updateSensorReadings();
            this.updateDisplay();
            this.checkAlarms();
        }, 1000); // Update every 1 second
        
        console.log('🔄 Sensor monitoring started - 1 second intervals');
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('⏹️ Sensor monitoring stopped');
    }

    // Public API methods
    getSensorData() {
        return this.sensorData;
    }

    getSensorPanel() {
        return this.sensorPanel;
    }

    isMonitoringActive() {
        return this.isMonitoring;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.SensorMonitoring = SensorMonitoring;
}
