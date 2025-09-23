/**
 * MASKSERVICE C20 - Reports Display Module
 * UI display optimization for test reports
 * Optimized for 400x1280 display (7.9" LCD IPS touchscreen)
 */

class ReportsDisplay {
    constructor(core) {
        this.core = core;
        this.currentView = 'list';
        this.displaySettings = {
            itemsPerPage: 8,
            compactMode: true,
            touchOptimized: true,
            narrowLayout: true
        };
        this.init();
    }

    init() {
        this.setupDisplaySettings();
        this.setupEventListeners();
        console.log('✅ ReportsDisplay initialized for 400x1280 narrow display');
    }

    setupDisplaySettings() {
        const savedSettings = localStorage.getItem('reportsDisplay_settings');
        if (savedSettings) {
            this.displaySettings = { ...this.displaySettings, ...JSON.parse(savedSettings) };
        }
    }

    setupEventListeners() {
        document.addEventListener('reportsCore:dataUpdated', (e) => {
            this.refreshDisplay();
        });
    }

    // Main display method optimized for narrow screen
    showReportsDisplay() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getOptimizedDisplayHTML();
        }
    }

    getOptimizedDisplayHTML() {
        return `
            <div class="reports-display narrow-optimized">
                <div class="display-header">
                    <h2>Lista raportów</h2>
                    <div class="view-controls">
                        <button class="view-btn ${this.currentView === 'list' ? 'active' : ''}" 
                                onclick="reportsDisplay.switchView('list')">📋</button>
                        <button class="view-btn ${this.currentView === 'grid' ? 'active' : ''}" 
                                onclick="reportsDisplay.switchView('grid')">⚏</button>
                    </div>
                </div>

                <div class="quick-stats">
                    <div class="stat-compact">
                        <div class="stat-number">${this.core.getReportsCount()}</div>
                        <div class="stat-label">Raporty</div>
                    </div>
                    <div class="stat-compact">
                        <div class="stat-number">${this.core.getPassedReportsCount()}</div>
                        <div class="stat-label">Pozytywne</div>
                    </div>
                    <div class="stat-compact">
                        <div class="stat-number">${this.core.getFailedReportsCount()}</div>
                        <div class="stat-label">Negatywne</div>
                    </div>
                </div>

                <div class="filters-compact">
                    <select id="filter-result" class="filter-select" onchange="reportsDisplay.applyFilters()">
                        <option value="">Wynik</option>
                        <option value="PASS">PASS</option>
                        <option value="FAIL">FAIL</option>
                    </select>
                    <select id="filter-customer" class="filter-select" onchange="reportsDisplay.applyFilters()">
                        <option value="">Klient</option>
                        ${this.getCustomerOptionsHTML()}
                    </select>
                </div>

                <div class="reports-container">
                    <div class="reports-list" id="reports-list">
                        ${this.getReportsListHTML()}
                    </div>
                </div>

                <div class="fab-container">
                    <button class="fab" onclick="reportsDisplay.showQuickActions()">➕</button>
                </div>
            </div>
        `;
    }

    getReportsListHTML() {
        const reports = this.getFilteredReports();
        
        if (reports.length === 0) {
            return '<div class="no-reports">Brak raportów do wyświetlenia</div>';
        }

        if (this.currentView === 'grid') {
            return this.getReportsGridHTML(reports);
        }

        return reports.map(report => `
            <div class="report-item-compact" onclick="reportsDisplay.viewReport('${report.id}')">
                <div class="report-header-compact">
                    <div class="report-id">${report.id}</div>
                    <div class="report-result ${report.result.toLowerCase()}">${report.result}</div>
                </div>
                <div class="report-details-compact">
                    <div class="report-customer">${this.truncateText(report.customer, 20)}</div>
                    <div class="report-date">${report.date}</div>
                </div>
            </div>
        `).join('');
    }

    getReportsGridHTML(reports) {
        return `
            <div class="reports-grid">
                ${reports.map(report => `
                    <div class="report-card-compact" onclick="reportsDisplay.viewReport('${report.id}')">
                        <div class="card-id">${report.id}</div>
                        <div class="card-customer">${this.truncateText(report.customer, 15)}</div>
                        <div class="card-result ${report.result.toLowerCase()}">${report.result}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getCustomerOptionsHTML() {
        const customers = new Set(this.core.getAllReports().map(r => r.customer));
        return Array.from(customers).map(customer => 
            `<option value="${customer}">${this.truncateText(customer, 20)}</option>`
        ).join('');
    }

    getFilteredReports() {
        const resultFilter = document.getElementById('filter-result')?.value;
        const customerFilter = document.getElementById('filter-customer')?.value;
        
        let reports = this.core.getAllReports();
        
        if (resultFilter) {
            reports = reports.filter(r => r.result === resultFilter);
        }
        
        if (customerFilter) {
            reports = reports.filter(r => r.customer === customerFilter);
        }
        
        return reports.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    switchView(viewType) {
        this.currentView = viewType;
        this.refreshDisplay();
        this.saveDisplaySettings();
    }

    applyFilters() {
        this.refreshDisplay();
    }

    showQuickActions() {
        const actionsHTML = `
            <div class="quick-actions-modal" onclick="reportsDisplay.hideQuickActions()">
                <div class="actions-panel" onclick="event.stopPropagation()">
                    <div class="actions-header">
                        <h3>Szybkie akcje</h3>
                        <button class="close-btn" onclick="reportsDisplay.hideQuickActions()">✕</button>
                    </div>
                    <div class="actions-list">
                        <button class="action-item" onclick="reportsGeneration.showReportsGeneration()">
                            📄 Nowy raport
                        </button>
                        <button class="action-item" onclick="reportsBatch.showBatchReports()">
                            📚 Raport zbiorczy
                        </button>
                        <button class="action-item" onclick="reportsSchedule.showReportsSchedule()">
                            📅 Harmonogram
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', actionsHTML);
    }

    hideQuickActions() {
        const modal = document.querySelector('.quick-actions-modal');
        if (modal) {
            modal.remove();
        }
    }

    viewReport(reportId) {
        const report = this.core.getReport(reportId);
        if (!report) return;

        const content = document.getElementById('menu-content');
        content.innerHTML = `
            <div class="report-view narrow-optimized">
                <div class="view-header">
                    <button class="btn-back" onclick="reportsDisplay.showReportsDisplay()">◀</button>
                    <h2>Raport ${report.id}</h2>
                </div>

                <div class="report-details-scroll">
                    <div class="detail-section">
                        <h3>Informacje podstawowe</h3>
                        <div class="detail-item">
                            <label>ID raportu:</label>
                            <span>${report.id}</span>
                        </div>
                        <div class="detail-item">
                            <label>Data:</label>
                            <span>${report.date}</span>
                        </div>
                        <div class="detail-item">
                            <label>Klient:</label>
                            <span>${report.customer}</span>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>Wynik testu</h3>
                        <div class="result-display ${report.result.toLowerCase()}">
                            ${report.result}
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>Dane testowe</h3>
                        <div class="data-item">
                            <label>Nieszczelność:</label>
                            <span>${report.testData.pressureLeak} l/min</span>
                        </div>
                        <div class="data-item">
                            <label>Przepływ:</label>
                            <span>${report.testData.flowRate} l/min</span>
                        </div>
                        <div class="data-item">
                            <label>Temperatura:</label>
                            <span>${report.testData.temperature}°C</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    refreshDisplay() {
        const reportsList = document.getElementById('reports-list');
        if (reportsList) {
            reportsList.innerHTML = this.getReportsListHTML();
        }
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    saveDisplaySettings() {
        localStorage.setItem('reportsDisplay_settings', JSON.stringify(this.displaySettings));
    }

    // Main UI method for reports view
    showReportsView() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getReportsViewHTML();
        }
    }

    // HTML template for reports view
    getReportsViewHTML() {
        return `
            <div class="test-reports-view">
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
                                <option value="Firma ABC">Firma ABC</option>
                                <option value="Firma XYZ">Firma XYZ</option>
                                <option value="Straż Pożarna">Straż Pożarna</option>
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
                            <div class="stat-value">${this.getMockReportCount()}</div>
                            <div class="stat-label">Łączna liczba raportów</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getMockPassedCount()}</div>
                            <div class="stat-label">Pozytywne</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getMockFailedCount()}</div>
                            <div class="stat-label">Negatywne</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getMockCustomersCount()}</div>
                            <div class="stat-label">Klienci</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Mock data methods
    getMockReportCount() {
        return 127;
    }

    getMockPassedCount() {
        return 98;
    }

    getMockFailedCount() {
        return 29;
    }

    getMockCustomersCount() {
        return 15;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportsDisplay;
}
