import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const GuestView = () => {
    const { currentTheme, themes } = useTheme();
    const theme = themes[currentTheme];

    // Animation for product showcases
    const [animationIndex, setAnimationIndex] = useState(0);
    const showcases = ['journal', 'diary', 'buckets'];

    // Determine if the current theme is a dark theme by checking its text color
    const isDarkTheme = theme.text.startsWith('#F') || theme.text.startsWith('#f') ||
        theme.text.startsWith('#E') || theme.text.startsWith('#e') ||
        theme.text === '#FAFAFA' || theme.text === '#F5F5F4' || theme.text === '#F9FAFB' ||
        theme.text === '#F8FAFC';

    // Determine text and background colors based on theme
    const textColor = isDarkTheme ? theme.text : theme.dark;
    const textColorLight = isDarkTheme ? theme.textLight : theme.text;
    const backgroundColorMain = isDarkTheme ? theme.dark : theme.light;
    const backgroundColorCard = isDarkTheme ? theme.dark : theme.light;
    const highlightColor = isDarkTheme ? theme.light : theme.dark;

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimationIndex(prev => (prev + 1) % showcases.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [showcases.length]);

    return (
        <div className="landing-container" style={{ position: 'relative', color: textColor, backgroundColor: backgroundColorMain }}>
            {/* Hero Section */}
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
                            color: highlightColor,
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            fontSize: '1.1rem',
                            border: `3px solid ${theme.dark}`,
                            boxShadow: `5px 5px 0 ${theme.dark}40`,
                            transition: 'all 0.2s ease'
                        }}>
                            Get Started - It's Free
                        </Link>

                        <Link to="/login" style={{
                            backgroundColor: isDarkTheme ? theme.light : highlightColor,
                            color: theme.primary,
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            fontSize: '1.1rem',
                            border: `3px solid ${theme.primary}`,
                            boxShadow: `5px 5px 0 ${theme.dark}40`,
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
                    boxShadow: isDarkTheme ? `0 10px 30px ${theme.dark}80` : `0 10px 30px ${theme.dark}40`,
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
                                boxShadow: isDarkTheme ? `0 5px 15px ${theme.dark}60` : `0 5px 15px ${theme.dark}20`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ width: '100%', height: '3rem', backgroundColor: isDarkTheme ? theme.dark : theme.light, borderRadius: '4px' }}></div>
                                <div style={{ width: '80%', height: '2rem', backgroundColor: isDarkTheme ? theme.dark : theme.light, borderRadius: '4px' }}></div>
                                <div style={{ width: '90%', height: '2rem', backgroundColor: isDarkTheme ? theme.dark : theme.light, borderRadius: '4px' }}></div>
                                <div style={{ width: '75%', height: '2rem', backgroundColor: isDarkTheme ? theme.dark : theme.light, borderRadius: '4px' }}></div>
                                <div style={{ width: '85%', height: '2rem', backgroundColor: isDarkTheme ? theme.dark : theme.light, borderRadius: '4px' }}></div>
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
                                boxShadow: isDarkTheme ? `0 5px 15px ${theme.dark}60` : `0 5px 15px ${theme.dark}20`,
                                backgroundImage: isDarkTheme
                                    ? `linear-gradient(${theme.light}30 1px, transparent 1px), linear-gradient(90deg, ${theme.light}30 1px, transparent 1px)`
                                    : `linear-gradient(${theme.dark}10 1px, transparent 1px), linear-gradient(90deg, ${theme.dark}10 1px, transparent 1px)`,
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
                                    <div style={{ width: '100%', height: '2px', backgroundColor: isDarkTheme ? theme.light : theme.dark + '20' }}></div>
                                    <div style={{ width: '90%', height: '1rem', backgroundColor: isDarkTheme ? theme.light + '30' : theme.dark + '10', borderRadius: '2px', marginTop: '0.5rem' }}></div>
                                    <div style={{ width: '80%', height: '1rem', backgroundColor: isDarkTheme ? theme.light + '30' : theme.dark + '10', borderRadius: '2px' }}></div>
                                    <div style={{ width: '85%', height: '1rem', backgroundColor: isDarkTheme ? theme.light + '30' : theme.dark + '10', borderRadius: '2px' }}></div>
                                    <div style={{ width: '75%', height: '1rem', backgroundColor: isDarkTheme ? theme.light + '30' : theme.dark + '10', borderRadius: '2px' }}></div>
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
                                boxShadow: isDarkTheme ? `0 5px 15px ${theme.dark}60` : `0 5px 15px ${theme.dark}20`,
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
                                backgroundColor: i === animationIndex ? theme.primary : theme.light + '80',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                boxShadow: `0 2px 4px ${theme.dark}40`
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
                            backgroundColor: isDarkTheme ? theme.light + '20' : highlightColor,
                            color: isDarkTheme ? theme.light : theme.text,
                            borderRadius: '8px',
                            boxShadow: isDarkTheme ? `0 5px 15px ${theme.dark}60` : `0 5px 15px ${theme.dark}20`,
                            position: 'relative',
                            border: `2px solid ${theme.primary}`
                        }}>
                            <div style={{ fontSize: '2rem', color: theme.primary, position: 'absolute', top: '1rem', left: '1rem' }}>"</div>
                            <p style={{ marginTop: '1.5rem', color: theme.text, marginBottom: '1rem', fontStyle: 'italic' }}>{review.text}</p>
                            <div style={{ fontWeight: 'bold', color: theme.primary }}>{review.name}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section with Interactive Elements */}
            <section style={{ padding: '5rem 2rem', background: isDarkTheme ? theme.dark : highlightColor, color: textColor }}>
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
                                color: highlightColor,
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                flexShrink: 0,
                                border: isDarkTheme ? `3px solid ${theme.light}` : `3px solid ${highlightColor}`,
                                boxShadow: isDarkTheme ? `0 5px 15px ${theme.dark}80` : `0 5px 15px ${theme.dark}40`
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
                color: highlightColor,
                textAlign: 'center'
            }}>
                <h2 style={{
                    fontSize: 'clamp(2rem, 3vw, 2.5rem)',
                    marginBottom: '1.5rem',
                    color: highlightColor
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
                        backgroundColor: highlightColor,
                        color: theme.primary,
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        fontSize: '1.1rem',
                        border: `3px solid ${highlightColor}`,
                        boxShadow: `5px 5px 0 ${theme.dark}40`,
                        transition: 'all 0.2s ease'
                    }}>
                        Create Free Account
                    </Link>

                    <Link to="/login" style={{
                        backgroundColor: 'transparent',
                        color: highlightColor,
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        fontSize: '1.1rem',
                        border: `3px solid ${highlightColor}`,
                        boxShadow: `5px 5px 0 ${theme.dark}40`,
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
};

export default GuestView;