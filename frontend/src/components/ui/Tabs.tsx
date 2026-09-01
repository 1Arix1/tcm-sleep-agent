import React from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  tabs: Array<{
    label: string;
    value: string;
    icon?: React.ReactNode;
  }>;
  defaultValue?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ tabs, defaultValue, onChange, children }, ref) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue || tabs[0]?.value);

    const handleTabChange = (value: string) => {
      setActiveTab(value);
      onChange?.(value);
    };

    return (
      <div ref={ref} className="w-full">
        <div className="flex border-b-2 border-gray-200 gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';
export { Tabs };
