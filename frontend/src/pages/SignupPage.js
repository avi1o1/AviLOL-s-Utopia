import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useTheme } from '../context/ThemeContext';
import { hashPassword, deriveEncryptionKey } from '../utils/cryptoUtils';

// Define API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function SignupPage({ setIsAuthenticated }) {
    const [username, setUsername] = useState('');
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
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Generate password hash for encryption purposes
            const passwordHash = await hashPassword(password);

            // Test the key derivation to ensure it works before saving
            await deriveEncryptionKey(passwordHash);

            // Store the hash for encryption/decryption operations
            localStorage.setItem('encryptionKey', passwordHash);

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
                <h1 className="auth-title" style={{ color: theme.primary }}>Sign Up</h1>

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
                            placeholder="Choose a username"
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
                    <p style={{ color: theme.dark }}>Already have an account? <Link to="/login" style={{ color: theme.primary }}>Login</Link></p>
                </div>
            </Card>
        </div>
    );
}

export default SignupPage;