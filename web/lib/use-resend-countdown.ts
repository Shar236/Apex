'use client';

import { useEffect, useState } from 'react';

/**
 * Drives a "Resend available in Ns" countdown that matches the backend's OTP
 * resend cooldown (30s). Returns the seconds remaining (0 = resend allowed).
 */
export function useResendCountdown(running = true, seconds = 30, restartKey: unknown = 0) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (!running) return undefined;
    setRemaining(seconds);
    const id = setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, seconds, restartKey]);
  return remaining;
}
