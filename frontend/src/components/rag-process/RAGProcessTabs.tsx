'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { SimilarCaseCard } from '@/components/medical/SimilarCaseCard';
import { useResultStore } from '@/stores/resultStore';

export const RAGProcessTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('similar');
  const { similarCases, fewShotExamples, promptPreview, executionLogs } =
    useResultStore();

  const tabConfig = [
    { label: '📚 相似病例', value: 'similar', icon: '📚' },
    { label: '🎯 Few-shot示例', value: 'fewshot', icon: '🎯' },
    { label: '🔍 Prompt预览', value: 'prompt', icon: '🔍' },
    { label: '📝 执行日志', value: 'logs', icon: '📝' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔗 RAG 过程详情</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          tabs={tabConfig}
          defaultValue="similar"
          onChange={setActiveTab}
        >
          {/* 相似病例 Tab */}
          {activeTab === 'similar' && (
            <div className="space-y-4">
              {similarCases.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无相似病例检索结果</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    检索到 <span className="font-bold">{similarCases.length}</span> 条相似病例：
                  </p>
                  {similarCases.map((case_) => (
                    <SimilarCaseCard
                      key={case_.id}
                      caseId={case_.id}
                      summary={case_.summary}
                      syndrome={case_.syndrome}
                      prescription={case_.prescription}
                      similarity={case_.similarity}
                      keywords={case_.keywords}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Few-shot示例 Tab */}
          {activeTab === 'fewshot' && (
            <div className="space-y-4">
              {fewShotExamples.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无Few-shot示例</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    动态选择了 <span className="font-bold">{fewShotExamples.length}</span> 条示例作为 Few-shot 引导：
                  </p>
                  {fewShotExamples.map((example, idx) => (
                    <div
                      key={example.caseId}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-gray-900">
                          示例 {idx + 1}: {example.summary.substring(0, 50)}...
                        </h4>
                        <span className="text-xs bg-purple-100 text-purple-900 px-2 py-1 rounded-full">
                          相似度: {Math.round(example.similarity * 100)}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-600 font-medium">证型</p>
                          <p className="text-sm text-gray-900">{example.syndrome}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">选择原因</p>
                          <p className="text-sm text-gray-900">{example.reason}</p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 bg-white p-2 rounded border-l-2 border-purple-300">
                        {example.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prompt预览 Tab */}
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              {!promptPreview ? (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无Prompt预览</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    发送给LLM的完整Prompt（截断显示）：
                  </p>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs leading-relaxed max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap break-words">
                      {promptPreview.substring(0, 2000)}
                      {promptPreview.length > 2000 && (
                        <span className="text-gray-500">
                          {'\n\n... （省略 ' + (promptPreview.length - 2000) + ' 字）'}
                        </span>
                      )}
                    </pre>
                  </div>
                  <div className="text-xs text-gray-500">
                    总字数: {promptPreview.length}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 执行日志 Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              {executionLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无执行日志</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-4">
                    执行时间轴（最近 {executionLogs.length} 条）：
                  </p>
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-xs space-y-2">
                    {executionLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 pb-2 border-b border-gray-200 last:border-b-0"
                      >
                        <span className="text-gray-500 flex-shrink-0 min-w-fit">
                          {new Date(log.timestamp).toLocaleTimeString('zh-CN')}
                        </span>
                        <span className="text-gray-700 flex-grow break-words">
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};
