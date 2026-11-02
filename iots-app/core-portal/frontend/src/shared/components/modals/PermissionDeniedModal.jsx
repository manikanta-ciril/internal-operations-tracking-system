import React from 'react';
import { AlertCircleIcon } from '../Icons';

export const PermissionDeniedModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 dark:bg-brand-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-brand-smoke dark:bg-brand-dark rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-brand-silver/50 dark:border-brand-darkslate/70 transition-all transform animate-slide-up">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-500 shrink-0">
            <AlertCircleIcon />
          </div>
          <div>
            <h3 className="text-base font-semibold text-brand-dark dark:text-brand-smoke">Permission Not Granted</h3>
            <p className="text-xs text-brand-darkslate dark:text-brand-silver">Location access required</p>
          </div>
        </div>
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl mb-5 space-y-2">
          <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">
            Location permission was not granted.
          </p>
          <p className="text-xs text-brand-dark dark:text-brand-silver leading-relaxed">
            We cannot open your workspace without verifying your location.
          </p>
          <p className="text-[11px] text-brand-darkslate dark:text-brand-silver/80 leading-relaxed font-mono">
            To fix this, click the permissions icon next to the website address bar, set Location to <strong>Allow</strong>, and click <strong>Grant permission!</strong> again.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-brand-dark hover:bg-brand-forestslate text-brand-smoke border border-brand-darkslate/40 dark:bg-brand-gold dark:hover:bg-brand-goldHover dark:text-brand-dark dark:border-brand-gold/40 text-xs font-semibold rounded-lg shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold cursor-pointer transition-colors active:scale-[0.98]"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionDeniedModal;
