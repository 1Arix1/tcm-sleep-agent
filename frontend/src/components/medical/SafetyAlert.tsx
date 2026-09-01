import React from 'react';
import { Alert } from '@/components/ui/Alert';

interface SafetyAlertProps {
  type?: 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  details?: string[];
}

export const SafetyAlert: React.FC<SafetyAlertProps> = ({
  type = 'warning',
  title = '⚠️ 医疗安全提示',
  message,
  details,
}) => {
  const icons = {
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
  };

  const types = {
    warning: 'warning' as const,
    error: 'error' as const,
    info: 'default' as const,
  };

  return (
    <Alert
      type={types[type]}
      title={title}
      description={message}
      icon={<span className="text-xl">{icons[type]}</span>}
    >
      {details && details.length > 0 && (
        <ul className="mt-2 space-y-1 list-disc list-inside text-sm opacity-90">
          {details.map((detail, idx) => (
            <li key={idx}>{detail}</li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs opacity-75">
        ℹ️ 本系统仅供学习与辅助参考，不能替代执业医师诊疗。实际用药需专业医师审核。
      </p>
    </Alert>
  );
};
