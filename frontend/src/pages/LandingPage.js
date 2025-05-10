import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';

function LandingPage() {
    const { currentTheme, themes } = useTheme();
    const theme = themes[currentTheme];
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    // Removed unused navigate variable
    const [activeTip, setActiveTip] = useState(0);

    const tips = [
        "Writing for just 5 minutes a day can improve mental clarity.",
        "Try journaling first thing in the morning for fresh perspectives.",
        "Document your achievements, no matter how small.",
        "Use different colors to highlight various moods in your entries.",
        "Review your past entries monthly to track your personal growth."
    ];

    // Animation for product showcases
    const [animationIndex, setAnimationIndex] = useState(0);
    const showcases = ['journal', 'diary', 'buckets'];

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimationIndex(prev => (prev + 1) % showcases.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [showcases.length]);

    useEffect(() => {
        const tipInterval = setInterval(() => {
            setActiveTip(prev => (prev + 1) % tips.length);
        }, 8000);
        return () => clearInterval(tipInterval);
    }, [tips.length]);

    // Check if user is authenticated on component mount
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            setIsAuthenticated(true);
            // Try to get username from localStorage
            const userData = localStorage.getItem('userData');
            if (userData) {
                try {
                    const parsedData = JSON.parse(userData);
                    setUsername(parsedData.username || '');
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
        }
    }, []);

    // For signed-in users: Dashboard content
    if (isAuthenticated) {
        return (
            <div className="dashboard-container" style={{
                padding: '2rem 1rem',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div>
                        <h1 className="page-title" style={{ color: theme.primary, marginBottom: '0.5rem' }}>
                            Welcome back, {username || 'Friend'}!
                        </h1>
                        <p className="dashboard-intro" style={{ margin: 0, color: theme.secondary }}>
                            Continue your journey of self-reflection and memory keeping
                        </p>
                    </div>

                    <div style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: theme.accent,
                        borderRadius: '8px',
                        border: `2px solid ${theme.dark}`,
                        boxShadow: '3px 3px 0 rgba(0,0,0,0.2)'
                    }}>
                        <p style={{ margin: 0, fontStyle: 'italic', color: theme.dark }}>
                            <strong>Tip of the day:</strong> {tips[activeTip]}
                        </p>
                    </div>
                </div>

                {/* Quick Stats Section */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2.5rem',
                    flexWrap: 'wrap'
                }}>
                    <Card style={{
                        flex: '1',
                        minWidth: '200px',
                        padding: '1.25rem',
                        borderColor: theme.primary,
                        backgroundColor: theme.primary,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{ fontSize: '2.5rem' }}>📝</div>
                        <div>
                            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', opacity: 0.9 }}>CONTINUE</h3>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Today's Journal</h2>
                        </div>
                    </Card>

                    <Card style={{
                        flex: '1',
                        minWidth: '200px',
                        padding: '1.25rem',
                        borderColor: theme.secondary,
                        backgroundColor: theme.secondary,
                        color: theme.dark,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{ fontSize: '2.5rem' }}>✨</div>
                        <div>
                            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', opacity: 0.7 }}>CAPTURE</h3>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>New Bucket</h2>
                        </div>
                    </Card>
                </div>

                {/* Main Dashboard Grid */}
                <div className="dashboard-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem',
                }}>
                    <Card className="dashboard-card" style={{
                        borderColor: theme.primary,
                        padding: '1.5rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'white',
                        border: `3px solid ${theme.primary}`,
                        boxShadow: '5px 5px 0 rgba(0,0,0,0.2)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            backgroundColor: theme.primary,
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            fontSize: '1.5rem',
                            color: 'white'
                        }}>📔</div>
                        <h2 style={{ color: theme.primary, marginBottom: '0.75rem' }}>Diary</h2>
                        <p style={{ marginBottom: '1.5rem', flex: 1 }}>Record your daily thoughts, feelings and experiences. Perfect for personal reflection.</p>
                        <Link to="/diary" className="dashboard-link" style={{
                            backgroundColor: theme.primary,
                            color: 'white',
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            border: `2px solid ${theme.dark}`,
                            boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                            transition: 'all 0.2s ease',
                            textAlign: 'center',
                            marginTop: 'auto'
                        }}>Go to Diary</Link>
                    </Card>

                    <Card className="dashboard-card" style={{
                        borderColor: theme.primary,
                        padding: '1.5rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'white',
                        border: `3px solid ${theme.primary}`,
                        boxShadow: '5px 5px 0 rgba(0,0,0,0.2)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            backgroundColor: theme.primary,
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            fontSize: '1.5rem',
                            color: 'white'
                        }}>📝</div>
                        <h2 style={{ color: theme.primary, marginBottom: '0.75rem' }}>Journal</h2>
                        <p style={{ marginBottom: '1.5rem', flex: 1 }}>Structured journaling with categories and tags. Organize your thoughts methodically.</p>
                        <Link to="/journal" className="dashboard-link" style={{
                            backgroundColor: theme.primary,
                            color: 'white',
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            border: `2px solid ${theme.dark}`,
                            boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                            transition: 'all 0.2s ease',
                            textAlign: 'center',
                            marginTop: 'auto'
                        }}>Go to Journal</Link>
                    </Card>

                    <Card className="dashboard-card" style={{
                        borderColor: theme.primary,
                        padding: '1.5rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'white',
                        border: `3px solid ${theme.primary}`,
                        boxShadow: '5px 5px 0 rgba(0,0,0,0.2)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            backgroundColor: theme.primary,
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            fontSize: '1.5rem',
                            color: 'white'
                        }}>✨</div>
                        <h2 style={{ color: theme.primary, marginBottom: '0.75rem' }}>Buckets</h2>
                        <p style={{ marginBottom: '1.5rem', flex: 1 }}>Create lists for anything you want to remember. From favorite movies to future goals.</p>
                        <Link to="/buckets" className="dashboard-link" style={{
                            backgroundColor: theme.primary,
                            color: 'white',
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            border: `2px solid ${theme.dark}`,
                            boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                            transition: 'all 0.2s ease',
                            textAlign: 'center',
                            marginTop: 'auto'
                        }}>Go to Buckets</Link>
                    </Card>

                    <Card className="dashboard-card" style={{
                        borderColor: theme.primary,
                        padding: '1.5rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'white',
                        border: `3px solid ${theme.primary}`,
                        boxShadow: '5px 5px 0 rgba(0,0,0,0.2)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            backgroundColor: theme.primary,
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            fontSize: '1.5rem',
                            color: 'white'
                        }}>🎨</div>
                        <h2 style={{ color: theme.primary, marginBottom: '0.75rem' }}>Themes</h2>
                        <p style={{ marginBottom: '1.5rem', flex: 1 }}>Customize the look and feel of your Utopia. Make this space truly your own.</p>
                        <Link to="/themes" className="dashboard-link" style={{
                            backgroundColor: theme.primary,
                            color: 'white',
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            border: `2px solid ${theme.dark}`,
                            boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                            transition: 'all 0.2s ease',
                            textAlign: 'center',
                            marginTop: 'auto'
                        }}>Go to Themes</Link>
                    </Card>

                    <Card className="dashboard-card" style={{
                        borderColor: theme.primary,
                        padding: '1.5rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'white',
                        border: `3px solid ${theme.primary}`,
                        boxShadow: '5px 5px 0 rgba(0,0,0,0.2)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            backgroundColor: theme.primary,
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            fontSize: '1.5rem',
                            color: 'white'
                        }}>💾</div>
                        <h2 style={{ color: theme.primary, marginBottom: '0.75rem' }}>Export Data</h2>
                        <p style={{ marginBottom: '1.5rem', flex: 1 }}>Download all your valuable data in JSON format. Keep your memories safe and portable.</p>
                        <Link to="/export" className="dashboard-link" style={{
                            backgroundColor: theme.primary,
                            color: 'white',
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            border: `2px solid ${theme.dark}`,
                            boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                            transition: 'all 0.2s ease',
                            textAlign: 'center',
                            marginTop: 'auto'
                        }}>Export Data</Link>
                    </Card>
                </div>
            </div>
        );
    }

    // For guest users: Creative product-focused layout
    // Check if the current theme is dark
    const isDarkTheme = ['nightOwl', 'darkRoast', 'obsidian', 'darkForest'].includes(currentTheme);

    // Determine text and background colors based on theme
    const textColor = isDarkTheme ? theme.text : theme.dark;
    const textColorLight = isDarkTheme ? theme.textLight : theme.text;
    const backgroundColorMain = isDarkTheme ? theme.dark : theme.light;
    const backgroundColorCard = isDarkTheme ? theme.light : 'white';

    return (
        <div className="landing-container" style={{ position: 'relative', color: textColor, backgroundColor: backgroundColorMain }}>
            {/* Animated background elements */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                top: 0,
                left: 0,
                zIndex: 0,
                opacity: isDarkTheme ? 0.2 : 0.3 // Reduce opacity for dark themes
            }}>
            </div>

            {/* Hero Section - More dynamic and product-focused */}
            <section style={{
                padding: '4rem 2rem',
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                background: isDarkTheme
                    ? `linear-gradient(135deg, ${theme.dark}, ${theme.light}30)`
                    : `linear-gradient(135deg, ${theme.light}CC, ${theme.accent}99)`,
                borderBottom: `2px solid ${theme.primary}`
            }}>
                <div style={{ maxWidth: '800px' }}>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        color: theme.primary,
                        marginBottom: '1rem',
                        fontWeight: 800,
                        textShadow: isDarkTheme ? `2px 2px 0 rgba(0,0,0,0.5)` : `2px 2px 0 rgba(0,0,0,0.1)`
                    }}>
                        Your Digital Sanctuary
                    </h1>

                    <p style={{
                        fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                        marginBottom: '2rem',
                        color: textColor,
                        maxWidth: '600px',
                        margin: '0 auto 2rem'
                    }}>
                        <span style={{ fontWeight: 'bold', color: theme.primary }}>YouTopia</span> transforms your thoughts, memories, and experiences into a beautifully organized personal oasis
                    </p>

                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        marginBottom: '3rem'
                    }}>
                        <Link to="/signup" style={{
                            backgroundColor: theme.primary,
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            fontSize: '1.1rem',
                            border: `3px solid ${theme.dark}`,
                            boxShadow: `5px 5px 0 rgba(0,0,0,0.2)`,
                            transition: 'all 0.2s ease'
                        }}>
                            Get Started — It's Free
                        </Link>

                        <Link to="/login" style={{
                            backgroundColor: isDarkTheme ? theme.light : 'white',
                            color: theme.primary,
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            fontSize: '1.1rem',
                            border: `3px solid ${theme.primary}`,
                            boxShadow: `5px 5px 0 rgba(0,0,0,0.2)`,
                            transition: 'all 0.2s ease'
                        }}>
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Interactive Product Showcase */}
                <div style={{
                    width: '100%',
                    maxWidth: '900px',
                    height: '400px',
                    position: 'relative',
                    marginTop: '2rem',
                    borderRadius: '12px',
                    boxShadow: isDarkTheme ? `0 10px 30px rgba(0,0,0,0.5)` : `0 10px 30px rgba(0,0,0,0.2)`,
                    overflow: 'hidden',
                    border: `3px solid ${theme.dark}`
                }}>
                    {/* Product Showcase - Changes every few seconds */}
                    <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        transition: 'transform 1.5s ease',
                        transform: `translateX(-${animationIndex * 100}%)`
                    }}>
                        {/* Journal Demo */}
                        <div style={{
                            flexShrink: 0,
                            width: '100%',
                            height: '100%',
                            background: isDarkTheme
                                ? `linear-gradient(135deg, ${theme.dark}, ${theme.primary}20)`
                                : `linear-gradient(135deg, ${theme.light}, ${theme.primary}30)`,
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <h3 style={{ color: theme.primary, marginBottom: '1rem', fontSize: '1.5rem' }}>Journal</h3>
                            <div style={{
                                flex: 1,
                                backgroundColor: backgroundColorCard,
                                borderRadius: '8px',
                                padding: '1.5rem',
                                boxShadow: isDarkTheme ? `0 5px 15px rgba(0,0,0,0.3)` : `0 5px 15px rgba(0,0,0,0.1)`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ width: '100%', height: '3rem', backgroundColor: isDarkTheme ? theme.dark : '#f5f5f5', borderRadius: '4px' }}></div>
                                <div style={{ width: '80%', height: '2rem', backgroundColor: isDarkTheme ? theme.dark : '#f5f5f5', borderRadius: '4px' }}></div>
                                <div style={{ width: '90%', height: '2rem', backgroundColor: isDarkTheme ? theme.dark : '#f5f5f5', borderRadius: '4px' }}></div>
                                <div style={{ width: '75%', height: '2rem', backgroundColor: isDarkTheme ? theme.dark : '#f5f5f5', borderRadius: '4px' }}></div>
                                <div style={{ width: '85%', height: '2rem', backgroundColor: isDarkTheme ? theme.dark : '#f5f5f5', borderRadius: '4px' }}></div>
                            </div>
                        </div>

                        {/* Diary Demo */}
                        <div style={{
                            flexShrink: 0,
                            width: '100%',
                            height: '100%',
                            background: isDarkTheme
                                ? `linear-gradient(135deg, ${theme.dark}, ${theme.secondary}20)`
                                : `linear-gradient(135deg, ${theme.light}, ${theme.secondary}30)`,
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <h3 style={{ color: theme.primary, marginBottom: '1rem', fontSize: '1.5rem' }}>Diary</h3>
                            <div style={{
                                flex: 1,
                                backgroundColor: backgroundColorCard,
                                borderRadius: '8px',
                                padding: '1.5rem',
                                boxShadow: isDarkTheme ? `0 5px 15px rgba(0,0,0,0.3)` : `0 5px 15px rgba(0,0,0,0.1)`,
                                backgroundImage: isDarkTheme
                                    ? `linear-gradient(${theme.dark} 1px, transparent 1px), linear-gradient(90deg, ${theme.dark} 1px, transparent 1px)`
                                    : `linear-gradient(#f1f1f1 1px, transparent 1px), linear-gradient(90deg, #f1f1f1 1px, transparent 1px)`,
                                backgroundSize: '20px 20px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '1.5rem',
                                    left: '1.5rem',
                                    right: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                }}>
                                    <div style={{ fontSize: '1.2rem', color: textColor, fontWeight: 'bold' }}>May 8, 2025</div>
                                    <div style={{ width: '100%', height: '2px', backgroundColor: isDarkTheme ? theme.light : '#ddd' }}></div>
                                    <div style={{ width: '90%', height: '1rem', backgroundColor: isDarkTheme ? theme.dark : '#f5f5f5', borderRadius: '2px', marginTop: '0.5rem' }}></div>
                                    <div style={{ width: '80%', height: '1rem', backgroundColor: isDarkTheme ? theme.dark : '#f5f5f5', borderRadius: '2px' }}></div>
                                    <div style={{ width: '85%', height: '1rem', backgroundColor: isDarkTheme ? theme.dark : '#f5f5f5', borderRadius: '2px' }}></div>
                                    <div style={{ width: '75%', height: '1rem', backgroundColor: isDarkTheme ? theme.dark : '#f5f5f5', borderRadius: '2px' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Buckets Demo */}
                        <div style={{
                            flexShrink: 0,
                            width: '100%',
                            height: '100%',
                            background: isDarkTheme
                                ? `linear-gradient(135deg, ${theme.dark}, ${theme.accent}20)`
                                : `linear-gradient(135deg, ${theme.light}, ${theme.accent}30)`,
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <h3 style={{ color: theme.primary, marginBottom: '1rem', fontSize: '1.5rem' }}>Buckets</h3>
                            <div style={{
                                flex: 1,
                                backgroundColor: backgroundColorCard,
                                borderRadius: '8px',
                                padding: '1.5rem',
                                boxShadow: isDarkTheme ? `0 5px 15px rgba(0,0,0,0.3)` : `0 5px 15px rgba(0,0,0,0.1)`,
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                justifyContent: 'center',
                                alignContent: 'flex-start'
                            }}>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} style={{
                                        width: '120px',
                                        height: '120px',
                                        backgroundColor: `${theme[Object.keys(theme)[i % 5]]}30`,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem'
                                    }}>
                                        {['📸', '🎉', '⭐', '🌈', '🎭', '💖'][i]}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Demo navigation dots */}
                    <div style={{
                        position: 'absolute',
                        bottom: '1rem',
                        left: '0',
                        right: '0',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.75rem'
                    }}>
                        {showcases.map((_, i) => (
                            <button key={i} onClick={() => setAnimationIndex(i)} style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: i === animationIndex ? theme.primary : 'rgba(255,255,255,0.7)',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }} />
                        ))}
                    </div>
                </div>

                {/* Social proof */}
                <div style={{
                    display: 'flex',
                    gap: '2rem',
                    marginTop: '3rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    maxWidth: '900px'
                }}>
                    {[
                        { name: "unignoramus", text: "Quick, simple, and effective. Does its job well, and has theming options too!" },
                        { name: "Samira", text: "This app has become my daily companion. The themes are beautiful and the interface is so intuitive." },
                        { name: "Marco", text: "The privacy features give me peace of mind. I can finally write without worrying about my data." }
                    ].map((review, i) => (
                        <div key={i} style={{
                            flex: '1 1 250px',
                            padding: '1.5rem',
                            backgroundColor: isDarkTheme ? theme.light : 'white',
                            color: isDarkTheme ? theme.dark : theme.text,
                            borderRadius: '8px',
                            boxShadow: isDarkTheme ? `0 5px 15px rgba(0,0,0,0.3)` : `0 5px 15px rgba(0,0,0,0.1)`,
                            position: 'relative',
                            border: `2px solid ${theme.primary}`
                        }}>
                            <div style={{ fontSize: '2rem', color: theme.primary, position: 'absolute', top: '1rem', left: '1rem' }}>"</div>
                            <p style={{ marginTop: '1.5rem', marginBottom: '1rem', fontStyle: 'italic' }}>{review.text}</p>
                            <div style={{ fontWeight: 'bold', color: theme.primary }}>{review.name}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section with Interactive Elements */}
            <section style={{ padding: '5rem 2rem', background: isDarkTheme ? theme.dark : 'white', color: textColor }}>
                <h2 style={{
                    textAlign: 'center',
                    color: theme.primary,
                    marginBottom: '3rem',
                    fontSize: 'clamp(2rem, 3vw, 2.5rem)'
                }}>
                    Everything You Need for Digital Self-Expression
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {[
                        {
                            icon: '📔',
                            title: 'Personal Diary',
                            description: 'Record your daily thoughts and experiences in a secure space, organized by date.'
                        },
                        {
                            icon: '📝',
                            title: 'Structured Journal',
                            description: 'Create organized entries with categories, tags, and formatting. Find exactly what you need, when you need it.'
                        },
                        {
                            icon: '✨',
                            title: 'Capture Buckets',
                            description: 'Save special memories and milestones in a dedicated space. Never forget life\'s highlights.'
                        },
                        {
                            icon: '🎨',
                            title: 'Custom Themes',
                            description: 'Personalize your experience with beautiful visual themes that match your style.'
                        },
                        {
                            icon: '💾',
                            title: 'Data Export',
                            description: 'Download your content anytime in JSON format. Your data remains portable and always yours.'
                        },
                        {
                            icon: '🔒',
                            title: 'Privacy First',
                            description: 'Your data belongs to you alone. We prioritize security and privacy in everything we do.'
                        }
                    ].map((feature, i) => (
                        <div key={i} style={{
                            padding: '2rem',
                            borderRadius: '12px',
                            backgroundColor: isDarkTheme ? theme.light + '20' : theme.light,
                            border: `2px solid ${theme.primary}`,
                            transition: 'all 0.3s ease',
                            height: '100%'
                        }}>
                            <div style={{
                                fontSize: '3rem',
                                marginBottom: '1rem'
                            }}>{feature.icon}</div>
                            <h3 style={{
                                color: isDarkTheme ? theme.text : theme.dark,
                                marginBottom: '1rem',
                                fontSize: '1.3rem'
                            }}>{feature.title}</h3>
                            <p style={{ color: textColorLight }}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it Works section */}
            <section style={{
                padding: '5rem 2rem',
                background: isDarkTheme
                    ? `linear-gradient(135deg, ${theme.dark}, ${theme.light}10)`
                    : `linear-gradient(135deg, ${theme.light}, ${theme.accent}20)`,
                position: 'relative',
                overflow: 'hidden',
                color: textColor
            }}>
                <h2 style={{
                    textAlign: 'center',
                    color: theme.primary,
                    marginBottom: '3rem',
                    fontSize: 'clamp(2rem, 3vw, 2.5rem)',
                    position: 'relative',
                    zIndex: 1
                }}>
                    Your Journey in YouTopia
                </h2>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: '800px',
                    margin: '0 auto',
                    gap: '4rem',
                    position: 'relative'
                }}>
                    {/* Connecting line */}
                    <div style={{
                        position: 'absolute',
                        width: '4px',
                        backgroundColor: theme.primary,
                        top: '0',
                        bottom: '0',
                        left: '30px',
                        zIndex: 0
                    }} />

                    {[
                        {
                            step: 1,
                            title: 'Create your account',
                            description: 'Sign up in seconds to get your own personalized space. No credit card required.'
                        },
                        {
                            step: 2,
                            title: 'Choose your theme',
                            description: 'Select from beautiful themes to make YouTopia feel like your own.'
                        },
                        {
                            step: 3,
                            title: 'Start journaling',
                            description: 'Begin recording your thoughts, memories, and experiences right away.'
                        },
                        {
                            step: 4,
                            title: 'Organize and reflect',
                            description: 'Build your personal knowledge base and see your growth over time.'
                        }
                    ].map((step, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            gap: '2rem',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                backgroundColor: theme.primary,
                                color: 'white',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                flexShrink: 0,
                                border: isDarkTheme ? `3px solid ${theme.light}` : '3px solid white',
                                boxShadow: isDarkTheme ? `0 5px 15px rgba(0,0,0,0.4)` : `0 5px 15px rgba(0,0,0,0.2)`
                            }}>
                                {step.step}
                            </div>

                            <div>
                                <h3 style={{
                                    color: isDarkTheme ? theme.text : theme.dark,
                                    marginBottom: '0.75rem',
                                    fontSize: '1.4rem'
                                }}>{step.title}</h3>
                                <p style={{ fontSize: '1.1rem', color: textColorLight }}>{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section style={{
                padding: '5rem 2rem',
                background: theme.primary,
                color: 'white',
                textAlign: 'center'
            }}>
                <h2 style={{
                    fontSize: 'clamp(2rem, 3vw, 2.5rem)',
                    marginBottom: '1.5rem',
                    color: 'white'
                }}>Ready to Start Your Digital Sanctuary?</h2>

                <p style={{
                    maxWidth: '600px',
                    margin: '0 auto 2.5rem',
                    fontSize: '1.2rem',
                    opacity: 0.9
                }}>
                    Join thousands of people who are documenting their lives, preserving memories, and growing through self-reflection.
                </p>

                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <Link to="/signup" style={{
                        backgroundColor: 'white',
                        color: theme.primary,
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        fontSize: '1.1rem',
                        border: `3px solid white`,
                        boxShadow: `5px 5px 0 rgba(0,0,0,0.2)`,
                        transition: 'all 0.2s ease'
                    }}>
                        Create Free Account
                    </Link>

                    <Link to="/login" style={{
                        backgroundColor: 'transparent',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        fontSize: '1.1rem',
                        border: `3px solid white`,
                        boxShadow: `5px 5px 0 rgba(0,0,0,0.2)`,
                        transition: 'all 0.2s ease'
                    }}>
                        Sign In
                    </Link>
                </div>
            </section>

            {/* Add some keyframe animations for various elements */}
            <style>
                {`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(10px, -15px); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                `}
            </style>
        </div>
    );
}

export default LandingPage;