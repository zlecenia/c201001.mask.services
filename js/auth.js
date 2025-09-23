/**
 * MASKSERVICE C20 - Authentication Module
 * Modular authentication system - login, logout, user management
 * Simple global class system - no AMD dependencies
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

        // Validate password using Utils
        const validation = Utils.validatePassword(password);
        if (!validation.valid) {
            console.warn('Password validation failed:', validation.error);
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
        
        // Show loading screen during login process
        if (window.showLoading) {
            window.showLoading('Logowanie...', 'Autoryzacja w toku');
        }
        
        // Brief loading display (no artificial delay)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Hide loading screen
        if (window.hideLoading) {
            window.hideLoading();
        }
        
        // Navigate to system screen using router
        if (window.navigateTo) {
            window.navigateTo('system-screen', null, 'default');
        } else if (window.navigateAction) {
            window.navigateAction('system-screen-default');
        } else {
            // Final fallback to switchScreen if router not available
            Utils.switchScreen('login-screen', 'system-screen');
        }
        
        // Show user menu based on role
        if (window.MenuManager) {
            window.MenuManager.showUserMenu(role);
        }
        
        // Update footer UI with user info
        this.updateFooterUserInfo(user);
        
        // Start activity tracking
        this.startActivityTracking();
        
        console.log('Login successful:', user);
        return true;
    }

    /**
     * Logout function - clears user session
     */
    logout() {
        console.log('🔴 Logout initiated for user:', this.currentUser?.role);
        
        // Clear user session first
        this.currentUser = null;
        this.lastActivity = new Date();
        
        if (this.inactivityTimer) {
            clearInterval(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        
        // Hide footer user info
        this.hideFooterUserInfo();
        
        // Clear any sensitive data
        const passwordInput = document.getElementById('password-input');
        if (passwordInput) {
            passwordInput.value = '';
        }
        
        // Reset menu content
        const menuContent = document.getElementById('menu-content');
        if (menuContent) {
            menuContent.innerHTML = '<div class="welcome-message"><h2 data-i18n="menu.select_option">Wybierz opcję z menu</h2><p data-i18n="system.ready">System gotowy do pracy</p></div>';
        }
        
        // Single navigation method - use direct screen switch to avoid conflicts
        console.log('🔄 Navigating to login screen...');
        this.directScreenSwitch();
        
        console.log('✅ Logout completed successfully');
    }

    /**
     * Direct screen switching as fallback method
     */
    directScreenSwitch() {
        console.log('🔄 Starting direct screen switch to login...');
        
        // Hide all screens first
        const screens = document.querySelectorAll('.screen');
        console.log(`Found ${screens.length} screens to hide`);
        screens.forEach(screen => {
            screen.classList.remove('active');
            console.log(`Hidden screen: ${screen.id}`);
        });
        
        // Show login screen
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.classList.add('active');
            console.log('✅ Login screen activated');
        } else {
            console.error('❌ Login screen not found!');
        }
        
        // Explicitly hide user menu screen and system screen
        const userMenuScreen = document.getElementById('user-menu-screen');
        const systemScreen = document.getElementById('system-screen');
        
        if (userMenuScreen) {
            userMenuScreen.classList.remove('active');
            console.log('✅ User menu screen hidden');
        }
        
        if (systemScreen) {
            systemScreen.classList.remove('active');
            console.log('✅ System screen hidden');
        }
        
        console.log('🔄 Direct screen switch to login completed');
    }

    /**
     * Update footer UI with logged-in user information
     */
    updateFooterUserInfo(user) {
        const footerUser = document.getElementById('footer-user');
        const username = document.getElementById('username');
        const userRole = document.getElementById('user-role');
        const userInfo = document.getElementById('user-info');
        
        if (footerUser && user) {
            footerUser.textContent = `USER: ${user.username.toUpperCase()}`;
            footerUser.style.display = 'inline-block';
        }
        
        if (username && user) {
            username.textContent = user.username.toUpperCase();
        }
        
        if (userRole && user) {
            userRole.textContent = user.role;
            userRole.className = `role-badge role-${user.role.toLowerCase()}`;
        }
        
        if (userInfo && user) {
            userInfo.style.display = 'inline-block';
        }
        
        console.log('✅ Footer user info updated for:', user.username);
    }

    /**
     * Hide footer user information on logout
     */
    hideFooterUserInfo() {
        const footerUser = document.getElementById('footer-user');
        const userInfo = document.getElementById('user-info');
        
        if (footerUser) {
            footerUser.style.display = 'none';
            footerUser.textContent = 'USER: ---';
        }
        
        if (userInfo) {
            userInfo.style.display = 'none';
        }
        
        // Clear user data
        const username = document.getElementById('username');
        const userRole = document.getElementById('user-role');
        
        if (username) {
            username.textContent = '---';
        }
        
        if (userRole) {
            userRole.textContent = '---';
            userRole.className = 'role-badge';
        }
        
        console.log('✅ Footer user info hidden after logout');
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

// Create global auth manager instance for backwards compatibility
const authManager = new AuthManager();

// Export to global scope - single point of truth
window.AuthManager = authManager;  // Instance for compatibility
window.authManager = authManager;  // Instance reference
window.AuthManagerClass = AuthManager;  // Class reference

// Export functions for HTML onclick handlers - single binding
window.mockLogin = (role) => authManager.mockLogin(role);
window.logout = () => {
    console.log('🔴 Logout called - preventing multiple calls');
    if (authManager.currentUser) {
        authManager.logout();
    } else {
        console.warn('Already logged out - ignoring duplicate logout call');
    }
};

// Track user activity on any interaction
document.addEventListener('click', () => authManager.updateActivity());
document.addEventListener('keypress', () => authManager.updateActivity());

console.log('✅ Auth Module initialized');
