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

