/**
 * MASKSERVICE C20 - Enhanced Test Menu Module (Orchestrator)
 * Coordinates modular test components
 * Compliance with PN-EN 136/137 standards
 */

class TestMenuEnhanced {
    constructor() {
        this.init();
    }

    init() {
        // Initialize modular components
        this.testWizard = new TestWizard();
        this.testQuick = new TestQuick();
        this.testScenarios = new TestScenarios();
        
        // Make components globally accessible
        window.testWizard = this.testWizard;
        window.testQuick = this.testQuick;
        window.testScenarios = this.testScenarios;
        
        console.log('✅ Test Menu Enhanced: All modular components loaded');
    }

    // Delegation methods for Test Wizard
    showTestWizard() {
        return this.testWizard.showTestWizard();
    }

    // Delegation methods for Quick Test
    showQuickTest() {
        return this.testQuick.showQuickTest();
    }

    // Delegation methods for Test Scenarios
    showTestScenarios() {
        return this.testScenarios.showTestScenarios();
    }
}

// Create global instance
window.testMenuEnhanced = new TestMenuEnhanced();

console.log('✅ Enhanced Test Menu Module (Orchestrator) loaded');
