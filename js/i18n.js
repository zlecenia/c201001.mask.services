/**
 * MASKSERVICE C20 - Internationalization Module
 * CSS-like translation system - maps classes and IDs to translation keys
 */

class I18nManager {
    constructor() {
        this.currentLanguage = 'pl'; // Default language
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.translationMappings = {};
        this.initializeMappings();
    }

    /**
     * Initialize CSS-like mappings of HTML elements to translation keys
     * Similar to CSS selectors: #id, .class, element[attribute]
     */
    initializeMappings() {
        this.translationMappings = {
            // Page title
            'title': 'global.title',
            
            // Header elements
            '.logo': 'global.company',
            '.hardware': 'global.hardware', 
            '.product': 'global.product',
            '.software': 'global.version',
            '#status-text': 'global.offline',
            
            // Login screen
            '.menu-header:contains("LOGIN")': 'login.menu_header',
            '#login-scanner-btn': 'login.scanner',
            '#login-keyword-btn': 'login.keyword',
            'h2:contains("User Login By Keyword")': 'login.user_login_by_keyword',
            'h2:contains("User Login by QR-CODE")': 'login.user_login_by_scanner',
            '#password-input[placeholder]': 'login.password_placeholder',
            '#login-operator-btn': 'login.login_as_operator',
            '#login-admin-btn': 'login.login_as_admin',
            '#login-superuser-btn': 'login.login_as_superuser',
            '#login-serwisant-btn': 'login.login_as_serwisant',
            
            // Virtual keyboard
            '#key-caps': 'keyboard.caps',
            '#key-shift': 'keyboard.shift',
            '#key-tab': 'keyboard.tab',
            '#key-space': 'keyboard.space',
            '#key-clear': 'keyboard.clear',
            '#key-enter': 'keyboard.enter',
            '#key-toggle': 'keyboard.toggle',
            
            // Menu system
            '.menu-header:contains("USER")': 'menu.user_menu',
            'h2:contains("Wybierz opcję")': 'menu.welcome',
            'p:contains("System gotowy")': 'menu.system_ready',
            'span:contains("Inactive")': 'menu.inactive',
            'button:contains("Logout")': 'menu.logout',
            
            // Menu items (by data-key attribute)
            '[data-menu-key="test_menu"]': 'menu.test_menu',
            '[data-menu-key="user_data"]': 'menu.user_data',
            '[data-menu-key="realtime_sensors"]': 'menu.realtime_sensors',
            '[data-menu-key="device_history"]': 'menu.device_history',
            '[data-menu-key="reports_view"]': 'menu.reports_view',
            '[data-menu-key="reports_batch"]': 'menu.reports_batch',
            '[data-menu-key="reports_schedule"]': 'menu.reports_schedule',
            '[data-menu-key="workshop_parts"]': 'menu.workshop_parts',
            '[data-menu-key="workshop_maintenance"]': 'menu.workshop_maintenance',
            '[data-menu-key="workshop_tools"]': 'menu.workshop_tools',
            '[data-menu-key="workshop_inventory"]': 'menu.workshop_inventory',
            '[data-menu-key="users"]': 'menu.users',
            '[data-menu-key="service_menu"]': 'menu.service_menu',
            '[data-menu-key="system_settings"]': 'menu.system_settings',
            '[data-menu-key="advanced_diagnostics"]': 'menu.advanced_diagnostics',
            
            // System screen
            'h1:contains("Welcome")': 'system.welcome',
            'p:contains("System starting")': 'system.system_starting',
            '.system-logo:contains("MASKTRONIC")': 'system.masktronic',
            
            // Data sensors
            'h3:contains("DATA SENSORS")': 'data.sensors',
            'h4:contains("PRESSURE")': 'data.pressure',
            '.pressure-label:contains("Low")': 'data.low',
            '.pressure-label:contains("Medium")': 'data.medium',
            '.pressure-label:contains("High")': 'data.high',
            
            // Settings
            'h3:contains("Device Settings")': 'settings.device_settings',
            'h3:contains("Network Configuration")': 'settings.network_config',
            'h3:contains("System Configuration")': 'settings.system_config',
            'label:contains("Update Interval")': 'settings.update_interval',
            'label:contains("Debug Mode")': 'settings.debug_mode',
            'button:contains("Save Settings")': 'settings.save_settings',
            
            // Role badges
            '.role-badge[data-role="OPERATOR"]': 'roles.OPERATOR',
            '.role-badge[data-role="ADMIN"]': 'roles.ADMIN',
            '.role-badge[data-role="SUPERUSER"]': 'roles.SUPERUSER',
            '.role-badge[data-role="SERWISANT"]': 'roles.SERWISANT'
        };
    }

    /**
     * Load translation file for specified language
     */
    async loadLanguage(language) {
        try {
            const response = await fetch(`/locales/${language}.json?v=${Date.now()}`);
            if (response.ok) {
                this.translations[language] = await response.json();
                console.log(`✅ Translations loaded for language: ${language}`);
                return true;
            } else {
                console.error(`❌ Failed to load translations for: ${language}`);
                return false;
            }
        } catch (error) {
            console.error(`❌ Error loading translations for ${language}:`, error);
            return false;
        }
    }

    /**
     * Get translation for a key in current language
     */
    t(key, params = {}) {
        const translation = this.getNestedValue(this.translations[this.currentLanguage], key) ||
                          this.getNestedValue(this.translations[this.fallbackLanguage], key) ||
                          key;
        
        // Replace parameters in translation
        return this.replaceParams(translation, params);
    }

    /**
     * Get nested value from object using dot notation
     */
    getNestedValue(obj, path) {
        if (!obj) return null;
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Replace parameters in translation string
     */
    replaceParams(text, params) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => params[key] || match);
    }

    /**
     * Apply translations to DOM elements using CSS-like selectors
     */
    applyTranslations() {
        console.log(`🌍 Applying translations for language: ${this.currentLanguage}`);
        
        // Update page title
        document.title = this.t('global.title');
        
        // Apply mappings using CSS-like selectors
        Object.entries(this.translationMappings).forEach(([selector, key]) => {
            this.applyTranslationToSelector(selector, key);
        });
        
        // Apply data-i18n attribute translations
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'password')) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Apply data-i18n-placeholder attribute translations
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            element.placeholder = translation;
        });
        
        // Apply data-i18n-title attribute translations
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.t(key);
            element.title = translation;
        });
        
        // Apply data-i18n-alt attribute translations
        document.querySelectorAll('[data-i18n-alt]').forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            const translation = this.t(key);
            element.alt = translation;
        });
        
        console.log(`✅ Translations applied successfully`);
    }

    /**
     * Apply translation to CSS-like selector
     */
    applyTranslationToSelector(selector, key) {
        try {
            // Handle special selectors
            if (selector === 'title') {
                document.title = this.t(key);
                return;
            }
            
            // Handle :contains() pseudo-selector
            if (selector.includes(':contains(')) {
                this.handleContainsSelector(selector, key);
                return;
            }
            
            // Handle attribute selectors
            if (selector.includes('[') && selector.includes(']')) {
                this.handleAttributeSelector(selector, key);
                return;
            }
            
            // Standard CSS selector
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const translation = this.t(key);
                if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            });
        } catch (error) {
            console.warn(`⚠️  Failed to apply translation for selector "${selector}":`, error);
        }
    }

    /**
     * Handle :contains() pseudo-selector
     */
    handleContainsSelector(selector, key) {
        const [baseSelector, containsText] = selector.split(':contains(');
        const searchText = containsText.replace(/[)"]/g, '');
        
        const elements = document.querySelectorAll(baseSelector);
        elements.forEach(element => {
            if (element.textContent.includes(searchText)) {
                element.textContent = this.t(key);
            }
        });
    }

    /**
     * Handle attribute selectors
     */
    handleAttributeSelector(selector, key) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            const translation = this.t(key);
            
            if (selector.includes('[placeholder]')) {
                element.placeholder = translation;
            } else if (selector.includes('[data-role]')) {
                element.textContent = translation;
            } else {
                element.textContent = translation;
            }
        });
    }

    /**
     * Change language and apply translations
     */
    async changeLanguage(language) {
        if (language === this.currentLanguage) {
            console.log(`🌍 Language ${language} already active`);
            return;
        }
        
        // Load language if not already loaded
        if (!this.translations[language]) {
            const loaded = await this.loadLanguage(language);
            if (!loaded) {
                console.error(`❌ Cannot change to language: ${language}`);
                return false;
            }
        }
        
        this.currentLanguage = language;
        this.applyTranslations();
        
        // Store language preference
        localStorage.setItem('preferred_language', language);
        
        // Update router URL to reflect language change - CRITICAL FIX!
        if (window.C20Router && typeof window.navigateTo === 'function') {
            const currentRoute = window.getCurrentRoute();
            if (currentRoute) {
                // Navigate to current view with new language and current action
                window.navigateTo(currentRoute.view, language, currentRoute.action);
            }
        }
        
        console.log(`✅ Language changed to: ${language}`);
        return true;
    }

    /**
     * Initialize i18n system
     */
    async init() {
        // Load preferred language from localStorage
        const storedLanguage = localStorage.getItem('preferred_language') || 'pl';
        
        // Load default language
        await this.loadLanguage(this.currentLanguage);
        
        // Load fallback language if different
        if (this.fallbackLanguage !== this.currentLanguage) {
            await this.loadLanguage(this.fallbackLanguage);
        }
        
        // Load preferred language if different
        if (storedLanguage !== this.currentLanguage) {
            await this.loadLanguage(storedLanguage);
            this.currentLanguage = storedLanguage;
        }
        
        // Apply initial translations
        this.applyTranslations();
        
        console.log('✅ I18n system initialized');
    }

    /**
     * Get available languages
     */
    getAvailableLanguages() {
        return [
            { code: 'pl', name: 'Polski', flag: '🇵🇱' },
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
        ];
    }
}

// Create global i18n manager instance
window.I18nManager = new I18nManager();

// Export functions for global access
window.t = (key, params) => window.I18nManager.t(key, params);
window.changeLanguage = (language) => window.I18nManager.changeLanguage(language);

console.log('✅ I18n Module initialized');
