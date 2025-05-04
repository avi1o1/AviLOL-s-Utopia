import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

// Define theme context with default value
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Define color themes with better design system wrapped in useMemo to prevent recreation on each render
  const themes = useMemo(() => ({
    indigo: {
      primary: '#4F46E5', // improved indigo
      secondary: '#818CF8', // lighter indigo
      accent: '#E0E7FF', // very light indigo
      dark: '#1E1B4B', // deep indigo
      light: '#F5F7FF', // very light indigo with slight blue
      text: '#1F2937', // dark gray for text
      textLight: '#6B7280', // lighter gray for secondary text
      gray: '#9CA3AF', // medium gray
      success: '#10B981', // emerald green
      warning: '#F59E0B', // amber yellow
      error: '#EF4444', // red
      info: '#3B82F6', // blue
      border: '#DDE1FF', // light indigo for borders
      shadow: 'rgba(79, 70, 229, 0.15)', // shadow with primary color
    },
    emerald: {
      primary: '#10B981', // emerald green
      secondary: '#34D399', // light emerald
      accent: '#A7F3D0', // very light emerald
      dark: '#064E3B', // dark green
      light: '#F0FDF9', // very light mint
      text: '#1F2937', // dark gray for text
      textLight: '#6B7280', // lighter gray for secondary text
      gray: '#9CA3AF', // medium gray
      success: '#10B981', // emerald green
      warning: '#F59E0B', // amber yellow
      error: '#EF4444', // red
      info: '#3B82F6', // blue
      border: '#D1FAE5', // light mint for borders
      shadow: 'rgba(16, 185, 129, 0.15)', // shadow with primary color
    },
    amber: {
      primary: '#F59E0B', // amber
      secondary: '#FBBF24', // lighter amber
      accent: '#FEF3C7', // very light amber
      dark: '#78350F', // dark amber
      light: '#FFFBEB', // very light amber/cream
      text: '#1F2937', // dark gray for text
      textLight: '#6B7280', // lighter gray for secondary text
      gray: '#9CA3AF', // medium gray
      success: '#10B981', // emerald green
      warning: '#F59E0B', // amber yellow
      error: '#EF4444', // red
      info: '#3B82F6', // blue
      border: '#FEF3C7', // light amber for borders
      shadow: 'rgba(245, 158, 11, 0.15)', // shadow with primary color
    },
    rose: {
      primary: '#F43F5E', // rose
      secondary: '#FB7185', // lighter rose
      accent: '#FCE7F3', // very light pink
      dark: '#9D174D', // dark rose
      light: '#FFF1F2', // very light rose
      text: '#1F2937', // dark gray for text
      textLight: '#6B7280', // lighter gray for secondary text
      gray: '#9CA3AF', // medium gray
      success: '#10B981', // emerald green
      warning: '#F59E0B', // amber yellow
      error: '#EF4444', // red
      info: '#3B82F6', // blue
      border: '#FFE4E6', // light rose for borders
      shadow: 'rgba(244, 63, 94, 0.15)', // shadow with primary color
    },
    slate: {
      primary: '#475569', // slate
      secondary: '#64748B', // lighter slate
      accent: '#CBD5E1', // very light slate
      dark: '#0F172A', // dark slate
      light: '#F8FAFC', // very light slate, almost white
      text: '#1F2937', // dark gray for text
      textLight: '#6B7280', // lighter gray for secondary text
      gray: '#9CA3AF', // medium gray
      success: '#10B981', // emerald green
      warning: '#F59E0B', // amber yellow
      error: '#EF4444', // red
      info: '#3B82F6', // blue
      border: '#E2E8F0', // light slate for borders
      shadow: 'rgba(71, 85, 105, 0.15)', // shadow with primary color
    },
    midnight: {
      primary: '#2563EB', // blue
      secondary: '#3B82F6', // lighter blue
      accent: '#93C5FD', // very light blue
      dark: '#1E3A8A', // dark blue
      light: '#EFF6FF', // very light blue, almost white
      text: '#1F2937', // dark gray for text
      textLight: '#6B7280', // lighter gray for secondary text
      gray: '#9CA3AF', // medium gray
      success: '#10B981', // emerald green
      warning: '#F59E0B', // amber yellow
      error: '#EF4444', // red
      info: '#3B82F6', // blue
      border: '#DBEAFE', // light blue for borders
      shadow: 'rgba(37, 99, 235, 0.15)', // shadow with primary color
    },
    // New colorful theme: Sunset
    sunset: {
      primary: '#F97316', // orange
      secondary: '#FB923C', // lighter orange
      accent: '#FFEDD5', // very light orange
      dark: '#7C2D12', // dark orange/brown
      light: '#FFF7ED', // cream
      text: '#1F2937', // dark gray for text
      textLight: '#6B7280', // lighter gray for secondary text
      gray: '#9CA3AF', // medium gray
      success: '#22C55E', // green
      warning: '#EAB308', // yellow
      error: '#DC2626', // red
      info: '#0EA5E9', // sky blue
      border: '#FFEDD5', // light orange for borders
      shadow: 'rgba(249, 115, 22, 0.15)', // shadow with primary color
      highlight: '#EC4899', // pink highlight
      extra: '#8B5CF6', // purple accent
    },
    // New colorful theme: Ocean
    ocean: {
      primary: '#0891B2', // cyan
      secondary: '#06B6D4', // lighter cyan
      accent: '#CFFAFE', // very light cyan
      dark: '#164E63', // dark cyan
      light: '#ECFEFF', // very light cyan, almost white
      text: '#1F2937', // dark gray for text
      textLight: '#6B7280', // lighter gray for secondary text
      gray: '#9CA3AF', // medium gray
      success: '#059669', // green
      warning: '#FBBF24', // amber
      error: '#EF4444', // red
      info: '#3B82F6', // blue
      border: '#CFFAFE', // light cyan for borders
      shadow: 'rgba(8, 145, 178, 0.15)', // shadow with primary color
      highlight: '#818CF8', // indigo highlight
      extra: '#C084FC', // purple accent
    },
    // New colorful theme: Forest
    forest: {
      primary: '#14B8A6', // teal
      secondary: '#2DD4BF', // lighter teal
      accent: '#99F6E4', // very light teal
      dark: '#115E59', // dark teal
      light: '#F0FDFA', // very light teal, almost white
      text: '#1F2937', // dark gray for text
      textLight: '#6B7280', // lighter gray for secondary text
      gray: '#9CA3AF', // medium gray
      success: '#22C55E', // green
      warning: '#F59E0B', // amber
      error: '#EF4444', // red
      info: '#3B82F6', // blue
      border: '#99F6E4', // light teal for borders
      shadow: 'rgba(20, 184, 166, 0.15)', // shadow with primary color
      highlight: '#A3E635', // lime highlight
      extra: '#65A30D', // lime/green accent
    },
    // New colorful theme: Cosmic
    cosmic: {
      primary: '#8B5CF6', // violet
      secondary: '#A78BFA', // lighter violet
      accent: '#EDE9FE', // very light violet
      dark: '#4C1D95', // dark violet
      light: '#F5F3FF', // very light violet, almost white
      text: '#1F2937', // dark gray for text
      textLight: '#6B7280', // lighter gray for secondary text
      gray: '#9CA3AF', // medium gray
      success: '#10B981', // emerald
      warning: '#F59E0B', // amber
      error: '#EF4444', // red
      info: '#3B82F6', // blue
      border: '#EDE9FE', // light violet for borders
      shadow: 'rgba(139, 92, 246, 0.15)', // shadow with primary color
      highlight: '#EC4899', // pink highlight
      extra: '#0EA5E9', // sky blue accent
    },
    // New dark theme: Night Owl
    nightOwl: {
      primary: '#60A5FA', // blue
      secondary: '#93C5FD', // lighter blue
      accent: '#EFF6FF', // very light blue
      dark: '#0F172A', // very dark blue/black - main background
      light: '#1E293B', // dark blue - light background
      text: '#F1F5F9', // very light gray, almost white
      textLight: '#CBD5E1', // light gray
      gray: '#64748B', // medium gray
      success: '#34D399', // emerald
      warning: '#FBBF24', // amber
      error: '#F87171', // red
      info: '#38BDF8', // sky blue
      border: '#334155', // dark blue/gray for borders
      shadow: 'rgba(15, 23, 42, 0.6)', // shadow with dark color
      highlight: '#C4B5FD', // violet highlight
      extra: '#FB7185', // rose accent
    },
    // New dark theme: Dark Roast
    darkRoast: {
      primary: '#FBBF24', // amber
      secondary: '#F59E0B', // darker amber
      accent: '#FEF3C7', // very light amber
      dark: '#27272A', // very dark gray/black - main background
      light: '#3F3F46', // dark gray - light background
      text: '#FAFAFA', // very light gray, almost white
      textLight: '#D4D4D8', // light gray
      gray: '#71717A', // medium gray
      success: '#34D399', // emerald
      warning: '#FB923C', // orange
      error: '#F87171', // red
      info: '#60A5FA', // blue
      border: '#52525B', // dark gray for borders
      shadow: 'rgba(39, 39, 42, 0.6)', // shadow with dark color
      highlight: '#FACC15', // yellow highlight 
      extra: '#A78BFA', // violet accent
    },
    // New dark theme: Obsidian
    obsidian: {
      primary: '#F43F5E', // rose
      secondary: '#FB7185', // lighter rose
      accent: '#FFF1F2', // very light rose
      dark: '#18181B', // very dark gray/black - main background
      light: '#27272A', // dark gray - light background
      text: '#FAFAFA', // very light gray, almost white
      textLight: '#D4D4D8', // light gray
      gray: '#71717A', // medium gray
      success: '#4ADE80', // green
      warning: '#FB923C', // orange
      error: '#F87171', // red
      info: '#60A5FA', // blue
      border: '#3F3F46', // dark gray for borders
      shadow: 'rgba(24, 24, 27, 0.6)', // shadow with dark color
      highlight: '#F43F5E', // rose highlight
      extra: '#2DD4BF', // teal accent
    },
    // New dark theme: Dark Forest
    darkForest: {
      primary: '#10B981', // emerald
      secondary: '#34D399', // lighter emerald
      accent: '#D1FAE5', // very light emerald
      dark: '#1C1917', // very dark brown/black - main background
      light: '#292524', // dark brown - light background
      text: '#F5F5F4', // very light gray, almost white
      textLight: '#E7E5E4', // light gray
      gray: '#78716C', // medium gray
      success: '#4ADE80', // green
      warning: '#FBBF24', // amber
      error: '#F87171', // red
      info: '#60A5FA', // blue
      border: '#44403C', // dark brown/gray for borders
      shadow: 'rgba(28, 25, 23, 0.6)', // shadow with dark color
      highlight: '#86EFAC', // green highlight
      extra: '#FB923C', // orange accent
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