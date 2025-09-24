/**
 * MASKTRONIC C20 - Enhanced Test Reports Module (Modular)
 * Main orchestrator for modular test reports functionality
 * Optimized for 400x1280 display (7.9" LCD IPS touchscreen)
 */

class TestReportsEnhanced {
    constructor() {
        this.core = new ReportsCore();
        this.generation = new ReportsGeneration(this.core);
        this.batch = new ReportsBatch(this.core);
        this.schedule = new ReportsSchedule(this.core);
        this.display = new ReportsDisplay(this.core);
        this.init();
    }

    init() {
        console.log('✅ TestReportsEnhanced orchestrator initialized with modular components');
        this.setupGlobalReferences();
    }

    setupGlobalReferences() {
        // Make modular components globally accessible
        window.reportsCore = this.core;
        window.reportsGeneration = this.generation;
        window.reportsBatch = this.batch;
        window.reportsSchedule = this.schedule;
        window.reportsDisplay = this.display;
    }

    // Main menu display methods - delegated to modular components
    showReports() {
        this.display.showReportsDisplay();
    }

    showReportsGeneration() {
        this.generation.showReportsGeneration();
    }

    showBatchReports() {
        this.batch.showBatchReports();
    }

    showReportsSchedule() {
        this.schedule.showReportsSchedule();
    }

    // Data access methods - delegated to ReportsCore
    getReportsCount() {
        return this.core.getReportsCount();
    }

    getPassedReportsCount() {
        return this.core.getPassedReportsCount();
    }

    getFailedReportsCount() {
        return this.core.getFailedReportsCount();
    }

    getUniqueCustomersCount() {
        return this.core.getUniqueCustomersCount();
    }

    getAllReports() {
        return this.core.getAllReports();
    }

    // Legacy compatibility methods - delegated to modular components
    loadReportTemplates() {
        console.log('Template loading handled by ReportsCore');
    }

    setupExportFormats() {
        console.log('Export formats handled by ReportsCore');
    }

    loadMockReports() {
        console.log('Mock data loading handled by ReportsCore');
    }

    setupNotifications() {
        console.log('Notifications handled by ReportsCore');
    }

    // Menu integration methods
    showReportsView() {
        if (this.display) {
            this.display.showReportsView();
        }
    }

    showReportsBatch() {
        if (this.batch) {
            this.batch.showBatchGenerator();
        }
    }

    showReportsSchedule() {
        if (this.schedule) {
            this.schedule.showReportsSchedule();
        }
    }

    // Helper methods for HTML templates
    getReportsListHTML() {
        if (this.display) {
            return this.display.getReportsListHTML();
        }
        return '<div class="no-reports">Brak raportów do wyświetlenia</div>';
    }

    getScheduledQueueHTML() {
        if (this.schedule) {
            return this.schedule.getScheduledQueueHTML();
        }
        return '<div class="no-scheduled">Brak zaplanowanych raportów</div>';
    }

    getActiveSchedulesHTML() {
        if (this.schedule) {
            return this.schedule.getActiveSchedulesHTML();
        }
        return '<div class="no-schedules">Brak aktywnych harmonogramów</div>';
    }

    // Legacy menu compatibility methods
    backToReports() {
        this.showReports();
    }
}

// Initialize enhanced test reports module
window.testReportsEnhanced = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof ReportsCore !== 'undefined' && 
        typeof ReportsGeneration !== 'undefined' && 
        typeof ReportsBatch !== 'undefined' && 
        typeof ReportsSchedule !== 'undefined' && 
        typeof ReportsDisplay !== 'undefined') {
        window.testReportsEnhanced = new TestReportsEnhanced();
        console.log('✅ TestReportsEnhanced initialized with all modular components');
    } else {
        console.error('❌ Missing modular components for TestReportsEnhanced');
    }
});

// Create global instance
window.testReportsEnhanced = new TestReportsEnhanced();

console.log('✅ Enhanced Test Reports Module loaded');
