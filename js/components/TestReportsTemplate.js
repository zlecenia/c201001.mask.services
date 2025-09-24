/**
 * MASKSERVICE C20 - Vue.js Test Reports Template Component
 * Replaces vanilla test-reports-template.html
 * Advanced test reports management with PDF generation and filtering
 */


const TestReportsTemplate = {
    name: 'TestReportsTemplate',
    props: {
        user: { type: Object, default: () => ({}) },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['navigate', 'report-action'],
    
    setup(props, { emit }) {
        const reportsState = reactive({
            isLoading: false,
            selectedReports: [],
            showFilters: false,
            sortBy: 'date',
            sortDirection: 'desc'
        });

        const filters = reactive({
            dateFrom: '',
            dateTo: '',
            reportType: 'all',
            status: 'all',
            deviceType: 'all'
        });

        const reports = reactive([
            {
                id: 1,
                number: 'RPT-001',
                title: 'Test przepływu masek PP',
                date: '2025-09-24',
                type: 'FLOW_TEST',
                status: 'COMPLETED',
                deviceType: 'PP_MASK',
                operator: 'Jan Kowalski',
                testCount: 15,
                passRate: 93.3,
                size: '2.4 MB'
            },
            {
                id: 2,
                number: 'RPT-002', 
                title: 'Kalibracja sensorów',
                date: '2025-09-23',
                type: 'CALIBRATION',
                status: 'COMPLETED',
                deviceType: 'SCBA',
                operator: 'Anna Nowak',
                testCount: 8,
                passRate: 100,
                size: '1.8 MB'
            },
            {
                id: 3,
                number: 'RPT-003',
                title: 'Test szczelności NP',
                date: '2025-09-22',
                type: 'LEAK_TEST',
                status: 'PENDING',
                deviceType: 'NP_MASK',
                operator: 'Piotr Wiśniewski',
                testCount: 12,
                passRate: 91.7,
                size: '3.1 MB'
            },
            {
                id: 4,
                number: 'RPT-004',
                title: 'Przegląd miesięczny',
                date: '2025-09-21',
                type: 'MONTHLY_REVIEW',
                status: 'FAILED',
                deviceType: 'ALL',
                operator: 'Maria Zielińska',
                testCount: 45,
                passRate: 87.5,
                size: '5.2 MB'
            }
        ]);

        const pageTitle = computed(() => props.language === 'pl' ? 'Raporty Testów' : 'Test Reports');

        const reportTypes = computed(() => [
            { value: 'all', label: props.language === 'pl' ? 'Wszystkie' : 'All' },
            { value: 'FLOW_TEST', label: props.language === 'pl' ? 'Test przepływu' : 'Flow Test' },
            { value: 'LEAK_TEST', label: props.language === 'pl' ? 'Test szczelności' : 'Leak Test' },
            { value: 'CALIBRATION', label: props.language === 'pl' ? 'Kalibracja' : 'Calibration' },
            { value: 'MONTHLY_REVIEW', label: props.language === 'pl' ? 'Przegląd miesięczny' : 'Monthly Review' }
        ]);

        const filteredReports = computed(() => {
            let filtered = [...reports];

            if (filters.dateFrom) {
                filtered = filtered.filter(r => r.date >= filters.dateFrom);
            }
            if (filters.dateTo) {
                filtered = filtered.filter(r => r.date <= filters.dateTo);
            }
            if (filters.reportType !== 'all') {
                filtered = filtered.filter(r => r.type === filters.reportType);
            }
            if (filters.status !== 'all') {
                filtered = filtered.filter(r => r.status === filters.status);
            }
            if (filters.deviceType !== 'all') {
                filtered = filtered.filter(r => r.deviceType === filters.deviceType);
            }

            // Sorting
            filtered.sort((a, b) => {
                let aVal, bVal;
                switch (reportsState.sortBy) {
                    case 'date':
                        aVal = new Date(a.date);
                        bVal = new Date(b.date);
                        break;
                    case 'number':
                        aVal = a.number;
                        bVal = b.number;
                        break;
                    case 'passRate':
                        aVal = a.passRate;
                        bVal = b.passRate;
                        break;
                    default:
                        aVal = a[reportsState.sortBy];
                        bVal = b[reportsState.sortBy];
                }

                if (reportsState.sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });

            return filtered;
        });

        const reportStats = computed(() => ({
            total: reports.length,
            completed: reports.filter(r => r.status === 'COMPLETED').length,
            pending: reports.filter(r => r.status === 'PENDING').length,
            failed: reports.filter(r => r.status === 'FAILED').length,
            avgPassRate: Math.round(reports.reduce((sum, r) => sum + r.passRate, 0) / reports.length * 10) / 10
        }));

        const generatePDF = async (report) => {
            console.log(`🔶 Vue: Generating PDF for report ${report.number}`);
            reportsState.isLoading = true;

            try {
                // Simulate PDF generation
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Create mock PDF content
                const pdfContent = generatePDFContent(report);
                const blob = new Blob([pdfContent], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${report.number}-${report.date}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                emit('report-action', { action: 'pdf_generated', report });
                console.log(`✅ Vue: PDF generated for report ${report.number}`);

            } catch (error) {
                console.error(`❌ Vue: Failed to generate PDF for ${report.number}:`, error);
                alert(`Błąd generowania PDF: ${error.message}`);
            } finally {
                reportsState.isLoading = false;
            }
        };

        const generatePDFContent = (report) => {
            return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
>>
endobj

xref
0 4
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000100 00000 n 
trailer
<<
/Size 4
/Root 1 0 R
>>
startxref
150
%%EOF

MASKSERVICE C20 - Test Report
Report: ${report.number}
Title: ${report.title}
Date: ${report.date}
Operator: ${report.operator}
Tests: ${report.testCount}
Pass Rate: ${report.passRate}%
Status: ${report.status}`;
        };

        const viewReport = (report) => {
            console.log(`🔶 Vue: Viewing report ${report.number}`);
            // Implement report viewer
            alert(`Viewing report: ${report.title}`);
            emit('report-action', { action: 'viewed', report });
        };

        const deleteReport = async (reportId) => {
            if (confirm(props.language === 'pl' ? 
                'Czy na pewno chcesz usunąć ten raport?' : 
                'Are you sure you want to delete this report?')) {
                
                const index = reports.findIndex(r => r.id === reportId);
                if (index !== -1) {
                    const deletedReport = reports.splice(index, 1)[0];
                    emit('report-action', { action: 'deleted', report: deletedReport });
                    console.log(`🔶 Vue: Report ${deletedReport.number} deleted`);
                }
            }
        };

        const selectReport = (reportId) => {
            const index = reportsState.selectedReports.indexOf(reportId);
            if (index === -1) {
                reportsState.selectedReports.push(reportId);
            } else {
                reportsState.selectedReports.splice(index, 1);
            }
        };

        const selectAllReports = () => {
            if (reportsState.selectedReports.length === filteredReports.value.length) {
                reportsState.selectedReports = [];
            } else {
                reportsState.selectedReports = filteredReports.value.map(r => r.id);
            }
        };

        const bulkDownload = async () => {
            console.log('🔶 Vue: Bulk downloading selected reports');
            reportsState.isLoading = true;

            try {
                for (const reportId of reportsState.selectedReports) {
                    const report = reports.find(r => r.id === reportId);
                    if (report) {
                        await generatePDF(report);
                    }
                }
                reportsState.selectedReports = [];
            } finally {
                reportsState.isLoading = false;
            }
        };

        const exportReportsList = () => {
            const exportData = {
                timestamp: new Date().toISOString(),
                user: props.user.username,
                reports: filteredReports.value,
                stats: reportStats.value,
                filters: filters
            };

            const content = JSON.stringify(exportData, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reports-list-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('✅ Vue: Reports list exported successfully');
        };

        const goBack = () => {
            console.log('🔶 Vue: Returning to user menu');
            emit('navigate', 'user-menu-screen', props.language, 'default');
        };

        onMounted(() => {
            console.log('🔶 Vue: TestReportsTemplate component mounted');
        });

        return {
            reportsState,
            filters,
            reports,
            pageTitle,
            reportTypes,
            filteredReports,
            reportStats,
            generatePDF,
            viewReport,
            deleteReport,
            selectReport,
            selectAllReports,
            bulkDownload,
            exportReportsList,
            goBack
        };
    },

    template: `
        <div class="test-reports-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="header-actions">
                        <button class="filters-btn" @click="reportsState.showFilters = !reportsState.showFilters">
                            🔍 {{ language === 'pl' ? 'Filtry' : 'Filters' }}
                        </button>
                        <button class="export-btn" @click="exportReportsList">
                            📤 {{ language === 'pl' ? 'Eksport' : 'Export' }}
                        </button>
                        <div class="vue-badge">Vue</div>
                    </div>
                </div>

                <!-- Stats -->
                <div class="reports-stats">
                    <div class="stat-card">
                        <div class="stat-number">{{ reportStats.total }}</div>
                        <div class="stat-label">{{ language === 'pl' ? 'Wszystkie' : 'Total' }}</div>
                    </div>
                    <div class="stat-card completed">
                        <div class="stat-number">{{ reportStats.completed }}</div>
                        <div class="stat-label">{{ language === 'pl' ? 'Ukończone' : 'Completed' }}</div>
                    </div>
                    <div class="stat-card pending">
                        <div class="stat-number">{{ reportStats.pending }}</div>
                        <div class="stat-label">{{ language === 'pl' ? 'W toku' : 'Pending' }}</div>
                    </div>
                    <div class="stat-card failed">
                        <div class="stat-number">{{ reportStats.failed }}</div>
                        <div class="stat-label">{{ language === 'pl' ? 'Nieudane' : 'Failed' }}</div>
                    </div>
                    <div class="stat-card rate">
                        <div class="stat-number">{{ reportStats.avgPassRate }}%</div>
                        <div class="stat-label">{{ language === 'pl' ? 'Śr. sukces' : 'Avg Pass Rate' }}</div>
                    </div>
                </div>

                <!-- Filters -->
                <div v-if="reportsState.showFilters" class="filters-panel">
                    <div class="filters-grid">
                        <div class="filter-group">
                            <label>{{ language === 'pl' ? 'Data od:' : 'Date From:' }}</label>
                            <input v-model="filters.dateFrom" type="date" />
                        </div>
                        <div class="filter-group">
                            <label>{{ language === 'pl' ? 'Data do:' : 'Date To:' }}</label>
                            <input v-model="filters.dateTo" type="date" />
                        </div>
                        <div class="filter-group">
                            <label>{{ language === 'pl' ? 'Typ raportu:' : 'Report Type:' }}</label>
                            <select v-model="filters.reportType">
                                <option v-for="type in reportTypes" :key="type.value" :value="type.value">
                                    {{ type.label }}
                                </option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>{{ language === 'pl' ? 'Status:' : 'Status:' }}</label>
                            <select v-model="filters.status">
                                <option value="all">{{ language === 'pl' ? 'Wszystkie' : 'All' }}</option>
                                <option value="COMPLETED">{{ language === 'pl' ? 'Ukończone' : 'Completed' }}</option>
                                <option value="PENDING">{{ language === 'pl' ? 'W toku' : 'Pending' }}</option>
                                <option value="FAILED">{{ language === 'pl' ? 'Nieudane' : 'Failed' }}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Bulk Actions -->
                <div v-if="reportsState.selectedReports.length > 0" class="bulk-actions">
                    <span>{{ reportsState.selectedReports.length }} {{ language === 'pl' ? 'wybranych' : 'selected' }}</span>
                    <button class="bulk-btn" @click="bulkDownload" :disabled="reportsState.isLoading">
                        📥 {{ language === 'pl' ? 'Pobierz wszystkie' : 'Download All' }}
                    </button>
                </div>

                <!-- Reports List -->
                <div class="reports-container">
                    <div class="reports-header">
                        <div class="select-all">
                            <input 
                                type="checkbox" 
                                :checked="reportsState.selectedReports.length === filteredReports.length && filteredReports.length > 0"
                                @change="selectAllReports"
                            />
                        </div>
                        <div class="header-item sortable" @click="reportsState.sortBy = 'number'">
                            {{ language === 'pl' ? 'Numer' : 'Number' }}
                        </div>
                        <div class="header-item sortable" @click="reportsState.sortBy = 'title'">
                            {{ language === 'pl' ? 'Tytuł' : 'Title' }}
                        </div>
                        <div class="header-item sortable" @click="reportsState.sortBy = 'date'">
                            {{ language === 'pl' ? 'Data' : 'Date' }}
                        </div>
                        <div class="header-item sortable" @click="reportsState.sortBy = 'passRate'">
                            {{ language === 'pl' ? 'Sukces %' : 'Pass Rate' }}
                        </div>
                        <div class="header-item">{{ language === 'pl' ? 'Akcje' : 'Actions' }}</div>
                    </div>

                    <div class="reports-list">
                        <div 
                            v-for="report in filteredReports" 
                            :key="report.id"
                            class="report-item"
                            :class="'status-' + report.status.toLowerCase()"
                        >
                            <div class="report-select">
                                <input 
                                    type="checkbox" 
                                    :checked="reportsState.selectedReports.includes(report.id)"
                                    @change="selectReport(report.id)"
                                />
                            </div>
                            <div class="report-number">{{ report.number }}</div>
                            <div class="report-title">
                                <div class="title-text">{{ report.title }}</div>
                                <div class="report-meta">
                                    <span class="operator">{{ report.operator }}</span>
                                    <span class="size">{{ report.size }}</span>
                                </div>
                            </div>
                            <div class="report-date">{{ report.date }}</div>
                            <div class="report-pass-rate">
                                <div class="rate-number">{{ report.passRate }}%</div>
                                <div class="rate-bar">
                                    <div 
                                        class="rate-fill"
                                        :style="{ width: report.passRate + '%' }"
                                        :class="{ 
                                            'high': report.passRate >= 95,
                                            'medium': report.passRate >= 80 && report.passRate < 95,
                                            'low': report.passRate < 80
                                        }"
                                    ></div>
                                </div>
                            </div>
                            <div class="report-actions">
                                <button class="action-btn view" @click="viewReport(report)" title="View">👁️</button>
                                <button 
                                    class="action-btn pdf" 
                                    @click="generatePDF(report)" 
                                    :disabled="reportsState.isLoading"
                                    title="Generate PDF"
                                >
                                    📄
                                </button>
                                <button class="action-btn delete" @click="deleteReport(report.id)" title="Delete">🗑️</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .test-reports-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .template-container { max-width: 1400px; margin: 0 auto; }
        
        .template-header {
            display: flex; align-items: center; justify-content: space-between;
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .back-btn, .filters-btn, .export-btn { 
            padding: 8px 16px; border: none; border-radius: 6px; 
            cursor: pointer; font-weight: 500; transition: all 0.3s; margin-right: 8px;
        }
        .back-btn { background: #6c757d; color: white; }
        .filters-btn { background: #17a2b8; color: white; }
        .export-btn { background: #28a745; color: white; }
        
        .vue-badge { 
            background: #42b883; color: white; padding: 6px 12px; 
            border-radius: 16px; font-size: 0.9em; font-weight: 600; 
        }
        
        .reports-stats {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px; margin-bottom: 24px;
        }
        
        .stat-card {
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;
            border-left: 4px solid #2196f3;
        }
        
        .stat-card.completed { border-left-color: #4caf50; }
        .stat-card.pending { border-left-color: #ff9800; }
        .stat-card.failed { border-left-color: #f44336; }
        .stat-card.rate { border-left-color: #9c27b0; }
        
        .stat-number { font-size: 1.8em; font-weight: 600; color: #333; }
        .stat-label { font-size: 0.9em; color: #666; margin-top: 4px; }
        
        .filters-panel {
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .filters-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;
        }
        
        .filter-group { display: flex; flex-direction: column; gap: 8px; }
        .filter-group label { font-weight: 600; color: #666; }
        .filter-group input, .filter-group select {
            padding: 8px; border: 1px solid #ddd; border-radius: 4px;
        }
        
        .bulk-actions {
            background: #fff3cd; padding: 12px 20px; border-radius: 8px;
            margin-bottom: 16px; display: flex; align-items: center; gap: 16px;
        }
        
        .bulk-btn {
            padding: 8px 16px; background: #007bff; color: white;
            border: none; border-radius: 6px; cursor: pointer;
        }
        
        .reports-container {
            background: white; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;
        }
        
        .reports-header {
            display: grid; grid-template-columns: 50px 120px 1fr 100px 120px 120px;
            gap: 16px; padding: 16px 20px; background: #f8f9fa;
            border-bottom: 2px solid #e9ecef; font-weight: 600;
        }
        
        .header-item.sortable { cursor: pointer; }
        .header-item.sortable:hover { color: #007bff; }
        
        .reports-list { max-height: 600px; overflow-y: auto; }
        
        .report-item {
            display: grid; grid-template-columns: 50px 120px 1fr 100px 120px 120px;
            gap: 16px; padding: 16px 20px; align-items: center;
            border-bottom: 1px solid #e9ecef; transition: all 0.3s;
        }
        
        .report-item:hover { background: #f8f9fa; }
        
        .report-item.status-completed { border-left: 4px solid #4caf50; }
        .report-item.status-pending { border-left: 4px solid #ff9800; }
        .report-item.status-failed { border-left: 4px solid #f44336; }
        
        .report-number { font-weight: 600; color: #007bff; }
        
        .report-title .title-text { font-weight: 500; margin-bottom: 4px; }
        .report-meta { display: flex; gap: 12px; font-size: 0.8em; color: #666; }
        
        .report-date { color: #666; }
        
        .report-pass-rate .rate-number { font-weight: 600; margin-bottom: 4px; }
        .rate-bar { width: 100%; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden; }
        .rate-fill { height: 100%; transition: width 0.3s; }
        .rate-fill.high { background: #4caf50; }
        .rate-fill.medium { background: #ff9800; }
        .rate-fill.low { background: #f44336; }
        
        .report-actions { display: flex; gap: 8px; }
        .action-btn {
            padding: 6px 8px; border: none; border-radius: 4px; cursor: pointer;
            transition: all 0.3s; font-size: 0.9em;
        }
        
        .action-btn.view { background: #e3f2fd; }
        .action-btn.pdf { background: #fff3e0; }
        .action-btn.delete { background: #ffebee; }
        
        .action-btn:hover { transform: scale(1.1); }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
};

window.TestReportsTemplate = TestReportsTemplate;
console.log('🔶 Vue TestReportsTemplate component loaded');
