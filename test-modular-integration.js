/**
 * MASKSERVICE C20 - Modular Integration Test
 * Test script to verify MenuManager integration with ViewLoader
 */

console.log('🧪 Testing modular integration...');

// Wait for application to load
setTimeout(async () => {
    console.log('📊 MODULAR INTEGRATION TEST RESULTS:');
    console.log('='.repeat(50));
    
    // Test 1: Check if ViewLoader is available
    if (window.viewLoader) {
        console.log('✅ ViewLoader is available');
        const stats = window.viewLoader.getStats();
        console.log(`📋 ViewLoader stats:`, stats);
        
        // List registered views
        const registeredViews = window.viewLoader.getRegisteredViews();
        console.log(`📄 Registered views (${registeredViews.length}):`, registeredViews.slice(0, 5).join(', ') + '...');
    } else {
        console.log('❌ ViewLoader not available');
    }
    
    // Test 2: Check if MenuManager is available
    if (window.MenuManager) {
        console.log('✅ MenuManager is available');
        
        // Test async loadTemplate method
        try {
            console.log('🔄 Testing MenuManager.loadTemplate with ViewLoader...');
            
            // First login to enable menu
            if (window.mockLogin) {
                window.mockLogin('OPERATOR');
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Try to load a template using MenuManager
                const templateId = 'user-data-template';
                console.log(`🎯 Testing template loading: ${templateId}`);
                
                const result = await window.MenuManager.loadTemplate(templateId);
                if (result) {
                    console.log(`✅ Template ${templateId} loaded successfully via MenuManager`);
                } else {
                    console.log(`❌ Template ${templateId} failed to load via MenuManager`);
                }
                
                // Check if template content is in menu-content
                const menuContent = document.getElementById('menu-content');
                if (menuContent && menuContent.innerHTML.trim().length > 0) {
                    console.log(`✅ Menu content populated (${menuContent.innerHTML.length} chars)`);
                } else {
                    console.log('❌ Menu content is empty');
                }
                
            } else {
                console.log('❌ mockLogin not available for testing');
            }
            
        } catch (error) {
            console.log('❌ Error testing MenuManager integration:', error);
        }
        
    } else {
        console.log('❌ MenuManager not available');
    }
    
    // Test 3: Test direct ViewLoader functionality
    if (window.viewLoader) {
        try {
            console.log('🔄 Testing direct ViewLoader functionality...');
            
            // Test loading a template directly
            const testTemplate = 'test-menu-template';
            const templateContent = await window.viewLoader.loadView(testTemplate);
            
            if (templateContent && templateContent.length > 0) {
                console.log(`✅ Direct ViewLoader test passed: ${testTemplate} (${templateContent.length} chars)`);
            } else {
                console.log(`❌ Direct ViewLoader test failed: ${testTemplate}`);
            }
            
        } catch (error) {
            console.log('❌ Error testing direct ViewLoader:', error);
        }
    }
    
    // Test 4: Check if dynamic loading requests are working
    console.log('🌍 Checking recent network requests...');
    if (performance && performance.getEntriesByType) {
        const networkEntries = performance.getEntriesByType('resource');
        const viewRequests = networkEntries.filter(entry => 
            entry.name.includes('/views/') && entry.responseEnd > Date.now() - 30000
        );
        
        console.log(`📡 Recent view requests: ${viewRequests.length}`);
        viewRequests.forEach(request => {
            const status = request.transferSize > 0 ? 'SUCCESS' : 'CACHED';
            console.log(`  ${status}: ${request.name.split('/').pop()}`);
        });
    }
    
    console.log('='.repeat(50));
    console.log('🏁 Modular integration test completed');
    
}, 3000);

console.log('⏳ Waiting for application to initialize...');
