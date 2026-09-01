import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressStepProps {
  title: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  details?: string;
  percentage?: number;
}

const statusIcons = {
  pending: '○',
  loading: '⟳',
  completed: '✓',
  error: '✕',
};

const statusColors = {
  pending: 'text-gray-400',
  loading: 'text-blue-500 animate-spin',
  completed: 'text-green-500',
  error: 'text-red-500',
};

export const ProgressStep: React.FC<ProgressStepProps> = ({
  title,
  status,
  details,
  percentage,
}) => {
  return (
    <div className="flex gap-3 mb-3">
      <div className={cn('text-2xl flex-shrink-0 w-6 h-6 flex items-center justify-center', statusColors[status])}>
        {statusIcons[status]}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{title}</p>
        {details && <p className="text-xs text-gray-600 mt-0.5">{details}</p>}
        {percentage !== undefined && (
          <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
