import React, { useState, useEffect } from 'react';

/**
 * Minimal Typing Title with Disappearing Cursor & Stable Layout
 */
export const MinimalTypingTitle = () => {
  const line1 = 'Internal Operations';
  const line2 = 'Tracking System';
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [cursorStage, setCursorStage] = useState('line1');

  useEffect(() => {
    let index1 = 0;
    let index2 = 0;
    let timer1;
    let timer2;
    let doneTimer;

    const typeLine1 = () => {
      if (index1 < line1.length) {
        setText1(line1.slice(0, index1 + 1));
        index1++;
        timer1 = setTimeout(typeLine1, 45);
      } else {
        setCursorStage('line2');
        timer2 = setTimeout(typeLine2, 120);
      }
    };

    const typeLine2 = () => {
      if (index2 < line2.length) {
        setText2(line2.slice(0, index2 + 1));
        index2++;
        timer2 = setTimeout(typeLine2, 50);
      } else {
        doneTimer = setTimeout(() => {
          setCursorStage('done');
        }, 500);
      }
    };

    const startTimer = setTimeout(typeLine1, 200);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.15] mb-3 lg:mb-5 tracking-tight text-brand-dark dark:text-brand-smoke transition-colors">
      <span className="block min-h-[1.2em]">
        {text1}
        {cursorStage === 'line1' && (
          <span className="inline-block w-[3px] h-[0.82em] ml-1 bg-brand-gold align-middle animate-pulse rounded-full" />
        )}
      </span>
      <span className="block min-h-[1.2em] text-brand-gold">
        {text2}
        {cursorStage === 'line2' && (
          <span className="inline-block w-[3px] h-[0.82em] ml-1 bg-brand-gold align-middle animate-pulse rounded-full" />
        )}
      </span>
    </h1>
  );
};

export default MinimalTypingTitle;
