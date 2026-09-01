import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  animated?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, showLabel = true, animated = true, ...props }, ref) => {
    const percentage = (value / max) * 100;

    return (
      <div ref={ref} {...props}>
        <div className={cn('w-full h-2 bg-gray-200 rounded-full overflow-hidden', className)}>
          <div
            className={cn(
              'h-full bg-primary transition-all duration-300',
              animated && 'animate-pulse'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <p className="text-xs text-gray-600 mt-1">
            {Math.round(percentage)}%
          </p>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';
export { Progress };
