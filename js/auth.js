/**
 * MASKTRONIC C20 - Authentication Module
 * Modular authentication system - login, logout, user management
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.lastActivity = new Date();
        this.inactivityTimer = null;
    }

    /**
     * Mock login function - validates password and sets user role
     */
    async mockLogin(role) {
        const password = document.getElementById('password-input')?.value.trim();
        
        if (!password) {
            console.warn('No password entered for login');
            return false;
        }

        console.log(`Logging in as ${role} with password`);
        
        // Mock user creation
        const user = {
            username: role.toLowerCase(),
            role: role,
            token: `mock-jwt-token-${Date.now()}`,
            lastLogin: new Date().toISOString()
        };

        this.currentUser = user;
        this.lastActivity = new Date();
        
        // Clear password field
        const passwordInput = document.getElementById('password-input');
        if (passwordInput) {
            passwordInput.value = '';
        }
        
        // Update UI screens
        this.switchScreen('login-screen', 'system-screen');
        
        // Show user menu based on role
        if (window.MenuManager) {
            window.MenuManager.showUserMenu(role);
        }
        
        // Start activity tracking
        this.startActivityTracking();
        
        console.log('Login successful:', user);
        return true;
    }

    /**
     * Logout function - clears user session
     */
    logout() {
        console.log('Logging out user:', this.currentUser?.role);
        
        this.currentUser = null;
        this.lastActivity = new Date();
        
        if (this.inactivityTimer) {
            clearInterval(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        
        // Switch back to login screen
        this.switchScreen('system-screen', 'login-screen');
        
        // Clear any sensitive data
        const passwordInput = document.getElementById('password-input');
        if (passwordInput) {
            passwordInput.value = '';
        }
    }

    /**
     * Switch between UI screens
     */
    switchScreen(fromScreen, toScreen) {
        const fromElement = document.getElementById(fromScreen);
        const toElement = document.getElementById(toScreen);
        
        if (fromElement) {
            fromElement.classList.remove('active');
        }
        
        if (toElement) {
            toElement.classList.add('active');
        }
    }

    /**
     * Start tracking user activity for auto-logout
     */
    startActivityTracking() {
        if (this.inactivityTimer) {
            clearInterval(this.inactivityTimer);
        }
        
        this.inactivityTimer = setInterval(() => {
            const now = new Date();
            const inactiveTime = Math.floor((now - this.lastActivity) / 1000);
            
            // Update inactive time display if element exists
            const inactiveTimeElement = document.getElementById('inactive-time');
            if (inactiveTimeElement) {
                inactiveTimeElement.textContent = `${inactiveTime}s`;
            }
            
            // Auto-logout after 30 minutes of inactivity
            if (inactiveTime > 1800) { // 30 minutes
                this.logout();
            }
        }, 1000);
    }

    /**
     * Update last activity timestamp
     */
    updateActivity() {
        this.lastActivity = new Date();
    }

    /**
     * Get current user info
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Create global auth manager instance
window.AuthManager = new AuthManager();

// Export functions for HTML onclick handlers
window.mockLogin = (role) => window.AuthManager.mockLogin(role);
window.logout = () => window.AuthManager.logout();

// Track user activity on any interaction
document.addEventListener('click', () => window.AuthManager.updateActivity());
document.addEventListener('keypress', () => window.AuthManager.updateActivity());

console.log('✅ Auth Module initialized');
