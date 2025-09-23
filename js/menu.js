/* ====================
   frontend/js/menu.js
   ==================== */

// Additional menu functionality and helpers

function clearPasswordInput() {
    document.getElementById('password-input').value = '';
}

function deleteLastPasswordChar() {
    const input = document.getElementById('password-input');
    input.value = input.value.slice(0, -1);
}

// Enhanced menu navigation
function navigateToSubmenu(menuKey, submenuKey) {
    console.log(`Navigating to ${menuKey} -> ${submenuKey}`);
    
    const content = document.getElementById('menu-content');
    const submenuTemplate = document.getElementById(`${submenuKey}-template`);
    
    if (submenuTemplate) {
        content.innerHTML = submenuTemplate.innerHTML;
    } else {
        content.innerHTML = `
            <h2>${submenuKey.replace('_', ' ').toUpperCase()}</h2>
            <p>Submenu w przygotowaniu...</p>
            <button class="btn btn-back" onclick="selectMenuItem('${menuKey}')">← Powrót</button>
        `;
    }
}

// Test simulation helpers
function startPressureTest() {
    console.log('Starting pressure test...');
    alert('Test ciśnienia rozpoczęty!\n\nMonitoruj panel ciśnienia po prawej stronie.');
}

function startLeakTest() {
    console.log('Starting leak test...');
    alert('Test szczelności rozpoczęty!\n\nCzas trwania: 60 sekund');
}

function startFlowTest() {
    console.log('Starting flow test...');
    alert('Test przepływu rozpoczęty!\n\nSprawdzanie +10 l/min');
}

// User management helpers (Admin only)
function addNewUser() {
    if (app.userRole !== 'ADMIN' && app.userRole !== 'SUPERUSER') {
        alert('Brak uprawnień!');
        return;
    }
    
    const username = prompt('Nazwa użytkownika:');
    const role = prompt('Rola (OPERATOR/ADMIN):');
    
    if (username && role) {
        alert(`Użytkownik ${username} został dodany z rolą ${role}`);
        console.log(`Added user: ${username} with role: ${role}`);
    }
}

function editUser(username) {
    if (app.userRole !== 'ADMIN' && app.userRole !== 'SUPERUSER') {
        alert('Brak uprawnień!');
        return;
    }
    
    alert(`Edycja użytkownika: ${username}`);
    console.log(`Editing user: ${username}`);
}

// System settings helpers (Superuser only)
function saveSystemSettings() {
    if (app.userRole !== 'SUPERUSER') {
        alert('Brak uprawnień!');
        return;
    }
    
    alert('Ustawienia systemu zostały zapisane!');
    console.log('System settings saved');
}

function runSystemDiagnostics() {
    alert('Diagnostyka systemu...\n\n✅ CPU: OK\n✅ RAM: OK\n✅ Dysk: OK\n✅ Sieć: OK');
    console.log('System diagnostics completed');
}

function calibrateSensors() {
    alert('Kalibracja czujników...\n\nCzas trwania: 2 minuty');
    console.log('Sensor calibration started');
}

function createSystemBackup() {
    alert('Tworzenie kopii zapasowej...\n\nPlik: backup_' + new Date().toISOString().split('T')[0] + '.db');
    console.log('System backup created');
}

// Report generation
function generateTestReport() {
    const reportId = 'RPT' + Date.now().toString().slice(-6);
    alert(`Generowanie raportu...\n\nID: ${reportId}\nFormat: PDF\nStatus: Gotowy do pobrania`);
    console.log(`Generated report: ${reportId}`);
}

// Workshop helpers
function viewEquipmentList() {
    const content = document.getElementById('menu-content');
    content.innerHTML = `
        <h2>Equipment List</h2>
        <div class="equipment-list">
            <div class="equipment-item">
                <span>Pressure Tester PT-100</span>
                <span class="status-online">ACTIVE</span>
            </div>
            <div class="equipment-item">
                <span>Flow Meter FM-200</span>
                <span class="status-online">ACTIVE</span>
            </div>
            <div class="equipment-item">
                <span>Leak Detector LD-300</span>
                <span style="color: orange;">MAINTENANCE</span>
            </div>
        </div>
        <button class="btn btn-back" onclick="selectMenuItem('workshop')">← Powrót</button>
    `;
}

function viewSpareParts() {
    const content = document.getElementById('menu-content');
    content.innerHTML = `
        <h2>Spare Parts</h2>
        <div class="parts-list">
            <div class="part-item">
                <span>Pressure Sensor PS-01</span>
                <span>Qty: 5</span>
            </div>
            <div class="part-item">
                <span>Valve Assembly VA-02</span>
                <span>Qty: 3</span>
            </div>
            <div class="part-item">
                <span>Filter Element FE-03</span>
                <span style="color: red;">Qty: 0</span>
            </div>
        </div>
        <button class="btn btn-back" onclick="selectMenuItem('workshop')">← Powrót</button>
    `;
}

function viewMaintenanceSchedule() {
    const content = document.getElementById('menu-content');
    content.innerHTML = `
        <h2>Maintenance Schedule</h2>
        <div class="maintenance-list">
            <div class="maintenance-item">
                <span>Weekly Calibration</span>
                <span>Next: 2024-01-22</span>
            </div>
            <div class="maintenance-item">
                <span>Monthly Inspection</span>
                <span>Next: 2024-02-01</span>
            </div>
            <div class="maintenance-item">
                <span>Annual Service</span>
                <span>Next: 2024-12-15</span>
            </div>
        </div>
        <button class="btn btn-back" onclick="selectMenuItem('workshop')">← Powrót</button>
    `;
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // F1 - Help
    if (e.key === 'F1') {
        e.preventDefault();
        showHelp();
    }
    
    // F5 - Refresh data
    if (e.key === 'F5') {
        e.preventDefault();
        refreshData();
    }
    
    // Ctrl+L - Logout
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        logout();
    }
});

function showHelp() {
    alert(`MASKTRONIC C20 - Pomoc

Skróty klawiszowe:
• ESC - Powrót do menu
• F1 - Ta pomoc
• F5 - Odśwież dane
• Ctrl+L - Wyloguj

Nawigacja:
• Kliknij opcje menu po lewej stronie
• Użyj przycisków powrotu
• Panel ciśnienia po prawej stronie`);
}

function refreshData() {
    console.log('Refreshing data...');
    if (CONFIG.MOCK_MODE) {
        startMockDataUpdates();
    }
    alert('Dane zostały odświeżone!');
}
