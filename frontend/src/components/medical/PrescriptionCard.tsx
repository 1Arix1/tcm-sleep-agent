import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { SyndromeTag } from './SyndromeTag';
import { HerbCard } from './HerbCard';

interface Herb {
  name: string;
  dose: string;
  effect: string;
}

interface PrescriptionCardProps {
  name: string;
  syndrome: string;
  treatmentPrinciple: string;
  herbs: Herb[];
  dosage?: string;
  usage?: string;
  modification?: string;
  confidence?: number;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  name,
  syndrome,
  treatmentPrinciple,
  herbs,
  dosage,
  usage,
  modification,
  confidence,
}) => {
  return (
    <Card className="border-2 border-primary/30">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-2xl mb-2">{name}</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <SyndromeTag syndrome={syndrome} color="blue" size="md" />
              {confidence && (
                <span className="text-xs bg-green-100 text-green-900 px-3 py-1 rounded-full">
                  匹配度: {Math.round(confidence * 100)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">治法原则</h4>
            <p className="text-gray-700">{treatmentPrinciple}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">方剂组成</h4>
            <div className="grid gap-2">
              {herbs.map((herb, idx) => (
                <HerbCard
                  key={idx}
                  name={herb.name}
                  dose={herb.dose}
                  effect={herb.effect}
                />
              ))}
            </div>
          </div>

          {dosage && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">用量用法</h4>
              <p className="text-gray-700">{dosage}</p>
            </div>
          )}

          {usage && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">使用方法</h4>
              <p className="text-gray-700 text-sm">{usage}</p>
            </div>
          )}

          {modification && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">加减建议</h4>
              <p className="text-gray-700 text-sm">{modification}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
