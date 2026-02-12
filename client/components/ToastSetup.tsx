import React, { useEffect } from 'react';
import { registerToastFn } from '@/contexts/ToastContext';

interface ToastSetupProps {
  showToast: (message: string, duration?: number) => void;
  children: React.ReactNode;
}

/**
 * Toast 设置组件
 * 用于注册 showToast 函数，让 syncManager 可以调用
 */
export function ToastSetup({ showToast, children }: ToastSetupProps) {
  // 注册 showToast 函数
  useEffect(() => {
    registerToastFn(showToast);
  }, [showToast]);

  return <>{children}</>;
}
