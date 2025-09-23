/**
 * MASKSERVICE C20 - Reports Schedule Module
 * Report scheduling and automation functionality
 * Optimized for 400x1280 display (7.9" LCD IPS touchscreen)
 */

class ReportsSchedule {
    constructor(core) {
        this.core = core;
        this.schedules = new Map();
        this.activeJobs = new Map();
        this.templates = new Map();
        this.notifications = new Map();
        this.init();
    }

    init() {
        this.setupScheduleTemplates();
        this.loadSchedules();
        this.setupEventListeners();
        this.initializeScheduler();
        console.log('✅ ReportsSchedule initialized for narrow display');
    }

    setupScheduleTemplates() {
        this.templates.set('daily', {
            id: 'daily',
            name: 'Dzienny',
            icon: '📅',
            description: 'Raporty generowane codziennie',
            frequency: 'daily',
            time: '08:00'
        });

        this.templates.set('weekly', {
            id: 'weekly',
            name: 'Tygodniowy',
            icon: '📊',
            description: 'Raporty zbiorcze co tydzień',
            frequency: 'weekly',
            day: 'monday',
            time: '06:00'
        });

        this.templates.set('monthly', {
            id: 'monthly',
            name: 'Miesięczny',
            icon: '📈',
            description: 'Raporty miesięczne z analizą',
            frequency: 'monthly',
            day: 1,
            time: '05:00'
        });
    }

    loadSchedules() {
        const savedSchedules = localStorage.getItem('reportsSchedule_data');
        if (savedSchedules) {
            const schedulesData = JSON.parse(savedSchedules);
            this.schedules = new Map(schedulesData);
        } else {
            this.loadMockSchedules();
        }
    }

    loadMockSchedules() {
        const mockSchedules = [
            {
                id: 'SCH-001',
                name: 'Raport dzienny - Wszystkie testy',
                template: 'daily',
                frequency: 'daily',
                time: '08:00',
                enabled: true,
                format: 'pdf',
                recipients: ['admin@maskservice.pl'],
                nextRun: this.calculateNextRun('daily', '08:00'),
                created: '2024-01-10',
                lastRun: null
            }
        ];

        mockSchedules.forEach(schedule => {
            this.schedules.set(schedule.id, schedule);
        });
        this.saveSchedules();
    }

    setupEventListeners() {
        document.addEventListener('reportsCore:reportGenerated', (e) => {
            this.handleReportGenerated(e.detail);
        });
    }

    initializeScheduler() {
        setInterval(() => {
            this.checkScheduledJobs();
        }, 60000);
    }

    // Main UI method
    showReportsSchedule() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getCompactScheduleHTML();
        }
    }

    getCompactScheduleHTML() {
        return `
            <div class="reports-schedule compact-view">
                <div class="compact-header">
                    <h2>Harmonogramy</h2>
                    <button class="btn-back" onclick="testReportsEnhanced.showReports()">◀</button>
                </div>

                <div class="quick-actions">
                    <button class="action-btn primary" onclick="reportsSchedule.createSchedule()">
                        ➕ Nowy
                    </button>
                    <button class="action-btn secondary" onclick="reportsSchedule.importSchedule()">
                        📥 Import
                    </button>
                </div>

                <div class="active-schedules">
                    <h3>Aktywne harmonogramy</h3>
                    <div class="schedules-list">
                        ${this.getActiveSchedulesHTML()}
                    </div>
                </div>

                <div class="schedule-templates">
                    <h3>Szablony</h3>
                    <div class="templates-grid">
                        ${this.getScheduleTemplatesHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    getActiveSchedulesHTML() {
        const activeSchedules = Array.from(this.schedules.values()).filter(s => s.enabled);
        
        if (activeSchedules.length === 0) {
            return '<div class="no-schedules">Brak aktywnych harmonogramów</div>';
        }

        return activeSchedules.map(schedule => `
            <div class="schedule-item" onclick="reportsSchedule.editSchedule('${schedule.id}')">
                <div class="schedule-header">
                    <div class="schedule-name">${this.truncateText(schedule.name, 25)}</div>
                    <div class="schedule-status ${schedule.enabled ? 'enabled' : 'disabled'}">
                        ${schedule.enabled ? 'Aktywny' : 'Nieaktywny'}
                    </div>
                </div>
                <div class="schedule-info">
                    <div class="schedule-frequency">
                        📅 ${this.getFrequencyText(schedule)}
                    </div>
                    <div class="schedule-next">
                        ${this.formatNextRun(schedule.nextRun)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    getScheduleTemplatesHTML() {
        return Array.from(this.templates.values()).map(template => `
            <div class="template-card-small" onclick="reportsSchedule.useTemplate('${template.id}')">
                <div class="template-icon-small">${template.icon}</div>
                <div class="template-name-small">${template.name}</div>
            </div>
        `).join('');
    }

    createSchedule() {
        const content = document.getElementById('menu-content');
        content.innerHTML = `
            <div class="create-schedule compact-view">
                <div class="compact-header">
                    <h2>Nowy harmonogram</h2>
                    <button class="btn-back" onclick="reportsSchedule.showReportsSchedule()">◀</button>
                </div>

                <div class="form-section">
                    <label>Nazwa harmonogramu:</label>
                    <input type="text" id="schedule-name" class="form-control" placeholder="Np. Raport dzienny">
                </div>

                <div class="form-section">
                    <label>Częstotliwość:</label>
                    <select id="schedule-frequency" class="form-control">
                        <option value="daily">Codziennie</option>
                        <option value="weekly">Co tydzień</option>
                        <option value="monthly">Co miesiąc</option>
                    </select>
                </div>

                <div class="form-section">
                    <label>Godzina:</label>
                    <input type="time" id="schedule-time" class="form-control" value="08:00">
                </div>

                <div class="form-section">
                    <label>Format raportu:</label>
                    <div class="format-buttons">
                        <button class="format-btn active" data-format="pdf">📄 PDF</button>
                        <button class="format-btn" data-format="xml">📋 XML</button>
                        <button class="format-btn" data-format="csv">📊 CSV</button>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="btn-save" onclick="reportsSchedule.saveSchedule()">
                        💾 Zapisz harmonogram
                    </button>
                </div>
            </div>
        `;
        this.setupFormatButtons();
    }

    saveSchedule() {
        const name = document.getElementById('schedule-name').value;
        const frequency = document.getElementById('schedule-frequency').value;
        const time = document.getElementById('schedule-time').value;
        const format = document.querySelector('.format-btn.active').dataset.format;

        if (!name || !frequency || !time) {
            this.showError('Wypełnij wszystkie wymagane pola');
            return;
        }

        const scheduleId = this.generateScheduleId();
        const schedule = {
            id: scheduleId,
            name,
            frequency,
            time,
            format,
            enabled: true,
            recipients: [],
            nextRun: this.calculateNextRun(frequency, time),
            created: new Date().toISOString().split('T')[0],
            lastRun: null
        };

        this.schedules.set(scheduleId, schedule);
        this.saveSchedules();
        
        this.showSuccess(`Harmonogram "${name}" został utworzony`);
        
        setTimeout(() => {
            this.showReportsSchedule();
        }, 2000);
    }

    // Utility methods
    calculateNextRun(frequency, time, day) {
        const now = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        
        let nextRun = new Date();
        nextRun.setHours(hours, minutes, 0, 0);
        
        if (frequency === 'daily' && nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 1);
        }
        
        return nextRun.toISOString();
    }

    getFrequencyText(schedule) {
        switch (schedule.frequency) {
            case 'daily': return `Codziennie o ${schedule.time}`;
            case 'weekly': return `Tygodniowo o ${schedule.time}`;
            case 'monthly': return `Miesięcznie o ${schedule.time}`;
            default: return 'Niestandardowa';
        }
    }

    formatNextRun(nextRunISO) {
        if (!nextRunISO) return 'Nieaktywny';
        
        const nextRun = new Date(nextRunISO);
        const now = new Date();
        const diffHours = Math.floor((nextRun - now) / (1000 * 60 * 60));
        
        if (diffHours > 24) {
            return `Za ${Math.floor(diffHours / 24)}d`;
        } else if (diffHours > 0) {
            return `Za ${diffHours}h`;
        } else {
            return 'Wkrótce';
        }
    }

    checkScheduledJobs() {
        // Scheduler logic placeholder
        console.log('Checking scheduled jobs...');
    }

    generateScheduleId() {
        return 'SCH-' + Date.now().toString(36).toUpperCase();
    }

    saveSchedules() {
        const schedulesData = Array.from(this.schedules.entries());
        localStorage.setItem('reportsSchedule_data', JSON.stringify(schedulesData));
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

    useTemplate(templateId) {
        console.log('Using template:', templateId);
    }

    editSchedule(scheduleId) {
        console.log('Editing schedule:', scheduleId);
    }

    importSchedule() {
        console.log('Import schedule');
    }

    handleReportGenerated(eventData) {
        console.log('Handling report generated:', eventData);
    }

    showError(message) {
        this.showToast(message, '#dc3545');
    }

    showSuccess(message) {
        this.showToast(message, '#28a745');
    }

    showToast(message, color) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            background: ${color}; color: white; padding: 12px 20px;
            border-radius: 4px; z-index: 1000; font-size: 14px;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Main UI method for reports schedule
    showReportsSchedule() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getReportsScheduleHTML();
        }
    }

    // HTML template for reports schedule
    getReportsScheduleHTML() {
        return `
            <div class="test-reports-schedule">
                <div class="reports-header">
                    <h2>Harmonogram raportów</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="reportsSchedule.createSchedule()">
                            ➕ Nowy harmonogram
                        </button>
                        <button class="btn btn-secondary" onclick="reportsSchedule.importSchedule()">
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
                        <div class="template-card" onclick="reportsSchedule.useTemplate('daily')">
                            <div class="template-icon">📅</div>
                            <div class="template-name">Dzienny</div>
                            <div class="template-desc">Raporty generowane codziennie</div>
                        </div>
                        <div class="template-card" onclick="reportsSchedule.useTemplate('weekly')">
                            <div class="template-icon">📊</div>
                            <div class="template-name">Tygodniowy</div>
                            <div class="template-desc">Raporty zbiorcze co tydzień</div>
                        </div>
                        <div class="template-card" onclick="reportsSchedule.useTemplate('monthly')">
                            <div class="template-icon">📈</div>
                            <div class="template-name">Miesięczny</div>
                            <div class="template-desc">Raporty miesięczne z analizą</div>
                        </div>
                        <div class="template-card" onclick="reportsSchedule.useTemplate('custom')">
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

    // HTML template for active schedules
    getActiveSchedulesHTML() {
        return `
            <div class="schedule-item">
                <div class="schedule-info">
                    <strong>Raport miesięczny</strong>
                    <span class="schedule-frequency">Co miesiąc, 1 dzień</span>
                </div>
                <div class="schedule-status active">Aktywny</div>
                <div class="schedule-actions">
                    <button class="btn-small btn-edit" onclick="reportsSchedule.editSchedule('monthly-1')">
                        ✏️ Edytuj
                    </button>
                    <button class="btn-small btn-delete" onclick="reportsSchedule.deleteSchedule('monthly-1')">
                        🗑️ Usuń
                    </button>
                </div>
            </div>
            <div class="schedule-item">
                <div class="schedule-info">
                    <strong>Raport tygodniowy</strong>
                    <span class="schedule-frequency">Co tydzień, poniedziałek</span>
                </div>
                <div class="schedule-status active">Aktywny</div>
                <div class="schedule-actions">
                    <button class="btn-small btn-edit" onclick="reportsSchedule.editSchedule('weekly-1')">
                        ✏️ Edytuj
                    </button>
                    <button class="btn-small btn-delete" onclick="reportsSchedule.deleteSchedule('weekly-1')">
                        🗑️ Usuń
                    </button>
                </div>
            </div>
        `;
    }

    // HTML template for scheduled queue
    getScheduledQueueHTML() {
        return `
            <div class="queue-item">
                <div class="queue-info">
                    <strong>Raport miesięczny - Styczeń 2024</strong>
                    <span class="queue-time">Zaplanowany na: 01.02.2024 08:00</span>
                </div>
                <div class="queue-status pending">Oczekujący</div>
            </div>
            <div class="queue-item">
                <div class="queue-info">
                    <strong>Raport tygodniowy - Tydzień 5</strong>
                    <span class="queue-time">Zaplanowany na: 29.01.2024 08:00</span>
                </div>
                <div class="queue-status processing">W trakcie</div>
            </div>
        `;
    }

    useTemplate(templateType) {
        console.log('Using template:', templateType);
        this.createSchedule(templateType);
    }

    deleteSchedule(scheduleId) {
        if (confirm('Czy na pewno chcesz usunąć ten harmonogram?')) {
            console.log('Deleting schedule:', scheduleId);
            this.showSuccess('Harmonogram został usunięty');
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportsSchedule;
}
