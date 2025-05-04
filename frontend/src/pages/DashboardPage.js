import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { useTheme } from '../context/ThemeContext';

function DashboardPage() {
    const { currentTheme, themes } = useTheme();
    const theme = themes[currentTheme];

    return (
        <div className="dashboard-container">
            <h1 className="page-title" style={{ color: theme.primary }}>Welcome to Your Utopia</h1>
            <p className="dashboard-intro">Your personal space for journaling, memories, and media.</p>

            <div className="dashboard-grid">
                <Card className="dashboard-card" style={{ borderColor: theme.primary }}>
                    <h2 style={{ color: theme.primary }}>Diary</h2>
                    <p>Record your daily thoughts and reflections</p>
                    <Link to="/diary" className="dashboard-link" style={{ backgroundColor: theme.primary }}>Go to Diary</Link>
                </Card>

                <Card className="dashboard-card" style={{ borderColor: theme.primary }}>
                    <h2 style={{ color: theme.primary }}>Journal</h2>
                    <p>Structured journaling with categories and tags</p>
                    <Link to="/journal" className="dashboard-link" style={{ backgroundColor: theme.primary }}>Go to Journal</Link>
                </Card>

                <Card className="dashboard-card" style={{ borderColor: theme.primary }}>
                    <h2 style={{ color: theme.primary }}>Moments</h2>
                    <p>Save and categorize special memorable moments</p>
                    <Link to="/moments" className="dashboard-link" style={{ backgroundColor: theme.primary }}>Go to Moments</Link>
                </Card>

                <Card className="dashboard-card" style={{ borderColor: theme.primary }}>
                    <h2 style={{ color: theme.primary }}>Media</h2>
                    <p>Store and organize your photos and videos</p>
                    <Link to="/media" className="dashboard-link" style={{ backgroundColor: theme.primary }}>Go to Media</Link>
                </Card>

                <Card className="dashboard-card" style={{ borderColor: theme.primary }}>
                    <h2 style={{ color: theme.primary }}>Themes</h2>
                    <p>Customize the look and feel of your Utopia</p>
                    <Link to="/themes" className="dashboard-link" style={{ backgroundColor: theme.primary }}>Go to Themes</Link>
                </Card>
            </div>
        </div>
    );
}

export default DashboardPage;