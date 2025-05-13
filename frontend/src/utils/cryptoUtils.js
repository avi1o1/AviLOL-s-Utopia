/**
 * Crypto utility functions for end-to-end encryption
 * These functions handle password hashing, key derivation, and data encryption/decryption
 */

// Text encoder/decoder for data conversion - moved to the top so it's available for all functions
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Creates a consistent hash of a password for use in encryption
 * @param {string} password - The user's password
 * @returns {Promise<string>} - A base64-encoded hash of the password
 */
export async function hashPassword(password) {
    // Convert password string to buffer
    const data = encoder.encode(password);

    // Hash the password using SHA-256
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);

    // Convert the hash to base64 string for storage
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return btoa(String.fromCharCode.apply(null, hashArray));
}

/**
 * Generates a deterministic IV based on content for consistent encryption
 * @param {string} content - The content to create IV from
 * @returns {Uint8Array} - A deterministic IV based on the content
 */
function generateDeterministicIV(content) {
    // Use the first 12 characters of content if available (or pad if shorter)
    const baseString = (content + 'YouTopiaIV12345').substring(0, 12);
    const iv = new Uint8Array(12);

    // Convert string to bytes for the IV
    for (let i = 0; i < 12; i++) {
        iv[i] = baseString.charCodeAt(i % baseString.length);
    }

    return iv;
}

/**
 * Derives an encryption key from a password hash
 * @param {string} passwordHash - The base64-encoded password hash
 * @returns {Promise<CryptoKey>} - A CryptoKey object for encryption/decryption
 */
export async function deriveEncryptionKey(passwordHash) {
    try {
        // Convert base64 hash back to array buffer
        const binaryString = atob(passwordHash);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);

        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Import the hash as a key
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            bytes,
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        // Use PBKDF2 to derive a key from the key material
        const salt = encoder.encode('YouTopia-Salt');
        const key = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        return key;
    } catch (error) {
        console.error('Error deriving key:', error);
        throw new Error('Failed to derive encryption key');
    }
}

/**
 * Encrypts a string or object with the provided key
 * @param {string|object} data - Data to encrypt
 * @param {CryptoKey} key - CryptoKey object for encryption
 * @returns {Promise<string>} - Base64-encoded encrypted data with IV
 */
export async function encryptData(data, key) {
    try {
        // Convert data to string if it's an object
        const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
        const dataBuffer = encoder.encode(dataString);

        // Generate a deterministic IV based on content for consistent encryption results
        const iv = generateDeterministicIV(dataString);

        // Encrypt the data
        const encryptedBuffer = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv
            },
            key,
            dataBuffer
        );

        // Combine IV and encrypted data
        const result = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        result.set(iv);
        result.set(new Uint8Array(encryptedBuffer), iv.length);

        // Convert to base64 for storage
        return btoa(String.fromCharCode.apply(null, result));
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypts encrypted data using the provided key
 * @param {string} encryptedData - Base64-encoded encrypted data with IV
 * @param {CryptoKey} key - CryptoKey object for decryption
 * @returns {Promise<string|object>} - The decrypted data
 */
export async function decryptData(encryptedData, key) {
    try {
        // Convert base64 to array buffer
        const binaryString = atob(encryptedData);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);

        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Extract IV (first 12 bytes)
        const iv = bytes.slice(0, 12);
        const encryptedBuffer = bytes.slice(12);

        // Decrypt the data
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv
            },
            key,
            encryptedBuffer
        );

        // Convert the decrypted data to string
        const decryptedString = decoder.decode(decryptedBuffer);

        // Try to parse as JSON if possible
        try {
            return JSON.parse(decryptedString);
        } catch {
            return decryptedString;
        }
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Encrypts an object using the provided key
 * @param {object} obj - Object to encrypt
 * @param {CryptoKey} key - CryptoKey for encryption
 * @returns {Promise<string>} - Encrypted string
 */
export async function encryptObject(obj, key) {
    return await encryptData(obj, key);
}

/**
 * Decrypts an encrypted string back to an object
 * @param {string} encryptedData - Encrypted data string
 * @param {CryptoKey} key - CryptoKey for decryption
 * @returns {Promise<object>} - Decrypted object
 */
export async function decryptObject(encryptedData, key) {
    return await decryptData(encryptedData, key);
}