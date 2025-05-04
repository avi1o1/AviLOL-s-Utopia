import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const MomentsPage = () => {
  const { currentTheme } = useTheme();
  
  // Check if the current theme is a dark theme
  const isDarkTheme = ['nightOwl', 'darkRoast', 'obsidian', 'darkForest'].includes(currentTheme);
  
  // Set contrasting colors based on theme
  const textColor = isDarkTheme ? 'var(--color-text)' : 'var(--color-text)';
  const headingColor = isDarkTheme ? 'var(--color-text)' : 'var(--color-dark)';
  const secondaryTextColor = isDarkTheme ? 'var(--color-textLight)' : 'var(--color-textLight)';
  
  return (
    <div className="moments-page" style={{ color: textColor }}>
      <div className="page-header" style={{ borderBottom: `3px solid var(--color-primary)` }}>
        <h1 className="text-3xl font-display mb-4" style={{ color: headingColor }}>
          Memorable Moments
        </h1>
        <p className="mb-6" style={{ color: secondaryTextColor }}>
          Capture and preserve the special moments in your life
        </p>
      </div>
      
      <Card 
        className="p-6 relative overflow-hidden" 
        style={{ 
          borderRight: '4px solid var(--color-secondary)',
          background: isDarkTheme 
            ? `var(--color-light)` 
            : `linear-gradient(to left, var(--color-light) 0%, white 100%)`
        }}
      >
        <div 
          className="absolute top-0 left-0 w-24 h-24 transform rotate-45 -translate-x-8 -translate-y-8"
          style={{ background: 'var(--color-accent)', opacity: 0.6 }}
        ></div>
        
        <h2 className="text-xl font-display mb-4" style={{ color: headingColor }}>
          Moments Feature Coming Soon
        </h2>
        
        <p className="mb-4" style={{ color: textColor }}>
          This section will help you capture and preserve those special moments in your life that you want to remember forever.
          Unlike regular diary entries, moments are meant to highlight specific events, achievements, or experiences.
        </p>
        
        <div 
          className="rounded-md p-4 mb-6" 
          style={{ 
            backgroundColor: 'var(--color-accent)', 
            borderRight: '3px solid var(--color-secondary)',
            color: isDarkTheme ? 'var(--color-dark)' : 'var(--color-dark)'
          }}
        >
          <p style={{ color: isDarkTheme ? 'var(--color-dark)' : 'var(--color-dark)' }}>
            <span className="font-medium">Tip:</span> Creating a dedicated space for special moments makes them easier to revisit and cherish later.
          </p>
        </div>
        
        <p style={{ color: textColor }}>Features will include:</p>
        <ul className="list-disc ml-5 mb-6" style={{ color: textColor }}>
          <li>Timeline view of all your important moments</li>
          <li>Ability to add photos to moments</li>
          <li>Custom tagging for organization</li>
          <li>Mood tracking for each moment</li>
          <li>Option to share specific moments (if desired)</li>
        </ul>
        
        <Button 
          variant="secondary"
          style={{
            backgroundColor: 'var(--color-secondary)',
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

export default MomentsPage;