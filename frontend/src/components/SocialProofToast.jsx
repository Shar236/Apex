import React, { useState, useEffect } from 'react';
import { SOCIAL_PROOF_EVENTS } from '../types/data';
import { ShoppingBag, CheckCircle2, X } from 'lucide-react';

export const SocialProofToast = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    const nextTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % SOCIAL_PROOF_EVENTS.length);
      setVisible(true);
    }, 13000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [visible, currentIndex]);

  if (!visible) return null;

  const currentEvent = SOCIAL_PROOF_EVENTS[currentIndex];

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-xs bg-white dark:bg-[#161616] border border-brand-pink/30 text-neutral-900 dark:text-white p-3.5 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink flex items-center justify-center shrink-0 border border-brand-pink/20">
          <ShoppingBag className="w-4.5 h-4.5" />
        </div>
        <div className="text-xs">
          <p className="font-bold leading-snug">
            <strong className="text-neutral-900 dark:text-white font-black">{currentEvent.name}</strong> ({currentEvent.city})
          </p>
          <p className="text-neutral-500 dark:text-[#B5B5B5] text-[11px]">
            Purchased <span className="font-extrabold text-brand-pink">{currentEvent.exam}</span> ({currentEvent.time})
          </p>
        </div>
      </div>

      <button
        onClick={() => setVisible(false)}
        className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
