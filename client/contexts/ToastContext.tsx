import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ToastContextType {
  showToast: (message: string, duration?: number) => void;
  hideToast: () => void;
  toastMessage: string | null;
  toastVisible: boolean;
  toastDuration: number;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider
 * 提供全局的 Toast 显示功能
 */
export function ToastProvider({ children }: { children: ReactNode | ((context: ToastContextType) => ReactNode) }) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastDuration, setToastDuration] = useState(3000);

  const showToast = useCallback((message: string, duration?: number) => {
    setToastMessage(message);
    setToastDuration(duration || 3000);
    setToastVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setToastVisible(false);
    setToastMessage(null);
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    hideToast,
    toastMessage,
    toastVisible,
    toastDuration,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {typeof children === 'function' ? (children as (context: ToastContextType) => ReactNode)(contextValue) : children}
    </ToastContext.Provider>
  );
}

/**
 * Hook 用于访问 Toast 功能
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * 显示 Toast 的便捷函数
 * 可在非组件代码中使用（如 syncManager）
 */
let showToastFn: ((message: string, duration?: number) => void) | null = null;

export function registerToastFn(fn: (message: string, duration?: number) => void) {
  showToastFn = fn;
}

export function showToast(message: string, duration?: number) {
  if (showToastFn) {
    showToastFn(message, duration);
  } else {
    console.warn('[Toast] Toast function not registered yet');
  }
}
