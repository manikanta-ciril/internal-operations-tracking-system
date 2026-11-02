import ModalDialog from './ModalDialog';
import React from 'react';

export const HelpModal = ({ isOpen, onClose }) => {


  return (
    <ModalDialog open={isOpen} onClose={onClose} labelledBy="recovery-title">
      <div className="bg-brand-smoke dark:bg-brand-black rounded-2xl shadow-2xl w-full min-h-[240px] p-7 text-left text-brand-dark dark:text-brand-smoke transition-colors">
        <div className="mb-3">
          <h3 id="recovery-title" className="text-xl font-semibold tracking-tight">Forgot your password?</h3>
        </div>
        <div className="mb-6">
          <p className="text-sm text-brand-darkslate dark:text-brand-silver leading-relaxed">
            To reset your password, contact your department administrator or the IT service desk.
          </p>
          <p className="text-xs text-brand-darkslate dark:text-brand-silver mt-3 leading-relaxed">You can't reset your password here yet.</p>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center px-5 bg-brand-dark hover:bg-brand-forestslate text-brand-smoke dark:bg-brand-gold dark:hover:bg-brand-goldHover dark:text-brand-dark text-sm font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-smoke dark:focus-visible:ring-offset-brand-black cursor-pointer active:scale-[0.98]"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </ModalDialog>
  );
};

export default HelpModal;
