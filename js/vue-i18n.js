/**
 * MASKSERVICE C20 - Vue.js Compatible I18n System
 * Replaces legacy CSS selector-based i18n with Vue reactive translations
 * Post-migration integration layer for Vue components
 */

class VueI18nManager {
    constructor() {
        this.currentLanguage = 'pl'; // Default language
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.reactiveTranslations = Vue.reactive({});
        this.vueComponents = new Set();
        
        this.init();
    }

    /**
     * Load translation file for specified language
     */
    async loadLanguage(language) {
        if (this.translations[language]) {
            console.log(`🌍 Language ${language} already loaded`);
            return true;
        }

        try {
            const response = await fetch(`/locales/${language}.json`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const translations = await response.json();
            this.translations[language] = translations;
            
            // Update reactive translations for current language
            if (language === this.currentLanguage) {
                Object.assign(this.reactiveTranslations, translations);
            }

            console.log(`✅ Language loaded: ${language}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to load language ${language}:`, error);
            return false;
        }
    }

    /**
     * Get translation for a key in current language (Vue reactive)
     */
    t(key, params = {}) {
        // Try current language first
        let translation = this.getNestedValue(this.translations[this.currentLanguage], key);
        
        // Fallback to fallback language
        if (!translation && this.currentLanguage !== this.fallbackLanguage) {
            translation = this.getNestedValue(this.translations[this.fallbackLanguage], key);
        }
        
        // Return key if no translation found
        if (!translation) {
            console.warn(`⚠️ Translation missing: ${key}`);
            return key;
        }
        
        // Replace parameters
        return this.replaceParams(translation, params);
    }

    /**
     * Get nested value from object using dot notation
     */
    getNestedValue(obj, path) {
        if (!obj || !path) return null;
        
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    /**
     * Replace parameters in translation string
     */
    replaceParams(text, params) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * Change language and update all Vue components
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

        const oldLanguage = this.currentLanguage;
        this.currentLanguage = language;

        // Update reactive translations - this will automatically update Vue components
        Object.assign(this.reactiveTranslations, this.translations[language]);

        // Store language preference
        localStorage.setItem('preferred_language', language);

        // Update router URL to reflect language change
        if (window.C20Router && typeof window.navigateTo === 'function') {
            const currentRoute = window.getCurrentRoute();
            if (currentRoute && currentRoute.language !== language) {
                window.navigateTo(currentRoute.view, language, currentRoute.action);
            }
        }

        // Notify Vue app about language change
        if (window.MaskServiceVue && window.MaskServiceVue.updateLanguage) {
            window.MaskServiceVue.updateLanguage(language);
        }

        // Emit language change event for Vue components
        const event = new CustomEvent('languageChanged', {
            detail: { oldLanguage, newLanguage: language, translations: this.translations[language] }
        });
        document.dispatchEvent(event);

        console.log(`✅ Vue I18n: Language changed from ${oldLanguage} to ${language}`);
        return true;
    }

    /**
     * Register Vue component for i18n updates
     */
    registerVueComponent(component) {
        this.vueComponents.add(component);
        console.log(`📝 Vue component registered for i18n updates`);
    }

    /**
     * Unregister Vue component
     */
    unregisterVueComponent(component) {
        this.vueComponents.delete(component);
    }

    /**
     * Get reactive translation function for Vue components
     */
    getVueTranslationFunction() {
        return (key, params = {}) => {
            return this.t(key, params);
        };
    }

    /**
     * Get reactive translations object for Vue
     */
    getReactiveTranslations() {
        return this.reactiveTranslations;
    }

    /**
     * Initialize Vue i18n system
     */
    async init() {
        console.log('🔧 Initializing Vue I18n system...');

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

        // Initialize reactive translations
        Object.assign(this.reactiveTranslations, this.translations[this.currentLanguage] || {});

        console.log('✅ Vue I18n system initialized');
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

    /**
     * Create Vue i18n plugin
     */
    createVuePlugin() {
        const vueI18n = this;
        
        return {
            install(app) {
                // Provide i18n instance to all components
                app.provide('$i18n', vueI18n);
                
                // Global properties for components
                app.config.globalProperties.$t = (key, params) => vueI18n.t(key, params);
                app.config.globalProperties.$language = Vue.computed(() => vueI18n.currentLanguage);
                app.config.globalProperties.$changeLanguage = (lang) => vueI18n.changeLanguage(lang);
                
                console.log('✅ Vue I18n plugin installed');
            }
        };
    }

    /**
     * Legacy compatibility method for non-Vue code
     */
    applyTranslations() {
        console.warn('⚠️ applyTranslations() called - this is legacy method, Vue components handle translations automatically');
        
        // Apply basic translations to any remaining non-Vue elements
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                const translation = this.t(key);
                if (translation !== key) {
                    element.textContent = translation;
                }
            }
        });
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Check if language is loaded
     */
    isLanguageLoaded(language) {
        return !!this.translations[language];
    }
}

// Initialize global Vue I18n manager instance
const vueI18nManager = new VueI18nManager();

// Export to global scope with backward compatibility
window.VueI18nManager = vueI18nManager;
window.vueI18nManager = vueI18nManager;

// Replace legacy i18n with Vue-compatible version
window.i18nManager = vueI18nManager;
window.I18nManager = vueI18nManager;

// Global translation functions (backward compatibility)
window.t = (key, params) => vueI18nManager.t(key, params);
window.changeLanguage = (language) => vueI18nManager.changeLanguage(language);

console.log('✅ Vue I18n module loaded - Vue.js reactive translations enabled');
console.log('🔄 Legacy i18n replaced with Vue-compatible version');
