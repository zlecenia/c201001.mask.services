/**
 * MASKSERVICE C20 - Enhanced Workshop Module
 * Spare parts management, maintenance scheduling, calibration tools status
 */

class WorkshopEnhanced {
    constructor() {
        this.spareParts = new Map();
        this.maintenanceEvents = new Map();
        this.calibrationTools = new Map();
        this.deviceTypes = ['PP_MASK', 'NP_MASK', 'SCBA', 'CPS'];
        this.init();
    }

    init() {
        this.loadSpareParts();
        this.loadMaintenanceSchedule();
        this.loadCalibrationTools();
        this.setupEventListeners();
    }

    loadSpareParts() {
        const mockParts = [
            { id: 'P001', name: 'Filtr HEPA P3', quantity: 15, minLevel: 5, price: 45.50, supplier: 'FilterTech' },
            { id: 'P002', name: 'Uszczelka główna', quantity: 8, minLevel: 10, price: 12.30, supplier: 'SealPro' },
            { id: 'P003', name: 'Zawór wydechowy', quantity: 3, minLevel: 5, price: 89.00, supplier: 'ValveCorp' },
            { id: 'P004', name: 'Pasek głowowy', quantity: 12, minLevel: 8, price: 23.40, supplier: 'StrapCo' },
            { id: 'P005', name: 'Szyba ochronna', quantity: 6, minLevel: 4, price: 67.80, supplier: 'GlassTech' }
        ];

        mockParts.forEach(part => {
            this.spareParts.set(part.id, part);
        });
    }

    loadMaintenanceSchedule() {
        const mockEvents = [
            { id: 'M001', date: '2024-01-25', device: 'PP001', type: 'Przegląd 6-miesięczny', technician: 'Jan Kowalski' },
            { id: 'M002', date: '2024-01-30', device: 'SCBA003', type: 'Kalibracja roczna', technician: 'Anna Nowak' },
            { id: 'M003', date: '2024-02-05', device: 'NP002', type: 'Wymiana filtra', technician: 'Piotr Wiśniewski' }
        ];

        mockEvents.forEach(event => {
            this.maintenanceEvents.set(event.id, event);
        });
    }

    loadCalibrationTools() {
        const mockTools = [
            { id: 'T001', name: 'Miernik ciśnienia', status: 'OK', lastCalibration: '2024-01-01', nextCalibration: '2025-01-01' },
            { id: 'T002', name: 'Analizator przepływu', status: 'OVERDUE', lastCalibration: '2023-06-15', nextCalibration: '2024-06-15' },
            { id: 'T003', name: 'Termometr cyfrowy', status: 'OK', lastCalibration: '2023-12-01', nextCalibration: '2024-12-01' }
        ];

        mockTools.forEach(tool => {
            this.calibrationTools.set(tool.id, tool);
        });
    }

    setupEventListeners() {
        document.addEventListener('partOrderRequest', (e) => this.handlePartOrder(e.detail));
        document.addEventListener('maintenanceScheduled', (e) => this.handleMaintenanceSchedule(e.detail));
    }

    getEnhancedWorkshopHTML() {
        return `
            <div class="workshop-enhanced">
                <div class="workshop-header">
                    <h2>Workshop - Rozszerzone funkcje</h2>
                    <div class="workshop-tabs">
                        <button class="tab-btn active" onclick="workshopEnhanced.showTab('parts')">
                            🔧 Części zamienne
                        </button>
                        <button class="tab-btn" onclick="workshopEnhanced.showTab('maintenance')">
                            📅 Harmonogram
                        </button>
                        <button class="tab-btn" onclick="workshopEnhanced.showTab('calibration')">
                            ⚙️ Narzędzia
                        </button>
                        <button class="tab-btn" onclick="workshopEnhanced.showTab('inventory')">
                            📦 Magazyn
                        </button>
                    </div>
                </div>

                <div class="workshop-content">
                    <div id="workshop-tab-content">
                        ${this.getPartsManagementHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    getPartsManagementHTML() {
        return `
            <div class="parts-management">
                <div class="parts-header">
                    <h3>Zarządzanie częściami zamiennymi</h3>
                    <button class="btn btn-primary" onclick="workshopEnhanced.addNewPart()">
                        ➕ Dodaj część
                    </button>
                </div>

                <div class="inventory-summary">
                    <div class="summary-stats">
                        <div class="stat-item">
                            <div class="stat-value">${this.spareParts.size}</div>
                            <div class="stat-label">Rodzajów części</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getTotalPartsQuantity()}</div>
                            <div class="stat-label">Łączna ilość</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getLowStockCount()}</div>
                            <div class="stat-label">Niski stan</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getTotalInventoryValue().toFixed(2)} zł</div>
                            <div class="stat-label">Wartość magazynu</div>
                        </div>
                    </div>
                </div>

                <div class="inventory-tracker">
                    <div class="parts-table">
                        <div class="table-header">
                            <div class="col-id">ID</div>
                            <div class="col-name">Nazwa części</div>
                            <div class="col-quantity">Stan</div>
                            <div class="col-min">Min. poziom</div>
                            <div class="col-price">Cena</div>
                            <div class="col-supplier">Dostawca</div>
                            <div class="col-actions">Akcje</div>
                        </div>
                        <div class="table-body">
                            ${this.getPartsTableHTML()}
                        </div>
                    </div>
                </div>

                <div class="low-stock-alerts">
                    <h4>Alerty niskiego stanu magazynowego</h4>
                    <div class="alerts-list">
                        ${this.getLowStockAlertsHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    getPartsTableHTML() {
        let html = '';
        Array.from(this.spareParts.values()).forEach(part => {
            const isLowStock = part.quantity <= part.minLevel;
            const rowClass = isLowStock ? 'low-stock' : '';
            
            html += `
                <div class="table-row ${rowClass}" data-part-id="${part.id}">
                    <div class="col-id">${part.id}</div>
                    <div class="col-name">${part.name}</div>
                    <div class="col-quantity">
                        <span class="quantity-value">${part.quantity}</span>
                        ${isLowStock ? '<span class="low-stock-icon">⚠️</span>' : ''}
                    </div>
                    <div class="col-min">${part.minLevel}</div>
                    <div class="col-price">${part.price} zł</div>
                    <div class="col-supplier">${part.supplier}</div>
                    <div class="col-actions">
                        <button class="btn-small btn-primary" onclick="workshopEnhanced.updatePartQuantity('${part.id}')">
                            📝 Aktualizuj
                        </button>
                        ${isLowStock ? `<button class="btn-small btn-warning" onclick="workshopEnhanced.orderPart('${part.id}')">📦 Zamów</button>` : ''}
                        <button class="btn-small btn-secondary" onclick="workshopEnhanced.editPart('${part.id}')">
                            ✏️ Edytuj
                        </button>
                    </div>
                </div>
            `;
        });
        return html;
    }

    getLowStockAlertsHTML() {
        const lowStockParts = Array.from(this.spareParts.values()).filter(part => part.quantity <= part.minLevel);
        
        if (lowStockParts.length === 0) {
            return '<p class="no-alerts">✅ Wszystkie części na odpowiednim poziomie</p>';
        }

        return lowStockParts.map(part => `
            <div class="alert-item">
                <span class="alert-icon">⚠️</span>
                <span class="alert-text">
                    <strong>${part.name}</strong> - stan: ${part.quantity}, min: ${part.minLevel}
                </span>
                <button class="btn-small btn-warning" onclick="workshopEnhanced.orderPart('${part.id}')">
                    Zamów teraz
                </button>
            </div>
        `).join('');
    }

    getMaintenanceScheduleHTML() {
        return `
            <div class="maintenance-scheduler">
                <div class="schedule-header">
                    <h3>Harmonogram przeglądów</h3>
                    <button class="btn btn-primary" onclick="workshopEnhanced.addMaintenanceEvent()">
                        ➕ Dodaj wydarzenie
                    </button>
                </div>

                <div class="calendar-view">
                    <div class="calendar-header">
                        <button class="btn-nav" onclick="workshopEnhanced.previousMonth()">‹</button>
                        <h4 id="current-month">Styczeń 2024</h4>
                        <button class="btn-nav" onclick="workshopEnhanced.nextMonth()">›</button>
                    </div>
                    <div class="calendar-grid" id="calendar-grid">
                        ${this.getCalendarHTML()}
                    </div>
                </div>

                <div class="upcoming-maintenance">
                    <h4>Nadchodzące przeglądy</h4>
                    <div class="events-list">
                        ${this.getUpcomingEventsHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    getCalendarHTML() {
        // Simplified calendar view
        return `
            <div class="calendar-day-headers">
                <div>Pon</div><div>Wt</div><div>Śr</div><div>Czw</div><div>Pt</div><div>Sob</div><div>Nie</div>
            </div>
            <div class="calendar-days">
                ${this.generateCalendarDays()}
            </div>
        `;
    }

    generateCalendarDays() {
        let html = '';
        for (let day = 1; day <= 31; day++) {
            const hasEvent = this.hasMaintenanceOnDay(day);
            const dayClass = hasEvent ? 'has-event' : '';
            html += `<div class="calendar-day ${dayClass}" onclick="workshopEnhanced.showDayEvents(${day})">${day}</div>`;
        }
        return html;
    }

    hasMaintenanceOnDay(day) {
        return Array.from(this.maintenanceEvents.values()).some(event => {
            const eventDay = new Date(event.date).getDate();
            return eventDay === day;
        });
    }

    getUpcomingEventsHTML() {
        const sortedEvents = Array.from(this.maintenanceEvents.values())
            .filter(event => new Date(event.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return sortedEvents.map(event => `
            <div class="event-item">
                <div class="event-date">${event.date}</div>
                <div class="event-details">
                    <div class="event-device">${event.device}</div>
                    <div class="event-type">${event.type}</div>
                    <div class="event-technician">Technik: ${event.technician}</div>
                </div>
                <div class="event-actions">
                    <button class="btn-small btn-info" onclick="workshopEnhanced.viewEvent('${event.id}')">
                        👁️ Szczegóły
                    </button>
                    <button class="btn-small btn-secondary" onclick="workshopEnhanced.editEvent('${event.id}')">
                        ✏️ Edytuj
                    </button>
                </div>
            </div>
        `).join('');
    }

    getCalibrationToolsHTML() {
        return `
            <div class="calibration-tools">
                <div class="tools-header">
                    <h3>Status narzędzi kalibracyjnych</h3>
                    <button class="btn btn-primary" onclick="workshopEnhanced.addCalibrationTool()">
                        ➕ Dodaj narzędzie
                    </button>
                </div>

                <div class="tools-summary">
                    <div class="summary-stats">
                        <div class="stat-item">
                            <div class="stat-value">${this.calibrationTools.size}</div>
                            <div class="stat-label">Narzędzi</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getToolsInStatus('OK')}</div>
                            <div class="stat-label">Sprawne</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getToolsInStatus('OVERDUE')}</div>
                            <div class="stat-label">Zaległe</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getToolsNearExpiry()}</div>
                            <div class="stat-label">Wygasające</div>
                        </div>
                    </div>
                </div>

                <div class="tool-status">
                    <div class="tools-table">
                        <div class="table-header">
                            <div class="col-id">ID</div>
                            <div class="col-name">Nazwa narzędzia</div>
                            <div class="col-status">Status</div>
                            <div class="col-last">Ostatnia kalibracja</div>
                            <div class="col-next">Następna kalibracja</div>
                            <div class="col-actions">Akcje</div>
                        </div>
                        <div class="table-body">
                            ${this.getToolsTableHTML()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getToolsTableHTML() {
        let html = '';
        Array.from(this.calibrationTools.values()).forEach(tool => {
            const statusClass = tool.status.toLowerCase();
            const isOverdue = tool.status === 'OVERDUE';
            
            html += `
                <div class="table-row ${statusClass}" data-tool-id="${tool.id}">
                    <div class="col-id">${tool.id}</div>
                    <div class="col-name">${tool.name}</div>
                    <div class="col-status">
                        <span class="status-badge ${statusClass}">${tool.status}</span>
                    </div>
                    <div class="col-last">${tool.lastCalibration}</div>
                    <div class="col-next">${tool.nextCalibration}</div>
                    <div class="col-actions">
                        <button class="btn-small btn-info" onclick="workshopEnhanced.viewToolDetails('${tool.id}')">
                            📊 Szczegóły
                        </button>
                        ${isOverdue ? `<button class="btn-small btn-warning" onclick="workshopEnhanced.scheduleCalibration('${tool.id}')">📅 Zaplanuj</button>` : ''}
                        <button class="btn-small btn-secondary" onclick="workshopEnhanced.editTool('${tool.id}')">
                            ✏️ Edytuj
                        </button>
                    </div>
                </div>
            `;
        });
        return html;
    }

    // Tab management
    showTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        // Update content
        const content = document.getElementById('workshop-tab-content');
        switch(tabName) {
            case 'parts':
                content.innerHTML = this.getPartsManagementHTML();
                break;
            case 'maintenance':
                content.innerHTML = this.getMaintenanceScheduleHTML();
                break;
            case 'calibration':
                content.innerHTML = this.getCalibrationToolsHTML();
                break;
            case 'inventory':
                content.innerHTML = this.getInventoryReportHTML();
                break;
        }
    }

    getInventoryReportHTML() {
        return `
            <div class="inventory-report">
                <h3>Raport magazynowy</h3>
                <div class="report-filters">
                    <button class="btn btn-info" onclick="workshopEnhanced.generateInventoryReport()">
                        📊 Generuj raport
                    </button>
                    <button class="btn btn-secondary" onclick="workshopEnhanced.exportInventory()">
                        📤 Eksportuj
                    </button>
                </div>
                <div class="inventory-charts">
                    <p>Wykresy i analizy magazynowe będą tutaj wyświetlane...</p>
                </div>
            </div>
        `;
    }

    // Utility methods
    getTotalPartsQuantity() {
        return Array.from(this.spareParts.values()).reduce((sum, part) => sum + part.quantity, 0);
    }

    getLowStockCount() {
        return Array.from(this.spareParts.values()).filter(part => part.quantity <= part.minLevel).length;
    }

    getTotalInventoryValue() {
        return Array.from(this.spareParts.values()).reduce((sum, part) => sum + (part.quantity * part.price), 0);
    }

    getToolsInStatus(status) {
        return Array.from(this.calibrationTools.values()).filter(tool => tool.status === status).length;
    }

    getToolsNearExpiry() {
        const now = new Date();
        const threeMonthsFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));
        
        return Array.from(this.calibrationTools.values()).filter(tool => {
            const nextCalibration = new Date(tool.nextCalibration);
            return nextCalibration <= threeMonthsFromNow && nextCalibration > now;
        }).length;
    }

    // Event handlers
    orderPart(partId) {
        const part = this.spareParts.get(partId);
        if (part) {
            const quantity = prompt(`Zamów części: ${part.name}\nAktualny stan: ${part.quantity}\nIlość do zamówienia:`, part.minLevel * 2);
            if (quantity && !isNaN(quantity)) {
                alert(`Złożono zamówienie:\n${part.name} x ${quantity}\nDostawca: ${part.supplier}\nKoszt: ${(quantity * part.price).toFixed(2)} zł`);
            }
        }
    }

    updatePartQuantity(partId) {
        const part = this.spareParts.get(partId);
        if (part) {
            const newQuantity = prompt(`Aktualizuj ilość: ${part.name}\nAktualny stan: ${part.quantity}\nNowa ilość:`, part.quantity);
            if (newQuantity && !isNaN(newQuantity)) {
                part.quantity = parseInt(newQuantity);
                this.spareParts.set(partId, part);
                this.refreshPartsTable();
            }
        }
    }

    refreshPartsTable() {
        const tableBody = document.querySelector('.parts-table .table-body');
        if (tableBody) {
            tableBody.innerHTML = this.getPartsTableHTML();
        }
    }

    addNewPart() {
        alert('Funkcja dodawania nowej części - wkrótce dostępna!');
    }

    addMaintenanceEvent() {
        alert('Funkcja dodawania wydarzenia konserwacyjnego - wkrótce dostępna!');
    }

    scheduleCalibration(toolId) {
        const tool = this.calibrationTools.get(toolId);
        if (tool) {
            alert(`Planowanie kalibracji dla: ${tool.name}\nOstatnia kalibracja: ${tool.lastCalibration}\nStatus: ${tool.status}`);
        }
    }

    // Public method for template integration
    showEnhancedWorkshop() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getEnhancedWorkshopHTML();
        }
    }
}

// Create global instance
window.workshopEnhanced = new WorkshopEnhanced();

console.log('✅ Enhanced Workshop Module loaded');
