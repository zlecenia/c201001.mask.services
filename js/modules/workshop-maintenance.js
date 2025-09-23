/**
 * MASKSERVICE C20 - Workshop Maintenance Module
 * Maintenance scheduling, tracking, and management
 * @version 2.0.0
 * @author MASKSERVICE Team
 */

class WorkshopMaintenance {
    constructor(workshopCore) {
        this.core = workshopCore;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
    }

    /**
     * Show workshop maintenance management view
     */
    showWorkshopMaintenance() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getWorkshopMaintenanceHTML();
        }
    }

    /**
     * Generate maintenance management HTML
     */
    getWorkshopMaintenanceHTML() {
        return `
            <div class="workshop-maintenance">
                <div class="maintenance-header">
                    <h2>📅 Harmonogram konserwacji</h2>
                    <div class="maintenance-actions">
                        <button class="btn btn-primary" onclick="workshopEnhanced.maintenance.scheduleNewMaintenance()">
                            ➕ Zaplanuj konserwację
                        </button>
                        <button class="btn btn-secondary" onclick="workshopEnhanced.maintenance.generateMaintenanceReport()">
                            📊 Raport
                        </button>
                        <button class="btn btn-info" onclick="workshopEnhanced.maintenance.exportCalendar()">
                            📅 Eksport
                        </button>
                    </div>
                </div>

                <div class="maintenance-overview">
                    <div class="overview-card">
                        <h4>Dzisiaj</h4>
                        <span class="value">${this.getTodayMaintenanceCount()}</span>
                        <small>zaplanowanych</small>
                    </div>
                    <div class="overview-card warning">
                        <h4>Opóźnione</h4>
                        <span class="value">${this.getOverdueMaintenanceCount()}</span>
                        <small>zadań</small>
                    </div>
                    <div class="overview-card">
                        <h4>Ten miesiąc</h4>
                        <span class="value">${this.getThisMonthMaintenanceCount()}</span>
                        <small>zaplanowanych</small>
                    </div>
                </div>

                <div class="maintenance-content">
                    <div class="maintenance-calendar">
                        <div class="calendar-header">
                            <button class="btn-nav" onclick="workshopEnhanced.maintenance.previousMonth()">‹</button>
                            <h3>${this.getMonthName(this.currentMonth)} ${this.currentYear}</h3>
                            <button class="btn-nav" onclick="workshopEnhanced.maintenance.nextMonth()">›</button>
                        </div>
                        <div class="calendar-grid">
                            <div class="calendar-weekdays">
                                <div class="weekday">Pon</div>
                                <div class="weekday">Wt</div>
                                <div class="weekday">Śr</div>
                                <div class="weekday">Czw</div>
                                <div class="weekday">Pt</div>
                                <div class="weekday">Sob</div>
                                <div class="weekday">Nie</div>
                            </div>
                            <div class="calendar-days">
                                ${this.generateCalendarDays()}
                            </div>
                        </div>
                    </div>

                    <div class="maintenance-list">
                        <h3>Nadchodzące konserwacje</h3>
                        <div class="maintenance-items">
                            ${this.getUpcomingMaintenanceHTML()}
                        </div>
                    </div>
                </div>

                <div class="maintenance-details" id="maintenance-details" style="display: none;">
                    <!-- Dynamic content populated by day selection -->
                </div>
            </div>
        `;
    }

    /**
     * Get count of maintenance events today
     */
    getTodayMaintenanceCount() {
        const today = new Date().toISOString().split('T')[0];
        return this.core.getMaintenanceEventsForDate(today).length;
    }

    /**
     * Get count of overdue maintenance events
     */
    getOverdueMaintenanceCount() {
        const today = new Date().toISOString().split('T')[0];
        return this.core.getMaintenanceEvents().filter(event => 
            event.date < today && event.status !== 'COMPLETED'
        ).length;
    }

    /**
     * Get count of maintenance events this month
     */
    getThisMonthMaintenanceCount() {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        return this.core.getMaintenanceEvents().filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getMonth() + 1 === currentMonth && 
                   eventDate.getFullYear() === currentYear;
        }).length;
    }

    /**
     * Get month name in Polish
     */
    getMonthName(monthIndex) {
        const months = [
            'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
            'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
        ];
        return months[monthIndex];
    }

    /**
     * Generate calendar days for current month
     */
    generateCalendarDays() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        
        // Start from Monday of the week containing the first day
        startDate.setDate(firstDay.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));
        
        let html = '';
        let currentDate = new Date(startDate);
        
        // Generate 6 weeks (42 days) to fill the calendar grid
        for (let i = 0; i < 42; i++) {
            const day = currentDate.getDate();
            const month = currentDate.getMonth();
            const dateStr = currentDate.toISOString().split('T')[0];
            
            const isCurrentMonth = month === this.currentMonth;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const hasEvents = this.hasMaintenanceOnDay(dateStr);
            
            const dayClasses = [
                'calendar-day',
                isCurrentMonth ? 'current-month' : 'other-month',
                isToday ? 'today' : '',
                hasEvents ? 'has-events' : ''
            ].filter(c => c).join(' ');
            
            html += `
                <div class="${dayClasses}" 
                     onclick="workshopEnhanced.maintenance.showDayEvents('${dateStr}')">
                    <span class="day-number">${day}</span>
                    ${hasEvents ? '<span class="event-indicator">●</span>' : ''}
                </div>
            `;
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return html;
    }

    /**
     * Check if there are maintenance events on specific day
     */
    hasMaintenanceOnDay(dateStr) {
        return this.core.getMaintenanceEventsForDate(dateStr).length > 0;
    }

    /**
     * Get upcoming maintenance events HTML
     */
    getUpcomingMaintenanceHTML() {
        const events = this.core.getMaintenanceEvents()
            .filter(event => event.date >= new Date().toISOString().split('T')[0])
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5); // Show next 5 events

        if (events.length === 0) {
            return '<div class="no-events">Brak nadchodzących konserwacji</div>';
        }

        return events.map(event => {
            const statusClass = event.status.toLowerCase();
            const urgencyClass = this.getEventUrgency(event.date);
            
            return `
                <div class="maintenance-item ${statusClass} ${urgencyClass}">
                    <div class="event-date">
                        <span class="date">${this.formatDate(event.date)}</span>
                        <span class="status">${this.translateStatus(event.status)}</span>
                    </div>
                    <div class="event-details">
                        <h4>${event.type}</h4>
                        <p>Urządzenie: <strong>${event.device}</strong></p>
                        <p>Technik: <strong>${event.technician}</strong></p>
                    </div>
                    <div class="event-actions">
                        <button class="btn-small" onclick="workshopEnhanced.maintenance.editMaintenance('${event.id}')">✏️</button>
                        <button class="btn-small" onclick="workshopEnhanced.maintenance.completeMaintenance('${event.id}')">✅</button>
                        <button class="btn-small" onclick="workshopEnhanced.maintenance.deleteMaintenance('${event.id}')">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get event urgency class based on date proximity
     */
    getEventUrgency(eventDate) {
        const today = new Date();
        const event = new Date(eventDate);
        const daysDiff = Math.ceil((event - today) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 0) return 'overdue';
        if (daysDiff <= 1) return 'urgent';
        if (daysDiff <= 7) return 'soon';
        return 'normal';
    }

    /**
     * Format date for display
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    /**
     * Translate maintenance status
     */
    translateStatus(status) {
        const translations = {
            'SCHEDULED': 'Zaplanowane',
            'IN_PROGRESS': 'W trakcie',
            'COMPLETED': 'Ukończone',
            'CANCELLED': 'Anulowane'
        };
        return translations[status] || status;
    }

    /**
     * Navigate to previous month
     */
    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.showWorkshopMaintenance();
    }

    /**
     * Navigate to next month
     */
    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.showWorkshopMaintenance();
    }

    /**
     * Show events for selected day
     */
    showDayEvents(dateStr) {
        const events = this.core.getMaintenanceEventsForDate(dateStr);
        const detailsDiv = document.getElementById('maintenance-details');
        
        if (events.length === 0) {
            detailsDiv.innerHTML = `
                <div class="day-events">
                    <h3>Wydarzenia - ${this.formatDate(dateStr)}</h3>
                    <p>Brak zaplanowanych konserwacji na ten dzień.</p>
                    <button class="btn btn-primary" onclick="workshopEnhanced.maintenance.scheduleMaintenanceForDate('${dateStr}')">
                        Zaplanuj konserwację
                    </button>
                </div>
            `;
        } else {
            detailsDiv.innerHTML = `
                <div class="day-events">
                    <h3>Wydarzenia - ${this.formatDate(dateStr)}</h3>
                    ${events.map(event => `
                        <div class="day-event-item">
                            <h4>${event.type}</h4>
                            <p><strong>Urządzenie:</strong> ${event.device}</p>
                            <p><strong>Technik:</strong> ${event.technician}</p>
                            <p><strong>Status:</strong> ${this.translateStatus(event.status)}</p>
                            <div class="event-actions">
                                <button class="btn btn-small" onclick="workshopEnhanced.maintenance.editMaintenance('${event.id}')">Edytuj</button>
                                <button class="btn btn-small" onclick="workshopEnhanced.maintenance.completeMaintenance('${event.id}')">Zakończ</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        detailsDiv.style.display = 'block';
    }

    /**
     * Schedule new maintenance
     */
    scheduleNewMaintenance() {
        const maintenanceData = {
            id: `M${String(Date.now()).slice(-3)}`,
            date: prompt('Data konserwacji (YYYY-MM-DD):'),
            device: prompt('ID urządzenia:'),
            type: prompt('Typ konserwacji:'),
            technician: prompt('Przypisany technik:'),
            status: 'SCHEDULED'
        };

        if (maintenanceData.date && maintenanceData.device && maintenanceData.type) {
            this.core.maintenanceEvents.set(maintenanceData.id, maintenanceData);
            this.showWorkshopMaintenance(); // Refresh view
            alert(`Konserwacja została zaplanowana na ${maintenanceData.date}.`);
        }
    }

    /**
     * Schedule maintenance for specific date
     */
    scheduleMaintenanceForDate(dateStr) {
        const maintenanceData = {
            id: `M${String(Date.now()).slice(-3)}`,
            date: dateStr,
            device: prompt('ID urządzenia:'),
            type: prompt('Typ konserwacji:'),
            technician: prompt('Przypisany technik:'),
            status: 'SCHEDULED'
        };

        if (maintenanceData.device && maintenanceData.type) {
            this.core.maintenanceEvents.set(maintenanceData.id, maintenanceData);
            this.showDayEvents(dateStr); // Refresh day view
            alert(`Konserwacja została zaplanowana na ${this.formatDate(dateStr)}.`);
        }
    }

    /**
     * Edit existing maintenance
     */
    editMaintenance(eventId) {
        const event = this.core.maintenanceEvents.get(eventId);
        if (!event) {
            alert('Nie znaleziono wydarzenia!');
            return;
        }

        const newDate = prompt('Data konserwacji:', event.date);
        const newDevice = prompt('ID urządzenia:', event.device);
        const newType = prompt('Typ konserwacji:', event.type);
        const newTechnician = prompt('Technik:', event.technician);

        if (newDate !== null) {
            event.date = newDate;
            event.device = newDevice || event.device;
            event.type = newType || event.type;
            event.technician = newTechnician || event.technician;

            this.core.maintenanceEvents.set(eventId, event);
            this.showWorkshopMaintenance(); // Refresh view
            alert('Konserwacja została zaktualizowana.');
        }
    }

    /**
     * Complete maintenance event
     */
    completeMaintenance(eventId) {
        const event = this.core.maintenanceEvents.get(eventId);
        if (!event) {
            alert('Nie znaleziono wydarzenia!');
            return;
        }

        if (confirm(`Czy na pewno oznaczyć konserwację jako ukończoną?\n${event.type} - ${event.device}`)) {
            event.status = 'COMPLETED';
            this.core.maintenanceEvents.set(eventId, event);
            this.showWorkshopMaintenance(); // Refresh view
            alert('Konserwacja została oznaczona jako ukończona.');
        }
    }

    /**
     * Delete maintenance event
     */
    deleteMaintenance(eventId) {
        const event = this.core.maintenanceEvents.get(eventId);
        if (!event) {
            alert('Nie znaleziono wydarzenia!');
            return;
        }

        if (confirm(`Czy na pewno usunąć konserwację?\n${event.type} - ${event.device}`)) {
            this.core.maintenanceEvents.delete(eventId);
            this.showWorkshopMaintenance(); // Refresh view
            alert('Konserwacja została usunięta.');
        }
    }

    /**
     * Generate maintenance report
     */
    generateMaintenanceReport() {
        const events = this.core.getMaintenanceEvents();
        let report = 'RAPORT KONSERWACJI\n';
        report += '=' .repeat(50) + '\n\n';

        report += `Data raportu: ${new Date().toLocaleDateString()}\n`;
        report += `Łączna liczba zdarzeń: ${events.length}\n`;
        report += `Nadchodzące konserwacje: ${this.getUpcomingCount()}\n`;
        report += `Opóźnione zadania: ${this.getOverdueMaintenanceCount()}\n\n`;

        report += 'SZCZEGÓŁY:\n';
        report += '-'.repeat(50) + '\n';

        events.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(event => {
            report += `${event.date} | ${event.device} | ${event.type} | ${this.translateStatus(event.status)}\n`;
        });

        // Create downloadable file
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raport_konserwacji_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        alert('Raport konserwacji został wygenerowany i pobierany.');
    }

    /**
     * Get count of upcoming maintenance events
     */
    getUpcomingCount() {
        const today = new Date().toISOString().split('T')[0];
        return this.core.getMaintenanceEvents().filter(event => 
            event.date >= today && event.status !== 'COMPLETED'
        ).length;
    }

    /**
     * Export calendar to ICS format
     */
    exportCalendar() {
        let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//MASKSERVICE//Workshop Calendar//EN\n';
        
        this.core.getMaintenanceEvents().forEach(event => {
            const eventDate = new Date(event.date);
            const dateStr = eventDate.toISOString().replace(/[-:]/g, '').split('T')[0] + 'T120000Z';
            
            icsContent += 'BEGIN:VEVENT\n';
            icsContent += `UID:${event.id}@maskservice.com\n`;
            icsContent += `DTSTART:${dateStr}\n`;
            icsContent += `SUMMARY:${event.type} - ${event.device}\n`;
            icsContent += `DESCRIPTION:Technik: ${event.technician}\\nStatus: ${this.translateStatus(event.status)}\n`;
            icsContent += 'END:VEVENT\n';
        });
        
        icsContent += 'END:VCALENDAR';

        // Create downloadable file
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kalendarz_konserwacji_${new Date().toISOString().split('T')[0]}.ics`;
        a.click();
        URL.revokeObjectURL(url);

        alert('Kalendarz został wyeksportowany do pliku ICS.');
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkshopMaintenance;
}

console.log('✅ WorkshopMaintenance module loaded');
