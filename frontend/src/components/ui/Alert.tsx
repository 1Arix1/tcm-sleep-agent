import React from 'react';
import { cn } from '@/lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'default' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, type = 'default', title, description, icon, children, ...props }, ref) => {
    const typeStyles = {
      default: 'bg-blue-50 border-blue-200 text-blue-900',
      success: 'bg-green-50 border-green-200 text-green-900',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      error: 'bg-red-50 border-red-200 text-red-900',
    };

    const iconColors = {
      default: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
    };

    return (
      <div
        ref={ref}
        className={cn('border-2 rounded-lg p-4 flex gap-3', typeStyles[type], className)}
        {...props}
      >
        {icon && <div className={cn('flex-shrink-0 mt-0.5', iconColors[type])}>{icon}</div>}
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          {description && <p className="text-sm opacity-90">{description}</p>}
          {children}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
export { Alert };
