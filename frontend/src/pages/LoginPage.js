import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useTheme } from '../context/ThemeContext';

function LoginPage() {
    const [email, setEmail] = useState('');
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
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store the token in localStorage
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));

            // Redirect to dashboard
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
                        <label htmlFor="email" style={{ color: theme.dark }}>Email</label>
                        <Input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
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
                    <p>Don't have an account? <Link to="/signup" style={{ color: theme.primary }}>Sign Up</Link></p>
                </div>
            </Card>
        </div>
    );
}

export default LoginPage;