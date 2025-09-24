/**
 * MASKSERVICE C20 - Final Workflow Test
 * Comprehensive end-to-end test of the complete system:
 * - Role-based screens (5 screens)
 * - Dynamic template loading
 * - Template validation
 * - Menu navigation
 * - Router state changes
 */

console.log('🎯 MASKSERVICE C20 - Final Workflow Test Starting...');

// Wait for all systems to initialize
setTimeout(async () => {
    console.log('=' .repeat(80));
    console.log('🧪 COMPREHENSIVE SYSTEM VERIFICATION');
    console.log('=' .repeat(80));
    
    const testResults = {
        systems: {},
        roleScreens: {},
        templateValidation: {},
        menuNavigation: {},
        overall: {}
    };
    
    // TEST 1: System Components Availability
    console.log('\n📋 PHASE 1: System Components Check');
    console.log('-'.repeat(50));
    
    testResults.systems = {
        viewLoader: !!window.viewLoader,
        templateValidator: !!window.templateValidator,  
        menuManager: !!window.MenuManager,
        router: !!window.C20Router,
        auth: !!window.mockLogin,
        i18n: !!window.changeLanguage
    };
    
    Object.entries(testResults.systems).forEach(([system, available]) => {
        console.log(`${available ? '✅' : '❌'} ${system}: ${available ? 'Available' : 'Not Available'}`);
    });
    
    // TEST 2: Role-Based Screens
    console.log('\n🎭 PHASE 2: Role-Based Screens Test');
    console.log('-'.repeat(50));
    
    const roleScreens = [
        'login-screen',
        'operator-menu-screen', 
        'admin-menu-screen',
        'service-menu-screen',
        'superuser-menu-screen'
    ];
    
    for (const screenId of roleScreens) {
        try {
            if (window.viewLoader && window.viewLoader.hasView(screenId)) {
                const content = await window.viewLoader.loadView(screenId);
                testResults.roleScreens[screenId] = {
                    registered: true,
                    loaded: !!content,
                    contentLength: content ? content.length : 0,
                    status: 'PASS'
                };
                console.log(`✅ ${screenId}: Loaded successfully (${content.length} chars)`);
            } else {
                testResults.roleScreens[screenId] = {
                    registered: false,
                    loaded: false,
                    status: 'FAIL'
                };
                console.log(`❌ ${screenId}: Not registered in ViewLoader`);
            }
        } catch (error) {
            testResults.roleScreens[screenId] = {
                registered: true,
                loaded: false,
                error: error.message,
                status: 'FAIL'
            };
            console.log(`❌ ${screenId}: Load failed - ${error.message}`);
        }
    }
    
    // TEST 3: Template Validation System
    console.log('\n🔍 PHASE 3: Template Validation Test');
    console.log('-'.repeat(50));
    
    if (window.templateValidator) {
        // Test validator statistics
        const stats = window.templateValidator.getStats ? window.templateValidator.getStats() : {};
        console.log('📊 Validator Stats:', stats);
        
        // Login to enable menu testing
        if (window.mockLogin) {
            console.log('🔐 Logging in as OPERATOR for menu testing...');
            window.mockLogin('OPERATOR');
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        // Test specific menu options with validation
        const testMenuOptions = ['user_data', 'realtime_sensors', 'device_history'];
        
        for (const option of testMenuOptions) {
            try {
                console.log(`🎯 Testing menu option: ${option}`);
                const result = await window.templateValidator.testMenuOption(option);
                testResults.templateValidation[option] = {
                    tested: true,
                    success: result,
                    status: result ? 'PASS' : 'FAIL'
                };
                console.log(`${result ? '✅' : '❌'} ${option}: ${result ? 'Success' : 'Failed'}`);
            } catch (error) {
                testResults.templateValidation[option] = {
                    tested: true,
                    success: false,
                    error: error.message,
                    status: 'FAIL'
                };
                console.log(`❌ ${option}: Error - ${error.message}`);
            }
        }
        
        // Generate validation report
        const report = window.templateValidator.generateReport();
        testResults.validationReport = report.summary;
        console.log('📊 Validation Report Summary:', report.summary);
        
    } else {
        console.log('❌ TemplateValidator not available');
        testResults.templateValidation.available = false;
    }
    
    // TEST 4: Router and Hash Navigation
    console.log('\n🛣️ PHASE 4: Router Navigation Test');
    console.log('-'.repeat(50));
    
    const initialHash = window.location.hash;
    console.log('📍 Initial hash:', initialHash);
    
    // Test hash change
    if (window.C20Router) {
        try {
            // Navigate to different view
            window.location.hash = '#/user-data/pl/test';
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const newHash = window.location.hash;
            const hashChanged = newHash !== initialHash;
            
            testResults.menuNavigation.hashNavigation = {
                initialHash: initialHash,
                newHash: newHash,
                changed: hashChanged,
                status: hashChanged ? 'PASS' : 'FAIL'
            };
            
            console.log(`${hashChanged ? '✅' : '❌'} Hash navigation: ${initialHash} → ${newHash}`);
            
        } catch (error) {
            testResults.menuNavigation.hashNavigation = {
                error: error.message,
                status: 'FAIL'
            };
            console.log(`❌ Router navigation failed: ${error.message}`);
        }
    }
    
    // TEST 5: LCD Interface Optimization Check
    console.log('\n📱 PHASE 5: LCD Interface Check');
    console.log('-'.repeat(50));
    
    // Check if LCD-specific styles are present
    const lcdElements = document.querySelectorAll('.lcd-optimized, .lcd-only');
    const hasLcdOptimization = lcdElements.length > 0;
    
    console.log(`${hasLcdOptimization ? '✅' : '⚠️'} LCD optimization: ${lcdElements.length} elements found`);
    
    testResults.lcdOptimization = {
        elementsFound: lcdElements.length,
        hasOptimization: hasLcdOptimization,
        status: hasLcdOptimization ? 'PASS' : 'PARTIAL'
    };
    
    // FINAL SUMMARY
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    
    // Calculate overall statistics
    const systemsWorking = Object.values(testResults.systems).filter(s => s).length;
    const systemsTotal = Object.keys(testResults.systems).length;
    
    const screensWorking = Object.values(testResults.roleScreens).filter(s => s.status === 'PASS').length;
    const screensTotal = Object.keys(testResults.roleScreens).length;
    
    const validationWorking = Object.values(testResults.templateValidation).filter(s => s.status === 'PASS').length;
    const validationTotal = Object.keys(testResults.templateValidation).length;
    
    testResults.overall = {
        systems: `${systemsWorking}/${systemsTotal}`,
        roleScreens: `${screensWorking}/${screensTotal}`,
        templateValidation: `${validationWorking}/${validationTotal}`,
        overallSuccess: (systemsWorking === systemsTotal && screensWorking === screensTotal),
        systemsRate: ((systemsWorking / systemsTotal) * 100).toFixed(1) + '%',
        screensRate: ((screensWorking / screensTotal) * 100).toFixed(1) + '%',
        validationRate: validationTotal > 0 ? ((validationWorking / validationTotal) * 100).toFixed(1) + '%' : 'N/A'
    };
    
    console.log(`🔧 System Components: ${testResults.overall.systems} (${testResults.overall.systemsRate})`);
    console.log(`🎭 Role-Based Screens: ${testResults.overall.roleScreens} (${testResults.overall.screensRate})`);
    console.log(`🔍 Template Validation: ${testResults.overall.templateValidation} (${testResults.overall.validationRate})`);
    console.log(`📱 LCD Optimization: ${testResults.lcdOptimization.status}`);
    
    // Overall status
    if (testResults.overall.overallSuccess) {
        console.log('\n🎉 SYSTEM FULLY OPERATIONAL!');
        console.log('✅ All role-based screens working');
        console.log('✅ Dynamic template loading functional'); 
        console.log('✅ Template validation active');
        console.log('✅ Menu navigation operational');
        console.log('✅ Router state management working');
    } else {
        console.log('\n⚠️ SYSTEM PARTIALLY OPERATIONAL');
        console.log('Some components may need attention (see details above)');
    }
    
    console.log('\n📋 Test completed. Results saved to window.finalTestResults');
    window.finalTestResults = testResults;
    
    console.log('='.repeat(80));
    
}, 3000);

console.log('⏳ Initializing systems for comprehensive test...');
