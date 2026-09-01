import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-3 text-gray-400">{icon}</div>}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors',
              icon && 'pl-10',
              error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
