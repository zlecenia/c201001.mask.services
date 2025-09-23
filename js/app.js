/* ====================
   frontend/js/app.js
   ==================== */

import { CONFIG, MENU_STRUCTURE, loadConfig } from './config.js';

class MasktronicApp {
    constructor() {
        this.currentScreen = 'login-screen';
        this.currentUser = null;
        this.userRole = null;
        this.mockData = null;
        this.loginTime = null;
        this.lastActivity = null;
        this.init();
    }

    async init() {
        try {
            // Load configuration first
            await loadConfig();
            console.log('Configuration loaded:', CONFIG);
            
            // Then initialize the rest of the app
            this.setupEventListeners();
            this.startClock();
            this.loadMockData();
            console.log('MASKTRONIC C20 Mock - Initialized');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            // Show error to user
            alert('Failed to load application configuration. Please try refreshing the page.');
        }
    }

    setupEventListeners() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.backToMenu();
            }
        });

        // Update last activity
        document.addEventListener('click', () => {
            this.lastActivity = new Date();
        });
    }

    startClock() {
        setInterval(() => {
            const now = new Date();
            document.getElementById('clock').textContent = now.toLocaleTimeString();
            document.getElementById('footer-date').textContent = now.toLocaleDateString();
        }, 1000);
    }

    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }

    async loadMockData() {
        // Load mock data
        if (CONFIG.MOCK_MODE) {
            this.mockData = {
                devices: [
                    { id: 1, serial: 'PP001', type: 'PP_MASK', status: 'ACTIVE' },
                    { id: 2, serial: 'NP002', type: 'NP_MASK', status: 'ACTIVE' },
                    { id: 3, serial: 'SCBA003', type: 'SCBA', status: 'MAINTENANCE' }
                ],
                tests: [
                    { id: 1, device_id: 1, type: 'PRESSURE', status: 'PASSED', date: '2024-01-15' },
                    { id: 2, device_id: 2, type: 'LEAK', status: 'FAILED', date: '2024-01-16' }
                ]
            };
        }
    }

    updateStatus(status) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.getElementById('status-text');
        
        statusText.textContent = status;
        if (status === 'ONLINE') {
            statusDot.classList.add('online');
        } else {
            statusDot.classList.remove('online');
        }
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', async () => {
    app = new MasktronicApp();
    // No need to call init() here as it's called in the constructor
});

// Global functions for HTML onclick handlers - Expose to window object
window.selectLoginMethod = selectLoginMethod;
window.addToPassword = addToPassword;
window.mockLogin = mockLogin;
window.showUserMenu = showUserMenu;
window.selectMenuItem = selectMenuItem;
window.logout = logout;
window.selectTestOption = selectTestOption;
window.selectDevice = selectDevice;
window.backToMenu = backToMenu;
window.togglePasswordVisibility = togglePasswordVisibility;
window.selectLoginMethod = selectLoginMethod;

// Global functions for HTML onclick handlers
function selectLoginMethod(method) {
    document.querySelectorAll('.login-method').forEach(m => {
        m.classList.remove('active');
    });
    document.getElementById(`login-${method}`).classList.add('active');
    
    document.querySelectorAll('.menu-sidebar .menu-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
}

function addToPassword(digit) {
    const input = document.getElementById('password-input');
    input.value += digit;
}

function mockLogin(role) {
    const password = document.getElementById('password-input').value.trim();
    
    // Simple validation
    if (!password) {
        alert('Please enter a password');
        return;
    }
    
    console.log(`Logging in as ${role} with password`);
    
    // In a real app, this would be an API call to your backend
    // Example: fetch(`${CONFIG.API_URL}/api/login`, { method: 'POST', body: JSON.stringify({ password, role }) })
    
    // Set user data
    const user = {
        username: role.toLowerCase(),
        role: role,
        token: `mock-jwt-token-${Date.now()}`,
        lastLogin: new Date().toISOString()
    };
    
    // Store user in app state
    app.currentUser = user;
    app.userRole = role;
    app.loginTime = new Date();
    app.lastActivity = new Date();
    
    // Clear password field
    document.getElementById('password-input').value = '';
    
    // Update UI
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('system-screen').classList.add('active');
    
    // Show user menu based on role
    showUserMenu(role);
    
    // Start activity tracking
    setInterval(() => {
        const now = new Date();
        const inactiveTime = Math.floor((now - app.lastActivity) / 1000);
        document.getElementById('inactive-time').textContent = `${inactiveTime}s`;
        
        // Auto-logout after 30 minutes of inactivity
        if (inactiveTime > 1800) { // 30 minutes
            app.logout();
        }
    }, 1000);
    
    console.log('Login successful:', user);
}

// Removed duplicate showUserMenu function - using improved version later in file

function selectMenuItem(key) {
    const content = document.getElementById('menu-content');
    const template = document.getElementById(`${key.replace('_','-')}-template`);
    
    if (template) {
        content.innerHTML = template.innerHTML;
        
        // Update dynamic content based on menu item
        updateMenuContent(key);
    } else {
        content.innerHTML = `
            <h2>${key.replace('_', ' ').toUpperCase()}</h2>
            <p>Funkcja w przygotowaniu...</p>
        `;
    }
}

function updateMenuContent(key) {
    switch(key) {
        case 'user_data':
            if (document.getElementById('current-user-name')) {
                document.getElementById('current-user-name').textContent = app.currentUser;
                document.getElementById('current-user-role').textContent = app.userRole;
                document.getElementById('login-time').textContent = app.loginTime ? app.loginTime.toLocaleTimeString() : '---';
                document.getElementById('last-activity').textContent = app.lastActivity ? app.lastActivity.toLocaleTimeString() : '---';
            }
            break;
        case 'device_data':
            updateDeviceData();
            break;
    }
}

function updateDeviceData() {
    if (document.getElementById('device-uptime')) {
        const uptime = app.loginTime ? Math.floor((new Date() - app.loginTime) / 1000) : 0;
        document.getElementById('device-uptime').textContent = `${uptime}s`;
    }
}

function logout() {
    app.currentUser = null;
    app.userRole = null;
    app.loginTime = null;
    app.lastActivity = null;
    app.switchScreen('login-screen');
    app.updateStatus('OFFLINE');
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('pressure-panel').style.display = 'none';
    document.getElementById('footer-user').textContent = 'SERWISANT: ---';
}

function startMockDataUpdates() {
    setInterval(() => {
        // Update pressure values
        document.getElementById('pressure-low').textContent = 
            (10 + Math.random() * 2).toFixed(1) + ' mbar';
        document.getElementById('pressure-medium').textContent = 
            (20 + Math.random() * 2).toFixed(1) + ' bar';
        document.getElementById('pressure-high').textContent = 
            (30 + Math.random() * 2).toFixed(1) + ' bar';
            
        // Update device data if visible
        if (document.getElementById('temp-value')) {
            document.getElementById('temp-value').textContent = 
                (22 + Math.random() * 4 - 2).toFixed(1) + '°C';
        }
        if (document.getElementById('humidity-value')) {
            document.getElementById('humidity-value').textContent = 
                (45 + Math.random() * 10 - 5).toFixed(0) + '%';
        }
        
        // Update device uptime
        updateDeviceData();
    }, CONFIG.UPDATE_INTERVAL);
}

function selectTestOption(option) {
    console.log('Selected test option:', option);
    const content = document.getElementById('menu-content');
    content.innerHTML = document.getElementById('device-select-template').innerHTML;
}

function selectDevice(device) {
    console.log('Selected device:', device);
    alert(`Wybrano urządzenie: ${device}\n\nSymulacja testu zostanie uruchomiona...`);
    
    // Simulate test start
    const content = document.getElementById('menu-content');
    content.innerHTML = `
        <h2>Test w trakcie...</h2>
        <div class="test-progress">
            <p>Urządzenie: <strong>${device}</strong></p>
            <p>Status: <span style="color: orange;">W TRAKCIE</span></p>
            <div class="loading-bar">
                <div class="loading-progress" id="test-progress"></div>
            </div>
            <p id="test-step">Inicjalizacja testu...</p>
        </div>
        <button class="btn btn-back" onclick="backToMenu()">← Powrót do menu</button>
    `;
    
    // Simulate test progress
    simulateTest();
}

function simulateTest() {
    const steps = [
        "Sprawdzanie połączeń...",
        "Test szczelności -10 mbar...",
        "Stabilizacja ciśnienia...",
        "Test przepływu +10 l/min...",
        "Test zaworów...",
        "Finalizacja testu..."
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            document.getElementById('test-step').textContent = steps[currentStep];
            document.getElementById('test-progress').style.width = ((currentStep + 1) / steps.length * 100) + '%';
            currentStep++;
        } else {
            clearInterval(interval);
            document.getElementById('test-step').textContent = "Test zakończony pomyślnie!";
            document.getElementById('test-step').style.color = 'green';
        }
    }, 1500);
}

function backToMenu() {
    const content = document.getElementById('menu-content');
    content.innerHTML = document.getElementById('test-menu-template').innerHTML;
}

// Add missing showUserMenu function for login redirect
function showUserMenu(role) {
    console.log('Showing menu for user role:', role);
    
    // Get menu configuration for the role
    if (window.CONFIG && window.CONFIG.MENU && window.CONFIG.MENU[role]) {
        const menuItems = window.CONFIG.MENU[role];
        const menuContainer = document.getElementById('menu-content');
        
        if (menuContainer) {
            // Create menu HTML
            let menuHtml = `<h2>Menu - ${role}</h2><div class="menu-items">`;
            
            menuItems.forEach(item => {
                menuHtml += `
                    <div class="menu-item" onclick="selectMenuOption('${item.id}')">
                        <h3>${item.title}</h3>
                        <p>${item.description || ''}</p>
                    </div>
                `;
            });
            
            menuHtml += '</div>';
            menuContainer.innerHTML = menuHtml;
        }
    } else {
        console.error('Menu configuration not found for role:', role);
        // Fallback menu
        const menuContainer = document.getElementById('menu-content');
        if (menuContainer) {
            menuContainer.innerHTML = `
                <h2>Menu - ${role}</h2>
                <div class="menu-items">
                    <div class="menu-item">
                        <h3>System Overview</h3>
                        <p>View system status and basic controls</p>
                    </div>
                </div>
            `;
        }
    }
}

// Restore togglePasswordVisibility function - needed for HTML onclick
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password-input');
    const toggleButton = document.querySelector('.toggle-password');
    
    if (passwordInput && toggleButton) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleButton.textContent = '🙈'; // Hide icon
            toggleButton.title = 'Hide password';
        } else {
            passwordInput.type = 'password';
            toggleButton.textContent = '👁️'; // Show icon
            toggleButton.title = 'Show password';
        }
        
        // Keep focus on the input
        passwordInput.focus();
        
        // Move cursor to end of input
        setTimeout(() => {
            passwordInput.setSelectionRange(passwordInput.value.length, passwordInput.value.length);
        }, 10);
    }
}
