/**
 * MASKTRONIC C20 - Utilities Module
 * Common utilities, helpers, and shared functions
 * Simple global class system - no AMD dependencies
 */

class Utils {
    constructor() {
        this.formatters = new Map();
        this.validators = new Map();
    }

    /**
     * Password visibility toggle
     */
    static togglePasswordVisibility() {
        const passwordInput = document.getElementById('password-input');
        const toggleButton = document.getElementById('password-toggle');
        
        if (!passwordInput || !toggleButton) {
            console.warn('Password input or toggle button not found');
            return;
        }

        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        
        // Update button text/icon
        toggleButton.textContent = isPassword ? '🙈' : '👁️';
        toggleButton.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        
        console.log(`Password visibility toggled: ${isPassword ? 'visible' : 'hidden'}`);
    }

    /**
     * Login method selection
     */
    static selectLoginMethod(method) {
        console.log('Selecting login method:', method);
        
        // Remove active class from all methods
        document.querySelectorAll('.login-method').forEach(m => {
            m.classList.remove('active');
        });
        
        // Add active class to selected method
        const selectedMethod = document.getElementById(`login-${method}`);
        if (selectedMethod) {
            selectedMethod.classList.add('active');
        }
        
        // Show appropriate input fields
        const passwordSection = document.getElementById('password-section');
        if (passwordSection) {
            passwordSection.style.display = method === 'password' ? 'block' : 'none';
        }
        
        // Focus password input if password method selected
        if (method === 'password') {
            const passwordInput = document.getElementById('password-input');
            if (passwordInput) {
                passwordInput.focus();
            }
        }
    }

    /**
     * Screen switching utility
     */
    static switchScreen(fromScreen, toScreen) {
        const fromElement = document.getElementById(fromScreen);
        const toElement = document.getElementById(toScreen);
        
        if (fromElement) {
            fromElement.classList.remove('active');
            console.log(`Hidden screen: ${fromScreen}`);
        }
        
        if (toElement) {
            toElement.classList.add('active');
            console.log(`Shown screen: ${toScreen}`);
        }
    }

    /**
     * Time formatting utilities
     */
    static formatTime(date = new Date()) {
        return date.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    static formatDate(date = new Date()) {
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    static formatDateTime(date = new Date()) {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    }

    /**
     * Input validation utilities
     */
    static validatePassword(password) {
        if (!password || password.trim().length === 0) {
            return { valid: false, error: 'Password cannot be empty' };
        }
        
        if (password.length < 3) {
            return { valid: false, error: 'Password must be at least 3 characters' };
        }
        
        return { valid: true };
    }

    static validateRole(role) {
        const validRoles = ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERVICEUSER'];
        return validRoles.includes(role);
    }

    /**
     * DOM utility functions
     */
    static getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with ID '${id}' not found`);
        }
        return element;
    }

    static createElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    }

    /**
     * Event utilities
     */
    static addEventListeners(element, events) {
        Object.entries(events).forEach(([eventType, handler]) => {
            element.addEventListener(eventType, handler);
        });
    }

    /**
     * Storage utilities
     */
    static saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }

    static loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return null;
        }
    }

    /**
     * Network utilities
     */
    static async fetchWithTimeout(url, options = {}, timeout = 5000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * Debug and logging utilities
     */
    static log(level, message, data = null) {
        const timestamp = this.formatTime();
        const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        
        switch (level.toLowerCase()) {
            case 'error':
                console.error(logMessage, data);
                break;
            case 'warn':
                console.warn(logMessage, data);
                break;
            case 'info':
                console.info(logMessage, data);
                break;
            default:
                console.log(logMessage, data);
        }
    }

    /**
     * Configuration utilities
     */
    static async loadConfig(configPath) {
        try {
            const response = await this.fetchWithTimeout(configPath);
            if (response.ok) {
                return await response.json();
            }
            throw new Error(`Failed to load config: ${response.status}`);
        } catch (error) {
            this.log('error', `Config loading failed: ${configPath}`, error);
            return null;
        }
    }
}

    // Create global utils instance for backwards compatibility
    window.Utils = Utils;

    // Export individual functions for HTML onclick handlers
    window.togglePasswordVisibility = Utils.togglePasswordVisibility;
    window.selectLoginMethod = Utils.selectLoginMethod;
    window.switchScreen = Utils.switchScreen;

    console.log('✅ Utils Module initialized');
