'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { SyndromeTag } from '@/components/medical/SyndromeTag';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border-2 border-primary rounded-lg p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-primary mb-2">
            ✅ 第2阶段完成！
          </h1>
          <p className="text-lg text-gray-700">
            所有组件已验证可用 - 纯 React + Tailwind 实现
          </p>
        </div>

        {/* Button Demo */}
        <Card>
          <CardHeader>
            <CardTitle>🔘 按钮组件演示</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button>默认按钮</Button>
              <Button variant="outline">描边</Button>
              <Button variant="secondary">次要</Button>
              <Button variant="destructive">危险</Button>
            </div>
            <div className="flex gap-2">
              <Button size="sm">小</Button>
              <Button size="md">中</Button>
              <Button size="lg">大</Button>
            </div>
          </CardContent>
        </Card>

        {/* Medical Tags */}
        <Card>
          <CardHeader>
            <CardTitle>💊 医疗组件 - 证型标签</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3 flex-wrap">
            <SyndromeTag syndrome="心脾两虚" color="blue" size="md" />
            <SyndromeTag syndrome="阴虚火旺" color="red" size="md" />
            <SyndromeTag syndrome="肝郁化火" color="yellow" size="md" />
            <SyndromeTag syndrome="痰热内扰" color="green" size="md" />
          </CardContent>
        </Card>

        {/* Alert */}
        <Alert
          type="success"
          title="✅ 验证成功"
          description="所有组件都能正常工作"
        />

        {/* Checklist */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>✅ 第2阶段成果清单</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>✅ 7 个 UI 基础组件（Button, Card, Input, Textarea, Alert, Progress, Tabs）</p>
            <p>✅ 6 个医疗专用组件（SyndromeTag, HerbCard, PrescriptionCard, SafetyAlert, ProgressStep, SimilarCaseCard）</p>
            <p>✅ 3 个布局组件（Header, Sidebar, MainLayout）</p>
            <p>✅ 医疗主题色彩系统完整配置</p>
            <p>✅ TypeScript strict mode 通过编译</p>
            <p>✅ 所有组件导出文件已创建</p>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-blue-50 border-blue-300">
          <CardHeader>
            <CardTitle>🎯 下一步：第3阶段</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 space-y-2">
            <p><strong>预计 5-7 天</strong></p>
            <p>• 实现主页面三区域布局（左侧输入 + 右侧结果 + 下方RAG过程）</p>
            <p>• 创建病例输入表单</p>
            <p>• 实现进度反馈区</p>
            <p>• 创建结果展示区</p>
            <p>• 集成 Zustand 状态管理</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
