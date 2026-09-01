import { create } from 'zustand';

/**
 * 相似病例类型
 */
export interface SimilarCase {
  id: string;
  summary: string;
  syndrome: string;
  prescription: string;
  similarity: number;
  keywords: string[];
}

/**
 * Few-shot 示例类型
 */
export interface FewShotExample {
  caseId: string;
  summary: string;
  syndrome: string;
  similarity: number;
  reason: string; // 被选择的原因
}

/**
 * 生成结果类型
 */
export interface GenerationResult {
  syndromes: string[];           // 候选证型
  treatmentPrinciple: string;    // 治法
  prescriptionName: string;      // 方剂名称
  herbs: Array<{
    name: string;
    dose: string;
    effect: string;
  }>;
  dosage: string;               // 用法用量
  modification: string;         // 加减建议
  confidence: number;           // 置信度
  safetyNote: string;           // 安全提示
}

/**
 * 进度状态类型
 */
export type ProgressStep = 'parsing' | 'retrieving' | 'selecting' | 'generating' | 'checking';

export interface Progress {
  step: ProgressStep;
  status: 'pending' | 'loading' | 'completed' | 'error';
  details?: string;
  percentage?: number;
}

/**
 * Result Store 状态
 */
interface ResultState {
  // 相似病例
  similarCases: SimilarCase[];
  setSimilarCases: (cases: SimilarCase[]) => void;

  // Few-shot 示例
  fewShotExamples: FewShotExample[];
  setFewShotExamples: (examples: FewShotExample[]) => void;

  // 生成结果
  result: GenerationResult | null;
  setResult: (result: GenerationResult | null) => void;

  // 进度状态
  progress: Progress[];
  updateProgress: (step: ProgressStep, status: Progress['status'], details?: string, percentage?: number) => void;
  resetProgress: () => void;

  // Prompt 预览
  promptPreview: string;
  setPromptPreview: (prompt: string) => void;

  // 执行日志
  executionLogs: Array<{ timestamp: number; message: string }>;
  addLog: (message: string) => void;
  clearLogs: () => void;

  // 清空所有结果
  clearAll: () => void;
}

const initialProgress: Progress[] = [
  { step: 'parsing', status: 'pending' },
  { step: 'retrieving', status: 'pending' },
  { step: 'selecting', status: 'pending' },
  { step: 'generating', status: 'pending' },
  { step: 'checking', status: 'pending' },
];

export const useResultStore = create<ResultState>((set) => ({
  similarCases: [],
  setSimilarCases: (cases) => {
    set({ similarCases: cases });
  },

  fewShotExamples: [],
  setFewShotExamples: (examples) => {
    set({ fewShotExamples: examples });
  },

  result: null,
  setResult: (result) => {
    set({ result });
  },

  progress: initialProgress,
  updateProgress: (step, status, details, percentage) => {
    set((state) => ({
      progress: state.progress.map((p) =>
        p.step === step
          ? { ...p, status, details, percentage }
          : p
      ),
    }));
  },
  resetProgress: () => {
    set({ progress: initialProgress });
  },

  promptPreview: '',
  setPromptPreview: (prompt) => {
    set({ promptPreview: prompt });
  },

  executionLogs: [],
  addLog: (message) => {
    set((state) => ({
      executionLogs: [
        ...state.executionLogs,
        { timestamp: Date.now(), message },
      ].slice(-50), // 保留最近50条
    }));
  },
  clearLogs: () => {
    set({ executionLogs: [] });
  },

  clearAll: () => {
    set({
      similarCases: [],
      fewShotExamples: [],
      result: null,
      progress: initialProgress,
      promptPreview: '',
      executionLogs: [],
    });
  },
}));
