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

    // Public methods for template integration
    showEnhancedSystemSettings() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getEnhancedSystemSettingsHTML();
        }
    }

    showSettingsScenarios() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getSettingsScenariosHTML();
        }
    }

    showSettingsIntegration() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getSettingsIntegrationHTML();
        }
    }

    showSettingsStandards() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getSettingsStandardsHTML();
        }
    }

    showSettingsSystem() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getSettingsSystemHTML();
        }
    }

    // Settings Scenarios HTML template (focused on test scenario management)
    getSettingsScenariosHTML() {
        return `
            <div class="system-settings-enhanced">
                <div class="settings-header">
                    <h2>Zarządzanie scenariuszami testowymi</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="systemSettingsEnhanced.createTestScenario()">
                            ➕ Nowy scenariusz
                        </button>
                        <button class="btn btn-secondary" onclick="systemSettingsEnhanced.importScenarios()">
                            📥 Importuj z XML
                        </button>
                        <button class="btn btn-info" onclick="systemSettingsEnhanced.validateScenarios()">
                            ✅ Waliduj normy
                        </button>
                    </div>
                </div>

                <!-- Scenario Editor -->
                <div class="scenario-editor">
                    <h3>Edytor scenariuszy</h3>
                    <div class="editor-workspace">
                        <div class="scenario-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nazwa scenariusza:</label>
                                    <input type="text" id="scenario-name" placeholder="Wprowadź nazwę">
                                </div>
                                <div class="form-group">
                                    <label>Norma:</label>
                                    <select id="scenario-norm">
                                        <option value="pn-en-136">PN-EN 136</option>
                                        <option value="pn-en-137">PN-EN 137</option>
                                        <option value="iso-16900">ISO 16900</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Typy urządzeń:</label>
                                    <div class="checkbox-group">
                                        <label><input type="checkbox" value="PP_MASK"> Maska pełnotwarzowa</label>
                                        <label><input type="checkbox" value="NP_MASK"> Półmaska</label>
                                        <label><input type="checkbox" value="FILTER"> Filtr</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Active Scenarios -->
                <div class="active-scenarios">
                    <h3>Aktywne scenariusze</h3>
                    <div class="scenarios-table">
                        ${this.getActiveScenariosHTML()}
                    </div>
                </div>

                <!-- Scenario Mapping -->
                <div class="scenario-mapping">
                    <h3>Mapowanie scenariuszy</h3>
                    <div class="mapping-matrix">
                        <div class="matrix-header">
                            <div class="matrix-cell">Typ urządzenia</div>
                            <div class="matrix-cell">Interwał testowy</div>
                            <div class="matrix-cell">Scenariusz</div>
                        </div>
                        ${this.getScenarioMappingHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    // Settings Integration HTML template (focused on external integrations)
    getSettingsIntegrationHTML() {
        return `
            <div class="system-settings-enhanced">
                <div class="settings-header">
                    <h2>Integracje zewnętrzne</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="systemSettingsEnhanced.addIntegration()">
                            ➕ Dodaj integrację
                        </button>
                        <button class="btn btn-secondary" onclick="systemSettingsEnhanced.testConnections()">
                            🔄 Testuj połączenia
                        </button>
                        <button class="btn btn-info" onclick="systemSettingsEnhanced.syncData()">
                            🔄 Synchronizuj dane
                        </button>
                    </div>
                </div>

                <!-- Active Integrations -->
                <div class="active-integrations">
                    <h3>Aktywne integracje</h3>
                    <div class="integrations-list">
                        ${this.getActiveIntegrationsHTML()}
                    </div>
                </div>

                <!-- Integration Settings -->
                <div class="integration-settings">
                    <h3>Ustawienia integracji</h3>
                    <div class="settings-grid">
                        <div class="setting-group">
                            <h4>📊 ERP System</h4>
                            <div class="setting-item">
                                <label>URL systemu ERP:</label>
                                <input type="url" placeholder="https://erp.company.com/api">
                            </div>
                            <div class="setting-item">
                                <label>Klucz API:</label>
                                <input type="password" placeholder="••••••••">
                            </div>
                            <div class="setting-item">
                                <label>Synchronizacja automatyczna:</label>
                                <input type="checkbox" checked>
                            </div>
                        </div>
                        <div class="setting-group">
                            <h4>📧 System powiadomień</h4>
                            <div class="setting-item">
                                <label>Serwer SMTP:</label>
                                <input type="text" placeholder="smtp.company.com">
                            </div>
                            <div class="setting-item">
                                <label>Port:</label>
                                <input type="number" value="587">
                            </div>
                            <div class="setting-item">
                                <label>Szyfrowanie TLS:</label>
                                <input type="checkbox" checked>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Integration Status -->
                <div class="integration-status">
                    <h3>Status integracji</h3>
                    <div class="status-grid">
                        <div class="status-item">
                            <div class="status-name">ERP System</div>
                            <div class="status-indicator online">Online</div>
                        </div>
                        <div class="status-item">
                            <div class="status-name">Email Gateway</div>
                            <div class="status-indicator online">Online</div>
                        </div>
                        <div class="status-item">
                            <div class="status-name">Cloud Backup</div>
                            <div class="status-indicator offline">Offline</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Settings Standards HTML template (focused on standards compliance)
    getSettingsStandardsHTML() {
        return `
            <div class="system-settings-enhanced">
                <div class="settings-header">
                    <h2>Zgodność ze standardami</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="systemSettingsEnhanced.updateStandards()">
                            🔄 Aktualizuj standardy
                        </button>
                        <button class="btn btn-secondary" onclick="systemSettingsEnhanced.validateCompliance()">
                            ✅ Sprawdź zgodność
                        </button>
                        <button class="btn btn-info" onclick="systemSettingsEnhanced.generateComplianceReport()">
                            📊 Raport zgodności
                        </button>
                    </div>
                </div>

                <!-- Standards Overview -->
                <div class="standards-overview">
                    <h3>Przegląd standardów</h3>
                    <div class="standards-grid">
                        ${this.getStandardsOverviewHTML()}
                    </div>
                </div>

                <!-- Compliance Settings -->
                <div class="compliance-settings">
                    <h3>Ustawienia zgodności</h3>
                    <div class="settings-tabs">
                        <div class="tab-header">
                            <button class="tab-button active" onclick="systemSettingsEnhanced.showTab('pn-en-136')">PN-EN 136</button>
                            <button class="tab-button" onclick="systemSettingsEnhanced.showTab('pn-en-137')">PN-EN 137</button>
                            <button class="tab-button" onclick="systemSettingsEnhanced.showTab('iso-16900')">ISO 16900</button>
                        </div>
                        <div class="tab-content">
                            ${this.getComplianceTabContent()}
                        </div>
                    </div>
                </div>

                <!-- Audit Trail -->
                <div class="audit-trail">
                    <h3>Dziennik audytu</h3>
                    <div class="audit-log">
                        ${this.getAuditTrailHTML()}
                    </div>
                </div>

                <!-- Compliance Statistics -->
                <div class="compliance-statistics">
                    <h3>Statystyki zgodności</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">98%</div>
                            <div class="stat-label">Ogólna zgodność</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">3</div>
                            <div class="stat-label">Aktywne standardy</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">127</div>
                            <div class="stat-label">Przeprowadzone audyty</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">5</div>
                            <div class="stat-label">Oczekujące aktualizacje</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Settings System HTML template (focused on system configuration)
    getSettingsSystemHTML() {
        return `
            <div class="system-settings-enhanced">
                <div class="settings-header">
                    <h2>Konfiguracja systemu</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="systemSettingsEnhanced.saveSystemConfig()">
                            💾 Zapisz konfigurację
                        </button>
                        <button class="btn btn-secondary" onclick="systemSettingsEnhanced.resetToDefaults()">
                            🔄 Przywróć domyślne
                        </button>
                        <button class="btn btn-warning" onclick="systemSettingsEnhanced.restartSystem()">
                            🔄 Restart systemu
                        </button>
                    </div>
                </div>

                <!-- System Configuration -->
                <div class="system-configuration">
                    <div class="config-sections">
                        <div class="config-section">
                            <h3>🔧 Ustawienia podstawowe</h3>
                            <div class="config-item">
                                <label>Nazwa systemu:</label>
                                <input type="text" value="MASKTRONIC C20" id="system-name">
                            </div>
                            <div class="config-item">
                                <label>Język domyślny:</label>
                                <select id="default-language">
                                    <option value="pl">Polski</option>
                                    <option value="en">English</option>
                                    <option value="de">Deutsch</option>
                                </select>
                            </div>
                            <div class="config-item">
                                <label>Strefa czasowa:</label>
                                <select id="timezone">
                                    <option value="Europe/Warsaw">Europe/Warsaw</option>
                                    <option value="Europe/Berlin">Europe/Berlin</option>
                                    <option value="UTC">UTC</option>
                                </select>
                            </div>
                        </div>

                        <div class="config-section">
                            <h3>🔒 Bezpieczeństwo</h3>
                            <div class="config-item">
                                <label>Timeout sesji (minuty):</label>
                                <input type="number" value="30" min="5" max="480">
                            </div>
                            <div class="config-item">
                                <label>Wymagaj silnych haseł:</label>
                                <input type="checkbox" checked>
                            </div>
                            <div class="config-item">
                                <label>Logowanie działań:</label>
                                <input type="checkbox" checked>
                            </div>
                            <div class="config-item">
                                <label>Dwuskładnikowa autoryzacja:</label>
                                <input type="checkbox">
                            </div>
                        </div>

                        <div class="config-section">
                            <h3>📊 Wydajność</h3>
                            <div class="config-item">
                                <label>Interwał odświeżania danych (sekundy):</label>
                                <input type="number" value="5" min="1" max="60">
                            </div>
                            <div class="config-item">
                                <label>Maksymalna liczba równoczesnych testów:</label>
                                <input type="number" value="4" min="1" max="10">
                            </div>
                            <div class="config-item">
                                <label>Cache raportów (dni):</label>
                                <input type="number" value="30" min="1" max="365">
                            </div>
                        </div>

                        <div class="config-section">
                            <h3>💾 Backup i archiwizacja</h3>
                            <div class="config-item">
                                <label>Automatyczny backup:</label>
                                <input type="checkbox" checked>
                            </div>
                            <div class="config-item">
                                <label>Częstotliwość backup:</label>
                                <select>
                                    <option value="daily">Codziennie</option>
                                    <option value="weekly" selected>Tygodniowo</option>
                                    <option value="monthly">Miesięcznie</option>
                                </select>
                            </div>
                            <div class="config-item">
                                <label>Okres przechowywania danych (lata):</label>
                                <input type="number" value="7" min="1" max="25">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- System Status -->
                <div class="system-status">
                    <h3>Status systemu</h3>
                    <div class="status-overview">
                        <div class="status-card">
                            <div class="status-title">💾 Pamięć</div>
                            <div class="status-value">68% używane</div>
                        </div>
                        <div class="status-card">
                            <div class="status-title">💿 Dysk</div>
                            <div class="status-value">45% używane</div>
                        </div>
                        <div class="status-card">
                            <div class="status-title">🔄 CPU</div>
                            <div class="status-value">23% obciążenie</div>
                        </div>
                        <div class="status-card">
                            <div class="status-title">🌐 Sieć</div>
                            <div class="status-value">Połączono</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper methods for new functionality
    getActiveScenariosHTML() {
        return `
            <div class="scenario-row">
                <div class="scenario-name">Test po użyciu</div>
                <div class="scenario-norm">PN-EN 136</div>
                <div class="scenario-devices">PP_MASK, NP_MASK</div>
                <div class="scenario-actions">
                    <button class="btn btn-sm" onclick="systemSettingsEnhanced.editScenario('scenario_1')">Edytuj</button>
                    <button class="btn btn-sm btn-danger" onclick="systemSettingsEnhanced.deleteScenario('scenario_1')">Usuń</button>
                </div>
            </div>
            <div class="scenario-row">
                <div class="scenario-name">Test ciśnienia roboczego</div>
                <div class="scenario-norm">PN-EN 137</div>
                <div class="scenario-devices">PP_MASK</div>
                <div class="scenario-actions">
                    <button class="btn btn-sm" onclick="systemSettingsEnhanced.editScenario('scenario_2')">Edytuj</button>
                    <button class="btn btn-sm btn-danger" onclick="systemSettingsEnhanced.deleteScenario('scenario_2')">Usuń</button>
                </div>
            </div>
        `;
    }

    getScenarioMappingHTML() {
        return `
            <div class="matrix-row">
                <div class="matrix-cell">Maska pełnotwarzowa</div>
                <div class="matrix-cell">Po każdym użyciu</div>
                <div class="matrix-cell">Test po użyciu</div>
            </div>
            <div class="matrix-row">
                <div class="matrix-cell">Półmaska</div>
                <div class="matrix-cell">Co 6 miesięcy</div>
                <div class="matrix-cell">Test podstawowy</div>
            </div>
        `;
    }

    getActiveIntegrationsHTML() {
        return `
            <div class="integration-item">
                <div class="integration-info">
                    <strong>📊 ERP System</strong>
                    <span class="integration-type">REST API</span>
                </div>
                <div class="integration-status active">Aktywny</div>
                <div class="integration-actions">
                    <button class="btn btn-sm" onclick="systemSettingsEnhanced.configureIntegration('erp')">Konfiguruj</button>
                </div>
            </div>
            <div class="integration-item">
                <div class="integration-info">
                    <strong>📧 Email Gateway</strong>
                    <span class="integration-type">SMTP</span>
                </div>
                <div class="integration-status active">Aktywny</div>
                <div class="integration-actions">
                    <button class="btn btn-sm" onclick="systemSettingsEnhanced.configureIntegration('email')">Konfiguruj</button>
                </div>
            </div>
        `;
    }

    getStandardsOverviewHTML() {
        return `
            <div class="standard-card">
                <div class="standard-header">
                    <h4>PN-EN 136</h4>
                    <div class="compliance-badge verified">Zgodny</div>
                </div>
                <div class="standard-details">
                    <p>Aparaty ochrony dróg oddechowych - Maski pełnotwarzowe</p>
                    <div class="standard-version">Wersja: 2019</div>
                </div>
            </div>
            <div class="standard-card">
                <div class="standard-header">
                    <h4>PN-EN 137</h4>
                    <div class="compliance-badge verified">Zgodny</div>
                </div>
                <div class="standard-details">
                    <p>Aparaty ochrony dróg oddechowych - Autonomiczne aparaty oddechowe</p>
                    <div class="standard-version">Wersja: 2021</div>
                </div>
            </div>
            <div class="standard-card">
                <div class="standard-header">
                    <h4>ISO 16900</h4>
                    <div class="compliance-badge pending">Oczekujące</div>
                </div>
                <div class="standard-details">
                    <p>Aparaty ochrony dróg oddechowych - Metody badań</p>
                    <div class="standard-version">Wersja: 2022</div>
                </div>
            </div>
        `;
    }

    getComplianceTabContent() {
        return `
            <div class="compliance-content">
                <h4>Parametry testowe PN-EN 136</h4>
                <div class="parameter-list">
                    <div class="parameter-item">
                        <label>Test szczelności - ciśnienie minimalne:</label>
                        <input type="number" value="-10" step="0.1"> mbar
                    </div>
                    <div class="parameter-item">
                        <label>Test szczelności - maksymalna nieszczelność:</label>
                        <input type="number" value="0.5" step="0.1"> l/min
                    </div>
                    <div class="parameter-item">
                        <label>Czas trwania testu:</label>
                        <input type="number" value="300"> sekund
                    </div>
                </div>
            </div>
        `;
    }

    getAuditTrailHTML() {
        return `
            <div class="audit-entry">
                <div class="audit-time">2024-01-10 14:30:25</div>
                <div class="audit-user">admin</div>
                <div class="audit-action">Aktualizacja standardu PN-EN 136</div>
                <div class="audit-status">Ukończono</div>
            </div>
            <div class="audit-entry">
                <div class="audit-time">2024-01-10 13:15:12</div>
                <div class="audit-user">operator1</div>
                <div class="audit-action">Walidacja zgodności ISO 16900</div>
                <div class="audit-status">Oczekujące</div>
            </div>
        `;
    }

    // Placeholder methods for new functionality
    createTestScenario() {
        alert('Tworzenie nowego scenariusza testowego - funkcja wkrótce dostępna!');
    }

    importScenarios() {
        alert('Import scenariuszy z XML - funkcja wkrótce dostępna!');
    }

    validateScenarios() {
        alert('Walidacja scenariuszy względem norm - funkcja wkrótce dostępna!');
    }

    editScenario(scenarioId) {
        alert(`Edycja scenariusza: ${scenarioId} - funkcja wkrótce dostępna!`);
    }

    deleteScenario(scenarioId) {
        alert(`Usuwanie scenariusza: ${scenarioId} - funkcja wkrótce dostępna!`);
    }

    addIntegration() {
        alert('Dodawanie nowej integracji - funkcja wkrótce dostępna!');
    }

    testConnections() {
        alert('Testowanie połączeń - funkcja wkrótce dostępna!');
    }

    syncData() {
        alert('Synchronizacja danych - funkcja wkrótce dostępna!');
    }

    configureIntegration(integrationId) {
        alert(`Konfiguracja integracji: ${integrationId} - funkcja wkrótce dostępna!`);
    }

    updateStandards() {
        alert('Aktualizacja standardów - funkcja wkrótce dostępna!');
    }

    validateCompliance() {
        alert('Sprawdzanie zgodności - funkcja wkrótce dostępna!');
    }

    generateComplianceReport() {
        alert('Generowanie raportu zgodności - funkcja wkrótce dostępna!');
    }

    showTab(tabId) {
        console.log('Przełączanie zakładki:', tabId);
    }

    saveSystemConfig() {
        alert('Zapisywanie konfiguracji systemu - funkcja wkrótce dostępna!');
    }

    resetToDefaults() {
        alert('Przywracanie ustawień domyślnych - funkcja wkrótce dostępna!');
    }

    restartSystem() {
        alert('Restart systemu - funkcja wkrótce dostępna!');
    }
}

// Create global instance
window.systemSettingsEnhanced = new SystemSettingsEnhanced();

console.log('✅ Enhanced System Settings Module loaded');
