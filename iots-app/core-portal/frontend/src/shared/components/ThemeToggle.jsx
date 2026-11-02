import React from 'react';
import { SunIcon, MoonIcon } from './Icons';
import { useTheme } from '../theme/useTheme';
import '../theme/theme-toggle.css';

export const ThemeToggle = ({ inline = false }) => {
  const [isDarkMode, setIsDarkMode] = useTheme();
  return (
    <button
      type="button"
      onClick={() => setIsDarkMode(!isDarkMode)}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDarkMode}
      className={`theme-toggle ${inline ? 'theme-toggle-inline' : 'theme-toggle-floating'}`}
    >
      <div className="theme-toggle-icon">
        {isDarkMode ? <SunIcon /> : <MoonIcon />}
      </div>
      <span className="theme-toggle-label">
        {isDarkMode ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

export default ThemeToggle;
