import React from 'react';
import { SunIcon, MoonIcon } from './Icons';

export const ThemeToggle = ({ isDarkMode, setIsDarkMode }) => {
  return (
    <button
      type="button"
      onClick={() => setIsDarkMode(!isDarkMode)}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:right-12 z-40 flex items-center space-x-1.5 sm:space-x-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-brand-smoke/90 dark:bg-brand-black/85 backdrop-blur-md border border-brand-silver/50 dark:border-brand-darkslate/60 text-brand-dark dark:text-brand-silver shadow-sm hover:border-brand-gold/60 dark:hover:border-brand-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold transition-all duration-200"
    >
      <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-brand-gold">
        {isDarkMode ? <SunIcon /> : <MoonIcon />}
      </div>
      <span className="text-[11px] sm:text-xs font-medium text-brand-dark dark:text-brand-smoke tracking-wide">
        {isDarkMode ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

export default ThemeToggle;
