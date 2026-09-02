'use client';

import { useEffect, useState } from 'react';

/**
 * Drives a "Resend available in Ns" countdown that matches the backend's OTP
 * resend cooldown (30s). Returns the seconds remaining (0 = resend allowed).
 */
export function useResendCountdown(running = true, seconds = 30, restartKey: unknown = 0) {
  const [remaining, setRemaining] = useState(seconds);
  // Reset the countdown when the caller bumps restartKey (e.g. after "Resend").
  // Done during render (React's recommended pattern) rather than in an effect so
  // there's no extra render pass.
  const [prevKey, setPrevKey] = useState(restartKey);
  if (restartKey !== prevKey) {
    setPrevKey(restartKey);
    setRemaining(seconds);
  }

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running, restartKey]);

  return remaining;
}
