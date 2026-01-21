import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
          } bg-white hover:border-purple-300 ${className}`}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';