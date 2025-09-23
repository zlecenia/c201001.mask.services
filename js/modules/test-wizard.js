/**
 * MASKSERVICE C20 - Test Wizard Module
 * Multi-step wizard for testing process automation
 * Compliance with PN-EN 136/137 standards
 */

class TestWizard {
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

    loadDeviceDatabase() {
        // Mock device database
        this.deviceDatabase.set('12345', {
            serial: '12345',
            type: 'Maska pełnotwarzowa',
            model: 'X-plore 6000',
            customer: 'Firma ABC',
            lastTest: '2023-12-15',
            status: 'Aktywny'
        });

        this.deviceDatabase.set('67890', {
            serial: '67890',
            type: 'Półmaska filtrująca',
            model: 'X-plore 3300',
            customer: 'Firma XYZ',
            lastTest: '2023-11-20',
            status: 'Wymaga przeglądu'
        });
    }

    loadTestScenarios() {
        // Mock test scenarios
        this.testScenarios.set('scenario_1', {
            id: 'scenario_1',
            name: 'Test podstawowy PN-EN 136',
            standard: 'PN-EN 136',
            deviceTypes: ['Maska pełnotwarzowa'],
            interval: 6, // months
            steps: ['Kontrola wizualna', 'Test szczelności', 'Test wydolności filtra']
        });

        this.testScenarios.set('scenario_2', {
            id: 'scenario_2',
            name: 'Test rozszerzony PN-EN 137',
            standard: 'PN-EN 137',
            deviceTypes: ['Półmaska filtrująca'],
            interval: 12,
            steps: ['Kontrola wizualna', 'Test szczelności', 'Test wydolności filtra', 'Test przecieków']
        });
    }

    setupEventListeners() {
        // Keyboard shortcuts for wizard navigation
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch (e.key) {
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextStep();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.prevStep();
                        break;
                }
            }
        });
    }

    // Main UI method for wizard
    showTestWizard() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getTestWizardHTML();
            this.renderWizardStep();
        }
    }

    getTestWizardHTML() {
        return `
            <div class="test-menu-enhanced">
                <div class="test-header">
                    <h2>Kreator testów</h2>
                    <div class="header-actions">
                        <button class="btn btn-secondary" onclick="testWizard.loadWizardTemplate()">
                            📋 Szablon
                        </button>
                        <button class="btn btn-info" onclick="testWizard.wizardHelp()">
                            ❓ Pomoc
                        </button>
                    </div>
                </div>

                <!-- Wizard Progress Bar -->
                <div class="wizard-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.getProgressPercentage()}%"></div>
                    </div>
                    <div class="progress-steps">
                        ${this.getProgressStepsHTML()}
                    </div>
                </div>

                <!-- Wizard Content -->
                <div class="wizard-content" id="wizard-step-content">
                    <!-- Dynamic content will be loaded here -->
                </div>

                <!-- Wizard Navigation -->
                <div class="wizard-navigation">
                    <button class="btn btn-secondary" onclick="testWizard.prevStep()" 
                            ${this.currentStep === 0 ? 'disabled' : ''}>
                        ← Poprzedni
                    </button>
                    
                    <button class="btn btn-danger" onclick="testWizard.cancelTest()">
                        ✕ Anuluj
                    </button>
                    
                    ${this.currentStep === this.testWizard.steps.length - 1 ? 
                        `<button class="btn btn-success" onclick="testWizard.finishTest()">
                            ✓ Zakończ test
                        </button>` :
                        `<button class="btn btn-primary" onclick="testWizard.nextStep()">
                            Następny →
                        </button>`
                    }
                </div>
            </div>
        `;
    }

    getProgressPercentage() {
        return Math.round(((this.currentStep + 1) / this.testWizard.steps.length) * 100);
    }

    getProgressStepsHTML() {
        return this.testWizard.steps.map((step, index) => `
            <div class="progress-step ${index <= this.currentStep ? 'completed' : ''} ${index === this.currentStep ? 'active' : ''}">
                <div class="step-number">${index + 1}</div>
                <div class="step-name">${this.testWizard.stepTitles[step]}</div>
            </div>
        `).join('');
    }

    renderWizardStep() {
        const stepContent = document.getElementById('wizard-step-content');
        if (!stepContent) return;

        const currentStepName = this.testWizard.steps[this.currentStep];
        
        switch (currentStepName) {
            case 'device_selection':
                stepContent.innerHTML = this.getDeviceSelectionHTML();
                break;
            case 'serial_input':
                stepContent.innerHTML = this.getSerialInputHTML();
                break;
            case 'visual_inspection':
                stepContent.innerHTML = this.getVisualInspectionHTML();
                break;
            case 'test_selection':
                stepContent.innerHTML = this.getTestSelectionHTML();
                break;
            case 'test_execution':
                stepContent.innerHTML = this.getTestExecutionHTML();
                break;
            case 'results_review':
                stepContent.innerHTML = this.getResultsReviewHTML();
                break;
            case 'report_generation':
                stepContent.innerHTML = this.getReportGenerationHTML();
                break;
        }
    }

    getDeviceSelectionHTML() {
        return `
            <div class="wizard-step">
                <h3>Wybór typu urządzenia</h3>
                <div class="device-types">
                    <div class="device-type-card" onclick="testWizard.selectDeviceType('full_face')">
                        <div class="device-icon">🎭</div>
                        <h4>Maska pełnotwarzowa</h4>
                        <p>Standard PN-EN 136</p>
                    </div>
                    <div class="device-type-card" onclick="testWizard.selectDeviceType('half_mask')">
                        <div class="device-icon">😷</div>
                        <h4>Półmaska filtrująca</h4>
                        <p>Standard PN-EN 137</p>
                    </div>
                    <div class="device-type-card" onclick="testWizard.selectDeviceType('respirator')">
                        <div class="device-icon">🔬</div>
                        <h4>Aparat oddechowy</h4>
                        <p>Standard PN-EN 133</p>
                    </div>
                </div>
            </div>
        `;
    }

    getSerialInputHTML() {
        return `
            <div class="wizard-step">
                <h3>Wprowadzenie danych urządzenia</h3>
                <div class="serial-input-form">
                    <div class="form-group">
                        <label>Numer seryjny:</label>
                        <input type="text" id="device-serial" placeholder="Wprowadź numer seryjny" 
                               onchange="testWizard.searchDevice(this.value)">
                    </div>
                    
                    <div class="form-group">
                        <label>Klient:</label>
                        <select id="device-customer">
                            <option value="">Wybierz klienta</option>
                            <option value="Firma ABC">Firma ABC</option>
                            <option value="Firma XYZ">Firma XYZ</option>
                            <option value="Straż Pożarna">Straż Pożarna</option>
                        </select>
                    </div>

                    <div id="device-history" style="display: none;">
                        <h4>Historia urządzenia</h4>
                        <div id="history-content"></div>
                    </div>
                </div>
            </div>
        `;
    }

    getVisualInspectionHTML() {
        return `
            <div class="wizard-step">
                <h3>Kontrola wzrokowa</h3>
                <div class="inspection-checklist">
                    <div class="checklist-item">
                        <input type="checkbox" id="check-exterior">
                        <label for="check-exterior">Stan zewnętrzny urządzenia</label>
                    </div>
                    <div class="checklist-item">
                        <input type="checkbox" id="check-straps">
                        <label for="check-straps">Stan pasów mocujących</label>
                    </div>
                    <div class="checklist-item">
                        <input type="checkbox" id="check-seals">
                        <label for="check-seals">Stan uszczelek</label>
                    </div>
                    <div class="checklist-item">
                        <input type="checkbox" id="check-filters">
                        <label for="check-filters">Stan filtrów</label>
                    </div>
                    <div class="checklist-item">
                        <input type="checkbox" id="check-valves">
                        <label for="check-valves">Stan zaworów</label>
                    </div>
                </div>
                
                <div class="inspection-notes">
                    <label>Uwagi:</label>
                    <textarea placeholder="Dodatkowe obserwacje z kontroli wzrokowej"></textarea>
                </div>
            </div>
        `;
    }

    getTestSelectionHTML() {
        return `
            <div class="wizard-step">
                <h3>Wybór scenariusza testowego</h3>
                <div class="scenario-selection">
                    <div class="scenario-card" onclick="testWizard.selectScenario('scenario_1')">
                        <h4>Test podstawowy</h4>
                        <p>Standard PN-EN 136</p>
                        <div class="scenario-duration">Czas: ~15 min</div>
                    </div>
                    <div class="scenario-card" onclick="testWizard.selectScenario('scenario_2')">
                        <h4>Test rozszerzony</h4>
                        <p>Standard PN-EN 137</p>
                        <div class="scenario-duration">Czas: ~30 min</div>
                    </div>
                </div>
                
                <div class="auto-selection">
                    <button class="btn btn-info" onclick="testWizard.autoSelectScenario()">
                        🤖 Automatyczny wybór scenariusza
                    </button>
                </div>
            </div>
        `;
    }

    getTestExecutionHTML() {
        return `
            <div class="wizard-step">
                <h3>Wykonanie testu</h3>
                <div class="test-execution">
                    <div class="test-status">
                        <h4>Status: <span id="test-status">Gotowy do testu</span></h4>
                    </div>
                    
                    <div class="test-controls">
                        <button class="btn btn-success btn-large" onclick="testWizard.startTest()">
                            ▶️ Rozpocznij test
                        </button>
                    </div>
                    
                    <div class="test-progress" id="test-progress" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="test-progress-bar" style="width: 0%"></div>
                        </div>
                        <div class="test-step-info" id="test-step-info">Przygotowanie testu...</div>
                    </div>
                </div>
            </div>
        `;
    }

    getResultsReviewHTML() {
        return `
            <div class="wizard-step">
                <h3>Przegląd wyników</h3>
                <div class="test-results">
                    <div class="result-summary">
                        <div class="result-status ${this.testData.testResult === 'PASS' ? 'passed' : 'failed'}">
                            ${this.getTestStatusText()}
                        </div>
                    </div>
                    
                    <div class="result-details">
                        <h4>Szczegóły testu</h4>
                        <div class="result-grid">
                            <div class="result-item">
                                <label>Ciśnienie robocze:</label>
                                <span>${this.testData.workingPressure || '4.2'} bar</span>
                            </div>
                            <div class="result-item">
                                <label>Szczelność:</label>
                                <span>${this.testData.leakage || '< 0.1'} l/min</span>
                            </div>
                            <div class="result-item">
                                <label>Wydolność filtra:</label>
                                <span>${this.testData.filterEfficiency || '99.97'}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="compliance-check">
                        <h4>Zgodność z normami</h4>
                        <div class="compliance-item">
                            <span>PN-EN 136:</span>
                            <span>${this.checkCompliance('PN-EN 136')}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getReportGenerationHTML() {
        return `
            <div class="wizard-step">
                <h3>Generowanie raportu</h3>
                <div class="report-generation">
                    <div class="report-info">
                        <h4>Informacje o raporcie</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <label>ID raportu:</label>
                                <span>${this.generateReportId()}</span>
                            </div>
                            <div class="info-item">
                                <label>Data testu:</label>
                                <span>${new Date().toLocaleDateString('pl-PL')}</span>
                            </div>
                            <div class="info-item">
                                <label>Operator:</label>
                                <span>${this.testData.operator || 'System'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="report-options">
                        <h4>Opcje raportu</h4>
                        <div class="options-grid">
                            <label><input type="checkbox" checked> Dołącz zdjęcia</label>
                            <label><input type="checkbox" checked> Podpis cyfrowy</label>
                            <label><input type="checkbox"> Wyślij mailem</label>
                            <label><input type="checkbox"> Archiwizuj automatycznie</label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Wizard navigation methods
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

    autoSelectScenario() {
        if (this.testData.deviceType && this.testData.serial) {
            const device = this.deviceDatabase.get(this.testData.serial);
            if (device) {
                const recommendedScenario = this.autoScenarioSelection(device.type, device.lastTest);
                this.selectScenario(recommendedScenario);
                alert(`Automatycznie wybrano scenariusz: ${this.testScenarios.get(recommendedScenario).name}`);
            }
        }
    }

    startTest() {
        // Mock test execution
        this.testData.testResult = Math.random() > 0.3 ? 'PASS' : 'FAIL';
        this.testData.workingPressure = (4.0 + Math.random() * 0.5).toFixed(1);
        this.testData.leakage = (Math.random() * 0.2).toFixed(2);
        this.testData.filterEfficiency = (99.5 + Math.random() * 0.47).toFixed(2);
        
        const progressDiv = document.getElementById('test-progress');
        const progressBar = document.getElementById('test-progress-bar');
        const stepInfo = document.getElementById('test-step-info');
        
        if (progressDiv) progressDiv.style.display = 'block';
        
        // Simulate test progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progressBar) progressBar.style.width = progress + '%';
            if (stepInfo) {
                const steps = ['Przygotowanie...', 'Test ciśnienia...', 'Test szczelności...', 'Finalizacja...'];
                stepInfo.textContent = steps[Math.floor(progress / 25)] || 'Zakończono';
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => this.nextStep(), 1000);
            }
        }, 500);
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

    // Placeholder methods
    loadWizardTemplate() {
        alert('Wczytywanie szablonu kreatora - funkcja wkrótce dostępna!');
    }

    wizardHelp() {
        alert('Pomoc dla kreatora testów - funkcja wkrótce dostępna!');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestWizard;
}
