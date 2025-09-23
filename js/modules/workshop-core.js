/**
 * MASKSERVICE C20 - Workshop Core Module
 * Core data management and basic functionality for workshop operations
 * @version 2.0.0
 * @author MASKSERVICE Team
 */

class WorkshopCore {
    constructor() {
        this.spareParts = new Map();
        this.maintenanceEvents = new Map();
        this.calibrationTools = new Map();
        this.deviceTypes = ['PP_MASK', 'NP_MASK', 'SCBA', 'CPS'];
        this.inventoryData = new Map();
        this.init();
    }

    /**
     * Initialize core workshop data
     */
    init() {
        this.loadSpareParts();
        this.loadMaintenanceSchedule();
        this.loadCalibrationTools();
        this.loadInventoryData();
        this.setupEventListeners();
        console.log('✅ WorkshopCore initialized');
    }

    /**
     * Load mock spare parts data
     */
    loadSpareParts() {
        const mockParts = [
            { id: 'P001', name: 'Filtr HEPA P3', quantity: 15, minLevel: 5, price: 45.50, supplier: 'FilterTech', category: 'FILTER' },
            { id: 'P002', name: 'Uszczelka główna', quantity: 8, minLevel: 10, price: 12.30, supplier: 'SealPro', category: 'SEAL' },
            { id: 'P003', name: 'Zawór wydechowy', quantity: 3, minLevel: 5, price: 89.00, supplier: 'ValveCorp', category: 'VALVE' },
            { id: 'P004', name: 'Pasek głowowy', quantity: 12, minLevel: 8, price: 23.40, supplier: 'StrapCo', category: 'STRAP' },
            { id: 'P005', name: 'Szyba ochronna', quantity: 6, minLevel: 4, price: 67.80, supplier: 'GlassTech', category: 'VISOR' }
        ];

        mockParts.forEach(part => {
            this.spareParts.set(part.id, part);
        });
    }

    /**
     * Load mock maintenance schedule data
     */
    loadMaintenanceSchedule() {
        const mockEvents = [
            { id: 'M001', date: '2024-01-25', device: 'PP001', type: 'Przegląd 6-miesięczny', technician: 'Jan Kowalski', status: 'SCHEDULED' },
            { id: 'M002', date: '2024-01-30', device: 'SCBA003', type: 'Kalibracja roczna', technician: 'Anna Nowak', status: 'SCHEDULED' },
            { id: 'M003', date: '2024-02-05', device: 'NP002', type: 'Wymiana filtra', technician: 'Piotr Wiśniewski', status: 'COMPLETED' }
        ];

        mockEvents.forEach(event => {
            this.maintenanceEvents.set(event.id, event);
        });
    }

    /**
     * Load mock calibration tools data
     */
    loadCalibrationTools() {
        const mockTools = [
            { id: 'T001', name: 'Miernik ciśnienia', status: 'OK', lastCalibration: '2024-01-01', nextCalibration: '2025-01-01', location: 'LAB-001' },
            { id: 'T002', name: 'Analizator przepływu', status: 'OVERDUE', lastCalibration: '2023-06-15', nextCalibration: '2024-06-15', location: 'LAB-002' },
            { id: 'T003', name: 'Termometr cyfrowy', status: 'OK', lastCalibration: '2023-12-01', nextCalibration: '2024-12-01', location: 'LAB-001' }
        ];

        mockTools.forEach(tool => {
            this.calibrationTools.set(tool.id, tool);
        });
    }

    /**
     * Load mock inventory data
     */
    loadInventoryData() {
        const mockInventory = [
            { id: 'INV001', category: 'FILTERS', totalValue: 682.50, lastUpdate: '2024-01-20', status: 'CURRENT' },
            { id: 'INV002', category: 'SEALS', totalValue: 98.40, lastUpdate: '2024-01-20', status: 'NEEDS_UPDATE' },
            { id: 'INV003', category: 'VALVES', totalValue: 267.00, lastUpdate: '2024-01-15', status: 'CURRENT' }
        ];

        mockInventory.forEach(item => {
            this.inventoryData.set(item.id, item);
        });
    }

    /**
     * Setup global event listeners for workshop operations
     */
    setupEventListeners() {
        document.addEventListener('partOrderRequest', (e) => this.handlePartOrder(e.detail));
        document.addEventListener('maintenanceScheduled', (e) => this.handleMaintenanceSchedule(e.detail));
        document.addEventListener('toolCalibrationUpdate', (e) => this.handleToolCalibration(e.detail));
        document.addEventListener('inventoryUpdate', (e) => this.handleInventoryUpdate(e.detail));
    }

    /**
     * Handle part order requests
     */
    handlePartOrder(orderDetails) {
        console.log('Processing part order:', orderDetails);
        // Update part quantities
        if (this.spareParts.has(orderDetails.partId)) {
            const part = this.spareParts.get(orderDetails.partId);
            part.quantity += orderDetails.quantity;
            this.spareParts.set(orderDetails.partId, part);
            
            // Dispatch update event
            document.dispatchEvent(new CustomEvent('partQuantityUpdated', {
                detail: { partId: orderDetails.partId, newQuantity: part.quantity }
            }));
        }
    }

    /**
     * Handle maintenance schedule updates
     */
    handleMaintenanceSchedule(scheduleDetails) {
        console.log('Processing maintenance schedule:', scheduleDetails);
        this.maintenanceEvents.set(scheduleDetails.id, scheduleDetails);
        
        // Dispatch update event
        document.dispatchEvent(new CustomEvent('maintenanceScheduleUpdated', {
            detail: scheduleDetails
        }));
    }

    /**
     * Handle tool calibration updates
     */
    handleToolCalibration(calibrationDetails) {
        console.log('Processing tool calibration:', calibrationDetails);
        if (this.calibrationTools.has(calibrationDetails.toolId)) {
            const tool = this.calibrationTools.get(calibrationDetails.toolId);
            tool.lastCalibration = calibrationDetails.date;
            tool.nextCalibration = calibrationDetails.nextDate;
            tool.status = calibrationDetails.status || 'OK';
            this.calibrationTools.set(calibrationDetails.toolId, tool);
        }
    }

    /**
     * Handle inventory updates
     */
    handleInventoryUpdate(inventoryDetails) {
        console.log('Processing inventory update:', inventoryDetails);
        this.inventoryData.set(inventoryDetails.id, inventoryDetails);
    }

    /**
     * Get all spare parts
     */
    getSpareParts() {
        return Array.from(this.spareParts.values());
    }

    /**
     * Get spare part by ID
     */
    getSparePart(id) {
        return this.spareParts.get(id);
    }

    /**
     * Get all maintenance events
     */
    getMaintenanceEvents() {
        return Array.from(this.maintenanceEvents.values());
    }

    /**
     * Get maintenance events for specific date
     */
    getMaintenanceEventsForDate(date) {
        return this.getMaintenanceEvents().filter(event => event.date === date);
    }

    /**
     * Get all calibration tools
     */
    getCalibrationTools() {
        return Array.from(this.calibrationTools.values());
    }

    /**
     * Get tools requiring calibration
     */
    getToolsRequiringCalibration() {
        return this.getCalibrationTools().filter(tool => tool.status === 'OVERDUE');
    }

    /**
     * Get inventory data
     */
    getInventoryData() {
        return Array.from(this.inventoryData.values());
    }

    /**
     * Get total inventory value
     */
    getTotalInventoryValue() {
        return this.getSpareParts().reduce((total, part) => {
            return total + (part.quantity * part.price);
        }, 0);
    }

    /**
     * Get inventory currency symbol
     */
    getTotalInventoryCurrency() {
        const systemConfig = window.CONFIG || {};
        const currency = systemConfig.currency || 'PLN';
        
        const currencySymbols = {
            'PLN': 'zł',
            'EUR': '€',
            'USD': '$',
            'GBP': '£'
        };
        
        return currencySymbols[currency] || 'zł';
    }

    /**
     * Save configuration to localStorage
     */
    saveConfig() {
        try {
            const config = {
                spareParts: Array.from(this.spareParts.entries()),
                maintenanceEvents: Array.from(this.maintenanceEvents.entries()),
                calibrationTools: Array.from(this.calibrationTools.entries()),
                inventoryData: Array.from(this.inventoryData.entries())
            };
            localStorage.setItem('workshopConfig', JSON.stringify(config));
            console.log('✅ Workshop configuration saved');
            return true;
        } catch (error) {
            console.error('❌ Error saving workshop configuration:', error);
            return false;
        }
    }

    /**
     * Load configuration from localStorage
     */
    loadConfig() {
        try {
            const saved = localStorage.getItem('workshopConfig');
            if (saved) {
                const config = JSON.parse(saved);
                
                this.spareParts = new Map(config.spareParts || []);
                this.maintenanceEvents = new Map(config.maintenanceEvents || []);
                this.calibrationTools = new Map(config.calibrationTools || []);
                this.inventoryData = new Map(config.inventoryData || []);
                
                console.log('✅ Workshop configuration loaded from storage');
                return true;
            }
        } catch (error) {
            console.error('❌ Error loading workshop configuration:', error);
        }
        return false;
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkshopCore;
}

console.log('✅ WorkshopCore module loaded');
