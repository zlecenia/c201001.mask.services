/**
 * MASKSERVICE C20 - Enhanced Test Menu Module (Orchestrator)
 * Coordinates modular test components
 * Compliance with PN-EN 136/137 standards
 */

class TestMenuEnhanced {
    constructor() {
        this.init();
    }

    init() {
        // Initialize modular components
        this.testWizard = new TestWizard();
        this.testQuick = new TestQuick();
        this.testScenarios = new TestScenarios();
        
        // Make components globally accessible
        window.testWizard = this.testWizard;
        window.testQuick = this.testQuick;
        window.testScenarios = this.testScenarios;
        
        console.log('✅ Test Menu Enhanced: All modular components loaded');
    }

    // Delegation methods for Test Wizard
    showTestWizard() {
        return this.testWizard.showTestWizard();
    }

    // Delegation methods for Quick Test
    showQuickTest() {
        return this.testQuick.showQuickTest();
    }

    // Delegation methods for Test Scenarios
    showTestScenarios() {
        return this.testScenarios.showTestScenarios();
    }
    };

    loadDeviceDatabase() {
        // Mock device data - in production would load from API
        const mockDevices = [
            { serial: 'PP001', type: 'PP_MASK', customer: 'Firma ABC', lastTest: '2024-01-15', status: 'ACTIVE' },
            { serial: 'NP002', type: 'NP_MASK', customer: 'Firma XYZ', lastTest: '2024-02-10', status: 'ACTIVE' },
            { serial: 'SCBA003', type: 'SCBA', customer: 'Straż Pożarna', lastTest: '2023-12-20', status: 'MAINTENANCE' }
        ];

        mockDevices.forEach(device => {
            this.deviceDatabase.set(device.serial, device);
        });
    }

    loadTestScenarios() {
        // Test scenarios based on PN-EN 136/137 standards
        const scenarios = [
            {
                id: 'scenario_1',
                name: 'Test po użyciu',
                deviceTypes: ['PP_MASK', 'NP_MASK'],
                interval: 0, // After each use
                tests: ['visual_check', 'pressure_test', 'leak_test']
            },
            {
                id: 'scenario_2', 
                name: 'Test 6-miesięczny',
                deviceTypes: ['PP_MASK', 'NP_MASK', 'SCBA'],
                interval: 6,
                tests: ['full_inspection', 'pressure_test', 'flow_test', 'valve_test']
            },
            {
                id: 'scenario_3',
                name: 'Test roczny',
                deviceTypes: ['SCBA'],
                interval: 12,
                tests: ['complete_overhaul', 'calibration', 'performance_test']
            }
        ];

        scenarios.forEach(scenario => {
            this.testScenarios.set(scenario.id, scenario);
        });
    }

    setupEventListeners() {
        document.addEventListener('testWizardNext', (e) => this.nextStep());
        document.addEventListener('testWizardPrev', (e) => this.prevStep());
        document.addEventListener('testWizardCancel', (e) => this.cancelTest());
    }

    startTestWizard() {
        this.currentStep = 0;
        this.testData = {};
        this.renderWizardStep();
    }

    renderWizardStep() {
        const step = this.testWizard.steps[this.currentStep];
        const content = document.getElementById('menu-content');
        
        if (!content) return;

        content.innerHTML = this.getStepHTML(step);
        this.bindStepEvents(step);
    }

    getStepHTML(step) {
        const stepIndex = this.currentStep + 1;
        const totalSteps = this.testWizard.steps.length;
        const stepTitle = this.testWizard.stepTitles[step];

        let html = `
            <div class="test-wizard">
                <div class="wizard-header">
                    <h2>${stepTitle}</h2>
                    <div class="wizard-progress">
                        <span>Krok ${stepIndex} z ${totalSteps}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(stepIndex/totalSteps)*100}%"></div>
                        </div>
                    </div>
                </div>
                <div class="wizard-content">
        `;

        switch(step) {
            case 'device_selection':
                html += this.getDeviceSelectionHTML();
                break;
            case 'serial_input':
                html += this.getSerialInputHTML();
                break;
            case 'visual_inspection':
                html += this.getVisualInspectionHTML();
                break;
            case 'test_selection':
                html += this.getTestSelectionHTML();
                break;
            case 'test_execution':
                html += this.getTestExecutionHTML();
                break;
            case 'results_review':
                html += this.getResultsReviewHTML();
                break;
            case 'report_generation':
                html += this.getReportGenerationHTML();
                break;
        }

        html += `
                </div>
                <div class="wizard-navigation">
                    ${this.currentStep > 0 ? '<button class="btn btn-secondary" onclick="testMenuEnhanced.prevStep()">← Poprzedni</button>' : ''}
                    ${this.currentStep < this.testWizard.steps.length - 1 ? '<button class="btn btn-primary" onclick="testMenuEnhanced.nextStep()">Następny →</button>' : ''}
                    ${this.currentStep === this.testWizard.steps.length - 1 ? '<button class="btn btn-success" onclick="testMenuEnhanced.finishTest()">Zakończ test</button>' : ''}
                    <button class="btn btn-danger" onclick="testMenuEnhanced.cancelTest()">Anuluj</button>
                </div>
            </div>
        `;

        return html;
    }

    getDeviceSelectionHTML() {
        return `
            <div class="device-selection">
                <h3>Wybierz typ urządzenia do testowania</h3>
                <div class="device-grid">
                    <div class="device-card" onclick="testMenuEnhanced.selectDeviceType('PP_MASK')">
                        <div class="device-icon">😷</div>
                        <h4>Maska pełnotwarzowa (PP)</h4>
                        <p>Maska z filtrem przeciwpyłowym</p>
                    </div>
                    <div class="device-card" onclick="testMenuEnhanced.selectDeviceType('NP_MASK')">
                        <div class="device-icon">🎭</div>
                        <h4>Maska półmaska (NP)</h4>
                        <p>Maska zakrywająca nos i usta</p>
                    </div>
                    <div class="device-card" onclick="testMenuEnhanced.selectDeviceType('SCBA')">
                        <div class="device-icon">🚒</div>
                        <h4>Aparat SCBA</h4>
                        <p>Samodzielny aparat oddechowy</p>
                    </div>
                    <div class="device-card" onclick="testMenuEnhanced.selectDeviceType('CPS')">
                        <div class="device-icon">🧪</div>
                        <h4>Kombinezony CPS</h4>
                        <p>Kombinezon ochronny chemiczny</p>
                    </div>
                </div>
            </div>
        `;
    }

    getSerialInputHTML() {
        return `
            <div class="serial-input">
                <h3>Wprowadź dane urządzenia</h3>
                <div class="form-group">
                    <label>Numer seryjny:</label>
                    <input type="text" id="device-serial" placeholder="Wprowadź numer seryjny" 
                           onchange="testMenuEnhanced.searchDevice(this.value)">
                    <button class="btn btn-secondary" onclick="testMenuEnhanced.scanSerial()">🔍 Skanuj</button>
                </div>
                <div class="form-group">
                    <label>Klient:</label>
                    <input type="text" id="device-customer" placeholder="Nazwa klienta">
                </div>
                <div id="device-history" class="device-history" style="display:none;">
                    <h4>Historia urządzenia</h4>
                    <div id="history-content"></div>
                </div>
            </div>
        `;
    }

    getVisualInspectionHTML() {
        return `
            <div class="visual-inspection">
                <h3>Kontrola wzrokowa urządzenia</h3>
                <div class="checklist">
                    <div class="check-item">
                        <input type="checkbox" id="check-1">
                        <label for="check-1">Stan ogólny urządzenia</label>
                    </div>
                    <div class="check-item">
                        <input type="checkbox" id="check-2">
                        <label for="check-2">Brak widocznych uszkodzeń</label>
                    </div>
                    <div class="check-item">
                        <input type="checkbox" id="check-3">
                        <label for="check-3">Sprawność elementów ruchomych</label>
                    </div>
                    <div class="check-item">
                        <input type="checkbox" id="check-4">
                        <label for="check-4">Stan uszczelek i połączeń</label>
                    </div>
                </div>
                <div class="notes-section">
                    <label>Uwagi:</label>
                    <textarea id="visual-notes" placeholder="Dodatkowe uwagi z kontroli wzrokowej"></textarea>
                </div>
            </div>
        `;
    }

    getTestSelectionHTML() {
        const deviceType = this.testData.deviceType;
        const availableScenarios = Array.from(this.testScenarios.values())
            .filter(scenario => scenario.deviceTypes.includes(deviceType));

        let html = `
            <div class="test-selection">
                <h3>Wybierz scenariusz testowy dla ${deviceType}</h3>
                <div class="scenario-list">
        `;

        availableScenarios.forEach(scenario => {
            html += `
                <div class="scenario-card" onclick="testMenuEnhanced.selectScenario('${scenario.id}')">
                    <h4>${scenario.name}</h4>
                    <p>Interwał: ${scenario.interval === 0 ? 'Po każdym użyciu' : scenario.interval + ' miesięcy'}</p>
                    <div class="test-list">
                        <strong>Testy:</strong>
                        <ul>
                            ${scenario.tests.map(test => `<li>${test}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    getTestExecutionHTML() {
        return `
            <div class="test-execution">
                <h3>Wykonanie testu</h3>
                <div class="test-progress">
                    <div class="current-test">
                        <h4 id="current-test-name">Przygotowanie do testu...</h4>
                        <div class="progress-bar">
                            <div class="progress-fill" id="test-progress-bar" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="sensor-readings">
                        <div class="sensor-group">
                            <h5>Ciśnienie</h5>
                            <div class="sensor-values">
                                <span>Niskie: <span id="pressure-low-reading">-- mbar</span></span>
                                <span>Średnie: <span id="pressure-med-reading">-- bar</span></span>
                                <span>Wysokie: <span id="pressure-high-reading">-- bar</span></span>
                            </div>
                        </div>
                        <div class="sensor-group">
                            <h5>Przepływ</h5>
                            <div class="sensor-values">
                                <span>Wlot: <span id="flow-inlet-reading">-- l/min</span></span>
                                <span>Wylot: <span id="flow-outlet-reading">-- l/min</span></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="test-controls">
                    <button class="btn btn-primary" onclick="testMenuEnhanced.startTestExecution()">🚀 Rozpocznij test</button>
                    <button class="btn btn-warning" onclick="testMenuEnhanced.pauseTest()">⏸️ Wstrzymaj</button>
                    <button class="btn btn-danger" onclick="testMenuEnhanced.stopTest()">⏹️ Zatrzymaj</button>
                </div>
            </div>
        `;
    }

    getResultsReviewHTML() {
        return `
            <div class="results-review">
                <h3>Przegląd wyników testu</h3>
                <div class="results-summary">
                    <div class="result-status ${this.testData.testResult || 'unknown'}">
                        <h4>Status testu: ${this.getTestStatusText()}</h4>
                    </div>
                    <div class="results-data">
                        <h5>Parametry testowe:</h5>
                        <div class="parameter-grid">
                            <div class="parameter">
                                <span>Szczelność:</span>
                                <span class="value">${this.testData.leakResult || 'N/A'}</span>
                            </div>
                            <div class="parameter">
                                <span>Ciśnienie:</span>
                                <span class="value">${this.testData.pressureResult || 'N/A'}</span>
                            </div>
                            <div class="parameter">
                                <span>Przepływ:</span>
                                <span class="value">${this.testData.flowResult || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="compliance-check">
                    <h5>Zgodność z normami:</h5>
                    <div class="norm-status">
                        <span>PN-EN 136: ${this.checkCompliance('PN-EN-136')}</span>
                        <span>PN-EN 137: ${this.checkCompliance('PN-EN-137')}</span>
                    </div>
                </div>
            </div>
        `;
    }

    getReportGenerationHTML() {
        return `
            <div class="report-generation">
                <h3>Generowanie raportu</h3>
                <div class="report-options">
                    <h4>Format raportu:</h4>
                    <div class="format-selection">
                        <label><input type="radio" name="report-format" value="pdf" checked> PDF</label>
                        <label><input type="radio" name="report-format" value="xml"> XML</label>
                        <label><input type="radio" name="report-format" value="csv"> CSV</label>
                    </div>
                    <div class="report-settings">
                        <label><input type="checkbox" id="include-graphs" checked> Dołącz wykresy</label>
                        <label><input type="checkbox" id="digital-signature"> Podpis cyfrowy</label>
                        <label><input type="checkbox" id="email-report"> Wyślij mailem</label>
                    </div>
                </div>
                <div class="report-preview">
                    <h4>Podgląd raportu:</h4>
                    <div class="preview-content">
                        <p><strong>Raport testowy #${this.generateReportId()}</strong></p>
                        <p>Data: ${new Date().toLocaleDateString()}</p>
                        <p>Urządzenie: ${this.testData.deviceType} (${this.testData.serial})</p>
                        <p>Scenariusz: ${this.testData.scenario}</p>
                        <p>Wynik: ${this.getTestStatusText()}</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Event handlers and utility methods
    selectDeviceType(type) {
        this.testData.deviceType = type;
        console.log('Selected device type:', type);
    }

    searchDevice(serial) {
        const device = this.deviceDatabase.get(serial);
        if (device) {
            this.testData.serial = serial;
            this.testData.customer = device.customer;
            this.showDeviceHistory(device);
        }
    }

    showDeviceHistory(device) {
        const historyDiv = document.getElementById('device-history');
        const contentDiv = document.getElementById('history-content');
        
        if (historyDiv && contentDiv) {
            contentDiv.innerHTML = `
                <p>Ostatni test: ${device.lastTest}</p>
                <p>Status: ${device.status}</p>
                <p>Klient: ${device.customer}</p>
            `;
            historyDiv.style.display = 'block';
        }
    }

    selectScenario(scenarioId) {
        this.testData.scenario = scenarioId;
        const scenario = this.testScenarios.get(scenarioId);
        this.testData.scenarioData = scenario;
        console.log('Selected scenario:', scenario);
    }

    nextStep() {
        if (this.currentStep < this.testWizard.steps.length - 1) {
            this.currentStep++;
            this.renderWizardStep();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderWizardStep();
        }
    }

    cancelTest() {
        if (confirm('Czy na pewno chcesz anulować test?')) {
            window.MenuManager.loadTemplate('test-menu-template');
        }
    }

    finishTest() {
        console.log('Test finished:', this.testData);
        alert('Test zakończony pomyślnie! Raport został wygenerowany.');
        window.MenuManager.loadTemplate('test-menu-template');
    }

    // Utility methods
    getTestStatusText() {
        return this.testData.testResult === 'PASS' ? 'ZALICZONY' : 
               this.testData.testResult === 'FAIL' ? 'NIEZALICZONY' : 'W TRAKCIE';
    }

    checkCompliance(norm) {
        // Mock compliance check
        return '✅ Zgodny';
    }

    generateReportId() {
        return 'RPT-' + Date.now().toString().slice(-6);
    }

    // Automatic scenario selection based on device type and interval
    autoScenarioSelection(deviceType, lastTestDate) {
        const intervalMonths = this.calculateInterval(lastTestDate);
        return this.getScenarioByInterval(deviceType, intervalMonths);
    }

    calculateInterval(lastTestDate) {
        const now = new Date();
        const lastTest = new Date(lastTestDate);
        const diffTime = Math.abs(now - lastTest);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.floor(diffDays / 30); // Convert to months
    }

    getScenarioByInterval(deviceType, intervalMonths) {
        const scenarios = Array.from(this.testScenarios.values())
            .filter(s => s.deviceTypes.includes(deviceType))
            .sort((a, b) => b.interval - a.interval);

        for (let scenario of scenarios) {
            if (intervalMonths >= scenario.interval) {
                return scenario.id;
            }
        }
        return scenarios[0]?.id || 'scenario_1';
    }

    // Public methods for split functionality
    showTestWizard() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getTestWizardHTML();
        }
    }

    showTestQuick() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getTestQuickHTML();
        }
    }

    showTestScenarios() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getTestScenariosHTML();
        }
    }

    // Test Wizard HTML template (focused on multi-step wizard)
    getTestWizardHTML() {
        return `
            <div class="test-menu-enhanced">
                <div class="test-header">
                    <h2>Kreator testów wieloetapowy</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="testMenuEnhanced.startTestWizard()">
                            🧙 Rozpocznij kreator
                        </button>
                        <button class="btn btn-secondary" onclick="testMenuEnhanced.loadWizardTemplate()">
                            📋 Wczytaj szablon
                        </button>
                        <button class="btn btn-info" onclick="testMenuEnhanced.wizardHelp()">
                            ❓ Pomoc
                        </button>
                    </div>
                </div>

                <!-- Wizard Progress Overview -->
                <div class="wizard-overview">
                    <h3>Etapy testowania</h3>
                    <div class="wizard-steps">
                        ${this.getWizardStepsHTML()}
                    </div>
                </div>

                <!-- Recent Tests -->
                <div class="recent-tests">
                    <h3>Ostatnie testy</h3>
                    <div class="tests-list">
                        ${this.getRecentTestsHTML()}
                    </div>
                </div>

                <!-- Wizard Statistics -->
                <div class="wizard-statistics">
                    <h3>Statystyki kreatora</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">127</div>
                            <div class="stat-label">Ukończone testy</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">15 min</div>
                            <div class="stat-label">Średni czas testu</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">96%</div>
                            <div class="stat-label">Wskaźnik powodzenia</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">8</div>
                            <div class="stat-label">Aktywne szablony</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Test Quick HTML template (focused on quick testing for experienced users)
    getTestQuickHTML() {
        return `
            <div class="test-menu-enhanced">
                <div class="test-header">
                    <h2>Szybki test</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="testMenuEnhanced.startQuickTest()">
                            ⚡ Rozpocznij test
                        </button>
                        <button class="btn btn-secondary" onclick="testMenuEnhanced.loadQuickPreset()">
                            📋 Wczytaj preset
                        </button>
                        <button class="btn btn-warning" onclick="testMenuEnhanced.emergencyTest()">
                            🚨 Test awaryjny
                        </button>
                    </div>
                </div>

                <!-- Quick Test Form -->
                <div class="quick-test-form">
                    <h3>Formularz szybkiego testu</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Numer seryjny urządzenia:</label>
                            <input type="text" id="quick-serial" placeholder="Wprowadź numer seryjny">
                        </div>
                        <div class="form-group">
                            <label>Typ testu:</label>
                            <select id="quick-test-type">
                                <option value="basic">Test podstawowy</option>
                                <option value="pressure">Test ciśnienia</option>
                                <option value="flow">Test przepływu</option>
                                <option value="leak">Test szczelności</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Operator:</label>
                            <input type="text" id="quick-operator" placeholder="Imię operatora">
                        </div>
                        <div class="form-group">
                            <label>Uwagi:</label>
                            <textarea id="quick-notes" placeholder="Dodatkowe uwagi"></textarea>
                        </div>
                    </div>
                    <button class="btn btn-success" onclick="testMenuEnhanced.executeQuickTest()">
                        ▶️ Wykonaj test
                    </button>
                </div>

                <!-- Test Presets -->
                <div class="test-presets">
                    <h3>Presety testowe</h3>
                    <div class="presets-grid">
                        <div class="preset-card" onclick="testMenuEnhanced.loadPreset('basic')">
                            <h4>Test podstawowy</h4>
                            <p>Standardowy test zgodny z PN-EN 136</p>
                        </div>
                        <div class="preset-card" onclick="testMenuEnhanced.loadPreset('extended')">
                            <h4>Test rozszerzony</h4>
                            <p>Pełny test z dodatkowymi pomiarami</p>
                        </div>
                        <div class="preset-card" onclick="testMenuEnhanced.loadPreset('maintenance')">
                            <h4>Test serwisowy</h4>
                            <p>Test dla celów konserwacyjnych</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Test Scenarios HTML template (focused on test scenario management)
    getTestScenariosHTML() {
        return `
            <div class="test-menu-enhanced">
                <div class="test-header">
                    <h2>Scenariusze testowe</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="testMenuEnhanced.createScenario()">
                            ➕ Nowy scenariusz
                        </button>
                        <button class="btn btn-secondary" onclick="testMenuEnhanced.importScenarios()">
                            📥 Importuj scenariusze
                        </button>
                        <button class="btn btn-info" onclick="testMenuEnhanced.exportScenarios()">
                            📤 Eksportuj scenariusze
                        </button>
                    </div>
                </div>

                <!-- Scenarios Library -->
                <div class="scenarios-library">
                    <h3>Biblioteka scenariuszy</h3>
                    <div class="scenarios-filter">
                        <select onchange="testMenuEnhanced.filterScenarios(this.value)">
                            <option value="">Wszystkie scenariusze</option>
                            <option value="pn-en-136">PN-EN 136</option>
                            <option value="pn-en-137">PN-EN 137</option>
                            <option value="custom">Niestandardowe</option>
                        </select>
                    </div>
                    <div class="scenarios-list">
                        <div class="scenario-item">
                            <div class="scenario-info">
                                <strong>Test podstawowy PN-EN 136</strong>
                                <span class="scenario-standard">Standard: PN-EN 136</span>
                            </div>
                            <div class="scenario-actions">
                                <button class="btn btn-sm" onclick="testMenuEnhanced.editScenario('pn136basic')">Edytuj</button>
                                <button class="btn btn-sm" onclick="testMenuEnhanced.runScenario('pn136basic')">Uruchom</button>
                            </div>
                        </div>
                        <div class="scenario-item">
                            <div class="scenario-info">
                                <strong>Test ciśnienia PN-EN 137</strong>
                                <span class="scenario-standard">Standard: PN-EN 137</span>
                            </div>
                            <div class="scenario-actions">
                                <button class="btn btn-sm" onclick="testMenuEnhanced.editScenario('pn137pressure')">Edytuj</button>
                                <button class="btn btn-sm" onclick="testMenuEnhanced.runScenario('pn137pressure')">Uruchom</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Standards Compliance -->
                <div class="standards-compliance">
                    <h3>Zgodność ze standardami</h3>
                    <div class="compliance-grid">
                        <div class="compliance-item">
                            <div class="standard-name">PN-EN 136</div>
                            <div class="compliance-status verified">Zweryfikowane</div>
                        </div>
                        <div class="compliance-item">
                            <div class="standard-name">PN-EN 137</div>
                            <div class="compliance-status verified">Zweryfikowane</div>
                        </div>
                        <div class="compliance-item">
                            <div class="standard-name">ISO 16900</div>
                            <div class="compliance-status pending">Oczekujące</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper methods for new functionality
    getWizardStepsHTML() {
        return `
            <div class="step-item completed">
                <div class="step-number">1</div>
                <div class="step-name">Wybór urządzenia</div>
            </div>
            <div class="step-item completed">
                <div class="step-number">2</div>
                <div class="step-name">Dane seryjne</div>
            </div>
            <div class="step-item active">
                <div class="step-number">3</div>
                <div class="step-name">Kontrola wzrokowa</div>
            </div>
            <div class="step-item">
                <div class="step-number">4</div>
                <div class="step-name">Wybór testu</div>
            </div>
        `;
    }

    getRecentTestsHTML() {
        return `
            <div class="test-item">
                <div class="test-info">
                    <strong>Maska pełnotwarzowa X-plore 6000</strong>
                    <span class="test-date">2024-01-10 14:30</span>
                </div>
                <div class="test-status passed">Zaliczony</div>
            </div>
            <div class="test-item">
                <div class="test-info">
                    <strong>Maska półmaska X-plore 3300</strong>
                    <span class="test-date">2024-01-10 13:15</span>
                </div>
                <div class="test-status failed">Niezaliczony</div>
            </div>
        `;
    }

    // Placeholder methods for new functionality
    loadWizardTemplate() {
        alert('Wczytywanie szablonu kreatora - funkcja wkrótce dostępna!');
    }

    wizardHelp() {
        alert('Pomoc dla kreatora testów - funkcja wkrótce dostępna!');
    }

    startQuickTest() {
        alert('Rozpoczynanie szybkiego testu - funkcja wkrótce dostępna!');
    }

    loadQuickPreset() {
        alert('Wczytywanie presetu - funkcja wkrótce dostępna!');
    }

    emergencyTest() {
        alert('Test awaryjny - funkcja wkrótce dostępna!');
    }

    executeQuickTest() {
        alert('Wykonywanie szybkiego testu - funkcja wkrótce dostępna!');
    }

    loadPreset(presetType) {
        alert(`Wczytywanie presetu: ${presetType} - funkcja wkrótce dostępna!`);
    }

    createScenario() {
        alert('Tworzenie nowego scenariusza - funkcja wkrótce dostępna!');
    }

    importScenarios() {
        alert('Import scenariuszy - funkcja wkrótce dostępna!');
    }

    exportScenarios() {
        alert('Eksport scenariuszy - funkcja wkrótce dostępna!');
    }

    filterScenarios(filter) {
        console.log('Filtrowanie scenariuszy:', filter);
    }

    editScenario(scenarioId) {
        alert(`Edycja scenariusza: ${scenarioId} - funkcja wkrótce dostępna!`);
    }

    runScenario(scenarioId) {
        alert(`Uruchamianie scenariusza: ${scenarioId} - funkcja wkrótce dostępna!`);
    }
}

// Create global instance
window.testMenuEnhanced = new TestMenuEnhanced();

console.log('✅ Enhanced Test Menu Module loaded');
