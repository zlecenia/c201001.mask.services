/* ====================
   frontend/js/config.js
   ==================== */

let CONFIG = {};
let MENU_STRUCTURE = {};

// Function to load configuration files
async function loadConfig() {
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
        CONFIG = await appConfigResponse.json();
        console.log('App config loaded:', CONFIG);

        // Load menu structure
        console.log('Loading menu config from /config/menu.json');
        const menuConfigResponse = await fetch('/config/menu.json');
        if (!menuConfigResponse.ok) {
            const errorText = await menuConfigResponse.text();
            console.error('Failed to load menu config:', errorText);
            throw new Error(`Failed to load menu config: ${menuConfigResponse.status} ${menuConfigResponse.statusText}`);
        }
        MENU_STRUCTURE = await menuConfigResponse.json();
        console.log('Menu config loaded:', MENU_STRUCTURE);

        // Set dynamic URLs based on current host
        if (window.location.hostname !== 'localhost') {
            const host = window.location.hostname;
            CONFIG.API_URL = `http://${host}:${CONFIG.API_PORT || 3000}`;
            CONFIG.WS_URL = `ws://${host}:${CONFIG.WS_PORT || 3000}`;
        }

        console.log('Configuration loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading configuration:', error);
        // Fallback to default config if loading fails
        CONFIG = {
            API_URL: window.location.hostname === 'localhost' 
                ? 'http://localhost:3000' 
                : `http://${window.location.hostname}:3000`,
            WS_URL: window.location.hostname === 'localhost'
                ? 'ws://localhost:3000'
                : `ws://${window.location.hostname}:3000`,
            MOCK_MODE: true,
            UPDATE_INTERVAL: 5000
        };
        return false;
    }
}

// Export the config and menu structure
export { CONFIG, MENU_STRUCTURE, loadConfig };
