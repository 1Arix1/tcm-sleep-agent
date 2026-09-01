import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  activeMenu?: string;
  onMenuChange?: (menu: string) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
        active
          ? 'bg-primary text-white'
          : 'text-gray-700 hover:bg-gray-100'
      )}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeMenu = 'home', onMenuChange }) => {
  const menuItems = [
    { id: 'home', icon: '🏠', label: '新建病例' },
    { id: 'history', icon: '📋', label: '历史记录' },
    { id: 'knowledge', icon: '📚', label: '知识库' },
    { id: 'compare', icon: '⚖️', label: '对比分析' },
    { id: 'settings', icon: '⚙️', label: '设置' },
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r-2 border-gray-200 h-screen overflow-y-auto flex flex-col sticky top-0">
      {/* Menu Items */}
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeMenu === item.id}
            onClick={() => onMenuChange?.(item.id)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t-2 border-gray-200 space-y-3">
        <div className="text-xs text-gray-600">
          <p className="font-semibold mb-1">当前用户</p>
          <p>医师演示账户</p>
        </div>
        <Button variant="outline" size="sm" className="w-full">
          退出登录
        </Button>
        <p className="text-xs text-gray-500 text-center">
          v1.0 Beta
        </p>
      </div>
    </aside>
  );
};
