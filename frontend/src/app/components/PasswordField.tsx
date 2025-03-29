'use client';

import { useState, useRef, useEffect } from 'react';
import { copyToClipboard, showCopyFeedback } from '../utils/clipboard';
import { PasswordStrength, validatePassword } from '../utils/passwordValidation';

interface PasswordFieldProps {
  value: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  showStrengthMeter?: boolean;
  onStrengthChange?: (strength: PasswordStrength | null) => void;
}

export default function PasswordField({
  value,
  onChange,
  label,
  placeholder = 'Enter password',
  required = false,
  showStrengthMeter = false,
  onStrengthChange,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showStrengthMeter && onStrengthChange) {
      onStrengthChange(validatePassword(value));
    }
  }, [value, showStrengthMeter, onStrengthChange]);

  const handleCopy = async () => {
    if (!copyButtonRef.current) return;
    
    try {
      const success = await copyToClipboard(value);
      showCopyFeedback(copyButtonRef.current, success);
    } catch (error: unknown) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-24"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {showPassword ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              )}
            </svg>
          </button>
          <button
            ref={copyButtonRef}
            type="button"
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Copy password"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}