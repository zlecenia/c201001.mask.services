/**
 * HTML Structure Analyzer for MASKSERVICE C20
 * Analyzes current HTML for duplicates, missing content, and modularization opportunities
 */

const fs = require('fs');
const path = require('path');

// Read the current index.html
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log('🔍 MASKSERVICE C20 HTML Structure Analysis');
console.log('='.repeat(60));

// Extract templates from HTML
function extractTemplates(html) {
    const templates = [];
    const templateRegex = /<div id="([^"]*template[^"]*)"[^>]*>([\s\S]*?)<\/div>/gi;
    let match;
    
    while ((match = templateRegex.exec(html)) !== null) {
        templates.push({
            id: match[1],
            content: match[2].trim(),
            fullMatch: match[0]
        });
    }
    
    return templates;
}

// Extract screens from HTML
function extractScreens(html) {
    const screens = [];
    const screenRegex = /<div id="([^"]*screen[^"]*)"[^>]*class="screen[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    let match;
    
    while ((match = screenRegex.exec(html)) !== null) {
        screens.push({
            id: match[1],
            content: match[2].trim(),
            fullMatch: match[0]
        });
    }
    
    return screens;
}

// Check for duplicate content
function findDuplicates(items) {
    const duplicates = [];
    const contentMap = new Map();
    
    items.forEach((item, index) => {
        // Normalize content for comparison (remove whitespace differences)
        const normalized = item.content.replace(/\s+/g, ' ').trim();
        
        if (contentMap.has(normalized)) {
            duplicates.push({
                item1: contentMap.get(normalized),
                item2: item,
                similarity: 'exact'
            });
        } else {
            contentMap.set(normalized, item);
        }
    });
    
    return duplicates;
}

// Check for missing export sections
function checkMissingExportSections(templates) {
    const missing = [];
    
    templates.forEach(template => {
        const hasExportSection = template.content.includes('export-section') || 
                                template.content.includes('exportTestData') ||
                                template.content.includes('exportUserData') ||
                                template.content.includes('exportUsersData') ||
                                template.content.includes('exportServiceData') ||
                                template.content.includes('exportSettingsData');
        
        if (!hasExportSection && 
            !template.id.includes('device-select') && 
            !template.id.includes('workshop-template') &&
            !template.id.includes('device-data')) {
            missing.push(template.id);
        }
    });
    
    return missing;
}

// Analyze i18n coverage
function analyzeI18nCoverage(html) {
    const i18nElements = html.match(/data-i18n="[^"]*"/g) || [];
    const totalElements = html.match(/<[^>]*>[^<]*<\/[^>]*>/g) || [];
    const textElements = html.match(/>([\w\s]{3,})</g) || [];
    
    return {
        i18nElements: i18nElements.length,
        estimatedTextElements: textElements.length,
        coverage: ((i18nElements.length / textElements.length) * 100).toFixed(1) + '%'
    };
}

// Main analysis
const templates = extractTemplates(htmlContent);
const screens = extractScreens(htmlContent);
const templateDuplicates = findDuplicates(templates);
const missingExports = checkMissingExportSections(templates);
const i18nStats = analyzeI18nCoverage(htmlContent);

console.log('📊 ANALYSIS RESULTS:');
console.log('');

console.log('🎯 Templates Found:', templates.length);
templates.forEach(t => console.log(`  - ${t.id} (${t.content.length} chars)`));

console.log('');
console.log('🖥️ Screens Found:', screens.length);
screens.forEach(s => console.log(`  - ${s.id} (${s.content.length} chars)`));

console.log('');
console.log('🔄 Duplicate Analysis:');
if (templateDuplicates.length === 0) {
    console.log('  ✅ No exact duplicates found');
} else {
    templateDuplicates.forEach(dup => {
        console.log(`  ⚠️ Duplicate: ${dup.item1.id} ≈ ${dup.item2.id}`);
    });
}

console.log('');
console.log('📤 Missing Export Sections:');
if (missingExports.length === 0) {
    console.log('  ✅ All applicable templates have export sections');
} else {
    missingExports.forEach(missing => {
        console.log(`  ❌ Missing export: ${missing}`);
    });
}

console.log('');
console.log('🌐 Internationalization Coverage:');
console.log(`  📝 Elements with i18n: ${i18nStats.i18nElements}`);
console.log(`  📄 Estimated text elements: ${i18nStats.estimatedTextElements}`);
console.log(`  📊 Coverage: ${i18nStats.coverage}`);

console.log('');
console.log('💾 File Size Analysis:');
console.log(`  📄 Total HTML size: ${(htmlContent.length / 1024).toFixed(1)} KB`);
console.log(`  📊 Templates size: ${templates.reduce((sum, t) => sum + t.content.length, 0)} chars`);
console.log(`  🖥️ Screens size: ${screens.reduce((sum, s) => sum + s.content.length, 0)} chars`);

console.log('');
console.log('🎯 MODULARIZATION RECOMMENDATIONS:');
console.log('');

console.log('1. 📦 Create separate files for:');
templates.forEach(t => {
    console.log(`   - views/templates/${t.id}.html`);
});

screens.forEach(s => {
    console.log(`   - views/screens/${s.id}.html`);
});

console.log('');
console.log('2. 🔧 Create template loader system');
console.log('3. 📱 Optimize for 400x1280px display');
console.log('4. 🌐 Complete i18n coverage');
console.log('5. ⚡ Implement lazy loading');

console.log('');
console.log('='.repeat(60));
console.log('✅ Analysis complete! Ready for modularization.');
