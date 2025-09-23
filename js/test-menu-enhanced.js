/**
 * MASKSERVICE C20 - Enhanced Test Menu Module
 * Multi-step wizard for testing process automation
 * Compliance with PN-EN 136/137 standards
 */

class TestMenuEnhanced {
    constructor() {
        this.currentStep = 0;
        this.testData = {};
        this.deviceDatabase = new Map();
        this.testScenarios = new Map();
        this.init();
    }

    init() {
        this.loadDeviceDatabase();
        this.loadTestScenarios();
        this.setupEventListeners();
    }

    // Multi-step wizard configuration
    testWizard = {
        steps: [
            'device_selection',    // Wybór urządzenia
            'serial_input',        // Wprowadzenie numeru seryjnego
            'visual_inspection',   // Kontrola wzrokowa z checklistą
            'test_selection',      // Wybór scenariusza testowego
            'test_execution',      // Wykonanie testu
            'results_review',      // Przegląd wyników
            'report_generation'    // Generowanie raportu
        ],
        
        stepTitles: {
            'device_selection': 'Wybór typu urządzenia',
            'serial_input': 'Wprowadzenie danych urządzenia',
            'visual_inspection': 'Kontrola wzrokowa',
            'test_selection': 'Wybór scenariusza testowego',
            'test_execution': 'Wykonanie testu',
            'results_review': 'Przegląd wyników',
            'report_generation': 'Generowanie raportu'
        }
    };

    // Device database integration
    deviceDatabase = {
        searchBySerial: true,
        searchByCustomer: true,
        searchByLastTestDate: true,
        quickAccess: 'recent_devices'
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
}

// Create global instance
window.testMenuEnhanced = new TestMenuEnhanced();

console.log('✅ Enhanced Test Menu Module loaded');
