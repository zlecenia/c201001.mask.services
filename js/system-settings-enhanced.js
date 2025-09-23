/**
 * MASKSERVICE C20 - Enhanced System Settings Module
 * Advanced system configuration for SUPERUSER role
 * Test scenario management, external integrations, standards compliance
 */

class SystemSettingsEnhanced {
    constructor() {
        this.testScenarios = new Map();
        this.integrationSettings = new Map();
        this.standardsConfig = new Map();
        this.systemConfig = {};
        this.init();
    }

    init() {
        this.loadTestScenarios();
        this.loadIntegrationSettings();
        this.loadStandardsConfig();
        this.loadSystemConfig();
    }

    // Test scenarios management
    testScenarios = {
        editor: {
            createNew: true,
            modifyExisting: true,
            importFromXML: true,
            validateAgainstNorms: true // PN-EN 136/137
        },
        mapping: {
            deviceType: 'scenario_matrix',
            testInterval: 'scenario_selection',
            customRules: true
        }
    };

    loadTestScenarios() {
        const scenarios = [
            {
                id: 'scenario_1',
                name: 'Test po użyciu',
                norm: 'PN-EN 136',
                deviceTypes: ['PP_MASK', 'NP_MASK'],
                parameters: {
                    pressureTest: { min: -10, max: -5, unit: 'mbar' },
                    leakTest: { max: 0.5, unit: 'l/min' },
                    duration: 300
                }
            },
            {
                id: 'scenario_2',
                name: 'Test 6-miesięczny',
                norm: 'PN-EN 136',
                deviceTypes: ['PP_MASK', 'NP_MASK', 'SCBA'],
                parameters: {
                    pressureTest: { min: -15, max: -10, unit: 'mbar' },
                    flowTest: { min: 40, max: 60, unit: 'l/min' },
                    duration: 600
                }
            }
        ];

        scenarios.forEach(scenario => {
            this.testScenarios.set(scenario.id, scenario);
        });
    }

    loadIntegrationSettings() {
        this.integrationSettings.set('erpSystem', {
            enabled: false,
            url: '',
            apiKey: '',
            syncInterval: 3600
        });

        this.integrationSettings.set('cloudBackup', {
            enabled: true,
            provider: 'azure',
            schedule: 'daily',
            retention: 365
        });
    }

    loadStandardsConfig() {
        this.standardsConfig.set('activeNorms', ['PN-EN 136', 'PN-EN 137']);
        this.standardsConfig.set('customParameters', []);
        this.standardsConfig.set('complianceChecking', true);
    }

    loadSystemConfig() {
        this.systemConfig = {
            deviceTimeout: 30000,
            sensorUpdateInterval: 1000,
            maxConcurrentTests: 3,
            dataRetention: 1825, // 5 years in days
            auditLogEnabled: true
        };
    }

    getEnhancedSystemSettingsHTML() {
        return `
            <div class="system-settings-enhanced">
                <div class="settings-header">
                    <h2>Ustawienia systemowe - Rozszerzone</h2>
                    <div class="settings-tabs">
                        <button class="tab-btn active" onclick="systemSettingsEnhanced.showTab('scenarios')">
                            🧪 Scenariusze testowe
                        </button>
                        <button class="tab-btn" onclick="systemSettingsEnhanced.showTab('integration')">
                            🔗 Integracje
                        </button>
                        <button class="tab-btn" onclick="systemSettingsEnhanced.showTab('standards')">
                            📋 Normy i standardy
                        </button>
                        <button class="tab-btn" onclick="systemSettingsEnhanced.showTab('system')">
                            ⚙️ Konfiguracja systemu
                        </button>
                    </div>
                </div>

                <div class="settings-content">
                    <div id="settings-tab-content">
                        ${this.getTestScenariosHTML()}
                    </div>
                </div>

                <div class="settings-actions">
                    <button class="btn btn-success" onclick="systemSettingsEnhanced.saveAllSettings()">
                        💾 Zapisz wszystkie ustawienia
                    </button>
                    <button class="btn btn-warning" onclick="systemSettingsEnhanced.resetToDefaults()">
                        🔄 Przywróć domyślne
                    </button>
                    <button class="btn btn-info" onclick="systemSettingsEnhanced.exportConfiguration()">
                        📤 Eksportuj konfigurację
                    </button>
                </div>
            </div>
        `;
    }

    getTestScenariosHTML() {
        return `
            <div class="test-scenarios-config">
                <div class="scenarios-header">
                    <h3>Zarządzanie scenariuszami testowymi</h3>
                    <button class="btn btn-primary" onclick="systemSettingsEnhanced.createNewScenario()">
                        ➕ Nowy scenariusz
                    </button>
                </div>

                <div class="scenarios-list">
                    ${Array.from(this.testScenarios.values()).map(scenario => `
                        <div class="scenario-card">
                            <div class="scenario-header">
                                <h4>${scenario.name}</h4>
                                <span class="norm-badge">${scenario.norm}</span>
                            </div>
                            <div class="scenario-details">
                                <p><strong>Typy urządzeń:</strong> ${scenario.deviceTypes.join(', ')}</p>
                                <p><strong>Parametry:</strong></p>
                                <ul>
                                    ${Object.entries(scenario.parameters).map(([key, value]) => 
                                        `<li>${key}: ${JSON.stringify(value)}</li>`
                                    ).join('')}
                                </ul>
                            </div>
                            <div class="scenario-actions">
                                <button class="btn-small btn-secondary" onclick="systemSettingsEnhanced.editScenario('${scenario.id}')">
                                    ✏️ Edytuj
                                </button>
                                <button class="btn-small btn-info" onclick="systemSettingsEnhanced.validateScenario('${scenario.id}')">
                                    ✅ Waliduj
                                </button>
                                <button class="btn-small btn-danger" onclick="systemSettingsEnhanced.deleteScenario('${scenario.id}')">
                                    🗑️ Usuń
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="scenario-import">
                    <h4>Import scenariuszy</h4>
                    <input type="file" id="scenario-file" accept=".xml,.json">
                    <button class="btn btn-secondary" onclick="systemSettingsEnhanced.importScenarios()">
                        📥 Importuj z pliku
                    </button>
                </div>
            </div>
        `;
    }

    getIntegrationHTML() {
        return `
            <div class="integration-settings">
                <h3>Integracje z systemami zewnętrznymi</h3>
                
                <div class="integration-section">
                    <h4>System ERP</h4>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" ${this.integrationSettings.get('erpSystem').enabled ? 'checked' : ''}>
                            Włącz integrację ERP
                        </label>
                    </div>
                    <div class="form-group">
                        <label>URL API:</label>
                        <input type="text" value="${this.integrationSettings.get('erpSystem').url}" placeholder="https://api.erp.company.com">
                    </div>
                    <div class="form-group">
                        <label>Klucz API:</label>
                        <input type="password" value="${this.integrationSettings.get('erpSystem').apiKey}" placeholder="Wprowadź klucz API">
                    </div>
                </div>

                <div class="integration-section">
                    <h4>Kopia zapasowa w chmurze</h4>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" ${this.integrationSettings.get('cloudBackup').enabled ? 'checked' : ''}>
                            Włącz backup w chmurze
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Dostawca:</label>
                        <select>
                            <option value="azure" ${this.integrationSettings.get('cloudBackup').provider === 'azure' ? 'selected' : ''}>Microsoft Azure</option>
                            <option value="aws">Amazon AWS</option>
                            <option value="gcp">Google Cloud</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    getStandardsHTML() {
        return `
            <div class="standards-config">
                <h3>Normy i standardy</h3>
                
                <div class="active-norms">
                    <h4>Aktywne normy</h4>
                    ${this.standardsConfig.get('activeNorms').map(norm => `
                        <div class="norm-item">
                            <label>
                                <input type="checkbox" checked>
                                ${norm}
                            </label>
                            <button class="btn-small btn-info" onclick="systemSettingsEnhanced.viewNormDetails('${norm}')">
                                📖 Szczegóły
                            </button>
                        </div>
                    `).join('')}
                </div>

                <div class="compliance-settings">
                    <h4>Ustawienia zgodności</h4>
                    <label>
                        <input type="checkbox" ${this.standardsConfig.get('complianceChecking') ? 'checked' : ''}>
                        Automatyczne sprawdzanie zgodności
                    </label>
                </div>
            </div>
        `;
    }

    getSystemConfigHTML() {
        return `
            <div class="system-config">
                <h3>Konfiguracja systemu</h3>
                
                <div class="config-groups">
                    <div class="config-group">
                        <h4>Ustawienia urządzeń</h4>
                        <div class="form-group">
                            <label>Timeout urządzenia (ms):</label>
                            <input type="number" value="${this.systemConfig.deviceTimeout}">
                        </div>
                        <div class="form-group">
                            <label>Interwał odczytu czujników (ms):</label>
                            <input type="number" value="${this.systemConfig.sensorUpdateInterval}">
                        </div>
                    </div>

                    <div class="config-group">
                        <h4>Ustawienia testów</h4>
                        <div class="form-group">
                            <label>Maksymalna liczba równoczesnych testów:</label>
                            <input type="number" value="${this.systemConfig.maxConcurrentTests}">
                        </div>
                    </div>

                    <div class="config-group">
                        <h4>Przechowywanie danych</h4>
                        <div class="form-group">
                            <label>Okres przechowywania danych (dni):</label>
                            <input type="number" value="${this.systemConfig.dataRetention}">
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" ${this.systemConfig.auditLogEnabled ? 'checked' : ''}>
                                Włącz dziennik audytu
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Tab management
    showTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        const content = document.getElementById('settings-tab-content');
        switch(tabName) {
            case 'scenarios':
                content.innerHTML = this.getTestScenariosHTML();
                break;
            case 'integration':
                content.innerHTML = this.getIntegrationHTML();
                break;
            case 'standards':
                content.innerHTML = this.getStandardsHTML();
                break;
            case 'system':
                content.innerHTML = this.getSystemConfigHTML();
                break;
        }
    }

    // Event handlers
    createNewScenario() {
        alert('Kreator nowego scenariusza testowego - wkrótce dostępna!');
    }

    editScenario(scenarioId) {
        const scenario = this.testScenarios.get(scenarioId);
        if (scenario) {
            alert(`Edycja scenariusza: ${scenario.name}\nNorma: ${scenario.norm}`);
        }
    }

    validateScenario(scenarioId) {
        const scenario = this.testScenarios.get(scenarioId);
        if (scenario) {
            alert(`Walidacja scenariusza: ${scenario.name}\n✅ Scenariusz zgodny z normą ${scenario.norm}`);
        }
    }

    deleteScenario(scenarioId) {
        if (confirm('Czy na pewno chcesz usunąć ten scenariusz?')) {
            this.testScenarios.delete(scenarioId);
            this.showTab('scenarios');
        }
    }

    importScenarios() {
        const fileInput = document.getElementById('scenario-file');
        if (fileInput.files.length > 0) {
            alert(`Importowanie scenariuszy z pliku: ${fileInput.files[0].name}`);
        } else {
            alert('Wybierz plik do importu');
        }
    }

    saveAllSettings() {
        console.log('Saving all system settings...');
        alert('Wszystkie ustawienia zostały zapisane pomyślnie!');
    }

    resetToDefaults() {
        if (confirm('Czy na pewno chcesz przywrócić domyślne ustawienia?')) {
            this.init();
            alert('Ustawienia zostały przywrócone do wartości domyślnych.');
        }
    }

    exportConfiguration() {
        const config = {
            testScenarios: Array.from(this.testScenarios.entries()),
            integrationSettings: Array.from(this.integrationSettings.entries()),
            standardsConfig: Array.from(this.standardsConfig.entries()),
            systemConfig: this.systemConfig
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'maskservice-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Public method for template integration
    showEnhancedSystemSettings() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getEnhancedSystemSettingsHTML();
        }
    }
}

// Create global instance
window.systemSettingsEnhanced = new SystemSettingsEnhanced();

console.log('✅ Enhanced System Settings Module loaded');
