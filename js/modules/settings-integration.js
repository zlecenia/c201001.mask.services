/**
 * MASKSERVICE C20 - Settings Integration Module
 * External integrations management functionality
 * @version 1.0.0
 * @author MASKSERVICE Team
 */

class SettingsIntegration {
    constructor(settingsCore) {
        this.core = settingsCore;
    }

    // Settings Integration HTML template (focused on external integrations)
    getSettingsIntegrationHTML() {
        return `
            <div class="system-settings-enhanced">
                <div class="settings-header">
                    <h2>Integracje zewnętrzne</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="settingsIntegration.addIntegration()">
                            ➕ Dodaj integrację
                        </button>
                        <button class="btn btn-secondary" onclick="settingsIntegration.testConnections()">
                            🔄 Testuj połączenia
                        </button>
                        <button class="btn btn-info" onclick="settingsIntegration.syncData()">
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
                                <input type="url" placeholder="https://erp.company.com/api" id="erp-url">
                            </div>
                            <div class="setting-item">
                                <label>Klucz API:</label>
                                <input type="password" placeholder="••••••••" id="erp-apikey">
                            </div>
                            <div class="setting-item">
                                <label>Synchronizacja automatyczna:</label>
                                <input type="checkbox" checked id="erp-autosync">
                            </div>
                        </div>
                        <div class="setting-group">
                            <h4>📧 System powiadomień</h4>
                            <div class="setting-item">
                                <label>Serwer SMTP:</label>
                                <input type="text" placeholder="smtp.company.com" id="smtp-host">
                            </div>
                            <div class="setting-item">
                                <label>Port:</label>
                                <input type="number" value="587" id="smtp-port">
                            </div>
                            <div class="setting-item">
                                <label>Szyfrowanie TLS:</label>
                                <input type="checkbox" checked id="smtp-tls">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Integration Status -->
                <div class="integration-status">
                    <h3>Status integracji</h3>
                    <div class="status-grid">
                        ${this.getIntegrationStatusHTML()}
                    </div>
                </div>

                <!-- Integration Logs -->
                <div class="integration-logs">
                    <h3>Dziennik integracji</h3>
                    <div class="logs-container">
                        ${this.getIntegrationLogsHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    getActiveIntegrationsHTML() {
        const integrations = this.core.getIntegrationSettings();
        let html = '';
        
        for (const [id, integration] of integrations) {
            const statusClass = integration.status === 'active' ? 'active' : 'inactive';
            html += `
                <div class="integration-item">
                    <div class="integration-info">
                        <strong>📊 ${integration.name}</strong>
                        <span class="integration-type">${integration.type}</span>
                    </div>
                    <div class="integration-status ${statusClass}">${integration.status === 'active' ? 'Aktywny' : 'Nieaktywny'}</div>
                    <div class="integration-actions">
                        <button class="btn btn-sm" onclick="settingsIntegration.configureIntegration('${id}')">Konfiguruj</button>
                        <button class="btn btn-sm btn-warning" onclick="settingsIntegration.toggleIntegration('${id}')">
                            ${integration.status === 'active' ? 'Dezaktywuj' : 'Aktywuj'}
                        </button>
                    </div>
                </div>
            `;
        }
        
        return html;
    }

    getIntegrationStatusHTML() {
        const integrations = this.core.getIntegrationSettings();
        let html = '';
        
        for (const [id, integration] of integrations) {
            const statusClass = integration.status === 'active' ? 'online' : 'offline';
            const statusText = integration.status === 'active' ? 'Online' : 'Offline';
            
            html += `
                <div class="status-item">
                    <div class="status-name">${integration.name}</div>
                    <div class="status-indicator ${statusClass}">${statusText}</div>
                    <div class="status-actions">
                        <button class="btn btn-xs" onclick="settingsIntegration.pingIntegration('${id}')">Test</button>
                    </div>
                </div>
            `;
        }
        
        return html;
    }

    getIntegrationLogsHTML() {
        const now = new Date();
        const logs = [
            {
                timestamp: new Date(now.getTime() - 300000).toLocaleString(),
                integration: 'ERP System',
                action: 'Synchronizacja danych',
                status: 'Sukces',
                details: 'Zsynchronizowano 15 rekordów'
            },
            {
                timestamp: new Date(now.getTime() - 600000).toLocaleString(),
                integration: 'Email Gateway',
                action: 'Wysłanie powiadomienia',
                status: 'Sukces',
                details: 'Email wysłany do admin@company.com'
            },
            {
                timestamp: new Date(now.getTime() - 900000).toLocaleString(),
                integration: 'ERP System',
                action: 'Test połączenia',
                status: 'Błąd',
                details: 'Timeout połączenia'
            }
        ];

        let html = '';
        logs.forEach(log => {
            const statusClass = log.status === 'Sukces' ? 'success' : 'error';
            html += `
                <div class="log-entry">
                    <div class="log-timestamp">${log.timestamp}</div>
                    <div class="log-integration">${log.integration}</div>
                    <div class="log-action">${log.action}</div>
                    <div class="log-status ${statusClass}">${log.status}</div>
                    <div class="log-details">${log.details}</div>
                </div>
            `;
        });
        
        return html;
    }

    // Integration management methods
    addIntegration() {
        const dialog = this.createIntegrationDialog();
        document.body.appendChild(dialog);
        dialog.showModal();
    }

    createIntegrationDialog() {
        const dialog = document.createElement('dialog');
        dialog.className = 'integration-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Dodaj nową integrację</h3>
                <form id="integration-form">
                    <div class="form-group">
                        <label>Nazwa integracji:</label>
                        <input type="text" id="new-integration-name" required>
                    </div>
                    <div class="form-group">
                        <label>Typ integracji:</label>
                        <select id="new-integration-type" required>
                            <option value="">Wybierz typ</option>
                            <option value="REST_API">REST API</option>
                            <option value="SOAP">SOAP Web Service</option>
                            <option value="SMTP">SMTP Email</option>
                            <option value="FTP">FTP/SFTP</option>
                            <option value="DATABASE">Baza danych</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>URL/Adres:</label>
                        <input type="url" id="new-integration-url" required>
                    </div>
                    <div class="dialog-actions">
                        <button type="button" onclick="this.closest('dialog').close()">Anuluj</button>
                        <button type="submit">Dodaj</button>
                    </div>
                </form>
            </div>
        `;
        
        dialog.querySelector('#integration-form').onsubmit = (e) => {
            e.preventDefault();
            this.saveNewIntegration(dialog);
        };
        
        return dialog;
    }

    saveNewIntegration(dialog) {
        const name = dialog.querySelector('#new-integration-name').value;
        const type = dialog.querySelector('#new-integration-type').value;
        const url = dialog.querySelector('#new-integration-url').value;
        
        const integration = {
            id: 'integration_' + Date.now(),
            name: name,
            type: type,
            status: 'inactive',
            config: {
                url: url,
                timeout: 30000
            }
        };
        
        this.core.getIntegrationSettings().set(integration.id, integration);
        dialog.close();
        document.body.removeChild(dialog);
        this.refreshDisplay();
        alert('Integracja została dodana pomyślnie!');
    }

    configureIntegration(integrationId) {
        const integration = this.core.getIntegrationSettings().get(integrationId);
        if (integration) {
            // Populate form fields with current integration settings
            if (integration.type === 'REST_API' && integration.name.includes('ERP')) {
                document.getElementById('erp-url').value = integration.config.url || '';
            } else if (integration.type === 'SMTP') {
                document.getElementById('smtp-host').value = integration.config.host || '';
                document.getElementById('smtp-port').value = integration.config.port || 587;
                document.getElementById('smtp-tls').checked = integration.config.security === 'TLS';
            }
            alert(`Konfiguracja integracji: ${integration.name}`);
        }
    }

    toggleIntegration(integrationId) {
        const integration = this.core.getIntegrationSettings().get(integrationId);
        if (integration) {
            integration.status = integration.status === 'active' ? 'inactive' : 'active';
            this.refreshDisplay();
            alert(`Integracja ${integration.name} została ${integration.status === 'active' ? 'aktywowana' : 'dezaktywowana'}`);
        }
    }

    testConnections() {
        const integrations = this.core.getIntegrationSettings();
        let testedCount = 0;
        let successCount = 0;
        
        for (const [id, integration] of integrations) {
            if (integration.status === 'active') {
                testedCount++;
                // Simulate connection test
                const testResult = Math.random() > 0.2; // 80% success rate
                if (testResult) successCount++;
            }
        }
        
        alert(`Test połączeń zakończony: ${successCount}/${testedCount} integracji działa poprawnie`);
    }

    pingIntegration(integrationId) {
        const integration = this.core.getIntegrationSettings().get(integrationId);
        if (integration) {
            // Simulate ping test
            const success = Math.random() > 0.3; // 70% success rate
            const responseTime = Math.floor(Math.random() * 1000) + 50;
            
            if (success) {
                alert(`Ping do ${integration.name} - Sukces (${responseTime}ms)`);
            } else {
                alert(`Ping do ${integration.name} - Błąd (timeout)`);
            }
        }
    }

    syncData() {
        const activeIntegrations = Array.from(this.core.getIntegrationSettings.values())
            .filter(integration => integration.status === 'active');
        
        if (activeIntegrations.length === 0) {
            alert('Brak aktywnych integracji do synchronizacji');
            return;
        }
        
        // Simulate data synchronization
        const syncPromises = activeIntegrations.map(integration => 
            this.simulateSync(integration)
        );
        
        Promise.all(syncPromises).then(results => {
            const successCount = results.filter(r => r.success).length;
            alert(`Synchronizacja zakończona: ${successCount}/${results.length} integracji zsynchronizowano pomyślnie`);
        });
    }

    simulateSync(integration) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const success = Math.random() > 0.1; // 90% success rate
                resolve({
                    integration: integration.name,
                    success: success,
                    recordCount: success ? Math.floor(Math.random() * 50) + 1 : 0
                });
            }, Math.random() * 2000 + 500);
        });
    }

    refreshDisplay() {
        const content = document.getElementById('menu-content');
        if (content && content.innerHTML.includes('integration-settings')) {
            content.innerHTML = this.getSettingsIntegrationHTML();
        }
    }

    showSettingsIntegration() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getSettingsIntegrationHTML();
        }
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsIntegration;
}

console.log('✅ Settings Integration Module loaded');
