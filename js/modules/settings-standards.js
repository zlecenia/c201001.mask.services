/**
 * MASKSERVICE C20 - Settings Standards Module
 * Standards compliance management functionality
 * @version 1.0.0
 * @author MASKSERVICE Team
 */

class SettingsStandards {
    constructor(settingsCore) {
        this.core = settingsCore;
    }

    // Settings Standards HTML template (focused on standards compliance)
    getSettingsStandardsHTML() {
        return `
            <div class="system-settings-enhanced">
                <div class="settings-header">
                    <h2>Zgodność ze standardami</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="settingsStandards.updateStandards()">
                            🔄 Aktualizuj standardy
                        </button>
                        <button class="btn btn-secondary" onclick="settingsStandards.validateCompliance()">
                            ✅ Sprawdź zgodność
                        </button>
                        <button class="btn btn-info" onclick="settingsStandards.generateComplianceReport()">
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
                            <button class="tab-button active" onclick="settingsStandards.showTab('pn-en-136')">PN-EN 136</button>
                            <button class="tab-button" onclick="settingsStandards.showTab('pn-en-137')">PN-EN 137</button>
                            <button class="tab-button" onclick="settingsStandards.showTab('iso-16900')">ISO 16900</button>
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

    getStandardsOverviewHTML() {
        const standards = this.core.getStandardsConfig();
        let html = '';
        
        for (const [id, standard] of standards) {
            const badgeClass = standard.status === 'verified' ? 'verified' : 'pending';
            const badgeText = standard.status === 'verified' ? 'Zgodny' : 'Oczekujące';
            
            html += `
                <div class="standard-card">
                    <div class="standard-header">
                        <h4>${standard.name}</h4>
                        <div class="compliance-badge ${badgeClass}">${badgeText}</div>
                    </div>
                    <div class="standard-details">
                        <p>${standard.description}</p>
                        <div class="standard-version">Wersja: ${standard.version}</div>
                        <div class="standard-actions">
                            <button class="btn btn-sm" onclick="settingsStandards.configureStandard('${id}')">Konfiguruj</button>
                            <button class="btn btn-sm btn-info" onclick="settingsStandards.validateStandard('${id}')">Waliduj</button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return html;
    }

    getComplianceTabContent() {
        return `
            <div class="compliance-content">
                <h4>Parametry testowe PN-EN 136</h4>
                <div class="parameter-list">
                    <div class="parameter-item">
                        <label>Test szczelności - ciśnienie minimalne:</label>
                        <input type="number" value="-10" step="0.1" id="pn136-pressure-min"> mbar
                    </div>
                    <div class="parameter-item">
                        <label>Test szczelności - maksymalna nieszczelność:</label>
                        <input type="number" value="0.5" step="0.1" id="pn136-leak-max"> l/min
                    </div>
                    <div class="parameter-item">
                        <label>Czas trwania testu:</label>
                        <input type="number" value="300" id="pn136-duration"> sekund
                    </div>
                    <div class="parameter-item">
                        <label>Tolerancja pomiarowa:</label>
                        <input type="number" value="0.1" step="0.01" id="pn136-tolerance"> ±
                    </div>
                </div>
                
                <div class="compliance-actions">
                    <button class="btn btn-primary" onclick="settingsStandards.saveStandardParameters('pn_en_136')">
                        Zapisz parametry
                    </button>
                    <button class="btn btn-secondary" onclick="settingsStandards.resetToDefaults('pn_en_136')">
                        Przywróć domyślne
                    </button>
                </div>
            </div>
        `;
    }

    getAuditTrailHTML() {
        const now = new Date();
        const auditEntries = [
            {
                timestamp: new Date(now.getTime() - 300000).toLocaleString(),
                user: 'admin',
                action: 'Aktualizacja standardu PN-EN 136',
                status: 'Ukończono',
                details: 'Zmieniono parametry testu szczelności'
            },
            {
                timestamp: new Date(now.getTime() - 600000).toLocaleString(),
                user: 'operator1',
                action: 'Walidacja zgodności ISO 16900',
                status: 'Oczekujące',
                details: 'Sprawdzanie zgodności procedur testowych'
            },
            {
                timestamp: new Date(now.getTime() - 900000).toLocaleString(),
                user: 'serwisant',
                action: 'Kalibracja zgodnie z PN-EN 137',
                status: 'Ukończono',
                details: 'Kalibracja urządzeń pomiarowych'
            }
        ];

        let html = '';
        auditEntries.forEach(entry => {
            const statusClass = entry.status === 'Ukończono' ? 'completed' : 'pending';
            html += `
                <div class="audit-entry">
                    <div class="audit-time">${entry.timestamp}</div>
                    <div class="audit-user">${entry.user}</div>
                    <div class="audit-action">${entry.action}</div>
                    <div class="audit-status ${statusClass}">${entry.status}</div>
                    <div class="audit-details">${entry.details}</div>
                </div>
            `;
        });
        
        return html;
    }

    // Standards management methods
    updateStandards() {
        // Simulate standards update process
        const standards = this.core.getStandardsConfig();
        let updatedCount = 0;
        
        for (const [id, standard] of standards) {
            // Check for updates (simulated)
            const hasUpdate = Math.random() > 0.7; // 30% chance of update
            if (hasUpdate) {
                standard.version = this.getNextVersion(standard.version);
                updatedCount++;
            }
        }
        
        if (updatedCount > 0) {
            alert(`Aktualizacja standardów zakończona: ${updatedCount} standardów zostało zaktualizowanych`);
            this.refreshDisplay();
        } else {
            alert('Wszystkie standardy są aktualne');
        }
    }

    getNextVersion(currentVersion) {
        const year = parseInt(currentVersion);
        return (year + 1).toString();
    }

    validateCompliance() {
        const standards = this.core.getStandardsConfig();
        const scenarios = this.core.getTestScenarios();
        
        let complianceResults = {
            totalStandards: standards.size,
            compliantStandards: 0,
            totalScenarios: scenarios.size,
            compliantScenarios: 0,
            issues: []
        };
        
        // Validate standards compliance
        for (const [id, standard] of standards) {
            const isCompliant = this.validateStandardCompliance(standard);
            if (isCompliant) {
                complianceResults.compliantStandards++;
            } else {
                complianceResults.issues.push(`Standard ${standard.name} wymaga aktualizacji`);
            }
        }
        
        // Validate scenarios against standards
        for (const [id, scenario] of scenarios) {
            const standardId = scenario.norm.toLowerCase().replace('-', '_').replace(' ', '_');
            const standard = standards.get(standardId);
            
            if (standard && this.validateScenarioAgainstStandard(scenario, standard)) {
                complianceResults.compliantScenarios++;
            } else {
                complianceResults.issues.push(`Scenariusz "${scenario.name}" nie jest zgodny ze standardem ${scenario.norm}`);
            }
        }
        
        this.showComplianceResults(complianceResults);
    }

    validateStandardCompliance(standard) {
        // Basic compliance validation
        return standard.status === 'verified' && 
               standard.parameters && 
               Object.keys(standard.parameters).length > 0;
    }

    validateScenarioAgainstStandard(scenario, standard) {
        if (!scenario.parameters || !standard.parameters) {
            return false;
        }
        
        // Check pressure test requirements
        if (scenario.parameters.pressureTest && standard.parameters.pressureTest) {
            const scenarioMin = scenario.parameters.pressureTest.min;
            const standardMin = standard.parameters.pressureTest.min;
            const tolerance = standard.parameters.pressureTest.tolerance || 0.1;
            
            if (Math.abs(scenarioMin - standardMin) > tolerance) {
                return false;
            }
        }
        
        return true;
    }

    showComplianceResults(results) {
        const compliancePercent = Math.round((results.compliantStandards / results.totalStandards) * 100);
        const scenarioPercent = Math.round((results.compliantScenarios / results.totalScenarios) * 100);
        
        let message = `Raport zgodności:\n\n`;
        message += `Standardy: ${results.compliantStandards}/${results.totalStandards} (${compliancePercent}%)\n`;
        message += `Scenariusze: ${results.compliantScenarios}/${results.totalScenarios} (${scenarioPercent}%)\n\n`;
        
        if (results.issues.length > 0) {
            message += `Wykryte problemy:\n${results.issues.join('\n')}`;
        } else {
            message += `✅ Wszystkie elementy są zgodne ze standardami!`;
        }
        
        alert(message);
    }

    generateComplianceReport() {
        const standards = this.core.getStandardsConfig();
        const scenarios = this.core.getTestScenarios();
        
        const report = {
            generatedAt: new Date().toISOString(),
            standards: Array.from(standards.values()),
            scenarios: Array.from(scenarios.values()),
            complianceStatus: this.calculateOverallCompliance()
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Raport zgodności został wygenerowany i pobrany');
    }

    calculateOverallCompliance() {
        const standards = this.core.getStandardsConfig();
        const verifiedStandards = Array.from(standards.values()).filter(s => s.status === 'verified').length;
        return Math.round((verifiedStandards / standards.size) * 100);
    }

    configureStandard(standardId) {
        const standard = this.core.getStandardsConfig().get(standardId);
        if (standard) {
            // Show configuration for specific standard
            this.showTab(standardId.replace('_', '-'));
            alert(`Konfiguracja standardu: ${standard.name}`);
        }
    }

    validateStandard(standardId) {
        const standard = this.core.getStandardsConfig().get(standardId);
        if (standard) {
            const isValid = this.validateStandardCompliance(standard);
            const message = isValid ? 
                `✅ Standard ${standard.name} jest zgodny` : 
                `❌ Standard ${standard.name} wymaga aktualizacji`;
            alert(message);
        }
    }

    saveStandardParameters(standardId) {
        const standard = this.core.getStandardsConfig().get(standardId);
        if (standard) {
            // Get updated parameters from form
            const pressureMin = parseFloat(document.getElementById('pn136-pressure-min')?.value || standard.parameters.pressureTest?.min);
            const leakMax = parseFloat(document.getElementById('pn136-leak-max')?.value || standard.parameters.leakTest?.max);
            const duration = parseInt(document.getElementById('pn136-duration')?.value || standard.parameters.duration);
            const tolerance = parseFloat(document.getElementById('pn136-tolerance')?.value || standard.parameters.pressureTest?.tolerance);
            
            // Update standard parameters
            standard.parameters = {
                ...standard.parameters,
                pressureTest: { ...standard.parameters.pressureTest, min: pressureMin, tolerance: tolerance },
                leakTest: { ...standard.parameters.leakTest, max: leakMax },
                duration: duration
            };
            
            alert(`Parametry standardu ${standard.name} zostały zapisane`);
        }
    }

    resetToDefaults(standardId) {
        const standard = this.core.getStandardsConfig().get(standardId);
        if (standard) {
            // Reset to default parameters based on standard
            const defaults = this.getDefaultParameters(standardId);
            standard.parameters = defaults;
            this.refreshDisplay();
            alert(`Parametry standardu ${standard.name} zostały przywrócone do wartości domyślnych`);
        }
    }

    getDefaultParameters(standardId) {
        const defaults = {
            'pn_en_136': {
                pressureTest: { min: -10, tolerance: 0.1 },
                leakTest: { max: 0.5, unit: 'l/min' },
                duration: 300
            },
            'pn_en_137': {
                pressureTest: { min: -20, tolerance: 0.1 },
                flowTest: { min: 200, unit: 'l/min' },
                duration: 600
            },
            'iso_16900': {
                testProcedures: ['static', 'dynamic', 'environmental'],
                calibrationInterval: 365
            }
        };
        
        return defaults[standardId] || {};
    }

    showTab(tabId) {
        // Update tab display
        const tabs = document.querySelectorAll('.tab-button');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        const activeTab = document.querySelector(`[onclick="settingsStandards.showTab('${tabId}')"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        console.log('Przełączanie zakładki:', tabId);
    }

    refreshDisplay() {
        const content = document.getElementById('menu-content');
        if (content && content.innerHTML.includes('compliance-settings')) {
            content.innerHTML = this.getSettingsStandardsHTML();
        }
    }

    showSettingsStandards() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getSettingsStandardsHTML();
        }
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsStandards;
}

console.log('✅ Settings Standards Module loaded');
