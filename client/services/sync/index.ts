import {
  getGoalsToSync,
  markGoalSynced,
  upsertGoalsFromCloud,
  markGoalRemoteDeleted,
} from '../database/goals';
import {
  getTasksToSync,
  markTaskSynced,
  upsertTasksFromCloud,
  markTaskRemoteDeleted,
} from '../database/tasks';
import {
  getTodosToSync,
  markTodoSynced,
  upsertTodosFromCloud,
  markTodoRemoteDeleted,
} from '../database/todos';
import { showToast } from '@/contexts/ToastContext';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface SyncState {
  status: SyncStatus;
  lastSyncTime: string | null;
  errorMessage: string | null;
  pendingUploads: number;
}

class SyncManager {
  private state: SyncState = {
    status: 'idle',
    lastSyncTime: null,
    errorMessage: null,
    pendingUploads: 0,
  };

  private listeners: Set<(state: SyncState) => void> = new Set();

  private backendUrl: string = '';

  constructor() {
    // 从环境变量获取后端 URL
    this.backendUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || '';
  }

  /**
   * 设置后端 URL
   */
  setBackendUrl(url: string) {
    this.backendUrl = url;
  }

  /**
   * 获取当前同步状态
   */
  getState(): SyncState {
    return { ...this.state };
  }

  /**
   * 获取同步状态（简版）
   */
  getSyncStatus(): SyncStatus {
    return this.state.status;
  }

  /**
   * 获取上次同步时间
   */
  getLastSyncTime(): string | null {
    return this.state.lastSyncTime;
  }

  /**
   * 订阅同步状态变化
   */
  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange() {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  /**
   * 更新状态
   */
  private updateState(updates: Partial<SyncState>) {
    this.state = { ...this.state, ...updates };
    this.notifyStateChange();
  }

  /**
   * 检查后端是否可用
   */
  private async isBackendAvailable(): Promise<boolean> {
    if (!this.backendUrl) {
      // 静默返回 false，不输出警告
      return false;
    }

    const healthUrl = `${this.backendUrl}/api/v1/health`;

    try {
      // 使用 Promise.race 实现超时（兼容性更好）
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });

      const response = await Promise.race([
        fetch(healthUrl, { method: 'GET' }),
        timeoutPromise,
      ]);

      return response.ok;
    } catch (error) {
      // 静默处理网络错误，避免频繁输出日志
      // 手机在本地开发时无法访问到后端是正常情况
      return false;
    }
  }

  /**
   * 上传 Goals 到云端
   */
  private async uploadGoals(): Promise<void> {
    const goals = await getGoalsToSync();

    for (const goal of goals) {
      try {
        const body: any = {
          name: goal.name,
          order: goal.order_num,
        };

        if (goal.description) {
          body.description = goal.description;
        }

        if (goal.deleted_at) {
          // 已删除的目标，删除云端数据
          await fetch(`${this.backendUrl}/api/v1/goals/${goal.id}`, {
            method: 'DELETE',
          });
        } else {
          // 新建或更新目标
          const method = goal.synced_at ? 'PUT' : 'POST';
          const url = goal.synced_at
            ? `${this.backendUrl}/api/v1/goals/${goal.id}`
            : `${this.backendUrl}/api/v1/goals`;

          await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        }

        await markGoalSynced(goal.id);
      } catch (error) {
        console.error('[Sync] Failed to upload goal:', goal.id, error);
      }
    }
  }

  /**
   * 上传 Tasks 到云端
   */
  private async uploadTasks(): Promise<void> {
    const tasks = await getTasksToSync();

    for (const task of tasks) {
      try {
        const body: any = {
          description: task.description,
          priority: task.priority,
          completionPercentage: task.completion_percentage,
          isRepeat: task.is_repeat === 1,
          repeatInterval: task.repeat_interval,
          repeatUnit: task.repeat_unit,
        };

        if (task.goal_id) {
          body.goalId = task.goal_id;
        }
        if (task.start_date) {
          body.startDate = task.start_date;
        }
        if (task.end_date) {
          body.endDate = task.end_date;
        }
        if (task.actual_completion_date) {
          body.actualCompletionDate = task.actual_completion_date;
        }
        if (task.repeat_end_date) {
          body.repeatEndDate = task.repeat_end_date;
        }

        if (task.deleted_at) {
          await fetch(`${this.backendUrl}/api/v1/tasks/${task.id}`, {
            method: 'DELETE',
          });
        } else {
          const method = task.synced_at ? 'PUT' : 'POST';
          const url = task.synced_at
            ? `${this.backendUrl}/api/v1/tasks/${task.id}`
            : `${this.backendUrl}/api/v1/tasks`;

          await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        }

        await markTaskSynced(task.id);
      } catch (error) {
        console.error('[Sync] Failed to upload task:', task.id, error);
      }
    }
  }

  /**
   * 上传 Todos 到云端
   */
  private async uploadTodos(): Promise<void> {
    const todos = await getTodosToSync();

    for (const todo of todos) {
      try {
        const body: any = {
          title: todo.title,
          priority: todo.priority,
          isRepeat: todo.is_repeat === 1,
          repeatInterval: todo.repeat_interval,
          repeatUnit: todo.repeat_unit,
        };

        if (todo.description) {
          body.description = todo.description;
        }
        if (todo.start_time) {
          body.startTime = todo.start_time;
        }
        if (todo.end_time) {
          body.endTime = todo.end_time;
        }
        if (todo.completed_at) {
          body.completedAt = todo.completed_at;
        }
        if (todo.status) {
          body.status = todo.status;
        }
        if (todo.repeat_end_date) {
          body.repeatEndDate = todo.repeat_end_date;
        }

        if (todo.deleted_at) {
          await fetch(`${this.backendUrl}/api/v1/todos/${todo.id}`, {
            method: 'DELETE',
          });
        } else {
          const method = todo.synced_at ? 'PUT' : 'POST';
          const url = todo.synced_at
            ? `${this.backendUrl}/api/v1/todos/${todo.id}`
            : `${this.backendUrl}/api/v1/todos`;

          await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        }

        await markTodoSynced(todo.id);
      } catch (error) {
        console.error('[Sync] Failed to upload todo:', todo.id, error);
      }
    }
  }

  /**
   * 从云端下载数据
   */
  private async downloadFromCloud(): Promise<void> {
    try {
      // 下载 Goals
      const goalsResponse = await fetch(`${this.backendUrl}/api/v1/goals`);
      const goalsResult = await goalsResponse.json();
      if (goalsResult.success) {
        await upsertGoalsFromCloud(goalsResult.data);
      }

      // 下载 Tasks
      const tasksResponse = await fetch(`${this.backendUrl}/api/v1/tasks`);
      const tasksResult = await tasksResponse.json();
      if (tasksResult.success) {
        await upsertTasksFromCloud(tasksResult.data);
      }

      // 下载 Todos
      const todosResponse = await fetch(`${this.backendUrl}/api/v1/todos`);
      const todosResult = await todosResponse.json();
      if (todosResult.success) {
        await upsertTodosFromCloud(todosResult.data);
      }
    } catch (error) {
      console.error('[Sync] Failed to download from cloud:', error);
      throw error;
    }
  }

  /**
   * 执行完整同步（带超时控制）
   */
  async sync(): Promise<void> {
    // 检查后端是否可用
    const isAvailable = await this.isBackendAvailable();
    if (!isAvailable) {
      // 后端不可用时静默返回，不设置错误状态
      // 手机在本地开发时无法访问到后端是正常情况
      return;
    }

    try {
      this.updateState({ status: 'syncing', errorMessage: null });

      // 设置超时（10 秒）
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Sync timeout')), 10000);
      });

      // 执行同步，使用 Promise.race 实现超时控制
      await Promise.race([
        this.performSync(),
        timeoutPromise,
      ]);

      // 3. 更新同步状态（成功）
      this.updateState({
        status: 'success',
        lastSyncTime: new Date().toISOString(),
        errorMessage: null,
      });
    } catch (error) {
      console.error('[Sync] Sync failed:', error);
      
      // 更新同步状态（失败）
      this.updateState({
        status: 'error',
        errorMessage: '同步失败，数据已保存到本地',
      });

      // 显示 Toast 提示
      showToast('同步失败，数据已保存到本地', 3000);
    }
  }

  /**
   * 执行实际的同步操作
   */
  private async performSync(): Promise<void> {
    // 1. 先上传本地更改
    await this.uploadGoals();
    await this.uploadTasks();
    await this.uploadTodos();

    // 2. 从云端下载数据
    await this.downloadFromCloud();
  }

  /**
   * 触发同步（在后台执行）
   */
  triggerSync() {
    this.sync().catch(console.error);
  }

  /**
   * 重置同步状态
   */
  reset() {
    this.updateState({
      status: 'idle',
      errorMessage: null,
    });
  }
}

// 导出单例
export const syncManager = new SyncManager();
