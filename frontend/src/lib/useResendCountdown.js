import { useState, useEffect } from 'react';

/** Drives a 30s "Resend available in Ns" countdown, matching the backend's OTP resend cooldown. */
export function useResendCountdown(active, seconds = 30) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (!active) return;
    setRemaining(seconds);
    const id = setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [active, seconds]);
  return remaining;
}
