/**
 * MASKSERVICE C20 - Settings UI Generator Module
 * Generates HTML UI components for system settings
 * Extracted from system-settings-enhanced.js for modularity
 */

(function(global) {
    'use strict';
    
    class SettingsUIGenerator {
        constructor() {
            this.tabTemplates = new Map();
            this.init();
        }

        init() {
            this.setupTabTemplates();
            console.log('✅ SettingsUIGenerator initialized');
        }

        setupTabTemplates() {
            // Store tab templates for different settings sections
            this.tabTemplates.set('scenarios', this.getTestScenariosHTML.bind(this));
            this.tabTemplates.set('integration', this.getIntegrationsHTML.bind(this));
            this.tabTemplates.set('standards', this.getStandardsHTML.bind(this));
            this.tabTemplates.set('system', this.getSystemConfigHTML.bind(this));
        }

        /**
         * Generate main settings interface HTML
         */
        getEnhancedSystemSettingsHTML() {
            return `
                <div class="system-settings-enhanced">
                    <div class="settings-header">
                        <h2 data-i18n="settings.enhanced_title">Ustawienia systemowe - Rozszerzone</h2>
                        <div class="settings-tabs">
                            <button class="tab-btn active" onclick="systemSettingsEnhanced.showTab('scenarios')" data-i18n="settings.tab_scenarios">
                                🧪 Scenariusze testowe
                            </button>
                            <button class="tab-btn" onclick="systemSettingsEnhanced.showTab('integration')" data-i18n="settings.tab_integrations">
                                🔗 Integracje
                            </button>
                            <button class="tab-btn" onclick="systemSettingsEnhanced.showTab('standards')" data-i18n="settings.tab_standards">
                                📋 Normy i standardy
                            </button>
                            <button class="tab-btn" onclick="systemSettingsEnhanced.showTab('system')" data-i18n="settings.tab_system">
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
                        <button class="btn btn-success" onclick="systemSettingsEnhanced.saveAllSettings()" data-i18n="settings.save_all">
                            💾 Zapisz wszystkie ustawienia
                        </button>
                        <button class="btn btn-warning" onclick="systemSettingsEnhanced.resetToDefaults()" data-i18n="settings.reset_defaults">
                            🔄 Przywróć domyślne
                        </button>
                        <button class="btn btn-info" onclick="systemSettingsEnhanced.exportConfiguration()" data-i18n="settings.export_config">
                            📤 Eksportuj konfigurację
                        </button>
                    </div>
                </div>
            `;
        }

        /**
         * Generate test scenarios management HTML
         */
        getTestScenariosHTML(scenarios = []) {
            return `
                <div class="test-scenarios-config">
                    <div class="scenarios-header">
                        <h3 data-i18n="settings.scenarios_management">Zarządzanie scenariuszami testowymi</h3>
                        <button class="btn btn-primary" onclick="systemSettingsEnhanced.createNewScenario()" data-i18n="settings.new_scenario">
                            ➕ Nowy scenariusz
                        </button>
                    </div>

                    <div class="scenarios-list">
                        ${scenarios.map(scenario => this.generateScenarioCard(scenario)).join('')}
                    </div>

                    <div class="scenario-import">
                        <h4 data-i18n="settings.import_scenarios">Import scenariuszy</h4>
                        <input type="file" id="scenario-file" accept=".xml,.json">
                        <button class="btn btn-secondary" onclick="systemSettingsEnhanced.importScenarios()" data-i18n="settings.import_file">
                            📥 Importuj z pliku
                        </button>
                    </div>
                </div>
            `;
        }

        /**
         * Generate individual scenario card HTML
         */
        generateScenarioCard(scenario) {
            return `
                <div class="scenario-card">
                    <div class="scenario-header">
                        <h4>${scenario.name}</h4>
                        <span class="norm-badge">${scenario.norm}</span>
                    </div>
                    <div class="scenario-details">
                        <p><strong data-i18n="settings.device_types">Typy urządzeń:</strong> ${scenario.deviceTypes ? scenario.deviceTypes.join(', ') : 'N/A'}</p>
                        <p><strong data-i18n="settings.parameters">Parametry:</strong></p>
                        <ul>
                            ${this.generateParametersList(scenario.parameters || {})}
                        </ul>
                    </div>
                    <div class="scenario-actions">
                        <button class="btn-small btn-secondary" onclick="systemSettingsEnhanced.editScenario('${scenario.id}')" data-i18n="settings.edit">
                            ✏️ Edytuj
                        </button>
                        <button class="btn-small btn-info" onclick="systemSettingsEnhanced.validateScenario('${scenario.id}')" data-i18n="settings.validate">
                            ✅ Waliduj
                        </button>
                        <button class="btn-small btn-danger" onclick="systemSettingsEnhanced.deleteScenario('${scenario.id}')" data-i18n="settings.delete">
                            🗑️ Usuń
                        </button>
                    </div>
                </div>
            `;
        }

        /**
         * Generate parameters list HTML
         */
        generateParametersList(parameters) {
            return Object.entries(parameters)
                .map(([key, value]) => `<li>${key}: ${JSON.stringify(value)}</li>`)
                .join('');
        }

        /**
         * Generate integrations configuration HTML
         */
        getIntegrationsHTML() {
            return `
                <div class="integrations-config">
                    <div class="integration-header">
                        <h3 data-i18n="settings.external_integrations">Integracje zewnętrzne</h3>
                    </div>
                    
                    <div class="integration-sections">
                        <div class="integration-card">
                            <h4 data-i18n="settings.database_connection">🗄️ Połączenie z bazą danych</h4>
                            <div class="form-group">
                                <label data-i18n="settings.db_host">Host:</label>
                                <input type="text" id="db-host" placeholder="localhost">
                            </div>
                            <div class="form-group">
                                <label data-i18n="settings.db_port">Port:</label>
                                <input type="number" id="db-port" placeholder="5432">
                            </div>
                            <div class="form-group">
                                <label data-i18n="settings.db_name">Nazwa bazy:</label>
                                <input type="text" id="db-name" placeholder="maskservice_db">
                            </div>
                            <button class="btn btn-primary" onclick="systemSettingsEnhanced.testDatabaseConnection()" data-i18n="settings.test_connection">
                                🔗 Testuj połączenie
                            </button>
                        </div>
                        
                        <div class="integration-card">
                            <h4 data-i18n="settings.api_integrations">🌐 Integracje API</h4>
                            <div class="form-group">
                                <label data-i18n="settings.external_api_url">URL zewnętrznego API:</label>
                                <input type="url" id="external-api-url" placeholder="https://api.example.com">
                            </div>
                            <div class="form-group">
                                <label data-i18n="settings.api_key">Klucz API:</label>
                                <input type="password" id="api-key" placeholder="••••••••">
                            </div>
                            <button class="btn btn-primary" onclick="systemSettingsEnhanced.validateAPIConnection()" data-i18n="settings.validate_api">
                                ✅ Waliduj API
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Generate standards compliance HTML
         */
        getStandardsHTML() {
            return `
                <div class="standards-config">
                    <div class="standards-header">
                        <h3 data-i18n="settings.standards_compliance">📋 Zgodność z normami</h3>
                    </div>
                    
                    <div class="standards-content">
                        <div class="norm-section">
                            <h4 data-i18n="settings.pn_en_136">PN-EN 136 - Respiratory protective devices</h4>
                            <div class="norm-controls">
                                <label>
                                    <input type="checkbox" id="pn-en-136-enabled" checked>
                                    <span data-i18n="settings.enable_validation">Włącz walidację</span>
                                </label>
                                <button class="btn btn-secondary" onclick="systemSettingsEnhanced.downloadNormDocument('PN-EN-136')" data-i18n="settings.download_norm">
                                    📋 Pobierz dokument normy
                                </button>
                            </div>
                        </div>
                        
                        <div class="norm-section">
                            <h4 data-i18n="settings.pn_en_137">PN-EN 137 - Self-contained open-circuit breathing apparatus</h4>
                            <div class="norm-controls">
                                <label>
                                    <input type="checkbox" id="pn-en-137-enabled" checked>
                                    <span data-i18n="settings.enable_validation">Włącz walidację</span>
                                </label>
                                <button class="btn btn-secondary" onclick="systemSettingsEnhanced.downloadNormDocument('PN-EN-137')" data-i18n="settings.download_norm">
                                    📋 Pobierz dokument normy
                                </button>
                            </div>
                        </div>
                        
                        <div class="custom-standards">
                            <h4 data-i18n="settings.custom_standards">Niestandardowe wymogi</h4>
                            <textarea id="custom-standards-text" rows="6" placeholder="Wprowadź dodatkowe wymogi standardów..."></textarea>
                            <button class="btn btn-primary" onclick="systemSettingsEnhanced.saveCustomStandards()" data-i18n="settings.save_standards">
                                💾 Zapisz standardy
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Generate system configuration HTML
         */
        getSystemConfigHTML() {
            return `
                <div class="system-config">
                    <div class="config-header">
                        <h3 data-i18n="settings.system_configuration">⚙️ Konfiguracja systemu</h3>
                    </div>
                    
                    <div class="config-sections">
                        <div class="config-card">
                            <h4 data-i18n="settings.device_settings">Ustawienia urządzenia</h4>
                            <div class="form-group">
                                <label data-i18n="settings.device_timeout">Timeout urządzenia (ms):</label>
                                <input type="number" id="device-timeout" value="30000">
                            </div>
                            <div class="form-group">
                                <label data-i18n="settings.sensor_update_interval">Częstotliwość odczytu czujników (ms):</label>
                                <input type="number" id="sensor-interval" value="1000">
                            </div>
                            <div class="form-group">
                                <label data-i18n="settings.max_concurrent_tests">Max. równoczesnych testów:</label>
                                <input type="number" id="max-tests" value="3" min="1" max="10">
                            </div>
                        </div>
                        
                        <div class="config-card">
                            <h4 data-i18n="settings.data_management">Zarządzanie danymi</h4>
                            <div class="form-group">
                                <label data-i18n="settings.data_retention">Okres przechowywania danych (dni):</label>
                                <input type="number" id="data-retention" value="1825">
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="audit-log-enabled" checked>
                                    <span data-i18n="settings.enable_audit_log">Włącz dziennik audytu</span>
                                </label>
                            </div>
                            <button class="btn btn-warning" onclick="systemSettingsEnhanced.clearOldData()" data-i18n="settings.clear_old_data">
                                🗑️ Usuń stare dane
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Get tab content based on tab name
         */
        getTabContent(tabName, data = null) {
            const template = this.tabTemplates.get(tabName);
            return template ? template(data) : '<div>Tab not found</div>';
        }

        /**
         * Generate loading spinner
         */
        getLoadingHTML() {
            return `
                <div class="settings-loading">
                    <div class="loading-spinner"></div>
                    <p data-i18n="loading.message">Ładowanie ustawień...</p>
                </div>
            `;
        }

        /**
         * Generate error message HTML
         */
        getErrorHTML(message) {
            return `
                <div class="settings-error">
                    <h3 data-i18n="error.title">Błąd</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="systemSettingsEnhanced.reload()" data-i18n="error.retry">
                        🔄 Spróbuj ponownie
                    </button>
                </div>
            `;
        }
    }

    // Export the module to global namespace
    global.SettingsUIGenerator = SettingsUIGenerator;
    
    // Initialize global instance if needed
    if (!global.settingsUIGenerator) {
        global.settingsUIGenerator = new SettingsUIGenerator();
    }
    
})(window || global || this);
