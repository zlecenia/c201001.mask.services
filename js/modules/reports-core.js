/**
 * MASKSERVICE C20 - Reports Core Module
 * Core data management and configuration for test reports
 * Optimized for 400x1280 display (7.9" LCD IPS touchscreen)
 */

class ReportsCore {
    constructor() {
        this.reports = new Map();
        this.templates = new Map();
        this.exportFormats = new Map();
        this.notifications = new Map();
        this.config = {
            displayMode: 'compact', // Optimized for narrow display
            itemsPerPage: 8, // Reduced for 400px width
            touchOptimized: true
        };
        this.init();
    }

    init() {
        this.loadConfiguration();
        this.loadReportTemplates();
        this.setupExportFormats();
        this.loadMockReports();
        this.setupNotifications();
        console.log('✅ ReportsCore initialized for 400x1280 display');
    }

    loadConfiguration() {
        const savedConfig = localStorage.getItem('reportsCore_config');
        if (savedConfig) {
            this.config = { ...this.config, ...JSON.parse(savedConfig) };
        }
    }

    saveConfiguration() {
        localStorage.setItem('reportsCore_config', JSON.stringify(this.config));
    }

    loadReportTemplates() {
        const templates = [
            {
                id: 'standard_PN_EN_136',
                name: 'Standard PN-EN 136',
                description: 'Standardowy raport zgodny z PN-EN 136',
                type: 'respiratory_protection',
                fields: ['device_serial', 'test_date', 'pressure_leak', 'flow_rate', 'temperature'],
                compact: true // For narrow display
            },
            {
                id: 'batch_analysis',
                name: 'Analiza zbiorcza',
                description: 'Raport zbiorczy z wieloma urządzeniami',
                type: 'batch',
                fields: ['summary_stats', 'device_list', 'pass_fail_ratio'],
                compact: true
            },
            {
                id: 'compliance_report',
                name: 'Raport zgodności',
                description: 'Raport zgodności z przepisami',
                type: 'compliance',
                fields: ['standards_compliance', 'deviations', 'recommendations'],
                compact: true
            }
        ];

        templates.forEach(template => {
            this.templates.set(template.id, template);
        });
    }

    setupExportFormats() {
        this.exportFormats.set('pdf', {
            name: 'PDF',
            icon: '📄',
            template: 'standard_PN_EN_136',
            includeGraphs: true,
            digitalSignature: true,
            compression: true,
            compactLayout: true // For narrow display
        });

        this.exportFormats.set('xml', {
            name: 'XML',
            icon: '📋',
            schema: 'device_test_v2',
            validation: true,
            encoding: 'UTF-8'
        });

        this.exportFormats.set('csv', {
            name: 'CSV',
            icon: '📊',
            delimiter: ';',
            encoding: 'UTF-8',
            includeHeaders: true
        });
    }

    loadMockReports() {
        const mockReports = [
            {
                id: 'RPT-2024-001',
                date: '2024-01-15',
                deviceSerial: 'MSK-001-2024',
                deviceType: 'PP_MASK',
                customer: 'Firma ABC Sp. z o.o.',
                technician: 'Jan Kowalski',
                result: 'PASS',
                testData: {
                    pressureLeak: 2.1,
                    flowRate: 145,
                    temperature: 23.5
                },
                status: 'completed',
                priority: 'normal'
            },
            {
                id: 'RPT-2024-002',
                date: '2024-01-16',
                deviceSerial: 'MSK-002-2024',
                deviceType: 'SCBA',
                customer: 'Straż Pożarna Warszawa',
                technician: 'Anna Nowak',
                result: 'FAIL',
                testData: {
                    pressureLeak: 8.5,
                    flowRate: 95,
                    temperature: 24.1
                },
                status: 'completed',
                priority: 'high'
            },
            {
                id: 'RPT-2024-003',
                date: '2024-01-17',
                deviceSerial: 'MSK-003-2024',
                deviceType: 'NP_MASK',
                customer: 'Zakład Chemiczny XYZ',
                technician: 'Piotr Wiśniewski',
                result: 'PASS',
                testData: {
                    pressureLeak: 1.8,
                    flowRate: 160,
                    temperature: 22.8
                },
                status: 'completed',
                priority: 'normal'
            }
        ];

        mockReports.forEach(report => {
            this.reports.set(report.id, report);
        });
    }

    setupNotifications() {
        this.notifications.set('email', {
            enabled: true,
            recipients: ['admin@maskservice.pl'],
            templates: {
                reportGenerated: 'Report {reportId} has been generated',
                batchCompleted: 'Batch report generation completed'
            }
        });

        this.notifications.set('system', {
            enabled: true,
            showPopups: true,
            soundEnabled: false // Disabled for industrial environment
        });
    }

    // Data management methods
    addReport(reportData) {
        const reportId = this.generateReportId();
        reportData.id = reportId;
        reportData.createdAt = new Date().toISOString();
        this.reports.set(reportId, reportData);
        this.saveData();
        return reportId;
    }

    updateReport(reportId, updates) {
        if (this.reports.has(reportId)) {
            const report = this.reports.get(reportId);
            const updatedReport = { ...report, ...updates, updatedAt: new Date().toISOString() };
            this.reports.set(reportId, updatedReport);
            this.saveData();
            return true;
        }
        return false;
    }

    deleteReport(reportId) {
        if (this.reports.has(reportId)) {
            this.reports.delete(reportId);
            this.saveData();
            return true;
        }
        return false;
    }

    getReport(reportId) {
        return this.reports.get(reportId);
    }

    getAllReports() {
        return Array.from(this.reports.values());
    }

    // Filter and search methods optimized for narrow display
    filterReports(criteria) {
        return Array.from(this.reports.values()).filter(report => {
            if (criteria.customer && !report.customer.toLowerCase().includes(criteria.customer.toLowerCase())) {
                return false;
            }
            if (criteria.result && report.result !== criteria.result) {
                return false;
            }
            if (criteria.deviceType && report.deviceType !== criteria.deviceType) {
                return false;
            }
            if (criteria.dateFrom && new Date(report.date) < new Date(criteria.dateFrom)) {
                return false;
            }
            if (criteria.dateTo && new Date(report.date) > new Date(criteria.dateTo)) {
                return false;
            }
            return true;
        });
    }

    searchReports(searchTerm) {
        const term = searchTerm.toLowerCase();
        return Array.from(this.reports.values()).filter(report => 
            report.id.toLowerCase().includes(term) ||
            report.customer.toLowerCase().includes(term) ||
            report.deviceSerial.toLowerCase().includes(term) ||
            report.technician.toLowerCase().includes(term)
        );
    }

    // Statistics methods for compact display
    getReportsCount() {
        return this.reports.size;
    }

    getPassedReportsCount() {
        return Array.from(this.reports.values()).filter(r => r.result === 'PASS').length;
    }

    getFailedReportsCount() {
        return Array.from(this.reports.values()).filter(r => r.result === 'FAIL').length;
    }

    getUniqueCustomersCount() {
        const customers = new Set(Array.from(this.reports.values()).map(r => r.customer));
        return customers.size;
    }

    // Utility methods
    generateReportId() {
        const date = new Date();
        const year = date.getFullYear();
        const counter = this.reports.size + 1;
        return `RPT-${year}-${counter.toString().padStart(3, '0')}`;
    }

    saveData() {
        const reportsData = Array.from(this.reports.entries());
        localStorage.setItem('reportsCore_data', JSON.stringify(reportsData));
    }

    loadData() {
        const savedData = localStorage.getItem('reportsCore_data');
        if (savedData) {
            const reportsData = JSON.parse(savedData);
            this.reports = new Map(reportsData);
        }
    }

    // Event system for modular communication
    dispatchEvent(eventName, eventData) {
        const event = new CustomEvent(`reportsCore:${eventName}`, { 
            detail: eventData 
        });
        document.dispatchEvent(event);
    }

    // Touch-optimized configuration for 400x1280 display
    getDisplayConfig() {
        return {
            ...this.config,
            viewport: {
                width: 400,
                height: 1280,
                aspectRatio: 0.3125 // height/width = 30%
            },
            layout: {
                headerHeight: 60,
                footerHeight: 40,
                contentHeight: 1180,
                padding: 8, // Minimal padding
                fontSize: {
                    small: '12px',
                    normal: '14px',
                    large: '16px'
                }
            }
        };
    }
}

// Export for modular architecture
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportsCore;
}
