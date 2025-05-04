import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function LandingPage() {
    const { currentTheme, themes } = useTheme();
    const theme = themes[currentTheme];

    return (
        <div className="landing-container">
            {/* Hero Section */}
            <section className="landing-hero" style={{ backgroundColor: theme.accent }}>
                <div className="landing-hero-content">
                    <h1 style={{ color: theme.primary }}>Welcome to YouTopia</h1>
                    <p className="landing-subtitle">Your private space for journaling, memories, and self-reflection</p>

                    <div className="landing-cta-buttons">
                        <Link to="/signup" className="landing-cta-button primary" style={{ backgroundColor: theme.primary }}>
                            Get Started
                        </Link>
                        <Link to="/login" className="landing-cta-button secondary" style={{ borderColor: theme.primary, color: theme.primary }}>
                            Login
                        </Link>
                    </div>
                </div>
                <div className="landing-hero-image">
                    <div className="landing-image-placeholder" style={{ backgroundColor: theme.secondary }}>
                        <span style={{ color: theme.dark }}>Journal Your Journey</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features">
                <h2 className="landing-section-title" style={{ color: theme.primary }}>Features</h2>

                <div className="landing-feature-grid">
                    <div className="landing-feature-card" style={{ borderColor: theme.primary }}>
                        <div className="landing-feature-icon" style={{ backgroundColor: theme.primary }}>📔</div>
                        <h3>Personal Diary</h3>
                        <p>Record your daily thoughts, reflections, and experiences in a secure and private space.</p>
                    </div>

                    <div className="landing-feature-card" style={{ borderColor: theme.primary }}>
                        <div className="landing-feature-icon" style={{ backgroundColor: theme.primary }}>📝</div>
                        <h3>Structured Journal</h3>
                        <p>Organize your thoughts with structured journal entries, categories, and tags.</p>
                    </div>

                    <div className="landing-feature-card" style={{ borderColor: theme.primary }}>
                        <div className="landing-feature-icon" style={{ backgroundColor: theme.primary }}>✨</div>
                        <h3>Special Moments</h3>
                        <p>Save and categorize your special moments and memories in one place.</p>
                    </div>

                    <div className="landing-feature-card" style={{ borderColor: theme.primary }}>
                        <div className="landing-feature-icon" style={{ backgroundColor: theme.primary }}>🖼️</div>
                        <h3>Media Collection</h3>
                        <p>Store and organize photos and videos that matter to you.</p>
                    </div>

                    <div className="landing-feature-card" style={{ borderColor: theme.primary }}>
                        <div className="landing-feature-icon" style={{ backgroundColor: theme.primary }}>🎨</div>
                        <h3>Custom Themes</h3>
                        <p>Personalize your experience with different visual themes and colors.</p>
                    </div>

                    <div className="landing-feature-card" style={{ borderColor: theme.primary }}>
                        <div className="landing-feature-icon" style={{ backgroundColor: theme.primary }}>🔒</div>
                        <h3>Private & Secure</h3>
                        <p>Your data stays private and secure, with options for local storage.</p>
                    </div>
                </div>
            </section>

            {/* Why Use Section */}
            <section className="landing-why" style={{ backgroundColor: theme.light }}>
                <h2 className="landing-section-title" style={{ color: theme.primary }}>Why Use AviLOL's Utopia?</h2>

                <div className="landing-why-content">
                    <div className="landing-why-text">
                        <p>In today's fast-paced digital world, having a private space to reflect, document, and organize your thoughts is essential for mental well-being and personal growth.</p>
                        <p>AviLOL's Utopia provides that space with a focus on privacy, customization, and ease of use. No ads, no data mining - just your thoughts, your way.</p>
                        <p>Start your journaling journey today and create your own personal utopia of memories, reflections, and moments that matter.</p>
                    </div>

                    <div className="landing-why-image">
                        <div className="landing-image-placeholder" style={{ backgroundColor: theme.secondary }}>
                            <span style={{ color: theme.dark }}>Your Digital Sanctuary</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="landing-cta" style={{ backgroundColor: theme.primary }}>
                <h2 className="landing-cta-title" style={{ color: 'white' }}>Ready to Start Your Journey?</h2>
                <p className="landing-cta-subtitle" style={{ color: 'white' }}>Create an account or log in to access your personal utopia</p>

                <div className="landing-cta-buttons">
                    <Link to="/signup" className="landing-cta-button white" style={{ backgroundColor: 'white', color: theme.primary }}>
                        Sign Up Now
                    </Link>
                    <Link to="/login" className="landing-cta-button outline" style={{ borderColor: 'white', color: 'white' }}>
                        Login
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default LandingPage;