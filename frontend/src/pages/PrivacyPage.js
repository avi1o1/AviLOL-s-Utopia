import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';

const PrivacyPage = () => {
    const { currentTheme, themes } = useTheme();
    const theme = themes[currentTheme];

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

    return (
        <div className="privacy-page" style={{ color: textColor, padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="page-header" style={{ borderBottom: `3px solid ${theme.primary}`, marginBottom: '2rem', paddingBottom: '1rem' }}>
                <h1 className="text-3xl font-display mb-2" style={{ color: theme.primary }}>Privacy Policy</h1>
                <p className="mb-6" style={{ color: textColorLight }}>
                    Last Updated: May 9, 2025
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
                </ul>
                <p style={{ marginBottom: '1rem' }}>
                    <strong>Planned Enhancement:</strong> We are actively developing end-to-end encryption for all user content. Once implemented, this will mean:
                </p>
                <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Your diary entries, journal posts, and bucket lists will be encrypted on your device before transmission.</li>
                    <li style={{ marginBottom: '0.5rem' }}>The content will remain encrypted during storage on our servers.</li>
                    <li style={{ marginBottom: '0.5rem' }}>Only you, with your encryption key, will be able to decrypt and read the content.</li>
                    <li style={{ marginBottom: '0.5rem' }}>Even in the event of a data breach or legal compulsion, your content would remain encrypted and unreadable without your encryption key.</li>
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
        </div>
    );
};

export default PrivacyPage;