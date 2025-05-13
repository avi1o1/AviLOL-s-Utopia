# End-to-End Encryption in YouTopia

## Overview

This application implements client-side end-to-end encryption for all user data, including diary entries, journal entries, and bucket items. This ensures that sensitive content is encrypted before being sent to the server and can only be decrypted by the authenticated user.

## How It Works

### Encryption Implementation Details

1. **Password-Based Key Derivation**:
   - When a user logs in or signs up, we generate a cryptographic hash of their password.
   - This hash is stored in localStorage as the basis for the encryption key.
   - The actual cryptographic key is derived from this hash when needed.

2. **Encryption Algorithm**:
   - We use the Web Crypto API's AES-GCM algorithm for encryption.
   - A unique initialization vector (IV) is generated for each encryption operation.
   - The IV is prepended to the ciphertext to allow for decryption.

3. **Data Flow**:
   - When creating or updating content:
     - Content is encrypted on the client side before being sent to the server.
     - The server only stores the encrypted data and never sees the plaintext.
   - When retrieving content:
     - Encrypted data is fetched from the server.
     - Data is decrypted on the client side using the key derived from the user's password hash.

### Security Considerations

- **No Server-Side Decryption**: The server never has access to the decryption keys.
- **Password Changes**: If a user changes their password, all existing data would need to be re-encrypted with the new key.
- **No Password Recovery**: Since the encryption key is derived from the password, there is no way to recover encrypted data if the password is lost.

## Technical Implementation

The implementation consists of the following components:

1. **`cryptoUtils.js`**: Contains utility functions for encryption and decryption:
   - `hashPassword(password)`: Generates a consistent hash of the password
   - `deriveEncryptionKey(passwordHash)`: Converts a password hash to a CryptoKey
   - `encryptData(data, key)`: Encrypts data with the provided key
   - `decryptData(encryptedData, key)`: Decrypts data with the provided key

2. **`EncryptionContext.js`**: Provides a React context for encryption operations:
   - Handles key initialization
   - Provides `encrypt` and `decrypt` methods to components
   - Detects if data is already encrypted

3. **Authentication Flow**:
   - During login/signup, the password hash is generated and stored in localStorage
   - The EncryptionProvider initializes the key when the app loads

## Benefits

- **Data Privacy**: Sensitive user data remains private even in the event of a server breach.
- **Compliance**: Helps meet privacy regulations by ensuring data is encrypted at rest and in transit.
- **User Trust**: Users can be confident that their personal data can only be accessed by them.

## Limitations

- If a user forgets their password, their encrypted data cannot be recovered.
- Changing passwords requires re-encrypting all data.
- Browser storage limitations may apply to the storage of encryption keys.

## Future Improvements

- Implement key rotation mechanisms
- Add encrypted data backup and export functionality
- Enhance error handling for decryption failures