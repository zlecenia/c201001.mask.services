/**
 * MASKTRONIC C20 - Configuration Management Module
 * Handles loading and management of application configuration
 * Simple global class system - no AMD dependencies
 */

class ConfigManager {
    constructor() {
        this.CONFIG = {};
        this.MENU_STRUCTURE = {};
        console.log('⚙️ ConfigManager initialized');
    }

    /**
     * Load configuration files
     */
    async loadConfig() {
    console.log('Starting configuration loading...');
    try {
        // Load app config
        console.log('Loading app config from /config/app.json');
        const appConfigResponse = await fetch('/config/app.json');
        if (!appConfigResponse.ok) {
            const errorText = await appConfigResponse.text();
            console.error('Failed to load app config:', errorText);
            throw new Error(`Failed to load app config: ${appConfigResponse.status} ${appConfigResponse.statusText}`);
        }
        this.CONFIG = await appConfigResponse.json();
        console.log('App config loaded:', this.CONFIG);

        // Load menu structure
        console.log('Loading menu config from /config/menu.json');
        const menuConfigResponse = await fetch('/config/menu.json');
        if (!menuConfigResponse.ok) {
            const errorText = await menuConfigResponse.text();
            console.error('Failed to load menu config:', errorText);
            throw new Error(`Failed to load menu config: ${menuConfigResponse.status} ${menuConfigResponse.statusText}`);
        }
        this.MENU_STRUCTURE = await menuConfigResponse.json();
        console.log('Menu config loaded:', this.MENU_STRUCTURE);

        // Set dynamic URLs based on current host
        if (window.location.hostname !== 'localhost') {
            const host = window.location.hostname;
            this.CONFIG.API_URL = `http://${host}:${this.CONFIG.API_PORT || 3000}`;
            this.CONFIG.WS_URL = `ws://${host}:${this.CONFIG.WS_PORT || 3000}`;
        }

        // Export to global for backwards compatibility
        window.CONFIG = this.CONFIG;
        window.MENU_STRUCTURE = this.MENU_STRUCTURE;

        console.log('Configuration loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading configuration:', error);
        // Fallback to default config if loading fails
        this.CONFIG = {
            API_URL: window.location.hostname === 'localhost' 
                ? 'http://localhost:3000' 
                : `http://${window.location.hostname}:3000`,
            WS_URL: window.location.hostname === 'localhost'
                ? 'ws://localhost:3000'
                : `ws://${window.location.hostname}:3000`,
            MOCK_MODE: true,
            UPDATE_INTERVAL: 5000
        };
        
        // Export to global for backwards compatibility
        window.CONFIG = this.CONFIG;
        window.MENU_STRUCTURE = this.MENU_STRUCTURE;
        
        return false;
    }
    }

    /**
     * Get current configuration
     */
    getConfig() {
        return this.CONFIG;
    }

    /**
     * Get menu structure
     */
    getMenuStructure() {
        return this.MENU_STRUCTURE;
    }
}

// Create global config manager instance for backwards compatibility
const configManager = new ConfigManager();

// Export both class and instance to global scope
window.ConfigManagerClass = ConfigManager;  // Class constructor
window.ConfigManager = configManager;       // Instance ready to use

// Export functions for global access
window.loadConfig = () => configManager.loadConfig();

console.log('✅ Config Module initialized');
