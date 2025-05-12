import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Card = ({
  children,
  className = '',
  onClick,
  elevation = 'medium',
  variant = 'default',
  hover = true,
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

  const baseClasses = 'neo-brutal-card';

  // Use theme-sensitive shadow colors
  const shadowColor = isDarkTheme ? 'var(--color-shadow)' : 'var(--color-dark)';

  const elevationClasses = {
    low: `box-shadow: 3px 3px 0 ${shadowColor}`,
    medium: `box-shadow: 5px 5px 0 ${shadowColor}`,
    high: `box-shadow: 8px 8px 0 ${shadowColor}`,
  };

  const variantClasses = {
    default: isDarkTheme ? 'bg-light' : 'bg-white',
    primary: 'bg-primary text-white',
    accent: 'bg-accent',
    dark: 'bg-dark text-white',
    light: 'bg-light',
  };

  const hoverClasses = hover ? 'transition-all duration-200 hover:translate-y-[-2px] hover:translate-x-[-2px]' : '';

  const cardStyle = {
    boxShadow: elevationClasses[elevation].split(': ')[1],
    ...(props.style || {})
  };

  const cardClasses = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${hoverClasses}
    ${className}
  `;

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      style={cardStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;