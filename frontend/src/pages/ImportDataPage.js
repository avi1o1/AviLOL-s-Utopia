import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Toast } from '../components/ui/Toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ImportDataPage = () => {
    const { currentTheme, themes } = useTheme();
    const theme = themes[currentTheme];

    // State variables
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [importSuccess, setImportSuccess] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const [importStats, setImportStats] = useState(null);

    // Determine if the current theme is a dark theme by checking its text color
    const isDarkTheme = theme.text.startsWith('#F') || theme.text.startsWith('#f') ||
        theme.text.startsWith('#E') || theme.text.startsWith('#e') ||
        theme.text === '#FAFAFA' || theme.text === '#F5F5F4' || theme.text === '#F9FAFB' ||
        theme.text === '#F8FAFC';

    // Determine text and background colors based on theme
    const textColor = isDarkTheme ? theme.text : theme.dark;
    const textColorLight = isDarkTheme ? theme.textLight : theme.text;
    const backgroundColorCard = isDarkTheme ? theme.dark : theme.light;

    // Helper function to show notifications
    const showNotification = (message, type) => {
        setNotification({
            show: true,
            message,
            type
        });

        // Auto-hide notification after 3 seconds
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    // Function to validate imported data structure
    const validateImportedData = (data) => {
        // Check if the structure is valid
        if (!data) return false;

        // Check for user object
        if (!data.user || !data.user.username) {
            return { isValid: false, error: 'Invalid user data structure' };
        }

        // Check for journals array
        if (!Array.isArray(data.journals)) {
            return { isValid: false, error: 'Invalid journals data structure' };
        }

        // Check for diaries array
        if (!Array.isArray(data.diaries)) {
            return { isValid: false, error: 'Invalid diaries data structure' };
        }

        // Check for buckets array
        if (!Array.isArray(data.buckets)) {
            return { isValid: false, error: 'Invalid buckets data structure' };
        }

        // Check structure of journals, diaries, and buckets
        for (const journal of data.journals) {
            if (!journal.title || !journal.content || !journal.date) {
                return { isValid: false, error: 'Invalid journal entry structure' };
            }
        }

        for (const diary of data.diaries) {
            if (!diary.title || !diary.content || !diary.date) {
                return { isValid: false, error: 'Invalid diary entry structure' };
            }
        }

        for (const bucket of data.buckets) {
            if (!bucket.name || !Array.isArray(bucket.items)) {
                return { isValid: false, error: 'Invalid bucket structure' };
            }

            for (const item of bucket.items) {
                if (!item.content) {
                    return { isValid: false, error: 'Invalid bucket item structure' };
                }
            }
        }

        return { isValid: true };
    };

    // Function to handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/json') {
                showNotification('Please select a JSON file', 'error');
                return;
            }
            setImportFile(file);
            setError(null);
            setValidationResult(null);
        }
    };

    // Function to handle file validation only (without importing)
    const handleValidateFile = async () => {
        if (!importFile) {
            showNotification('Please select a file to import', 'error');
            return;
        }

        setLoading(true);
        setError(null);
        setValidationResult(null);

        try {
            const fileContent = await importFile.text();
            const jsonData = JSON.parse(fileContent);

            // Check if data has the expected structure
            const validation = validateImportedData(jsonData.data || jsonData);
            setValidationResult(validation);

            if (!validation.isValid) {
                showNotification(`Validation failed: ${validation.error}`, 'error');
                setError(validation.error);
            } else {
                showNotification('File validation successful! You can now import this data.', 'success');
            }
        } catch (err) {
            console.error('Error validating file:', err);
            setError('Invalid JSON file format');
            showNotification('Invalid JSON file format', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle data import
    const handleImportData = async () => {
        if (!importFile) {
            showNotification('Please select a file to import', 'error');
            return;
        }

        if (validationResult && !validationResult.isValid) {
            showNotification('Please fix validation errors before importing', 'error');
            return;
        }

        setLoading(true);
        setError(null);
        setImportSuccess(false);
        setImportStats(null);

        try {
            const token = localStorage.getItem('userToken');

            if (!token) {
                setError('Authentication required. Please log in.');
                setLoading(false);
                return;
            }

            // Show animated progress indication
            setTimeout(() => {
                if (loading) {
                    showNotification('Processing your data...', 'info');
                }
            }, 800);

            // Read file content
            const fileContent = await importFile.text();
            let jsonData;

            try {
                jsonData = JSON.parse(fileContent);
            } catch (err) {
                throw new Error('Invalid JSON format');
            }

            // If the data is nested under a "data" property (like in exports)
            const dataToImport = jsonData.data || jsonData;

            // Validate the data structure again
            const validation = validateImportedData(dataToImport);
            if (!validation.isValid) {
                throw new Error(`Invalid data structure: ${validation.error}`);
            }

            // Send the data to the server
            const response = await fetch(`${API_URL}/users/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ importData: dataToImport }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error importing data');
            }

            const data = await response.json();

            // Store the import statistics
            setImportStats(data.stats);

            setImportSuccess(true);
            showNotification(data.message || 'Your data has been imported successfully!', 'success');

            // Clear the file input
            setImportFile(null);
            const fileInput = document.getElementById('import-file');
            if (fileInput) {
                fileInput.value = '';
            }
        } catch (err) {
            setError(err.message);
            showNotification(`Failed to import data: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Information items for import description
    const importNotes = [
        { icon: '🔄', text: 'Only properly formatted YouTopia exports are supported' },
        { icon: '🧩', text: 'Existing data will be merged with imported data' },
        { icon: '🔍', text: 'Data is validated before import to ensure compatibility' },
        { icon: '🔒', text: 'Your username will not change during import' }
    ];

    return (
        <div className="import-data-page" style={{
            color: textColor,
            padding: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            <div className="page-header" style={{
                borderBottom: `3px solid ${theme.primary}`,
                marginBottom: '2rem',
                paddingBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
            }}>
                <h1 className="text-3xl font-display mb-2" style={{ color: theme.primary, fontSize: '2.5rem' }}>
                    Import Your Data
                </h1>
                <p className="mb-6" style={{ color: textColorLight, maxWidth: '600px', margin: '0.5rem auto 1.5rem' }}>
                    Restore your valuable memories, thoughts, and collections from a previous export
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem'
            }}>
                <Card
                    style={{
                        backgroundColor: backgroundColorCard,
                        padding: '2rem',
                        borderLeft: `4px solid ${theme.primary}`,
                        borderRadius: '8px',
                        transition: 'transform 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        padding: '0 0 1rem 0',
                        borderBottom: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}>
                        <div style={{
                            backgroundColor: `${theme.primary}20`,
                            borderRadius: '12px',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '1rem',
                            fontSize: '1.5rem'
                        }}>📤</div>
                        <h2 style={{ color: theme.primary, marginBottom: '0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            Data Import
                        </h2>
                    </div>

                    <p style={{ marginBottom: '1.5rem' }}>
                        Select a JSON file containing your previously exported YouTopia data:
                    </p>

                    <div style={{
                        marginBottom: '1.5rem'
                    }}>
                        <input
                            type="file"
                            id="import-file"
                            accept=".json"
                            onChange={handleFileChange}
                            style={{
                                backgroundColor: `${theme.accent}15`,
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                width: '100%',
                                border: `1px solid ${theme.accent}30`,
                                color: textColor
                            }}
                        />
                        {importFile && (
                            <div style={{
                                marginTop: '0.75rem',
                                fontStyle: 'italic',
                                color: textColorLight
                            }}>
                                Selected file: {importFile.name}
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap'
                    }}>
                        <Button
                            onClick={handleValidateFile}
                            disabled={!importFile || loading}
                            style={{
                                backgroundColor: theme.secondary,
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: 'bold',
                                border: `2px solid ${theme.dark}`,
                                boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                                opacity: (!importFile || loading) ? 0.7 : 1,
                                cursor: (!importFile || loading) ? 'not-allowed' : 'pointer',
                                flex: '1'
                            }}
                        >
                            Validate File
                        </Button>

                        <Button
                            onClick={handleImportData}
                            disabled={!importFile || loading || (validationResult && !validationResult.isValid)}
                            style={{
                                backgroundColor: theme.primary,
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: 'bold',
                                border: `2px solid ${theme.dark}`,
                                boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                                opacity: (!importFile || loading || (validationResult && !validationResult.isValid)) ? 0.7 : 1,
                                cursor: (!importFile || loading || (validationResult && !validationResult.isValid)) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                flex: '1'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner" style={{
                                        display: 'inline-block',
                                        width: '1rem',
                                        height: '1rem',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderRadius: '50%',
                                        borderTopColor: 'white',
                                        animation: 'spin 1s linear infinite'
                                    }}></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Import Data
                                </>
                            )}
                        </Button>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: '#FEE2E2',
                            color: '#EF4444',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            border: '1px solid #FCA5A5'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {validationResult && validationResult.isValid && (
                        <div style={{
                            backgroundColor: '#ECFDF5',
                            color: '#10B981',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            border: '1px solid #6EE7B7'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>✅</span>
                            <span>File validation successful! You can now import this data.</span>
                        </div>
                    )}

                    {importSuccess && (
                        <div style={{
                            backgroundColor: '#ECFDF5',
                            color: '#10B981',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            border: '1px solid #6EE7B7'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>✅</span>
                            <span>Data imported successfully! Refresh the page to see your imported data.</span>
                        </div>
                    )}

                    {importStats && (
                        <div style={{
                            backgroundColor: '#EFF6FF',
                            color: '#3B82F6',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            border: '1px solid #93C5FD'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Import Statistics:</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li>Total Journals: {importStats.totalJournals}</li>
                                <li>Total Diaries: {importStats.totalDiaries}</li>
                                <li>Total Buckets: {importStats.totalBuckets}</li>
                                <li>Total Bucket Items: {importStats.totalBucketItems}</li>
                            </ul>
                        </div>
                    )}
                </Card>

                <Card
                    style={{
                        backgroundColor: backgroundColorCard,
                        padding: '2rem',
                        borderLeft: `4px solid ${theme.secondary}`,
                        borderRadius: '8px',
                        transition: 'transform 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        padding: '0 0 1rem 0',
                        borderBottom: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}>
                        <div style={{
                            backgroundColor: `${theme.secondary}20`,
                            borderRadius: '12px',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '1rem',
                            fontSize: '1.5rem'
                        }}>🔍</div>
                        <h2 style={{ color: theme.secondary, marginBottom: '0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            Import Notes
                        </h2>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ color: theme.secondary, fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                            Important information about data imports:
                        </h3>

                        <ul style={{
                            listStyle: 'none',
                            margin: 0,
                            padding: 0
                        }}>
                            {importNotes.map((item, index) => (
                                <li key={index} style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    marginBottom: '0.75rem',
                                    padding: '0.5rem 0'
                                }}>
                                    <span style={{
                                        fontSize: '1.25rem',
                                        marginRight: '0.75rem',
                                        backgroundColor: `${theme.accent}20`,
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {item.icon}
                                    </span>
                                    <span>{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        backgroundColor: `${theme.accent}15`,
                        borderLeft: `4px solid ${theme.accent}`,
                        marginTop: 'auto'
                    }}>
                        <h3 style={{ color: theme.secondary, fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>⚠️</span> Caution
                        </h3>
                        <p style={{ fontStyle: 'italic', color: textColorLight, margin: 0 }}>
                            Only import files that were exported from YouTopia. Importing files from
                            unknown sources may cause unexpected behavior.
                        </p>
                    </div>
                </Card>
            </div>

            {/* Toast notification */}
            {notification.show && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ ...notification, show: false })}
                />
            )}

            {/* CSS Animations */}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.6; }
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    
                    .import-data-page {
                        animation: fadeIn 0.3s ease-out;
                    }
                `}
            </style>
        </div>
    );
};

export default ImportDataPage;