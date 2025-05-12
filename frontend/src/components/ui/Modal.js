import React, { useEffect } from 'react';
import Button from './Button';
import { useTheme } from '../../context/ThemeContext';

const Modal = ({
  show,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  styles = {}
}) => {
  const { currentTheme, themes } = useTheme();

  // Access the current theme object from the themes collection
  const theme = themes[currentTheme];

  // Determine if the current theme is a dark theme by checking its text color
  const isDarkTheme = theme.text.startsWith('#F') || theme.text.startsWith('#f') ||
    theme.text.startsWith('#E') || theme.text.startsWith('#e') ||
    theme.text === '#FAFAFA' || theme.text === '#F5F5F4' || theme.text === '#F9FAFB' ||
    theme.text === '#F8FAFC';

  // Set contrasting colors based on theme type
  const textColor = isDarkTheme ? 'var(--color-text)' : 'var(--color-text)';
  const headingColor = isDarkTheme ? 'var(--color-text)' : 'var(--color-dark)';
  const cardBgColor = isDarkTheme ? 'var(--color-light)' : 'white';
  const borderColor = isDarkTheme ? 'var(--color-accent)' : 'var(--color-primary)';
  const shadowColor = isDarkTheme ? 'var(--color-shadow)' : 'rgba(0, 0, 0, 0.15)';

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';

      // Force the modal to be visible immediately
      setTimeout(() => {
        const modalOverlay = document.querySelector('.modal-overlay');
        const modalContent = document.querySelector('.modal-content');

        if (modalOverlay) {
          modalOverlay.style.opacity = '1';
        }

        if (modalContent) {
          modalContent.style.transform = 'scale(1)';
          modalContent.style.opacity = '1';
        }
      }, 10);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const handleOverlayClick = (e) => {
    // Close modal when clicking outside of modal content
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  if (!show) return null;

  // Set custom background for modal based on theme
  const modalBackground = isDarkTheme
    ? styles.modal?.backgroundColor || cardBgColor
    : styles.modal?.backgroundColor || 'white';

  // Set custom shadow based on theme
  const modalShadow = isDarkTheme
    ? `0 8px 20px ${shadowColor}`
    : `6px 6px 0 ${shadowColor}`;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: styles.overlay?.backgroundColor || (isDarkTheme ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.75)'),
        backdropFilter: 'blur(4px)',
        opacity: 0,
        transition: 'opacity 0.2s ease',
        zIndex: 99999, // Extremely high z-index to ensure it's on top
        padding: '20px'
      }}
      onClick={handleOverlayClick}
    >
      <div
        className="modal-content"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '450px',
          backgroundColor: modalBackground,
          color: styles.modal?.color || textColor,
          borderColor: styles.modal?.borderColor || borderColor,
          borderWidth: '3px',
          borderStyle: 'solid',
          borderRadius: '8px',
          boxShadow: modalShadow,
          padding: '20px',
          transform: 'scale(0.95)',
          opacity: 0,
          transition: 'transform 0.2s ease, opacity 0.2s ease',
          zIndex: 100000
        }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to overlay
      >
        <div
          className="modal-header"
          style={{
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: '2px solid',
            borderColor: styles.header?.borderColor || borderColor
          }}
        >
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              fontFamily: 'var(--font-display, sans-serif)',
              margin: 0,
              color: styles.title?.color || headingColor
            }}
          >
            {title}
          </h3>
        </div>

        <div
          className="modal-body"
          style={{ marginBottom: '20px' }}
        >
          {children}
        </div>

        <div
          className="modal-footer"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          }}
        >
          <Button
            onClick={onClose}
            variant="light"
            style={styles.cancelButton || {
              backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
              color: 'var(--color-primary)',
              borderColor: 'var(--color-primary)'
            }}
          >
            {cancelText}
          </Button>

          <Button
            onClick={onConfirm}
            variant={confirmVariant}
            style={styles.confirmButton || {
              backgroundColor: 'var(--color-error)',
              color: 'white',
              border: 'none',
              boxShadow: `2px 2px 0 ${shadowColor}`
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;