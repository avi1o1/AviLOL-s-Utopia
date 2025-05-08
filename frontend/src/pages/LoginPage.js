import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useTheme } from '../context/ThemeContext';

// Define API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function LoginPage({ setIsAuthenticated }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { currentTheme, themes } = useTheme();
    const theme = themes[currentTheme];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store the token and user data in localStorage
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userData', JSON.stringify({
                _id: data._id,
                username: data.username
            }));

            // Set authentication state
            setIsAuthenticated(true);

            // Redirect to home page instead of dashboard
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <Card className="auth-card" style={{ borderColor: theme.primary }}>
                <h1 className="auth-title" style={{ color: theme.primary }}>Login</h1>

                {error && <div className="auth-error" style={{ backgroundColor: theme.error, color: 'white' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username" style={{ color: theme.dark }}>Username</label>
                        <Input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter your username"
                            style={{ borderColor: theme.primary }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" style={{ color: theme.dark }}>Password</label>
                        <Input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            style={{ borderColor: theme.primary }}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            backgroundColor: theme.primary,
                            color: 'white',
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <div className="auth-links">
                    <p style={{ color: theme.dark }}>Don't have an account? <Link to="/signup" style={{ color: theme.primary }}>Sign Up</Link></p>
                </div>
            </Card>
        </div>
    );
}

export default LoginPage;