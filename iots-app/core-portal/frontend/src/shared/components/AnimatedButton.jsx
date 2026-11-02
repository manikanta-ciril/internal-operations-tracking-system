import React from 'react';
import { UnlockingLock } from './UnlockingLock';

/**
 * Modern Accessible Action Button with Micro-Interactions
 */
export const AnimatedButton = ({ children, type = 'button', onClick }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className="group relative isolate inline-flex h-11 min-w-[140px] cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-lg bg-brand-dark hover:bg-brand-forestslate text-brand-smoke border border-brand-darkslate/40 dark:bg-brand-gold dark:hover:bg-brand-goldHover dark:text-brand-dark dark:border-brand-gold/40 px-4 font-semibold tracking-wide shadow-sm transition-all duration-300 ease-out will-change-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none"
    >
      {/* Label side */}
      <span className="relative z-10 flex items-center gap-2">
        <span className="text-brand-gold dark:text-brand-dark transition-colors">
          <UnlockingLock />
        </span>
        <span className="text-sm font-semibold tracking-wide">{children}</span>
      </span>

      {/* Arrow badge: arrow remains strictly in-bounds */}
      <span className="relative z-10 flex h-6 w-6 items-center justify-center overflow-hidden rounded-md bg-brand-smoke/15 text-brand-smoke dark:bg-brand-dark/15 dark:text-brand-dark transition-colors delay-75 duration-300 group-hover:bg-brand-gold group-hover:text-brand-dark dark:group-hover:bg-brand-dark dark:group-hover:text-brand-gold">
        <span
          aria-hidden="true"
          className="absolute inset-0 scale-0 rounded-full bg-brand-gold dark:bg-brand-dark will-change-transform transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.6] group-focus-visible:scale-[1.6] motion-reduce:transition-none"
        />
        <svg
          className="relative h-3.5 w-3.5 will-change-transform transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5 group-active:translate-x-1 group-active:duration-150 motion-reduce:transition-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </span>
    </button>
  );
};

export default AnimatedButton;
