import React from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = '中医失眠症处方智能辅助生成系统',
  subtitle = 'TCM Insomnia Prescription Assistance System',
}) => {
  return (
    <header className="bg-gradient-to-r from-primary to-blue-700 text-white shadow-lg h-16 flex items-center px-6 sticky top-0 z-50">
      <div className="flex-1">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-xs opacity-90">{subtitle}</p>
      </div>
      <div className="text-right text-sm opacity-90">
        v1.0 • 企业级原型
      </div>
    </header>
  );
};
