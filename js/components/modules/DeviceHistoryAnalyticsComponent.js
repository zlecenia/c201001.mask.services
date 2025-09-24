/**
 * MASKTRONIC C20 - Device History Analytics Component (Modular)
 * Extracted from DeviceDataTemplate.js for better maintainability
 * Handles device history, performance metrics, and analytics
 */

const DeviceHistoryAnalyticsComponent = {
    name: 'DeviceHistoryAnalyticsComponent',
    props: {
        deviceState: { type: Object, required: true },
        sensorData: { type: Object, required: true },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['export-complete'],
    
    setup(props, { emit }) {
        // Vue.js imports
        const { reactive, computed, onMounted, onUnmounted } = Vue;
        
        // Enhanced Device History Analytics State
        const historyState = reactive({
            performanceMetrics: [],
            uptimeHistory: [],
            maintenanceLog: [],
            analyticsData: {
                avgUptime: 0,
                totalDowntime: 0,
                performanceScore: 0,
                reliabilityIndex: 0,
                maintenanceFrequency: 0,
                lastMaintenanceDate: null,
                nextMaintenanceDate: null,
                batteryHealthTrend: [],
                sensorAccuracyTrend: []
            },
            historyFilters: {
                dateRange: '7d', // 1d, 7d, 30d, 90d, 1y
                dataType: 'all', // all, performance, maintenance, alarms, sensors
                groupBy: 'day' // hour, day, week, month
            },
            exportOptions: {
                format: 'json', // json, csv, pdf, xlsx
                includeCharts: true,
                includeRawData: false,
                dateFrom: null,
                dateTo: null,
                customFields: []
            }
        });
        
        // Enhanced Device History Analytics Methods
        const loadDeviceHistory = () => {
            console.log('📊 Loading device history analytics...');
            console.log('📊 Date range:', historyState.historyFilters.dateRange);
            console.log('📊 Data type filter:', historyState.historyFilters.dataType);
            
            // Generate mock performance metrics
            const now = Date.now();
            const days = parseInt(historyState.historyFilters.dateRange);
            const performanceData = [];
            const uptimeData = [];
            const maintenanceData = [];
            
            for (let i = days; i >= 0; i--) {
                const date = new Date(now - (i * 24 * 60 * 60 * 1000));
                
                // Performance metrics
                performanceData.push({
                    date: date.toISOString(),
                    cpuUsage: Math.random() * 30 + 20, // 20-50%
                    memoryUsage: Math.random() * 40 + 30, // 30-70%
                    diskUsage: Math.random() * 20 + 60, // 60-80%
                    networkLatency: Math.random() * 50 + 10, // 10-60ms
                    responseTime: Math.random() * 200 + 100, // 100-300ms
                    throughput: Math.random() * 1000 + 500, // 500-1500 req/s
                    errorRate: Math.random() * 2 // 0-2%
                });
                
                // Uptime data
                const isUp = Math.random() > 0.05; // 95% uptime simulation
                uptimeData.push({
                    date: date.toISOString(),
                    isOnline: isUp,
                    uptime: isUp ? 100 : 0,
                    downtime: isUp ? 0 : Math.random() * 60, // minutes
                    restartCount: isUp ? 0 : Math.floor(Math.random() * 3)
                });
                
                // Maintenance log (random maintenance every ~15 days)
                if (Math.random() > 0.93) {
                    maintenanceData.push({
                        date: date.toISOString(),
                        type: ['preventive', 'corrective', 'upgrade'][Math.floor(Math.random() * 3)],
                        duration: Math.random() * 120 + 30, // 30-150 minutes
                        technician: ['Jan Kowalski', 'Anna Nowak', 'Piotr Wiśniewski'][Math.floor(Math.random() * 3)],
                        description: 'Routine maintenance and system checks',
                        partsReplaced: Math.random() > 0.7 ? ['sensor calibration', 'filter replacement'] : []
                    });
                }
            }
            
            historyState.performanceMetrics = performanceData;
            historyState.uptimeHistory = uptimeData;
            historyState.maintenanceLog = maintenanceData;
            
            // Calculate analytics
            calculateDeviceAnalytics();
            
            console.log(`📊 Loaded ${performanceData.length} performance metrics`);
            console.log(`📊 Loaded ${uptimeData.length} uptime records`);
            console.log(`📊 Loaded ${maintenanceData.length} maintenance records`);
        };
        
        const calculateDeviceAnalytics = () => {
            console.log('🧮 Calculating device analytics...');
            
            const analytics = historyState.analyticsData;
            const performance = historyState.performanceMetrics;
            const uptime = historyState.uptimeHistory;
            const maintenance = historyState.maintenanceLog;
            
            if (performance.length > 0) {
                // Average uptime calculation
                const totalUptime = uptime.reduce((sum, record) => sum + record.uptime, 0);
                analytics.avgUptime = Math.round((totalUptime / uptime.length) * 100) / 100;
                
                // Total downtime calculation
                const totalDowntime = uptime.reduce((sum, record) => sum + record.downtime, 0);
                analytics.totalDowntime = Math.round(totalDowntime * 100) / 100;
                
                // Performance score (weighted average of key metrics)
                const avgCpu = performance.reduce((sum, p) => sum + p.cpuUsage, 0) / performance.length;
                const avgMemory = performance.reduce((sum, p) => sum + p.memoryUsage, 0) / performance.length;
                const avgLatency = performance.reduce((sum, p) => sum + p.networkLatency, 0) / performance.length;
                const avgErrorRate = performance.reduce((sum, p) => sum + p.errorRate, 0) / performance.length;
                
                // Performance score formula (0-100, higher is better)
                analytics.performanceScore = Math.round(
                    (100 - avgCpu) * 0.3 + 
                    (100 - avgMemory) * 0.3 + 
                    (100 - avgLatency) * 0.2 + 
                    (100 - avgErrorRate * 50) * 0.2
                );
                
                // Reliability index (based on uptime and error rate)
                analytics.reliabilityIndex = Math.round(
                    (analytics.avgUptime * 0.7 + (100 - avgErrorRate * 50) * 0.3) * 100
                ) / 100;
                
                // Maintenance frequency (maintenance events per 30 days)
                const daysCovered = performance.length;
                analytics.maintenanceFrequency = Math.round(
                    (maintenance.length / daysCovered * 30) * 100
                ) / 100;
                
                // Last and next maintenance dates
                if (maintenance.length > 0) {
                    const sortedMaintenance = [...maintenance].sort((a, b) => new Date(b.date) - new Date(a.date));
                    analytics.lastMaintenanceDate = sortedMaintenance[0].date;
                    
                    // Predict next maintenance (assume 30-day cycle)
                    const lastDate = new Date(analytics.lastMaintenanceDate);
                    const nextDate = new Date(lastDate.getTime() + (30 * 24 * 60 * 60 * 1000));
                    analytics.nextMaintenanceDate = nextDate.toISOString();
                }
                
                // Battery health trend (simulated)
                analytics.batteryHealthTrend = performance.slice(-7).map((p, index) => ({
                    date: p.date,
                    health: Math.max(70, 100 - (index * 2) - Math.random() * 5) // Gradual decline simulation
                }));
                
                // Sensor accuracy trend (simulated)
                analytics.sensorAccuracyTrend = performance.slice(-7).map((p, index) => ({
                    date: p.date,
                    accuracy: Math.min(100, 95 + Math.random() * 5 - (index * 0.5)) // High accuracy with slight drift
                }));
            }
            
            console.log('🧮 Analytics calculated:', analytics);
        };
        
        const changeHistoryDateRange = (range) => {
            console.log('📅 Changing history date range to:', range);
            historyState.historyFilters.dateRange = range;
            loadDeviceHistory(); // Reload data for new range
        };
        
        const exportDeviceHistory = (format) => {
            console.log('📤 Exporting device history in format:', format);
            
            const exportData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    dateRange: historyState.historyFilters.dateRange,
                    dataType: historyState.historyFilters.dataType,
                    deviceId: props.deviceState.deviceId,
                    format: format
                },
                analytics: historyState.analyticsData,
                performanceMetrics: historyState.performanceMetrics,
                uptimeHistory: historyState.uptimeHistory,
                maintenanceLog: historyState.maintenanceLog
            };
            
            // Simulate export process
            const exportSize = JSON.stringify(exportData).length;
            const fileName = `device_history_${props.deviceState.deviceId}_${Date.now()}.${format}`;
            
            console.log(`📤 Export completed: ${fileName}`);
            console.log(`📤 Export size: ${Math.round(exportSize / 1024)} KB`);
            console.log(`📤 Records exported: ${historyState.performanceMetrics.length} performance, ${historyState.uptimeHistory.length} uptime, ${historyState.maintenanceLog.length} maintenance`);
            
            // In real implementation, would trigger actual file download
            console.log('💾 Download would start for:', fileName);
            
            emit('export-complete', { fileName, format, size: exportSize, data: exportData });
            
            return exportData;
        };
        
        // Computed properties
        const analyticsScore = computed(() => historyState.analyticsData.performanceScore);
        const reliabilityScore = computed(() => historyState.analyticsData.reliabilityIndex);
        const uptimePercentage = computed(() => historyState.analyticsData.avgUptime);
        const maintenanceCount = computed(() => historyState.maintenanceLog.length);
        
        const performanceTrend = computed(() => {
            const recent = historyState.performanceMetrics.slice(-7);
            if (recent.length < 2) return 'stable';
            
            const firstScore = recent[0].cpuUsage + recent[0].memoryUsage;
            const lastScore = recent[recent.length - 1].cpuUsage + recent[recent.length - 1].memoryUsage;
            
            if (lastScore < firstScore - 5) return 'improving';
            if (lastScore > firstScore + 5) return 'declining';
            return 'stable';
        });
        
        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: DeviceHistoryAnalyticsComponent mounted');
            loadDeviceHistory();
        });
        
        onUnmounted(() => {
            console.log('🔶 Vue: DeviceHistoryAnalyticsComponent unmounted');
        });
        
        return {
            historyState,
            analyticsScore,
            reliabilityScore,
            uptimePercentage,
            maintenanceCount,
            performanceTrend,
            loadDeviceHistory,
            calculateDeviceAnalytics,
            changeHistoryDateRange,
            exportDeviceHistory
        };
    },
    
    template: `
        <div class="device-history-analytics">
            <div class="analytics-header">
                <h4>📊 Analityka Historii Urządzenia</h4>
                <div class="history-controls">
                    <select v-model="historyState.historyFilters.dateRange" 
                            @change="changeHistoryDateRange(historyState.historyFilters.dateRange)">
                        <option value="1">1 dzień</option>
                        <option value="7">7 dni</option>
                        <option value="30">30 dni</option>
                        <option value="90">90 dni</option>
                        <option value="365">1 rok</option>
                    </select>
                    
                    <select v-model="historyState.historyFilters.dataType">
                        <option value="all">Wszystkie dane</option>
                        <option value="performance">Wydajność</option>
                        <option value="maintenance">Konserwacja</option>
                        <option value="alarms">Alarmy</option>
                        <option value="sensors">Sensory</option>
                    </select>
                </div>
            </div>
            
            <div class="analytics-dashboard">
                <div class="metrics-grid">
                    <div class="metric-card performance">
                        <div class="metric-header">
                            <span class="metric-icon">⚡</span>
                            <span class="metric-title">Wydajność</span>
                        </div>
                        <div class="metric-value">{{ analyticsScore }}/100</div>
                        <div class="metric-trend" :class="performanceTrend">
                            {{ performanceTrend === 'improving' ? '📈 Poprawa' : 
                               performanceTrend === 'declining' ? '📉 Spadek' : '➡️ Stabilny' }}
                        </div>
                    </div>
                    
                    <div class="metric-card reliability">
                        <div class="metric-header">
                            <span class="metric-icon">🛡️</span>
                            <span class="metric-title">Niezawodność</span>
                        </div>
                        <div class="metric-value">{{ reliabilityScore.toFixed(1) }}%</div>
                        <div class="metric-subtitle">Indeks niezawodności</div>
                    </div>
                    
                    <div class="metric-card uptime">
                        <div class="metric-header">
                            <span class="metric-icon">⏰</span>
                            <span class="metric-title">Dostępność</span>
                        </div>
                        <div class="metric-value">{{ uptimePercentage.toFixed(1) }}%</div>
                        <div class="metric-subtitle">Średni uptime</div>
                    </div>
                    
                    <div class="metric-card maintenance">
                        <div class="metric-header">
                            <span class="metric-icon">🔧</span>
                            <span class="metric-title">Konserwacja</span>
                        </div>
                        <div class="metric-value">{{ maintenanceCount }}</div>
                        <div class="metric-subtitle">Interwencji w okresie</div>
                    </div>
                </div>
                
                <div class="analytics-details">
                    <div class="detail-section">
                        <h5>📈 Trend Wydajności</h5>
                        <div class="trend-chart">
                            <div v-for="(metric, index) in historyState.performanceMetrics.slice(-7)" 
                                 :key="index" 
                                 class="trend-bar"
                                 :style="{ height: (metric.cpuUsage + metric.memoryUsage) / 2 + '%' }">
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>🔧 Historia Konserwacji</h5>
                        <div class="maintenance-list">
                            <div v-if="historyState.maintenanceLog.length === 0" class="no-maintenance">
                                Brak zapisów konserwacji w tym okresie
                            </div>
                            <div v-for="maintenance in historyState.maintenanceLog.slice(-3)" 
                                 :key="maintenance.date" 
                                 class="maintenance-item">
                                <div class="maintenance-date">
                                    {{ new Date(maintenance.date).toLocaleDateString() }}
                                </div>
                                <div class="maintenance-info">
                                    <span class="maintenance-type">{{ maintenance.type }}</span>
                                    <span class="maintenance-duration">{{ maintenance.duration }}min</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="export-section">
                    <h5>📤 Eksport Danych</h5>
                    <div class="export-controls">
                        <select v-model="historyState.exportOptions.format">
                            <option value="json">JSON</option>
                            <option value="csv">CSV</option>
                            <option value="pdf">PDF</option>
                            <option value="xlsx">Excel</option>
                        </select>
                        
                        <label class="export-option">
                            <input type="checkbox" v-model="historyState.exportOptions.includeCharts">
                            Dołącz wykresy
                        </label>
                        
                        <label class="export-option">
                            <input type="checkbox" v-model="historyState.exportOptions.includeRawData">
                            Surowe dane
                        </label>
                        
                        <button @click="exportDeviceHistory(historyState.exportOptions.format)" 
                                class="export-btn">
                            📤 Eksportuj
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    style: `
        .device-history-analytics {
            background: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .analytics-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .history-controls {
            display: flex;
            gap: 12px;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        
        .metric-card {
            padding: 16px;
            border-radius: 8px;
            border: 2px solid #e9ecef;
        }
        
        .metric-card.performance { border-color: #17a2b8; background: #e1f5fe; }
        .metric-card.reliability { border-color: #28a745; background: #f0fff4; }
        .metric-card.uptime { border-color: #ffc107; background: #fff8e1; }
        .metric-card.maintenance { border-color: #6f42c1; background: #f3e5f5; }
        
        .metric-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }
        
        .metric-icon {
            font-size: 1.2em;
        }
        
        .metric-title {
            font-weight: 600;
            font-size: 0.9em;
        }
        
        .metric-value {
            font-size: 1.8em;
            font-weight: 700;
            margin-bottom: 4px;
        }
        
        .metric-subtitle, .metric-trend {
            font-size: 0.8em;
            color: #666;
        }
        
        .metric-trend.improving { color: #28a745; }
        .metric-trend.declining { color: #dc3545; }
        .metric-trend.stable { color: #6c757d; }
        
        .analytics-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
        }
        
        .detail-section h5 {
            margin: 0 0 12px 0;
            color: #333;
        }
        
        .trend-chart {
            display: flex;
            align-items: end;
            height: 100px;
            gap: 4px;
            background: #f8f9fa;
            padding: 8px;
            border-radius: 4px;
        }
        
        .trend-bar {
            flex: 1;
            background: #17a2b8;
            min-height: 10px;
            border-radius: 2px;
        }
        
        .maintenance-list {
            max-height: 120px;
            overflow-y: auto;
        }
        
        .no-maintenance {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
        }
        
        .maintenance-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .maintenance-date {
            font-weight: 600;
            font-size: 0.9em;
        }
        
        .maintenance-info {
            display: flex;
            flex-direction: column;
            align-items: end;
            gap: 2px;
        }
        
        .maintenance-type {
            text-transform: capitalize;
            font-size: 0.8em;
            color: #666;
        }
        
        .maintenance-duration {
            font-size: 0.8em;
            color: #6f42c1;
        }
        
        .export-section {
            border-top: 1px solid #e9ecef;
            padding-top: 16px;
        }
        
        .export-section h5 {
            margin: 0 0 12px 0;
        }
        
        .export-controls {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        
        .export-option {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.9em;
        }
        
        .export-btn {
            padding: 8px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
        }
        
        .export-btn:hover {
            background: #0056b3;
        }
    `
};

window.DeviceHistoryAnalyticsComponent = DeviceHistoryAnalyticsComponent;
console.log('📊 Vue DeviceHistoryAnalyticsComponent loaded');
