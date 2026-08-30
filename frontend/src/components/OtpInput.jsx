import React, { useRef, useState, useEffect } from 'react';

const LENGTH = 6;

/**
 * Six-box accessible OTP input. Auto-focus/advance, backspace navigation,
 * full paste support, numeric keyboard on mobile, aria-live error state.
 */
export const OtpInput = ({ value, onChange, error, disabled = false, autoFocus = true, label = 'Verification code' }) => {
  const digits = Array.from({ length: LENGTH }, (_, i) => value?.[i] || '');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDigit = (index, char) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join(''));
  };

  const handleChange = (index) => (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setDigit(index, '');
      return;
    }
    if (raw.length > 1) {
      // Pasted or autofilled a multi-digit chunk into a single box
      const chars = raw.slice(0, LENGTH - index).split('');
      const next = digits.slice();
      chars.forEach((c, i) => {
        next[index + i] = c;
      });
      onChange(next.join(''));
      const lastIndex = Math.min(index + chars.length, LENGTH - 1);
      inputRefs.current[lastIndex]?.focus();
      return;
    }
    setDigit(index, raw);
    if (index < LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index) => (e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        setDigit(index, '');
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        setDigit(index - 1, '');
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index) => (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!text) return;
    e.preventDefault();
    const chars = text.slice(0, LENGTH - index).split('');
    const next = digits.slice();
    chars.forEach((c, i) => {
      next[index + i] = c;
    });
    onChange(next.join(''));
    const lastIndex = Math.min(index + chars.length, LENGTH - 1);
    inputRefs.current[lastIndex]?.focus();
  };

  return (
    <div>
      <div
        className={`flex items-center justify-center gap-2 sm:gap-3 ${error ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
        role="group"
        aria-label={label}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={LENGTH}
            value={digit}
            disabled={disabled}
            onChange={handleChange(index)}
            onKeyDown={handleKeyDown(index)}
            onPaste={handlePaste(index)}
            aria-label={`Digit ${index + 1} of ${LENGTH}`}
            className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-medium rounded-2xl border-2 outline-none transition-colors bg-surface-raised text-ink disabled:opacity-50 ${
              error
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-line focus:border-accent'
            }`}
          />
        ))}
      </div>
      {error && (
        <p role="alert" aria-live="assertive" className="mt-2 text-center text-xs font-normal text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default OtpInput;
