import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useEncryption } from '../../context/EncryptionContext';
import Card from '../../components/ui/Card';
import { format } from 'date-fns';
import { PenLine, Book, ListTodo, CalendarDays, Box } from 'lucide-react';

const LoggedInView = ({
    username,
    recentJournals,
    recentDiaries,
    buckets,
    stats,
    isLoading,
    error
}) => {
    const { currentTheme, themes } = useTheme();
    const theme = themes[currentTheme];
    const { decrypt, isEncrypted, isKeyReady } = useEncryption();

    // State for decrypted content
    const [decryptedJournals, setDecryptedJournals] = useState([]);
    const [decryptedDiaries, setDecryptedDiaries] = useState([]);
    const [decryptedBuckets, setDecryptedBuckets] = useState([]);
    const [isDecrypting, setIsDecrypting] = useState(false);

    // Handle decryption of content when data changes
    useEffect(() => {
        const decryptContent = async () => {
            if (!isKeyReady) return;

            setIsDecrypting(true);

            try {
                // Decrypt journal entries
                if (recentJournals && recentJournals.length > 0) {
                    const decrypted = await Promise.all(
                        recentJournals.map(async (entry) => {
                            const decryptedEntry = { ...entry };

                            // Decrypt title if encrypted
                            if (entry.title && isEncrypted(entry.title)) {
                                try {
                                    decryptedEntry.title = await decrypt(entry.title);
                                } catch (err) {
                                    console.error('Error decrypting journal title:', err);
                                    decryptedEntry.title = 'Untitled Entry';
                                }
                            }

                            // Decrypt content if encrypted
                            if (entry.content && isEncrypted(entry.content)) {
                                try {
                                    decryptedEntry.content = await decrypt(entry.content);
                                } catch (err) {
                                    console.error('Error decrypting journal content:', err);
                                    decryptedEntry.content = 'Error decrypting content';
                                }
                            }

                            return decryptedEntry;
                        })
                    );

                    setDecryptedJournals(decrypted);
                } else {
                    setDecryptedJournals([]);
                }

                // Decrypt diary entries
                if (recentDiaries && recentDiaries.length > 0) {
                    const decrypted = await Promise.all(
                        recentDiaries.map(async (entry) => {
                            const decryptedEntry = { ...entry };

                            // Decrypt title if encrypted
                            if (entry.title && isEncrypted(entry.title)) {
                                try {
                                    decryptedEntry.title = await decrypt(entry.title);
                                } catch (err) {
                                    console.error('Error decrypting diary title:', err);
                                    decryptedEntry.title = 'Untitled Entry';
                                }
                            }

                            // Decrypt content if encrypted
                            if (entry.content && isEncrypted(entry.content)) {
                                try {
                                    decryptedEntry.content = await decrypt(entry.content);
                                } catch (err) {
                                    console.error('Error decrypting diary content:', err);
                                    decryptedEntry.content = 'Error decrypting content';
                                }
                            }

                            return decryptedEntry;
                        })
                    );

                    setDecryptedDiaries(decrypted);
                } else {
                    setDecryptedDiaries([]);
                }

                // Decrypt buckets
                if (buckets && buckets.length > 0) {
                    const decrypted = await Promise.all(
                        buckets.map(async (bucket) => {
                            const decryptedBucket = { ...bucket };

                            // Decrypt bucket name if encrypted
                            if (bucket.name && isEncrypted(bucket.name)) {
                                try {
                                    decryptedBucket.name = await decrypt(bucket.name);
                                } catch (err) {
                                    console.error('Error decrypting bucket name:', err);
                                    decryptedBucket.name = 'Untitled Bucket';
                                }
                            }

                            return decryptedBucket;
                        })
                    );

                    setDecryptedBuckets(decrypted);
                } else {
                    setDecryptedBuckets([]);
                }
            } catch (err) {
                console.error('Error decrypting landing page content:', err);
            } finally {
                setIsDecrypting(false);
            }
        };

        decryptContent();
    }, [recentJournals, recentDiaries, buckets, isKeyReady, decrypt, isEncrypted]);

    // Determine if the current theme is a dark theme by checking its text color
    const isDarkTheme = theme.text.startsWith('#F') || theme.text.startsWith('#f') ||
        theme.text.startsWith('#E') || theme.text.startsWith('#e') ||
        theme.text === '#FAFAFA' || theme.text === '#F5F5F4' || theme.text === '#F9FAFB' ||
        theme.text === '#F8FAFC';

    // Determine text and background colors based on theme
    const backgroundColorCard = isDarkTheme ? theme.dark : theme.light;

    // Format a date for display
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch (e) {
            return 'Invalid date';
        }
    };

    // Safely truncate text
    const truncateText = (text, maxLength = 75) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Define a helper function to transform a plain text to a display-friendly version
    const getDisplayText = (text, maxLength = 75) => {
        if (!text) return '';
        // Replace markdown with simpler version for preview
        const simplified = text
            .replace(/#+\s/g, '') // Remove headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/\n/g, ' '); // Replace newlines with spaces
        return truncateText(simplified, maxLength);
    };

    // Truncate title to specified character limit
    const truncateTitle = (title, maxLength = 69) => {
        if (!title) return 'Untitled Entry';
        return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
    };

    return (
        <div className="dashboard-container" style={{
            padding: '2rem 1rem',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            {/* Display error message if there is one */}
            {error && (
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    borderLeft: '4px solid #c62828',
                    fontSize: '0.9rem'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h1 className="page-title" style={{ color: theme.primary, marginBottom: '0.5rem', fontSize: '2.25rem' }}>
                        Welcome back, {username || 'Friend'}!
                    </h1>
                    <p className="dashboard-intro" style={{ margin: 0, color: theme.secondary }}>
                        {isLoading
                            ? 'Loading your personal dashboard...'
                            : `Continue your journey of self-reflection and memory keeping`}
                    </p>
                </div>

                <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: theme.accent + '20',
                    borderRadius: '8px',
                    border: `2px solid ${theme.accent}`,
                    boxShadow: '3px 3px 0 rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        fontSize: '1.75rem',
                        opacity: stats.hasTodayEntry ? 1 : 0.4,
                        filter: stats.hasTodayEntry ? 'none' : 'grayscale(70%)',
                        transition: 'all 0.3s ease'
                    }}>
                        🔥
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: theme.secondary, fontWeight: '500' }}>CURRENT STREAK</div>
                        <div style={{ fontSize: '1.5rem', color: theme.primary, fontWeight: 'bold' }}>{stats.streakDays || 0} {stats.streakDays === 1 ? 'Day' : 'Days'}</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2.5rem'
            }}>
                <Card style={{
                    padding: '1.25rem',
                    borderColor: theme.primary,
                    backgroundColor: theme.primary + '10',
                    color: theme.dark,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        backgroundColor: theme.primary,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <PenLine size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: theme.secondary }}>Journal Entries</h3>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.secondary }}>{stats.totalJournals || 0}</div>
                    </div>
                </Card>

                <Card style={{
                    padding: '1.25rem',
                    borderColor: theme.primary,
                    backgroundColor: theme.primary + '10',
                    color: theme.dark,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        backgroundColor: theme.primary,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <Book size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: theme.secondary }}>Diary Entries</h3>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.secondary }}>{stats.totalDiaries || 0}</div>
                    </div>
                </Card>

                <Card style={{
                    padding: '1.25rem',
                    borderColor: theme.primary,
                    backgroundColor: theme.primary + '10',
                    color: theme.dark,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        backgroundColor: theme.primary,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <Box size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: theme.secondary }}>Buckets</h3>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.secondary }}>{stats.totalBuckets || 0}</div>
                    </div>
                </Card>

                <Card style={{
                    padding: '1.25rem',
                    borderColor: theme.primary,
                    backgroundColor: theme.accent + '10',
                    color: theme.dark,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        backgroundColor: theme.primary,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <CalendarDays size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: theme.secondary }}>Last Entry</h3>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: theme.secondary }}>
                            {stats.lastUpdated ? formatDate(stats.lastUpdated) : 'No entries yet'}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Action Buttons */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap'
            }}>
                <Link to="/diary" style={{
                    backgroundColor: theme.secondary,
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none'
                }}>
                    <Book size={18} /> New Diary Entry
                </Link>

                <Link to="/journal" style={{
                    backgroundColor: theme.secondary,
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none'
                }}>
                    <PenLine size={18} /> New Journal Entry
                </Link>

                <Link to="/buckets" style={{
                    backgroundColor: theme.secondary,
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none'
                }}>
                    <ListTodo size={18} /> Create Bucket
                </Link>
            </div>

            {/* Main Dashboard Content */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {/* Left Column - Diary and Journal */}
                <div style={{ gridColumn: 'span 8' }}>
                    {/* Diary Entries Section */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{
                            color: theme.primary,
                            marginBottom: '1rem',
                            borderBottom: `2px solid ${theme.primary}`,
                            paddingBottom: '0.5rem',
                            fontSize: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Book size={18} /> My Diary Entries
                        </h2>

                        {isLoading || isDecrypting ? (
                            <div style={{ padding: '1rem', textAlign: 'center', color: theme.secondary }}>Loading diary entries...</div>
                        ) : decryptedDiaries.length === 0 ? (
                            <div style={{ padding: '1rem', textAlign: 'center', color: theme.secondary }}>
                                No diary entries yet.
                                <Link to="/diary" style={{ marginLeft: '0.5rem', color: theme.primary }}>Create your first entry!</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {decryptedDiaries.map((entry) => (
                                    <Link to="/diary" key={entry._id || entry.id} style={{ textDecoration: 'none' }}>
                                        <Card style={{
                                            padding: '0.75rem',
                                            borderColor: theme.secondary,
                                            backgroundColor: backgroundColorCard,
                                            color: theme.dark,
                                            transition: 'transform 0.2s',
                                            ':hover': { transform: 'translateY(-2px)' }
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <h3 style={{ margin: 0, fontSize: '1rem', color: theme.secondary, fontWeight: 'bold' }}>
                                                    {truncateTitle(entry.title) || 'Untitled Entry'}
                                                </h3>
                                                <span style={{ fontSize: '0.75rem', color: theme.secondary }}>
                                                    {formatDate(entry.date)}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: theme.secondary, lineHeight: '1.4' }}>
                                                {getDisplayText(entry.content)}
                                            </p>
                                        </Card>
                                    </Link>
                                ))}

                                <Link to="/diary" style={{
                                    textAlign: 'center',
                                    padding: '0.5rem',
                                    color: theme.primary,
                                    fontWeight: '500',
                                    textDecoration: 'none'
                                }}>
                                    View All Diary Entries →
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Journal Entries Section */}
                    <div>
                        <h2 style={{
                            color: theme.primary,
                            marginBottom: '1rem',
                            borderBottom: `2px solid ${theme.primary}`,
                            paddingBottom: '0.5rem',
                            fontSize: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <PenLine size={18} /> My Journal Entries
                        </h2>

                        {isLoading || isDecrypting ? (
                            <div style={{ padding: '1rem', textAlign: 'center', color: theme.secondary }}>Loading journal entries...</div>
                        ) : decryptedJournals.length === 0 ? (
                            <div style={{ padding: '1rem', textAlign: 'center', color: theme.secondary }}>
                                No journal entries yet.
                                <Link to="/journal" style={{ marginLeft: '0.5rem', color: theme.primary }}>Create your first entry!</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {decryptedJournals.map((entry) => (
                                    <Link to="/journal" key={entry._id || entry.id} style={{ textDecoration: 'none' }}>
                                        <Card style={{
                                            padding: '0.75rem',
                                            borderColor: theme.primary,
                                            backgroundColor: backgroundColorCard,
                                            color: theme.dark,
                                            transition: 'transform 0.2s',
                                            ':hover': { transform: 'translateY(-2px)' }
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <h3 style={{ margin: 0, fontSize: '1rem', color: theme.primary, fontWeight: 'bold' }}>
                                                    {truncateTitle(entry.title) || 'Untitled Entry'}
                                                </h3>
                                                <span style={{ fontSize: '0.75rem', color: theme.secondary }}>
                                                    {formatDate(entry.date)}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: theme.secondary, lineHeight: '1.4' }}>
                                                {getDisplayText(entry.content)}
                                            </p>
                                        </Card>
                                    </Link>
                                ))}

                                <Link to="/journal" style={{
                                    textAlign: 'center',
                                    padding: '0.5rem',
                                    color: theme.primary,
                                    fontWeight: '500',
                                    textDecoration: 'none'
                                }}>
                                    View All Journal Entries →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Buckets */}
                <div style={{ gridColumn: 'span 4' }}>
                    <h2 style={{
                        color: theme.primary,
                        marginBottom: '1rem',
                        borderBottom: `2px solid ${theme.primary}`,
                        paddingBottom: '0.5rem',
                        fontSize: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Box size={18} /> My Buckets
                    </h2>

                    {isLoading || isDecrypting ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: theme.secondary }}>Loading buckets...</div>
                    ) : decryptedBuckets.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: theme.secondary }}>
                            No buckets yet.
                            <Link to="/buckets" style={{ marginLeft: '0.5rem', color: theme.primary }}>Create your first bucket!</Link>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '1rem'
                        }}>
                            {decryptedBuckets.slice(0, 5).map((bucket) => (
                                <Link to="/buckets" key={bucket._id} style={{ textDecoration: 'none' }}>
                                    <Card style={{
                                        padding: '1rem',
                                        backgroundColor: backgroundColorCard,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        transition: 'transform 0.2s, box-shadow 0.3s',
                                        border: `2px solid ${bucket.color || theme.accent}`,
                                        borderLeft: `4px solid ${bucket.color || theme.accent}`,
                                    }}>
                                        <div style={{
                                            fontSize: '1.3rem',
                                            marginBottom: '0.5rem',
                                            backgroundColor: isDarkTheme ? `${bucket.color || theme.accent}30` : `${bucket.color || theme.accent}20`,
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            padding: '0.5rem',
                                            border: isDarkTheme ? `1px solid ${bucket.color || theme.accent}50` : 'none'
                                        }}>
                                            {bucket.icon || '📝'}
                                        </div>
                                        <h3 style={{
                                            margin: '0 0 0.5rem 0',
                                            fontSize: '1rem',
                                            color: isDarkTheme ? 'rgba(255,255,255,0.9)' : theme.dark,
                                            fontWeight: 'bold'
                                        }}>
                                            {truncateTitle(bucket.name, 30)}
                                        </h3>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: bucket.color || (isDarkTheme ? 'rgba(255,255,255,0.85)' : theme.secondary),
                                            backgroundColor: isDarkTheme ? `${bucket.color || theme.accent}40` : `${bucket.color || theme.secondary}15`,
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '12px',
                                            fontWeight: '500'
                                        }}>
                                            {bucket.items?.length || 0} items
                                        </div>
                                    </Card>
                                </Link>
                            ))}

                            {decryptedBuckets.length > 5 && (
                                <Link to="/buckets" style={{ textDecoration: 'none' }}>
                                    <Card style={{
                                        padding: '1rem',
                                        backgroundColor: backgroundColorCard,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        borderColor: isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                                        boxShadow: isDarkTheme ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'transform 0.2s',
                                        ':hover': { transform: 'translateY(-3px)' }
                                    }}>
                                        <div style={{
                                            fontSize: '1.5rem',
                                            marginBottom: '0.5rem',
                                            color: isDarkTheme ? 'rgba(255,255,255,0.9)' : theme.dark
                                        }}>
                                            +{decryptedBuckets.length - 5}
                                        </div>
                                        <div style={{
                                            color: theme.primary,
                                            fontWeight: '500'
                                        }}>
                                            View All Buckets
                                        </div>
                                    </Card>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Links Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
            }}>
                <Card style={{
                    padding: '1rem 1.5rem',
                    backgroundColor: theme.secondary + '10',
                    borderColor: theme.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'transform 0.2s'
                }}>
                    <div style={{
                        backgroundColor: theme.secondary,
                        color: 'white',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                    }}>🎨</div>
                    <div>
                        <h3 style={{ margin: '0', fontSize: '1rem', color: theme.primary, fontWeight: 'bold' }}>
                            Import Your Data
                        </h3>
                        <Link to="/import" style={{
                            fontSize: '0.85rem',
                            color: theme.secondary,
                            fontWeight: '500',
                            textDecoration: 'none'
                        }}>
                            Import via JSON files →
                        </Link>
                    </div>
                </Card>

                <Card style={{
                    padding: '1rem 1.5rem',
                    backgroundColor: theme.secondary + '10',
                    borderColor: theme.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'transform 0.2s'
                }}>
                    <div style={{
                        backgroundColor: theme.secondary,
                        color: 'white',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                    }}>💾</div>
                    <div>
                        <h3 style={{ margin: '0', fontSize: '1rem', color: theme.primary, fontWeight: 'bold' }}>
                            Export Your Data
                        </h3>
                        <Link to="/export" style={{
                            fontSize: '0.85rem',
                            color: theme.secondary,
                            fontWeight: '500',
                            textDecoration: 'none'
                        }}>
                            Download in JSON format →
                        </Link>
                    </div>
                </Card>
            </div>

            {/* Today's Date for reference */}
            <div style={{
                marginTop: '3rem',
                textAlign: 'center',
                padding: '1rem',
                color: theme.secondary,
            }}>
                <p>Today is {formatDate(new Date())} - Make it Count!</p>
            </div>
        </div>
    );
};

export default LoggedInView;