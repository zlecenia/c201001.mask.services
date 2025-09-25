/**
 * MASKSERVICE C20 - Runtime UI/Rendering Monitor
 * Real-time detection of blank screens, missing views, and rendering failures
 * Enhanced error logging for immediate diagnosis of Vue component issues
 */

class RuntimeUIMonitor {
    constructor() {
        this.isEnabled = true;
        this.lastActionTime = Date.now();
        this.expectedComponents = new Set();
        this.renderingHistory = [];
        this.criticalErrors = [];
        this.monitoringInterval = null;
        
        console.log('🔍 Runtime UI Monitor initialized - tracking Vue component rendering');
        this.startMonitoring();
    }

    /**
     * Start continuous monitoring of UI state
     */
    startMonitoring() {
        // Monitor every 500ms
        this.monitoringInterval = setInterval(() => {
            this.checkUIState();
        }, 500);

        // Monitor after user interactions
        this.setupUserActionMonitoring();
        
        // Monitor Vue component changes
        this.setupVueComponentMonitoring();
    }

    /**
     * Setup monitoring for user actions (clicks, navigation)
     */
    setupUserActionMonitoring() {
        // Monitor all button clicks
        document.addEventListener('click', (event) => {
            const target = event.target;
            if (target.tagName === 'BUTTON' || target.classList.contains('btn')) {
                this.onUserAction('button_click', {
                    element: target.outerHTML,
                    text: target.textContent,
                    timestamp: Date.now()
                });
            }
        });

        // Monitor form submissions
        document.addEventListener('submit', (event) => {
            this.onUserAction('form_submit', {
                form: event.target.outerHTML,
                timestamp: Date.now()
            });
        });

        // Monitor navigation changes
        window.addEventListener('popstate', (event) => {
            this.onUserAction('navigation', {
                state: event.state,
                timestamp: Date.now()
            });
        });
    }

    /**
     * Setup Vue component monitoring using MutationObserver
     */
    setupVueComponentMonitoring() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    this.onDOMChange(mutation);
                }
            });
        });

        observer.observe(document.getElementById('app'), {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-v-app']
        });
    }

    /**
     * Handle user action and schedule UI check
     */
    onUserAction(actionType, details) {
        this.lastActionTime = Date.now();
        
        console.log(`🎯 User action detected: ${actionType}`, details);
        
        // Schedule UI check after brief delay to allow Vue to render
        setTimeout(() => {
            this.checkUIStateAfterAction(actionType, details);
        }, 100);
        
        setTimeout(() => {
            this.checkUIStateAfterAction(actionType, details, true);
        }, 1000);
    }

    /**
     * Handle DOM changes
     */
    onDOMChange(mutation) {
        const addedNodes = Array.from(mutation.addedNodes);
        const removedNodes = Array.from(mutation.removedNodes);
        
        console.log('🔄 DOM Change detected:', {
            added: addedNodes.length,
            removed: removedNodes.length,
            target: mutation.target.tagName
        });

        // Check if Vue components were added/removed
        addedNodes.forEach(node => {
            if (node.nodeType === 1 && this.isVueComponent(node)) {
                console.log('✅ Vue component added:', node.tagName.toLowerCase());
            }
        });

        removedNodes.forEach(node => {
            if (node.nodeType === 1 && this.isVueComponent(node)) {
                console.error('❌ Vue component removed:', node.tagName.toLowerCase());
            }
        });
    }

    /**
     * Check if element is a Vue component
     */
    isVueComponent(element) {
        const vueComponentTags = [
            'loginscreen', 'usermenuscreen', 'systemscreen', 
            'testmenutemplate', 'systemsettingstemplate',
            'workshoptemplate', 'testreportstemplate',
            'devicedatatemplate', 'realtimesensorstemplate'
        ];
        
        return vueComponentTags.includes(element.tagName.toLowerCase());
    }

    /**
     * Comprehensive UI state check
     */
    checkUIState() {
        const appElement = document.getElementById('app');
        if (!appElement) {
            this.reportCriticalError('APP_ELEMENT_MISSING', 'Main app element not found in DOM');
            return;
        }

        const uiState = this.analyzeUIState(appElement);
        
        // Check for critical issues
        if (uiState.isBlank) {
            this.reportCriticalError('BLANK_SCREEN', 'Application showing blank/white screen', uiState);
        }
        
        if (uiState.hasMissingContent && (Date.now() - this.lastActionTime) < 2000) {
            this.reportCriticalError('MISSING_CONTENT_AFTER_ACTION', 'Expected content missing after user action', uiState);
        }

        if (uiState.hasRenderingErrors) {
            this.reportCriticalError('RENDERING_ERROR', 'Vue component rendering errors detected', uiState);
        }

        // Log detailed state for debugging
        if ((Date.now() - this.lastActionTime) < 1000) {
            console.log('🔍 UI State Analysis:', uiState);
        }
    }

    /**
     * Check UI state specifically after user action
     */
    checkUIStateAfterAction(actionType, actionDetails, isDelayed = false) {
        const prefix = isDelayed ? '⏰ Delayed' : '⚡ Immediate';
        console.log(`${prefix} UI check after ${actionType}:`);
        
        const appElement = document.getElementById('app');
        const uiState = this.analyzeUIState(appElement);
        
        console.log(`${prefix} UI State:`, {
            actionType,
            actionDetails,
            uiState,
            timeSinceAction: Date.now() - this.lastActionTime
        });

        // Critical error checks with context
        if (uiState.isBlank) {
            this.reportCriticalError('BLANK_SCREEN_AFTER_ACTION', 
                `Blank screen appeared after ${actionType}`, {
                actionType,
                actionDetails,
                uiState,
                isDelayed
            });
        }

        if (uiState.hasMissingContent) {
            this.reportCriticalError('MISSING_VIEW_AFTER_ACTION', 
                `Expected view/component missing after ${actionType}`, {
                actionType,
                actionDetails,
                uiState,
                isDelayed
            });
        }

        if (uiState.vueComponents.length === 0 && actionType === 'button_click') {
            this.reportCriticalError('NO_VUE_COMPONENTS_AFTER_CLICK', 
                `No Vue components rendered after button click`, {
                actionType,
                actionDetails,
                uiState,
                isDelayed
            });
        }
    }

    /**
     * Analyze current UI state in detail
     */
    analyzeUIState(appElement) {
        const innerHTML = appElement.innerHTML;
        const textContent = appElement.textContent.trim();
        const computedStyle = window.getComputedStyle(appElement);
        
        // Find Vue components
        const vueComponents = this.findVueComponents(appElement);
        
        // Check for loading states
        const hasLoadingSpinner = appElement.querySelector('.loading-spinner') !== null;
        const hasLoadingText = innerHTML.includes('Ładowanie') || innerHTML.includes('Loading');
        
        // Check for error states
        const hasErrorState = appElement.querySelector('.app-error') !== null;
        const hasVueErrors = this.checkForVueErrors();
        
        // Check if screen is effectively blank
        const isBlank = this.isScreenBlank(appElement, textContent);
        
        // Check for missing expected content
        const hasMissingContent = this.checkForMissingContent(appElement, vueComponents);
        
        return {
            timestamp: Date.now(),
            innerHTML: innerHTML.length > 500 ? innerHTML.substring(0, 500) + '...' : innerHTML,
            textContent: textContent.length > 200 ? textContent.substring(0, 200) + '...' : textContent,
            vueComponents: vueComponents.map(comp => ({
                tag: comp.tagName.toLowerCase(),
                hasContent: comp.innerHTML.trim().length > 0,
                isVisible: this.isElementVisible(comp)
            })),
            isBlank,
            hasMissingContent,
            hasLoadingSpinner,
            hasLoadingText,
            hasErrorState,
            hasRenderingErrors: hasVueErrors,
            backgroundColor: computedStyle.backgroundColor,
            visibility: computedStyle.visibility,
            display: computedStyle.display
        };
    }

    /**
     * Find all Vue components in the DOM
     */
    findVueComponents(container) {
        const vueSelectors = [
            'loginscreen', 'usermenuscreen', 'systemscreen',
            'testmenutemplate', 'systemsettingstemplate',
            'workshoptemplate', 'testreportstemplate',
            'devicedatatemplate', 'realtimesensorstemplate',
            'reportsviewtemplate', 'servicemenutemplate',
            'userstemplate', 'devicehistorytemplate',
            'reportsbatchtemplate', 'reportsscheduletemplate',
            'workshopinventorytemplate', 'workshopmaintenancetemplate',
            'workshoppartstemplate', 'workshoptoolstemplate'
        ];
        
        const components = [];
        vueSelectors.forEach(selector => {
            const elements = container.querySelectorAll(selector);
            components.push(...Array.from(elements));
        });
        
        return components;
    }

    /**
     * Check if screen is effectively blank
     */
    isScreenBlank(appElement, textContent) {
        // No visible text content
        if (textContent.length === 0) return true;
        
        // Only whitespace or common empty content
        if (textContent.replace(/\s+/g, '').length === 0) return true;
        
        // Only loading text
        if (textContent.length < 50 && (
            textContent.includes('Ładowanie') || 
            textContent.includes('Loading') ||
            textContent.includes('Inicjalizacja')
        )) return false; // This is acceptable loading state
        
        // Check if app div has minimal content
        const visibleElements = appElement.querySelectorAll('*:not([style*="display: none"]):not([style*="visibility: hidden"])');
        
        return visibleElements.length < 3;
    }

    /**
     * Check for missing expected content
     */
    checkForMissingContent(appElement, vueComponents) {
        // If we're past loading state but have no Vue components
        const hasLoadingState = appElement.querySelector('.app-loading') !== null;
        
        if (!hasLoadingState && vueComponents.length === 0) {
            return true;
        }
        
        // If we have Vue components but they're empty
        const nonEmptyComponents = vueComponents.filter(comp => 
            comp.innerHTML.trim().length > 0
        );
        
        if (vueComponents.length > 0 && nonEmptyComponents.length === 0) {
            return true;
        }
        
        return false;
    }

    /**
     * Check for Vue rendering errors
     */
    checkForVueErrors() {
        // Check console for Vue errors (simplified)
        return window.vueRuntimeErrors && window.vueRuntimeErrors.length > 0;
    }

    /**
     * Check if element is visible
     */
    isElementVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0';
    }

    /**
     * Report critical error with detailed context
     */
    reportCriticalError(errorCode, message, context = {}) {
        const error = {
            code: errorCode,
            message,
            context,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            stackTrace: new Error().stack
        };
        
        this.criticalErrors.push(error);
        
        // Log as error with enhanced formatting
        console.error(`🚨 CRITICAL UI ERROR [${errorCode}]:`, message);
        console.error('📊 Error Context:', context);
        console.error('⏰ Timestamp:', new Date(error.timestamp).toISOString());
        console.error('🔗 URL:', error.url);
        
        // Also log to window for external access
        if (!window.MASKSERVICE_UI_ERRORS) {
            window.MASKSERVICE_UI_ERRORS = [];
        }
        window.MASKSERVICE_UI_ERRORS.push(error);
        
        // Create visual error notification in development
        if (window.location.hostname === 'localhost') {
            this.showVisualErrorNotification(errorCode, message);
        }
    }

    /**
     * Show visual error notification for development
     */
    showVisualErrorNotification(errorCode, message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            font-family: monospace;
            font-size: 12px;
            max-width: 300px;
            z-index: 9999;
            border: 2px solid #cc0000;
        `;
        
        notification.innerHTML = `
            <strong>🚨 UI ERROR</strong><br>
            <strong>Code:</strong> ${errorCode}<br>
            <strong>Message:</strong> ${message}<br>
            <button onclick="this.parentNode.remove()" style="margin-top: 5px; padding: 2px 5px;">Close</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    /**
     * Get monitoring summary for debugging
     */
    getSummary() {
        return {
            isEnabled: this.isEnabled,
            criticalErrorsCount: this.criticalErrors.length,
            lastActionTime: this.lastActionTime,
            monitoringDuration: Date.now() - this.lastActionTime,
            recentErrors: this.criticalErrors.slice(-5),
            currentUIState: this.analyzeUIState(document.getElementById('app'))
        };
    }

    /**
     * Stop monitoring
     */
    stop() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.isEnabled = false;
        console.log('🛑 Runtime UI Monitor stopped');
    }
}

// Global Vue error handler integration
if (window.Vue) {
    const originalErrorHandler = window.Vue.config?.errorHandler;
    
    if (window.Vue.config) {
        window.Vue.config.errorHandler = (error, instance, info) => {
            if (!window.vueRuntimeErrors) {
                window.vueRuntimeErrors = [];
            }
            window.vueRuntimeErrors.push({
                error: error.message,
                info,
                timestamp: Date.now()
            });
            
            if (originalErrorHandler) {
                originalErrorHandler(error, instance, info);
            }
        };
    }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!window.runtimeUIMonitor) {
        window.runtimeUIMonitor = new RuntimeUIMonitor();
        console.log('🔍 Runtime UI Monitor auto-initialized');
    }
});

// Export for manual initialization
window.RuntimeUIMonitor = RuntimeUIMonitor;
