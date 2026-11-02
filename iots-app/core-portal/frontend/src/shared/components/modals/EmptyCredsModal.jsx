import ModalDialog from './ModalDialog';
import React from 'react';
import { AlertCircleIcon } from '../Icons';

export const EmptyCredsModal = ({ isOpen, onClose, empId }) => {


  return (
    <ModalDialog open={isOpen} onClose={onClose} labelledBy="empty-credentials-title" className="animate-slide-up">
      <div className="bg-brand-smoke dark:bg-brand-dark rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-brand-silver/50 dark:border-brand-darkslate/70">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0">
            <AlertCircleIcon />
          </div>
          <div>
            <h3 id="empty-credentials-title" className="text-base font-semibold text-brand-dark dark:text-brand-smoke">
              Credentials Required
            </h3>
            <p className="text-xs text-brand-darkslate dark:text-brand-silver">
              Authentication cannot proceed
            </p>
          </div>
        </div>
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl mb-5">
          <p className="text-xs font-sans text-brand-dark dark:text-brand-silver leading-relaxed">
            Please provide your <strong>Username or E-mail</strong> and <strong>Password</strong> to enter the system.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (!empId) {
                document.getElementById('input-username')?.focus();
              } else {
                document.getElementById('input-password')?.focus();
              }
            }}
            className="px-5 py-2.5 bg-brand-dark hover:bg-brand-forestslate text-brand-smoke border border-brand-darkslate/40 dark:bg-brand-gold dark:hover:bg-brand-goldHover dark:text-brand-dark dark:border-brand-gold/40 text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold shadow-sm cursor-pointer active:scale-[0.98]"
          >
            Understood
          </button>
        </div>
      </div>
    </ModalDialog>
  );
};

export default EmptyCredsModal;
