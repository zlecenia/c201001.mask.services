/**
 * MASKSERVICE C20 - Reports Batch Module
 * Batch report generation and analysis functionality
 * Optimized for 400x1280 display (7.9" LCD IPS touchscreen)
 */

class ReportsBatch {
    constructor(core) {
        this.core = core;
        this.batchJobs = new Map();
        this.batchTemplates = new Map();
        this.analysisEngines = new Map();
        this.init();
    }

    init() {
        this.setupBatchTemplates();
        this.setupAnalysisEngines();
        this.setupEventListeners();
        console.log('✅ ReportsBatch initialized for narrow display');
    }

    setupBatchTemplates() {
        this.batchTemplates.set('customer', {
            id: 'customer',
            name: 'Raport klienta',
            description: 'Wszystkie raporty dla wybranego klienta',
            icon: '👤',
            groupBy: 'customer',
            includeStats: true,
            compactLayout: true
        });

        this.batchTemplates.set('period', {
            id: 'period',
            name: 'Raport okresowy',
            description: 'Raporty z wybranego okresu',
            icon: '📅',
            groupBy: 'date',
            includeStats: true,
            compactLayout: true
        });

        this.batchTemplates.set('device_type', {
            id: 'device_type',
            name: 'Raport typu urządzenia',
            description: 'Raporty według typu urządzenia',
            icon: '🔧',
            groupBy: 'deviceType',
            includeStats: true,
            compactLayout: true
        });

        this.batchTemplates.set('failure_analysis', {
            id: 'failure_analysis',
            name: 'Analiza awarii',
            description: 'Analiza raportów z wynikiem negatywnym',
            icon: '⚠️',
            filter: 'FAIL',
            includeAnalysis: true,
            compactLayout: true
        });
    }

    setupAnalysisEngines() {
        this.analysisEngines.set('statistical', {
            name: 'Analiza statystyczna',
            calculate: (reports) => this.calculateStatistics(reports)
        });

        this.analysisEngines.set('trending', {
            name: 'Analiza trendów',
            calculate: (reports) => this.calculateTrends(reports)
        });

        this.analysisEngines.set('quality', {
            name: 'Analiza jakości',
            calculate: (reports) => this.calculateQualityMetrics(reports)
        });
    }

    setupEventListeners() {
        document.addEventListener('reportsCore:dataUpdated', (e) => {
            this.handleDataUpdate(e.detail);
        });
    }

    // Main UI method optimized for narrow display
    showBatchReports() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getCompactBatchHTML();
        }
    }

    getCompactBatchHTML() {
        return `
            <div class="reports-batch compact-view">
                <div class="compact-header">
                    <h2>Raporty zbiorcze</h2>
                    <button class="btn-back" onclick="testReportsEnhanced.showReports()">◀</button>
                </div>

                <!-- Batch Templates - Grid layout for narrow display -->
                <div class="batch-templates">
                    <h3>Typy raportów</h3>
                    <div class="templates-grid">
                        ${this.getBatchTemplatesHTML()}
                    </div>
                </div>

                <!-- Quick Filters - Compact horizontal layout -->
                <div class="quick-filters">
                    <h3>Szybkie filtry</h3>
                    <div class="filter-buttons">
                        <button class="filter-btn" onclick="reportsBatch.quickFilter('today')">
                            📅 Dziś
                        </button>
                        <button class="filter-btn" onclick="reportsBatch.quickFilter('week')">
                            📊 Tydzień
                        </button>
                        <button class="filter-btn" onclick="reportsBatch.quickFilter('month')">
                            📈 Miesiąc
                        </button>
                        <button class="filter-btn" onclick="reportsBatch.quickFilter('failed')">
                            ⚠️ Awarie
                        </button>
                    </div>
                </div>

                <!-- Active Batch Jobs -->
                <div class="batch-status">
                    <h3>Aktywne zadania</h3>
                    <div class="jobs-list">
                        ${this.getActiveBatchJobsHTML()}
                    </div>
                </div>

                <!-- Recent Batch Reports -->
                <div class="recent-batches">
                    <h3>Ostatnie zbiorcze</h3>
                    <div class="compact-list">
                        ${this.getRecentBatchReportsHTML()}
                    </div>
                </div>
            </div>

            <style>
                .reports-batch.compact-view {
                    padding: 8px;
                    max-width: 400px;
                }
                
                .compact-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    height: 40px;
                }
                
                .compact-header h2 {
                    margin: 0;
                    font-size: 18px;
                }
                
                .templates-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                
                .template-card {
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    padding: 12px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    height: 80px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                
                .template-card:hover {
                    background: #f8f9fa;
                    border-color: #007bff;
                }
                
                .template-card:active {
                    transform: scale(0.98);
                }
                
                .template-icon {
                    font-size: 24px;
                    margin-bottom: 4px;
                }
                
                .template-name {
                    font-size: 12px;
                    font-weight: bold;
                    color: #333;
                }
                
                .filter-buttons {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4px;
                    margin-bottom: 16px;
                }
                
                .filter-btn {
                    height: 36px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                }
                
                .filter-btn:hover {
                    background: #e9ecef;
                }
                
                .filter-btn.active {
                    background: #007bff;
                    color: white;
                    border-color: #007bff;
                }
                
                .jobs-list, .compact-list {
                    max-height: 150px;
                    overflow-y: auto;
                }
                
                .job-item, .batch-item {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    padding: 8px;
                    margin-bottom: 4px;
                    font-size: 12px;
                }
                
                .job-status {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .status-badge {
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 10px;
                    font-weight: bold;
                }
                
                .status-badge.processing {
                    background: #fff3cd;
                    color: #856404;
                }
                
                .status-badge.completed {
                    background: #d4edda;
                    color: #155724;
                }
                
                h3 {
                    font-size: 14px;
                    margin: 12px 0 8px 0;
                    color: #495057;
                }
            </style>
        `;
    }

    getBatchTemplatesHTML() {
        return Array.from(this.batchTemplates.values()).map(template => `
            <div class="template-card" onclick="reportsBatch.selectBatchTemplate('${template.id}')">
                <div class="template-icon">${template.icon}</div>
                <div class="template-name">${template.name}</div>
            </div>
        `).join('');
    }

    getActiveBatchJobsHTML() {
        if (this.batchJobs.size === 0) {
            return '<div class="no-jobs">Brak aktywnych zadań</div>';
        }

        return Array.from(this.batchJobs.values()).map(job => `
            <div class="job-item">
                <div class="job-status">
                    <span class="job-name">${job.name}</span>
                    <span class="status-badge ${job.status}">${job.status}</span>
                </div>
                <div class="job-progress">
                    <div class="progress-bar-mini">
                        <div class="progress-fill-mini" style="width: ${job.progress}%"></div>
                    </div>
                    <span class="progress-text">${job.progress}%</span>
                </div>
            </div>
        `).join('');
    }

    getRecentBatchReportsHTML() {
        // Mock data for demonstration - in production this would come from storage
        const recentBatches = [
            { id: 'BATCH-001', type: 'customer', name: 'Firma ABC', date: '2024-01-15', reports: 12 },
            { id: 'BATCH-002', type: 'period', name: 'Styczeń 2024', date: '2024-01-14', reports: 45 },
            { id: 'BATCH-003', type: 'failure_analysis', name: 'Analiza awarii', date: '2024-01-13', reports: 8 }
        ];

        return recentBatches.map(batch => `
            <div class="batch-item" onclick="reportsBatch.viewBatchReport('${batch.id}')">
                <div class="batch-main">
                    <div class="batch-id">${batch.id}</div>
                    <div class="batch-name">${this.truncateText(batch.name, 18)}</div>
                </div>
                <div class="batch-stats">
                    <span class="reports-count">${batch.reports} rap.</span>
                </div>
            </div>
        `).join('');
    }

    // Batch template selection
    selectBatchTemplate(templateId) {
        const template = this.batchTemplates.get(templateId);
        if (!template) return;

        this.showBatchConfiguration(template);
    }

    showBatchConfiguration(template) {
        const content = document.getElementById('menu-content');
        content.innerHTML = `
            <div class="batch-config compact-view">
                <div class="compact-header">
                    <h2>${template.name}</h2>
                    <button class="btn-back" onclick="reportsBatch.showBatchReports()">◀</button>
                </div>

                <div class="config-section">
                    <div class="template-info">
                        <div class="template-icon-large">${template.icon}</div>
                        <div class="template-desc">${template.description}</div>
                    </div>
                </div>

                <div class="config-section">
                    <label>Okres danych:</label>
                    <select id="date-range" class="form-control">
                        <option value="today">Dzisiaj</option>
                        <option value="week">Ostatni tydzień</option>
                        <option value="month" selected>Ostatni miesiąc</option>
                        <option value="custom">Niestandardowy</option>
                    </select>
                </div>

                ${this.getTemplateSpecificConfigHTML(template)}

                <div class="config-section">
                    <label>Format eksportu:</label>
                    <div class="format-buttons">
                        <button class="format-btn active" data-format="pdf">📄 PDF</button>
                        <button class="format-btn" data-format="xml">📋 XML</button>
                        <button class="format-btn" data-format="csv">📊 CSV</button>
                    </div>
                </div>

                <div class="batch-preview">
                    <h3>Podgląd danych</h3>
                    <div class="preview-stats">
                        <div class="stat-item">
                            <span class="stat-value">${this.getPreviewCount(template)}</span>
                            <span class="stat-label">Raporty</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${this.getPreviewCustomers()}</span>
                            <span class="stat-label">Klienci</span>
                        </div>
                    </div>
                </div>

                <div class="config-actions">
                    <button class="btn-generate-batch" onclick="reportsBatch.generateBatch('${template.id}')">
                        📊 Generuj raport zbiorczy
                    </button>
                </div>
            </div>

            <style>
                .batch-config.compact-view {
                    padding: 8px;
                }
                
                .template-info {
                    text-align: center;
                    padding: 16px;
                    background: #f8f9fa;
                    border-radius: 6px;
                    margin-bottom: 16px;
                }
                
                .template-icon-large {
                    font-size: 48px;
                    margin-bottom: 8px;
                }
                
                .template-desc {
                    font-size: 14px;
                    color: #666;
                }
                
                .config-section {
                    margin-bottom: 16px;
                }
                
                .config-section label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: bold;
                    font-size: 14px;
                }
                
                .form-control {
                    width: 100%;
                    height: 40px;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                }
                
                .preview-stats {
                    display: flex;
                    justify-content: space-around;
                    background: #e9ecef;
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 16px;
                }
                
                .stat-item {
                    text-align: center;
                }
                
                .stat-value {
                    display: block;
                    font-size: 20px;
                    font-weight: bold;
                    color: #007bff;
                }
                
                .stat-label {
                    font-size: 12px;
                    color: #666;
                }
                
                .btn-generate-batch {
                    width: 100%;
                    height: 48px;
                    background: #17a2b8;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                }
                
                .btn-generate-batch:active {
                    transform: scale(0.98);
                }
            </style>
        `;

        this.setupFormatButtons();
    }

    getTemplateSpecificConfigHTML(template) {
        switch (template.id) {
            case 'customer':
                return `
                    <div class="config-section">
                        <label>Wybierz klienta:</label>
                        <select id="customer-select" class="form-control">
                            ${this.getCustomerOptionsHTML()}
                        </select>
                    </div>
                `;
            case 'device_type':
                return `
                    <div class="config-section">
                        <label>Typ urządzenia:</label>
                        <select id="device-type-select" class="form-control">
                            <option value="PP_MASK">Maska pełnotwarzowa</option>
                            <option value="SCBA">SCBA</option>
                            <option value="NP_MASK">Maska niepełnotwarzowa</option>
                            <option value="CPS">CPS</option>
                        </select>
                    </div>
                `;
            case 'failure_analysis':
                return `
                    <div class="config-section">
                        <label>Typ analizy:</label>
                        <select id="analysis-type" class="form-control">
                            <option value="pressure">Problemy z ciśnieniem</option>
                            <option value="flow">Problemy z przepływem</option>
                            <option value="seal">Problemy z uszczelnieniem</option>
                            <option value="all">Wszystkie awarie</option>
                        </select>
                    </div>
                `;
            default:
                return '';
        }
    }

    getCustomerOptionsHTML() {
        const customers = new Set(this.core.getAllReports().map(r => r.customer));
        return Array.from(customers).map(customer => 
            `<option value="${customer}">${this.truncateText(customer, 30)}</option>`
        ).join('');
    }

    // Batch generation
    generateBatch(templateId) {
        const template = this.batchTemplates.get(templateId);
        const config = this.getBatchConfigFromForm();
        
        const batchId = this.createBatchJob(templateId, template.name, config);
        this.showBatchProgress(batchId);
        this.processBatchGeneration(batchId);
    }

    createBatchJob(templateId, name, config) {
        const batchId = 'BATCH-' + Date.now().toString(36);
        
        this.batchJobs.set(batchId, {
            id: batchId,
            templateId,
            name,
            config,
            status: 'processing',
            progress: 0,
            startTime: new Date(),
            reports: []
        });
        
        return batchId;
    }

    showBatchProgress(batchId) {
        const job = this.batchJobs.get(batchId);
        const content = document.getElementById('menu-content');
        
        content.innerHTML = `
            <div class="batch-progress compact-view">
                <div class="compact-header">
                    <h2>Generowanie...</h2>
                </div>

                <div class="batch-info">
                    <div class="info-item">
                        <span class="label">ID:</span>
                        <span class="value">${job.id}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Typ:</span>
                        <span class="value">${job.name}</span>
                    </div>
                </div>

                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="batch-progress-${batchId}" style="width: 0%"></div>
                    </div>
                    <div class="progress-text" id="batch-text-${batchId}">Rozpoczynanie...</div>
                </div>

                <div class="batch-steps">
                    <div class="step active">📊 Zbieranie</div>
                    <div class="step">🔍 Analiza</div>
                    <div class="step">📄 Generowanie</div>
                    <div class="step">✅ Finalizacja</div>
                </div>

                <div class="estimated-time">
                    <small>Szacowany czas: 2-3 minuty</small>
                </div>
            </div>

            <style>
                .batch-info {
                    background: #f8f9fa;
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 16px;
                }
                
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }
                
                .info-item .label {
                    font-weight: bold;
                    color: #666;
                }
                
                .batch-steps {
                    display: flex;
                    justify-content: space-between;
                    margin: 16px 0;
                }
                
                .estimated-time {
                    text-align: center;
                    color: #666;
                    margin-top: 12px;
                }
            </style>
        `;
    }

    processBatchGeneration(batchId) {
        const job = this.batchJobs.get(batchId);
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 12 + 3;
            if (progress > 100) progress = 100;
            
            job.progress = progress;
            
            const progressBar = document.getElementById(`batch-progress-${batchId}`);
            const progressText = document.getElementById(`batch-text-${batchId}`);
            
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
            
            if (progressText) {
                if (progress < 25) {
                    progressText.textContent = 'Zbieranie danych...';
                } else if (progress < 50) {
                    progressText.textContent = 'Analiza wyników...';
                } else if (progress < 75) {
                    progressText.textContent = 'Generowanie raportu...';
                } else if (progress < 100) {
                    progressText.textContent = 'Finalizacja...';
                } else {
                    progressText.textContent = 'Raport zbiorczy gotowy!';
                    job.status = 'completed';
                    clearInterval(interval);
                    setTimeout(() => this.completeBatchGeneration(batchId), 1500);
                }
            }
            
            this.updateBatchSteps(progress);
        }, 400);
    }

    updateBatchSteps(progress) {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            step.classList.remove('active');
            if (progress >= index * 25) {
                step.classList.add('active');
            }
        });
    }

    completeBatchGeneration(batchId) {
        const job = this.batchJobs.get(batchId);
        
        this.showSuccess(`Raport zbiorczy ${job.id} został wygenerowany!`);
        
        setTimeout(() => {
            this.showBatchReports();
        }, 2000);
    }

    // Analysis methods
    calculateStatistics(reports) {
        return {
            total: reports.length,
            passed: reports.filter(r => r.result === 'PASS').length,
            failed: reports.filter(r => r.result === 'FAIL').length,
            avgPressureLeak: this.calculateAverage(reports, 'testData.pressureLeak'),
            avgFlowRate: this.calculateAverage(reports, 'testData.flowRate'),
            avgTemperature: this.calculateAverage(reports, 'testData.temperature')
        };
    }

    calculateTrends(reports) {
        // Simple trend analysis
        const sortedReports = reports.sort((a, b) => new Date(a.date) - new Date(b.date));
        const recentReports = sortedReports.slice(-10);
        const earlierReports = sortedReports.slice(-20, -10);
        
        return {
            successRate: {
                recent: recentReports.filter(r => r.result === 'PASS').length / recentReports.length,
                previous: earlierReports.filter(r => r.result === 'PASS').length / earlierReports.length
            }
        };
    }

    calculateQualityMetrics(reports) {
        return {
            compliance: this.calculateCompliance(reports),
            reliability: this.calculateReliability(reports),
            performance: this.calculatePerformance(reports)
        };
    }

    // Utility methods
    calculateAverage(reports, path) {
        const values = reports.map(r => this.getNestedProperty(r, path)).filter(v => v != null);
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }

    getNestedProperty(obj, path) {
        return path.split('.').reduce((o, p) => o && o[p], obj);
    }

    calculateCompliance(reports) {
        // Simplified compliance calculation
        return Math.round((reports.filter(r => r.result === 'PASS').length / reports.length) * 100);
    }

    calculateReliability(reports) {
        // Simplified reliability calculation
        return Math.round(Math.random() * 20 + 80); // Mock calculation
    }

    calculatePerformance(reports) {
        // Simplified performance calculation
        return Math.round(Math.random() * 15 + 85); // Mock calculation
    }

    getBatchConfigFromForm() {
        return {
            dateRange: document.getElementById('date-range')?.value || 'month',
            format: document.querySelector('.format-btn.active')?.dataset.format || 'pdf',
            customer: document.getElementById('customer-select')?.value,
            deviceType: document.getElementById('device-type-select')?.value,
            analysisType: document.getElementById('analysis-type')?.value
        };
    }

    getPreviewCount(template) {
        // Mock preview count based on template
        switch (template.id) {
            case 'customer': return Math.floor(Math.random() * 20 + 5);
            case 'period': return Math.floor(Math.random() * 50 + 15);
            case 'device_type': return Math.floor(Math.random() * 30 + 10);
            case 'failure_analysis': return Math.floor(Math.random() * 10 + 3);
            default: return Math.floor(Math.random() * 25 + 8);
        }
    }

    getPreviewCustomers() {
        return Math.floor(Math.random() * 5 + 2);
    }

    quickFilter(filterType) {
        // Remove active class from all buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        event.target.classList.add('active');
        
        // Apply quick filter logic
        console.log('Applying quick filter:', filterType);
        // In production, this would filter the data and update the view
    }

    setupFormatButtons() {
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1000;
            font-size: 14px;
            max-width: 360px;
            text-align: center;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    handleDataUpdate(eventData) {
        console.log('Handling data update:', eventData);
    }

    viewBatchReport(batchId) {
        console.log('Viewing batch report:', batchId);
        // In production, this would show the batch report details
    }
}

// Export for modular architecture
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportsBatch;
}
