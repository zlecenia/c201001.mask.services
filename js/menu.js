/**
 * MASKTRONIC C20 - Menu Management Module
 * Modular menu system - loading, rendering, navigation
 */

class MenuManager {
    constructor() {
        this.menuConfig = null;
        this.currentMenu = null;
        this.activeRole = null;
    }

    /**
     * Load menu configuration from CONFIG or direct fetch
     */
    async loadMenuConfig() {
        if (window.CONFIG && window.CONFIG.MENU) {
            this.menuConfig = window.CONFIG.MENU;
            console.log('✅ Menu config loaded from window.CONFIG');
            return true;
        }

        try {
            const response = await fetch('/config/menu.json');
            if (response.ok) {
                this.menuConfig = await response.json();
                console.log('✅ Menu config loaded from file');
                return true;
            }
        } catch (error) {
            console.error('❌ Failed to load menu config:', error);
        }
        return false;
    }

    /**
     * Show user menu based on role
     */
    async showUserMenu(role) {
        console.log('Showing menu for user role:', role);
        
        // Ensure menu config is loaded
        if (!this.menuConfig) {
            await this.loadMenuConfig();
        }
        
        if (!this.menuConfig || !this.menuConfig[role]) {
            console.error(`❌ Menu configuration not found for role: ${role}`);
            return false;
        }

        const menuItems = this.menuConfig[role];
        const menuContainer = document.getElementById('user-menu-items');
        
        if (!menuContainer) {
            console.error('❌ Menu sidebar container not found');
            return false;
        }

        this.activeRole = role;
        this.currentMenu = menuItems;
        
        // Create menu HTML
        //let menuHtml = `<h2>Menu - ${role}</h2><div class="menu-items">`;
//                <span>Inactive: <span id="inactive-time">0s</span></span>
        let menuHtml = `            <div id="session-info" class="session-info">
                <button onclick="navigateAction('logout-btn'); logout()" class="btn-logout">Logout</button>
            </div>`;

        menuItems.forEach(item => {
            menuHtml += `
                <div class="menu-item" onclick="window.MenuManager.selectMenuOption('${item.key}')">
                    <span class="menu-icon">${item.icon}</span>
                    <span class="menu-label">${item.label}</span>
                </div>`;
        });
        
        menuHtml += '</div>';
        menuContainer.innerHTML = menuHtml;
        
        console.log(`✅ Menu displayed for ${role} with ${menuItems.length} items`);
        return true;
    }

    /**
     * Handle menu option selection
     */
    selectMenuOption(optionKey) {
        console.log('Selected menu option:', optionKey);
        
        // Find the selected menu item
        const menuItem = this.currentMenu?.find(item => item.key === optionKey);
        if (!menuItem) {
            console.error('Menu item not found:', optionKey);
            return;
        }

        // Handle different menu options
        switch (optionKey) {
            case 'test_menu':
                this.showTestMenu();
                break;
            case 'user_data':
                this.showUserData();
                break;
            case 'device_data':
                this.showDeviceData();
                break;
            case 'test_reports':
                this.showTestReports();
                break;
            case 'workshop':
                this.showWorkshop();
                break;
            case 'users':
                this.showUsers();
                break;
            case 'service_menu':
                this.showServiceMenu();
                break;
            case 'system_settings':
                this.showSystemSettings();
                break;
            case 'advanced_diagnostics':
                this.showAdvancedDiagnostics();
                break;
            default:
                console.log(`Menu option ${optionKey} not implemented yet`);
        }
    }

    /**
     * Menu option implementations
     */
    showTestMenu() {
        console.log('Opening Test Menu...');
        this.loadTemplate('test-menu-template');
    }

    showUserData() {
        console.log('Opening User Data...');
        this.loadTemplate('user-data-template');
    }

    showDeviceData() {
        console.log('Opening Device Data...');
        this.loadTemplate('device-data-template');
    }

    showTestReports() {
        console.log('Opening Test Reports...');
        this.loadTemplate('test-menu-template'); // Test reports use test menu template
    }

    showWorkshop() {
        console.log('Opening Workshop...');
        this.loadTemplate('workshop-template');
    }

    showUsers() {
        console.log('Opening Users Management...');
        this.loadTemplate('user-data-template'); // Users management uses user data template
    }

    showServiceMenu() {
        console.log('Opening Service Menu...');
        this.loadTemplate('service-menu-template');
    }

    showSystemSettings() {
        console.log('Opening System Settings...');
        this.loadTemplate('system-settings-template');
    }

    showAdvancedDiagnostics() {
        console.log('Opening Advanced Diagnostics...');
        this.loadTemplate('service-menu-template'); // Use service menu template for diagnostics
    }

    /**
     * Load HTML template into menu content area
     */
    loadTemplate(templateId) {
        console.log(`🎯 Loading template: ${templateId}`);
        
        const template = document.getElementById(templateId);
        const menuContent = document.getElementById('menu-content');
        
        if (!template) {
            console.error(`❌ Template not found: ${templateId}`);
            menuContent.innerHTML = `<div class="error-message">
                <h2>Template Not Found</h2>
                <p>Template "${templateId}" is not available.</p>
            </div>`;
            return false;
        }
        
        if (!menuContent) {
            console.error('❌ Menu content container not found');
            return false;
        }
        
        // Clone template content and insert into menu-content
        menuContent.innerHTML = template.innerHTML;
        console.log(`✅ Template loaded successfully: ${templateId}`);
        return true;
    }

    /**
     * Get current menu state
     */
    getCurrentMenu() {
        return {
            role: this.activeRole,
            items: this.currentMenu,
            config: this.menuConfig
        };
    }
}

/**
 * Global template button functions
 * These functions are called by buttons inside loaded templates
 */

// Test menu option selection
window.selectTestOption = function(option) {
    console.log(`🎯 Test option selected: ${option}`);
    
    switch(option) {
        case 'device':
            console.log('Loading device selection...');
            window.MenuManager.loadTemplate('device-select-template');
            break;
        case 'type':
            console.log('Loading device type selection...');
            alert('Device Type selection - Feature coming soon!');
            break;
        case 'test':
            console.log('Loading test selection...');
            alert('Test Kind selection - Feature coming soon!');
            break;
        case 'flow':
            console.log('Loading test flow...');
            alert('Test Flow selection - Feature coming soon!');
            break;
        default:
            console.log(`Test option ${option} not implemented yet`);
            alert(`Test option "${option}" - Feature coming soon!`);
    }
};

// Device selection 
window.selectDevice = function(device) {
    console.log(`🎯 Device selected: ${device}`);
    alert(`Device "${device}" selected! \nTest configuration - Feature coming soon!`);
};

// Back to menu function
window.backToMenu = function() {
    console.log('🔙 Returning to main menu...');
    const menuContent = document.getElementById('menu-content');
    if (menuContent) {
        menuContent.innerHTML = `<div class="welcome-message">
            <h2>Wybierz opcję z menu</h2>
            <p>System gotowy do pracy</p>
        </div>`;
    }
};

// Helper functions for compatibility
function clearPasswordInput() {
    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
        passwordInput.value = '';
    }
}

function deleteLastPasswordChar() {
    const input = document.getElementById('password-input');
    input.value = input.value.slice(0, -1);
}

// Enhanced menu navigation
function navigateToSubmenu(menuKey, submenuKey) {
    console.log(`Navigating to ${menuKey} -> ${submenuKey}`);
    // Implementation for submenu navigation
}

// Create global menu manager instance
window.MenuManager = new MenuManager();

// Export functions for HTML onclick handlers and compatibility
window.showUserMenu = (role) => window.MenuManager.showUserMenu(role);
window.selectMenuOption = (optionKey) => window.MenuManager.selectMenuOption(optionKey);
window.clearPasswordInput = clearPasswordInput;
window.deleteLastPasswordChar = deleteLastPasswordChar;
window.navigateToSubmenu = navigateToSubmenu;

console.log('✅ Menu Module initialized');
