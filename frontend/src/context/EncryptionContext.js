import React, { createContext, useContext, useState, useEffect } from 'react';
import { deriveEncryptionKey, encryptData, decryptData } from '../utils/cryptoUtils';

// Create the encryption context
const EncryptionContext = createContext();

/**
 * Provider component for encryption-related functionality
 * Handles encryption key initialization, encryption, and decryption operations
 */
export function EncryptionProvider({ children }) {
    // State to track encryption setup
    const [encryptionKey, setEncryptionKey] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isKeyReady, setIsKeyReady] = useState(false);
    // Track auth state to reinitialize encryption when it changes
    const [authToken, setAuthToken] = useState(localStorage.getItem('userToken'));

    // Watch for changes to the auth token in localStorage
    useEffect(() => {
        const checkAuthToken = () => {
            const currentToken = localStorage.getItem('userToken');
            if (currentToken !== authToken) {
                setAuthToken(currentToken);
            }
        };

        // Check immediately and then set up interval
        checkAuthToken();

        // Check periodically (every 2 seconds)
        const interval = setInterval(checkAuthToken, 2000);

        return () => clearInterval(interval);
    }, [authToken]);

    // Initialize encryption key from localStorage whenever authToken changes
    useEffect(() => {
        const initializeEncryption = async () => {
            try {
                setIsLoading(true);

                // Get password hash from localStorage
                const passwordHash = localStorage.getItem('encryptionKey');

                if (!passwordHash) {
                    console.log('No encryption key found in localStorage');
                    setEncryptionKey(null);
                    setIsKeyReady(false);
                    return;
                }

                // Derive encryption key from password hash
                const key = await deriveEncryptionKey(passwordHash);
                setEncryptionKey(key);
                setIsKeyReady(true);
                console.log('Encryption key initialized successfully');
            } catch (err) {
                console.error('Error initializing encryption:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        initializeEncryption();
    }, [authToken]); // Re-initialize when auth token changes

    /**
     * Encrypts a string using the current encryption key
     * @param {string} text - Plain text to encrypt
     * @returns {Promise<string>} - Encrypted text
     */
    const encrypt = async (text) => {
        if (!encryptionKey) {
            throw new Error('Encryption key not available');
        }

        try {
            // Don't re-encrypt if already encrypted
            if (isEncrypted(text)) {
                return text;
            }

            return await encryptData(text, encryptionKey);
        } catch (err) {
            console.error('Encryption error:', err);
            throw new Error('Failed to encrypt data');
        }
    };

    /**
     * Decrypts an encrypted string using the current encryption key
     * @param {string} encryptedText - Encrypted text
     * @returns {Promise<string>} - Decrypted plain text
     */
    const decrypt = async (encryptedText) => {
        if (!encryptionKey) {
            throw new Error('Encryption key not available');
        }

        try {
            // Return original text if not encrypted
            if (!isEncrypted(encryptedText)) {
                return encryptedText;
            }

            return await decryptData(encryptedText, encryptionKey);
        } catch (err) {
            console.error('Decryption error:', err);
            throw new Error('Failed to decrypt data');
        }
    };

    /**
     * Checks if a string is likely encrypted
     * @param {string} text - Text to check
     * @returns {boolean} - True if the text appears to be encrypted
     */
    const isEncrypted = (text) => {
        // Skip null or undefined values
        if (text === null || text === undefined) {
            return false;
        }

        const str = String(text);

        // Basic check to determine if a string looks like base64 encrypted data
        // Our encrypted data will always be base64 encoded and reasonably long
        const base64Regex = /^[A-Za-z0-9+/=]+$/;

        return (
            // Must be a string at least 24 chars long (IV + minimal content)
            typeof str === 'string' &&
            str.length > 24 &&
            base64Regex.test(str)
        );
    };

    // Value object to provide through context
    const value = {
        encrypt,
        decrypt,
        isEncrypted,
        isKeyReady,
        isLoading,
        error
    };

    return (
        <EncryptionContext.Provider value={value}>
            {children}
        </EncryptionContext.Provider>
    );
}

// Custom hook for using encryption
export function useEncryption() {
    const context = useContext(EncryptionContext);

    if (context === undefined) {
        throw new Error('useEncryption must be used within an EncryptionProvider');
    }

    return context;
}