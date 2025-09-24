/**
 * MASKTRONIC C20 - Comprehensive View Test Runner
 * Automated testing script for all application views and functionality
 */

console.log('🚀 Starting comprehensive view testing...');

// Wait for page to fully load
window.addEventListener('load', async function() {
    // Give the application time to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📊 MASKTRONIC C20 - COMPREHENSIVE VIEW TEST REPORT');
    console.log('='.repeat(80));
    
    // Check if ViewTester is available
    if (typeof window.viewTester === 'undefined') {
        console.error('❌ ViewTester not available - cannot run comprehensive tests');
        return;
    }
    
    console.log('✅ ViewTester available - starting comprehensive testing...');
    
    try {
        // Run comprehensive view tests
        const report = await runComprehensiveViewTests();
        
        // Display final summary
        displayFinalSummary(report);
        
        // Save results to console and localStorage
        console.log('💾 Test results saved to localStorage as "comprehensiveViewTestReport"');
        localStorage.setItem('comprehensiveViewTestReport', JSON.stringify(report));
        
    } catch (error) {
        console.error('❌ Error during comprehensive testing:', error);
    }
});

async function runComprehensiveViewTests() {
    const startTime = Date.now();
    
    console.log('\n🧪 PHASE 1: Template Availability Testing');
    console.log('-'.repeat(50));
    
    // Test all templates
    const templateResults = await testAllTemplates();
    
    console.log('\n🧪 PHASE 2: Menu Navigation Testing');
    console.log('-'.repeat(50));
    
    // Test menu navigation (need to login first)
    const navigationResults = await testMenuNavigation();
    
    console.log('\n🧪 PHASE 3: Interactive Elements Testing');
    console.log('-'.repeat(50));
    
    // Test interactive elements
    const interactiveResults = await testInteractiveElements();
    
    console.log('\n🧪 PHASE 4: Content Validation Testing');
    console.log('-'.repeat(50));
    
    // Test content validation
    const contentResults = await testContentValidation();
    
    console.log('\n🧪 PHASE 5: System Integration Testing');
    console.log('-'.repeat(50));
    
    // Test system integration
    const integrationResults = await testSystemIntegration();
    
    const endTime = Date.now();
    const totalDuration = (endTime - startTime) / 1000;
    
    return {
        timestamp: new Date().toISOString(),
        duration: `${totalDuration.toFixed(2)}s`,
        phases: {
            templates: templateResults,
            navigation: navigationResults,
            interactive: interactiveResults,
            content: contentResults,
            integration: integrationResults
        },
        summary: calculateOverallSummary([
            templateResults,
            navigationResults, 
            interactiveResults,
            contentResults,
            integrationResults
        ])
    };
}

async function testAllTemplates() {
    console.log('Testing template availability...');
    
    const templates = [
        'login-screen',
        'system-screen', 
        'user-menu-screen',
        'test-menu-template',
        'device-select-template',
        'workshop-template',
        'user-data-template',
        'device-data-template',
        'test-reports-template',
        'users-template',
        'service-menu-template',
        'system-settings-template',
        'device-history-template',
        'reports-view-template',
        'reports-batch-template',
        'realtime-sensors-template',
        'reports-schedule-template',
        'workshop-parts-template',
        'workshop-maintenance-template',
        'workshop-tools-template',
        'workshop-inventory-template'
    ];
    
    const results = [];
    let passed = 0;
    
    for (const templateId of templates) {
        const template = document.getElementById(templateId);
        if (template && template.innerHTML.trim().length > 0) {
            console.log(`✅ ${templateId}: Available (${template.innerHTML.length} chars)`);
            results.push({
                template: templateId,
                status: 'PASS',
                contentLength: template.innerHTML.length
            });
            passed++;
        } else if (template) {
            console.log(`⚠️  ${templateId}: Empty content`);
            results.push({
                template: templateId,
                status: 'PARTIAL',
                issue: 'Empty content'
            });
        } else {
            console.log(`❌ ${templateId}: Not found`);
            results.push({
                template: templateId,
                status: 'FAIL',
                issue: 'Template not found'
            });
        }
    }
    
    console.log(`📊 Template Test Summary: ${passed}/${templates.length} templates passed`);
    
    return {
        total: templates.length,
        passed: passed,
        failed: templates.length - passed,
        successRate: ((passed / templates.length) * 100).toFixed(1) + '%',
        details: results
    };
}

async function testMenuNavigation() {
    console.log('Testing menu navigation...');
    
    // First login as OPERATOR
    if (window.mockLogin) {
        window.mockLogin('OPERATOR');
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('🔐 Logged in as OPERATOR for navigation testing');
    }
    
    const menuOptions = [
        'user_data',
        'realtime_sensors',
        'reports_view', 
        'reports_batch',
        'reports_schedule',
        'workshop_parts',
        'workshop_maintenance',
        'workshop_tools',
        'workshop_inventory',
        'users',
        'service_menu',
        'settings_scenarios',
        'settings_integration',
        'settings_standards',
        'settings_system'
    ];
    
    const results = [];
    let passed = 0;
    
    for (const menuOption of menuOptions) {
        try {
            // Capture console errors
            let errorCaught = null;
            const originalError = console.error;
            console.error = (msg) => {
                if (msg.includes('Template not found') || msg.includes('not available')) {
                    errorCaught = msg;
                }
                originalError(msg);
            };
            
            if (window.MenuManager?.selectMenuOption) {
                window.MenuManager.selectMenuOption(menuOption);
                await new Promise(resolve => setTimeout(resolve, 200));
                
                if (errorCaught) {
                    console.log(`❌ ${menuOption}: ${errorCaught}`);
                    results.push({
                        menuOption: menuOption,
                        status: 'FAIL',
                        error: errorCaught
                    });
                } else {
                    console.log(`✅ ${menuOption}: Navigation successful`);
                    results.push({
                        menuOption: menuOption,
                        status: 'PASS'
                    });
                    passed++;
                }
            } else {
                console.log(`❌ ${menuOption}: MenuManager not available`);
                results.push({
                    menuOption: menuOption,
                    status: 'FAIL',
                    error: 'MenuManager not available'
                });
            }
            
            console.error = originalError;
            
        } catch (error) {
            console.log(`❌ ${menuOption}: ${error.message}`);
            results.push({
                menuOption: menuOption,
                status: 'FAIL',
                error: error.message
            });
        }
    }
    
    console.log(`📊 Navigation Test Summary: ${passed}/${menuOptions.length} menu options passed`);
    
    return {
        total: menuOptions.length,
        passed: passed,
        failed: menuOptions.length - passed,
        successRate: ((passed / menuOptions.length) * 100).toFixed(1) + '%',
        details: results
    };
}

async function testInteractiveElements() {
    console.log('Testing interactive elements...');
    
    const buttons = document.querySelectorAll('button, .btn');
    const menuItems = document.querySelectorAll('.menu-item');
    const inputs = document.querySelectorAll('input, select, textarea');
    
    let workingButtons = 0;
    let workingMenuItems = 0;
    let workingInputs = 0;
    
    buttons.forEach(btn => {
        if (btn.onclick || btn.getAttribute('onclick')) {
            workingButtons++;
        }
    });
    
    menuItems.forEach(item => {
        if (item.onclick || item.getAttribute('onclick')) {
            workingMenuItems++;
        }
    });
    
    inputs.forEach(input => {
        if (!input.disabled && !input.readonly) {
            workingInputs++;
        }
    });
    
    console.log(`✅ Interactive Elements: ${buttons.length} buttons (${workingButtons} with handlers)`);
    console.log(`✅ Menu Items: ${menuItems.length} items (${workingMenuItems} interactive)`);
    console.log(`✅ Input Fields: ${inputs.length} inputs (${workingInputs} functional)`);
    
    return {
        buttons: {
            total: buttons.length,
            working: workingButtons,
            percentage: buttons.length > 0 ? ((workingButtons / buttons.length) * 100).toFixed(1) + '%' : '0%'
        },
        menuItems: {
            total: menuItems.length,
            working: workingMenuItems,
            percentage: menuItems.length > 0 ? ((workingMenuItems / menuItems.length) * 100).toFixed(1) + '%' : '0%'
        },
        inputs: {
            total: inputs.length,
            working: workingInputs,
            percentage: inputs.length > 0 ? ((workingInputs / inputs.length) * 100).toFixed(1) + '%' : '0%'
        }
    };
}

async function testContentValidation() {
    console.log('Testing content validation...');
    
    const contentChecks = [
        { selector: 'h1, h2, h3, h4, h5, h6', name: 'Headers' },
        { selector: '[data-i18n]', name: 'Translatable elements' },
        { selector: '.menu-card, .card', name: 'Card components' },
        { selector: '.export-section', name: 'Export functionality' },
        { selector: '.loading-overlay', name: 'Loading indicators' }
    ];
    
    const results = [];
    
    contentChecks.forEach(check => {
        const elements = document.querySelectorAll(check.selector);
        console.log(`✅ ${check.name}: ${elements.length} found`);
        results.push({
            type: check.name,
            count: elements.length,
            status: elements.length > 0 ? 'PASS' : 'FAIL'
        });
    });
    
    return {
        checks: results,
        summary: `${contentChecks.length} content validation checks completed`
    };
}

async function testSystemIntegration() {
    console.log('Testing system integration...');
    
    const integrationTests = [
        { name: 'Router System', check: () => window.C20Router },
        { name: 'Menu Manager', check: () => window.MenuManager },
        { name: 'Auth System', check: () => window.mockLogin },
        { name: 'Config Manager', check: () => window.ConfigManager },
        { name: 'i18n System', check: () => window.changeLanguage },
        { name: 'ViewTester', check: () => window.viewTester },
        { name: 'Virtual Keyboard', check: () => window.VirtualKeyboard },
        { name: 'Data Export', check: () => window.exportTestData }
    ];
    
    const results = [];
    let passed = 0;
    
    integrationTests.forEach(test => {
        const available = test.check();
        if (available) {
            console.log(`✅ ${test.name}: Available`);
            results.push({ system: test.name, status: 'PASS' });
            passed++;
        } else {
            console.log(`❌ ${test.name}: Not available`);
            results.push({ system: test.name, status: 'FAIL' });
        }
    });
    
    return {
        total: integrationTests.length,
        passed: passed,
        failed: integrationTests.length - passed,
        successRate: ((passed / integrationTests.length) * 100).toFixed(1) + '%',
        details: results
    };
}

function calculateOverallSummary(phaseResults) {
    let totalTests = 0;
    let totalPassed = 0;
    
    phaseResults.forEach(phase => {
        if (phase.total && phase.passed) {
            totalTests += phase.total;
            totalPassed += phase.passed;
        }
    });
    
    return {
        totalTests: totalTests,
        totalPassed: totalPassed,
        totalFailed: totalTests - totalPassed,
        overallSuccessRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) + '%' : '0%'
    };
}

function displayFinalSummary(report) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`⏱️  Total Duration: ${report.duration}`);
    console.log(`📋 Total Tests: ${report.summary.totalTests}`);
    console.log(`✅ Passed: ${report.summary.totalPassed}`);
    console.log(`❌ Failed: ${report.summary.totalFailed}`);
    console.log(`📈 Overall Success Rate: ${report.summary.overallSuccessRate}`);
    console.log('');
    
    // Phase breakdown
    console.log('📊 PHASE BREAKDOWN:');
    console.log(`🧩 Templates: ${report.phases.templates.successRate} (${report.phases.templates.passed}/${report.phases.templates.total})`);
    console.log(`🧭 Navigation: ${report.phases.navigation.successRate} (${report.phases.navigation.passed}/${report.phases.navigation.total})`);
    console.log(`🎯 Interactive: Multiple categories tested`);
    console.log(`📄 Content: ${report.phases.content.checks.length} validation checks`);
    console.log(`🔧 Integration: ${report.phases.integration.successRate} (${report.phases.integration.passed}/${report.phases.integration.total})`);
    
    console.log('\n' + '='.repeat(80));
    
    if (report.summary.overallSuccessRate === '100.0%') {
        console.log('🎉 ALL VIEWS AND FUNCTIONALITY WORKING PERFECTLY!');
    } else if (parseFloat(report.summary.overallSuccessRate) >= 90) {
        console.log('✅ EXCELLENT - Most views working with minor issues');
    } else if (parseFloat(report.summary.overallSuccessRate) >= 75) {
        console.log('⚠️  GOOD - Most functionality working, some fixes needed');
    } else {
        console.log('❌ NEEDS ATTENTION - Several issues found that need fixing');
    }
    
    console.log('='.repeat(80));
}

console.log('📋 Comprehensive View Test Runner loaded - tests will start automatically');
