import { create } from 'zustand';

/**
 * UI Store 状态
 */
interface UIState {
  // 侧边栏
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (value: boolean) => void;

  // 当前菜单
  activeMenu: string;
  setActiveMenu: (menu: string) => void;

  // Tab 状态
  activeRAGTab: 'similar' | 'fewshot' | 'prompt' | 'logs';
  setActiveRAGTab: (tab: 'similar' | 'fewshot' | 'prompt' | 'logs') => void;

  // 加载状态
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;

  // 错误消息
  error: string | null;
  setError: (error: string | null) => void;

  // 成功消息
  success: string | null;
  setSuccess: (message: string | null) => void;

  // 深色模式
  darkMode: boolean;
  toggleDarkMode: () => void;

  // 重置所有UI状态
  resetUI: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },
  setSidebarOpen: (value) => {
    set({ sidebarOpen: value });
  },

  activeMenu: 'home',
  setActiveMenu: (menu) => {
    set({ activeMenu: menu });
  },

  activeRAGTab: 'similar',
  setActiveRAGTab: (tab) => {
    set({ activeRAGTab: tab });
  },

  isLoading: false,
  setIsLoading: (value) => {
    set({ isLoading: value });
  },

  error: null,
  setError: (error) => {
    set({ error });
  },

  success: null,
  setSuccess: (message) => {
    set({ success: message });
  },

  darkMode: false,
  toggleDarkMode: () => {
    set((state) => ({ darkMode: !state.darkMode }));
  },

  resetUI: () => {
    set({
      sidebarOpen: true,
      activeMenu: 'home',
      activeRAGTab: 'similar',
      isLoading: false,
      error: null,
      success: null,
      darkMode: false,
    });
  },
}));
