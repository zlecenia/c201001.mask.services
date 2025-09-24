/**
 * MASKTRONIC C20 - Menu Management Module
 * Modular menu system - loading, rendering, navigation
 * Simple global class system - no AMD dependencies
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
     * Initialize menu for specific role (wrapper method for compatibility)
     */
    async initializeMenu(role) {
        console.log(`🔄 Initializing menu for role: ${role}`);
        return await this.showUserMenu(role);
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
                <button onclick="logout()" class="btn-logout" data-i18n="menu.logout">Logout</button>
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
     * Enhanced for modular architecture with fallback handling
     */
    async selectMenuOption(optionKey) {
        console.log('Selected menu option:', optionKey);
        
        // Find the selected menu item
        const menuItem = this.currentMenu?.find(item => item.key === optionKey);
        if (!menuItem) {
            console.warn(`Menu item not found in currentMenu: ${optionKey}`);
            console.log('🔍 Current menu state:', {
                activeRole: this.activeRole,
                currentMenuLength: this.currentMenu?.length || 0,
                availableKeys: this.currentMenu?.map(item => item.key) || []
            });
            
            // Try to reinitialize menu for current role
            if (this.activeRole) {
                console.log(`🔄 Attempting to reinitialize menu for role: ${this.activeRole}`);
                await this.initializeMenu(this.activeRole);
                
                // Try to find menu item again after reinitialization
                const retryMenuItem = this.currentMenu?.find(item => item.key === optionKey);
                if (!retryMenuItem) {
                    console.error(`❌ Menu item still not found after reinitialization: ${optionKey}`);
                    // Continue anyway - attempt direct template loading
                }
            }
        }

        // Handle different menu options
        switch (optionKey) {
            case 'test_wizard':
                this.showTestWizard();
                break;
            case 'test_quick':
                this.showTestQuick();
                break;
            case 'test_scenarios':
                this.showTestScenarios();
                break;
            case 'user_data':
                this.showUserData();
                break;
            case 'realtime_sensors':
                this.showRealtimeSensors();
                break;
            case 'device_history':
                this.showDeviceHistory();
                break;
            case 'reports_view':
                this.showReportsView();
                break;
            case 'reports_batch':
                this.showReportsBatch();
                break;
            case 'reports_schedule':
                this.showReportsSchedule();
                break;
            case 'workshop_parts':
                this.showWorkshopParts();
                break;
            case 'workshop_maintenance':
                this.showWorkshopMaintenance();
                break;
            case 'workshop_tools':
                this.showWorkshopTools();
                break;
            case 'workshop_inventory':
                this.showWorkshopInventory();
                break;
            case 'users':
                this.showUsers();
                break;
            case 'service_menu':
                this.showServiceMenu();
                break;
            case 'settings_scenarios':
                this.showSettingsScenarios();
                break;
            case 'settings_integration':
                this.showSettingsIntegration();
                break;
            case 'settings_standards':
                this.showSettingsStandards();
                break;
            case 'settings_system':
                this.showSettingsSystem();
                break;
            case 'advanced_diagnostics':
                this.showAdvancedDiagnostics();
                break;
            default:
                console.log(`Menu option ${optionKey} not implemented yet`);
        }
    }

    /**
     * Menu option implementations - Enhanced with new modules
     */
    showTestWizard() {
        console.log('Opening Test Wizard...');
        // Use enhanced module if available
        if (window.testMenuEnhanced) {
            testMenuEnhanced.showTestWizard();
        } else {
            // Use Vue.js navigation instead of legacy template loading
            if (window.MaskServiceVue) {
                window.MaskServiceVue.navigateToScreen('test-menu', 'pl', 'default');
            }
        }
    }

    showTestQuick() {
        console.log('Opening Quick Test...');
        // Use enhanced module if available
        if (window.testMenuEnhanced) {
            testMenuEnhanced.showTestQuick();
        } else {
            // Use Vue.js navigation instead of legacy template loading
            if (window.MaskServiceVue) {
                window.MaskServiceVue.navigateToScreen('test-menu', 'pl', 'default');
            }
        }
    }

    showTestScenarios() {
        console.log('Opening Test Scenarios...');
        // Use enhanced module if available
        if (window.testMenuEnhanced) {
            testMenuEnhanced.showTestScenarios();
        } else {
            // Use Vue.js navigation instead of legacy template loading
            if (window.MaskServiceVue) {
                window.MaskServiceVue.navigateToScreen('test-menu', 'pl', 'default');
            }
        }
    }

    showUserData() {
        console.log('Opening User Data...');
        // Use Vue.js navigation instead of legacy template loading
        if (window.MaskServiceVue) {
            window.MaskServiceVue.navigateToScreen('user-data', 'pl', 'default');
        }
    }

    showRealtimeSensors() {
        console.log('Opening Realtime Sensors...');
        // Use Vue.js navigation instead of legacy template loading
        if (window.MaskServiceVue) {
            window.MaskServiceVue.navigateToScreen('realtime-sensors', 'pl', 'default');
        }
    }

    showDeviceHistory() {
        console.log('Opening Device History...');
        // Use Vue.js navigation instead of legacy template loading
        if (window.MaskServiceVue) {
            window.MaskServiceVue.navigateToScreen('device-history', 'pl', 'default');
        }
    }

    showReportsView() {
        console.log('Opening Reports View...');
        // Use Vue.js navigation instead of legacy template loading
        if (window.MaskServiceVue) {
            window.MaskServiceVue.navigateToScreen('reports-view', 'pl', 'default');
        }
    }

    showReportsBatch() {
        console.log('Opening Batch Reports Generator...');
        // Use enhanced module if available
        if (window.testReportsEnhanced) {
            testReportsEnhanced.showReportsBatch();
        } else {
            // Use Vue.js navigation instead of legacy template loading
            if (window.MaskServiceVue) {
                window.MaskServiceVue.navigateToScreen('reports-batch', 'pl', 'default');
            }
        }
    }

    showReportsSchedule() {
        console.log('Opening Reports Schedule...');
        // Use enhanced module if available
        if (window.testReportsEnhanced) {
            testReportsEnhanced.showReportsSchedule();
        } else {
            // Use Vue.js navigation instead of legacy template loading
            if (window.MaskServiceVue) {
                window.MaskServiceVue.navigateToScreen('reports-schedule', 'pl', 'default');
            }
        }
    }

    showWorkshopParts() {
        console.log('Opening Workshop Parts...');
        // Use enhanced module if available
        if (window.workshopEnhanced) {
            workshopEnhanced.showWorkshopParts();
        } else {
            // Use Vue.js navigation instead of legacy template loading
            if (window.MaskServiceVue) {
                window.MaskServiceVue.navigateToScreen('workshop-parts', 'pl', 'default');
            }
        }
    }

    showWorkshopMaintenance() {
        console.log('Opening Workshop Maintenance...');
        // Use enhanced module if available
        if (window.workshopEnhanced) {
            workshopEnhanced.showWorkshopMaintenance();
        } else {
            // Use Vue.js navigation instead of legacy template loading
            if (window.MaskServiceVue) {
                window.MaskServiceVue.navigateToScreen('workshop-maintenance', 'pl', 'default');
            }
        }
    }

    showWorkshopTools() {
        console.log('Opening Workshop Tools...');
        // Use enhanced module if available
        if (window.workshopEnhanced) {
            workshopEnhanced.showWorkshopTools();
        } else {
            // Use Vue.js navigation instead of legacy template loading
            if (window.MaskServiceVue) {
                window.MaskServiceVue.navigateToScreen('workshop-tools', 'pl', 'default');
            }
        }
    }

    showWorkshopInventory() {
        console.log('Opening Workshop Inventory...');
        // Use enhanced module if available
        if (window.workshopEnhanced) {
            workshopEnhanced.showWorkshopInventory();
        } else {
            // Use Vue.js navigation instead of legacy template loading
            if (window.MaskServiceVue) {
                window.MaskServiceVue.navigateToScreen('workshop-inventory', 'pl', 'default');
            }
        }
    }

    showUsers() {
        console.log('Opening Users Management...');
        // Use Vue.js navigation instead of legacy template loading
        if (window.MaskServiceVue) {
            window.MaskServiceVue.navigateToScreen('users', 'pl', 'default');
        }
        this.loadUsersList();
    }

    /**
     * Load users list from storage and display
     */
    loadUsersList() {
        const users = this.getUsersFromStorage();
        const usersList = document.querySelector('.users-list');
        
        if (!usersList) {
            setTimeout(() => this.loadUsersList(), 100);
            return;
        }

        usersList.innerHTML = '';
        
        users.forEach((user, index) => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            
            userItem.innerHTML = `
                <span class="username">${user.username}</span>
                <span class="role-badge role-${user.role.toLowerCase()}" data-i18n="roles.${user.role.toLowerCase()}">${user.role}</span>
                <div class="user-actions">
                    <button class="btn-small btn-edit" onclick="window.MenuManager.editUser(${index})" data-i18n="actions.edit">Edit</button>
                    <button class="btn-small btn-delete" onclick="window.MenuManager.deleteUser(${index})" data-i18n="actions.delete">Delete</button>
                </div>
            `;
            
            usersList.appendChild(userItem);
        });
        
        // Add "Add User" button functionality
        const addUserBtn = document.querySelector('[data-i18n="users.add_user"]');
        if (addUserBtn) {
            addUserBtn.onclick = () => this.addUser();
        }
    }

    /**
     * Get users from localStorage or return default users
     */
    getUsersFromStorage() {
        const stored = localStorage.getItem('maskservice_users');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.warn('Invalid users data in storage, using defaults');
            }
        }
        
        // Default users
        const defaultUsers = [
            { username: 'operator1', role: 'OPERATOR', password: '1234', created: Date.now() },
            { username: 'admin1', role: 'ADMIN', password: 'admin', created: Date.now() },
            { username: 'super1', role: 'SUPERUSER', password: 'super', created: Date.now() },
            { username: 'service1', role: 'SERVICEUSER', password: 'service', created: Date.now() }
        ];
        
        this.saveUsersToStorage(defaultUsers);
        return defaultUsers;
    }

    /**
     * Save users to localStorage
     */
    saveUsersToStorage(users) {
        try {
            localStorage.setItem('maskservice_users', JSON.stringify(users));
            console.log('💾 Users saved to storage');
        } catch (e) {
            console.error('❌ Failed to save users to storage:', e);
        }
    }

    /**
     * Add new user
     */
    addUser() {
        console.log('Adding new user...');
        
        if (window.InlineDialog) {
            const dialog = new InlineDialog({
                title: 'Add New User',
                fields: [
                    {
                        id: 'username',
                        label: 'Username',
                        type: 'text',
                        required: true,
                        pattern: '^[a-zA-Z0-9_]{3,20}$',
                        placeholder: 'Enter username (3-20 chars)'
                    },
                    {
                        id: 'password',
                        label: 'Password',
                        type: 'password',
                        required: true,
                        minLength: 4,
                        placeholder: 'Enter password (min 4 chars)'
                    },
                    {
                        id: 'role',
                        label: 'Role',
                        type: 'select',
                        required: true,
                        options: [
                            { value: 'OPERATOR', label: 'Operator' },
                            { value: 'ADMIN', label: 'Administrator' },
                            { value: 'SUPERUSER', label: 'Superuser' },
                            { value: 'SERVICEUSER', label: 'Serwisant' }
                        ]
                    }
                ],
                onSubmit: (data) => {
                    this.createUser(data);
                }
            });
            dialog.show();
        } else {
            // Fallback for simple prompt
            const username = prompt('Enter username:');
            const password = prompt('Enter password:');
            const role = prompt('Enter role (OPERATOR/ADMIN/SUPERUSER/SERVICEUSER):');
            
            if (username && password && role) {
                this.createUser({ username, password, role: role.toUpperCase() });
            }
        }
    }

    /**
     * Edit existing user
     */
    editUser(userIndex) {
        console.log('Editing user at index:', userIndex);
        
        const users = this.getUsersFromStorage();
        const user = users[userIndex];
        
        if (!user) {
            console.error('❌ User not found at index:', userIndex);
            return;
        }

        if (window.InlineDialog) {
            const dialog = new InlineDialog({
                title: `Edit User: ${user.username}`,
                fields: [
                    {
                        id: 'username',
                        label: 'Username',
                        type: 'text',
                        required: true,
                        pattern: '^[a-zA-Z0-9_]{3,20}$',
                        value: user.username,
                        placeholder: 'Enter username (3-20 chars)'
                    },
                    {
                        id: 'password',
                        label: 'New Password (leave empty to keep current)',
                        type: 'password',
                        required: false,
                        minLength: 4,
                        placeholder: 'Enter new password or leave empty'
                    },
                    {
                        id: 'role',
                        label: 'Role',
                        type: 'select',
                        required: true,
                        value: user.role,
                        options: [
                            { value: 'OPERATOR', label: 'Operator' },
                            { value: 'ADMIN', label: 'Administrator' },
                            { value: 'SUPERUSER', label: 'Superuser' },
                            { value: 'SERVICEUSER', label: 'Serwisant' }
                        ]
                    }
                ],
                onSubmit: (data) => {
                    this.updateUser(userIndex, data);
                }
            });
            dialog.show();
        } else {
            // Fallback for simple prompt
            const username = prompt('Enter username:', user.username);
            const password = prompt('Enter new password (leave empty to keep current):');
            const role = prompt('Enter role:', user.role);
            
            if (username && role) {
                const updateData = { username, role: role.toUpperCase() };
                if (password) updateData.password = password;
                this.updateUser(userIndex, updateData);
            }
        }
    }

    /**
     * Delete user
     */
    deleteUser(userIndex) {
        const users = this.getUsersFromStorage();
        const user = users[userIndex];
        
        if (!user) {
            console.error('❌ User not found at index:', userIndex);
            return;
        }

        if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
            users.splice(userIndex, 1);
            this.saveUsersToStorage(users);
            this.loadUsersList();
            console.log('🗑️ User deleted:', user.username);
        }
    }

    /**
     * Create new user
     */
    createUser(userData) {
        const users = this.getUsersFromStorage();
        
        // Check if username already exists
        if (users.some(u => u.username === userData.username)) {
            alert(`Username "${userData.username}" already exists!`);
            return;
        }

        // Validate role
        const validRoles = ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERVICEUSER'];
        if (!validRoles.includes(userData.role)) {
            alert(`Invalid role "${userData.role}". Valid roles: ${validRoles.join(', ')}`);
            return;
        }

        const newUser = {
            username: userData.username,
            password: userData.password,
            role: userData.role,
            created: Date.now(),
            modified: Date.now()
        };

        users.push(newUser);
        this.saveUsersToStorage(users);
        this.loadUsersList();
        
        console.log('✅ User created:', newUser.username);
        alert(`User "${newUser.username}" created successfully!`);
    }

    /**
     * Update existing user
     */
    updateUser(userIndex, updateData) {
        const users = this.getUsersFromStorage();
        const user = users[userIndex];
        
        if (!user) {
            console.error('❌ User not found at index:', userIndex);
            return;
        }

        // Check if new username conflicts with existing users (excluding current user)
        if (updateData.username !== user.username) {
            const existingUser = users.find((u, i) => i !== userIndex && u.username === updateData.username);
            if (existingUser) {
                alert(`Username "${updateData.username}" already exists!`);
                return;
            }
        }

        // Validate role
        const validRoles = ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERVICEUSER'];
        if (!validRoles.includes(updateData.role)) {
            alert(`Invalid role "${updateData.role}". Valid roles: ${validRoles.join(', ')}`);
            return;
        }

        // Update user data
        user.username = updateData.username;
        user.role = updateData.role;
        user.modified = Date.now();
        
        // Update password only if provided
        if (updateData.password) {
            user.password = updateData.password;
        }

        this.saveUsersToStorage(users);
        this.loadUsersList();
        
        console.log('✅ User updated:', user.username);
        alert(`User "${user.username}" updated successfully!`);
    }

    showServiceMenu() {
        console.log('Opening Service Menu...');
        // Use Vue.js navigation instead of legacy template loading
        if (window.MaskServiceVue) {
            window.MaskServiceVue.navigateToScreen('service-menu', 'pl', 'default');
        }
    }

    showSettingsScenarios() {
        console.log('Opening Settings - Scenarios...');
        // Use Vue.js navigation instead of legacy template loading
        if (window.MaskServiceVue) {
            window.MaskServiceVue.navigateToScreen('system-settings', 'pl', 'scenarios');
        }
    }

    showSettingsIntegration() {
        console.log('Opening Settings - Integration...');
        // Use Vue.js navigation instead of legacy template loading
        if (window.MaskServiceVue) {
            window.MaskServiceVue.navigateToScreen('system-settings', 'pl', 'integration');
        }
    }

    showSettingsStandards() {
        console.log('Opening Settings - Standards...');
        // Use Vue.js navigation instead of legacy template loading
        if (window.MaskServiceVue) {
            window.MaskServiceVue.navigateToScreen('system-settings', 'pl', 'standards');
        }
    }

    showSettingsSystem() {
        console.log('Opening Settings - System...');
        // Use Vue.js navigation instead of legacy template loading
        if (window.MaskServiceVue) {
            window.MaskServiceVue.navigateToScreen('system-settings', 'pl', 'system');
        }
    }

    showServiceScreen() {
        console.log('Opening Service Screen...');
        // Use Vue.js navigation instead of legacy template loading
        if (window.MaskServiceVue) {
            window.MaskServiceVue.navigateToScreen('service-menu', 'pl', 'default');
        }
    }

    /**
     * Load HTML template into menu content area
     * Now supports both static templates and dynamic loading via ViewLoader
     */
    async loadTemplate(templateId) {
        console.log(`🎯 Loading template: ${templateId}`);
        
        const menuContent = document.getElementById('menu-content');
        
        if (!menuContent) {
            console.error('❌ Menu content container not found');
            return false;
        }
        
        try {
            // First try to find template in DOM (for backward compatibility)
            let template = document.getElementById(templateId);
            let templateContent = '';
            
            if (template) {
                // Static template found in DOM
                templateContent = template.innerHTML;
                console.log(`✅ Static template found: ${templateId}`);
            } else if (window.viewLoader && window.viewLoader.hasView(templateId)) {
                // Try dynamic loading with ViewLoader
                console.log(`🔄 Loading template dynamically: ${templateId}`);
                templateContent = await window.viewLoader.loadView(templateId);
                console.log(`✅ Dynamic template loaded: ${templateId} (${templateContent.length} chars)`);
            } else {
                // Template not found anywhere
                console.error(`❌ Template not found: ${templateId}`);
                menuContent.innerHTML = `<div class="error-message">
                    <h2>Template Not Found</h2>
                    <p>Template "${templateId}" is not available.</p>
                    <p>Available templates: ${window.viewLoader ? window.viewLoader.getRegisteredViews().join(', ') : 'ViewLoader not available'}</p>
                </div>`;
                return false;
            }
            
            // Insert template content into menu-content
            menuContent.innerHTML = templateContent;
            
            // Apply i18n if available
            if (window.changeLanguage && window.currentLanguage) {
                this._applyI18nToElement(menuContent);
            }
            
            console.log(`✅ Template loaded successfully: ${templateId}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to load template ${templateId}:`, error);
            menuContent.innerHTML = `<div class="error-message">
                <h2>Template Load Error</h2>
                <p>Failed to load template "${templateId}": ${error.message}</p>
            </div>`;
            return false;
        }
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

    /**
     * Apply internationalization to loaded element
     */
    _applyI18nToElement(element) {
        try {
            const i18nElements = element.querySelectorAll('[data-i18n]');
            i18nElements.forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (key && window.i18nManager?.translate) {
                    const translation = window.i18nManager.translate(key);
                    if (translation !== key) {
                        el.textContent = translation;
                    }
                }
            });
        } catch (error) {
            console.warn('Failed to apply i18n to element:', error);
        }
    }

    /**
     * Navigate to template with proper router/hash update
     */
    async navigateToTemplate(templateId, routePath) {
        console.log(`🛣️ Navigating to template: ${templateId} (route: ${routePath})`);
        
        try {
            // Delegate routing to C20Router to prevent conflicts
            if (window.C20Router && routePath) {
                const currentLang = window.currentLanguage || 'pl';
                const newHash = `#/${routePath}/${currentLang}/default`;
                console.log(`🛣️ Delegating navigation to C20Router: ${window.location.hash} → ${newHash}`);
                
                // Use C20Router navigation instead of direct hash manipulation
                if (window.C20Router.navigateToView) {
                    await window.C20Router.navigateToView(routePath, currentLang, 'default');
                } else {
                    // Fallback to hash if C20Router.navigateToView not available
                    window.location.hash = newHash;
                }
            }
            
            // Load template
            const result = await this.loadTemplate(templateId);
            
            if (result) {
                console.log(`✅ Navigation completed: ${templateId}`);
            } else {
                console.error(`❌ Navigation failed: ${templateId}`);
            }
            
            return result;
            
        } catch (error) {
            console.error(`❌ Navigation error for ${templateId}:`, error);
            return false;
        }
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

// Create global menu manager instance for backwards compatibility
const menuManager = new MenuManager();

// Export both class and instance to global scope
window.MenuManagerClass = MenuManager;  // Class constructor
window.MenuManager = menuManager;       // Instance ready to use

// Export functions for HTML onclick handlers and compatibility
window.showUserMenu = (role) => menuManager.showUserMenu(role);
window.selectMenuOption = (optionKey) => menuManager.selectMenuOption(optionKey);
window.clearPasswordInput = clearPasswordInput;
window.deleteLastPasswordChar = deleteLastPasswordChar;
window.navigateToSubmenu = navigateToSubmenu;

console.log('✅ Menu Module initialized');
