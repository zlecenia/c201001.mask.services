/**
 * MASKSERVICE C20 - Reports Generation Module
 * Report generation and export functionality
 * Optimized for 400x1280 display (7.9" LCD IPS touchscreen)
 */

class ReportsGeneration {
    constructor(core) {
        this.core = core;
        this.activeGenerations = new Map();
        this.exportQueue = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('✅ ReportsGeneration initialized for narrow display');
    }

    setupEventListeners() {
        document.addEventListener('reportsCore:reportAdded', (e) => {
            this.handleNewReport(e.detail);
        });
    }

    // Main UI method optimized for narrow display
    showReportsGeneration() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getCompactGenerationHTML();
        }
    }

    getCompactGenerationHTML() {
        const displayConfig = this.core.getDisplayConfig();
        
        return `
            <div class="reports-generation compact-view">
                <div class="compact-header">
                    <h2>Generowanie</h2>
                    <button class="btn-back" onclick="testReportsEnhanced.showReports()">◀</button>
                </div>

                <!-- Quick Actions - Stacked for narrow display -->
                <div class="quick-actions">
                    <button class="action-btn primary" onclick="reportsGeneration.quickGenerate('single')">
                        📄 Pojedynczy
                    </button>
                    <button class="action-btn secondary" onclick="reportsGeneration.quickGenerate('batch')">
                        📚 Zbiorczy
                    </button>
                </div>

                <!-- Recent Reports - Compact list -->
                <div class="recent-reports">
                    <h3>Ostatnie raporty</h3>
                    <div class="compact-list">
                        ${this.getRecentReportsHTML()}
                    </div>
                </div>

                <!-- Export Formats - Horizontal layout -->
                <div class="export-formats">
                    <h3>Format eksportu</h3>
                    <div class="format-buttons">
                        <button class="format-btn" onclick="reportsGeneration.setExportFormat('pdf')">
                            📄 PDF
                        </button>
                        <button class="format-btn" onclick="reportsGeneration.setExportFormat('xml')">
                            📋 XML
                        </button>
                        <button class="format-btn" onclick="reportsGeneration.setExportFormat('csv')">
                            📊 CSV
                        </button>
                    </div>
                </div>

                <!-- Generation Status -->
                <div class="generation-status">
                    <h3>Status generowania</h3>
                    <div class="status-info">
                        <div class="status-item">
                            <span class="label">Aktywne:</span>
                            <span class="value">${this.activeGenerations.size}</span>
                        </div>
                        <div class="status-item">
                            <span class="label">Kolejka:</span>
                            <span class="value">${this.exportQueue.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .reports-generation.compact-view {
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
                
                .btn-back {
                    width: 40px;
                    height: 40px;
                    border: none;
                    background: #007bff;
                    color: white;
                    border-radius: 4px;
                    font-size: 16px;
                    cursor: pointer;
                }
                
                .quick-actions {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                
                .action-btn {
                    flex: 1;
                    height: 48px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .action-btn.primary {
                    background: #28a745;
                    color: white;
                }
                
                .action-btn.secondary {
                    background: #17a2b8;
                    color: white;
                }
                
                .action-btn:active {
                    transform: scale(0.98);
                }
                
                .compact-list {
                    max-height: 200px;
                    overflow-y: auto;
                }
                
                .format-buttons {
                    display: flex;
                    gap: 4px;
                }
                
                .format-btn {
                    flex: 1;
                    height: 40px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                }
                
                .format-btn.active {
                    background: #007bff;
                    color: white;
                    border-color: #007bff;
                }
                
                .status-info {
                    display: flex;
                    justify-content: space-between;
                }
                
                .status-item {
                    display: flex;
                    flex-direction: column;
                    text-align: center;
                }
                
                .status-item .label {
                    font-size: 12px;
                    color: #666;
                }
                
                .status-item .value {
                    font-size: 18px;
                    font-weight: bold;
                    color: #333;
                }
            </style>
        `;
    }

    getRecentReportsHTML() {
        const reports = this.core.getAllReports().slice(0, 5); // Show only 5 for narrow display
        
        return reports.map(report => `
            <div class="compact-report-item" onclick="reportsGeneration.selectReport('${report.id}')">
                <div class="report-main">
                    <div class="report-id">${report.id}</div>
                    <div class="report-customer">${this.truncateText(report.customer, 20)}</div>
                </div>
                <div class="report-status ${report.result.toLowerCase()}">
                    ${report.result}
                </div>
            </div>
        `).join('');
    }

    // Quick generation methods
    quickGenerate(type) {
        if (type === 'single') {
            this.showSingleReportForm();
        } else if (type === 'batch') {
            this.showBatchSelectionForm();
        }
    }

    showSingleReportForm() {
        const content = document.getElementById('menu-content');
        content.innerHTML = `
            <div class="single-report-form compact-view">
                <div class="compact-header">
                    <h2>Pojedynczy raport</h2>
                    <button class="btn-back" onclick="reportsGeneration.showReportsGeneration()">◀</button>
                </div>

                <div class="form-section">
                    <label>Wybierz raport:</label>
                    <select id="report-select" class="form-control">
                        ${this.getReportOptionsHTML()}
                    </select>
                </div>

                <div class="form-section">
                    <label>Format eksportu:</label>
                    <div class="format-buttons">
                        <button class="format-btn active" data-format="pdf">📄 PDF</button>
                        <button class="format-btn" data-format="xml">📋 XML</button>
                        <button class="format-btn" data-format="csv">📊 CSV</button>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="btn-generate" onclick="reportsGeneration.generateSingle()">
                        📄 Generuj raport
                    </button>
                </div>
            </div>

            <style>
                .single-report-form {
                    padding: 8px;
                }
                
                .form-section {
                    margin-bottom: 16px;
                }
                
                .form-section label {
                    display: block;
                    margin-bottom: 8px;
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
                
                .btn-generate {
                    width: 100%;
                    height: 48px;
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                }
                
                .btn-generate:active {
                    transform: scale(0.98);
                }
            </style>
        `;

        this.setupFormatButtons();
    }

    setupFormatButtons() {
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    getReportOptionsHTML() {
        return this.core.getAllReports().map(report => 
            `<option value="${report.id}">${report.id} - ${this.truncateText(report.customer, 25)}</option>`
        ).join('');
    }

    // Generation methods
    generateSingle() {
        const reportId = document.getElementById('report-select').value;
        const format = document.querySelector('.format-btn.active').dataset.format;
        
        if (!reportId) {
            this.showError('Wybierz raport do wygenerowania');
            return;
        }

        this.startGeneration(reportId, format, 'single');
    }

    startGeneration(reportId, format, type) {
        const generationId = this.generateId();
        
        this.activeGenerations.set(generationId, {
            id: generationId,
            reportId,
            format,
            type,
            status: 'processing',
            progress: 0,
            startTime: new Date()
        });

        this.showGenerationProgress(generationId);
        this.processGeneration(generationId);
    }

    showGenerationProgress(generationId) {
        const generation = this.activeGenerations.get(generationId);
        const content = document.getElementById('menu-content');
        
        content.innerHTML = `
            <div class="generation-progress compact-view">
                <div class="compact-header">
                    <h2>Generowanie...</h2>
                </div>

                <div class="progress-info">
                    <div class="progress-label">ID: ${generation.id}</div>
                    <div class="progress-label">Format: ${generation.format.toUpperCase()}</div>
                </div>

                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-${generationId}" style="width: 0%"></div>
                    </div>
                    <div class="progress-text" id="progress-text-${generationId}">Rozpoczynanie...</div>
                </div>

                <div class="progress-steps">
                    <div class="step active">📊 Dane</div>
                    <div class="step">📋 Analiza</div>
                    <div class="step">📄 Dokument</div>
                    <div class="step">✅ Finalizacja</div>
                </div>
            </div>

            <style>
                .progress-bar-container {
                    margin: 20px 0;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: #eee;
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .progress-fill {
                    height: 100%;
                    background: #28a745;
                    transition: width 0.3s ease;
                }
                
                .progress-text {
                    text-align: center;
                    margin-top: 8px;
                    font-size: 14px;
                    color: #666;
                }
                
                .progress-steps {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 20px;
                }
                
                .step {
                    flex: 1;
                    text-align: center;
                    padding: 8px 4px;
                    font-size: 12px;
                    color: #999;
                    border-radius: 4px;
                }
                
                .step.active {
                    background: #e3f2fd;
                    color: #1976d2;
                    font-weight: bold;
                }
            </style>
        `;
    }

    processGeneration(generationId) {
        const generation = this.activeGenerations.get(generationId);
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress > 100) progress = 100;
            
            const progressBar = document.getElementById(`progress-${generationId}`);
            const progressText = document.getElementById(`progress-text-${generationId}`);
            
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
            
            if (progressText) {
                if (progress < 25) {
                    progressText.textContent = 'Zbieranie danych...';
                } else if (progress < 50) {
                    progressText.textContent = 'Analiza wyników...';
                } else if (progress < 75) {
                    progressText.textContent = 'Generowanie dokumentu...';
                } else if (progress < 100) {
                    progressText.textContent = 'Finalizacja...';
                } else {
                    progressText.textContent = 'Gotowe!';
                    clearInterval(interval);
                    setTimeout(() => this.completeGeneration(generationId), 1000);
                }
            }
            
            // Update step indicators
            this.updateProgressSteps(progress);
        }, 300);
    }

    updateProgressSteps(progress) {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            step.classList.remove('active');
            if (progress >= index * 25) {
                step.classList.add('active');
            }
        });
    }

    completeGeneration(generationId) {
        const generation = this.activeGenerations.get(generationId);
        
        this.showSuccess(`Raport ${generation.reportId} został wygenerowany w formacie ${generation.format.toUpperCase()}`);
        
        this.activeGenerations.delete(generationId);
        
        setTimeout(() => {
            this.showReportsGeneration();
        }, 2000);
    }

    // Export format generators
    generatePDF(reportData) {
        console.log('Generating PDF report:', reportData);
        return new Blob(['PDF content placeholder'], { type: 'application/pdf' });
    }

    generateXML(reportData) {
        const report = this.core.getReport(reportData.id);
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<TestReport>
    <ID>${report.id}</ID>
    <Date>${report.date}</Date>
    <Device>
        <Serial>${report.deviceSerial}</Serial>
        <Type>${report.deviceType}</Type>
    </Device>
    <Customer>${report.customer}</Customer>
    <Result>${report.result}</Result>
    <TestData>
        <PressureLeak>${report.testData.pressureLeak}</PressureLeak>
        <FlowRate>${report.testData.flowRate}</FlowRate>
        <Temperature>${report.testData.temperature}</Temperature>
    </TestData>
</TestReport>`;
        return new Blob([xml], { type: 'application/xml' });
    }

    generateCSV(reportData) {
        const report = this.core.getReport(reportData.id);
        const csv = `ID;Date;DeviceSerial;DeviceType;Customer;Result;PressureLeak;FlowRate;Temperature
${report.id};${report.date};${report.deviceSerial};${report.deviceType};${report.customer};${report.result};${report.testData.pressureLeak};${report.testData.flowRate};${report.testData.temperature}`;
        return new Blob([csv], { type: 'text/csv' });
    }

    // Utility methods
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    generateId() {
        return 'GEN-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #dc3545;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1000;
            font-size: 14px;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
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

    handleNewReport(reportData) {
        // Handle new report events
        console.log('New report added:', reportData);
    }
}

// Export for modular architecture
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportsGeneration;
}
