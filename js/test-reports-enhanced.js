/**
 * MASKSERVICE C20 - Enhanced Test Reports Module
 * Batch report generation with multiple formats (PDF, XML, CSV)
 * Compliance with PN-EN 136/137 standards
 */

class TestReportsEnhanced {
    constructor() {
        this.reports = new Map();
        this.templates = new Map();
        this.exportFormats = new Map();
        this.notifications = new Map();
        this.init();
    }

    init() {
        this.loadReportTemplates();
        this.setupExportFormats();
        this.loadMockReports();
        this.setupNotifications();
    }

    // Batch report generation capabilities
    batchReports = {
        generateByCustomer: true,
        generateByPeriod: true,
        generateByDeviceType: true,
        statisticalAnalysis: true
    };

    // Export formats configuration
    exportFormats = {
        pdf: {
            template: 'standard_PN_EN_136',
            includeGraphs: true,
            digitalSignature: true,
            compression: true
        },
        xml: {
            schema: 'device_test_v2',
            validation: true,
            encoding: 'UTF-8'
        },
        csv: {
            delimiter: ';',
            encoding: 'UTF-8',
            includeHeaders: true
        }
    };

    loadReportTemplates() {
        // Standard report templates based on PN-EN standards
        const templates = [
            {
                id: 'pn_en_136',
                name: 'PN-EN 136 - Respiratory protective devices',
                fields: ['device_info', 'test_conditions', 'pressure_tests', 'leak_tests', 'results'],
                format: 'pdf'
            },
            {
                id: 'pn_en_137',
                name: 'PN-EN 137 - Respiratory protective devices - Self-contained open-circuit compressed air breathing apparatus',
                fields: ['device_info', 'test_conditions', 'performance_tests', 'safety_tests', 'results'],
                format: 'pdf'
            },
            {
                id: 'batch_summary',
                name: 'Batch Summary Report',
                fields: ['period_summary', 'device_statistics', 'compliance_status', 'recommendations'],
                format: 'pdf'
            }
        ];

        templates.forEach(template => {
            this.templates.set(template.id, template);
        });
    }

    setupExportFormats() {
        this.exportFormats.set('pdf', {
            mimeType: 'application/pdf',
            extension: '.pdf',
            generator: this.generatePDF.bind(this)
        });

        this.exportFormats.set('xml', {
            mimeType: 'application/xml',
            extension: '.xml',
            generator: this.generateXML.bind(this)
        });

        this.exportFormats.set('csv', {
            mimeType: 'text/csv',
            extension: '.csv',
            generator: this.generateCSV.bind(this)
        });
    }

    loadMockReports() {
        // Mock report data
        const mockReports = [
            {
                id: 'RPT-001',
                date: '2024-01-15',
                deviceSerial: 'PP001',
                deviceType: 'PP_MASK',
                customer: 'Firma ABC',
                scenario: 'scenario_1',
                result: 'PASS',
                testData: {
                    pressureLeak: 0.2,
                    flowRate: 45.2,
                    temperature: 22.5
                }
            },
            {
                id: 'RPT-002',
                date: '2024-01-16',
                deviceSerial: 'NP002',
                deviceType: 'NP_MASK',
                customer: 'Firma XYZ',
                scenario: 'scenario_2',
                result: 'FAIL',
                testData: {
                    pressureLeak: 1.5,
                    flowRate: 30.1,
                    temperature: 23.1
                }
            },
            {
                id: 'RPT-003',
                date: '2024-01-17',
                deviceSerial: 'SCBA003',
                deviceType: 'SCBA',
                customer: 'Straż Pożarna',
                scenario: 'scenario_3',
                result: 'PASS',
                testData: {
                    pressureLeak: 0.1,
                    flowRate: 52.8,
                    temperature: 21.9
                }
            }
        ];

        mockReports.forEach(report => {
            this.reports.set(report.id, report);
        });
    }

    setupNotifications() {
        this.notifications.set('upcomingTests', {
            enabled: true,
            frequency: 'weekly',
            recipients: ['admin@company.com']
        });

        this.notifications.set('testFailures', {
            enabled: true,
            frequency: 'immediate',
            recipients: ['tech@company.com', 'admin@company.com']
        });

        this.notifications.set('calibrationReminders', {
            enabled: true,
            frequency: 'monthly',
            recipients: ['service@company.com']
        });
    }

    // Enhanced report template
    getEnhancedReportsHTML() {
        return `
            <div class="test-reports-enhanced">
                <div class="reports-header">
                    <h2>Raporty testowe - Rozszerzone</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="testReportsEnhanced.showBatchGenerator()">
                            📊 Generator raportów zbiorczych
                        </button>
                        <button class="btn btn-secondary" onclick="testReportsEnhanced.showReportScheduler()">
                            ⏰ Harmonogram raportów
                        </button>
                    </div>
                </div>

                <!-- Report Filters -->
                <div class="report-filters">
                    <h3>Filtry raportów</h3>
                    <div class="filter-grid">
                        <div class="filter-group">
                            <label>Klient:</label>
                            <select id="customer-filter" onchange="testReportsEnhanced.applyFilter()">
                                <option value="">Wszyscy klienci</option>
                                <option value="Firma ABC">Firma ABC</option>
                                <option value="Firma XYZ">Firma XYZ</option>
                                <option value="Straż Pożarna">Straż Pożarna</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>Typ urządzenia:</label>
                            <select id="device-type-filter" onchange="testReportsEnhanced.applyFilter()">
                                <option value="">Wszystkie typy</option>
                                <option value="PP_MASK">PP Mask</option>
                                <option value="NP_MASK">NP Mask</option>
                                <option value="SCBA">SCBA</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>Okres:</label>
                            <input type="date" id="date-from" onchange="testReportsEnhanced.applyFilter()">
                            <input type="date" id="date-to" onchange="testReportsEnhanced.applyFilter()">
                        </div>
                        <div class="filter-group">
                            <label>Status:</label>
                            <select id="status-filter" onchange="testReportsEnhanced.applyFilter()">
                                <option value="">Wszystkie</option>
                                <option value="PASS">Zaliczone</option>
                                <option value="FAIL">Niezaliczone</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Reports List -->
                <div class="reports-list-enhanced">
                    <h3>Lista raportów</h3>
                    <div class="reports-table">
                        <div class="table-header">
                            <div class="col-id">ID</div>
                            <div class="col-date">Data</div>
                            <div class="col-device">Urządzenie</div>
                            <div class="col-customer">Klient</div>
                            <div class="col-result">Wynik</div>
                            <div class="col-actions">Akcje</div>
                        </div>
                        <div class="table-body" id="reports-table-body">
                            ${this.getReportsTableHTML()}
                        </div>
                    </div>
                </div>

                <!-- Batch Operations -->
                <div class="batch-operations">
                    <h3>Operacje zbiorcze</h3>
                    <div class="batch-controls">
                        <button class="btn btn-info" onclick="testReportsEnhanced.selectAllReports()">
                            ☑️ Zaznacz wszystkie
                        </button>
                        <button class="btn btn-warning" onclick="testReportsEnhanced.deselectAllReports()">
                            ☐ Odznacz wszystkie
                        </button>
                        <button class="btn btn-success" onclick="testReportsEnhanced.exportSelectedReports()">
                            📤 Eksportuj zaznaczone
                        </button>
                        <button class="btn btn-danger" onclick="testReportsEnhanced.deleteSelectedReports()">
                            🗑️ Usuń zaznaczone
                        </button>
                    </div>
                </div>

                <!-- Statistics Panel -->
                <div class="statistics-panel">
                    <h3>Statystyki</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${this.reports.size}</div>
                            <div class="stat-label">Łączna liczba raportów</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getPassRate()}%</div>
                            <div class="stat-label">Wskaźnik zaliczalności</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getUniqueCustomers()}</div>
                            <div class="stat-label">Liczba klientów</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getReportsThisMonth()}</div>
                            <div class="stat-label">Raporty w tym miesiącu</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getReportsTableHTML() {
        let html = '';
        Array.from(this.reports.values()).forEach(report => {
            const resultClass = report.result.toLowerCase();
            html += `
                <div class="table-row" data-report-id="${report.id}">
                    <div class="col-checkbox">
                        <input type="checkbox" class="report-checkbox" value="${report.id}">
                    </div>
                    <div class="col-id">${report.id}</div>
                    <div class="col-date">${report.date}</div>
                    <div class="col-device">${report.deviceSerial} (${report.deviceType})</div>
                    <div class="col-customer">${report.customer}</div>
                    <div class="col-result">
                        <span class="result-badge ${resultClass}">${report.result}</span>
                    </div>
                    <div class="col-actions">
                        <button class="btn-small btn-info" onclick="testReportsEnhanced.viewReport('${report.id}')">
                            👁️ Podgląd
                        </button>
                        <button class="btn-small btn-primary" onclick="testReportsEnhanced.downloadReport('${report.id}', 'pdf')">
                            📄 PDF
                        </button>
                        <button class="btn-small btn-secondary" onclick="testReportsEnhanced.downloadReport('${report.id}', 'xml')">
                            📄 XML
                        </button>
                    </div>
                </div>
            `;
        });
        return html;
    }

    // Batch report generator
    showBatchGenerator() {
        const content = document.getElementById('menu-content');
        content.innerHTML = `
            <div class="batch-generator">
                <h2>Generator raportów zbiorczych</h2>
                
                <div class="generator-options">
                    <div class="option-group">
                        <h3>Typ raportu zbiorczego</h3>
                        <label><input type="radio" name="batch-type" value="customer" checked> Według klienta</label>
                        <label><input type="radio" name="batch-type" value="period"> Według okresu</label>
                        <label><input type="radio" name="batch-type" value="device-type"> Według typu urządzenia</label>
                        <label><input type="radio" name="batch-type" value="statistical"> Analiza statystyczna</label>
                    </div>

                    <div class="option-group">
                        <h3>Parametry</h3>
                        <div id="batch-parameters">
                            <div class="parameter-group">
                                <label>Klient:</label>
                                <select id="batch-customer">
                                    <option value="">Wybierz klienta</option>
                                    <option value="Firma ABC">Firma ABC</option>
                                    <option value="Firma XYZ">Firma XYZ</option>
                                    <option value="Straż Pożarna">Straż Pożarna</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="option-group">
                        <h3>Format eksportu</h3>
                        <label><input type="radio" name="export-format" value="pdf" checked> PDF</label>
                        <label><input type="radio" name="export-format" value="xml"> XML</label>
                        <label><input type="radio" name="export-format" value="csv"> CSV</label>
                    </div>

                    <div class="option-group">
                        <h3>Opcje dodatkowe</h3>
                        <label><input type="checkbox" id="include-graphs" checked> Dołącz wykresy</label>
                        <label><input type="checkbox" id="digital-signature"> Podpis cyfrowy</label>
                        <label><input type="checkbox" id="email-delivery"> Wyślij mailem</label>
                        <label><input type="checkbox" id="compress-output"> Kompresja ZIP</label>
                    </div>
                </div>

                <div class="generator-actions">
                    <button class="btn btn-primary" onclick="testReportsEnhanced.generateBatchReport()">
                        🚀 Generuj raport zbiorczy
                    </button>
                    <button class="btn btn-secondary" onclick="testReportsEnhanced.previewBatchReport()">
                        👁️ Podgląd
                    </button>
                    <button class="btn btn-danger" onclick="testReportsEnhanced.backToReports()">
                        ← Powrót
                    </button>
                </div>
            </div>
        `;
    }

    // Report generation methods
    generateBatchReport() {
        const batchType = document.querySelector('input[name="batch-type"]:checked').value;
        const format = document.querySelector('input[name="export-format"]:checked').value;
        const options = {
            includeGraphs: document.getElementById('include-graphs').checked,
            digitalSignature: document.getElementById('digital-signature').checked,
            emailDelivery: document.getElementById('email-delivery').checked,
            compress: document.getElementById('compress-output').checked
        };

        console.log('Generating batch report:', { batchType, format, options });

        this.showGenerationProgress();
        
        // Simulate report generation
        setTimeout(() => {
            this.completeGeneration(batchType, format);
        }, 3000);
    }

    showGenerationProgress() {
        const content = document.getElementById('menu-content');
        content.innerHTML = `
            <div class="generation-progress">
                <h2>Generowanie raportu zbiorczego...</h2>
                <div class="progress-steps">
                    <div class="step active">📊 Zbieranie danych</div>
                    <div class="step">📋 Analiza wyników</div>
                    <div class="step">📄 Generowanie dokumentu</div>
                    <div class="step">✅ Finalizacja</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="generation-progress" style="width: 0%"></div>
                </div>
                <div class="progress-text" id="progress-text">Rozpoczynanie...</div>
            </div>
        `;

        // Animate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 100) progress = 100;
            
            document.getElementById('generation-progress').style.width = progress + '%';
            
            if (progress < 25) {
                document.getElementById('progress-text').textContent = 'Zbieranie danych testowych...';
            } else if (progress < 50) {
                document.getElementById('progress-text').textContent = 'Analiza wyników...';
            } else if (progress < 75) {
                document.getElementById('progress-text').textContent = 'Generowanie dokumentu...';
            } else if (progress < 100) {
                document.getElementById('progress-text').textContent = 'Finalizacja raportu...';
            } else {
                document.getElementById('progress-text').textContent = 'Raport gotowy!';
                clearInterval(interval);
            }
        }, 200);
    }

    completeGeneration(batchType, format) {
        const reportId = this.generateReportId();
        
        alert(`Raport zbiorczy został wygenerowany!\n\nID: ${reportId}\nTyp: ${batchType}\nFormat: ${format.toUpperCase()}\n\nRaport dostępny do pobrania.`);
        
        this.backToReports();
    }

    // Export format generators
    generatePDF(reportData) {
        console.log('Generating PDF report:', reportData);
        // In production, this would use a PDF library like jsPDF
        return new Blob(['PDF content placeholder'], { type: 'application/pdf' });
    }

    generateXML(reportData) {
        console.log('Generating XML report:', reportData);
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<TestReport>
    <ID>${reportData.id}</ID>
    <Date>${reportData.date}</Date>
    <Device>
        <Serial>${reportData.deviceSerial}</Serial>
        <Type>${reportData.deviceType}</Type>
    </Device>
    <Customer>${reportData.customer}</Customer>
    <Result>${reportData.result}</Result>
    <TestData>
        <PressureLeak>${reportData.testData.pressureLeak}</PressureLeak>
        <FlowRate>${reportData.testData.flowRate}</FlowRate>
        <Temperature>${reportData.testData.temperature}</Temperature>
    </TestData>
</TestReport>`;
        return new Blob([xml], { type: 'application/xml' });
    }

    generateCSV(reportData) {
        console.log('Generating CSV report:', reportData);
        const csv = `ID;Date;DeviceSerial;DeviceType;Customer;Result;PressureLeak;FlowRate;Temperature
${reportData.id};${reportData.date};${reportData.deviceSerial};${reportData.deviceType};${reportData.customer};${reportData.result};${reportData.testData.pressureLeak};${reportData.testData.flowRate};${reportData.testData.temperature}`;
        return new Blob([csv], { type: 'text/csv' });
    }

    // Event handlers
    applyFilter() {
        console.log('Applying filters...');
        // Filter implementation would update the table
        this.updateReportsTable();
    }

    updateReportsTable() {
        const tableBody = document.getElementById('reports-table-body');
        if (tableBody) {
            tableBody.innerHTML = this.getReportsTableHTML();
        }
    }

    viewReport(reportId) {
        const report = this.reports.get(reportId);
        if (report) {
            alert(`Podgląd raportu ${reportId}\n\nUrządzenie: ${report.deviceSerial}\nKlient: ${report.customer}\nWynik: ${report.result}\nData: ${report.date}`);
        }
    }

    downloadReport(reportId, format) {
        const report = this.reports.get(reportId);
        if (!report) return;

        const generator = this.exportFormats.get(format);
        if (!generator) return;

        const blob = generator.generator(report);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportId}${generator.extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    selectAllReports() {
        const checkboxes = document.querySelectorAll('.report-checkbox');
        checkboxes.forEach(cb => cb.checked = true);
    }

    deselectAllReports() {
        const checkboxes = document.querySelectorAll('.report-checkbox');
        checkboxes.forEach(cb => cb.checked = false);
    }

    exportSelectedReports() {
        const selected = this.getSelectedReports();
        if (selected.length === 0) {
            alert('Nie wybrano żadnych raportów do eksportu.');
            return;
        }
        
        console.log('Exporting selected reports:', selected);
        alert(`Eksportowanie ${selected.length} raportów...`);
    }

    deleteSelectedReports() {
        const selected = this.getSelectedReports();
        if (selected.length === 0) {
            alert('Nie wybrano żadnych raportów do usunięcia.');
            return;
        }

        if (confirm(`Czy na pewno chcesz usunąć ${selected.length} raportów?`)) {
            selected.forEach(id => this.reports.delete(id));
            this.updateReportsTable();
            alert(`Usunięto ${selected.length} raportów.`);
        }
    }

    getSelectedReports() {
        const checkboxes = document.querySelectorAll('.report-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    backToReports() {
        const content = document.getElementById('menu-content');
        content.innerHTML = this.getEnhancedReportsHTML();
    }

    // Statistics methods
    getPassRate() {
        const total = this.reports.size;
        const passed = Array.from(this.reports.values()).filter(r => r.result === 'PASS').length;
        return total > 0 ? Math.round((passed / total) * 100) : 0;
    }

    getUniqueCustomers() {
        const customers = new Set(Array.from(this.reports.values()).map(r => r.customer));
        return customers.size;
    }

    getReportsThisMonth() {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        return Array.from(this.reports.values()).filter(r => {
            const reportDate = new Date(r.date);
            return reportDate.getMonth() === thisMonth && reportDate.getFullYear() === thisYear;
        }).length;
    }

    generateReportId() {
        return 'BATCH-' + Date.now().toString().slice(-6);
    }

    // Public methods for template integration
    showEnhancedReports() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getEnhancedReportsHTML();
        }
    }

    showReportsView() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getReportsViewHTML();
        }
    }

    showReportsBatch() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getBatchGeneratorHTML();
        }
    }

    showReportsSchedule() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getReportsScheduleHTML();
        }
    }

    // Reports View HTML template (focused on viewing and filtering)
    getReportsViewHTML() {
        return `
            <div class="test-reports-enhanced">
                <div class="reports-header">
                    <h2>Przeglądanie raportów</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="testReportsEnhanced.refreshReports()">
                            🔄 Odśwież
                        </button>
                        <button class="btn btn-secondary" onclick="testReportsEnhanced.exportCurrentView()">
                            📤 Eksportuj widok
                        </button>
                    </div>
                </div>

                <!-- Report Filters -->
                <div class="report-filters">
                    <h3>Filtry raportów</h3>
                    <div class="filter-grid">
                        <div class="filter-group">
                            <label>Klient:</label>
                            <select onchange="testReportsEnhanced.filterByCustomer(this.value)">
                                <option value="">Wszyscy klienci</option>
                                ${this.getUniqueCustomers().map(customer => 
                                    `<option value="${customer}">${customer}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>Status:</label>
                            <select onchange="testReportsEnhanced.filterByStatus(this.value)">
                                <option value="">Wszystkie</option>
                                <option value="PASSED">Pozytywne</option>
                                <option value="FAILED">Negatywne</option>
                                <option value="PENDING">Oczekujące</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>Okres od:</label>
                            <input type="date" onchange="testReportsEnhanced.filterByDateFrom(this.value)">
                        </div>
                        <div class="filter-group">
                            <label>Okres do:</label>
                            <input type="date" onchange="testReportsEnhanced.filterByDateTo(this.value)">
                        </div>
                    </div>
                </div>

                <!-- Reports List -->
                <div class="reports-list-enhanced">
                    <h3>Lista raportów</h3>
                    <div class="reports-table">
                        <div class="table-header">
                            <div class="col-id">ID</div>
                            <div class="col-date">Data</div>
                            <div class="col-customer">Klient</div>
                            <div class="col-device">Urządzenie</div>
                            <div class="col-result">Wynik</div>
                            <div class="col-actions">Akcje</div>
                        </div>
                        ${this.getReportsListHTML()}
                    </div>
                </div>

                <!-- Statistics Panel -->
                <div class="statistics-panel">
                    <h3>Statystyki</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${this.reports.size}</div>
                            <div class="stat-label">Łączna liczba raportów</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getPassedReportsCount()}</div>
                            <div class="stat-label">Pozytywne</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getFailedReportsCount()}</div>
                            <div class="stat-label">Negatywne</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getUniqueCustomersCount()}</div>
                            <div class="stat-label">Klienci</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Reports Schedule HTML template (focused on scheduling and automation)
    getReportsScheduleHTML() {
        return `
            <div class="test-reports-enhanced">
                <div class="reports-header">
                    <h2>Harmonogram raportów</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="testReportsEnhanced.createSchedule()">
                            ➕ Nowy harmonogram
                        </button>
                        <button class="btn btn-secondary" onclick="testReportsEnhanced.importSchedule()">
                            📥 Importuj harmonogram
                        </button>
                    </div>
                </div>

                <!-- Active Schedules -->
                <div class="schedules-section">
                    <h3>Aktywne harmonogramy</h3>
                    <div class="schedules-list">
                        ${this.getActiveSchedulesHTML()}
                    </div>
                </div>

                <!-- Schedule Templates -->
                <div class="schedule-templates">
                    <h3>Szablony harmonogramów</h3>
                    <div class="templates-grid">
                        <div class="template-card" onclick="testReportsEnhanced.useTemplate('daily')">
                            <div class="template-icon">📅</div>
                            <div class="template-name">Dzienny</div>
                            <div class="template-desc">Raporty generowane codziennie</div>
                        </div>
                        <div class="template-card" onclick="testReportsEnhanced.useTemplate('weekly')">
                            <div class="template-icon">📊</div>
                            <div class="template-name">Tygodniowy</div>
                            <div class="template-desc">Raporty zbiorcze co tydzień</div>
                        </div>
                        <div class="template-card" onclick="testReportsEnhanced.useTemplate('monthly')">
                            <div class="template-icon">📈</div>
                            <div class="template-name">Miesięczny</div>
                            <div class="template-desc">Raporty miesięczne z analizą</div>
                        </div>
                        <div class="template-card" onclick="testReportsEnhanced.useTemplate('custom')">
                            <div class="template-icon">⚙️</div>
                            <div class="template-name">Niestandardowy</div>
                            <div class="template-desc">Własne ustawienia</div>
                        </div>
                    </div>
                </div>

                <!-- Scheduled Reports Queue -->
                <div class="scheduled-queue">
                    <h3>Kolejka zaplanowanych raportów</h3>
                    <div class="queue-list">
                        ${this.getScheduledQueueHTML()}
                    </div>
                </div>

                <!-- Schedule Settings -->
                <div class="schedule-settings">
                    <h3>Ustawienia harmonogramów</h3>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" checked> Powiadomienia email
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" checked> Automatyczne archiwizowanie
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox"> Backup w chmurze
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Create global instance
window.testReportsEnhanced = new TestReportsEnhanced();

console.log('✅ Enhanced Test Reports Module loaded');
