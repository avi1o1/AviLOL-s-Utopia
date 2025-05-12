import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  className = '',
  disabled = false,
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

  const baseClasses = 'neo-brutal-btn font-display inline-flex items-center justify-center';

  // Use theme-sensitive shadow color
  const shadowColor = isDarkTheme ? 'var(--color-shadow)' : 'var(--color-dark)';

  // Adjust variant classes for dark themes
  const variantClasses = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-dark',
    accent: isDarkTheme ? 'bg-accent text-dark' : 'bg-accent text-dark',
    dark: isDarkTheme ? 'bg-light text-dark' : 'bg-dark text-white', // Invert dark variant in dark themes
    light: isDarkTheme ? 'bg-dark text-white' : 'bg-light text-dark', // Invert light variant in dark themes
  };

  const sizeClasses = {
    small: 'py-1 px-3 text-xs',
    medium: 'py-2 px-4 text-sm',
    large: 'py-3 px-6 text-md',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const buttonClasses = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${sizeClasses[size]} 
    ${disabledClasses}
    ${className}
  `;

  // Add theme-sensitive shadow styling
  const buttonStyle = {
    boxShadow: `2px 2px 0 ${shadowColor}`,
    transition: 'all var(--transition-fast)',
    ...(props.style || {})
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;