import React, { useState, useEffect, useContext, createContext } from 'react';
import { useTheme } from '../../context/ThemeContext';

// Create a context for toast management
const ToastContext = createContext();

// Toast component for individual notifications
const Toast = ({
  message,
  type = 'success',
  duration = 3000,
  onClose
}) => {
  const [visible, setVisible] = useState(true);
  const { currentTheme, themes } = useTheme();

  // Access the current theme object from the themes collection
  const theme = themes[currentTheme];

  // Determine if the current theme is a dark theme by checking its text color
  const isDarkTheme = theme.text.startsWith('#F') || theme.text.startsWith('#f') ||
    theme.text.startsWith('#E') || theme.text.startsWith('#e') ||
    theme.text === '#FAFAFA' || theme.text === '#F5F5F4' || theme.text === '#F9FAFB' ||
    theme.text === '#F8FAFC';

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  if (!visible) return null;

  // Get theme colors based on toast type
  const getToastStyles = (type) => {
    // Base styles
    const baseStyles = {
      backgroundColor: isDarkTheme ? 'var(--color-light)' : 'white',
      color: 'var(--color-text)',
      borderColor: 'var(--color-primary)'
    };

    // Type-specific styles
    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          borderColor: 'var(--color-success)',
          backgroundColor: isDarkTheme
            ? 'rgba(16, 185, 129, 0.15)' // Dark success background
            : 'rgba(16, 185, 129, 0.1)' // Light success background
        };
      case 'error':
        return {
          ...baseStyles,
          borderColor: 'var(--color-error)',
          backgroundColor: isDarkTheme
            ? 'rgba(239, 68, 68, 0.15)' // Dark error background
            : 'rgba(239, 68, 68, 0.1)' // Light error background
        };
      case 'warning':
        return {
          ...baseStyles,
          borderColor: 'var(--color-warning)',
          backgroundColor: isDarkTheme
            ? 'rgba(245, 158, 11, 0.15)' // Dark warning background
            : 'rgba(245, 158, 11, 0.1)' // Light warning background
        };
      case 'info':
        return {
          ...baseStyles,
          borderColor: 'var(--color-info)',
          backgroundColor: isDarkTheme
            ? 'rgba(59, 130, 246, 0.15)' // Dark info background
            : 'rgba(59, 130, 246, 0.1)' // Light info background
        };
      default:
        return baseStyles;
    }
  };

  const toastStyles = getToastStyles(type);

  // Get icon based on toast type
  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="var(--color-success)">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="var(--color-error)">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="var(--color-warning)">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="var(--color-info)">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const typeTextColors = {
    success: 'var(--color-success)',
    error: 'var(--color-error)',
    warning: 'var(--color-warning)',
    info: 'var(--color-info)'
  };

  return (
    <div
      className="toast-item"
      style={{
        position: 'relative',
        backgroundColor: toastStyles.backgroundColor,
        color: toastStyles.color,
        borderLeft: `4px solid ${toastStyles.borderColor}`,
        borderRadius: '6px',
        boxShadow: isDarkTheme
          ? '0 4px 12px rgba(0, 0, 0, 0.3)'
          : '6px 6px 0 var(--color-shadow)',
        border: isDarkTheme
          ? `1px solid ${toastStyles.borderColor}`
          : '2px solid var(--color-dark)',
        borderLeftWidth: '4px',
        padding: '12px 16px',
        width: '100%',
        maxWidth: '400px',
        backdropFilter: 'blur(4px)',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s ease',
        transform: 'translateX(0)',
        opacity: 1,
        animationName: 'slideInRight',
        animationDuration: '0.3s',
        animationFillMode: 'forwards',
        animationTimingFunction: 'ease'
      }}
    >
      <div className="toast-icon" style={{ marginRight: '12px' }}>
        {getToastIcon()}
      </div>

      <div className="toast-content" style={{ flex: 1 }}>
        <p style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: 500,
          color: isDarkTheme ? typeTextColors[type] : 'var(--color-dark)'
        }}>
          {message}
        </p>
      </div>

      <button
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginLeft: '12px',
          color: 'var(--color-gray)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px'
        }}
      >
        <span className="sr-only">Close</span>
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// Toast context provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  // Expose the showToast method globally
  useEffect(() => {
    window.showToast = addToast;

    return () => {
      delete window.showToast;
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        className="toast-container"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Hook to use toast functionality
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Standalone container for apps not using the context
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  // Expose a global function to add new toasts
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.showToast) {
      window.showToast = (message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
        return id;
      };
    }

    return () => {
      // Clean up only if our function is still the one registered
      if (window.showToast && window.showToast.toString().includes('setToasts')) {
        delete window.showToast;
      }
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <div
      className="toast-container"
      style={{
        position: 'fixed',
        bottom: '20px', // Changed from 'top' to 'bottom'
        right: '20px',
        zIndex: 10000, // Increased z-index to appear above modal overlay
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export { Toast, ToastContainer };