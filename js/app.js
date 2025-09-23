/**
 * MASKTRONIC C20 - Main Application Module
 * Integrates with modular components: auth.js, menu.js, utils.js, keyboard.js
 */

import { CONFIG, MENU_STRUCTURE, loadConfig } from './config.js';

class MasktronicApp {
    constructor() {
        this.currentScreen = 'login-screen';
        this.mockData = null;
        this.init();
    }

    async init() {
        try {
            // Load configuration first
            await loadConfig();
            console.log('✅ Configuration loaded:', CONFIG);
            
            // Make CONFIG accessible to other modules
            window.CONFIG = CONFIG;
            
            // Initialize i18n system
            if (window.I18nManager) {
                await window.I18nManager.init();
                console.log('✅ I18n system initialized');
            }
            
            // Initialize modular components
            this.setupEventListeners();
            this.startClock();
            this.loadMockData();
            
            console.log('✅ MASKTRONIC C20 - Fully Initialized with Modular Architecture + I18n');
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
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
        
        // Activity tracking is now handled by AuthManager
        console.log('✅ Event listeners setup complete');
    }

    startClock() {
        setInterval(() => {
            const now = new Date();
            document.getElementById('clock').textContent = now.toLocaleTimeString();
            document.getElementById('footer-date').textContent = now.toLocaleDateString();
        }, 1000);
    }

    switchScreen(screenId) {
        // Use modular Utils.switchScreen for consistency
        if (window.Utils) {
            window.Utils.switchScreen(this.currentScreen, screenId);
        } else {
            // Fallback for compatibility
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            document.getElementById(screenId).classList.add('active');
        }
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

// Global functions are now handled by modular components:
// - auth.js: mockLogin, logout
// - menu.js: showUserMenu, selectMenuOption  
// - utils.js: selectLoginMethod, togglePasswordVisibility
// - keyboard.js: VirtualKeyboard class
console.log('✅ App.js - Modular integration complete');

// selectLoginMethod is now in utils.js - removed duplicate

// addToPassword functionality is now handled by VirtualKeyboard class

// mockLogin is now in auth.js (AuthManager class) - removed duplicate
// Activity tracking is now handled by AuthManager in auth.js

// selectMenuItem is now handled by MenuManager.selectMenuOption in menu.js

// updateMenuContent is now handled within MenuManager class methods

// updateDeviceData is now part of the mock data system
// logout is now handled by AuthManager.logout() in auth.js

// Mock data updates - keeping in app.js as part of core app functionality
function startMockDataUpdates() {
    setInterval(() => {
        // Update pressure values
        const pressureLow = document.getElementById('pressure-low');
        const pressureMedium = document.getElementById('pressure-medium'); 
        const pressureHigh = document.getElementById('pressure-high');
        
        if (pressureLow) pressureLow.textContent = (10 + Math.random() * 2).toFixed(1) + ' mbar';
        if (pressureMedium) pressureMedium.textContent = (20 + Math.random() * 2).toFixed(1) + ' bar';
        if (pressureHigh) pressureHigh.textContent = (30 + Math.random() * 2).toFixed(1) + ' bar';
            
        // Update device data if visible
        const tempValue = document.getElementById('temp-value');
        const humidityValue = document.getElementById('humidity-value');
        
        if (tempValue) tempValue.textContent = (22 + Math.random() * 4 - 2).toFixed(1) + '°C';
        if (humidityValue) humidityValue.textContent = (45 + Math.random() * 10 - 5).toFixed(0) + '%';
    }, CONFIG?.UPDATE_INTERVAL || 1000);
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
