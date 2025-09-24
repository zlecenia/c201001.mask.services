/**
 * MASKSERVICE C20 - Debug Menu Navigation Issues
 * Diagnose and fix the core problems with menu navigation
 */

console.log('🔍 DEBUG: Analyzing menu navigation issues...');

setTimeout(() => {
    console.log('='.repeat(60));
    console.log('🐛 MENU NAVIGATION DEBUG REPORT');
    console.log('='.repeat(60));
    
    // TEST 1: Check MenuManager availability and structure
    console.log('\n📋 PHASE 1: MenuManager Analysis');
    console.log('-'.repeat(40));
    
    if (window.MenuManager) {
        console.log('✅ MenuManager exists');
        console.log('🔍 MenuManager methods:', Object.getOwnPropertyNames(window.MenuManager.__proto__));
        
        // Check menu configuration
        if (window.MenuManager.menuConfig) {
            console.log('✅ menuConfig exists');
            const roles = Object.keys(window.MenuManager.menuConfig);
            console.log('📋 Available roles:', roles);
            
            // Check current role and menu
            console.log('🎭 Active role:', window.MenuManager.activeRole);
            console.log('📄 Current menu items:', window.MenuManager.currentMenu?.length || 0);
        } else {
            console.log('❌ menuConfig missing');
        }
        
        // Check selectMenuOption method
        if (typeof window.MenuManager.selectMenuOption === 'function') {
            console.log('✅ selectMenuOption method exists');
        } else {
            console.log('❌ selectMenuOption method missing');
        }
    } else {
        console.log('❌ MenuManager not available');
    }
    
    // TEST 2: Check current DOM menu state
    console.log('\n🎯 PHASE 2: DOM Menu State Analysis');
    console.log('-'.repeat(40));
    
    const menuContent = document.getElementById('menu-content');
    const menuItems = document.querySelectorAll('.menu-item');
    const screens = document.querySelectorAll('.screen');
    
    console.log('📄 menu-content element:', !!menuContent);
    if (menuContent) {
        console.log('📏 menu-content innerHTML length:', menuContent.innerHTML.length);
        console.log('👁️ menu-content visible:', menuContent.style.display !== 'none');
    }
    
    console.log('🔘 .menu-item elements found:', menuItems.length);
    console.log('🖥️ .screen elements found:', screens.length);
    
    // List current screen visibility
    screens.forEach(screen => {
        const isVisible = !screen.classList.contains('hidden') && 
                         screen.style.display !== 'none' &&
                         screen.classList.contains('active');
        console.log(`   ${isVisible ? '👁️' : '🚫'} ${screen.id}: ${isVisible ? 'VISIBLE' : 'HIDDEN'}`);
    });
    
    // TEST 3: Test router functionality
    console.log('\n🛣️ PHASE 3: Router State Analysis');
    console.log('-'.repeat(40));
    
    console.log('📍 Current location.hash:', window.location.hash);
    console.log('📍 Current location.href:', window.location.href);
    
    if (window.C20Router) {
        console.log('✅ C20Router exists');
        if (window.C20Router.currentRoute) {
            console.log('🎯 Current route:', window.C20Router.currentRoute);
        }
    } else {
        console.log('❌ C20Router not available');
    }
    
    // TEST 4: Check menu item click handlers
    console.log('\n🔘 PHASE 4: Menu Click Handler Analysis');
    console.log('-'.repeat(40));
    
    const testMenuOptions = ['user_data', 'device_history', 'test_wizard'];
    
    testMenuOptions.forEach(optionKey => {
        try {
            // Check if menu option exists in current menu
            let menuItemExists = false;
            if (window.MenuManager && window.MenuManager.currentMenu) {
                menuItemExists = window.MenuManager.currentMenu.some(item => 
                    item.key === optionKey || item.id === optionKey
                );
            }
            
            console.log(`🎯 ${optionKey}: Menu item exists: ${menuItemExists ? 'YES' : 'NO'}`);
            
            // Check DOM button for this option
            const domButton = document.querySelector(`[onclick*="${optionKey}"]`);
            console.log(`   DOM button: ${domButton ? 'EXISTS' : 'MISSING'}`);
            
        } catch (error) {
            console.log(`❌ ${optionKey}: Error - ${error.message}`);
        }
    });
    
    // TEST 5: Manual menu navigation test
    console.log('\n🧪 PHASE 5: Manual Navigation Test');
    console.log('-'.repeat(40));
    
    // Try to manually trigger menu option
    if (window.MenuManager && typeof window.MenuManager.selectMenuOption === 'function') {
        console.log('🔄 Testing manual selectMenuOption...');
        
        const beforeHash = window.location.hash;
        console.log('📍 Hash before:', beforeHash);
        
        try {
            // Try to select a menu option
            window.MenuManager.selectMenuOption('user_data');
            
            setTimeout(() => {
                const afterHash = window.location.hash;
                console.log('📍 Hash after:', afterHash);
                console.log('🔄 Hash changed:', beforeHash !== afterHash ? 'YES' : 'NO');
                
                // Check menu content
                const menuContent = document.getElementById('menu-content');
                if (menuContent) {
                    console.log('📄 Menu content updated:', menuContent.innerHTML.length > 100 ? 'YES' : 'NO');
                }
            }, 1000);
            
        } catch (error) {
            console.log('❌ Manual test failed:', error.message);
        }
    }
    
    // TEST 6: Check template detection issues
    console.log('\n🎭 PHASE 6: Template Detection Analysis');
    console.log('-'.repeat(40));
    
    if (window.templateValidator) {
        console.log('✅ TemplateValidator exists');
        
        // Check template mapping
        const expectedTemplate = window.templateValidator.getExpectedTemplate('user_data');
        console.log('🎯 Expected template for user_data:', expectedTemplate);
        
        // Check if template exists in DOM
        const templateElement = document.getElementById(expectedTemplate);
        console.log('📄 Template element exists:', !!templateElement);
        
        // Check template validation logic
        const isLoaded = window.templateValidator.isTemplateLoaded(expectedTemplate);
        console.log('🔍 Template validation result:', isLoaded);
        
        const currentTemplate = window.templateValidator.getLoadedTemplate();
        console.log('📋 Currently loaded template:', currentTemplate);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DEBUG COMPLETE - Check results above');
    console.log('='.repeat(60));
    
}, 2000);

console.log('⏳ Starting menu navigation debug in 2 seconds...');
