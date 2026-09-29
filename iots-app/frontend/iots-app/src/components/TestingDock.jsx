import React, { useState } from 'react';
import { TerminalIcon, CrosshairIcon } from './Icons';

export const TestingDock = ({
  activeScenario,
  setActiveScenario,
  setPhase,
  setProcessStep,
  setIsMismatchPending,
  geoDetails,
  locationPermissionState,
  setLocationPermissionState,
  setStoredLocationPermission,
}) => {
  const [testToolbarOpen, setTestToolbarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  return (
    <div className="fixed bottom-3 right-3 z-50">
      {testToolbarOpen ? (
        <div className="bg-brand-smoke/95 dark:bg-brand-black/95 backdrop-blur-xl border border-brand-silver/60 dark:border-brand-darkslate/70 p-3 rounded-2xl shadow-2xl text-xs font-mono flex flex-col gap-2 max-w-xs transition-all">
          <div className="flex items-center justify-between border-b border-brand-silver/30 dark:border-brand-darkslate/60 pb-1.5">
            <span className="font-semibold text-brand-gold uppercase text-[10px] tracking-wider flex items-center">
              <TerminalIcon />
              <span className="ml-1">Testing Scenarios</span>
            </span>
            <button
              onClick={() => setTestToolbarOpen(false)}
              className="text-brand-darkslate dark:text-brand-silver hover:text-brand-gold text-[10px] p-0.5"
              title="Minimize toolbar"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveScenario('success');
                setPhase('idle');
                setProcessStep(0);
                setIsMismatchPending(false);
              }}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold text-center transition-all ${
                activeScenario === 'success'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-brand-silver/20 dark:bg-brand-dark text-brand-dark dark:text-brand-silver'
              }`}
            >
              1. Success
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveScenario('failed');
                setPhase('idle');
                setProcessStep(0);
                setIsMismatchPending(false);
              }}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold text-center transition-all ${
                activeScenario === 'failed'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-brand-silver/20 dark:bg-brand-dark text-brand-dark dark:text-brand-silver'
              }`}
            >
              2. Failed
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveScenario('mismatch');
                setPhase('idle');
                setProcessStep(0);
                setIsMismatchPending(false);
              }}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold text-center transition-all ${
                activeScenario === 'mismatch'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-brand-silver/20 dark:bg-brand-dark text-brand-dark dark:text-brand-silver'
              }`}
            >
              3. Mismatch
            </button>
          </div>

          <div className="p-2 rounded-lg bg-brand-silver/15 dark:bg-brand-black/60 border border-brand-silver/30 dark:border-brand-darkslate/60 text-[10px] space-y-0.5">
            <div className="flex justify-between items-center text-brand-dark dark:text-brand-smoke font-semibold">
              <span className="flex items-center space-x-1">
                <CrosshairIcon />
                <span>GPS Fix</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                ±{geoDetails?.accuracy || '3.8'}m
              </span>
            </div>
            <div className="text-[9px] font-mono text-brand-darkslate dark:text-brand-silver/80 truncate">
              {geoDetails?.lat}° N, {geoDetails?.lon}° E
            </div>
          </div>

          <div className="pt-1 border-t border-brand-silver/30 dark:border-brand-darkslate/60 flex items-center justify-between">
            <span className="text-[10px] text-brand-darkslate dark:text-brand-silver">Loc. Permission:</span>
            <button
              type="button"
              onClick={() => {
                const nextState = locationPermissionState === 'granted' ? 'denied' : 'granted';
                setLocationPermissionState(nextState);
                if (setStoredLocationPermission) {
                  setStoredLocationPermission(nextState);
                }
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                locationPermissionState === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
              }`}
            >
              {locationPermissionState === 'granted' ? 'Granted (Toggle)' : 'Blocked (Toggle)'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setTestToolbarOpen(true)}
          className="px-3 py-1.5 rounded-full bg-brand-smoke/90 dark:bg-brand-black/90 backdrop-blur-md border border-brand-silver/50 dark:border-brand-darkslate/60 shadow-lg text-[11px] font-mono text-brand-gold hover:border-brand-gold transition-all"
        >
          ⚙️ Scenarios ({activeScenario})
        </button>
      )}
    </div>
  );
};

export default TestingDock;
