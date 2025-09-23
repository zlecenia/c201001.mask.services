/**
 * MASKSERVICE C20 - Test Scenarios Module
 * Advanced test scenario management and customization
 * Support for PN-EN 136/137 standards
 */

class TestScenarios {
    constructor() {
        this.scenarios = new Map();
        this.standards = new Map();
        this.customScenarios = new Map();
        this.init();
    }

    init() {
        this.loadStandards();
        this.loadDefaultScenarios();
        this.loadCustomScenarios();
    }

    loadStandards() {
        this.standards.set('pn-en-136', {
            id: 'pn-en-136',
            name: 'PN-EN 136',
            title: 'Respiratory protective devices - Full face masks',
            description: 'Standard for full face masks - Requirements, testing, marking',
            applicableDevices: ['full_face_mask'],
            testTypes: ['visual_inspection', 'leakage_test', 'pressure_test', 'field_of_vision']
        });

        this.standards.set('pn-en-137', {
            id: 'pn-en-137',
            name: 'PN-EN 137',
            title: 'Respiratory protective devices - Self-contained breathing apparatus',
            description: 'Standard for self-contained breathing apparatus',
            applicableDevices: ['respirator', 'breathing_apparatus'],
            testTypes: ['visual_inspection', 'pressure_test', 'flow_test', 'alarm_test']
        });
    }

    loadDefaultScenarios() {
        this.scenarios.set('pn136basic', {
            id: 'pn136basic',
            name: 'Test podstawowy PN-EN 136',
            standard: 'PN-EN 136',
            deviceTypes: ['full_face_mask'],
            interval: 6,
            duration: 15,
            steps: [
                { id: 'visual', name: 'Kontrola wizualna', duration: 3 },
                { id: 'leakage', name: 'Test szczelności', duration: 5 },
                { id: 'pressure', name: 'Test ciśnienia', duration: 4 },
                { id: 'filter', name: 'Test filtra', duration: 3 }
            ],
            parameters: {
                testPressure: 4.2,
                maxLeakage: 0.1,
                minFilterEfficiency: 99.5
            },
            compliance: {
                required: true,
                certificate: true,
                documentation: true
            }
        });

        this.scenarios.set('pn137extended', {
            id: 'pn137extended',
            name: 'Test rozszerzony PN-EN 137',
            standard: 'PN-EN 137',
            deviceTypes: ['respirator', 'breathing_apparatus'],
            interval: 12,
            duration: 30,
            steps: [
                { id: 'visual', name: 'Kontrola wizualna', duration: 5 },
                { id: 'pressure', name: 'Test ciśnienia roboczego', duration: 8 },
                { id: 'flow', name: 'Test przepływu', duration: 7 },
                { id: 'alarm', name: 'Test systemu alarmowego', duration: 5 },
                { id: 'emergency', name: 'Test procedur awaryjnych', duration: 5 }
            ],
            parameters: {
                workingPressure: 300,
                emergencyPressure: 55,
                flowRate: 200,
                alarmPressure: 55
            },
            compliance: {
                required: true,
                certificate: true,
                documentation: true,
                periodicCheck: true
            }
        });

        this.scenarios.set('maintenance', {
            id: 'maintenance',
            name: 'Test serwisowy',
            standard: 'Internal',
            deviceTypes: ['all'],
            interval: 3,
            duration: 20,
            steps: [
                { id: 'cleaning', name: 'Czyszczenie i dezynfekcja', duration: 8 },
                { id: 'inspection', name: 'Inspekcja techniczna', duration: 7 },
                { id: 'calibration', name: 'Sprawdzenie kalibracji', duration: 5 }
            ],
            parameters: {
                cleaningAgent: 'IPA 70%',
                inspectionChecklist: true,
                calibrationTolerance: 2.0
            },
            compliance: {
                required: false,
                certificate: false,
                documentation: true
            }
        });
    }

    loadCustomScenarios() {
        // Mock custom scenarios (would be loaded from database)
        this.customScenarios.set('custom1', {
            id: 'custom1',
            name: 'Test specjalny - Straż Pożarna',
            standard: 'Custom',
            deviceTypes: ['full_face_mask'],
            interval: 4,
            duration: 25,
            createdBy: 'Jan Kowalski',
            createdDate: '2024-01-15',
            steps: [
                { id: 'heat_resistance', name: 'Test odporności na wysoką temperaturę', duration: 10 },
                { id: 'visibility', name: 'Test widoczności w dymie', duration: 8 },
                { id: 'communication', name: 'Test systemu komunikacji', duration: 7 }
            ],
            parameters: {
                maxTemperature: 200,
                smokeVisibility: 5,
                communicationRange: 100
            }
        });
    }

    // Main UI method for scenarios
    showTestScenarios() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getTestScenariosHTML();
        }
    }

    getTestScenariosHTML() {
        return `
            <div class="test-menu-enhanced">
                <div class="test-header">
                    <h2>Scenariusze testowe</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="testScenarios.createScenario()">
                            ➕ Nowy scenariusz
                        </button>
                        <button class="btn btn-secondary" onclick="testScenarios.importScenarios()">
                            📥 Importuj scenariusze
                        </button>
                        <button class="btn btn-info" onclick="testScenarios.exportScenarios()">
                            📤 Eksportuj scenariusze
                        </button>
                    </div>
                </div>

                <!-- Scenarios Filter -->
                <div class="scenarios-filter">
                    <h3>Filtruj scenariusze</h3>
                    <div class="filter-controls">
                        <select id="standard-filter" onchange="testScenarios.filterScenarios(this.value)">
                            <option value="">Wszystkie standardy</option>
                            <option value="pn-en-136">PN-EN 136</option>
                            <option value="pn-en-137">PN-EN 137</option>
                            <option value="custom">Niestandardowe</option>
                        </select>
                        <select id="device-filter" onchange="testScenarios.filterByDevice(this.value)">
                            <option value="">Wszystkie urządzenia</option>
                            <option value="full_face_mask">Maski pełnotwarzowe</option>
                            <option value="respirator">Aparaty oddechowe</option>
                            <option value="breathing_apparatus">Aparaty powietrzne</option>
                        </select>
                        <input type="text" id="search-scenarios" placeholder="Szukaj scenariuszy..." 
                               oninput="testScenarios.searchScenarios(this.value)">
                    </div>
                </div>

                <!-- Standards Library -->
                <div class="standards-library">
                    <h3>Biblioteka standardów</h3>
                    <div class="standards-list">
                        ${this.getStandardsListHTML()}
                    </div>
                </div>

                <!-- Default Scenarios -->
                <div class="scenarios-library">
                    <h3>Scenariusze standardowe</h3>
                    <div class="scenarios-list" id="default-scenarios">
                        ${this.getDefaultScenariosHTML()}
                    </div>
                </div>

                <!-- Custom Scenarios -->
                <div class="custom-scenarios">
                    <h3>Scenariusze niestandardowe</h3>
                    <div class="scenarios-list" id="custom-scenarios">
                        ${this.getCustomScenariosHTML()}
                    </div>
                </div>

                <!-- Scenario Templates -->
                <div class="scenario-templates">
                    <h3>Szablony scenariuszy</h3>
                    <div class="templates-grid">
                        <div class="template-card" onclick="testScenarios.useTemplate('basic')">
                            <div class="template-icon">📋</div>
                            <div class="template-name">Podstawowy</div>
                            <div class="template-desc">Standardowy test zgodny z normami</div>
                        </div>
                        <div class="template-card" onclick="testScenarios.useTemplate('advanced')">
                            <div class="template-icon">⚙️</div>
                            <div class="template-name">Zaawansowany</div>
                            <div class="template-desc">Test z dodatkowymi parametrami</div>
                        </div>
                        <div class="template-card" onclick="testScenarios.useTemplate('maintenance')">
                            <div class="template-icon">🔧</div>
                            <div class="template-name">Serwisowy</div>
                            <div class="template-desc">Test konserwacyjny</div>
                        </div>
                        <div class="template-card" onclick="testScenarios.useTemplate('custom')">
                            <div class="template-icon">🎯</div>
                            <div class="template-name">Niestandardowy</div>
                            <div class="template-desc">Własny scenariusz</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getStandardsListHTML() {
        let html = '';
        this.standards.forEach(standard => {
            html += `
                <div class="standard-item">
                    <div class="standard-info">
                        <strong>${standard.name}</strong>
                        <h4>${standard.title}</h4>
                        <p>${standard.description}</p>
                        <div class="standard-devices">
                            Urządzenia: ${standard.applicableDevices.join(', ')}
                        </div>
                    </div>
                    <div class="standard-actions">
                        <button class="btn btn-sm" onclick="testScenarios.viewStandardDetails('${standard.id}')">
                            📖 Szczegóły
                        </button>
                        <button class="btn btn-sm" onclick="testScenarios.createFromStandard('${standard.id}')">
                            ➕ Utwórz scenariusz
                        </button>
                    </div>
                </div>
            `;
        });
        return html;
    }

    getDefaultScenariosHTML() {
        let html = '';
        this.scenarios.forEach(scenario => {
            html += `
                <div class="scenario-item">
                    <div class="scenario-info">
                        <strong>${scenario.name}</strong>
                        <div class="scenario-details">
                            <span class="scenario-standard">Standard: ${scenario.standard}</span>
                            <span class="scenario-duration">Czas: ${scenario.duration} min</span>
                            <span class="scenario-interval">Interwał: ${scenario.interval} miesięcy</span>
                        </div>
                        <div class="scenario-steps">
                            Kroki: ${scenario.steps.map(step => step.name).join(', ')}
                        </div>
                    </div>
                    <div class="scenario-actions">
                        <button class="btn btn-sm btn-success" onclick="testScenarios.runScenario('${scenario.id}')">
                            ▶️ Uruchom
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="testScenarios.editScenario('${scenario.id}')">
                            ✏️ Edytuj
                        </button>
                        <button class="btn btn-sm btn-info" onclick="testScenarios.duplicateScenario('${scenario.id}')">
                            📋 Duplikuj
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="testScenarios.exportScenario('${scenario.id}')">
                            📤 Eksportuj
                        </button>
                    </div>
                </div>
            `;
        });
        return html;
    }

    getCustomScenariosHTML() {
        let html = '';
        this.customScenarios.forEach(scenario => {
            html += `
                <div class="scenario-item custom">
                    <div class="scenario-info">
                        <strong>${scenario.name}</strong>
                        <div class="scenario-details">
                            <span class="scenario-standard">Standard: ${scenario.standard}</span>
                            <span class="scenario-duration">Czas: ${scenario.duration} min</span>
                            <span class="scenario-creator">Autor: ${scenario.createdBy}</span>
                            <span class="scenario-date">Data: ${scenario.createdDate}</span>
                        </div>
                        <div class="scenario-steps">
                            Kroki: ${scenario.steps.map(step => step.name).join(', ')}
                        </div>
                    </div>
                    <div class="scenario-actions">
                        <button class="btn btn-sm btn-success" onclick="testScenarios.runScenario('${scenario.id}')">
                            ▶️ Uruchom
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="testScenarios.editScenario('${scenario.id}')">
                            ✏️ Edytuj
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="testScenarios.deleteScenario('${scenario.id}')">
                            🗑️ Usuń
                        </button>
                        <button class="btn btn-sm btn-info" onclick="testScenarios.shareScenario('${scenario.id}')">
                            🔗 Udostępnij
                        </button>
                    </div>
                </div>
            `;
        });
        return html || '<p class="no-scenarios">Brak niestandardowych scenariuszy</p>';
    }

    // Scenario management methods
    createScenario() {
        const name = prompt('Wprowadź nazwę nowego scenariusza:');
        if (name) {
            const newScenario = {
                id: 'custom_' + Date.now(),
                name: name,
                standard: 'Custom',
                deviceTypes: ['all'],
                interval: 6,
                duration: 15,
                createdBy: 'Użytkownik',
                createdDate: new Date().toLocaleDateString('pl-PL'),
                steps: [
                    { id: 'step1', name: 'Krok 1', duration: 5 }
                ],
                parameters: {}
            };
            
            this.customScenarios.set(newScenario.id, newScenario);
            this.refreshCustomScenarios();
            alert(`Utworzono nowy scenariusz: ${name}`);
        }
    }

    editScenario(scenarioId) {
        const scenario = this.scenarios.get(scenarioId) || this.customScenarios.get(scenarioId);
        if (scenario) {
            alert(`Edycja scenariusza: ${scenario.name}\nFunkcja wkrótce dostępna!`);
        }
    }

    duplicateScenario(scenarioId) {
        const scenario = this.scenarios.get(scenarioId);
        if (scenario) {
            const newName = prompt(`Wprowadź nazwę dla kopii scenariusza "${scenario.name}":`);
            if (newName) {
                const duplicatedScenario = {
                    ...scenario,
                    id: 'custom_' + Date.now(),
                    name: newName,
                    createdBy: 'Użytkownik',
                    createdDate: new Date().toLocaleDateString('pl-PL')
                };
                
                this.customScenarios.set(duplicatedScenario.id, duplicatedScenario);
                this.refreshCustomScenarios();
                alert(`Utworzono kopię scenariusza: ${newName}`);
            }
        }
    }

    deleteScenario(scenarioId) {
        if (confirm('Czy na pewno chcesz usunąć ten scenariusz?')) {
            this.customScenarios.delete(scenarioId);
            this.refreshCustomScenarios();
            alert('Scenariusz został usunięty');
        }
    }

    runScenario(scenarioId) {
        const scenario = this.scenarios.get(scenarioId) || this.customScenarios.get(scenarioId);
        if (scenario) {
            console.log('Running scenario:', scenario);
            alert(`Uruchamianie scenariusza: ${scenario.name}\nCzas wykonania: ${scenario.duration} minut`);
            // In production, this would start the actual test scenario
        }
    }

    exportScenario(scenarioId) {
        const scenario = this.scenarios.get(scenarioId) || this.customScenarios.get(scenarioId);
        if (scenario) {
            const exportData = JSON.stringify(scenario, null, 2);
            console.log('Exported scenario:', exportData);
            alert('Scenariusz wyeksportowany do konsoli (w rzeczywistej aplikacji zostałby zapisany do pliku)');
        }
    }

    shareScenario(scenarioId) {
        const scenario = this.customScenarios.get(scenarioId);
        if (scenario) {
            alert(`Udostępnianie scenariusza: ${scenario.name}\nFunkcja wkrótce dostępna!`);
        }
    }

    importScenarios() {
        alert('Import scenariuszy z pliku - funkcja wkrótce dostępna!');
    }

    exportScenarios() {
        const allScenarios = {
            default: Array.from(this.scenarios.values()),
            custom: Array.from(this.customScenarios.values())
        };
        
        const exportData = JSON.stringify(allScenarios, null, 2);
        console.log('Exported all scenarios:', exportData);
        alert('Wszystkie scenariusze wyeksportowane do konsoli');
    }

    // Filter and search methods
    filterScenarios(filter) {
        console.log('Filtering scenarios by standard:', filter);
        // Implementation would filter displayed scenarios
    }

    filterByDevice(deviceType) {
        console.log('Filtering scenarios by device type:', deviceType);
        // Implementation would filter scenarios by device compatibility
    }

    searchScenarios(searchTerm) {
        console.log('Searching scenarios:', searchTerm);
        // Implementation would search through scenario names and descriptions
    }

    // Template methods
    useTemplate(templateType) {
        console.log('Using template:', templateType);
        
        const templates = {
            'basic': {
                name: 'Scenariusz podstawowy',
                steps: ['Kontrola wizualna', 'Test szczelności', 'Test ciśnienia']
            },
            'advanced': {
                name: 'Scenariusz zaawansowany',
                steps: ['Kontrola wizualna', 'Test szczelności', 'Test ciśnienia', 'Test wydolności', 'Test alarmów']
            },
            'maintenance': {
                name: 'Scenariusz serwisowy',
                steps: ['Czyszczenie', 'Inspekcja', 'Kalibracja', 'Test funkcjonalny']
            }
        };
        
        const template = templates[templateType];
        if (template) {
            alert(`Używanie szablonu: ${template.name}\nKroki: ${template.steps.join(', ')}`);
        }
    }

    // Standard methods
    viewStandardDetails(standardId) {
        const standard = this.standards.get(standardId);
        if (standard) {
            const details = `
Standard: ${standard.name}
Tytuł: ${standard.title}
Opis: ${standard.description}
Urządzenia: ${standard.applicableDevices.join(', ')}
Typy testów: ${standard.testTypes.join(', ')}
            `;
            alert(details);
        }
    }

    createFromStandard(standardId) {
        const standard = this.standards.get(standardId);
        if (standard) {
            const name = prompt(`Wprowadź nazwę scenariusza dla standardu ${standard.name}:`);
            if (name) {
                const newScenario = {
                    id: 'custom_' + Date.now(),
                    name: name,
                    standard: standard.name,
                    deviceTypes: standard.applicableDevices,
                    interval: 12,
                    duration: 20,
                    createdBy: 'Użytkownik',
                    createdDate: new Date().toLocaleDateString('pl-PL'),
                    steps: standard.testTypes.map((test, index) => ({
                        id: `step${index + 1}`,
                        name: test,
                        duration: 5
                    })),
                    parameters: {}
                };
                
                this.customScenarios.set(newScenario.id, newScenario);
                this.refreshCustomScenarios();
                alert(`Utworzono scenariusz na podstawie standardu: ${name}`);
            }
        }
    }

    // UI refresh methods
    refreshCustomScenarios() {
        const customScenariosContainer = document.getElementById('custom-scenarios');
        if (customScenariosContainer) {
            customScenariosContainer.innerHTML = this.getCustomScenariosHTML();
        }
    }

    refreshAllScenarios() {
        const defaultContainer = document.getElementById('default-scenarios');
        const customContainer = document.getElementById('custom-scenarios');
        
        if (defaultContainer) {
            defaultContainer.innerHTML = this.getDefaultScenariosHTML();
        }
        if (customContainer) {
            customContainer.innerHTML = this.getCustomScenariosHTML();
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestScenarios;
}
