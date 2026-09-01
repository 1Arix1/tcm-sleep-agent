'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { SyndromeTag } from '@/components/medical/SyndromeTag';
import { HerbCard } from '@/components/medical/HerbCard';
import { SafetyAlert } from '@/components/medical/SafetyAlert';
import { useResultStore } from '@/stores/resultStore';

export const ResultDisplay: React.FC = () => {
  const { result } = useResultStore();

  if (!result) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="pt-12 pb-12 text-center">
          <p className="text-lg text-gray-500 mb-2">📊 等待结果...</p>
          <p className="text-sm text-gray-400">
            请填写病例信息并点击"一键生成处方"
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleCopy = () => {
    const prescription = `
方剂名称: ${result.prescriptionName}
证型: ${result.syndromes.join('、')}
治法: ${result.treatmentPrinciple}

方剂组成:
${result.herbs.map(h => `${h.name} ${h.dose}`).join('\n')}

用法用量: ${result.dosage}
加减建议: ${result.modification}
    `.trim();
    navigator.clipboard.writeText(prescription);
    alert('已复制到剪贴板');
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          💊 生成的处方建议
        </h2>
        <p className="text-sm text-gray-600">
          置信度: {Math.round(result.confidence * 100)}%
        </p>
      </div>

      {/* 证型 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">证型判断</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {result.syndromes.map((syndrome, idx) => {
              const colors: Array<'blue' | 'red' | 'yellow' | 'green' | 'purple'> = [
                'blue', 'red', 'yellow', 'green', 'purple'
              ];
              return (
                <SyndromeTag
                  key={idx}
                  syndrome={syndrome}
                  color={colors[idx % colors.length]}
                  size="lg"
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 治法 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">治法原则</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 text-base leading-relaxed">
            {result.treatmentPrinciple}
          </p>
        </CardContent>
      </Card>

      {/* 方剂 */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-xl text-primary">
            {result.prescriptionName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 草药列表 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">方剂组成</h4>
            <div className="grid gap-3">
              {result.herbs.map((herb, idx) => (
                <HerbCard
                  key={idx}
                  name={herb.name}
                  dose={herb.dose}
                  effect={herb.effect}
                />
              ))}
            </div>
          </div>

          {/* 用法用量 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">用法用量</h4>
            <p className="text-gray-700">{result.dosage}</p>
          </div>

          {/* 加减建议 */}
          {result.modification && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">加减建议</h4>
              <p className="text-gray-700 text-sm">{result.modification}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 安全提示 */}
      <SafetyAlert
        type="warning"
        message={result.safetyNote}
        details={[
          '此建议为 AI 辅助生成，需医师审核',
          '患者个体差异大，可能需要调整',
          '如有不适请立即就医',
        ]}
      />

      {/* 操作按钮 */}
      <div className="flex gap-3 justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={handleCopy}
          >
            📋 复制处方
          </Button>
          <Button variant="ghost" size="md">
            ⭐ 收藏
          </Button>
        </div>
        <Button variant="secondary" size="md">
          💬 反馈
        </Button>
      </div>

      {/* 来源说明 */}
      <Alert
        type="default"
        title="ℹ️ 参考来源"
        description="本处方基于检索到的相似病例和 Few-shot 学习生成，下方 Tab 可查看详细的 RAG 过程。"
      />
    </div>
  );
};
