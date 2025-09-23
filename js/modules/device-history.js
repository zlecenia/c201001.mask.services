/**
 * MASKSERVICE C20 - Device History Module
 * Device history tracking and predictive maintenance
 */

class DeviceHistory {
    constructor() {
        this.deviceHistory = new Map();
        this.maintenanceSchedule = new Map();
        this.init();
    }

    init() {
        this.loadDeviceHistory();
        this.setupMaintenanceSchedule();
    }

    loadDeviceHistory() {
        // Simulate loading device history from storage/server
        const mockHistory = [
            {
                id: 'device_001',
                name: 'MASKSERVICE C20 1001',
                type: 'Respiratory Protection Tester',
                lastMaintenance: '2024-01-15',
                nextMaintenance: '2024-04-15',
                totalTests: 1247,
                operatingHours: 3856,
                calibrationDate: '2024-01-10',
                calibrationDue: '2024-07-10',
                status: 'OPERATIONAL',
                alerts: []
            }
        ];

        mockHistory.forEach(device => {
            this.deviceHistory.set(device.id, device);
        });

        console.log('📊 Device history loaded:', this.deviceHistory.size, 'devices');
    }

    setupMaintenanceSchedule() {
        // Setup predictive maintenance based on operating hours and test count
        this.deviceHistory.forEach((device, deviceId) => {
            const schedule = this.calculateMaintenanceSchedule(device);
            this.maintenanceSchedule.set(deviceId, schedule);
        });
    }

    calculateMaintenanceSchedule(device) {
        const schedule = {
            routine: this.getNextMaintenanceDate(device.lastMaintenance, 90), // Every 3 months
            calibration: this.getNextMaintenanceDate(device.calibrationDate, 180), // Every 6 months
            deepInspection: this.getNextMaintenanceDate(device.lastMaintenance, 365), // Yearly
            predictive: this.calculatePredictiveMaintenance(device)
        };

        return schedule;
    }

    getNextMaintenanceDate(lastDate, daysInterval) {
        const last = new Date(lastDate);
        const next = new Date(last.getTime() + (daysInterval * 24 * 60 * 60 * 1000));
        return next.toISOString().split('T')[0];
    }

    calculatePredictiveMaintenance(device) {
        const predictions = [];

        // Predict based on operating hours
        if (device.operatingHours > 3500) {
            predictions.push({
                type: 'WEAR_WARNING',
                component: 'Pressure sensors',
                priority: 'MEDIUM',
                estimatedDate: this.addDaysToDate(new Date(), 30),
                reason: 'High operating hours detected'
            });
        }

        // Predict based on test count
        if (device.totalTests > 1200) {
            predictions.push({
                type: 'CALIBRATION_DRIFT',
                component: 'Flow sensors',
                priority: 'LOW',
                estimatedDate: this.addDaysToDate(new Date(), 45),
                reason: 'High test count may affect calibration'
            });
        }

        return predictions;
    }

    addDaysToDate(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result.toISOString().split('T')[0];
    }

    // Record new test
    recordTest(deviceId, testData) {
        const device = this.deviceHistory.get(deviceId);
        if (!device) return false;

        // Update counters
        device.totalTests += 1;
        device.operatingHours += (testData.duration || 0.1); // Default 0.1 hours per test

        // Add to test log
        if (!device.testLog) device.testLog = [];
        
        device.testLog.push({
            timestamp: new Date().toISOString(),
            type: testData.type,
            duration: testData.duration,
            result: testData.result,
            operator: testData.operator
        });

        // Keep only last 100 tests
        if (device.testLog.length > 100) {
            device.testLog = device.testLog.slice(-100);
        }

        // Update maintenance predictions
        const newSchedule = this.calculateMaintenanceSchedule(device);
        this.maintenanceSchedule.set(deviceId, newSchedule);

        // Save changes
        this.saveDeviceHistory();

        console.log(`📝 Test recorded for device ${deviceId}: Total tests: ${device.totalTests}`);
        return true;
    }

    // Get device status
    getDeviceStatus(deviceId) {
        const device = this.deviceHistory.get(deviceId);
        if (!device) return null;

        const schedule = this.maintenanceSchedule.get(deviceId);
        const today = new Date().toISOString().split('T')[0];

        return {
            device: device,
            maintenance: schedule,
            alerts: this.checkMaintenanceAlerts(device, schedule, today),
            utilization: this.calculateUtilization(device),
            health: this.calculateDeviceHealth(device)
        };
    }

    checkMaintenanceAlerts(device, schedule, today) {
        const alerts = [];

        // Check overdue maintenance
        if (schedule.routine < today) {
            alerts.push({
                type: 'OVERDUE_MAINTENANCE',
                severity: 'HIGH',
                message: 'Routine maintenance overdue',
                dueDate: schedule.routine
            });
        }

        // Check calibration due
        if (schedule.calibration < today) {
            alerts.push({
                type: 'CALIBRATION_DUE',
                severity: 'CRITICAL',
                message: 'Device calibration overdue',
                dueDate: schedule.calibration
            });
        }

        // Check predictive alerts
        schedule.predictive.forEach(prediction => {
            if (prediction.estimatedDate <= this.addDaysToDate(new Date(), 7)) {
                alerts.push({
                    type: prediction.type,
                    severity: prediction.priority,
                    message: prediction.reason,
                    component: prediction.component,
                    estimatedDate: prediction.estimatedDate
                });
            }
        });

        return alerts;
    }

    calculateUtilization(device) {
        const hoursPerDay = device.operatingHours / 365; // Assuming 1 year operation
        const testsPerDay = device.totalTests / 365;

        return {
            dailyHours: Math.round(hoursPerDay * 100) / 100,
            dailyTests: Math.round(testsPerDay * 100) / 100,
            efficiency: this.calculateEfficiency(device),
            usage: hoursPerDay > 6 ? 'HIGH' : hoursPerDay > 3 ? 'MEDIUM' : 'LOW'
        };
    }

    calculateEfficiency(device) {
        // Calculate based on tests per hour
        const testsPerHour = device.totalTests / device.operatingHours;
        
        if (testsPerHour > 2) return 'EXCELLENT';
        if (testsPerHour > 1.5) return 'GOOD';
        if (testsPerHour > 1) return 'AVERAGE';
        return 'BELOW_AVERAGE';
    }

    calculateDeviceHealth(device) {
        let score = 100;

        // Deduct points for high usage
        if (device.operatingHours > 4000) score -= 20;
        else if (device.operatingHours > 3000) score -= 10;

        // Deduct points for high test count
        if (device.totalTests > 1500) score -= 15;
        else if (device.totalTests > 1000) score -= 5;

        // Deduct points for overdue maintenance
        const today = new Date().toISOString().split('T')[0];
        const schedule = this.maintenanceSchedule.get(device.id);
        
        if (schedule) {
            if (schedule.calibration < today) score -= 30;
            if (schedule.routine < today) score -= 20;
        }

        // Add points for recent maintenance
        const lastMaintenance = new Date(device.lastMaintenance);
        const daysSinceLastMaintenance = (Date.now() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastMaintenance < 30) score += 10;

        return {
            score: Math.max(0, Math.min(100, score)),
            status: score > 80 ? 'EXCELLENT' : score > 60 ? 'GOOD' : score > 40 ? 'FAIR' : 'POOR',
            recommendations: this.generateRecommendations(device, score)
        };
    }

    generateRecommendations(device, healthScore) {
        const recommendations = [];

        if (healthScore < 60) {
            recommendations.push('Schedule immediate maintenance inspection');
        }

        if (device.operatingHours > 3500) {
            recommendations.push('Monitor sensor accuracy more frequently');
        }

        if (device.totalTests > 1200) {
            recommendations.push('Consider calibration verification');
        }

        const today = new Date().toISOString().split('T')[0];
        const schedule = this.maintenanceSchedule.get(device.id);
        
        if (schedule && schedule.routine < today) {
            recommendations.push('Perform overdue routine maintenance');
        }

        return recommendations;
    }

    saveDeviceHistory() {
        // In real implementation, save to localStorage or server
        try {
            const historyData = {};
            this.deviceHistory.forEach((device, id) => {
                historyData[id] = device;
            });
            
            localStorage.setItem('maskservice_device_history', JSON.stringify(historyData));
            console.log('💾 Device history saved to local storage');
        } catch (error) {
            console.error('❌ Failed to save device history:', error);
        }
    }

    // Export history data for reports
    exportHistory(deviceId = null) {
        if (deviceId) {
            const device = this.deviceHistory.get(deviceId);
            const schedule = this.maintenanceSchedule.get(deviceId);
            return { device, schedule };
        }

        // Export all data
        const allData = {};
        this.deviceHistory.forEach((device, id) => {
            allData[id] = {
                device: device,
                schedule: this.maintenanceSchedule.get(id)
            };
        });

        return allData;
    }

    // Public API methods
    getDeviceHistory() {
        return this.deviceHistory;
    }

    getMaintenanceSchedule() {
        return this.maintenanceSchedule;
    }

    getAllDeviceStatuses() {
        const statuses = {};
        this.deviceHistory.forEach((device, id) => {
            statuses[id] = this.getDeviceStatus(id);
        });
        return statuses;
    }

    recordDeviceTest(deviceId, testData) {
        return this.recordTest(deviceId, testData);
    }

    getDeviceAlerts(deviceId) {
        const status = this.getDeviceStatus(deviceId);
        return status ? status.alerts : [];
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.DeviceHistory = DeviceHistory;
}
