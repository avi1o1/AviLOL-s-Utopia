import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ThemesPage = () => {
  const { currentTheme, changeTheme, availableThemes, themes } = useTheme();

  // Access the current theme object from the themes collection
  const theme = themes[currentTheme];

  // Determine if the current theme is a dark theme by checking its text color
  const isDarkTheme = theme.text.startsWith('#F') || theme.text.startsWith('#f') ||
    theme.text.startsWith('#E') || theme.text.startsWith('#e') ||
    theme.text === '#FAFAFA' || theme.text === '#F5F5F4' || theme.text === '#F9FAFB' ||
    theme.text === '#F8FAFC';

  // Set contrasting colors based on theme
  const textColor = isDarkTheme ? 'var(--color-text)' : 'var(--color-text)';
  const headingColor = isDarkTheme ? 'var(--color-text)' : 'var(--color-dark)';
  const textColorLight = isDarkTheme ? 'var(--color-textLight)' : 'var(--color-textLight)';
  const cardBgColor = isDarkTheme ? 'var(--color-light)' : 'white';

  // Separate the available themes into light and dark categories
  const darkThemes = ['darkRoast', 'midnight', 'obsidian', 'darkForest', 'galaxy', 'carbon', 'mocha'];
  const lightThemes = availableThemes.filter(theme => !darkThemes.includes(theme));

  const handleThemeChange = (theme) => {
    changeTheme(theme);
  };

  const themeDescriptions = {
    // Light themes
    indigo: "Deep, rich purples and blues for a focused, creative journaling environment.",
    sage: "Refreshing greens with a nature-inspired palette for calm introspection.",
    amber: "Warm golden hues that evoke comfort and inspiration.",
    slate: "Professional grays and blues for a clean, distraction-free experience.",
    midnight: "Classic blue tones providing a serene and focused writing environment.",
    emerald: "Vibrant greens inspired by lush forests and new beginnings.",
    rose: "Soft pinks and magentas for a gentle, nurturing journaling space.",
    cosmic: "Deep space-inspired purples and blues with stars for night owls.",
    sunset: "Rich oranges and pinks reminiscent of beautiful sunsets.",
    ocean: "Calming blue-greens that bring the tranquility of ocean depths.",
    forest: "Deep greens and browns evoking the peaceful essence of a forest.",

    // Dark themes
    darkRoast: "Rich coffee-inspired browns and creams in a dark theme.",
    obsidian: "Dark, volcanic-inspired blacks and reds for a bold experience.",
    darkForest: "Earthy dark greens and browns for a natural dark mode experience.",

    // New dark theme descriptions
    galaxy: "Deep space purples with bright accents, inspired by nebulae and distant stars.",
    carbon: "Sleek, modern dark theme with bright cyan accents for a futuristic look.",
    mocha: "Warm, coffee-inspired dark browns with orange accents for a cozy experience."
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
    const isDarkTheme = darkThemes.includes(theme);
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
    const isDarkTheme = darkThemes.includes(theme);
    return isDarkTheme ? 'white' : themes[theme].text;
  };

  // Component to render a theme card
  const ThemeCard = ({ theme }) => {
    const isCurrentTheme = currentTheme === theme;
    const isDarkTheme = darkThemes.includes(theme);

    return (
      <div
        className={`theme-card h-full ${isCurrentTheme ? 'ring-2 ring-offset-2' : ''}`}
        style={{
          ...getThemeCardStyle(theme, isCurrentTheme),
          display: 'flex',
          flexDirection: 'column'
        }}
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
          className="theme-body p-4 flex-grow"
          style={{
            backgroundColor: isDarkTheme
              ? themes[theme].dark
              : themes[theme].light,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <div
            className="description-container flex-grow"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              height: '100%'
            }}
          >
            <p
              className="text-sm flex-grow"
              style={{
                color: getTextColor(theme,
                  isDarkTheme
                    ? themes[theme].dark
                    : themes[theme].light
                )
              }}
            >
              {themeDescriptions[theme]}
            </p>
          </div>

          <div className="mt-auto pt-4">
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
                      boxShadow: `1px 1px 0 ${isDarkTheme ? 'rgba(255,255,255,0.5)' : themes[theme].dark}`,
                      border: `1px solid ${isDarkTheme ? 'white' : themes[theme].dark}`
                    }}
                    title={`${colorName}: ${colorValue}`}
                  />
                ))}
            </div>

            <Button
              variant={isCurrentTheme ? "primary" : "light"}
              size="small"
              className="w-full text-center"
              onClick={() => handleThemeChange(theme)}
              style={{
                backgroundColor: isCurrentTheme ? themes[theme].primary : 'transparent',
                color: isCurrentTheme ? 'white' : themes[theme].primary,
                borderColor: themes[theme].primary,
              }}
            >
              {isCurrentTheme ? 'Current Theme' : 'Select'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="themes-page" style={{ color: textColor }}>
      <div className="page-header" style={{ borderBottom: `3px solid ${themes[currentTheme].primary}`, marginBottom: '2rem', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="text-3xl font-display mb-2" style={{ color: themes[currentTheme].primary }}>
              Personalize Your Space
            </h1>
            <p className="mb-6" style={{ color: textColorLight }}>
              Choose a theme that inspires you
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Light Themes Section */}
        <Card className="p-6" style={{ backgroundColor: cardBgColor }}>
          <h2 className="text-xl font-display mb-4 pb-2 border-b-2 border-dark" style={{ color: headingColor, borderColor: isDarkTheme ? 'var(--color-light)' : 'var(--color-dark)' }}>Light Themes</h2>
          <p className="mb-6" style={{ color: textColor }}>
            Bright, vibrant color palettes perfect for daytime journaling and a positive mood.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" style={{ gridAutoRows: '1fr' }}>
            {lightThemes.map((theme) => (
              <ThemeCard key={theme} theme={theme} />
            ))}
          </div>
        </Card>

        {/* Dark Themes Section */}
        <Card className="p-6" style={{ backgroundColor: cardBgColor }}>
          <h2 className="text-xl font-display mb-4 pb-2 border-b-2 border-dark" style={{ color: headingColor, borderColor: isDarkTheme ? 'var(--color-light)' : 'var(--color-dark)' }}>Dark Themes</h2>
          <p className="mb-6" style={{ color: textColor }}>
            Rich, comfortable dark palettes ideal for night writing sessions and reduced eye strain.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" style={{ gridAutoRows: '1fr' }}>
            {darkThemes.map((theme) => (
              <ThemeCard key={theme} theme={theme} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ThemesPage;