/**
 * MASKSERVICE C20 - Authentication Module
 * Modular authentication system - login, logout, user management
 */

// AMD/RequireJS module definition
define('auth', ['utils'], function(Utils) {

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
        console.log('Logging out user:', this.currentUser?.role);
        
        this.currentUser = null;
        this.lastActivity = new Date();
        
        if (this.inactivityTimer) {
            clearInterval(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        
        // Navigate back to login screen - multiple fallback methods
        try {
            // Method 1: Use router navigation if available
            if (window.navigateAction) {
                window.navigateAction('login-screen-default');
            }
            // Method 2: Use Utils.switchScreen if available
            else if (Utils && Utils.switchScreen) {
                Utils.switchScreen('user-menu-screen', 'login-screen');
            }
            // Method 3: Direct DOM manipulation fallback
            else {
                this.directScreenSwitch();
            }
        } catch (error) {
            console.warn('Router navigation failed, using direct screen switch:', error);
            this.directScreenSwitch();
        }
        
        // Hide footer user info
        this.hideFooterUserInfo();
        
        // Clear any sensitive data
        const passwordInput = document.getElementById('password-input');
        if (passwordInput) {
            passwordInput.value = '';
        }
        
        // Reset any menu state
        const menuContent = document.getElementById('menu-content');
        if (menuContent) {
            menuContent.innerHTML = '<div class="welcome-message"><h2 data-i18n="menu.select_option">Wybierz opcję z menu</h2><p data-i18n="system.ready">System gotowy do pracy</p></div>';
        }
        
        console.log('✅ Logout completed successfully');
    }

    /**
     * Direct screen switching as fallback method
     */
    directScreenSwitch() {
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
        
        // Show login screen
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.classList.add('active');
        }
        
        // Hide user menu screen
        const userMenuScreen = document.getElementById('user-menu-screen');
        if (userMenuScreen) {
            userMenuScreen.classList.remove('active');
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
    window.AuthManager = authManager;

    // Export functions for HTML onclick handlers
    window.mockLogin = (role) => authManager.mockLogin(role);
    window.logout = () => authManager.logout();

    // Track user activity on any interaction
    document.addEventListener('click', () => authManager.updateActivity());
    document.addEventListener('keypress', () => authManager.updateActivity());

    console.log('✅ Auth Module initialized');

    // Return AuthManager class for AMD/RequireJS
    return AuthManager;
});
