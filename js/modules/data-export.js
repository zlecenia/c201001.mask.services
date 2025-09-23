/**
 * MASKTRONIC C20 - Data Export Module
 * Standardized import/export system for JSON, XML, CSV, and PDF formats
 * Supports direct PDF generation from JavaScript without server dependencies
 */

define('modules/data-export', [], function() {

    /**
     * Data Export Manager - handles all export formats
     */
    class DataExportManager {
        constructor() {
            this.supportedFormats = ['json', 'xml', 'csv', 'pdf'];
            this.init();
        }

        init() {
            console.log('📊 DataExportManager initialized with formats:', this.supportedFormats);
        }

        /**
         * Export data to JSON format
         * @param {Object|Array} data - Data to export
         * @param {string} filename - Output filename
         * @param {Object} options - Export options
         */
        exportToJSON(data, filename = 'data.json', options = {}) {
            try {
                const jsonData = JSON.stringify(data, null, options.pretty ? 2 : 0);
                const blob = new Blob([jsonData], { type: 'application/json' });
                this.downloadFile(blob, filename);
                
                console.log('✅ JSON export successful:', filename);
                return { success: true, format: 'json', filename, contentType: 'application/json' };
            } catch (error) {
                console.error('❌ JSON export failed:', error);
                return { success: false, error: error.message };
            }
        }

        /**
         * Export data to XML format
         * @param {Object|Array} data - Data to export
         * @param {string} filename - Output filename
         * @param {Object} options - Export options
         */
        exportToXML(data, filename = 'data.xml', options = {}) {
            try {
                const rootElement = options.rootElement || 'data';
                const xmlContent = this.objectToXML(data, rootElement, options);
                const blob = new Blob([xmlContent], { type: 'application/xml' });
                this.downloadFile(blob, filename);
                
                console.log('✅ XML export successful:', filename);
                return { success: true, format: 'xml', filename, contentType: 'application/xml' };
            } catch (error) {
                console.error('❌ XML export failed:', error);
                return { success: false, error: error.message };
            }
        }

        /**
         * Export data to CSV format
         * @param {Array} data - Array of objects to export
         * @param {string} filename - Output filename
         * @param {Object} options - Export options
         */
        exportToCSV(data, filename = 'data.csv', options = {}) {
            try {
                if (!Array.isArray(data)) {
                    throw new Error('CSV export requires array of objects');
                }
                
                const csvContent = this.arrayToCSV(data, options);
                const blob = new Blob([csvContent], { type: 'text/csv' });
                this.downloadFile(blob, filename);
                
                console.log('✅ CSV export successful:', filename);
                return { success: true, format: 'csv', filename, contentType: 'text/csv' };
            } catch (error) {
                console.error('❌ CSV export failed:', error);
                return { success: false, error: error.message };
            }
        }

        /**
         * Export data to PDF format using jsPDF
         * @param {Object|Array} data - Data to export
         * @param {string} filename - Output filename
         * @param {Object} options - PDF export options
         */
        exportToPDF(data, filename = 'data.pdf', options = {}) {
            try {
                // Check if jsPDF is available
                if (typeof window.jsPDF === 'undefined') {
                    throw new Error('jsPDF library not loaded. Include jsPDF script.');
                }
                
                const { jsPDF } = window.jsPDF;
                const doc = new jsPDF(options.orientation || 'portrait');
                
                // Configure PDF options
                const config = {
                    title: options.title || 'MASKTRONIC C20 Data Export',
                    margin: options.margin || 20,
                    fontSize: options.fontSize || 12,
                    lineHeight: options.lineHeight || 6,
                    ...options
                };
                
                this.generatePDFContent(doc, data, config);
                
                // Save the PDF
                doc.save(filename);
                
                console.log('✅ PDF export successful:', filename);
                return { success: true, format: 'pdf', filename, contentType: 'application/pdf' };
            } catch (error) {
                console.error('❌ PDF export failed:', error);
                return { success: false, error: error.message };
            }
        }

        /**
         * Generate PDF content from data
         * @private
         */
        generatePDFContent(doc, data, config) {
            let yPosition = config.margin;
            
            // Title
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(config.title, config.margin, yPosition);
            yPosition += config.lineHeight * 3;
            
            // Timestamp
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleString()}`, config.margin, yPosition);
            yPosition += config.lineHeight * 2;
            
            // Data content
            doc.setFontSize(config.fontSize);
            
            if (Array.isArray(data)) {
                this.addArrayToPDF(doc, data, config, yPosition);
            } else if (typeof data === 'object') {
                this.addObjectToPDF(doc, data, config, yPosition);
            } else {
                doc.text(String(data), config.margin, yPosition);
            }
        }

        /**
         * Add array data to PDF as table
         * @private
         */
        addArrayToPDF(doc, data, config, startY) {
            if (data.length === 0) return;
            
            let yPosition = startY;
            const pageHeight = doc.internal.pageSize.height;
            
            // Table headers
            const firstItem = data[0];
            const headers = Object.keys(firstItem);
            const colWidth = (doc.internal.pageSize.width - 2 * config.margin) / headers.length;
            
            // Draw headers
            doc.setFont('helvetica', 'bold');
            headers.forEach((header, index) => {
                doc.text(header, config.margin + index * colWidth, yPosition);
            });
            yPosition += config.lineHeight;
            
            // Draw line under headers
            doc.line(config.margin, yPosition, doc.internal.pageSize.width - config.margin, yPosition);
            yPosition += config.lineHeight;
            
            // Draw data rows
            doc.setFont('helvetica', 'normal');
            data.forEach(item => {
                if (yPosition > pageHeight - config.margin) {
                    doc.addPage();
                    yPosition = config.margin;
                }
                
                headers.forEach((header, index) => {
                    const value = item[header] ? String(item[header]) : '';
                    doc.text(value.substring(0, 30), config.margin + index * colWidth, yPosition);
                });
                yPosition += config.lineHeight;
            });
        }

        /**
         * Add object data to PDF
         * @private
         */
        addObjectToPDF(doc, data, config, startY) {
            let yPosition = startY;
            const pageHeight = doc.internal.pageSize.height;
            
            Object.entries(data).forEach(([key, value]) => {
                if (yPosition > pageHeight - config.margin) {
                    doc.addPage();
                    yPosition = config.margin;
                }
                
                doc.setFont('helvetica', 'bold');
                doc.text(`${key}:`, config.margin, yPosition);
                doc.setFont('helvetica', 'normal');
                doc.text(String(value), config.margin + 40, yPosition);
                yPosition += config.lineHeight;
            });
        }

        /**
         * Convert object to XML string
         * @private
         */
        objectToXML(obj, rootElement = 'data', options = {}) {
            const indent = options.indent || '  ';
            let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n`;
            
            const convertValue = (value, key, level = 1) => {
                const indentation = indent.repeat(level);
                
                if (Array.isArray(value)) {
                    return value.map(item => {
                        if (typeof item === 'object') {
                            return `${indentation}<${key}>\n${Object.entries(item).map(([k, v]) => 
                                convertValue(v, k, level + 1)).join('')}${indentation}</${key}>\n`;
                        } else {
                            return `${indentation}<${key}>${this.escapeXML(item)}</${key}>\n`;
                        }
                    }).join('');
                } else if (typeof value === 'object' && value !== null) {
                    return `${indentation}<${key}>\n${Object.entries(value).map(([k, v]) => 
                        convertValue(v, k, level + 1)).join('')}${indentation}</${key}>\n`;
                } else {
                    return `${indentation}<${key}>${this.escapeXML(value)}</${key}>\n`;
                }
            };
            
            if (typeof obj === 'object' && obj !== null) {
                xml += Object.entries(obj).map(([key, value]) => 
                    convertValue(value, key)).join('');
            }
            
            xml += `</${rootElement}>`;
            return xml;
        }

        /**
         * Convert array to CSV string
         * @private
         */
        arrayToCSV(data, options = {}) {
            if (data.length === 0) return '';
            
            const delimiter = options.delimiter || ',';
            const quote = options.quote || '"';
            const includeHeaders = options.includeHeaders !== false;
            
            // Get headers from first object
            const headers = Object.keys(data[0]);
            let csv = '';
            
            // Add headers
            if (includeHeaders) {
                csv += headers.map(header => this.escapeCSV(header, delimiter, quote)).join(delimiter) + '\n';
            }
            
            // Add data rows
            data.forEach(row => {
                const values = headers.map(header => {
                    const value = row[header] !== undefined ? row[header] : '';
                    return this.escapeCSV(value, delimiter, quote);
                });
                csv += values.join(delimiter) + '\n';
            });
            
            return csv;
        }

        /**
         * Escape XML special characters
         * @private
         */
        escapeXML(value) {
            if (value === null || value === undefined) return '';
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        }

        /**
         * Escape CSV values
         * @private
         */
        escapeCSV(value, delimiter, quote) {
            if (value === null || value === undefined) return '';
            const str = String(value);
            
            // Quote if contains delimiter, quote, or newline
            if (str.includes(delimiter) || str.includes(quote) || str.includes('\n') || str.includes('\r')) {
                return quote + str.replace(new RegExp(quote, 'g'), quote + quote) + quote;
            }
            return str;
        }

        /**
         * Download file using browser
         * @private
         */
        downloadFile(blob, filename) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        /**
         * Export user data with all formats
         * @param {Object} userData - User management data
         */
        exportUserData(userData, format = 'json') {
            const timestamp = new Date().toISOString().split('T')[0];
            const baseFilename = `masktronic_users_${timestamp}`;
            
            switch (format) {
                case 'json':
                    return this.exportToJSON(userData, `${baseFilename}.json`, { pretty: true });
                case 'xml':
                    return this.exportToXML(userData, `${baseFilename}.xml`, { rootElement: 'users' });
                case 'csv':
                    const users = Array.isArray(userData) ? userData : [userData];
                    return this.exportToCSV(users, `${baseFilename}.csv`);
                case 'pdf':
                    return this.exportToPDF(userData, `${baseFilename}.pdf`, {
                        title: 'MASKTRONIC C20 - Users Report',
                        orientation: 'portrait'
                    });
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        }

        /**
         * Export test data with all formats
         * @param {Object} testData - Test results data
         */
        exportTestData(testData, format = 'json') {
            const timestamp = new Date().toISOString().split('T')[0];
            const baseFilename = `masktronic_tests_${timestamp}`;
            
            switch (format) {
                case 'json':
                    return this.exportToJSON(testData, `${baseFilename}.json`, { pretty: true });
                case 'xml':
                    return this.exportToXML(testData, `${baseFilename}.xml`, { rootElement: 'tests' });
                case 'csv':
                    const tests = Array.isArray(testData) ? testData : [testData];
                    return this.exportToCSV(tests, `${baseFilename}.csv`);
                case 'pdf':
                    return this.exportToPDF(testData, `${baseFilename}.pdf`, {
                        title: 'MASKTRONIC C20 - Test Results Report',
                        orientation: 'landscape'
                    });
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        }
    }

    // Create global instance
    const dataExporter = new DataExportManager();

    // Export to global scope for compatibility
    window.DataExportManager = DataExportManager;
    window.dataExporter = dataExporter;

    // Return module for AMD
    return dataExporter;
});
