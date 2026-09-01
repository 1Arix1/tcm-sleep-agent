import React from 'react';
import { Card } from '@/components/ui/Card';

interface HerbCardProps {
  name: string;
  dose: string;
  effect: string;
  category?: string;
  contraindication?: string;
}

export const HerbCard: React.FC<HerbCardProps> = ({
  name,
  dose,
  effect,
  category,
  contraindication,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{name}</h3>
          {category && <p className="text-xs text-gray-500">{category}</p>}
        </div>
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
          {dose}
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-2">
        <strong>功效：</strong> {effect}
      </p>
      {contraindication && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
          ⚠️ {contraindication}
        </p>
      )}
    </Card>
  );
};
