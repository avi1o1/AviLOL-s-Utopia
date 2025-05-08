import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const MediaPage = () => {
  const { currentTheme } = useTheme();

  // Check if the current theme is a dark theme
  const isDarkTheme = ['nightOwl', 'darkRoast', 'obsidian', 'darkForest'].includes(currentTheme);

  // Set contrasting colors based on theme
  const textColor = isDarkTheme ? 'var(--color-text)' : 'var(--color-text)';
  const headingColor = isDarkTheme ? 'var(--color-text)' : 'var(--color-dark)';
  const secondaryTextColor = isDarkTheme ? 'var(--color-textLight)' : 'var(--color-textLight)';

  return (
    <div className="media-page" style={{ color: textColor }}>
      <div className="page-header" style={{ borderBottom: `3px solid var(--color-primary)` }}>
        <h1 className="text-3xl font-display mb-4" style={{ color: headingColor }}>
          My Media Collection
        </h1>
        <p className="mb-6" style={{ color: secondaryTextColor }}>
          Store and organize your favorite images, videos, and more
        </p>
      </div>

      <Card
        className="p-6 relative overflow-hidden"
        style={{
          borderLeft: '4px solid var(--color-primary)',
          background: isDarkTheme
            ? `var(--color-light)`
            : `linear-gradient(to right, var(--color-light) 0%, white 100%)`
        }}
      >
        <div
          className="absolute top-0 right-0 w-24 h-24 transform rotate-45 translate-x-8 -translate-y-8"
          style={{ background: 'var(--color-accent)', opacity: 0.6 }}
        ></div>

        <h2 className="text-xl font-display mb-4" style={{ color: headingColor }}>
          Media Library Coming Soon
        </h2>

        <p className="mb-4" style={{ color: textColor }}>
          This section will be your personal media library to store and organize different types of media including images, videos, and more.
          You'll be able to categorize media based on your preferences.
        </p>

        <div
          className="rounded-md p-4 mb-6"
          style={{
            backgroundColor: 'var(--color-accent)',
            borderLeft: '3px solid var(--color-primary)',
            color: isDarkTheme ? 'var(--color-dark)' : 'var(--color-dark)'
          }}
        >
          <p style={{ color: isDarkTheme ? 'var(--color-dark)' : 'var(--color-dark)' }}>
            <span className="font-medium">Did you know?</span> Organizing your media can help bring back memories and inspiration for your journaling.
          </p>
        </div>

        <p style={{ color: textColor }}>Features will include:</p>
        <ul className="list-disc ml-5 mb-6" style={{ color: textColor }}>
          <li>Upload and store various media types (images, videos, audio)</li>
          <li>Create custom categories (funny, me-irl, wholesome, etc.)</li>
          <li>Tag and search functionality</li>
          <li>Gallery view with filtering options</li>
          <li>Private notes for each media item</li>
        </ul>

        <Button
          variant="primary"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none'
          }}
        >
          Notify Me When Available
        </Button>
      </Card>
    </div>
  );
};

export default MediaPage;