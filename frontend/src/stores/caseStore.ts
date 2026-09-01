import { create } from 'zustand';

/**
 * 病例数据类型
 */
export interface CaseInput {
  chiefComplaint: string;      // 主诉
  presentIllness: string;       // 现病史
  sleepPerformance: string;     // 睡眠表现
  accompanyingSymptoms?: string; // 伴随症状
  tongueAppearance?: string;    // 舌象
  pulseAppearance?: string;     // 脉象
}

/**
 * 病例历史项
 */
export interface CaseHistory extends CaseInput {
  id: string;
  timestamp: number;
  resultSyndromes?: string[]; // 生成的证型
}

/**
 * Case Store 状态
 */
interface CaseState {
  // 当前输入
  currentCase: CaseInput;
  setCaseField: (field: keyof CaseInput, value: string) => void;
  resetCase: () => void;

  // 历史记录
  history: CaseHistory[];
  addToHistory: (caseData: CaseInput, resultSyndromes?: string[]) => void;
  clearHistory: () => void;

  // 表单状态
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;

  // 表单验证
  errors: Record<string, string>;
  validateCase: () => boolean;
}

const initialCase: CaseInput = {
  chiefComplaint: '',
  presentIllness: '',
  sleepPerformance: '',
  accompanyingSymptoms: '',
  tongueAppearance: '',
  pulseAppearance: '',
};

export const useCaseStore = create<CaseState>((set, get) => ({
  currentCase: initialCase,

  setCaseField: (field, value) => {
    set((state) => ({
      currentCase: {
        ...state.currentCase,
        [field]: value,
      },
    }));
  },

  resetCase: () => {
    set({ currentCase: initialCase, errors: {} });
  },

  history: [],

  addToHistory: (caseData, resultSyndromes) => {
    const newHistoryItem: CaseHistory = {
      ...caseData,
      id: `case_${Date.now()}`,
      timestamp: Date.now(),
      resultSyndromes,
    };
    set((state) => ({
      history: [newHistoryItem, ...state.history].slice(0, 20), // 保留最近20条
    }));
  },

  clearHistory: () => {
    set({ history: [] });
  },

  isSubmitting: false,

  setIsSubmitting: (value) => {
    set({ isSubmitting: value });
  },

  errors: {},

  validateCase: () => {
    const state = get();
    const { currentCase } = state;
    const errors: Record<string, string> = {};

    if (!currentCase.chiefComplaint.trim()) {
      errors.chiefComplaint = '主诉为必填项';
    }
    if (!currentCase.presentIllness.trim()) {
      errors.presentIllness = '现病史为必填项';
    }
    if (!currentCase.sleepPerformance.trim()) {
      errors.sleepPerformance = '睡眠表现为必填项';
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },
}));
