import React from 'react';
import { Check, X } from 'lucide-react';
import { PASSWORD_REQUIREMENTS } from '../lib/passwordRules';

export const PasswordStrengthChecklist = ({ password }) => {
  const value = password || '';
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
      {PASSWORD_REQUIREMENTS.map((req) => {
        const met = req.test(value);
        return (
          <li
            key={req.key}
            className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${
              met ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400 dark:text-neutral-500'
            }`}
          >
            {met ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0" />}
            <span>{req.label}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default PasswordStrengthChecklist;
