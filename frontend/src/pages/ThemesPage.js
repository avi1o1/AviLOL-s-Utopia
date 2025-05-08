import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ThemesPage = () => {
  const { currentTheme, changeTheme, availableThemes, themes } = useTheme();
  
  // Check if the current theme is a dark theme
  const isDarkTheme = ['nightOwl', 'darkRoast', 'midnight', 'obsidian', 'darkForest'].includes(currentTheme);
  
  // Set contrasting colors based on theme
  const textColor = isDarkTheme ? 'var(--color-text)' : 'var(--color-text)';
  const headingColor = isDarkTheme ? 'var(--color-text)' : 'var(--color-dark)';
  const secondaryTextColor = isDarkTheme ? 'var(--color-textLight)' : 'var(--color-textLight)';
  const cardBgColor = isDarkTheme ? 'var(--color-light)' : 'white';

  const handleThemeChange = (theme) => {
    changeTheme(theme);
  };

  const themeDescriptions = {
    indigo: "Deep, rich purples and blues for a focused, creative journaling environment.",
    sage: "Refreshing greens with a nature-inspired palette for calm introspection.",
    amber: "Warm golden hues that evoke comfort and inspiration.",
    slate: "Professional grays and blues for a clean, distraction-free experience.",
    midnight: "Classic blue tones providing a serene and focused writing environment.",
    emerald: "Vibrant greens inspired by lush forests and new beginnings.",
    rose: "Soft pinks and magentas for a gentle, nurturing journaling space.",
    // New themes
    cosmic: "Deep space-inspired purples and blues with stars for night owls.",
    sunset: "Rich oranges and pinks reminiscent of beautiful sunsets.",
    ocean: "Calming blue-greens that bring the tranquility of ocean depths.",
    forest: "Deep greens and browns evoking the peaceful essence of a forest.",
    // Dark themes
    nightOwl: "A dark blue theme with bright accents for comfortable night writing.",
    darkRoast: "Rich coffee-inspired browns and creams in a dark theme.",
    obsidian: "Dark, volcanic-inspired blacks and reds for a bold experience.",
    darkForest: "Earthy dark greens and browns for a natural dark mode experience."
  };

  // Custom theme showcase styles
  const getThemeCardStyle = (theme, isCurrentTheme) => {
    const base = { 
      borderRadius: 'var(--border-radius-sm)',
      overflow: 'hidden',
      border: `2px solid ${themes[theme].dark}`,
      boxShadow: isCurrentTheme 
        ? `6px 6px 0 ${themes[theme].primary}` 
        : `4px 4px 0 ${themes[theme].secondary}`,
      transition: 'all var(--transition-fast)',
      cursor: 'pointer',
      transform: isCurrentTheme ? 'translate(-2px, -2px)' : 'none'
    };
    
    // Extra styling for dark themes
    const isDarkTheme = ['nightOwl', 'darkRoast', 'midnight', 'obsidian', 'darkForest'].includes(theme);
    if (isDarkTheme) {
      return {
        ...base,
        boxShadow: isCurrentTheme 
          ? `6px 6px 0 ${themes[theme].accent}` 
          : `4px 4px 0 ${themes[theme].accent}`,
      };
    }
    
    return base;
  };

  // Function to get text color based on background brightness
  const getTextColor = (theme, bgColor) => {
    // Simple check if the theme is a dark theme
    const isDarkTheme = ['nightOwl', 'darkRoast', 'midnight', 'obsidian', 'darkForest'].includes(theme);
    return isDarkTheme ? 'white' : themes[theme].text;
  };

  return (
    <div className="themes-page" style={{ color: textColor }}>
      <div className="page-header">
        <h1 className="text-3xl font-display" style={{ color: headingColor }}>Personalize Your Space</h1>
        <p className="text-gray" style={{ color: secondaryTextColor }}>Choose a theme that inspires you</p>
      </div>
      
      <div className="grid gap-8">
        <Card className="p-6" style={{ backgroundColor: cardBgColor }}>
          <h2 className="text-xl font-display mb-4 pb-2 border-b-2 border-dark" style={{ color: headingColor, borderColor: isDarkTheme ? 'var(--color-light)' : 'var(--color-dark)' }}>Color Themes</h2>
          <p className="mb-6" style={{ color: textColor }}>
            The right color palette can enhance your journaling experience and help set the mood for your reflections.
            Select a theme that resonates with your personal style.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {availableThemes.map((theme) => (
              <div 
                key={theme}
                className={`theme-card ${currentTheme === theme ? 'ring-2 ring-offset-2' : ''}`}
                style={getThemeCardStyle(theme, currentTheme === theme)}
                onClick={() => handleThemeChange(theme)}
              >
                <div 
                  className="theme-header p-4"
                  style={{ 
                    background: `linear-gradient(135deg, ${themes[theme].primary} 0%, ${themes[theme].secondary} 100%)`,
                    color: 'white',
                    borderBottom: `2px solid ${themes[theme].dark}`
                  }}
                >
                  <h3 className="font-display text-lg capitalize">{theme}</h3>
                </div>
                
                <div 
                  className="theme-body p-4"
                  style={{ 
                    backgroundColor: ['nightOwl', 'darkRoast', 'midnight', 'obsidian', 'darkForest'].includes(theme) 
                      ? themes[theme].dark 
                      : themes[theme].light,
                  }}
                >
                  <p 
                    className="text-sm mb-3" 
                    style={{ 
                      color: getTextColor(theme, 
                        ['nightOwl', 'darkRoast', 'midnight', 'obsidian', 'darkForest'].includes(theme) 
                          ? themes[theme].dark 
                          : themes[theme].light
                      )
                    }}
                  >
                    {themeDescriptions[theme]}
                  </p>
                  
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {Object.entries(themes[theme])
                      .filter(([colorName]) => !['shadow', 'border', 'text', 'textLight'].includes(colorName))
                      .slice(0, 5)
                      .map(([colorName, colorValue]) => (
                        <div 
                          key={colorName}
                          className="w-6 h-6 rounded-full"
                          style={{ 
                            backgroundColor: colorValue,
                            boxShadow: `1px 1px 0 ${themes[theme].dark}`,
                            border: `1px solid ${themes[theme].dark}`
                          }}
                          title={`${colorName}: ${colorValue}`}
                        />
                      ))}
                  </div>
                  
                  <Button 
                    variant={currentTheme === theme ? "primary" : "light"}
                    size="small"
                    className="w-full text-center"
                    onClick={() => handleThemeChange(theme)}
                    style={{
                      backgroundColor: currentTheme === theme ? themes[theme].primary : 'transparent',
                      color: currentTheme === theme ? 'white' : themes[theme].primary,
                      borderColor: themes[theme].primary,
                    }}
                  >
                    {currentTheme === theme ? 'Current Theme' : 'Select'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ThemesPage;