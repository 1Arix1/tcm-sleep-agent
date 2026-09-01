import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { SyndromeTag } from './SyndromeTag';

interface SimilarCaseCardProps {
  caseId: string;
  summary: string;
  syndrome: string;
  prescription: string;
  similarity: number;
  keywords: string[];
  source?: string;
}

export const SimilarCaseCard: React.FC<SimilarCaseCardProps> = ({
  caseId,
  summary,
  syndrome,
  prescription,
  similarity,
  keywords,
  source = 'Demo数据',
}) => {
  const similarityColor =
    similarity > 0.8 ? 'text-green-600' : similarity > 0.6 ? 'text-yellow-600' : 'text-orange-600';

  return (
    <Card className="hover:shadow-md transition-all hover:border-primary/50">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">病例 #{caseId}</h3>
            <p className="text-xs text-gray-500">{source}</p>
          </div>
          <div className={cn('text-lg font-bold', similarityColor)}>
            {Math.round(similarity * 100)}%
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-gray-700 line-clamp-2">{summary}</p>

        {/* Syndrome & Prescription */}
        <div className="flex gap-2 flex-wrap">
          <SyndromeTag syndrome={syndrome} size="sm" />
          <span className="text-xs bg-purple-100 text-purple-900 px-2 py-1 rounded-full border border-purple-300">
            {prescription}
          </span>
        </div>

        {/* Keywords */}
        <div>
          <p className="text-xs text-gray-600 mb-1">匹配关键词:</p>
          <div className="flex flex-wrap gap-1">
            {keywords.map((kw, idx) => (
              <span
                key={idx}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-300"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
