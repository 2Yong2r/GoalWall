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
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;
      if (backendUrl) {
        syncManager.setBackendUrl(backendUrl);

        // 启动后台同步（每 30 秒同步一次）
        setInterval(() => {
          syncManager.triggerSync();
        }, 30000);
      }

      console.log('[App] Application initialized');
    } catch (error) {
      console.error('[App] Failed to initialize:', error);
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);
}
