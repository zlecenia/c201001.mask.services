/**
 * MASKSERVICE C20 - Workshop Tools Module
 * Calibration tools management, status tracking, and certification
 * @version 2.0.0
 * @author MASKSERVICE Team
 */

class WorkshopTools {
    constructor(workshopCore) {
        this.core = workshopCore;
        this.sortBy = 'name';
        this.sortDirection = 'asc';
        this.filterStatus = 'ALL';
    }

    /**
     * Show workshop tools management view
     */
    showWorkshopTools() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getWorkshopToolsHTML();
        }
    }

    /**
     * Generate tools management HTML
     */
    getWorkshopToolsHTML() {
        return `
            <div class="workshop-tools">
                <div class="tools-header">
                    <h2>⚙️ Narzędzia kalibracyjne</h2>
                    <div class="tools-actions">
                        <button class="btn btn-primary" onclick="workshopEnhanced.tools.addNewTool()">
                            ➕ Dodaj narzędzie
                        </button>
                        <button class="btn btn-secondary" onclick="workshopEnhanced.tools.scheduleCalibrations()">
                            📅 Zaplanuj kalibracje
                        </button>
                        <button class="btn btn-info" onclick="workshopEnhanced.tools.generateCertificateReport()">
                            📜 Certyfikaty
                        </button>
                    </div>
                </div>

                <div class="tools-overview">
                    <div class="overview-card">
                        <h4>Łącznie</h4>
                        <span class="value">${this.core.getCalibrationTools().length}</span>
                        <small>narzędzi</small>
                    </div>
                    <div class="overview-card success">
                        <h4>Aktualne</h4>
                        <span class="value">${this.getToolsInStatus('OK').length}</span>
                        <small>kalibracji</small>
                    </div>
                    <div class="overview-card warning">
                        <h4>Przedawnione</h4>
                        <span class="value">${this.getToolsInStatus('OVERDUE').length}</span>
                        <small>narzędzi</small>
                    </div>
                    <div class="overview-card info">
                        <h4>Wkrótce</h4>
                        <span class="value">${this.getToolsExpiringSoon().length}</span>
                        <small>do kalibracji</small>
                    </div>
                </div>

                <div class="tools-filters">
                    <div class="filter-group">
                        <label>Status:</label>
                        <select id="tools-status-filter" onchange="workshopEnhanced.tools.applyFilters()">
                            <option value="ALL">Wszystkie</option>
                            <option value="OK">Aktualne</option>
                            <option value="OVERDUE">Przedawnione</option>
                            <option value="EXPIRING_SOON">Wkrótce wygasają</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Sortuj wg:</label>
                        <select id="tools-sort-by" onchange="workshopEnhanced.tools.applySorting()">
                            <option value="name">Nazwa</option>
                            <option value="nextCalibration">Data kalibracji</option>
                            <option value="status">Status</option>
                            <option value="location">Lokalizacja</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Kierunek:</label>
                        <select id="tools-sort-direction" onchange="workshopEnhanced.tools.applySorting()">
                            <option value="asc">Rosnąco</option>
                            <option value="desc">Malejąco</option>
                        </select>
                    </div>
                </div>

                <div class="tools-list">
                    ${this.getToolsListHTML()}
                </div>

                <div class="calibration-calendar" id="calibration-calendar" style="display: none;">
                    <h3>Kalendarz kalibracji</h3>
                    <div class="calendar-content">
                        ${this.getCalibrationCalendarHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get tools with specific status
     */
    getToolsInStatus(status) {
        return this.core.getCalibrationTools().filter(tool => tool.status === status);
    }

    /**
     * Get tools expiring soon (within 30 days)
     */
    getToolsExpiringSoon() {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        return this.core.getCalibrationTools().filter(tool => {
            if (tool.status === 'OVERDUE') return false;
            const nextCalibration = new Date(tool.nextCalibration);
            return nextCalibration <= thirtyDaysFromNow && nextCalibration >= new Date();
        });
    }

    /**
     * Generate tools list HTML
     */
    getToolsListHTML() {
        const tools = this.getFilteredAndSortedTools();
        
        if (tools.length === 0) {
            return '<div class="no-tools">Brak narzędzi spełniających kryteria filtrowania.</div>';
        }

        return tools.map(tool => {
            const statusClass = this.getToolStatusClass(tool);
            const daysToCalibration = this.getDaysToCalibration(tool);
            
            return `
                <div class="tool-card ${statusClass}">
                    <div class="tool-header">
                        <h4>${tool.name}</h4>
                        <span class="tool-id">${tool.id}</span>
                    </div>
                    <div class="tool-details">
                        <div class="detail-row">
                            <span class="label">Status:</span>
                            <span class="status-badge ${statusClass}">${this.translateToolStatus(tool.status)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Lokalizacja:</span>
                            <span class="value">${tool.location || 'Nieokreślona'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Ostatnia kalibracja:</span>
                            <span class="value">${this.formatDate(tool.lastCalibration)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Następna kalibracja:</span>
                            <span class="value ${daysToCalibration < 0 ? 'overdue' : daysToCalibration <= 30 ? 'warning' : ''}">${this.formatDate(tool.nextCalibration)}</span>
                        </div>
                        ${daysToCalibration !== null ? `
                            <div class="detail-row">
                                <span class="label">Dni do kalibracji:</span>
                                <span class="value ${daysToCalibration < 0 ? 'overdue' : daysToCalibration <= 30 ? 'warning' : ''}">${Math.abs(daysToCalibration)} ${daysToCalibration < 0 ? 'przedawnione' : 'dni'}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="tool-actions">
                        <button class="btn-small btn-edit" onclick="workshopEnhanced.tools.editTool('${tool.id}')">✏️</button>
                        <button class="btn-small btn-calibrate" onclick="workshopEnhanced.tools.calibrateTool('${tool.id}')">⚙️</button>
                        <button class="btn-small btn-certificate" onclick="workshopEnhanced.tools.viewCertificate('${tool.id}')">📜</button>
                        <button class="btn-small btn-delete" onclick="workshopEnhanced.tools.deleteTool('${tool.id}')">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get filtered and sorted tools
     */
    getFilteredAndSortedTools() {
        let tools = this.core.getCalibrationTools();

        // Apply status filter
        if (this.filterStatus !== 'ALL') {
            if (this.filterStatus === 'EXPIRING_SOON') {
                const expiringSoon = this.getToolsExpiringSoon();
                tools = tools.filter(tool => expiringSoon.includes(tool));
            } else {
                tools = tools.filter(tool => tool.status === this.filterStatus);
            }
        }

        // Apply sorting
        tools.sort((a, b) => {
            let valueA, valueB;
            
            switch (this.sortBy) {
                case 'name':
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
                    break;
                case 'nextCalibration':
                    valueA = new Date(a.nextCalibration);
                    valueB = new Date(b.nextCalibration);
                    break;
                case 'status':
                    valueA = a.status;
                    valueB = b.status;
                    break;
                case 'location':
                    valueA = (a.location || '').toLowerCase();
                    valueB = (b.location || '').toLowerCase();
                    break;
                default:
                    return 0;
            }

            if (valueA < valueB) {
                return this.sortDirection === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return this.sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return tools;
    }

    /**
     * Get tool status CSS class
     */
    getToolStatusClass(tool) {
        if (tool.status === 'OVERDUE') return 'overdue';
        if (this.getToolsExpiringSoon().includes(tool)) return 'warning';
        return 'ok';
    }

    /**
     * Get days to calibration
     */
    getDaysToCalibration(tool) {
        const nextCalibration = new Date(tool.nextCalibration);
        const today = new Date();
        const diffTime = nextCalibration - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Translate tool status
     */
    translateToolStatus(status) {
        const translations = {
            'OK': 'Aktualne',
            'OVERDUE': 'Przedawnione',
            'MAINTENANCE': 'Konserwacja',
            'OUT_OF_SERVICE': 'Poza użyciem'
        };
        return translations[status] || status;
    }

    /**
     * Format date for display
     */
    formatDate(dateStr) {
        if (!dateStr) return 'Brak danych';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pl-PL');
    }

    /**
     * Apply filters
     */
    applyFilters() {
        this.filterStatus = document.getElementById('tools-status-filter').value;
        this.refreshToolsList();
    }

    /**
     * Apply sorting
     */
    applySorting() {
        this.sortBy = document.getElementById('tools-sort-by').value;
        this.sortDirection = document.getElementById('tools-sort-direction').value;
        this.refreshToolsList();
    }

    /**
     * Refresh tools list
     */
    refreshToolsList() {
        const toolsList = document.querySelector('.tools-list');
        if (toolsList) {
            toolsList.innerHTML = this.getToolsListHTML();
        }
    }

    /**
     * Add new tool
     */
    addNewTool() {
        const toolData = {
            id: `T${String(Date.now()).slice(-3)}`,
            name: prompt('Nazwa narzędzia:'),
            location: prompt('Lokalizacja (np. LAB-001):') || 'Nieokreślona',
            lastCalibration: prompt('Data ostatniej kalibracji (YYYY-MM-DD):') || new Date().toISOString().split('T')[0],
            nextCalibration: prompt('Data następnej kalibracji (YYYY-MM-DD):'),
            status: 'OK'
        };

        if (toolData.name && toolData.nextCalibration) {
            // Check if next calibration is overdue
            if (new Date(toolData.nextCalibration) < new Date()) {
                toolData.status = 'OVERDUE';
            }

            this.core.calibrationTools.set(toolData.id, toolData);
            this.showWorkshopTools(); // Refresh view
            alert(`Narzędzie ${toolData.name} zostało dodane.`);
        }
    }

    /**
     * Edit existing tool
     */
    editTool(toolId) {
        const tool = this.core.calibrationTools.get(toolId);
        if (!tool) {
            alert('Nie znaleziono narzędzia!');
            return;
        }

        const newName = prompt('Nazwa narzędzia:', tool.name);
        const newLocation = prompt('Lokalizacja:', tool.location);
        const newNextCalibration = prompt('Następna kalibracja (YYYY-MM-DD):', tool.nextCalibration);

        if (newName !== null) {
            tool.name = newName;
            tool.location = newLocation || tool.location;
            
            if (newNextCalibration) {
                tool.nextCalibration = newNextCalibration;
                // Update status based on new date
                tool.status = new Date(newNextCalibration) < new Date() ? 'OVERDUE' : 'OK';
            }

            this.core.calibrationTools.set(toolId, tool);
            this.showWorkshopTools(); // Refresh view
            alert('Narzędzie zostało zaktualizowane.');
        }
    }

    /**
     * Calibrate tool
     */
    calibrateTool(toolId) {
        const tool = this.core.calibrationTools.get(toolId);
        if (!tool) {
            alert('Nie znaleziono narzędzia!');
            return;
        }

        const calibrationDate = prompt('Data kalibracji (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
        if (!calibrationDate) return;

        // Calculate next calibration date (1 year from now)
        const nextCalibration = new Date(calibrationDate);
        nextCalibration.setFullYear(nextCalibration.getFullYear() + 1);

        tool.lastCalibration = calibrationDate;
        tool.nextCalibration = nextCalibration.toISOString().split('T')[0];
        tool.status = 'OK';

        this.core.calibrationTools.set(toolId, tool);

        // Dispatch calibration event
        document.dispatchEvent(new CustomEvent('toolCalibrationUpdate', {
            detail: {
                toolId: toolId,
                date: calibrationDate,
                nextDate: tool.nextCalibration,
                status: 'OK'
            }
        }));

        this.showWorkshopTools(); // Refresh view
        alert(`Kalibracja narzędzia ${tool.name} została zarejestrowana.`);
    }

    /**
     * View tool certificate
     */
    viewCertificate(toolId) {
        const tool = this.core.calibrationTools.get(toolId);
        if (!tool) {
            alert('Nie znaleziono narzędzia!');
            return;
        }

        const certificate = `
CERTYFIKAT KALIBRACJI
${'='.repeat(40)}

Narzędzie: ${tool.name}
ID: ${tool.id}
Lokalizacja: ${tool.location || 'Nieokreślona'}

Data ostatniej kalibracji: ${this.formatDate(tool.lastCalibration)}
Data następnej kalibracji: ${this.formatDate(tool.nextCalibration)}
Status: ${this.translateToolStatus(tool.status)}

Certyfikat wygenerowany: ${new Date().toLocaleString('pl-PL')}

MASKSERVICE C20 - System zarządzania warsztatem
        `.trim();

        // Create downloadable certificate
        const blob = new Blob([certificate], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certyfikat_${tool.id}_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        alert('Certyfikat został wygenerowany i pobrany.');
    }

    /**
     * Delete tool
     */
    deleteTool(toolId) {
        const tool = this.core.calibrationTools.get(toolId);
        if (!tool) {
            alert('Nie znaleziono narzędzia!');
            return;
        }

        if (confirm(`Czy na pewno usunąć narzędzie: ${tool.name}?`)) {
            this.core.calibrationTools.delete(toolId);
            this.showWorkshopTools(); // Refresh view
            alert('Narzędzie zostało usunięte.');
        }
    }

    /**
     * Schedule calibrations for overdue and expiring tools
     */
    scheduleCalibrations() {
        const overdueTools = this.getToolsInStatus('OVERDUE');
        const expiringSoon = this.getToolsExpiringSoon();
        const toolsToSchedule = [...overdueTools, ...expiringSoon];

        if (toolsToSchedule.length === 0) {
            alert('Wszystkie narzędzia mają aktualne kalibracje.');
            return;
        }

        let schedule = 'HARMONOGRAM KALIBRACJI\n';
        schedule += '=' .repeat(30) + '\n\n';

        toolsToSchedule.forEach((tool, index) => {
            const scheduleDate = new Date();
            scheduleDate.setDate(scheduleDate.getDate() + (index + 1) * 7); // Schedule weekly
            
            schedule += `${tool.name} (${tool.id})\n`;
            schedule += `Planowana data: ${scheduleDate.toLocaleDateString('pl-PL')}\n`;
            schedule += `Status: ${this.translateToolStatus(tool.status)}\n\n`;
        });

        if (confirm(schedule + '\nCzy zapisać harmonogram kalibracji?')) {
            // In a real application, this would create calendar events
            alert('Harmonogram kalibracji został utworzony!');
        }
    }

    /**
     * Generate certificate report
     */
    generateCertificateReport() {
        const tools = this.core.getCalibrationTools();
        let report = 'RAPORT CERTYFIKATÓW KALIBRACJI\n';
        report += '=' .repeat(50) + '\n\n';

        report += `Data raportu: ${new Date().toLocaleDateString('pl-PL')}\n`;
        report += `Łączna liczba narzędzi: ${tools.length}\n`;
        report += `Aktualne kalibracje: ${this.getToolsInStatus('OK').length}\n`;
        report += `Przedawnione kalibracje: ${this.getToolsInStatus('OVERDUE').length}\n`;
        report += `Wygasające w ciągu 30 dni: ${this.getToolsExpiringSoon().length}\n\n`;

        report += 'SZCZEGÓŁY NARZĘDZI:\n';
        report += '-'.repeat(50) + '\n';

        tools.forEach(tool => {
            const daysToCalibration = this.getDaysToCalibration(tool);
            report += `${tool.id} | ${tool.name} | ${this.translateToolStatus(tool.status)} | `;
            report += `${daysToCalibration < 0 ? 'Przedawnione o ' + Math.abs(daysToCalibration) + ' dni' : daysToCalibration + ' dni do kalibracji'}\n`;
        });

        // Create downloadable file
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raport_certyfikatow_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        alert('Raport certyfikatów został wygenerowany i pobrany.');
    }

    /**
     * Get calibration calendar HTML
     */
    getCalibrationCalendarHTML() {
        const tools = this.core.getCalibrationTools();
        const calendarEvents = tools.map(tool => ({
            date: tool.nextCalibration,
            title: `Kalibracja: ${tool.name}`,
            status: tool.status
        }));

        // Sort events by date
        calendarEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

        return calendarEvents.map(event => {
            const statusClass = event.status === 'OVERDUE' ? 'overdue' : 'scheduled';
            return `
                <div class="calendar-event ${statusClass}">
                    <span class="event-date">${this.formatDate(event.date)}</span>
                    <span class="event-title">${event.title}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * Toggle calibration calendar visibility
     */
    toggleCalibrationCalendar() {
        const calendar = document.getElementById('calibration-calendar');
        if (calendar) {
            calendar.style.display = calendar.style.display === 'none' ? 'block' : 'none';
        }
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkshopTools;
}

console.log('✅ WorkshopTools module loaded');
