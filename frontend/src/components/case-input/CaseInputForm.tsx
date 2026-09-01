'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { useCaseStore } from '@/stores/caseStore';
import { useUIStore } from '@/stores/uiStore';

export const CaseInputForm: React.FC<{
  onSubmit?: () => void;
}> = ({ onSubmit }) => {
  const { currentCase, setCaseField, errors, validateCase, resetCase } =
    useCaseStore();
  const { isLoading } = useUIStore();

  const handleSubmit = () => {
    if (validateCase()) {
      onSubmit?.();
    }
  };

  const charCounts = {
    chiefComplaint: currentCase.chiefComplaint.length,
    presentIllness: currentCase.presentIllness.length,
    sleepPerformance: currentCase.sleepPerformance.length,
    accompanyingSymptoms: currentCase.accompanyingSymptoms?.length || 0,
    tongueAppearance: currentCase.tongueAppearance?.length || 0,
    pulseAppearance: currentCase.pulseAppearance?.length || 0,
  };

  const charLimits = {
    chiefComplaint: 200,
    presentIllness: 1000,
    sleepPerformance: 500,
    accompanyingSymptoms: 500,
    tongueAppearance: 100,
    pulseAppearance: 100,
  };

  return (
    <div className="space-y-6">
      {/* 表单标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📋 病例信息输入
        </h2>
        <p className="text-sm text-gray-600">
          请详细填写患者信息，系统将为您生成智能辅助处方
        </p>
      </div>

      {/* 医疗免责声明 */}
      <Alert
        type="warning"
        title="⚠️ 医疗提示"
        description="本系统为辅助决策工具，不能替代执业医师诊疗。所有建议需医师审核后使用。"
      />

      {/* 必填字段区 */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">必填字段</h3>
        <div className="space-y-4">
          {/* 主诉 */}
          <Textarea
            label="主诉"
            placeholder="例如：入睡困难、多梦易醒，持续3个月"
            value={currentCase.chiefComplaint}
            onChange={(e) => setCaseField('chiefComplaint', e.target.value)}
            maxLength={charLimits.chiefComplaint}
            error={errors.chiefComplaint}
            className="min-h-24"
          />
          <div className="text-xs text-gray-500">
            {charCounts.chiefComplaint}/{charLimits.chiefComplaint}
          </div>

          {/* 现病史 */}
          <Textarea
            label="现病史"
            placeholder="详细描述患者的病情发展过程、症状变化等"
            value={currentCase.presentIllness}
            onChange={(e) => setCaseField('presentIllness', e.target.value)}
            maxLength={charLimits.presentIllness}
            error={errors.presentIllness}
            className="min-h-32"
          />
          <div className="text-xs text-gray-500">
            {charCounts.presentIllness}/{charLimits.presentIllness}
          </div>

          {/* 睡眠表现 */}
          <Textarea
            label="睡眠表现"
            placeholder="例如：入睡时间、睡眠深度、易醒情况、梦多情况等"
            value={currentCase.sleepPerformance}
            onChange={(e) => setCaseField('sleepPerformance', e.target.value)}
            maxLength={charLimits.sleepPerformance}
            error={errors.sleepPerformance}
            className="min-h-24"
          />
          <div className="text-xs text-gray-500">
            {charCounts.sleepPerformance}/{charLimits.sleepPerformance}
          </div>
        </div>
      </div>

      {/* 可选字段区 */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">可选字段</h3>
        <div className="space-y-4">
          {/* 伴随症状 */}
          <Textarea
            label="伴随症状（可选）"
            placeholder="例如：口干、心烦、盗汗、腰酸等"
            value={currentCase.accompanyingSymptoms || ''}
            onChange={(e) =>
              setCaseField('accompanyingSymptoms', e.target.value)
            }
            maxLength={charLimits.accompanyingSymptoms}
            className="min-h-20"
          />
          <div className="text-xs text-gray-500">
            {charCounts.accompanyingSymptoms}/{charLimits.accompanyingSymptoms}
          </div>

          {/* 舌象 */}
          <Input
            label="舌象（可选）"
            placeholder="例如：舌红少苔"
            value={currentCase.tongueAppearance || ''}
            onChange={(e) =>
              setCaseField('tongueAppearance', e.target.value)
            }
            maxLength={charLimits.tongueAppearance}
          />
          <div className="text-xs text-gray-500">
            {charCounts.tongueAppearance}/{charLimits.tongueAppearance}
          </div>

          {/* 脉象 */}
          <Input
            label="脉象（可选）"
            placeholder="例如：脉细数"
            value={currentCase.pulseAppearance || ''}
            onChange={(e) =>
              setCaseField('pulseAppearance', e.target.value)
            }
            maxLength={charLimits.pulseAppearance}
          />
          <div className="text-xs text-gray-500">
            {charCounts.pulseAppearance}/{charLimits.pulseAppearance}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={resetCase}
          disabled={isLoading}
        >
          🔄 清空
        </Button>
        <Button
          onClick={handleSubmit}
          loading={isLoading}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? '生成中...' : '🚀 一键生成处方'}
        </Button>
      </div>

      {/* 错误摘要 */}
      {Object.keys(errors).length > 0 && (
        <Alert
          type="error"
          title="❌ 表单验证失败"
          description="请检查上方必填字段"
        />
      )}

      {/* 帮助提示 */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          💡 <strong>输入建议</strong>：信息越详细，生成的处方建议越准确。建议参照医生问诊记录填写。
        </p>
      </div>
    </div>
  );
};
