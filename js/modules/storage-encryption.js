/**
 * MASKSERVICE C20 - Storage Encryption Module
 * Handles encryption and decryption of storage data
 */

// AMD/RequireJS module definition
define('storage-encryption', [], function() {

class StorageEncryption {
    constructor() {
        this.encryptionKey = 'mask_c20_2024';
        console.log('🔐 StorageEncryption initialized');
    }

    /**
     * Simple string encryption (XOR cipher)
     * @param {string} str - String to encrypt
     * @returns {string} Encrypted string
     */
    encryptString(str) {
        if (!str || typeof str !== 'string') {
            return str;
        }

        try {
            let result = '';
            for (let i = 0; i < str.length; i++) {
                const keyChar = this.encryptionKey[i % this.encryptionKey.length];
                result += String.fromCharCode(str.charCodeAt(i) ^ keyChar.charCodeAt(0));
            }
            return btoa(result); // Base64 encode
        } catch (error) {
            console.error('❌ Encryption failed:', error);
            return str;
        }
    }

    /**
     * Simple string decryption
     * @param {string} str - String to decrypt
     * @returns {string} Decrypted string
     */
    decryptString(str) {
        if (!str || typeof str !== 'string') {
            return str;
        }

        try {
            const decoded = atob(str); // Base64 decode
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                const keyChar = this.encryptionKey[i % this.encryptionKey.length];
                result += String.fromCharCode(decoded.charCodeAt(i) ^ keyChar.charCodeAt(0));
            }
            return result;
        } catch (error) {
            console.error('❌ Decryption failed:', error);
            return str;
        }
    }

    /**
     * Encrypt an object by converting to JSON first
     * @param {Object} obj - Object to encrypt
     * @returns {string} Encrypted JSON string
     */
    encryptObject(obj) {
        try {
            const jsonStr = JSON.stringify(obj);
            return this.encryptString(jsonStr);
        } catch (error) {
            console.error('❌ Object encryption failed:', error);
            return JSON.stringify(obj);
        }
    }

    /**
     * Decrypt a string and parse as JSON object
     * @param {string} encryptedStr - Encrypted string to decrypt
     * @returns {Object} Decrypted and parsed object
     */
    decryptObject(encryptedStr) {
        try {
            const decryptedStr = this.decryptString(encryptedStr);
            return JSON.parse(decryptedStr);
        } catch (error) {
            console.error('❌ Object decryption failed:', error);
            try {
                // Try parsing as plain JSON if decryption fails
                return JSON.parse(encryptedStr);
            } catch (parseError) {
                return null;
            }
        }
    }

    /**
     * Check if a string appears to be encrypted (base64)
     * @param {string} str - String to check
     * @returns {boolean} True if appears encrypted
     */
    isEncrypted(str) {
        if (!str || typeof str !== 'string') {
            return false;
        }

        try {
            // Check if it's valid base64
            return btoa(atob(str)) === str;
        } catch (error) {
            return false;
        }
    }

    /**
     * Generate a random encryption key
     * @param {number} length - Key length (default: 16)
     * @returns {string} Random key
     */
    generateKey(length = 16) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Set encryption key
     * @param {string} key - New encryption key
     */
    setEncryptionKey(key) {
        if (key && typeof key === 'string' && key.length >= 8) {
            this.encryptionKey = key;
            console.log('🔐 Encryption key updated');
        } else {
            console.warn('⚠️ Invalid encryption key provided');
        }
    }

    /**
     * Get current encryption key (for testing/debugging only)
     * @returns {string} Current encryption key
     */
    getEncryptionKey() {
        return this.encryptionKey;
    }
}

    // Export for backwards compatibility
    if (typeof window !== 'undefined') {
        window.StorageEncryption = StorageEncryption;
    }

    // Return StorageEncryption class for AMD/RequireJS
    return StorageEncryption;
});
