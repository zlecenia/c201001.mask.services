/**
 * MASKSERVICE C20 - Inline Dialog Module
 * Replaces browser alert/confirm/prompt dialogs with inline horizontal forms
 */

class InlineDialog {
    constructor() {
        this.activeDialogs = new Map();
        this.dialogCounter = 0;
        this.animations = true;
        this.autoClose = true;
        this.defaultTimeout = 5000;
        
        this.init();
    }

    init() {
        console.log('💬 InlineDialog system initialized');
        this.injectStyles();
        this.createDialogContainer();
        
        // Replace global dialog functions
        this.replaceGlobalDialogs();
    }

    /**
     * Inject CSS styles for inline dialogs
     */
    injectStyles() {
        const styles = `
            .inline-dialog-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                pointer-events: none;
            }

            .inline-dialog {
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                margin-bottom: 10px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                pointer-events: all;
                font-family: inherit;
                font-size: 14px;
            }

            .inline-dialog.show {
                opacity: 1;
                transform: translateX(0);
            }

            .inline-dialog-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                border-bottom: 1px solid #eee;
                background: #f8f9fa;
                border-radius: 7px 7px 0 0;
            }

            .inline-dialog-title {
                font-weight: 600;
                color: #333;
                margin: 0;
                font-size: 14px;
            }

            .inline-dialog-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
                border-radius: 3px;
            }

            .inline-dialog-close:hover {
                background: #e9ecef;
                color: #333;
            }

            .inline-dialog-body {
                padding: 16px;
            }

            .inline-dialog-message {
                margin: 0 0 12px 0;
                color: #555;
                line-height: 1.4;
            }

            .inline-dialog-form {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .inline-dialog-form-row {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }

            .inline-dialog-input {
                flex: 1;
                padding: 6px 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 13px;
                min-width: 100px;
            }

            .inline-dialog-input:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
            }

            .inline-dialog-label {
                font-weight: 500;
                color: #333;
                white-space: nowrap;
                min-width: fit-content;
            }

            .inline-dialog-actions {
                display: flex;
                gap: 8px;
                justify-content: flex-end;
                margin-top: 12px;
            }

            .inline-dialog-btn {
                padding: 6px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: #fff;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
            }

            .inline-dialog-btn:hover {
                background: #f8f9fa;
            }

            .inline-dialog-btn-primary {
                background: #007bff;
                color: white;
                border-color: #007bff;
            }

            .inline-dialog-btn-primary:hover {
                background: #0056b3;
                border-color: #004085;
            }

            .inline-dialog-btn-danger {
                background: #dc3545;
                color: white;
                border-color: #dc3545;
            }

            .inline-dialog-btn-danger:hover {
                background: #c82333;
                border-color: #bd2130;
            }

            .inline-dialog-btn-success {
                background: #28a745;
                color: white;
                border-color: #28a745;
            }

            .inline-dialog-btn-success:hover {
                background: #218838;
                border-color: #1e7e34;
            }

            .inline-dialog.type-success {
                border-left: 4px solid #28a745;
            }

            .inline-dialog.type-error {
                border-left: 4px solid #dc3545;
            }

            .inline-dialog.type-warning {
                border-left: 4px solid #ffc107;
            }

            .inline-dialog.type-info {
                border-left: 4px solid #17a2b8;
            }

            .inline-dialog.type-confirm {
                border-left: 4px solid #6f42c1;
            }

            .inline-dialog-progress {
                height: 3px;
                background: #e9ecef;
                border-radius: 0 0 7px 7px;
                overflow: hidden;
            }

            .inline-dialog-progress-bar {
                height: 100%;
                background: #007bff;
                width: 0%;
                transition: width linear;
            }

            @media (max-width: 480px) {
                .inline-dialog-container {
                    left: 10px;
                    right: 10px;
                    top: 10px;
                    max-width: none;
                }
                
                .inline-dialog-form-row {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .inline-dialog-actions {
                    flex-direction: column;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    /**
     * Create dialog container
     */
    createDialogContainer() {
        const container = document.createElement('div');
        container.className = 'inline-dialog-container';
        container.id = 'inline-dialog-container';
        document.body.appendChild(container);
    }

    /**
     * Replace global dialog functions
     */
    replaceGlobalDialogs() {
        // Store original functions
        window._originalAlert = window.alert;
        window._originalConfirm = window.confirm;
        window._originalPrompt = window.prompt;

        // Replace with inline versions
        window.alert = (message) => this.showAlert(message);
        window.confirm = (message) => this.showConfirm(message);
        window.prompt = (message, defaultValue) => this.showPrompt(message, defaultValue);
    }

    /**
     * Show alert dialog
     * @param {string} message - Alert message
     * @param {Object} options - Options
     * @returns {Promise} Promise that resolves when dismissed
     */
    showAlert(message, options = {}) {
        return new Promise((resolve) => {
            const dialog = this.createDialog({
                type: 'alert',
                title: options.title || 'Informacja',
                message,
                buttons: [
                    { text: 'OK', type: 'primary', action: () => resolve() }
                ],
                ...options
            });

            if (options.autoClose !== false) {
                setTimeout(() => {
                    this.closeDialog(dialog.id);
                    resolve();
                }, options.timeout || this.defaultTimeout);
            }
        });
    }

    /**
     * Show confirm dialog
     * @param {string} message - Confirm message
     * @param {Object} options - Options
     * @returns {Promise<boolean>} Promise that resolves to true/false
     */
    showConfirm(message, options = {}) {
        return new Promise((resolve) => {
            const dialog = this.createDialog({
                type: 'confirm',
                title: options.title || 'Potwierdzenie',
                message,
                buttons: [
                    { text: 'Anuluj', type: 'secondary', action: () => resolve(false) },
                    { text: 'OK', type: 'primary', action: () => resolve(true) }
                ],
                autoClose: false,
                ...options
            });
        });
    }

    /**
     * Show prompt dialog
     * @param {string} message - Prompt message
     * @param {string} defaultValue - Default input value
     * @param {Object} options - Options
     * @returns {Promise<string|null>} Promise that resolves to input value or null
     */
    showPrompt(message, defaultValue = '', options = {}) {
        return new Promise((resolve) => {
            const inputId = `prompt-input-${Date.now()}`;
            
            const dialog = this.createDialog({
                type: 'prompt',
                title: options.title || 'Wprowadź dane',
                message,
                body: `
                    <div class="inline-dialog-form">
                        <div class="inline-dialog-form-row">
                            <input type="text" 
                                   class="inline-dialog-input" 
                                   id="${inputId}" 
                                   value="${defaultValue}" 
                                   placeholder="${options.placeholder || ''}"
                                   maxlength="${options.maxLength || 255}">
                        </div>
                    </div>
                `,
                buttons: [
                    { text: 'Anuluj', type: 'secondary', action: () => resolve(null) },
                    { text: 'OK', type: 'primary', action: () => {
                        const input = document.getElementById(inputId);
                        resolve(input ? input.value : null);
                    }}
                ],
                autoClose: false,
                onShow: () => {
                    const input = document.getElementById(inputId);
                    if (input) {
                        input.focus();
                        input.select();
                    }
                },
                ...options
            });

            // Handle Enter key
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        resolve(input.value);
                        this.closeDialog(dialog.id);
                    } else if (e.key === 'Escape') {
                        resolve(null);
                        this.closeDialog(dialog.id);
                    }
                });
            }
        });
    }

    /**
     * Show custom form dialog
     * @param {Object} config - Form configuration
     * @returns {Promise<Object|null>} Promise that resolves to form data or null
     */
    showForm(config) {
        return new Promise((resolve) => {
            const formId = `form-${Date.now()}`;
            const fields = config.fields || [];
            
            const formHTML = `
                <form class="inline-dialog-form" id="${formId}">
                    ${fields.map(field => this.generateFormField(field)).join('')}
                </form>
            `;

            const dialog = this.createDialog({
                type: 'form',
                title: config.title || 'Formularz',
                message: config.message || '',
                body: formHTML,
                buttons: [
                    { text: 'Anuluj', type: 'secondary', action: () => resolve(null) },
                    { text: 'Zapisz', type: 'primary', action: () => {
                        const formData = this.getFormData(formId);
                        resolve(formData);
                    }}
                ],
                autoClose: false,
                onShow: () => {
                    const firstInput = document.querySelector(`#${formId} input, #${formId} select, #${formId} textarea`);
                    if (firstInput) firstInput.focus();
                },
                ...config
            });

            // Handle form submission
            const form = document.getElementById(formId);
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const formData = this.getFormData(formId);
                    resolve(formData);
                    this.closeDialog(dialog.id);
                });
            }
        });
    }

    /**
     * Generate form field HTML
     * @param {Object} field - Field configuration
     * @returns {string} Field HTML
     */
    generateFormField(field) {
        const { type, name, label, value = '', placeholder = '', required = false, options = [] } = field;
        
        let fieldHTML = '';
        
        switch (type) {
            case 'text':
            case 'number':
            case 'date':
            case 'email':
                fieldHTML = `
                    <div class="inline-dialog-form-row">
                        <label class="inline-dialog-label">${label}:</label>
                        <input type="${type}" 
                               name="${name}" 
                               class="inline-dialog-input"
                               value="${value}"
                               placeholder="${placeholder}"
                               ${required ? 'required' : ''}>
                    </div>
                `;
                break;
                
            case 'select':
                fieldHTML = `
                    <div class="inline-dialog-form-row">
                        <label class="inline-dialog-label">${label}:</label>
                        <select name="${name}" class="inline-dialog-input" ${required ? 'required' : ''}>
                            ${options.map(opt => 
                                `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.text}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;
                break;
                
            case 'checkbox':
                fieldHTML = `
                    <div class="inline-dialog-form-row">
                        <label class="inline-dialog-label">
                            <input type="checkbox" 
                                   name="${name}" 
                                   value="true"
                                   ${value ? 'checked' : ''}>
                            ${label}
                        </label>
                    </div>
                `;
                break;
                
            case 'textarea':
                fieldHTML = `
                    <div class="inline-dialog-form-row">
                        <label class="inline-dialog-label">${label}:</label>
                        <textarea name="${name}" 
                                  class="inline-dialog-input"
                                  placeholder="${placeholder}"
                                  rows="3"
                                  ${required ? 'required' : ''}>${value}</textarea>
                    </div>
                `;
                break;
        }
        
        return fieldHTML;
    }

    /**
     * Get form data
     * @param {string} formId - Form ID
     * @returns {Object} Form data
     */
    getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};
        
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    /**
     * Create dialog element
     * @param {Object} config - Dialog configuration
     * @returns {Object} Dialog info
     */
    createDialog(config) {
        const dialogId = `dialog-${++this.dialogCounter}`;
        const container = document.getElementById('inline-dialog-container');
        
        const dialog = document.createElement('div');
        dialog.className = `inline-dialog type-${config.type}`;
        dialog.id = dialogId;
        
        dialog.innerHTML = `
            <div class="inline-dialog-header">
                <h4 class="inline-dialog-title">${config.title}</h4>
                <button class="inline-dialog-close" data-action="close">×</button>
            </div>
            <div class="inline-dialog-body">
                ${config.message ? `<p class="inline-dialog-message">${config.message}</p>` : ''}
                ${config.body || ''}
                ${config.buttons ? this.generateButtons(dialogId, config.buttons) : ''}
            </div>
            ${config.autoClose !== false && config.timeout ? this.generateProgressBar(config.timeout) : ''}
        `;

        container.appendChild(dialog);
        
        // Store dialog info
        this.activeDialogs.set(dialogId, {
            id: dialogId,
            element: dialog,
            config
        });

        // Add event listeners
        this.attachDialogEvents(dialogId);
        
        // Show dialog with animation
        setTimeout(() => {
            dialog.classList.add('show');
            if (config.onShow) config.onShow();
        }, 10);

        // Auto-close if configured
        if (config.autoClose !== false && config.timeout) {
            setTimeout(() => {
                this.closeDialog(dialogId);
            }, config.timeout);
        }

        return { id: dialogId, element: dialog };
    }

    /**
     * Generate buttons HTML
     * @param {string} dialogId - Dialog ID
     * @param {Array} buttons - Button configurations
     * @returns {string} Buttons HTML
     */
    generateButtons(dialogId, buttons) {
        return `
            <div class="inline-dialog-actions">
                ${buttons.map((btn, index) => `
                    <button class="inline-dialog-btn inline-dialog-btn-${btn.type || 'secondary'}"
                            data-action="button"
                            data-index="${index}">
                        ${btn.text}
                    </button>
                `).join('')}
            </div>
        `;
    }

    /**
     * Generate progress bar HTML
     * @param {number} timeout - Timeout in ms
     * @returns {string} Progress bar HTML
     */
    generateProgressBar(timeout) {
        return `
            <div class="inline-dialog-progress">
                <div class="inline-dialog-progress-bar" style="animation: progress-countdown ${timeout}ms linear;"></div>
            </div>
            <style>
                @keyframes progress-countdown {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            </style>
        `;
    }

    /**
     * Attach event listeners to dialog
     * @param {string} dialogId - Dialog ID
     */
    attachDialogEvents(dialogId) {
        const dialogInfo = this.activeDialogs.get(dialogId);
        if (!dialogInfo) return;

        const dialog = dialogInfo.element;
        const config = dialogInfo.config;

        dialog.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            
            if (action === 'close') {
                this.closeDialog(dialogId);
            } else if (action === 'button') {
                const index = parseInt(e.target.dataset.index);
                const button = config.buttons[index];
                
                if (button && button.action) {
                    button.action();
                }
                
                this.closeDialog(dialogId);
            }
        });

        // Close on Escape key
        const keyHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeDialog(dialogId);
                document.removeEventListener('keydown', keyHandler);
            }
        };
        
        document.addEventListener('keydown', keyHandler);
    }

    /**
     * Close dialog
     * @param {string} dialogId - Dialog ID
     */
    closeDialog(dialogId) {
        const dialogInfo = this.activeDialogs.get(dialogId);
        if (!dialogInfo) return;

        const dialog = dialogInfo.element;
        
        // Animate out
        dialog.classList.remove('show');
        
        setTimeout(() => {
            if (dialog.parentNode) {
                dialog.parentNode.removeChild(dialog);
            }
            this.activeDialogs.delete(dialogId);
        }, 300);
    }

    /**
     * Close all dialogs
     */
    closeAllDialogs() {
        const dialogIds = Array.from(this.activeDialogs.keys());
        dialogIds.forEach(id => this.closeDialog(id));
    }

    /**
     * Restore original dialog functions
     */
    restoreOriginalDialogs() {
        if (window._originalAlert) window.alert = window._originalAlert;
        if (window._originalConfirm) window.confirm = window._originalConfirm;
        if (window._originalPrompt) window.prompt = window._originalPrompt;
        
        console.log('🔄 Original dialog functions restored');
    }

    /**
     * Get dialog statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            activeDialogs: this.activeDialogs.size,
            totalDialogsCreated: this.dialogCounter
        };
    }

    /**
     * Destroy inline dialog system
     */
    destroy() {
        this.closeAllDialogs();
        this.restoreOriginalDialogs();
        
        const container = document.getElementById('inline-dialog-container');
        if (container) container.remove();
        
        console.log('🗑️ InlineDialog system destroyed');
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.InlineDialog = InlineDialog;
    
    // Auto-initialize
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.inlineDialog) {
            window.inlineDialog = new InlineDialog();
        }
    });
}

console.log('✅ Inline Dialog Module loaded');
