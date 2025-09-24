/**
 * MASKSERVICE C20 - Vue.js Compatible Sensor Monitoring System
 * Replaces legacy DOM manipulation with Vue reactive sensor data
 * Post-migration integration layer for Vue components
 */

class VueSensorMonitoring {
    constructor() {
        this.sensorData = new Map();
        this.updateInterval = null;
        this.isMonitoring = false;
        this.vueComponents = new Set();
        
        // Vue reactive sensor data
        this.reactiveSensorData = Vue.reactive({
            pressure: {
                low: { min: 8, max: 12, unit: 'mbar', alarm: false, current: 10.0, status: 'normal' },
                medium: { min: 18, max: 22, unit: 'bar', alarm: false, current: 20.0, status: 'normal' },
                high: { min: 28, max: 32, unit: 'bar', alarm: false, current: 30.0, status: 'normal' }
            },
            flow: {
                inlet: { current: 25.0, unit: 'l/min', max: 50, min: 0, alarm: false, status: 'normal' },
                outlet: { current: 23.0, unit: 'l/min', max: 45, min: 0, alarm: false, status: 'normal' }
            },
            temperature: { current: 22.5, unit: '°C', min: 18, max: 35, alarm: false, status: 'normal' },
            humidity: { current: 45, unit: '%', min: 30, max: 70, alarm: false, status: 'normal' },
            lastUpdate: new Date().toISOString(),
            isActive: false
        });

        this.alarmThresholds = new Map();
        this.init();
    }

    init() {
        this.setupAlarmThresholds();
        this.initializeSensorData();
        console.log('🔧 Vue Sensor Monitoring initialized');
    }

    setupAlarmThresholds() {
        this.alarmThresholds.set('pressure_low', { min: 8, max: 12 });
        this.alarmThresholds.set('pressure_medium', { min: 18, max: 22 });
        this.alarmThresholds.set('pressure_high', { min: 28, max: 32 });
        this.alarmThresholds.set('flow_inlet', { min: 0, max: 50 });
        this.alarmThresholds.set('flow_outlet', { min: 0, max: 45 });
        this.alarmThresholds.set('temperature', { min: 18, max: 35 });
        this.alarmThresholds.set('humidity', { min: 30, max: 70 });
    }

    initializeSensorData() {
        // Initialize sensor data map from reactive data
        const sensors = this.reactiveSensorData;
        
        // Pressure sensors
        this.sensorData.set('pressure_low', sensors.pressure.low.current);
        this.sensorData.set('pressure_medium', sensors.pressure.medium.current);
        this.sensorData.set('pressure_high', sensors.pressure.high.current);
        
        // Flow sensors
        this.sensorData.set('flow_inlet', sensors.flow.inlet.current);
        this.sensorData.set('flow_outlet', sensors.flow.outlet.current);
        
        // Environmental sensors
        this.sensorData.set('temperature', sensors.temperature.current);
        this.sensorData.set('humidity', sensors.humidity.current);
    }

    /**
     * Start Vue-aware sensor monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) {
            console.log('🔄 Sensor monitoring already active');
            return;
        }
        
        this.isMonitoring = true;
        this.reactiveSensorData.isActive = true;
        
        this.updateInterval = setInterval(() => {
            this.updateSensorReadings();
            this.checkAlarms();
            this.updateReactiveData();
        }, 1000); // Update every second
        
        console.log('✅ Vue Sensor monitoring started - 1 second intervals');
        
        // Emit start event for Vue components
        this.emitSensorEvent('monitoringStarted', { timestamp: new Date().toISOString() });
    }

    /**
     * Stop sensor monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) {
            console.log('⏹️ Sensor monitoring already stopped');
            return;
        }
        
        this.isMonitoring = false;
        this.reactiveSensorData.isActive = false;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('⏹️ Vue Sensor monitoring stopped');
        
        // Emit stop event for Vue components
        this.emitSensorEvent('monitoringStopped', { timestamp: new Date().toISOString() });
    }

    /**
     * Update sensor readings with realistic simulation
     */
    updateSensorReadings() {
        const sensors = this.reactiveSensorData;

        // Update pressure sensors with realistic fluctuations
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

    /**
     * Simulate realistic sensor reading with variance
     */
    simulateReading(baseValue, variance, min, max) {
        const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
        const newValue = baseValue + (randomFactor * variance);
        return Math.max(min, Math.min(max, newValue));
    }

    /**
     * Check alarms and update sensor status
     */
    checkAlarms() {
        const sensors = this.reactiveSensorData;
        
        // Check pressure sensors
        this.checkSensorAlarm(sensors.pressure.low, 'pressure_low');
        this.checkSensorAlarm(sensors.pressure.medium, 'pressure_medium');
        this.checkSensorAlarm(sensors.pressure.high, 'pressure_high');
        
        // Check flow sensors
        this.checkSensorAlarm(sensors.flow.inlet, 'flow_inlet');
        this.checkSensorAlarm(sensors.flow.outlet, 'flow_outlet');
        
        // Check environmental sensors
        this.checkSensorAlarm(sensors.temperature, 'temperature');
        this.checkSensorAlarm(sensors.humidity, 'humidity');
    }

    /**
     * Check individual sensor alarm status
     */
    checkSensorAlarm(sensor, sensorKey) {
        const threshold = this.alarmThresholds.get(sensorKey);
        if (!threshold) return;
        
        const isOutOfRange = sensor.current < threshold.min || sensor.current > threshold.max;
        const wasInAlarm = sensor.alarm;
        
        sensor.alarm = isOutOfRange;
        sensor.status = isOutOfRange ? 'alarm' : 'normal';
        
        // Trigger alarm if state changed to alarm
        if (isOutOfRange && !wasInAlarm) {
            this.triggerAlarm(sensorKey, sensor.current, threshold);
        }
    }

    /**
     * Trigger alarm and emit events for Vue components
     */
    triggerAlarm(sensorKey, currentValue, threshold) {
        const alarm = {
            sensor: sensorKey,
            value: currentValue,
            threshold: threshold,
            timestamp: new Date().toISOString(),
            severity: this.getAlarmSeverity(currentValue, threshold)
        };

        console.warn(`🚨 Vue Sensor alarm: ${sensorKey} = ${currentValue.toFixed(2)} (range: ${threshold.min}-${threshold.max})`);
        
        // Emit alarm event for Vue components
        this.emitSensorEvent('sensorAlarm', alarm);
    }

    /**
     * Calculate alarm severity
     */
    getAlarmSeverity(value, threshold) {
        const range = threshold.max - threshold.min;
        const center = (threshold.max + threshold.min) / 2;
        const deviation = Math.abs(value - center);
        
        if (deviation > range) return 'CRITICAL';
        if (deviation > range * 0.7) return 'HIGH';
        if (deviation > range * 0.4) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * Update reactive data and timestamp
     */
    updateReactiveData() {
        this.reactiveSensorData.lastUpdate = new Date().toISOString();
        
        // Emit data update event for Vue components
        this.emitSensorEvent('dataUpdated', {
            timestamp: this.reactiveSensorData.lastUpdate,
            sensorData: this.reactiveSensorData
        });
    }

    /**
     * Emit sensor events for Vue components
     */
    emitSensorEvent(eventType, eventData) {
        const event = new CustomEvent(`sensor${eventType}`, {
            detail: eventData
        });
        
        document.dispatchEvent(event);
        
        // Also notify registered Vue components directly
        this.vueComponents.forEach(component => {
            if (component.onSensorEvent) {
                component.onSensorEvent(eventType, eventData);
            }
        });
    }

    /**
     * Register Vue component for sensor updates
     */
    registerVueComponent(component) {
        this.vueComponents.add(component);
        console.log(`📝 Vue component registered for sensor updates`);
    }

    /**
     * Unregister Vue component
     */
    unregisterVueComponent(component) {
        this.vueComponents.delete(component);
    }

    /**
     * Get reactive sensor data for Vue components
     */
    getReactiveSensorData() {
        return this.reactiveSensorData;
    }

    /**
     * Get current sensor readings
     */
    getSensorData() {
        return this.sensorData;
    }

    /**
     * Check if monitoring is active
     */
    isMonitoringActive() {
        return this.isMonitoring;
    }

    /**
     * Get sensor panel data (backward compatibility)
     */
    getSensorPanel() {
        return this.reactiveSensorData;
    }

    /**
     * Manual sensor data update (for testing)
     */
    setSensorValue(sensorPath, value) {
        const pathParts = sensorPath.split('.');
        let target = this.reactiveSensorData;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
            target = target[pathParts[i]];
        }
        
        if (target && target[pathParts[pathParts.length - 1]] !== undefined) {
            target[pathParts[pathParts.length - 1]].current = value;
            this.sensorData.set(sensorPath.replace('.', '_'), value);
            
            console.log(`🔧 Manual sensor update: ${sensorPath} = ${value}`);
            this.emitSensorEvent('manualUpdate', { sensor: sensorPath, value });
        }
    }

    /**
     * Create Vue sensor monitoring plugin
     */
    createVuePlugin() {
        const vueSensorMonitoring = this;
        
        return {
            install(app) {
                // Provide sensor monitoring instance to all components
                app.provide('$sensorMonitoring', vueSensorMonitoring);
                
                // Global properties for components
                app.config.globalProperties.$sensorData = Vue.computed(() => vueSensorMonitoring.reactiveSensorData);
                app.config.globalProperties.$isMonitoring = Vue.computed(() => vueSensorMonitoring.isMonitoring);
                
                console.log('✅ Vue Sensor Monitoring plugin installed');
            }
        };
    }
}

// Initialize global Vue Sensor Monitoring instance
const vueSensorMonitoring = new VueSensorMonitoring();

// Export to global scope with backward compatibility
window.VueSensorMonitoring = vueSensorMonitoring;
window.vueSensorMonitoring = vueSensorMonitoring;

// Replace legacy sensor monitoring with Vue-compatible version
window.SensorMonitoring = vueSensorMonitoring;
window.sensorMonitoring = vueSensorMonitoring;

console.log('✅ Vue Sensor Monitoring module loaded - Vue.js reactive sensor data enabled');
console.log('🔄 Legacy sensor monitoring replaced with Vue-compatible version');
