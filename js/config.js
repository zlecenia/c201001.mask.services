/* ====================
   frontend/js/config.js
   ==================== */

const CONFIG = {
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : `http://${window.location.hostname}:3000`,
    WS_URL: window.location.hostname === 'localhost'
        ? 'ws://localhost:3000'
        : `ws://${window.location.hostname}:3000`,
    MOCK_MODE: true,
    UPDATE_INTERVAL: 5000
};

const MENU_STRUCTURE = {
    OPERATOR: [
        { key: 'test_menu', label: 'Test Menu', icon: '📋' },
        { key: 'user_data', label: 'User Data', icon: '👤' },
        { key: 'device_data', label: 'Device Data', icon: '💾' },
        { key: 'test_reports', label: 'Test Reports', icon: '📄' },
        { key: 'workshop', label: 'Workshop', icon: '🔧' }
    ],
    ADMIN: [
        { key: 'test_menu', label: 'Test Menu', icon: '📋' },
        { key: 'user_data', label: 'User Data', icon: '👤' },
        { key: 'device_data', label: 'Device Data', icon: '💾' },
        { key: 'test_reports', label: 'Test Reports', icon: '📄' },
        { key: 'workshop', label: 'Workshop', icon: '🔧' },
        { key: 'users', label: 'Users', icon: '👥' },
        { key: 'service_menu', label: 'Service Menu', icon: '🛡️' }
    ],
    SUPERUSER: [
        { key: 'test_menu', label: 'Test Menu', icon: '📋' },
        { key: 'user_data', label: 'User Data', icon: '👤' },
        { key: 'device_data', label: 'Device Data', icon: '💾' },
        { key: 'test_reports', label: 'Test Reports', icon: '📄' },
        { key: 'workshop', label: 'Workshop', icon: '🔧' },
        { key: 'users', label: 'Users', icon: '👥' },
        { key: 'service_menu', label: 'Service Menu', icon: '🛡️' },
        { key: 'system_settings', label: 'System Settings', icon: '⚙️' }
    ]
};
