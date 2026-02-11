import { useEffect } from 'react';
import { initDatabase } from '@/services/database';
import { syncManager } from '@/services/sync';

/**
 * 应用初始化 Hook
 * 在应用启动时初始化数据库和同步管理器
 */
export function useAppInitialization() {
  const initializeApp = async () => {
    try {
      // 初始化数据库
      await initDatabase();

      // 设置同步管理器的后端 URL
      let backendUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

      // 降级方案：如果环境变量为空，使用默认值
      if (!backendUrl) {
        console.warn('[App] EXPO_PUBLIC_BACKEND_BASE_URL not found, using default');
        backendUrl = 'http://127.0.0.1:9091';
      }

      console.log('[App] Backend URL:', backendUrl);
      syncManager.setBackendUrl(backendUrl);
      console.log('[App] Sync manager backend URL set to:', backendUrl);

      // 启动后台同步（每 30 秒同步一次）
      setInterval(() => {
        syncManager.triggerSync();
      }, 30000);
      console.log('[App] Background sync started (30s interval)');

      console.log('[App] Application initialized');
    } catch (error) {
      console.error('[App] Failed to initialize:', error);
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);
}
