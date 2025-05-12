import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

// Define theme context with default value
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Define color themes with better design system wrapped in useMemo to prevent recreation on each render
  const themes = useMemo(() => ({
    indigo: {
      primary: '#4F46E5',
      secondary: '#818CF8',
      accent: '#E0E7FF',
      dark: '#1E1B4B',
      light: '#F5F7FF',
      text: '#1F2937',
      textLight: '#6B7280',
      gray: '#9CA3AF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: '#DDE1FF',
      shadow: 'rgba(79, 70, 229, 0.15)',
    },
    emerald: {
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#A7F3D0',
      dark: '#064E3B',
      light: '#F0FDF9',
      text: '#1F2937',
      textLight: '#6B7280',
      gray: '#9CA3AF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: '#D1FAE5',
      shadow: 'rgba(16, 185, 129, 0.15)',
    },
    amber: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      accent: '#FEF3C7',
      dark: '#78350F',
      light: '#FFFBEB',
      text: '#1F2937',
      textLight: '#6B7280',
      gray: '#9CA3AF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: '#FEF3C7',
      shadow: 'rgba(245, 158, 11, 0.15)',
    },
    rose: {
      primary: '#F43F5E',
      secondary: '#FB7185',
      accent: '#FCE7F3',
      dark: '#9D174D',
      light: '#FFF1F2',
      text: '#1F2937',
      textLight: '#6B7280',
      gray: '#9CA3AF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: '#FFE4E6',
      shadow: 'rgba(244, 63, 94, 0.15)',
    },
    slate: {
      primary: '#475569',
      secondary: '#64748B',
      accent: '#CBD5E1',
      dark: '#0F172A',
      light: '#F8FAFC',
      text: '#1F2937',
      textLight: '#6B7280',
      gray: '#9CA3AF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: '#E2E8F0',
      shadow: 'rgba(71, 85, 105, 0.15)',
    },
    midnight: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      accent: '#93C5FD',
      dark: '#0F172A',
      light: '#1E293B',
      text: '#F8FAFC',
      textLight: '#CBD5E1',
      gray: '#64748B',
      success: '#4ADE80',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#38BDF8',
      border: '#334155',
      shadow: 'rgba(15, 23, 42, 0.6)',
      highlight: '#A5B4FC',
      extra: '#818CF8',
    },
    sunset: {
      primary: '#F97316',
      secondary: '#FB923C',
      accent: '#FFEDD5',
      dark: '#7C2D12',
      light: '#FFF7ED',
      text: '#1F2937',
      textLight: '#6B7280',
      gray: '#9CA3AF',
      success: '#22C55E',
      warning: '#EAB308',
      error: '#DC2626',
      info: '#0EA5E9',
      border: '#FFEDD5',
      shadow: 'rgba(249, 115, 22, 0.15)',
      highlight: '#EC4899',
      extra: '#8B5CF6',
    },
    ocean: {
      primary: '#0891B2',
      secondary: '#06B6D4',
      accent: '#CFFAFE',
      dark: '#164E63',
      light: '#ECFEFF',
      text: '#1F2937',
      textLight: '#6B7280',
      gray: '#9CA3AF',
      success: '#059669',
      warning: '#FBBF24',
      error: '#EF4444',
      info: '#3B82F6',
      border: '#CFFAFE',
      shadow: 'rgba(8, 145, 178, 0.15)',
      highlight: '#818CF8',
      extra: '#C084FC',
    },
    forest: {
      primary: '#14B8A6',
      secondary: '#2DD4BF',
      accent: '#99F6E4',
      dark: '#115E59',
      light: '#F0FDFA',
      text: '#1F2937',
      textLight: '#6B7280',
      gray: '#9CA3AF',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: '#99F6E4',
      shadow: 'rgba(20, 184, 166, 0.15)',
      highlight: '#A3E635',
      extra: '#65A30D',
    },
    cosmic: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#EDE9FE',
      dark: '#4C1D95',
      light: '#F5F3FF',
      text: '#1F2937',
      textLight: '#6B7280',
      gray: '#9CA3AF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: '#EDE9FE',
      shadow: 'rgba(139, 92, 246, 0.15)',
      highlight: '#EC4899',
      extra: '#0EA5E9',
    },
    darkRoast: {
      primary: '#FBBF24',
      secondary: '#F59E0B',
      accent: '#FEF3C7',
      dark: '#27272A',
      light: '#3F3F46',
      text: '#FAFAFA',
      textLight: '#D4D4D8',
      gray: '#71717A',
      success: '#34D399',
      warning: '#FB923C',
      error: '#F87171',
      info: '#60A5FA',
      border: '#52525B',
      shadow: 'rgba(39, 39, 42, 0.6)',
      highlight: '#FACC15',
      extra: '#A78BFA',
    },
    obsidian: {
      primary: '#F43F5E',
      secondary: '#FB7185',
      accent: '#FFF1F2',
      dark: '#18181B',
      light: '#27272A',
      text: '#FAFAFA',
      textLight: '#D4D4D8',
      gray: '#71717A',
      success: '#4ADE80',
      warning: '#FB923C',
      error: '#F87171',
      info: '#60A5FA',
      border: '#3F3F46',
      shadow: 'rgba(24, 24, 27, 0.6)',
      highlight: '#F43F5E',
      extra: '#2DD4BF',
    },
    darkForest: {
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#D1FAE5',
      dark: '#1C1917',
      light: '#292524',
      text: '#F5F5F4',
      textLight: '#E7E5E4',
      gray: '#78716C',
      success: '#4ADE80',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
      border: '#44403C',
      shadow: 'rgba(28, 25, 23, 0.6)',
      highlight: '#86EFAC',
      extra: '#FB923C',
    },
    galaxy: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#C4B5FD',
      dark: '#0F0F1A',
      light: '#1E1E2F',
      text: '#F8FAFC',
      textLight: '#CBD5E1',
      gray: '#64748B',
      success: '#4ADE80',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#38BDF8',
      border: '#2D2B55',
      shadow: 'rgba(15, 15, 26, 0.6)',
      highlight: '#F472B6',
      extra: '#38BDF8',
    },
    carbon: {
      primary: '#22D3EE',
      secondary: '#67E8F9',
      accent: '#A5F3FC',
      dark: '#141414',
      light: '#1F1F1F',
      text: '#F9FAFB',
      textLight: '#E5E7EB',
      gray: '#6B7280',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: '#303030',
      shadow: 'rgba(0, 0, 0, 0.7)',
      highlight: '#22D3EE',
      extra: '#EC4899',
    },
    mocha: {
      primary: '#C2410C',
      secondary: '#EA580C',
      accent: '#FFEDD5',
      dark: '#1A120B',
      light: '#292018',
      text: '#F5F5F4',
      textLight: '#E7E5E4',
      gray: '#78716C',
      success: '#65A30D',
      warning: '#EAB308',
      error: '#DC2626',
      info: '#2563EB',
      border: '#3D2F21',
      shadow: 'rgba(26, 18, 11, 0.7)',
      highlight: '#F59E0B',
      extra: '#A3E635',
    }
  }), []); // Empty dependency array means this will only be created once

  // Available theme names
  const availableThemes = Object.keys(themes);

  // Get theme from localStorage only
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme && availableThemes.includes(savedTheme) ? savedTheme : 'indigo';
  });

  // Function to change theme - updated to use only localStorage
  const changeTheme = (theme) => {
    if (availableThemes.includes(theme)) {
      setCurrentTheme(theme);
      localStorage.setItem('theme', theme);
    }
  };

  // Apply CSS variables to the document root when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const themeColors = themes[currentTheme];

    // Set all color variables
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Set additional design system variables
    root.style.setProperty('--font-sans', '"Inter", system-ui, sans-serif');
    root.style.setProperty('--font-display', '"Space Grotesk", system-ui, sans-serif');
    root.style.setProperty('--font-mono', '"JetBrains Mono", monospace');

    // Spacing system
    root.style.setProperty('--spacing-xs', '0.25rem');
    root.style.setProperty('--spacing-sm', '0.5rem');
    root.style.setProperty('--spacing-md', '1rem');
    root.style.setProperty('--spacing-lg', '1.5rem');
    root.style.setProperty('--spacing-xl', '2rem');
    root.style.setProperty('--spacing-xxl', '3rem');

    // Font sizes
    root.style.setProperty('--font-size-xs', '0.75rem');
    root.style.setProperty('--font-size-sm', '0.875rem');
    root.style.setProperty('--font-size-md', '1rem');
    root.style.setProperty('--font-size-lg', '1.125rem');
    root.style.setProperty('--font-size-xl', '1.25rem');
    root.style.setProperty('--font-size-2xl', '1.5rem');
    root.style.setProperty('--font-size-3xl', '1.875rem');

    // Border radius
    root.style.setProperty('--border-radius-sm', '0.375rem');
    root.style.setProperty('--border-radius-md', '0.5rem');
    root.style.setProperty('--border-radius-lg', '0.75rem');

    // Transitions
    root.style.setProperty('--transition-fast', '0.15s ease-in-out');
    root.style.setProperty('--transition-medium', '0.25s ease-in-out');

    // Shadows
    root.style.setProperty('--shadow-sm', `0 1px 2px ${themeColors.shadow}`);
    root.style.setProperty('--shadow-md', `0 4px 6px ${themeColors.shadow}`);
    root.style.setProperty('--shadow-lg', `0 10px 15px ${themeColors.shadow}`);
    root.style.setProperty('--shadow-inner', `inset 0 2px 4px ${themeColors.shadow}`);

  }, [currentTheme, themes]);

  // Create context value
  const contextValue = {
    currentTheme,
    changeTheme,
    availableThemes,
    themes
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};