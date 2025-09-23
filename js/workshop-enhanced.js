/**
 * MASKSERVICE C20 - Enhanced Workshop Module (Modular Architecture)
 * Orchestrates workshop modules: core, parts, maintenance, tools, inventory
 * @version 2.0.0
 * @author MASKSERVICE Team
 */

class WorkshopEnhanced {
    constructor() {
        // Initialize modular components
        this.core = new WorkshopCore();
        this.parts = new WorkshopParts(this.core);
        this.maintenance = new WorkshopMaintenance(this.core);
        this.tools = new WorkshopTools(this.core);
        this.inventory = new WorkshopInventory(this.core);
        
        this.deviceTypes = ['PP_MASK', 'NP_MASK', 'SCBA', 'CPS'];
        this.init();
    }

    init() {
        // Load configuration if available
        this.core.loadConfig();
        console.log('✅ WorkshopEnhanced initialized with modular architecture');
    }

    /**
     * Compatibility methods - delegate to core module
     */
    get spareParts() {
        return this.core.spareParts;
    }
    
    get maintenanceEvents() {
        return this.core.maintenanceEvents;
    }
    
    get calibrationTools() {
        return this.core.calibrationTools;
    }

    /**
     * Main workshop HTML - now delegates to parts module as default
     */
    getEnhancedWorkshopHTML() {
        // Delegate to parts module by default
        this.showWorkshopParts();
        return ''; // Content is handled by modular components
    }

    /**
     * Configuration methods
     */
    saveConfig() {
        return this.core.saveConfig();
    }

    loadConfig() {
        return this.core.loadConfig();
    }

    /**
     * Action methods - delegate to modular components
     */
    addNewPart() {
        this.parts.addNewPart();
    }

    editPart(partId) {
        this.parts.editPart(partId);
    }

    orderPart(partId) {
        this.parts.orderPart(partId);
    }

    updatePartQuantity(partId) {
        this.parts.updatePartQuantity(partId);
    }

    addMaintenanceEvent() {
        this.maintenance.addMaintenanceEvent();
    }

    scheduleCalibration(toolId) {
        this.tools.scheduleCalibration(toolId);
    }

}

// Create global instance
window.workshopEnhanced = new WorkshopEnhanced();

console.log('✅ Enhanced Workshop Module loaded');
