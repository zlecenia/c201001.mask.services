/**
 * MASKSERVICE C20 - Settings Scenarios Module
 * Test scenario management functionality
 * @version 1.0.0
 * @author MASKSERVICE Team
 */

class SettingsScenarios {
    constructor(settingsCore) {
        this.core = settingsCore;
    }

    // Settings Scenarios HTML template (focused on test scenario management)
    getSettingsScenariosHTML() {
        return `
            <div class="system-settings-enhanced">
                <div class="settings-header">
                    <h2>Zarządzanie scenariuszami testowymi</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="settingsScenarios.createTestScenario()">
                            ➕ Nowy scenariusz
                        </button>
                        <button class="btn btn-secondary" onclick="settingsScenarios.importScenarios()">
                            📥 Importuj z XML
                        </button>
                        <button class="btn btn-info" onclick="settingsScenarios.validateScenarios()">
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

    getActiveScenariosHTML() {
        const scenarios = this.core.getTestScenarios();
        let html = '';
        
        for (const [id, scenario] of scenarios) {
            html += `
                <div class="scenario-row">
                    <div class="scenario-name">${scenario.name}</div>
                    <div class="scenario-norm">${scenario.norm}</div>
                    <div class="scenario-devices">${scenario.deviceTypes.join(', ')}</div>
                    <div class="scenario-actions">
                        <button class="btn btn-sm" onclick="settingsScenarios.editScenario('${id}')">Edytuj</button>
                        <button class="btn btn-sm btn-danger" onclick="settingsScenarios.deleteScenario('${id}')">Usuń</button>
                    </div>
                </div>
            `;
        }
        
        return html;
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

    // Scenario management methods
    createTestScenario() {
        const name = document.getElementById('scenario-name')?.value;
        const norm = document.getElementById('scenario-norm')?.value;
        
        if (!name || !norm) {
            alert('Proszę wypełnić wszystkie wymagane pola');
            return;
        }

        const scenario = {
            id: 'scenario_' + Date.now(),
            name: name,
            norm: norm.toUpperCase(),
            deviceTypes: this.getSelectedDeviceTypes(),
            parameters: this.getScenarioParameters(norm)
        };

        this.core.getTestScenarios().set(scenario.id, scenario);
        this.refreshDisplay();
        alert('Scenariusz został utworzony pomyślnie!');
    }

    getSelectedDeviceTypes() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    getScenarioParameters(norm) {
        const standardsConfig = this.core.getStandardsConfig();
        const standard = Array.from(standardsConfig.values()).find(s => s.id === norm.toLowerCase().replace('-', '_'));
        
        return standard ? standard.parameters : {
            pressureTest: { min: -10, max: -5, unit: 'mbar' },
            leakTest: { max: 0.5, unit: 'l/min' },
            duration: 300
        };
    }

    editScenario(scenarioId) {
        const scenario = this.core.getTestScenarios().get(scenarioId);
        if (scenario) {
            document.getElementById('scenario-name').value = scenario.name;
            document.getElementById('scenario-norm').value = scenario.norm.toLowerCase().replace(' ', '-');
            alert(`Edycja scenariusza: ${scenario.name}`);
        }
    }

    deleteScenario(scenarioId) {
        if (confirm('Czy na pewno chcesz usunąć ten scenariusz?')) {
            this.core.getTestScenarios().delete(scenarioId);
            this.refreshDisplay();
        }
    }

    importScenarios() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xml,.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.processImportedScenarios(data);
                    } catch (error) {
                        alert('Błąd podczas importu: nieprawidłowy format pliku');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    processImportedScenarios(data) {
        if (data.scenarios && Array.isArray(data.scenarios)) {
            data.scenarios.forEach(scenario => {
                const id = 'imported_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                this.core.getTestScenarios().set(id, { ...scenario, id });
            });
            this.refreshDisplay();
            alert(`Zaimportowano ${data.scenarios.length} scenariuszy`);
        }
    }

    validateScenarios() {
        const scenarios = this.core.getTestScenarios();
        const standards = this.core.getStandardsConfig();
        let validCount = 0;
        let totalCount = scenarios.size;

        for (const [id, scenario] of scenarios) {
            const normId = scenario.norm.toLowerCase().replace('-', '_').replace(' ', '_');
            const standard = standards.get(normId);
            
            if (standard && this.validateScenarioAgainstStandard(scenario, standard)) {
                validCount++;
            }
        }

        alert(`Walidacja zakończona: ${validCount}/${totalCount} scenariuszy jest zgodnych ze standardami`);
    }

    validateScenarioAgainstStandard(scenario, standard) {
        // Validate scenario parameters against standard requirements
        if (!scenario.parameters || !standard.parameters) {
            return false;
        }

        // Check pressure test requirements
        if (scenario.parameters.pressureTest && standard.parameters.pressureTest) {
            const scenarioMin = scenario.parameters.pressureTest.min;
            const standardMin = standard.parameters.pressureTest.min;
            if (Math.abs(scenarioMin - standardMin) > (standard.parameters.pressureTest.tolerance || 0.1)) {
                return false;
            }
        }

        return true;
    }

    refreshDisplay() {
        // Refresh the scenarios display
        const content = document.getElementById('menu-content');
        if (content && content.innerHTML.includes('scenario-editor')) {
            content.innerHTML = this.getSettingsScenariosHTML();
        }
    }

    showSettingsScenarios() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getSettingsScenariosHTML();
        }
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsScenarios;
}

console.log('✅ Settings Scenarios Module loaded');
