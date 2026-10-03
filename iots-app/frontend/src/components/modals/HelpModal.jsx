import React from 'react';
import { ShieldIcon } from '../Icons';

export const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/70 backdrop-blur-sm p-4">
      <div className="bg-brand-dark/95 dark:bg-brand-black/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-brand-coolsilver/25 dark:border-brand-darkslate/60 text-brand-smoke transition-colors">
        <div className="flex items-center space-x-2.5 mb-3 text-brand-smoke">
          <span className="text-brand-gold">
            <ShieldIcon />
          </span>
          <h3 className="text-base font-semibold tracking-wide">Access Recovery</h3>
        </div>
        <div className="p-4 bg-brand-black/60 border border-brand-darkslate/60 rounded-lg mb-5 transition-colors">
          <p className="text-xs font-mono text-brand-silver/90 leading-relaxed">
            ⚠️ Password reset is unavailable
            <br />
            <br />
            Please contact your Department Administrator or IT Service Desk to request access.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-brand-dark hover:bg-brand-forestslate text-brand-smoke border border-brand-darkslate/40 dark:bg-brand-gold dark:hover:bg-brand-goldHover dark:text-brand-dark dark:border-brand-gold/40 text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold cursor-pointer active:scale-[0.98]"
          >
            Understood!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
