import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Toast } from '../components/ui/Toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ExportDataPage = () => {
    const { currentTheme, themes } = useTheme();
    const theme = themes[currentTheme];

    // State variables
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [exportSuccess, setExportSuccess] = useState(false);

    // Check if the current theme is a dark theme
    const isDarkTheme = ['nightOwl', 'darkRoast', 'obsidian', 'darkForest'].includes(currentTheme);

    // Determine text and background colors based on theme
    const textColor = isDarkTheme ? theme.text : theme.dark;
    const textColorLight = isDarkTheme ? theme.textLight : theme.text;
    const backgroundColorCard = isDarkTheme ? theme.light : 'white';

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

    // Function to export user data
    const handleExportData = async () => {
        setLoading(true);
        setError(null);
        setExportSuccess(false);

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
                    showNotification('Collecting your data...', 'info');
                }
            }, 800);

            const response = await fetch(`${API_URL}/users/export`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error exporting data');
            }

            const data = await response.json();

            // Convert data to JSON string
            const jsonData = JSON.stringify(data.data, null, 2);

            // Create a blob and download link
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Create a download link and trigger click
            const downloadLink = document.createElement('a');
            downloadLink.href = url;

            // Get the username from the response data
            const username = data.data.user?.username || 'user';

            // Format the date for the filename
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            const dateString = `${day}-${month}-${year}`;

            downloadLink.download = `${username}_YouTopiaData_${dateString}.json`;
            document.body.appendChild(downloadLink);
            downloadLink.click();

            // Clean up
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);

            setExportSuccess(true);
            showNotification('Your data has been exported successfully!', 'success');
        } catch (err) {
            setError(err.message);
            showNotification('Failed to export data. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Create elements for export animation
    const exportElements = [
        { icon: '📝', label: 'Journal Entries' },
        { icon: '📔', label: 'Diary Entries' },
        { icon: '✨', label: 'Bucket Items' },
        { icon: '👤', label: 'Profile Data' },
    ];

    return (
        <div className="export-data-page" style={{
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
                    Export Your Data
                </h1>
                <p className="mb-6" style={{ color: textColorLight, maxWidth: '600px', margin: '0.5rem auto 1.5rem' }}>
                    Download all your valuable memories, thoughts, and collections in JSON format
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
                        }}>💾</div>
                        <h2 style={{ color: theme.primary, marginBottom: '0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            Data Export
                        </h2>
                    </div>

                    <p style={{ marginBottom: '1.5rem' }}>
                        Click the button below to download a comprehensive JSON file containing all your data:
                    </p>

                    <div style={{
                        padding: '1rem',
                        backgroundColor: `${theme.accent}15`,
                        borderRadius: '8px',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{ color: theme.secondary, marginBottom: '1rem', fontSize: '1.2rem' }}>
                            What's included:
                        </h3>

                        <ul style={{
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '0.75rem'
                        }}>
                            {exportElements.map((item, index) => (
                                <li key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.75rem 1rem',
                                    backgroundColor: `${theme.accent}10`,
                                    borderRadius: '6px',
                                    border: `1px solid ${theme.accent}30`,
                                    animation: loading ? `pulse 1.5s ease-in-out ${index * 0.2}s infinite` : 'none'
                                }}>
                                    <span style={{ fontSize: '1.2rem', marginRight: '0.75rem' }}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </li>
                            ))}
                        </ul>
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

                    {exportSuccess && (
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
                            <span>Data exported successfully! Your download should begin automatically.</span>
                        </div>
                    )}

                    <Button
                        onClick={handleExportData}
                        disabled={loading}
                        style={{
                            backgroundColor: theme.primary,
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: 'bold',
                            border: `2px solid ${theme.dark}`,
                            boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            fontSize: '1.1rem',
                            marginTop: 'auto'
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
                                Exporting Data...
                            </>
                        ) : (
                            <>
                                Export My Data
                            </>
                        )}
                    </Button>
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
                            About Your Data
                        </h2>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ color: theme.secondary, fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                            How can you use your exported data:
                        </h3>

                        <ul style={{
                            listStyle: 'none',
                            margin: 0,
                            padding: 0
                        }}>
                            {[
                                { icon: '💾', text: 'Create a personal backup of all your content' },
                                { icon: '🔄', text: 'Migrate your data to another platform' },
                                { icon: '📊', text: 'Analyze your journaling patterns with other tools' },
                                { icon: '🗄️', text: 'Archive your memories for long-term storage' }
                            ].map((item, index) => (
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
                            <span>🔒</span> Security Advisory
                        </h3>
                        <p style={{ fontStyle: 'italic', color: textColorLight, margin: 0 }}>
                            This file contains your personal information. Please store it securely
                            and avoid sharing it on public platforms.
                        </p>
                    </div>
                </Card>
            </div>

            {/* Export Format Section - Moved to a separate container below */}
            <Card
                style={{
                    backgroundColor: backgroundColorCard,
                    padding: '2rem',
                    borderLeft: `4px solid ${theme.accent}`,
                    borderRadius: '8px',
                    transition: 'transform 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    marginBottom: '2rem'
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
                        backgroundColor: `${theme.accent}20`,
                        borderRadius: '12px',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '1rem',
                        fontSize: '1.5rem'
                    }}>📝</div>
                    <h2 style={{ color: theme.accent, marginBottom: '0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Export Format
                    </h2>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <h3 style={{ color: theme.accent, fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                            What's included in your export:
                        </h3>

                        <p style={{ marginBottom: '1rem' }}>
                            Your export focuses primarily on <strong>textual content</strong>. While some system fields like IDs,
                            timestamps, and metadata are included, the most important elements are:
                        </p>

                        <ul style={{
                            margin: 0,
                            padding: '0 0 0 1.5rem',
                        }}>
                            <li style={{ marginBottom: '0.5rem' }}>Your journal entries and their content</li>
                            <li style={{ marginBottom: '0.5rem' }}>Your diary entries with titles and content</li>
                            <li style={{ marginBottom: '0.5rem' }}>Your bucket list items and their descriptions</li>
                            <li style={{ marginBottom: '0.5rem' }}>Basic account information</li>
                        </ul>
                    </div>

                    <div style={{ flex: '1 1 300px' }}>
                        <div style={{
                            padding: '1rem',
                            backgroundColor: `${theme.accent}10`,
                            borderRadius: '6px',
                            border: `1px solid ${theme.accent}30`
                        }}>
                            <h4 style={{ color: theme.accent, marginTop: 0, marginBottom: '0.5rem' }}>Sample Data Structure</h4>
                            <pre style={{
                                backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                                padding: '0.75rem',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                overflowX: 'auto',
                                margin: 0
                            }}>
                                {`{
  "user": { username, createdAt },
  "journals": [{ title, content, date }],
  "diaries": [{ title, content, date }],
  "buckets": [{ 
    name, description,
    items: [{ content }]
  }]
}`}
                            </pre>
                        </div>
                    </div>
                </div>
            </Card>

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
                    
                    .export-data-page {
                        animation: fadeIn 0.3s ease-out;
                    }
                `}
            </style>
        </div>
    );
};

export default ExportDataPage;