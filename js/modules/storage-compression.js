/**
 * MASKSERVICE C20 - Storage Compression Module
 * Handles compression and decompression of storage data
 */

// AMD/RequireJS module definition
define('modules/storage-compression', [], function() {

class StorageCompression {
    constructor() {
        this.compressionEnabled = true;
        this.compressionThreshold = 100; // Compress strings longer than 100 characters
        console.log('🗜️ StorageCompression initialized');
    }

    /**
     * Simple string compression using run-length encoding
     * @param {string} str - String to compress
     * @returns {string} Compressed string
     */
    compressString(str) {
        if (!str || typeof str !== 'string' || str.length < this.compressionThreshold) {
            return str;
        }

        try {
            // Simple run-length encoding for repeating characters
            let compressed = str.replace(/(.)\1{2,}/g, (match, char) => {
                return `${char}${match.length}`;
            });

            // Add compression marker
            compressed = '~C~' + compressed;
            
            // Only return compressed version if it's actually smaller
            return compressed.length < str.length ? compressed : str;
        } catch (error) {
            console.error('❌ Compression failed:', error);
            return str;
        }
    }

    /**
     * Simple string decompression
     * @param {string} str - String to decompress
     * @returns {string} Decompressed string
     */
    decompressString(str) {
        if (!str || typeof str !== 'string' || !this.isCompressed(str)) {
            return str;
        }

        try {
            // Remove compression marker
            const compressedData = str.substring(3); // Remove '~C~'
            
            // Reverse run-length encoding
            const decompressed = compressedData.replace(/(.)\d+/g, (match, char) => {
                const count = parseInt(match.substring(1));
                return char.repeat(count);
            });

            return decompressed;
        } catch (error) {
            console.error('❌ Decompression failed:', error);
            return str;
        }
    }

    /**
     * Check if a string is compressed
     * @param {string} str - String to check
     * @returns {boolean} True if string appears compressed
     */
    isCompressed(str) {
        return str && typeof str === 'string' && str.startsWith('~C~');
    }

    /**
     * Compress an object by converting to JSON first
     * @param {Object} obj - Object to compress
     * @returns {string} Compressed JSON string
     */
    compressObject(obj) {
        try {
            const jsonStr = JSON.stringify(obj);
            return this.compressString(jsonStr);
        } catch (error) {
            console.error('❌ Object compression failed:', error);
            return JSON.stringify(obj);
        }
    }

    /**
     * Decompress a string and parse as JSON object
     * @param {string} compressedStr - Compressed string to decompress
     * @returns {Object} Decompressed and parsed object
     */
    decompressObject(compressedStr) {
        try {
            const decompressedStr = this.decompressString(compressedStr);
            return JSON.parse(decompressedStr);
        } catch (error) {
            console.error('❌ Object decompression failed:', error);
            try {
                // Try parsing as plain JSON if decompression fails
                return JSON.parse(compressedStr);
            } catch (parseError) {
                return null;
            }
        }
    }

    /**
     * Get compression statistics for a string
     * @param {string} original - Original string
     * @param {string} compressed - Compressed string
     * @returns {Object} Compression statistics
     */
    getCompressionStats(original, compressed) {
        const originalSize = original ? original.length : 0;
        const compressedSize = compressed ? compressed.length : 0;
        const ratio = originalSize > 0 ? (compressedSize / originalSize) : 1;
        const savings = originalSize - compressedSize;
        const savingsPercent = originalSize > 0 ? ((savings / originalSize) * 100) : 0;

        return {
            originalSize,
            compressedSize,
            ratio: Math.round(ratio * 100) / 100,
            savings,
            savingsPercent: Math.round(savingsPercent * 100) / 100,
            worthwhile: savings > 10 // Only worthwhile if we save more than 10 characters
        };
    }

    /**
     * Enable or disable compression
     * @param {boolean} enabled - Whether compression is enabled
     */
    setCompressionEnabled(enabled) {
        this.compressionEnabled = !!enabled;
        console.log(`🗜️ Compression ${this.compressionEnabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Set compression threshold
     * @param {number} threshold - Minimum string length to compress
     */
    setCompressionThreshold(threshold) {
        if (typeof threshold === 'number' && threshold >= 0) {
            this.compressionThreshold = threshold;
            console.log(`🗜️ Compression threshold set to ${threshold}`);
        }
    }

    /**
     * Test compression effectiveness on sample data
     * @param {string} sampleData - Sample data to test
     * @returns {Object} Test results
     */
    testCompression(sampleData) {
        if (!sampleData) {
            return null;
        }

        const compressed = this.compressString(sampleData);
        const decompressed = this.decompressString(compressed);
        const stats = this.getCompressionStats(sampleData, compressed);
        
        return {
            stats,
            successful: decompressed === sampleData,
            compressed,
            decompressed
        };
    }
}

    // Export for backwards compatibility
    if (typeof window !== 'undefined') {
        window.StorageCompression = StorageCompression;
    }

    // Return StorageCompression class for AMD/RequireJS
    return StorageCompression;
});
