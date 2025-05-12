import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import LandingPage from './pages/LandingPage';
import DiaryPage from './pages/DiaryPage';
import JournalPage from './pages/JournalPage';
import BucketsPage from './pages/BucketsPage';
import ThemesPage from './pages/ThemesPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PrivacyPage from './pages/PrivacyPage';
import ExportDataPage from './pages/ExportDataPage';
import ImportDataPage from './pages/ImportDataPage';

// Context
import { ThemeProvider } from './context/ThemeContext';

// UI Components
import { ToastProvider } from './components/ui/Toast';

function App() {
  const currentYear = new Date().getFullYear();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Add mobile menu state

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('userToken');
      if (token) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      // Return a loading indicator or null while checking authentication
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setMobileMenuOpen(false); // Close mobile menu when logging out
    window.location.href = '/'; // Redirect to homepage after logout
  };

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Function to close mobile menu when a link is clicked
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <div className="App">
            <header className="app-header">
              <div className="container">
                <Link to="/" className="app-logo">YouTopia</Link>

                {/* Hamburger menu button (mobile only) */}
                <button
                  className={`hamburger-btn ${mobileMenuOpen ? 'open' : ''}`}
                  onClick={toggleMobileMenu}
                  aria-label="Toggle navigation menu"
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </button>

                <nav className={`nav-links ${mobileMenuOpen ? 'mobile-menu-open' : ''}`} style={{ border: "none" }}>
                  {isAuthenticated ? (
                    <>
                      <NavLink to="/diary" className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      } onClick={closeMobileMenu}>
                        Diary
                      </NavLink>
                      <NavLink to="/journal" className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      } onClick={closeMobileMenu}>
                        Journal
                      </NavLink>
                      <NavLink to="/buckets" className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      } onClick={closeMobileMenu}>
                        Buckets
                      </NavLink>
                      <NavLink to="/themes" className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      } onClick={closeMobileMenu}>
                        Themes
                      </NavLink>
                      <button onClick={handleLogout} className="nav-link">Logout</button>
                    </>
                  ) : (
                    <>
                      <NavLink to="/themes" className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      } onClick={closeMobileMenu}>
                        Themes
                      </NavLink>
                      <NavLink to="/signup" className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      } onClick={closeMobileMenu}>
                        Sign Up
                      </NavLink>
                      <NavLink to="/login" className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      } onClick={closeMobileMenu}>
                        Login
                      </NavLink>
                    </>
                  )}
                </nav>
              </div>
            </header>

            <main className="app-main">
              <div className="container">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
                  <Route path="/signup" element={<SignupPage setIsAuthenticated={setIsAuthenticated} />} />
                  <Route path="/themes" element={<ThemesPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />

                  {/* Protected routes */}
                  <Route path="/diary" element={
                    <ProtectedRoute>
                      <DiaryPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/journal" element={
                    <ProtectedRoute>
                      <JournalPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/buckets" element={
                    <ProtectedRoute>
                      <BucketsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/export" element={
                    <ProtectedRoute>
                      <ExportDataPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/import" element={
                    <ProtectedRoute>
                      <ImportDataPage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </div>
            </main>

            <footer className="app-footer">
              <div className="container">
                <div className="footer-content">
                  <p className="font-display">&copy; {currentYear} YouTopia</p>
                  <div className="footer-links">
                    {isAuthenticated ? (
                      <>
                        <Link to="/import" className="footer-link">Import Data</Link>
                        <Link to="/export" className="footer-link">Export Data</Link>
                      </>
                    ) : null}
                    <Link to="/privacy" className="footer-link">Privacy</Link>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
