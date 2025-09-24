/**
 * MASKSERVICE C20 - Vue.js Reports Batch Template Component
 * Replaces vanilla reports-batch-template.html
 * Advanced batch report generation with multiple formats and scheduling
 */


const ReportsBatchTemplate = {
    name: 'ReportsBatchTemplate',
    props: {
        user: { type: Object, default: () => ({}) },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['navigate', 'batch-action'],
    
    setup(props, { emit }) {
        const batchState = reactive({
            isGenerating: false,
            progress: 0,
            currentReport: '',
            generatedReports: []
        });

        const batchSettings = reactive({
            period: 'monthly',
            formats: ['pdf'],
            dateFrom: '',
            dateTo: '',
            includeCharts: true,
            includeDetails: true,
            compressOutput: false,
            emailDelivery: false,
            emailAddress: ''
        });

        const pageTitle = computed(() => props.language === 'pl' ? 'Generator Raportów Wsadowych' : 'Batch Reports Generator');

        const reportPeriods = computed(() => [
            { value: 'daily', label: props.language === 'pl' ? 'Dzienne' : 'Daily' },
            { value: 'weekly', label: props.language === 'pl' ? 'Tygodniowe' : 'Weekly' },
            { value: 'monthly', label: props.language === 'pl' ? 'Miesięczne' : 'Monthly' },
            { value: 'quarterly', label: props.language === 'pl' ? 'Kwartalne' : 'Quarterly' },
            { value: 'yearly', label: props.language === 'pl' ? 'Roczne' : 'Yearly' },
            { value: 'custom', label: props.language === 'pl' ? 'Niestandardowe' : 'Custom' }
        ]);

        const outputFormats = computed(() => [
            { value: 'pdf', label: 'PDF', icon: '📄', size: '~2MB' },
            { value: 'excel', label: 'Excel', icon: '📊', size: '~1.5MB' },
            { value: 'csv', label: 'CSV', icon: '📋', size: '~500KB' },
            { value: 'json', label: 'JSON', icon: '🗂️', size: '~300KB' },
            { value: 'xml', label: 'XML', icon: '📰', size: '~800KB' }
        ]);

        const generateBatchReports = async () => {
            console.log('🔶 Vue: Starting batch report generation');
            batchState.isGenerating = true;
            batchState.progress = 0;
            batchState.generatedReports = [];

            try {
                const totalFormats = batchSettings.formats.length;
                
                for (let i = 0; i < totalFormats; i++) {
                    const format = batchSettings.formats[i];
                    batchState.currentReport = `${props.language === 'pl' ? 'Generowanie' : 'Generating'} ${format.toUpperCase()}...`;
                    
                    await generateSingleReport(format);
                    
                    batchState.progress = Math.round(((i + 1) / totalFormats) * 100);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                batchState.currentReport = props.language === 'pl' ? 'Ukończono!' : 'Completed!';
                emit('batch-action', { action: 'completed', reports: batchState.generatedReports });
                console.log('✅ Vue: Batch report generation completed');

            } catch (error) {
                console.error('❌ Vue: Batch report generation failed:', error);
                alert(`${props.language === 'pl' ? 'Błąd generowania' : 'Generation error'}: ${error.message}`);
            } finally {
                setTimeout(() => {
                    batchState.isGenerating = false;
                    batchState.currentReport = '';
                }, 2000);
            }
        };

        const generateSingleReport = async (format) => {
            const reportData = {
                id: Date.now() + Math.random(),
                format: format,
                period: batchSettings.period,
                dateFrom: batchSettings.dateFrom,
                dateTo: batchSettings.dateTo,
                generatedAt: new Date().toISOString(),
                size: getEstimatedSize(format),
                filename: `maskservice-report-${batchSettings.period}-${Date.now()}.${format}`
            };

            // Simulate report generation
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
            
            batchState.generatedReports.push(reportData);
            
            // Mock file download
            if (format !== 'json') {
                downloadMockFile(reportData);
            } else {
                downloadJSONReport(reportData);
            }
        };

        const downloadMockFile = (reportData) => {
            const content = `MASKSERVICE C20 - ${reportData.format.toUpperCase()} Report
Period: ${reportData.period}
Generated: ${reportData.generatedAt}
User: ${props.user.username}

[Mock ${reportData.format.toUpperCase()} content would be here]`;

            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = reportData.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        const downloadJSONReport = (reportData) => {
            const jsonContent = {
                metadata: {
                    reportId: reportData.id,
                    generatedAt: reportData.generatedAt,
                    period: reportData.period,
                    user: props.user.username,
                    version: '2.0.1001'
                },
                settings: batchSettings,
                data: {
                    totalTests: 156,
                    passedTests: 142,
                    failedTests: 14,
                    passRate: 91.0,
                    devices: [
                        { name: 'PP-MASK-001', tests: 45, passed: 43 },
                        { name: 'NP-MASK-003', tests: 32, passed: 28 },
                        { name: 'SCBA-007', tests: 67, passed: 64 }
                    ]
                }
            };

            const blob = new Blob([JSON.stringify(jsonContent, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = reportData.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        const getEstimatedSize = (format) => {
            const sizes = {
                pdf: '2.1 MB',
                excel: '1.6 MB', 
                csv: '485 KB',
                json: '312 KB',
                xml: '756 KB'
            };
            return sizes[format] || '1 MB';
        };

        const toggleFormat = (formatValue) => {
            const index = batchSettings.formats.indexOf(formatValue);
            if (index === -1) {
                batchSettings.formats.push(formatValue);
            } else {
                batchSettings.formats.splice(index, 1);
            }
        };

        const goBack = () => {
            console.log('🔶 Vue: Returning to reports menu');
            emit('navigate', 'reports-view-template', props.language, 'default');
        };

        onMounted(() => {
            console.log('🔶 Vue: ReportsBatchTemplate component mounted');
            
            // Set default date range
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            batchSettings.dateFrom = lastMonth.toISOString().split('T')[0];
            batchSettings.dateTo = now.toISOString().split('T')[0];
        });

        return {
            batchState,
            batchSettings,
            pageTitle,
            reportPeriods,
            outputFormats,
            generateBatchReports,
            toggleFormat,
            goBack
        };
    },

    template: `
        <div class="reports-batch-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="vue-badge">Vue</div>
                </div>

                <!-- Batch Settings -->
                <div class="batch-settings">
                    <div class="settings-group">
                        <h3>{{ language === 'pl' ? 'Okres raportu' : 'Report Period' }}</h3>
                        <select v-model="batchSettings.period" class="period-select">
                            <option v-for="period in reportPeriods" :key="period.value" :value="period.value">
                                {{ period.label }}
                            </option>
                        </select>
                        
                        <div v-if="batchSettings.period === 'custom'" class="date-range">
                            <input v-model="batchSettings.dateFrom" type="date" />
                            <span>{{ language === 'pl' ? 'do' : 'to' }}</span>
                            <input v-model="batchSettings.dateTo" type="date" />
                        </div>
                    </div>

                    <div class="settings-group">
                        <h3>{{ language === 'pl' ? 'Formaty wyjściowe' : 'Output Formats' }}</h3>
                        <div class="format-grid">
                            <label 
                                v-for="format in outputFormats" 
                                :key="format.value"
                                class="format-option"
                                :class="{ active: batchSettings.formats.includes(format.value) }"
                            >
                                <input 
                                    type="checkbox" 
                                    :value="format.value"
                                    :checked="batchSettings.formats.includes(format.value)"
                                    @change="toggleFormat(format.value)"
                                />
                                <div class="format-info">
                                    <span class="format-icon">{{ format.icon }}</span>
                                    <span class="format-name">{{ format.label }}</span>
                                    <span class="format-size">{{ format.size }}</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="settings-group">
                        <h3>{{ language === 'pl' ? 'Opcje dodatkowe' : 'Additional Options' }}</h3>
                        <div class="options-grid">
                            <label class="option-item">
                                <input v-model="batchSettings.includeCharts" type="checkbox" />
                                {{ language === 'pl' ? 'Dołącz wykresy' : 'Include Charts' }}
                            </label>
                            <label class="option-item">
                                <input v-model="batchSettings.includeDetails" type="checkbox" />
                                {{ language === 'pl' ? 'Szczegóły' : 'Include Details' }}
                            </label>
                            <label class="option-item">
                                <input v-model="batchSettings.compressOutput" type="checkbox" />
                                {{ language === 'pl' ? 'Kompresja ZIP' : 'ZIP Compression' }}
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Generation Progress -->
                <div v-if="batchState.isGenerating" class="generation-progress">
                    <h3>{{ language === 'pl' ? 'Generowanie raportów...' : 'Generating Reports...' }}</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: batchState.progress + '%' }"></div>
                    </div>
                    <div class="progress-status">
                        <span>{{ batchState.currentReport }}</span>
                        <span class="progress-percent">{{ batchState.progress }}%</span>
                    </div>
                </div>

                <!-- Generate Button -->
                <div class="action-section">
                    <button 
                        class="generate-btn"
                        @click="generateBatchReports"
                        :disabled="batchState.isGenerating || batchSettings.formats.length === 0"
                    >
                        <span v-if="!batchState.isGenerating">
                            🚀 {{ language === 'pl' ? 'Generuj raporty' : 'Generate Reports' }}
                        </span>
                        <span v-else>
                            ⏳ {{ language === 'pl' ? 'Generowanie...' : 'Generating...' }}
                        </span>
                    </button>
                </div>

                <!-- Generated Reports -->
                <div v-if="batchState.generatedReports.length > 0" class="generated-reports">
                    <h3>{{ language === 'pl' ? 'Wygenerowane raporty' : 'Generated Reports' }}</h3>
                    <div class="reports-list">
                        <div 
                            v-for="report in batchState.generatedReports" 
                            :key="report.id"
                            class="report-item"
                        >
                            <div class="report-info">
                                <div class="report-name">{{ report.filename }}</div>
                                <div class="report-meta">{{ report.size }} • {{ report.format.toUpperCase() }}</div>
                            </div>
                            <div class="report-status">✅</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .reports-batch-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .template-container { max-width: 1000px; margin: 0 auto; }
        
        .template-header {
            display: flex; align-items: center; justify-content: space-between;
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .back-btn { 
            padding: 8px 16px; background: #6c757d; color: white;
            border: none; border-radius: 6px; cursor: pointer; font-weight: 500;
        }
        
        .vue-badge { 
            background: #42b883; color: white; padding: 6px 12px; 
            border-radius: 16px; font-size: 0.9em; font-weight: 600; 
        }
        
        .batch-settings {
            background: white; padding: 24px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .settings-group { margin-bottom: 24px; }
        .settings-group:last-child { margin-bottom: 0; }
        
        .settings-group h3 { 
            margin: 0 0 16px 0; color: #333; font-size: 1.1em; 
        }
        
        .period-select {
            width: 100%; padding: 10px; border: 2px solid #e9ecef;
            border-radius: 6px; font-size: 1em;
        }
        
        .date-range {
            display: flex; align-items: center; gap: 12px; margin-top: 12px;
        }
        
        .date-range input { 
            padding: 8px; border: 2px solid #e9ecef; border-radius: 4px; 
        }
        
        .format-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
        }
        
        .format-option {
            display: flex; align-items: center; padding: 12px;
            border: 2px solid #e9ecef; border-radius: 8px;
            cursor: pointer; transition: all 0.3s;
        }
        
        .format-option.active { 
            border-color: #28a745; background: #f8fff8; 
        }
        
        .format-option input { display: none; }
        
        .format-info {
            display: flex; flex-direction: column; align-items: center;
            text-align: center; width: 100%;
        }
        
        .format-icon { font-size: 1.5em; margin-bottom: 4px; }
        .format-name { font-weight: 600; }
        .format-size { font-size: 0.8em; color: #666; }
        
        .options-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
        }
        
        .option-item {
            display: flex; align-items: center; gap: 8px;
            padding: 8px; cursor: pointer;
        }
        
        .generation-progress {
            background: white; padding: 24px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .progress-bar {
            width: 100%; height: 20px; background: #e9ecef;
            border-radius: 10px; overflow: hidden; margin: 16px 0;
        }
        
        .progress-fill {
            height: 100%; background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.3s; border-radius: 10px;
        }
        
        .progress-status {
            display: flex; justify-content: space-between; align-items: center;
        }
        
        .progress-percent { font-weight: 600; color: #28a745; }
        
        .action-section {
            text-align: center; margin-bottom: 24px;
        }
        
        .generate-btn {
            padding: 16px 32px; background: #28a745; color: white;
            border: none; border-radius: 8px; font-size: 1.1em;
            font-weight: 600; cursor: pointer; transition: all 0.3s;
        }
        
        .generate-btn:hover:not(:disabled) { 
            background: #218838; transform: translateY(-2px);
        }
        
        .generate-btn:disabled { 
            background: #6c757d; cursor: not-allowed; 
        }
        
        .generated-reports {
            background: white; padding: 24px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .reports-list { display: flex; flex-direction: column; gap: 12px; }
        
        .report-item {
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px; background: #f8f9fa; border-radius: 6px;
        }
        
        .report-name { font-weight: 600; }
        .report-meta { font-size: 0.9em; color: #666; }
        .report-status { font-size: 1.2em; }
    `
};

window.ReportsBatchTemplate = ReportsBatchTemplate;
console.log('🔶 Vue ReportsBatchTemplate component loaded');
