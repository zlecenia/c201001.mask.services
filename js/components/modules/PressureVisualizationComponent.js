/**
 * MASKTRONIC C20 - Pressure Visualization Component (Modular)
 * Extracted from DeviceDataTemplate.js for better maintainability
 * Handles real-time pressure charts and thresholds
 */

const PressureVisualizationComponent = {
    name: 'PressureVisualizationComponent',
    props: {
        sensorData: { type: Object, required: true },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['pressure-alarm'],
    
    setup(props, { emit }) {
        // Vue.js imports
        const { reactive, computed, onMounted, onUnmounted } = Vue;
        
        // Pressure Visualization State
        const pressureState = reactive({
            chartData: [],
            realTimeChart: null,
            chartUpdateInterval: null,
            showChart: true,
            chartTimeRange: '1h', // 1h, 6h, 24h, 7d
            pressureThresholds: {
                min: 950,
                max: 1050,
                warning: { min: 980, max: 1030 },
                critical: { min: 960, max: 1040 }
            },
            historicalData: []
        });
        
        // Pressure Visualization Methods
        const initializePressureChart = () => {
            console.log('📈 Initializing pressure visualization chart...');
            
            // Mock historical data generation
            const now = Date.now();
            const dataPoints = [];
            
            for (let i = 60; i >= 0; i--) {
                const timestamp = now - (i * 60 * 1000); // Last hour, minute by minute
                const basePressure = 1013.25;
                const variation = (Math.random() - 0.5) * 10; // ±5 hPa variation
                
                dataPoints.push({
                    timestamp,
                    pressure: Math.round((basePressure + variation) * 100) / 100,
                    quality: Math.random() > 0.9 ? 'warning' : 'good'
                });
            }
            
            pressureState.chartData = dataPoints;
            pressureState.historicalData = dataPoints;
            
            console.log(`📈 Pressure chart initialized with ${dataPoints.length} data points`);
            console.log('📈 Chart time range:', pressureState.chartTimeRange);
            console.log('📈 Pressure thresholds:', pressureState.pressureThresholds);
        };
        
        const updatePressureChart = () => {
            if (!pressureState.showChart) return;
            
            const now = Date.now();
            const currentPressure = props.sensorData.pressure || 1013.25;
            
            // Add new data point
            const newDataPoint = {
                timestamp: now,
                pressure: currentPressure,
                quality: checkPressureQuality(currentPressure)
            };
            
            pressureState.chartData.push(newDataPoint);
            pressureState.historicalData.push(newDataPoint);
            
            // Keep only data within time range
            const timeRangeMs = getTimeRangeMs(pressureState.chartTimeRange);
            const cutoffTime = now - timeRangeMs;
            
            pressureState.chartData = pressureState.chartData.filter(point => point.timestamp >= cutoffTime);
            
            console.log('📈 Pressure chart updated:', currentPressure, 'hPa');
            
            // Check for pressure alarms
            checkPressureAlarms(currentPressure);
        };
        
        const changePressureTimeRange = (range) => {
            console.log('📈 Changing pressure chart time range to:', range);
            pressureState.chartTimeRange = range;
            
            // Filter historical data for new time range
            const now = Date.now();
            const timeRangeMs = getTimeRangeMs(range);
            const cutoffTime = now - timeRangeMs;
            
            pressureState.chartData = pressureState.historicalData.filter(point => point.timestamp >= cutoffTime);
            
            console.log(`📈 Chart updated with ${pressureState.chartData.length} data points for ${range} range`);
        };
        
        const checkPressureAlarms = (currentPressure) => {
            const thresholds = pressureState.pressureThresholds;
            let alarmType = null;
            
            if (currentPressure <= thresholds.critical.min || currentPressure >= thresholds.critical.max) {
                alarmType = 'critical';
            } else if (currentPressure <= thresholds.warning.min || currentPressure >= thresholds.warning.max) {
                alarmType = 'warning';
            }
            
            if (alarmType) {
                emit('pressure-alarm', { type: alarmType, pressure: currentPressure, thresholds });
                console.log(`⚠️ Pressure alarm triggered: ${alarmType} (${currentPressure} hPa)`);
            }
        };
        
        // Helper methods
        const checkPressureQuality = (pressure) => {
            const thresholds = pressureState.pressureThresholds;
            if (pressure <= thresholds.warning.min || pressure >= thresholds.warning.max) {
                return 'warning';
            }
            return 'good';
        };
        
        const getTimeRangeMs = (range) => {
            const ranges = {
                '1h': 60 * 60 * 1000,
                '6h': 6 * 60 * 60 * 1000,
                '24h': 24 * 60 * 60 * 1000,
                '7d': 7 * 24 * 60 * 60 * 1000
            };
            return ranges[range] || ranges['1h'];
        };
        
        // Computed properties
        const currentPressure = computed(() => props.sensorData.pressure || 0);
        const pressureStatus = computed(() => checkPressureQuality(currentPressure.value));
        const chartDataPoints = computed(() => pressureState.chartData.length);
        
        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: PressureVisualizationComponent mounted');
            initializePressureChart();
            
            // Start real-time updates
            pressureState.chartUpdateInterval = setInterval(updatePressureChart, 5000); // Update every 5 seconds
        });
        
        onUnmounted(() => {
            console.log('🔶 Vue: PressureVisualizationComponent unmounted');
            if (pressureState.chartUpdateInterval) {
                clearInterval(pressureState.chartUpdateInterval);
            }
        });
        
        return {
            pressureState,
            currentPressure,
            pressureStatus,
            chartDataPoints,
            initializePressureChart,
            updatePressureChart,
            changePressureTimeRange,
            checkPressureAlarms
        };
    },
    
    template: `
        <div class="pressure-visualization">
            <div class="pressure-header">
                <h4>📈 Wizualizacja Ciśnienia</h4>
                <div class="pressure-controls">
                    <select v-model="pressureState.chartTimeRange" @change="changePressureTimeRange(pressureState.chartTimeRange)">
                        <option value="1h">1 godzina</option>
                        <option value="6h">6 godzin</option>
                        <option value="24h">24 godziny</option>
                        <option value="7d">7 dni</option>
                    </select>
                    <span class="data-points">{{ chartDataPoints }} punktów</span>
                </div>
            </div>
            
            <div class="pressure-chart-container">
                <div class="pressure-current">
                    <span class="pressure-label">Aktualne ciśnienie:</span>
                    <span class="pressure-value" :class="pressureStatus">{{ currentPressure.toFixed(2) }} hPa</span>
                </div>
                
                <div class="chart-placeholder">
                    <div class="chart-mock">
                        <div v-for="(point, index) in pressureState.chartData.slice(-20)" :key="index" 
                             class="chart-bar" 
                             :class="point.quality"
                             :style="{ height: ((point.pressure - 950) / 100 * 100) + '%' }">
                        </div>
                    </div>
                </div>
                
                <div class="pressure-thresholds">
                    <div class="threshold critical">Krytyczny: {{ pressureState.pressureThresholds.critical.min }}-{{ pressureState.pressureThresholds.critical.max }} hPa</div>
                    <div class="threshold warning">Ostrzeżenie: {{ pressureState.pressureThresholds.warning.min }}-{{ pressureState.pressureThresholds.warning.max }} hPa</div>
                </div>
            </div>
        </div>
    `,
    
    style: `
        .pressure-visualization {
            background: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .pressure-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        
        .pressure-controls {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .data-points {
            font-size: 0.9em;
            color: #666;
        }
        
        .pressure-current {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 16px;
        }
        
        .pressure-value {
            font-weight: 600;
            font-size: 1.2em;
        }
        
        .pressure-value.good { color: #28a745; }
        .pressure-value.warning { color: #ffc107; }
        .pressure-value.critical { color: #dc3545; }
        
        .chart-placeholder {
            height: 200px;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 12px;
            background: #fafafa;
            margin-bottom: 12px;
        }
        
        .chart-mock {
            display: flex;
            align-items: end;
            height: 100%;
            gap: 2px;
        }
        
        .chart-bar {
            flex: 1;
            background: #42b883;
            min-height: 10px;
            transition: all 0.3s;
        }
        
        .chart-bar.warning { background: #ffc107; }
        .chart-bar.critical { background: #dc3545; }
        
        .pressure-thresholds {
            display: flex;
            gap: 16px;
            font-size: 0.9em;
        }
        
        .threshold.critical { color: #dc3545; }
        .threshold.warning { color: #ffc107; }
    `
};

window.PressureVisualizationComponent = PressureVisualizationComponent;
console.log('📈 Vue PressureVisualizationComponent loaded');
