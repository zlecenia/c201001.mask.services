/**
 * MASKSERVICE C20 - Quick Test Module
 * Fast test execution with predefined presets
 * Optimized for routine testing scenarios
 */

class TestQuick {
    constructor() {
        this.presets = new Map();
        this.recentTests = [];
        this.init();
    }

    init() {
        this.loadPresets();
        this.loadRecentTests();
    }

    loadPresets() {
        // Mock test presets
        this.presets.set('basic', {
            id: 'basic',
            name: 'Test podstawowy',
            description: 'Standardowy test zgodny z PN-EN 136',
            duration: 15,
            parameters: {
                pressure: 4.2,
                leakageLimit: 0.1,
                filterEfficiency: 99.5
            }
        });

        this.presets.set('extended', {
            id: 'extended',
            name: 'Test rozszerzony',
            description: 'Pełny test z dodatkowymi pomiarami',
            duration: 30,
            parameters: {
                pressure: 4.5,
                leakageLimit: 0.05,
                filterEfficiency: 99.8
            }
        });

        this.presets.set('maintenance', {
            id: 'maintenance',
            name: 'Test serwisowy',
            description: 'Test dla celów konserwacyjnych',
            duration: 20,
            parameters: {
                pressure: 4.0,
                leakageLimit: 0.2,
                filterEfficiency: 99.0
            }
        });
    }

    loadRecentTests() {
        // Mock recent tests data
        this.recentTests = [
            {
                id: 'test-001',
                deviceName: 'Maska pełnotwarzowa X-plore 6000',
                serial: '12345',
                date: '2024-01-10 14:30',
                status: 'passed',
                operator: 'Jan Kowalski'
            },
            {
                id: 'test-002',
                deviceName: 'Maska półmaska X-plore 3300',
                serial: '67890',
                date: '2024-01-10 13:15',
                status: 'failed',
                operator: 'Anna Nowak'
            }
        ];
    }

    // Main UI method for quick test
    showQuickTest() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getQuickTestHTML();
        }
    }

    getQuickTestHTML() {
        return `
            <div class="test-menu-enhanced">
                <div class="test-header">
                    <h2>Szybki test</h2>
                    <div class="header-actions">
                        <button class="btn btn-success" onclick="testQuick.startQuickTest()">
                            ⚡ Rozpocznij szybki test
                        </button>
                        <button class="btn btn-secondary" onclick="testQuick.loadQuickPreset()">
                            📋 Wczytaj preset
                        </button>
                        <button class="btn btn-warning" onclick="testQuick.emergencyTest()">
                            🚨 Test awaryjny
                        </button>
                    </div>
                </div>

                <!-- Recent Tests -->
                <div class="recent-tests">
                    <h3>Ostatnie testy</h3>
                    <div class="tests-list">
                        ${this.getRecentTestsHTML()}
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
                    <button class="btn btn-success" onclick="testQuick.executeQuickTest()">
                        ▶️ Wykonaj test
                    </button>
                </div>

                <!-- Test Presets -->
                <div class="test-presets">
                    <h3>Presety testowe</h3>
                    <div class="presets-grid">
                        ${this.getPresetsGridHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    getPresetsGridHTML() {
        let html = '';
        this.presets.forEach((preset) => {
            html += `
                <div class="preset-card" onclick="testQuick.loadPreset('${preset.id}')">
                    <h4>${preset.name}</h4>
                    <p>${preset.description}</p>
                    <div class="preset-duration">Czas: ~${preset.duration} min</div>
                </div>
            `;
        });
        return html;
    }

    getRecentTestsHTML() {
        return this.recentTests.map(test => `
            <div class="test-item">
                <div class="test-info">
                    <strong>${test.deviceName}</strong>
                    <span class="test-date">${test.date}</span>
                </div>
                <div class="test-status ${test.status}">${test.status === 'passed' ? 'Zaliczony' : 'Niezaliczony'}</div>
                <div class="test-actions">
                    <button class="btn-small" onclick="testQuick.repeatTest('${test.id}')">🔄</button>
                    <button class="btn-small" onclick="testQuick.viewTestDetails('${test.id}')">👁️</button>
                </div>
            </div>
        `).join('');
    }

    // Quick test execution methods
    startQuickTest() {
        const serial = document.getElementById('quick-serial')?.value;
        const testType = document.getElementById('quick-test-type')?.value;
        const operator = document.getElementById('quick-operator')?.value;

        if (!serial) {
            alert('Wprowadź numer seryjny urządzenia');
            return;
        }

        console.log('Starting quick test:', { serial, testType, operator });
        this.executeTest(serial, testType, operator);
    }

    executeTest(serial, testType, operator) {
        // Mock test execution
        const testData = {
            serial,
            testType,
            operator,
            startTime: new Date(),
            status: 'running'
        };

        // Simulate test execution
        setTimeout(() => {
            const result = Math.random() > 0.3 ? 'passed' : 'failed';
            testData.status = result;
            testData.endTime = new Date();
            
            this.addToRecentTests(testData);
            this.showTestResult(testData);
        }, 3000);

        this.showTestInProgress(testData);
    }

    showTestInProgress(testData) {
        alert(`Test w trakcie wykonywania dla urządzenia: ${testData.serial}`);
    }

    showTestResult(testData) {
        const statusText = testData.status === 'passed' ? 'ZALICZONY' : 'NIEZALICZONY';
        alert(`Test zakończony: ${statusText}\nUrządzenie: ${testData.serial}\nCzas: ${testData.endTime.toLocaleTimeString()}`);
    }

    addToRecentTests(testData) {
        const testItem = {
            id: 'test-' + Date.now(),
            deviceName: `Urządzenie ${testData.serial}`,
            serial: testData.serial,
            date: testData.endTime.toLocaleString('pl-PL'),
            status: testData.status,
            operator: testData.operator
        };

        this.recentTests.unshift(testItem);
        if (this.recentTests.length > 10) {
            this.recentTests.pop();
        }

        // Refresh the UI
        this.refreshRecentTests();
    }

    refreshRecentTests() {
        const testsList = document.querySelector('.tests-list');
        if (testsList) {
            testsList.innerHTML = this.getRecentTestsHTML();
        }
    }

    loadPreset(presetType) {
        const preset = this.presets.get(presetType);
        if (preset) {
            // Auto-fill form with preset values
            const testTypeSelect = document.getElementById('quick-test-type');
            if (testTypeSelect) {
                testTypeSelect.value = presetType === 'basic' ? 'basic' : 
                                      presetType === 'extended' ? 'pressure' : 'leak';
            }
            
            console.log(`Preset loaded: ${preset.name}`);
            alert(`Wczytano preset: ${preset.name}\nParametry: ${JSON.stringify(preset.parameters)}`);
        }
    }

    executeQuickTest() {
        this.startQuickTest();
    }

    loadQuickPreset() {
        const presets = Array.from(this.presets.keys());
        const selected = prompt(`Wybierz preset:\n${presets.map((p, i) => `${i+1}. ${p}`).join('\n')}`);
        
        if (selected) {
            const presetKey = presets[parseInt(selected) - 1];
            if (presetKey) {
                this.loadPreset(presetKey);
            }
        }
    }

    emergencyTest() {
        if (confirm('Czy chcesz uruchomić test awaryjny? Ten test będzie miał wysokie priorytety.')) {
            // Emergency test logic
            const emergencyData = {
                serial: 'EMERGENCY-' + Date.now(),
                testType: 'emergency',
                operator: 'System',
                priority: 'high'
            };
            
            this.executeTest(emergencyData.serial, emergencyData.testType, emergencyData.operator);
        }
    }

    repeatTest(testId) {
        const test = this.recentTests.find(t => t.id === testId);
        if (test) {
            // Pre-fill form with test data
            const serialInput = document.getElementById('quick-serial');
            const operatorInput = document.getElementById('quick-operator');
            
            if (serialInput) serialInput.value = test.serial;
            if (operatorInput) operatorInput.value = test.operator;
            
            alert(`Formularz wypełniony danymi z testu: ${test.id}`);
        }
    }

    repeatLastTest() {
        if (this.recentTests.length > 0) {
            this.repeatTest(this.recentTests[0].id);
        } else {
            alert('Brak ostatnich testów do powtórzenia');
        }
    }

    viewTestDetails(testId) {
        const test = this.recentTests.find(t => t.id === testId);
        if (test) {
            const details = `
Szczegóły testu:
ID: ${test.id}
Urządzenie: ${test.deviceName}
Numer seryjny: ${test.serial}
Data: ${test.date}
Status: ${test.status === 'passed' ? 'Zaliczony' : 'Niezaliczony'}
Operator: ${test.operator}
            `;
            alert(details);
        }
    }

    batchQuickTest() {
        alert('Funkcja testu zbiorczego - wkrótce dostępna!');
    }

    calibrateDevice() {
        alert('Kalibracja urządzenia - funkcja wkrótce dostępna!');
    }

    exportQuickResults() {
        if (this.recentTests.length > 0) {
            const csvData = this.generateCSVReport();
            console.log('CSV Export:', csvData);
            alert('Wyniki wyeksportowane do konsoli (w rzeczywistej aplikacji zostałyby zapisane do pliku)');
        } else {
            alert('Brak wyników do eksportu');
        }
    }

    generateCSVReport() {
        const headers = ['ID', 'Urządzenie', 'Numer seryjny', 'Data', 'Status', 'Operator'];
        const rows = this.recentTests.map(test => [
            test.id,
            test.deviceName,
            test.serial,
            test.date,
            test.status === 'passed' ? 'Zaliczony' : 'Niezaliczony',
            test.operator
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestQuick;
}
