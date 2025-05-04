import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import DiaryPage from './pages/DiaryPage';
import JournalPage from './pages/JournalPage';
import MomentsPage from './pages/MomentsPage';
import MediaPage from './pages/MediaPage';
import ThemesPage from './pages/ThemesPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Context
import { ThemeProvider } from './context/ThemeContext';

// UI Components
import { ToastProvider } from './components/ui/Toast';

function App() {
  const currentYear = new Date().getFullYear();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <div className="App">
            <header className="app-header">
              <div className="container">
                <Link to="/" className="app-logo">YouTopia</Link>
                <nav className="nav-links">
                  {isAuthenticated ? (
                    <>
                      <NavLink to="/dashboard" className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }>
                        Dashboard
                      </NavLink>
                      <NavLink to="/diary" className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }>
                        Diary
                      </NavLink>
                      <NavLink to="/journal" className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }>
                        Journal
                      </NavLink>
                      <NavLink to="/moments" className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }>
                        Moments
                      </NavLink>
                      <NavLink to="/media" className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }>
                        Media
                      </NavLink>
                      <NavLink to="/themes" className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }>
                        Themes
                      </NavLink>
                      <button onClick={handleLogout} className="nav-link">Logout</button>
                    </>
                  ) : (
                    <>
                      <NavLink to="/login" className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }>
                        Login
                      </NavLink>
                      <NavLink to="/signup" className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }>
                        Sign Up
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

                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
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
                  <Route path="/moments" element={
                    <ProtectedRoute>
                      <MomentsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/media" element={
                    <ProtectedRoute>
                      <MediaPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/themes" element={
                    <ProtectedRoute>
                      <ThemesPage />
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
                    <a href="#privacy" className="footer-link">Privacy</a>
                    <a href="#export" className="footer-link">Export Data</a>
                    <a href="#about" className="footer-link">About</a>
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
