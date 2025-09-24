/**
 * MASKSERVICE C20 - Vue.js Reports View Template Component
 * Replaces vanilla reports-view-template.html
 * Advanced reporting with filters and data visualization
 */

const { ref, reactive, computed, onMounted } = Vue;

const ReportsViewTemplate = {
    name: 'ReportsViewTemplate',
    props: {
        user: {
            type: Object,
            default: () => ({ username: null, role: null, isAuthenticated: false })
        },
        language: {
            type: String,
            default: 'pl'
        }
    },
    
    emits: ['navigate', 'report-generated'],
    
    setup(props, { emit }) {
        // Reactive state
        const reportState = reactive({
            isGenerating: false,
            hasResults: false,
            currentReport: null,
            exportFormat: 'pdf'
        });

        const filters = reactive({
            dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dateTo: new Date().toISOString().split('T')[0],
            deviceType: 'all',
            testStatus: 'all',
            operator: 'all'
        });

        const reportData = reactive({
            summary: {
                totalTests: 247,
                passedTests: 231,
                failedTests: 16,
                successRate: 93.5
            },
            deviceBreakdown: [
                { type: 'PP_MASK', count: 89, passed: 84, failed: 5 },
                { type: 'NP_MASK', count: 67, passed: 65, failed: 2 },
                { type: 'SCBA', count: 45, passed: 41, failed: 4 },
                { type: 'CPS', count: 46, passed: 41, failed: 5 }
            ],
            recentTests: []
        });

        // Computed properties
        const pageTitle = computed(() => {
            const titleMap = {
                pl: 'Przeglądanie Raportów',
                en: 'Reports View',
                de: 'Berichte Ansicht'
            };
            return titleMap[props.language] || 'Przeglądanie Raportów';
        });

        const deviceOptions = computed(() => [
            { value: 'all', label: props.language === 'pl' ? 'Wszystkie typy' : 'All Types' },
            { value: 'PP_MASK', label: props.language === 'pl' ? 'Maska PP' : 'PP Mask' },
            { value: 'NP_MASK', label: props.language === 'pl' ? 'Maska NP' : 'NP Mask' },
            { value: 'SCBA', label: 'SCBA' },
            { value: 'CPS', label: props.language === 'pl' ? 'Kombinezon CPS' : 'CPS Protection Suit' }
        ]);

        const filteredReportData = computed(() => {
            if (!reportState.hasResults) return reportData;
            
            // Apply filters to report data
            let filtered = { ...reportData };
            
            if (filters.deviceType !== 'all') {
                filtered.deviceBreakdown = filtered.deviceBreakdown.filter(
                    d => d.type === filters.deviceType
                );
            }
            
            return filtered;
        });

        // Methods
        const generateReport = async () => {
            console.log('🔶 Vue: Generating report with filters:', filters);
            reportState.isGenerating = true;
            
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Generate mock data based on filters
                const mockData = generateMockReportData();
                Object.assign(reportData, mockData);
                
                reportState.hasResults = true;
                reportState.currentReport = {
                    generatedAt: new Date(),
                    filters: { ...filters },
                    user: props.user.username
                };
                
                emit('report-generated', reportState.currentReport);
                console.log('✅ Vue: Report generated successfully');
                
            } catch (error) {
                console.error('❌ Vue: Report generation failed:', error);
                alert('Błąd podczas generowania raportu');
            } finally {
                reportState.isGenerating = false;
            }
        };

        const generateMockReportData = () => {
            const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
            
            const totalTests = random(200, 300);
            const failedTests = random(10, 30);
            const passedTests = totalTests - failedTests;
            
            return {
                summary: {
                    totalTests,
                    passedTests,
                    failedTests,
                    successRate: Math.round((passedTests / totalTests) * 100 * 10) / 10
                },
                deviceBreakdown: [
                    { type: 'PP_MASK', count: random(60, 100), passed: random(55, 95), failed: random(2, 8) },
                    { type: 'NP_MASK', count: random(50, 80), passed: random(48, 78), failed: random(1, 5) },
                    { type: 'SCBA', count: random(30, 60), passed: random(28, 56), failed: random(2, 6) },
                    { type: 'CPS', count: random(40, 70), passed: random(38, 66), failed: random(2, 7) }
                ],
                recentTests: generateRecentTests()
            };
        };

        const generateRecentTests = () => {
            const tests = [];
            const devices = ['PP_MASK', 'NP_MASK', 'SCBA', 'CPS'];
            const operators = ['Jan Kowalski', 'Anna Nowak', 'Piotr Wiśniewski'];
            
            for (let i = 0; i < 20; i++) {
                tests.push({
                    id: `TEST_${Date.now()}_${i}`,
                    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    device: devices[Math.floor(Math.random() * devices.length)],
                    operator: operators[Math.floor(Math.random() * operators.length)],
                    result: Math.random() > 0.15 ? 'PASS' : 'FAIL',
                    score: Math.round(Math.random() * 100)
                });
            }
            
            return tests.sort((a, b) => b.date - a.date);
        };

        const exportReport = async (format) => {
            console.log(`🔶 Vue: Exporting report as ${format}`);
            
            const exportData = {
                report: reportState.currentReport,
                data: filteredReportData.value,
                exportTime: new Date().toISOString(),
                format
            };
            
            let content, mimeType, fileName;
            
            switch (format) {
                case 'json':
                    content = JSON.stringify(exportData, null, 2);
                    mimeType = 'application/json';
                    fileName = `report-${Date.now()}.json`;
                    break;
                case 'csv':
                    content = generateCSV(exportData.data);
                    mimeType = 'text/csv';
                    fileName = `report-${Date.now()}.csv`;
                    break;
                case 'pdf':
                default:
                    content = `Report Export\nTotal Tests: ${exportData.data.summary.totalTests}\nPassed: ${exportData.data.summary.passedTests}`;
                    mimeType = 'text/plain';
                    fileName = `report-${Date.now()}.txt`;
                    break;
            }
            
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log(`✅ Vue: Report exported as ${format}`);
        };

        const generateCSV = (data) => {
            const headers = ['Device Type', 'Total Tests', 'Passed', 'Failed', 'Success Rate'];
            const rows = data.deviceBreakdown.map(d => [
                d.type,
                d.count,
                d.passed,
                d.failed,
                Math.round((d.passed / d.count) * 100) + '%'
            ]);
            
            return [headers, ...rows].map(row => row.join(',')).join('\n');
        };

        const goBack = () => {
            console.log('🔶 Vue: Returning to user menu');
            emit('navigate', 'user-menu-screen', props.language, 'default');
        };

        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: ReportsViewTemplate component mounted');
        });

        return {
            reportState,
            filters,
            reportData,
            pageTitle,
            deviceOptions,
            filteredReportData,
            generateReport,
            exportReport,
            goBack
        };
    },

    template: `
        <div class="reports-view-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="vue-badge">Vue</div>
                </div>

                <!-- Filters -->
                <div class="report-filters">
                    <h3>{{ language === 'pl' ? 'Filtry raportu' : 'Report Filters' }}</h3>
                    <div class="filters-grid">
                        <div class="filter-group">
                            <label>{{ language === 'pl' ? 'Data od:' : 'Date From:' }}</label>
                            <input 
                                v-model="filters.dateFrom" 
                                type="date" 
                                class="date-input"
                            />
                        </div>
                        <div class="filter-group">
                            <label>{{ language === 'pl' ? 'Data do:' : 'Date To:' }}</label>
                            <input 
                                v-model="filters.dateTo" 
                                type="date" 
                                class="date-input"
                            />
                        </div>
                        <div class="filter-group">
                            <label>{{ language === 'pl' ? 'Typ urządzenia:' : 'Device Type:' }}</label>
                            <select v-model="filters.deviceType" class="filter-select">
                                <option 
                                    v-for="option in deviceOptions" 
                                    :key="option.value"
                                    :value="option.value"
                                >
                                    {{ option.label }}
                                </option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>{{ language === 'pl' ? 'Status testu:' : 'Test Status:' }}</label>
                            <select v-model="filters.testStatus" class="filter-select">
                                <option value="all">{{ language === 'pl' ? 'Wszystkie' : 'All' }}</option>
                                <option value="passed">{{ language === 'pl' ? 'Zakończone sukcesem' : 'Passed' }}</option>
                                <option value="failed">{{ language === 'pl' ? 'Nieudane' : 'Failed' }}</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="filter-actions">
                        <button 
                            class="generate-btn"
                            :class="{ loading: reportState.isGenerating }"
                            @click="generateReport"
                            :disabled="reportState.isGenerating"
                        >
                            {{ reportState.isGenerating ? '⏳ Generowanie...' : '📊 Generuj Raport' }}
                        </button>
                    </div>
                </div>

                <!-- Results -->
                <div v-if="reportState.hasResults" class="report-results">
                    <div class="results-header">
                        <h3>{{ language === 'pl' ? 'Wyniki raportu' : 'Report Results' }}</h3>
                        <div class="export-actions">
                            <button class="export-btn" @click="exportReport('json')">📄 JSON</button>
                            <button class="export-btn" @click="exportReport('csv')">📊 CSV</button>
                            <button class="export-btn" @click="exportReport('pdf')">📑 PDF</button>
                        </div>
                    </div>
                    
                    <!-- Summary Cards -->
                    <div class="report-summary">
                        <div class="summary-card">
                            <h4>{{ language === 'pl' ? 'Wszystkie testy' : 'Total Tests' }}</h4>
                            <span class="summary-number">{{ filteredReportData.summary.totalTests }}</span>
                        </div>
                        <div class="summary-card passed">
                            <h4>{{ language === 'pl' ? 'Udane' : 'Passed' }}</h4>
                            <span class="summary-number">{{ filteredReportData.summary.passedTests }}</span>
                        </div>
                        <div class="summary-card failed">
                            <h4>{{ language === 'pl' ? 'Nieudane' : 'Failed' }}</h4>
                            <span class="summary-number">{{ filteredReportData.summary.failedTests }}</span>
                        </div>
                        <div class="summary-card rate">
                            <h4>{{ language === 'pl' ? 'Wskaźnik sukcesu' : 'Success Rate' }}</h4>
                            <span class="summary-number">{{ filteredReportData.summary.successRate }}%</span>
                        </div>
                    </div>
                    
                    <!-- Device Breakdown -->
                    <div class="device-breakdown">
                        <h4>{{ language === 'pl' ? 'Podział według urządzeń' : 'Device Breakdown' }}</h4>
                        <div class="breakdown-grid">
                            <div 
                                v-for="device in filteredReportData.deviceBreakdown" 
                                :key="device.type"
                                class="breakdown-card"
                            >
                                <h5>{{ device.type }}</h5>
                                <div class="breakdown-stats">
                                    <div class="stat">
                                        <span class="stat-label">{{ language === 'pl' ? 'Łącznie:' : 'Total:' }}</span>
                                        <span class="stat-value">{{ device.count }}</span>
                                    </div>
                                    <div class="stat passed">
                                        <span class="stat-label">{{ language === 'pl' ? 'Udane:' : 'Passed:' }}</span>
                                        <span class="stat-value">{{ device.passed }}</span>
                                    </div>
                                    <div class="stat failed">
                                        <span class="stat-label">{{ language === 'pl' ? 'Nieudane:' : 'Failed:' }}</span>
                                        <span class="stat-value">{{ device.failed }}</span>
                                    </div>
                                    <div class="progress-bar">
                                        <div 
                                            class="progress-fill"
                                            :style="{ width: Math.round((device.passed / device.count) * 100) + '%' }"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>{{ language === 'pl' ? 'Brak danych raportu' : 'No Report Data' }}</h3>
                    <p>{{ language === 'pl' ? 'Użyj filtrów powyżej i kliknij "Generuj Raport" aby zobaczyć wyniki.' : 'Use the filters above and click "Generate Report" to see results.' }}</p>
                </div>
            </div>
        </div>
    `,

    style: `
        .reports-view-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .template-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .template-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        
        .back-btn {
            padding: 8px 16px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .back-btn:hover {
            background: #5a6268;
        }
        
        .template-title {
            margin: 0;
            color: #333;
            font-size: 1.8em;
        }
        
        .vue-badge {
            background: #42b883;
            color: white;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 0.9em;
            font-weight: 600;
        }
        
        .report-filters {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        
        .report-filters h3 {
            margin: 0 0 20px 0;
            color: #333;
            font-size: 1.3em;
        }
        
        .filters-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
        }
        
        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .filter-group label {
            font-weight: 600;
            color: #666;
        }
        
        .date-input, .filter-select {
            padding: 10px 12px;
            border: 2px solid #e9ecef;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        .date-input:focus, .filter-select:focus {
            outline: none;
            border-color: #42b883;
        }
        
        .filter-actions {
            display: flex;
            justify-content: center;
        }
        
        .generate-btn {
            padding: 12px 24px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1.1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .generate-btn:hover:not(:disabled) {
            background: #0056b3;
            transform: translateY(-2px);
        }
        
        .generate-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        .generate-btn.loading {
            animation: pulse 1.5s infinite;
        }
        
        .report-results {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        
        .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        
        .results-header h3 {
            margin: 0;
            color: #333;
            font-size: 1.3em;
        }
        
        .export-actions {
            display: flex;
            gap: 8px;
        }
        
        .export-btn {
            padding: 8px 12px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9em;
            transition: all 0.3s;
        }
        
        .export-btn:hover {
            background: #218838;
        }
        
        .report-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #007bff;
        }
        
        .summary-card.passed {
            border-left-color: #28a745;
        }
        
        .summary-card.failed {
            border-left-color: #dc3545;
        }
        
        .summary-card.rate {
            border-left-color: #ffc107;
        }
        
        .summary-card h4 {
            margin: 0 0 8px 0;
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
        }
        
        .summary-number {
            font-size: 2em;
            font-weight: 600;
            color: #333;
        }
        
        .device-breakdown h4 {
            margin: 0 0 16px 0;
            color: #333;
            font-size: 1.2em;
        }
        
        .breakdown-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
        }
        
        .breakdown-card {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        
        .breakdown-card h5 {
            margin: 0 0 12px 0;
            color: #333;
            font-size: 1.1em;
        }
        
        .breakdown-stats {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .stat {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .stat-label {
            font-size: 0.9em;
            color: #666;
        }
        
        .stat-value {
            font-weight: 600;
            color: #333;
        }
        
        .stat.passed .stat-value {
            color: #28a745;
        }
        
        .stat.failed .stat-value {
            color: #dc3545;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
        }
        
        .progress-fill {
            height: 100%;
            background: #28a745;
            border-radius: 4px;
            transition: width 0.5s ease;
        }
        
        .empty-state {
            background: white;
            padding: 60px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .empty-icon {
            font-size: 4em;
            margin-bottom: 16px;
        }
        
        .empty-state h3 {
            margin: 0 0 8px 0;
            color: #333;
        }
        
        .empty-state p {
            margin: 0;
            color: #666;
            line-height: 1.5;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    `
};

// Export component for use
window.ReportsViewTemplate = ReportsViewTemplate;
console.log('🔶 Vue ReportsViewTemplate component loaded');
