import React from 'react';
import { cn } from '@/lib/utils';

interface SyndromeTagProps {
  syndrome: string;
  color?: 'blue' | 'red' | 'yellow' | 'green' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

const syndromeColors = {
  blue: 'bg-blue-100 text-blue-900 border-blue-300',
  red: 'bg-red-100 text-red-900 border-red-300',
  yellow: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  green: 'bg-green-100 text-green-900 border-green-300',
  purple: 'bg-purple-100 text-purple-900 border-purple-300',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const SyndromeTag: React.FC<SyndromeTagProps> = ({
  syndrome,
  color = 'blue',
  size = 'md'
}) => {
  return (
    <span className={cn('inline-block rounded-full border-2 font-semibold', syndromeColors[color], sizeStyles[size])}>
      {syndrome}
    </span>
  );
};
