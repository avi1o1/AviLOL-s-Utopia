import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Textarea = ({
  label,
  id,
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
  rows = 4,
  helpText,
  error,
  ...props
}) => {
  const { currentTheme, themes } = useTheme();

  // Access the current theme object from the themes collection
  const theme = themes[currentTheme];

  // Determine if the current theme is a dark theme by checking its text color
  const isDarkTheme = theme.text.startsWith('#F') || theme.text.startsWith('#f') ||
    theme.text.startsWith('#E') || theme.text.startsWith('#e') ||
    theme.text === '#FAFAFA' || theme.text === '#F5F5F4' || theme.text === '#F9FAFB' ||
    theme.text === '#F8FAFC';

  // Set theme-appropriate colors
  const labelColor = isDarkTheme ? 'var(--color-text)' : 'var(--color-dark)';
  const borderColor = isDarkTheme ? 'var(--color-accent)' : 'var(--color-dark)';
  const shadowColor = isDarkTheme ? 'var(--color-shadow)' : 'rgba(0, 0, 0, 0.1)';
  const helpTextColor = isDarkTheme ? 'var(--color-textLight)' : 'var(--color-gray)';

  // Add theme-aware styling for the textarea
  const textareaStyle = {
    backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
    color: isDarkTheme ? 'var(--color-text)' : 'var(--color-text)',
    border: `2px solid ${error ? 'var(--color-error)' : borderColor}`,
    boxShadow: `2px 2px 0 ${error ? 'var(--color-error)' : shadowColor}`,
    transition: 'all var(--transition-fast)',
    ...(props.style || {})
  };

  return (
    <div className={`textarea-wrapper ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block font-display mb-2 font-medium"
          style={{ color: labelColor }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-primary)' }} className="ml-1">*</span>}
        </label>
      )}

      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`neo-brutal-input resize-y min-h-[100px] ${error ? 'border-red-500' : ''}`}
        style={textareaStyle}
        {...props}
      />

      {helpText && (
        <div className="text-sm mt-1" style={{ color: helpTextColor }}>{helpText}</div>
      )}

      {error && (
        <div className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>{error}</div>
      )}
    </div>
  );
};

export default Textarea;