import { useState, useEffect } from 'react';

/**
 * Drives a "Resend available in Ns" countdown that matches the backend's OTP
 * resend cooldown (30s). Returns the seconds remaining (0 = resend allowed).
 *
 * @param {boolean} running    keep the timer alive
 * @param {number}  seconds    cooldown length
 * @param {any}     restartKey change this value to restart the countdown from `seconds`
 */
export function useResendCountdown(running = true, seconds = 30, restartKey = 0) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (!running) return undefined;
    setRemaining(seconds);
    const id = setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running, seconds, restartKey]);
  return remaining;
}
