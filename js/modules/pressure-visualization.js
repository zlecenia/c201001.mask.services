/**
 * MASKSERVICE C20 - Pressure Visualization Module
 * Real-time pressure charts and data visualization
 */

class PressureVisualization {
    constructor() {
        this.pressureHistory = {
            low: [],
            medium: [],
            high: []
        };
        this.init();
    }

    init() {
        this.initializePressureCharts();
    }

    // Initialize pressure charts
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

    updatePressureCharts(sensorPanel) {
        if (!sensorPanel || !sensorPanel.pressure) return;

        // Get current pressure values
        const currentPressures = {
            low: sensorPanel.pressure.low.current,
            medium: sensorPanel.pressure.medium.current,
            high: sensorPanel.pressure.high.current
        };

        // Update history arrays (shift left and add new value)
        Object.keys(currentPressures).forEach(type => {
            if (this.pressureHistory[type]) {
                this.pressureHistory[type].shift(); // Remove oldest value
                this.pressureHistory[type].push(currentPressures[type]); // Add new value
                this.renderPressureChart(type);
            }
        });
    }

    renderPressureChart(type) {
        const chartContainer = document.querySelector(`#pressure-${type}-dia .pressure-chart-container`);
        if (!chartContainer) return;

        const data = this.pressureHistory[type];
        if (!data || data.length === 0) return;

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

        // Add value tooltip on hover
        this.addChartInteractivity(chartContainer, type);
    }

    getPressureColor(type, value) {
        // Define pressure ranges for each type
        const ranges = {
            low: { min: 8, max: 12 },
            medium: { min: 18, max: 22 },
            high: { min: 28, max: 32 }
        };

        const range = ranges[type];
        if (!range) return '#fbbf24'; // Default yellow
        
        // Color based on pressure ranges
        if (value < range.min) {
            return '#ef4444'; // Red for low values
        } else if (value > range.max) {
            return '#f97316'; // Orange for high values
        } else {
            return '#22c55e'; // Green for normal range
        }
    }

    addChartInteractivity(chartContainer, type) {
        // Add hover effects and tooltips
        const lines = chartContainer.querySelectorAll('.pressure-chart-line');
        
        lines.forEach((line, index) => {
            line.addEventListener('mouseenter', (e) => {
                this.showTooltip(e, type, this.pressureHistory[type][index], index);
            });
            
            line.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(event, type, value, index) {
        // Remove existing tooltip
        this.hideTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'pressure-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">${type.toUpperCase()} Pressure</div>
            <div class="tooltip-value">${value.toFixed(1)} ${this.getUnit(type)}</div>
            <div class="tooltip-time">${60 - index}s ago</div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 5}px`;
        tooltip.style.zIndex = '1000';
    }

    hideTooltip() {
        const existingTooltip = document.querySelector('.pressure-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
    }

    getUnit(type) {
        const units = {
            low: 'mbar',
            medium: 'bar',
            high: 'bar'
        };
        return units[type] || 'bar';
    }

    // Export chart data for reports
    exportChartData(type) {
        if (!this.pressureHistory[type]) return null;
        
        return {
            type: type,
            data: this.pressureHistory[type].slice(), // Copy array
            timestamps: this.generateTimestamps(),
            unit: this.getUnit(type),
            range: this.getPressureRange(type)
        };
    }

    generateTimestamps() {
        const now = new Date();
        const timestamps = [];
        
        for (let i = 59; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - (i * 1000));
            timestamps.push(timestamp.toISOString());
        }
        
        return timestamps;
    }

    getPressureRange(type) {
        const ranges = {
            low: { min: 8, max: 12 },
            medium: { min: 18, max: 22 },
            high: { min: 28, max: 32 }
        };
        return ranges[type] || { min: 0, max: 100 };
    }

    // Reset charts
    resetCharts() {
        Object.keys(this.pressureHistory).forEach(type => {
            this.pressureHistory[type] = new Array(60).fill(0);
            this.renderPressureChart(type);
        });
    }

    // Get current chart statistics
    getChartStatistics() {
        const stats = {};
        
        Object.keys(this.pressureHistory).forEach(type => {
            const data = this.pressureHistory[type];
            if (data && data.length > 0) {
                const validData = data.filter(val => val > 0);
                
                stats[type] = {
                    current: data[data.length - 1],
                    average: validData.reduce((a, b) => a + b, 0) / validData.length || 0,
                    min: Math.min(...validData) || 0,
                    max: Math.max(...validData) || 0,
                    unit: this.getUnit(type)
                };
            }
        });
        
        return stats;
    }

    // Public API methods
    updateCharts(sensorPanel) {
        this.updatePressureCharts(sensorPanel);
    }

    getHistory() {
        return this.pressureHistory;
    }

    getStatistics() {
        return this.getChartStatistics();
    }

    reset() {
        this.resetCharts();
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PressureVisualization = PressureVisualization;
}
