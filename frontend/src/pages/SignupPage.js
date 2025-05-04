import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useTheme } from '../context/ThemeContext';

function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { currentTheme, themes } = useTheme();
    const theme = themes[currentTheme];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate password match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
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
                <h1 className="auth-title" style={{ color: theme.primary }}>Sign Up</h1>

                {error && <div className="auth-error" style={{ backgroundColor: theme.error, color: 'white' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name" style={{ color: theme.dark }}>Name</label>
                        <Input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter your name"
                            style={{ borderColor: theme.primary }}
                        />
                    </div>

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
                            placeholder="Create a password"
                            style={{ borderColor: theme.primary }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" style={{ color: theme.dark }}>Confirm Password</label>
                        <Input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm your password"
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
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <div className="auth-links">
                    <p>Already have an account? <Link to="/login" style={{ color: theme.primary }}>Login</Link></p>
                </div>
            </Card>
        </div>
    );
}

export default SignupPage;