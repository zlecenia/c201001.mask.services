/**
 * MASKSERVICE C20 - Template Extractor
 * Automatically extracts all templates and screens from index.html into separate files
 */

const fs = require('fs');
const path = require('path');

// Read the current index.html
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log('🔧 Extracting templates and screens from index.html...');

// Extract templates function
function extractAndSaveTemplates(html) {
    const templateRegex = /<div id="([^"]*template[^"]*)"[^>]*>([\s\S]*?)<\/div>(?=\s*(?:<\/div>|<div id=|<!--))/gi;
    let match;
    let extractedCount = 0;
    
    while ((match = templateRegex.exec(html)) !== null) {
        const templateId = match[1];
        const content = match[2].trim();
        
        // Skip the main templates container
        if (templateId === 'templates') {
            continue;
        }
        
        const filePath = path.join(__dirname, 'views', 'templates', `${templateId}.html`);
        
        try {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Extracted: ${templateId} (${content.length} chars)`);
            extractedCount++;
        } catch (error) {
            console.error(`❌ Failed to extract ${templateId}:`, error.message);
        }
    }
    
    return extractedCount;
}

// Extract screens function
function extractAndSaveScreens(html) {
    const screenRegex = /<div id="([^"]*screen[^"]*)"[^>]*class="screen[^"]*"[^>]*>([\s\S]*?)<\/div>(?=\s*(?:<\/div>|<!--|\s*<div))/gi;
    let match;
    let extractedCount = 0;
    
    while ((match = screenRegex.exec(html)) !== null) {
        const screenId = match[1];
        const content = match[2].trim();
        
        const filePath = path.join(__dirname, 'views', 'screens', `${screenId}.html`);
        
        try {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Extracted: ${screenId} (${content.length} chars)`);
            extractedCount++;
        } catch (error) {
            console.error(`❌ Failed to extract ${screenId}:`, error.message);
        }
    }
    
    return extractedCount;
}

// Main extraction
const templatesExtracted = extractAndSaveTemplates(htmlContent);
const screensExtracted = extractAndSaveScreens(htmlContent);

console.log('');
console.log('📊 EXTRACTION SUMMARY:');
console.log(`📄 Templates extracted: ${templatesExtracted}`);
console.log(`🖥️ Screens extracted: ${screensExtracted}`);
console.log(`📦 Total files created: ${templatesExtracted + screensExtracted}`);
console.log('');
console.log('✅ Extraction complete! All views are now modularized.');

// Create a summary file
const summary = {
    timestamp: new Date().toISOString(),
    extracted: {
        templates: templatesExtracted,
        screens: screensExtracted,
        total: templatesExtracted + screensExtracted
    },
    structure: {
        'views/templates/': templatesExtracted,
        'views/screens/': screensExtracted
    }
};

fs.writeFileSync('extraction-summary.json', JSON.stringify(summary, null, 2));
console.log('📋 Summary saved to extraction-summary.json');
