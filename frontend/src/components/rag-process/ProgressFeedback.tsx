'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProgressStep } from '@/components/medical/ProgressStep';
import { useResultStore, type ProgressStep as ProgressStepType } from '@/stores/resultStore';

export const ProgressFeedback: React.FC = () => {
  const { progress } = useResultStore();

  // 步骤的中文名称
  const stepLabels: Record<ProgressStepType, string> = {
    parsing: '输入解析',
    retrieving: '相似病例检索',
    selecting: 'Few-shot选择',
    generating: '处方生成',
    checking: '安全检查',
  };

  // 计算总体进度百分比
  const completedSteps = progress.filter(p => p.status === 'completed').length;
  const overallPercentage = (completedSteps / progress.length) * 100;

  // 找出第一个非完成的步骤
  const currentStepIndex = progress.findIndex(
    p => p.status === 'loading' || p.status === 'pending'
  );

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⚙️ RAG 流程进度
          {overallPercentage === 100 && (
            <span className="text-sm bg-green-100 text-green-900 px-2 py-1 rounded-full">
              完成！
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 总体进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">总体进度</span>
            <span className="text-sm text-gray-600">{Math.round(overallPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        {/* 各步骤详情 */}
        <div className="space-y-3 mt-6">
          {progress.map((step, index) => (
            <div
              key={step.step}
              className={`
                transition-all duration-300
                ${index === currentStepIndex ? 'bg-blue-50 p-3 rounded-lg' : ''}
              `}
            >
              <ProgressStep
                title={stepLabels[step.step]}
                status={step.status}
                details={step.details}
                percentage={step.status === 'completed' ? 100 : step.percentage}
              />
            </div>
          ))}
        </div>

        {/* 时间估计 */}
        {progress.some(p => p.status === 'loading') && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
            <p className="text-sm text-blue-900">
              ⏱️ 预计耗时 <strong>15-30 秒</strong>，请稍候...
            </p>
          </div>
        )}

        {/* 完成提示 */}
        {overallPercentage === 100 && (
          <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
            <p className="text-sm text-green-900">
              ✅ 处方生成完成！请查看下方的结果展示。
            </p>
          </div>
        )}

        {/* 错误提示 */}
        {progress.some(p => p.status === 'error') && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
            <p className="text-sm text-red-900">
              ❌ 处理过程中出现错误。请检查输入信息后重试。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
