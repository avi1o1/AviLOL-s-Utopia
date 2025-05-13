import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import axios from 'axios';

// Define API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PrivacyPage = () => {
    const { currentTheme, themes } = useTheme();
    const theme = themes[currentTheme];

    // State for delete account modal and loading
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication status when component mounts
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        setIsAuthenticated(!!token);
    }, []);

    // Determine if the current theme is a dark theme by checking its text color
    // Dark themes typically have light text colors (#F... or rgb values > 200)
    const isDarkTheme = theme.text.startsWith('#F') || theme.text.startsWith('#f') ||
        theme.text.startsWith('#E') || theme.text.startsWith('#e') ||
        theme.text === '#FAFAFA' || theme.text === '#F5F5F4' || theme.text === '#F9FAFB' ||
        theme.text === '#F8FAFC';

    // Determine text and background colors based on theme
    const textColor = isDarkTheme ? theme.text : theme.dark;
    const textColorLight = isDarkTheme ? theme.textLight : theme.text;
    const headingColor = theme.primary;
    const backgroundColorCard = isDarkTheme ? theme.light : 'white';

    // Function to handle account deletion
    const handleDeleteAccount = () => {
        setShowDeleteAccountModal(true);
    };

    // Function to confirm account deletion
    const confirmDeleteAccount = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get token from localStorage
            const token = localStorage.getItem('userToken');
            if (!token) {
                if (typeof window.showToast === 'function') {
                    window.showToast('Authentication error', 'error');
                }
                return;
            }

            // Delete user account from API
            await axios.delete(`${API_URL}/users/delete`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    password: password
                }
            });

            // Clear localStorage
            localStorage.removeItem('userToken');
            localStorage.removeItem('journalEntries');

            // Show success toast
            if (typeof window.showToast === 'function') {
                window.showToast('Account successfully deleted', 'success');
            }

            // Redirect to login page
            window.location.href = '/login';

        } catch (err) {
            console.error('Error deleting account:', err);

            setError(`Failed to delete account: ${err.message}`);

            // Show error toast
            if (typeof window.showToast === 'function') {
                window.showToast(`Failed to delete account: ${err.message}`, 'error');
            }
        } finally {
            setLoading(false);
            setShowDeleteAccountModal(false);
        }
    };

    return (
        <div className="privacy-page" style={{ color: textColor, padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="page-header" style={{ borderBottom: `3px solid ${theme.primary}`, marginBottom: '2rem', paddingBottom: '1rem' }}>
                <h1 className="text-3xl font-display mb-2" style={{ color: theme.primary }}>Privacy Policy</h1>
                <p className="mb-6" style={{ color: textColorLight }}>
                    Last Updated: May 13, 2025
                </p>
            </div>

            <Card style={{
                backgroundColor: backgroundColorCard,
                padding: '2rem',
                marginBottom: '2rem'
            }}>
                <h2 style={{ color: headingColor, fontSize: '1.5rem', marginBottom: '1rem' }}>1. INTRODUCTION</h2>
                <p style={{ marginBottom: '1rem' }}>
                    YouTopia ("we," "our," or "us") is committed to protecting your privacy and ensuring the confidentiality of your personal information. This Privacy Policy outlines our practices regarding the collection, use, storage, and disclosure of information you provide while using our services.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                    By accessing or using YouTopia's services, you acknowledge that you have read, understood, and agree to be bound by the terms of this Privacy Policy. If you do not agree with these terms, please discontinue use of our services immediately.
                </p>

                <h2 style={{ color: headingColor, fontSize: '1.5rem', marginBottom: '1rem' }}>2. PSEUDONYMOUS NATURE OF SERVICE</h2>
                <p style={{ marginBottom: '1rem' }}>
                    YouTopia is designed as a pseudonymous platform. This means:
                </p>
                <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>You are not required to provide your legal name or other personally identifiable information beyond a username of your choice.</li>
                    <li style={{ marginBottom: '0.5rem' }}>We maintain a strict separation between your account identity and your personal identity.</li>
                    <li style={{ marginBottom: '0.5rem' }}>We do not cross-reference or attempt to connect your account with your real-world identity through third-party services or data brokers.</li>
                </ul>
                <p style={{ marginBottom: '1.5rem' }}>
                    <strong>IMPORTANT:</strong> Despite our commitment to pseudonymity, we strongly advise users NOT to include personally identifiable information, sensitive personal details, or uniquely traceable information within journal entries, diary posts, or buckets. Our system is designed for privacy, but is not immune to legal processes such as subpoenas or court orders.
                </p>

                <h2 style={{ color: headingColor, fontSize: '1.5rem', marginBottom: '1rem' }}>3. INFORMATION WE COLLECT</h2>
                <h3 style={{ color: headingColor, fontSize: '1.25rem', marginBottom: '0.75rem' }}>3.1 Account Information</h3>
                <p style={{ marginBottom: '1rem' }}>
                    To provide our services, we collect and store:
                </p>
                <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Username (chosen by you)</li>
                    <li style={{ marginBottom: '0.5rem' }}>Password (encrypted and stored using industry-standard hashing algorithms)</li>
                    <li style={{ marginBottom: '0.5rem' }}>Authentication tokens (for maintaining your sessions)</li>
                </ul>

                <h3 style={{ color: headingColor, fontSize: '1.25rem', marginBottom: '0.75rem' }}>3.2 User-Generated Content</h3>
                <p style={{ marginBottom: '1rem' }}>
                    Our platform stores the following user-generated content:
                </p>
                <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Journal entries and associated metadata</li>
                    <li style={{ marginBottom: '0.5rem' }}>Diary entries and associated metadata</li>
                    <li style={{ marginBottom: '0.5rem' }}>User-created bucket lists and their contents</li>
                    <li style={{ marginBottom: '0.5rem' }}>Theme preferences and settings</li>
                </ul>
                <p style={{ marginBottom: '1.5rem' }}>
                    <strong>NOTICE:</strong> While we do not actively monitor the content of your entries, we strongly discourage the inclusion of sensitive personal identifiers, financial information, or information that could put you or others at risk if disclosed.
                </p>

                <h2 style={{ color: headingColor, fontSize: '1.5rem', marginBottom: '1rem' }}>4. DATA ENCRYPTION & SECURITY</h2>
                <p style={{ marginBottom: '1rem' }}>
                    <strong>Current Data Security Measures:</strong>
                </p>
                <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>All communication between your device and our servers is encrypted using SSL/TLS protocols.</li>
                    <li style={{ marginBottom: '0.5rem' }}>Passwords are never stored in plain text and are securely hashed using industry-standard algorithms.</li>
                    <li style={{ marginBottom: '0.5rem' }}>Server access is strictly limited and protected by multiple security layers.</li>
                    <li style={{ marginBottom: '0.5rem' }}>End-to-end encryption is implemented for all user content, providing an additional security layer.</li>
                </ul>
                <p style={{ marginBottom: '1rem' }}>
                    <strong>End-to-End Encryption:</strong> Our platform uses end-to-end encryption for all user-generated content, which means:
                </p>
                <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Your diary entries, journal posts, and bucket lists are encrypted on your device before transmission.</li>
                    <li style={{ marginBottom: '0.5rem' }}>The content remains encrypted during storage on our servers.</li>
                    <li style={{ marginBottom: '0.5rem' }}>Only you, with your encryption key, can decrypt and read the content.</li>
                    <li style={{ marginBottom: '0.5rem' }}>Even in the event of a data breach or legal compulsion, your content remains encrypted and unreadable without your encryption key.</li>
                </ul>
                <p style={{ marginBottom: '1rem' }}>
                    <strong>Data Import/Export Security:</strong> When importing or exporting data:
                </p>
                <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Exported data can be encrypted to maintain privacy even when stored outside our platform.</li>
                    <li style={{ marginBottom: '0.5rem' }}>Plain text data imports are automatically encrypted before being stored in our system.</li>
                    <li style={{ marginBottom: '0.5rem' }}>Encrypted imports are verified for compatibility with your current encryption key.</li>
                    <li style={{ marginBottom: '0.5rem' }}>For best results when importing previously encrypted data, use the same account that created the export or ensure both accounts have the same password.</li>
                </ul>

                <h2 style={{ color: headingColor, fontSize: '1.5rem', marginBottom: '1rem' }}>5. DATA RETENTION AND DELETION</h2>
                <p style={{ marginBottom: '1rem' }}>
                    We retain your data for as long as you maintain an active account with YouTopia. You may request deletion of your account and associated data at any time through the application interface or by contacting our support team.
                </p>
                <p style={{ marginBottom: '1rem' }}>
                    Upon account deletion:
                </p>
                <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Your user account information will be permanently removed from our active systems.</li>
                    <li style={{ marginBottom: '0.5rem' }}>All journal entries, diary entries, and bucket lists associated with your account will be irrevocably deleted from our active databases.</li>
                    <li style={{ marginBottom: '0.5rem' }}>Backup copies may persist for up to 30 days for system integrity purposes before being permanently purged.</li>
                </ul>

                <h2 style={{ color: headingColor, fontSize: '1.5rem', marginBottom: '1rem' }}>6. LEGAL COMPLIANCE</h2>
                <p style={{ marginBottom: '1.5rem' }}>
                    While we are committed to protecting your privacy, we may be required to disclose information in response to valid legal processes such as subpoenas, court orders, or legal warrants. In such cases:
                </p>
                <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>We will evaluate each request to ensure its legal validity.</li>
                    <li style={{ marginBottom: '0.5rem' }}>We will attempt to notify affected users of such requests when legally permitted to do so.</li>
                    <li style={{ marginBottom: '0.5rem' }}>We will provide only the specific information required by the legal process and nothing more.</li>
                </ul>

                <h2 style={{ color: headingColor, fontSize: '1.5rem', marginBottom: '1rem' }}>7. YOUR RESPONSIBILITIES</h2>
                <p style={{ marginBottom: '1rem' }}>
                    To maintain the privacy and security of your account:
                </p>
                <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Choose a strong, unique password and keep it confidential.</li>
                    <li style={{ marginBottom: '0.5rem' }}>Log out of your account when using shared or public devices.</li>
                    <li style={{ marginBottom: '0.5rem' }}>Exercise caution regarding the information you choose to store in our services.</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Avoid including personally identifiable information, addresses, phone numbers, full names, or sensitive financial details in your entries.</strong></li>
                    <li style={{ marginBottom: '0.5rem' }}>Notify us immediately if you suspect unauthorized access to your account.</li>
                </ul>

                <h2 style={{ color: headingColor, fontSize: '1.5rem', marginBottom: '1rem' }}>8. UPDATES TO THIS POLICY</h2>
                <p style={{ marginBottom: '1.5rem' }}>
                    We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. When we make material changes, we will notify users through the application interface prior to the changes becoming effective. Your continued use of YouTopia following such notifications constitutes your acceptance of the updated Privacy Policy.
                </p>

                <div style={{
                    backgroundColor: isDarkTheme ? `${theme.accent}30` : `${theme.accent}20`,
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    borderLeft: `4px solid ${theme.primary}`
                }}>
                    <h3 style={{ color: headingColor, fontSize: '1.25rem', marginBottom: '0.75rem' }}>Final Advisory Notice</h3>
                    <p style={{ marginBottom: '0.75rem' }}>
                        YouTopia is designed to be a space where you can express yourself freely. However, we must emphasize that while we have implemented various security measures and are committed to user privacy, no digital platform can guarantee absolute security or privacy.
                    </p>
                    <p>
                        <strong>We therefore strongly recommend against storing legally sensitive, incriminating, or highly confidential personal information in your entries. YouTopia is intended for personal reflection, creativity, and self-expression—not as a secure repository for sensitive data.</strong>
                    </p>
                </div>
            </Card>

            {/* Account Management section */}
            <div className="account-management-section" style={{ marginTop: '3rem', marginBottom: '2rem' }}>
                <h2 className="text-2xl font-display mb-4" style={{ color: theme.primary, borderBottom: `2px solid ${theme.primary}`, paddingBottom: '0.5rem' }}>
                    Account Management
                </h2>

                <Card style={{
                    backgroundColor: isDarkTheme ? theme.dark : theme.light,
                    padding: '2rem',
                    marginBottom: '2rem',
                    border: `1px solid ${theme.border || theme.medium}`,
                    borderRadius: '0.5rem'
                }}>
                    <h3 style={{ color: headingColor, fontSize: '1.25rem', marginBottom: '1rem' }}>Delete Your Account</h3>

                    <p style={{ marginBottom: '1rem' }}>
                        You have the right to delete your account and all associated data from our system, at anytime on your own disgression. This action is permanent and cannot be undone.
                    </p>

                    <div style={{ marginBottom: '1rem' }}>
                        <strong>What happens when you delete your account:</strong>
                        <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}>All your journal entries will be permanently deleted</li>
                            <li style={{ marginBottom: '0.5rem' }}>All your diary entries will be permanently deleted</li>
                            <li style={{ marginBottom: '0.5rem' }}>All your bucket lists and their items will be permanently deleted</li>
                            <li style={{ marginBottom: '0.5rem' }}>Your user profile and authentication information will be permanently removed</li>
                            <li style={{ marginBottom: '0.5rem' }}>You will be immediately logged out of all sessions</li>
                        </ul>
                    </div>

                    {isAuthenticated && (
                        <>
                            <div style={{
                                backgroundColor: isDarkTheme ? `${theme.error}30` : `${theme.error}15`,
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                borderLeft: `4px solid ${theme.error}`,
                                marginBottom: '1.5rem'
                            }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>⚠️ Warning</p>
                                <p>
                                    This action is irreversible. Once deleted, your data cannot be recovered. We recommend exporting your data before deleting your account if you wish to keep a copy of your content.
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    onClick={handleDeleteAccount}
                                    style={{
                                        backgroundColor: theme.error || '#dc2626',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '0.375rem',
                                        fontWeight: 'bold',
                                        boxShadow: '3px 3px 0 rgba(0,0,0,0.2)'
                                    }}
                                >
                                    Delete My Account
                                </Button>
                            </div>
                        </>

                    )}
                </Card>
            </div>

            {/* Delete Account Confirmation Modal */}
            {showDeleteAccountModal && (
                <Modal
                    show={showDeleteAccountModal}
                    onClose={() => {
                        setShowDeleteAccountModal(false);
                        setError(null);
                        setDeleteConfirmText('');
                        setPassword('');
                    }}
                    onConfirm={() => {
                        // Only proceed if validation passes
                        if (deleteConfirmText === 'DELETE' && password.trim() !== '') {
                            confirmDeleteAccount();
                        } else {
                            setError('Please type "DELETE" and enter your password to confirm account deletion');
                        }
                    }}
                    title="Delete Account Confirmation"
                    confirmText={loading ? "Deleting..." : "Yes, Delete My Account"}
                    confirmVariant="dark"
                    disableConfirm={deleteConfirmText !== 'DELETE' || !password.trim()}
                    styles={{
                        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' },
                        modal: {
                            backgroundColor: isDarkTheme ? theme.dark : 'white',
                            color: textColor,
                            borderColor: theme.error || '#dc2626'
                        },
                        header: { borderColor: theme.error || '#dc2626' },
                        title: { color: theme.error || '#dc2626' },
                        confirmButton: {
                            backgroundColor: theme.error || '#dc2626',
                            color: 'white',
                            border: 'none',
                            opacity: (deleteConfirmText !== 'DELETE' || !password.trim() || loading) ? 0.5 : 1,
                            cursor: (deleteConfirmText !== 'DELETE' || !password.trim() || loading) ? 'not-allowed' : 'pointer'
                        },
                        cancelButton: {
                            backgroundColor: isDarkTheme ? theme.medium : theme.light,
                            color: theme.primary,
                            borderColor: theme.primary
                        }
                    }}
                >
                    <div>
                        <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                            Are you absolutely sure you want to delete your account?
                        </p>

                        <p style={{ marginBottom: '1rem' }}>
                            This will permanently delete:
                        </p>

                        <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}>All your journal entries</li>
                            <li style={{ marginBottom: '0.5rem' }}>All your diary entries</li>
                            <li style={{ marginBottom: '0.5rem' }}>All your bucket lists</li>
                            <li style={{ marginBottom: '0.5rem' }}>Your user profile and authentication information</li>
                        </ul>

                        <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>
                            This action cannot be undone. Once deleted, your data cannot be recovered.
                        </p>

                        {error && (
                            <div style={{
                                backgroundColor: `${theme.error}20`,
                                padding: '0.75rem',
                                borderRadius: '0.375rem',
                                marginBottom: '1rem',
                                color: theme.error
                            }}>
                                {error}
                            </div>
                        )}

                        <p style={{ fontWeight: 'bold' }}>
                            Please type "DELETE" to confirm:
                        </p>
                        <input
                            type="text"
                            className="neo-brutal-input w-full"
                            placeholder="Type DELETE here"
                            style={{
                                backgroundColor: isDarkTheme ? theme.dark : 'white',
                                color: textColor,
                                borderColor: theme.border || theme.medium,
                                padding: '0.5rem',
                                borderRadius: '0.375rem',
                                marginBottom: '1rem'
                            }}
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            disabled={loading}
                        />

                        <p style={{ fontWeight: 'bold', marginTop: '1rem' }}>
                            Please enter your password to confirm:
                        </p>
                        <input
                            type="password"
                            className="neo-brutal-input w-full"
                            placeholder="Enter your password"
                            style={{
                                backgroundColor: isDarkTheme ? theme.dark : 'white',
                                color: textColor,
                                borderColor: theme.border || theme.medium,
                                padding: '0.5rem',
                                borderRadius: '0.375rem',
                                marginBottom: '1rem'
                            }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default PrivacyPage;