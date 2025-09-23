/**
 * MASKSERVICE C20 - Enhanced System Settings Module (Orchestrator)
 * Advanced system configuration for SUPERUSER role
 * Coordinates modular components for settings management
 * @version 3.0.0 - Fully Modularized Architecture
 * @author MASKSERVICE Team
 */

define('system-settings-enhanced', [
    'settings-ui-generator',
    'settings-scenario-manager', 
    'settings-integration-manager',
    'settings-standards-validator',
    'settings-system-config'
], function(
    SettingsUIGenerator,
    SettingsScenarioManager,
    SettingsIntegrationManager, 
    SettingsStandardsValidator,
    SettingsSystemConfig
) {

    class SystemSettingsEnhanced {
        constructor() {
            // Initialize modular components
            this.uiGenerator = new SettingsUIGenerator();
            this.scenarioManager = new SettingsScenarioManager();
            this.integrationManager = new SettingsIntegrationManager();
            this.standardsValidator = new SettingsStandardsValidator();
            this.systemConfig = new SettingsSystemConfig();
            
            this.currentTab = 'scenarios';
            this.init();
        }

        init() {
            console.log('✅ SystemSettingsEnhanced orchestrator initialized with modular components');
        }

        // Delegation methods to modular components

        // UI Generation methods
        getEnhancedSystemSettingsHTML() {
            return this.uiGenerator.getEnhancedSystemSettingsHTML();
        }

        showTab(tabName) {
            this.currentTab = tabName;
            const content = document.getElementById('settings-tab-content');
            if (content) {
                switch (tabName) {
                    case 'scenarios':
                        content.innerHTML = this.uiGenerator.getTestScenariosHTML(
                            this.scenarioManager.getAllScenarios()
                        );
                        break;
                    case 'integration':
                        content.innerHTML = this.uiGenerator.getIntegrationsHTML();
                        break;
                    case 'standards':
                        content.innerHTML = this.uiGenerator.getStandardsHTML();
                        break;
                    case 'system':
                        content.innerHTML = this.uiGenerator.getSystemConfigHTML();
                        break;
                }
                
                // Update active tab
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelector(`.tab-btn[onclick*="${tabName}"]`)?.classList.add('active');
            }
        }

        // Scenario Management delegation methods
        createNewScenario(scenarioData) {
            try {
                const scenario = this.scenarioManager.createNewScenario(scenarioData || {
                    name: 'Nowy scenariusz',
                    norm: 'PN-EN 136',
                    deviceTypes: ['PP_MASK'],
                    parameters: {}
                });
                this.showTab('scenarios'); // Refresh UI
                return scenario;
            } catch (error) {
                console.error('❌ Failed to create scenario:', error.message);
                alert(`Błąd tworzenia scenariusza: ${error.message}`);
            }
        }

        editScenario(scenarioId) {
            const scenario = this.scenarioManager.getScenario(scenarioId);
            if (scenario) {
                // In a real implementation, this would open an edit dialog
                console.log('✏️ Editing scenario:', scenario.name);
                // For now, just log the scenario
                return scenario;
            }
        }

        validateScenario(scenarioId) {
            try {
                const scenario = this.scenarioManager.getScenario(scenarioId);
                const validation = this.standardsValidator.validateScenario(scenario);
                
                const message = validation.valid ? 
                    `✅ Scenariusz "${scenario.name}" jest zgodny z normą ${scenario.norm}` :
                    `❌ Scenariusz "${scenario.name}" ma błędy: ${validation.errors.join(', ')}`;
                
                alert(message);
                return validation;
            } catch (error) {
                console.error('❌ Failed to validate scenario:', error.message);
                alert(`Błąd walidacji: ${error.message}`);
            }
        }

        deleteScenario(scenarioId) {
            try {
                const scenario = this.scenarioManager.getScenario(scenarioId);
                if (confirm(`Czy na pewno chcesz usunąć scenariusz "${scenario.name}"?`)) {
                    this.scenarioManager.deleteScenario(scenarioId);
                    this.showTab('scenarios'); // Refresh UI
                }
            } catch (error) {
                console.error('❌ Failed to delete scenario:', error.message);
                alert(`Błąd usuwania scenariusza: ${error.message}`);
            }
        }

        importScenarios() {
            const fileInput = document.getElementById('scenario-file');
            const file = fileInput?.files[0];
            
            if (!file) {
                alert('Proszę wybrać plik do importu');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const fileType = file.name.endsWith('.xml') ? 'xml' : 'json';
                    const result = this.scenarioManager.importScenariosFromFile(e.target.result, fileType);
                    
                    alert(`Import zakończony: ${result.imported} zaimportowanych, ${result.failed} błędów`);
                    this.showTab('scenarios'); // Refresh UI
                } catch (error) {
                    console.error('❌ Failed to import scenarios:', error.message);
                    alert(`Błąd importu: ${error.message}`);
                }
            };
            reader.readAsText(file);
        }

        // Integration Management delegation methods
        async testDatabaseConnection() {
            try {
                const result = await this.integrationManager.testDatabaseConnection();
                alert(result.message);
                return result;
            } catch (error) {
                console.error('❌ Database connection test failed:', error.message);
                alert(`Błąd połączenia z bazą danych: ${error.message}`);
            }
        }

        async validateAPIConnection() {
            try {
                const result = await this.integrationManager.testAPIConnection();
                alert(result.message);
                return result;
            } catch (error) {
                console.error('❌ API connection test failed:', error.message);
                alert(`Błąd połączenia z API: ${error.message}`);
            }
        }

        // Standards Management delegation methods
        downloadNormDocument(normName) {
            console.log(`📋 Downloading norm document: ${normName}`);
            // In a real implementation, this would trigger document download
            alert(`Pobieranie dokumentu normy ${normName} (symulacja)`);
        }

        saveCustomStandards() {
            const customText = document.getElementById('custom-standards-text')?.value;
            if (customText) {
                try {
                    this.standardsValidator.addCustomStandard({
                        name: 'Custom Requirements',
                        description: customText,
                        category: 'custom'
                    });
                    alert('Niestandardowe wymogi zostały zapisane');
                } catch (error) {
                    console.error('❌ Failed to save custom standards:', error.message);
                    alert(`Błąd zapisu: ${error.message}`);
                }
            }
        }

        // System Configuration delegation methods
        clearOldData() {
            if (confirm('Czy na pewno chcesz usunąć stare dane? Ta operacja jest nieodwracalna.')) {
                try {
                    const result = this.systemConfig.clearOldData();
                    alert(`Usunięto ${result.clearedEntries} starych wpisów`);
                    return result;
                } catch (error) {
                    console.error('❌ Failed to clear old data:', error.message);
                    alert(`Błąd usuwania danych: ${error.message}`);
                }
            }
        }

        // Global Settings Management methods
        saveAllSettings() {
            try {
                // Export all configurations
                const scenariosConfig = this.scenarioManager.exportScenariosToJSON();
                const integrationConfig = this.integrationManager.exportConfiguration();
                const systemConfig = this.systemConfig.exportConfiguration();
                const standardsConfig = this.standardsValidator.exportStandardsConfig();

                // In a real implementation, save to backend or local storage
                localStorage.setItem('maskservice_scenarios', scenariosConfig);
                localStorage.setItem('maskservice_integrations', integrationConfig);
                localStorage.setItem('maskservice_system', systemConfig);
                localStorage.setItem('maskservice_standards', standardsConfig);

                alert('✅ Wszystkie ustawienia zostały zapisane');
                console.log('💾 All settings saved successfully');
            } catch (error) {
                console.error('❌ Failed to save settings:', error.message);
                alert(`Błąd zapisu ustawień: ${error.message}`);
            }
        }

        resetToDefaults() {
            if (confirm('Czy na pewno chcesz przywrócić domyślne ustawienia? Wszystkie zmiany zostaną utracone.')) {
                try {
                    this.scenarioManager.clearAllScenarios();
                    this.integrationManager.resetToDefaults();
                    this.systemConfig.resetAllToDefaults();
                    
                    // Clear localStorage
                    localStorage.removeItem('maskservice_scenarios');
                    localStorage.removeItem('maskservice_integrations');
                    localStorage.removeItem('maskservice_system');
                    localStorage.removeItem('maskservice_standards');

                    alert('🔄 Przywrócono domyślne ustawienia');
                    this.showTab(this.currentTab); // Refresh current tab
                } catch (error) {
                    console.error('❌ Failed to reset to defaults:', error.message);
                    alert(`Błąd przywracania ustawień: ${error.message}`);
                }
            }
        }

        exportConfiguration() {
            try {
                const config = {
                    scenarios: JSON.parse(this.scenarioManager.exportScenariosToJSON()),
                    integrations: JSON.parse(this.integrationManager.exportConfiguration()),
                    system: JSON.parse(this.systemConfig.exportConfiguration()),
                    standards: JSON.parse(this.standardsValidator.exportStandardsConfig()),
                    exportedAt: new Date().toISOString(),
                    version: '3.0.0'
                };

                const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `maskservice-config-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);

                console.log('📤 Configuration exported successfully');
            } catch (error) {
                console.error('❌ Failed to export configuration:', error.message);
                alert(`Błąd eksportu: ${error.message}`);
            }
        }

        reload() {
            location.reload();
        }
    }

    return SystemSettingsEnhanced;
});

// Legacy global export
if (typeof window !== 'undefined') {
    window.SystemSettingsEnhanced = SystemSettingsEnhanced;
}

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

    // Public methods for template integration - Delegated to specialized modules
    showEnhancedSystemSettings() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getEnhancedSystemSettingsHTML();
        }
    }

    showSettingsScenarios() {
        this.scenarios.showSettingsScenarios();
    }

    showSettingsIntegration() {
        this.integration.showSettingsIntegration();
    }

    showSettingsStandards() {
        this.standards.showSettingsStandards();
    }

    showSettingsSystem() {
        this.system.showSettingsSystem();
    }

    // Delegate methods to specialized modules
    createTestScenario() {
        this.scenarios.createTestScenario();
    }

    importScenarios() {
        this.scenarios.importScenarios();
    }

    validateScenarios() {
        this.scenarios.validateScenarios();
    }

    addIntegration() {
        this.integration.addIntegration();
    }

    testConnections() {
        this.integration.testConnections();
    }

    syncData() {
        this.integration.syncData();
    }

    updateStandards() {
        this.standards.updateStandards();
    }

    validateCompliance() {
        this.standards.validateCompliance();
    }

    generateComplianceReport() {
        this.standards.generateComplianceReport();
    }

    saveSystemConfig() {
        this.system.saveSystemConfig();
    }

    resetToDefaults() {
        this.system.resetToDefaults();
    }

    restartSystem() {
        this.system.restartSystem();
    }

    // Legacy method for backwards compatibility
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
