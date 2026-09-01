import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  charCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, charCount, maxLength, ...props }, ref) => {
    const [count, setCount] = React.useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className
          )}
          maxLength={maxLength}
          onChange={handleChange}
          {...props}
        />
        {charCount && (
          <div className="text-xs text-gray-500 mt-1">
            {count} / {maxLength || '无限'}
          </div>
        )}
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export { Textarea };
