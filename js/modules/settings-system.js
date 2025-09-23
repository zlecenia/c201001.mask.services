/**
 * MASKSERVICE C20 - Settings System Module
 * System configuration management functionality
 * @version 1.0.0
 * @author MASKSERVICE Team
 */

class SettingsSystem {
    constructor(settingsCore) {
        this.core = settingsCore;
    }

    // Settings System HTML template (focused on system configuration)
    getSettingsSystemHTML() {
        return `
            <div class="system-settings-enhanced">
                <div class="settings-header">
                    <h2>Konfiguracja systemu</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="settingsSystem.saveSystemConfig()">
                            💾 Zapisz konfigurację
                        </button>
                        <button class="btn btn-secondary" onclick="settingsSystem.resetToDefaults()">
                            🔄 Przywróć domyślne
                        </button>
                        <button class="btn btn-warning" onclick="settingsSystem.restartSystem()">
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
                            <div class="config-item">
                                <label>Waluta systemu:</label>
                                <select id="system-currency">
                                    <option value="PLN">PLN (zł)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                        </div>

                        <div class="config-section">
                            <h3>🔒 Bezpieczeństwo</h3>
                            <div class="config-item">
                                <label>Timeout sesji (minuty):</label>
                                <input type="number" value="30" min="5" max="480" id="session-timeout">
                            </div>
                            <div class="config-item">
                                <label>Wymagaj silnych haseł:</label>
                                <input type="checkbox" checked id="strong-passwords">
                            </div>
                            <div class="config-item">
                                <label>Logowanie działań:</label>
                                <input type="checkbox" checked id="audit-logging">
                            </div>
                            <div class="config-item">
                                <label>Dwuskładnikowa autoryzacja:</label>
                                <input type="checkbox" id="two-factor-auth">
                            </div>
                            <div class="config-item">
                                <label>Maksymalne próby logowania:</label>
                                <input type="number" value="3" min="1" max="10" id="max-login-attempts">
                            </div>
                        </div>

                        <div class="config-section">
                            <h3>📊 Wydajność</h3>
                            <div class="config-item">
                                <label>Interwał odświeżania danych (sekundy):</label>
                                <input type="number" value="5" min="1" max="60" id="data-refresh-interval">
                            </div>
                            <div class="config-item">
                                <label>Maksymalna liczba równoczesnych testów:</label>
                                <input type="number" value="4" min="1" max="10" id="max-concurrent-tests">
                            </div>
                            <div class="config-item">
                                <label>Cache raportów (dni):</label>
                                <input type="number" value="30" min="1" max="365" id="report-cache-days">
                            </div>
                            <div class="config-item">
                                <label>Automatyczne archiwizowanie:</label>
                                <input type="checkbox" checked id="auto-archive">
                            </div>
                        </div>

                        <div class="config-section">
                            <h3>💾 Backup i archiwizacja</h3>
                            <div class="config-item">
                                <label>Automatyczny backup:</label>
                                <input type="checkbox" checked id="auto-backup">
                            </div>
                            <div class="config-item">
                                <label>Częstotliwość backup:</label>
                                <select id="backup-frequency">
                                    <option value="daily">Codziennie</option>
                                    <option value="weekly" selected>Tygodniowo</option>
                                    <option value="monthly">Miesięcznie</option>
                                </select>
                            </div>
                            <div class="config-item">
                                <label>Okres przechowywania danych (lata):</label>
                                <input type="number" value="7" min="1" max="25" id="data-retention">
                            </div>
                            <div class="config-item">
                                <label>Lokalizacja backupu:</label>
                                <input type="text" value="/var/backups/maskservice" id="backup-location">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- System Status -->
                <div class="system-status">
                    <h3>Status systemu</h3>
                    <div class="status-overview">
                        ${this.getSystemStatusHTML()}
                    </div>
                </div>

                <!-- System Information -->
                <div class="system-information">
                    <h3>Informacje o systemie</h3>
                    <div class="info-grid">
                        ${this.getSystemInfoHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    getSystemStatusHTML() {
        // Simulate system status
        const status = {
            memory: { used: 68, total: 16384 },
            disk: { used: 45, total: 512000 },
            cpu: { load: 23 },
            network: { status: 'connected' },
            uptime: '15 days, 3 hours'
        };

        return `
            <div class="status-card">
                <div class="status-title">💾 Pamięć</div>
                <div class="status-value">${status.memory.used}% używane</div>
                <div class="status-detail">${Math.round(status.memory.total * status.memory.used / 100)} MB / ${status.memory.total} MB</div>
            </div>
            <div class="status-card">
                <div class="status-title">💿 Dysk</div>
                <div class="status-value">${status.disk.used}% używane</div>
                <div class="status-detail">${Math.round(status.disk.total * status.disk.used / 100)} MB / ${status.disk.total} MB</div>
            </div>
            <div class="status-card">
                <div class="status-title">🔄 CPU</div>
                <div class="status-value">${status.cpu.load}% obciążenie</div>
                <div class="status-detail">Średnie obciążenie</div>
            </div>
            <div class="status-card">
                <div class="status-title">🌐 Sieć</div>
                <div class="status-value">Połączono</div>
                <div class="status-detail">Stabilne połączenie</div>
            </div>
            <div class="status-card">
                <div class="status-title">⏱️ Czas pracy</div>
                <div class="status-value">${status.uptime}</div>
                <div class="status-detail">Od ostatniego restartu</div>
            </div>
        `;
    }

    getSystemInfoHTML() {
        const systemConfig = this.core.getSystemConfig();
        return `
            <div class="info-item">
                <span class="info-label">Wersja systemu:</span>
                <span class="info-value">${systemConfig.system.version}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Nazwa systemu:</span>
                <span class="info-value">${systemConfig.system.name}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Język systemu:</span>
                <span class="info-value">${systemConfig.system.language.toUpperCase()}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Strefa czasowa:</span>
                <span class="info-value">${systemConfig.system.timezone}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Ostatni backup:</span>
                <span class="info-value">${new Date(Date.now() - 86400000).toLocaleString()}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Aktywne integracje:</span>
                <span class="info-value">${this.getActiveIntegrationsCount()}</span>
            </div>
        `;
    }

    getActiveIntegrationsCount() {
        const integrations = this.core.getIntegrationSettings();
        return Array.from(integrations.values()).filter(i => i.status === 'active').length;
    }

    // System management methods
    saveSystemConfig() {
        const systemConfig = this.core.getSystemConfig();
        
        // Get values from form
        const systemName = document.getElementById('system-name')?.value;
        const defaultLanguage = document.getElementById('default-language')?.value;
        const timezone = document.getElementById('timezone')?.value;
        const currency = document.getElementById('system-currency')?.value;
        const sessionTimeout = parseInt(document.getElementById('session-timeout')?.value);
        const strongPasswords = document.getElementById('strong-passwords')?.checked;
        const auditLogging = document.getElementById('audit-logging')?.checked;
        const twoFactorAuth = document.getElementById('two-factor-auth')?.checked;
        const maxLoginAttempts = parseInt(document.getElementById('max-login-attempts')?.value);
        const dataRefreshInterval = parseInt(document.getElementById('data-refresh-interval')?.value);
        const maxConcurrentTests = parseInt(document.getElementById('max-concurrent-tests')?.value);
        const reportCacheDays = parseInt(document.getElementById('report-cache-days')?.value);
        const autoArchive = document.getElementById('auto-archive')?.checked;
        const autoBackup = document.getElementById('auto-backup')?.checked;
        const backupFrequency = document.getElementById('backup-frequency')?.value;
        const dataRetention = parseInt(document.getElementById('data-retention')?.value);
        const backupLocation = document.getElementById('backup-location')?.value;

        // Update system configuration
        if (systemName) systemConfig.system.name = systemName;
        if (defaultLanguage) systemConfig.system.language = defaultLanguage;
        if (timezone) systemConfig.system.timezone = timezone;
        if (currency) systemConfig.system.currency = currency;
        
        if (sessionTimeout) systemConfig.security.sessionTimeout = sessionTimeout;
        systemConfig.security.strongPasswords = strongPasswords;
        systemConfig.security.auditLogging = auditLogging;
        systemConfig.security.twoFactorAuth = twoFactorAuth;
        if (maxLoginAttempts) systemConfig.security.maxLoginAttempts = maxLoginAttempts;
        
        if (dataRefreshInterval) systemConfig.performance.dataRefreshInterval = dataRefreshInterval;
        if (maxConcurrentTests) systemConfig.performance.maxConcurrentTests = maxConcurrentTests;
        if (reportCacheDays) systemConfig.performance.reportCache = reportCacheDays;
        systemConfig.performance.autoArchive = autoArchive;
        
        systemConfig.backup.automatic = autoBackup;
        if (backupFrequency) systemConfig.backup.frequency = backupFrequency;
        if (dataRetention) systemConfig.backup.retention = dataRetention;
        if (backupLocation) systemConfig.backup.location = backupLocation;

        // Save configuration
        this.core.saveConfig();
        
        // Update global config if currency changed
        if (currency && window.config) {
            window.config.currency = currency;
        }
        
        alert('Konfiguracja systemu została zapisana pomyślnie!');
    }

    resetToDefaults() {
        if (confirm('Czy na pewno chcesz przywrócić domyślne ustawienia systemu? Ta operacja nie może zostać cofnięta.')) {
            // Reset to default configuration
            const systemConfig = this.core.getSystemConfig();
            
            systemConfig.system = {
                name: 'MASKTRONIC C20',
                version: '1.0.1',
                language: 'pl',
                timezone: 'Europe/Warsaw',
                currency: 'PLN'
            };
            
            systemConfig.security = {
                sessionTimeout: 30,
                strongPasswords: true,
                auditLogging: true,
                twoFactorAuth: false,
                maxLoginAttempts: 3
            };
            
            systemConfig.performance = {
                dataRefreshInterval: 5,
                maxConcurrentTests: 4,
                reportCache: 30,
                autoArchive: true
            };
            
            systemConfig.backup = {
                automatic: true,
                frequency: 'weekly',
                retention: 7,
                location: '/var/backups/maskservice'
            };
            
            this.core.saveConfig();
            this.refreshDisplay();
            alert('Ustawienia systemu zostały przywrócone do wartości domyślnych');
        }
    }

    restartSystem() {
        if (confirm('Czy na pewno chcesz zrestartować system? Wszystkie aktywne testy zostaną zatrzymane.')) {
            // Show restart progress
            this.showRestartProgress();
        }
    }

    showRestartProgress() {
        const overlay = document.createElement('div');
        overlay.className = 'restart-overlay';
        overlay.innerHTML = `
            <div class="restart-modal">
                <h3>🔄 Restart systemu</h3>
                <div class="restart-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="restart-progress"></div>
                    </div>
                    <div class="restart-status" id="restart-status">Przygotowanie do restartu...</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Simulate restart process
        let progress = 0;
        const steps = [
            'Zapisywanie konfiguracji...',
            'Zatrzymywanie aktywnych testów...',
            'Zamykanie połączeń...',
            'Restartowanie usług...',
            'Uruchamianie systemu...',
            'Sprawdzanie integracji...',
            'System gotowy!'
        ];
        
        const interval = setInterval(() => {
            progress += 100 / steps.length;
            const currentStep = Math.floor(progress / (100 / steps.length));
            
            document.getElementById('restart-progress').style.width = progress + '%';
            document.getElementById('restart-status').textContent = steps[currentStep] || steps[steps.length - 1];
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    document.body.removeChild(overlay);
                    alert('System został pomyślnie zrestartowany!');
                    // Refresh the page to simulate restart
                    window.location.reload();
                }, 1000);
            }
        }, 800);
    }

    exportSystemConfig() {
        const config = {
            timestamp: new Date().toISOString(),
            version: this.core.getSystemConfig().system.version,
            system: this.core.getSystemConfig()
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Konfiguracja systemu została wyeksportowana');
    }

    importSystemConfig() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const config = JSON.parse(e.target.result);
                        if (config.system) {
                            // Validate and import configuration
                            this.validateAndImportConfig(config.system);
                        } else {
                            alert('Nieprawidłowy format pliku konfiguracji');
                        }
                    } catch (error) {
                        alert('Błąd podczas importu: nieprawidłowy format JSON');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    validateAndImportConfig(config) {
        if (confirm('Czy na pewno chcesz zaimportować nową konfigurację? Obecne ustawienia zostaną zastąpione.')) {
            const systemConfig = this.core.getSystemConfig();
            
            // Merge imported configuration
            Object.assign(systemConfig, config);
            
            this.core.saveConfig();
            this.refreshDisplay();
            alert('Konfiguracja została zaimportowana pomyślnie!');
        }
    }

    refreshDisplay() {
        const content = document.getElementById('menu-content');
        if (content && content.innerHTML.includes('system-configuration')) {
            content.innerHTML = this.getSettingsSystemHTML();
        }
    }

    showSettingsSystem() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getSettingsSystemHTML();
        }
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsSystem;
}

console.log('✅ Settings System Module loaded');
