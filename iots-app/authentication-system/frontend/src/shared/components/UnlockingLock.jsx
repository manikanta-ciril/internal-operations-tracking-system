import React from 'react';

/**
 * A padlock whose shackle pops open on hover and snaps shut on press.
 */
export const UnlockingLock = () => (
  <svg
    className="h-[18px] w-[18px] overflow-visible"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path
      d="M8 11V7a4 4 0 0 1 8 0v4"
      className="will-change-transform [transform-origin:16px_11px] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-[1.5px] group-hover:rotate-[24deg] group-focus-visible:-translate-y-[1.5px] group-focus-visible:rotate-[24deg] group-active:translate-y-0 group-active:rotate-0 group-active:duration-150 motion-reduce:transition-none"
    />
    <rect x="5" y="11" width="14" height="10" rx="2.5" />
  </svg>
);

export default UnlockingLock;
