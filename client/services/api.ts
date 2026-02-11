import * as GoalDAL from './database/goals';
import * as TaskDAL from './database/tasks';
import * as TodoDAL from './database/todos';
import { syncManager } from './sync';
import type { Goal, Task, Todo } from '@/types';

/**
 * 本地 API 服务
 * 提供与云端 API 相同的接口，但优先从本地数据库读取
 */
export class LocalApiService {
  /**
   * 获取所有目标
   */
  static async getGoals(): Promise<Goal[]> {
    const goals = await GoalDAL.getAllGoals();
    return goals.map(this.transformGoal);
  }

  /**
   * 获取单个目标
   */
  static async getGoal(id: string): Promise<Goal | null> {
    const goal = await GoalDAL.getGoal(id);
    return goal ? this.transformGoal(goal) : null;
  }

  /**
   * 生成唯一 ID
   */
  private static generateId(): string {
    // 尝试使用 crypto.randomUUID
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // 降级方案：生成时间戳 + 随机数的组合
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomPart}`;
  }

  /**
   * 创建目标
   */
  static async createGoal(data: {
    name: string;
    description?: string | null;
    order?: number;
  }): Promise<Goal> {
    const id = this.generateId();
    await GoalDAL.createGoal({
      id,
      ...data,
    });

    // 触发同步
    syncManager.triggerSync();

    return {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Goal;
  }

  /**
   * 更新目标
   */
  static async updateGoal(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      order?: number;
    }
  ): Promise<Goal> {
    await GoalDAL.updateGoal(id, data);
    syncManager.triggerSync();

    // 返回更新后的目标
    const goal = await GoalDAL.getGoal(id);
    if (!goal) {
      throw new Error('Goal not found after update');
    }
    return this.transformGoal(goal);
  }

  /**
   * 删除目标
   */
  static async deleteGoal(id: string): Promise<void> {
    await GoalDAL.deleteGoal(id);
    syncManager.triggerSync();
  }

  /**
   * 重新排序目标
   */
  static async reorderGoals(orders: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of orders) {
      await GoalDAL.updateGoal(id, { order });
    }
    syncManager.triggerSync();
  }

  /**
   * 获取所有任务
   */
  static async getTasks(): Promise<Task[]> {
    const tasks = await TaskDAL.getAllTasks();
    return tasks.map(this.transformTask);
  }

  /**
   * 获取所有任务（别名）
   */
  static async getAllTasks(): Promise<Task[]> {
    return this.getTasks();
  }

  /**
   * 根据目标 ID 获取任务
   */
  static async getTasksByGoalId(goalId: string): Promise<Task[]> {
    const tasks = await TaskDAL.getTasksByGoalId(goalId);
    return tasks.map(this.transformTask);
  }

  /**
   * 根据目标 ID 获取任务（别名）
   */
  static async getTasksByGoal(goalId: string): Promise<Task[]> {
    return this.getTasksByGoalId(goalId);
  }

  /**
   * 获取单个任务
   */
  static async getTask(id: string): Promise<Task | null> {
    const task = await TaskDAL.getTask(id);
    return task ? this.transformTask(task) : null;
  }

  /**
   * 创建任务
   */
  static async createTask(data: {
    goalId?: string | null;
    description: string;
    priority?: 'high' | 'medium' | 'low';
    startDate?: string | null;
    endDate?: string | null;
    completionPercentage?: number;
    isRepeat?: boolean;
    repeatInterval?: number;
    repeatUnit?: string | null;
    repeatEndDate?: string | null;
  }): Promise<Task> {
    const id = this.generateId();
    await TaskDAL.createTask({ id, ...data });
    syncManager.triggerSync();

    // 返回新创建的任务
    const task = await TaskDAL.getTask(id);
    if (!task) {
      throw new Error('Task not found after creation');
    }
    return this.transformTask(task);
  }

  /**
   * 更新任务
   */
  static async updateTask(
    id: string,
    data: {
      goalId?: string | null;
      description?: string;
      priority?: 'high' | 'medium' | 'low';
      startDate?: string | null;
      endDate?: string | null;
      completionPercentage?: number;
      actualCompletionDate?: string | null;
      isRepeat?: boolean;
      repeatInterval?: number;
      repeatUnit?: string | null;
      repeatEndDate?: string | null;
    }
  ): Promise<Task> {
    await TaskDAL.updateTask(id, data);
    syncManager.triggerSync();

    // 返回更新后的任务
    const task = await TaskDAL.getTask(id);
    if (!task) {
      throw new Error('Task not found after update');
    }
    return this.transformTask(task);
  }

  /**
   * 删除任务
   */
  static async deleteTask(id: string): Promise<void> {
    await TaskDAL.deleteTask(id);
    syncManager.triggerSync();
  }

  /**
   * 获取任务的更新记录
   */
  static async getTaskUpdates(taskId: string): Promise<any[]> {
    const updates = await TaskDAL.getTaskUpdates(taskId);
    return updates;
  }

  /**
   * 获取所有待办
   */
  static async getTodos(): Promise<Todo[]> {
    const todos = await TodoDAL.getAllTodos();
    return todos.map(this.transformTodo);
  }

  /**
   * 获取即将到期的待办
   */
  static async getUpcomingTodos(days: number = 7): Promise<Todo[]> {
    const todos = await TodoDAL.getUpcomingTodos(days);
    return todos.map(this.transformTodo);
  }

  /**
   * 获取单个待办
   */
  static async getTodo(id: string): Promise<Todo | null> {
    const todo = await TodoDAL.getTodo(id);
    return todo ? this.transformTodo(todo) : null;
  }

  /**
   * 创建待办
   */
  static async createTodo(data: {
    title: string;
    description?: string | null;
    dueDate?: string | null;
    priority?: 'high' | 'medium' | 'low';
    status?: 'pending' | 'completed';
    isRepeat?: boolean;
    repeatInterval?: number;
    repeatUnit?: string | null;
    repeatEndDate?: string | null;
  }): Promise<Todo> {
    const id = this.generateId();
    await TodoDAL.createTodo({
      id,
      title: data.title,
      description: data.description,
      due_date: data.dueDate,
      priority: data.priority,
      status: data.status,
      is_repeat: data.isRepeat,
      repeat_interval: data.repeatInterval,
      repeat_unit: data.repeatUnit,
      repeat_end_date: data.repeatEndDate,
    });
    syncManager.triggerSync();

    // 返回新创建的待办
    const todo = await TodoDAL.getTodo(id);
    if (!todo) {
      throw new Error('Todo not found after creation');
    }
    return this.transformTodo(todo);
  }

  /**
   * 更新待办
   */
  static async updateTodo(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      dueDate?: string | null;
      priority?: 'high' | 'medium' | 'low';
      status?: 'pending' | 'completed';
      completedAt?: string | null;
      isRepeat?: boolean;
      repeatInterval?: number;
      repeatUnit?: string | null;
      repeatEndDate?: string | null;
    }
  ): Promise<void> {
    const completedAt =
      data.status === 'completed' && data.completedAt === undefined
        ? new Date().toISOString()
        : data.completedAt;

    await TodoDAL.updateTodo(id, {
      title: data.title,
      description: data.description,
      due_date: data.dueDate,
      priority: data.priority,
      status: data.status,
      completed_at: completedAt,
      is_repeat: data.isRepeat,
      repeat_interval: data.repeatInterval,
      repeat_unit: data.repeatUnit,
      repeat_end_date: data.repeatEndDate,
    });
    syncManager.triggerSync();
  }

  /**
   * 删除待办
   */
  static async deleteTodo(id: string): Promise<void> {
    await TodoDAL.deleteTodo(id);
    syncManager.triggerSync();
  }

  // ===== 转换方法 =====

  private static transformGoal(row: any): Goal {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      order: row.order_num,
      deletedAt: row.deleted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private static transformTask(row: any): Task {
    return {
      id: row.id,
      goalId: row.goal_id,
      description: row.description,
      priority: row.priority,
      startDate: row.start_date,
      endDate: row.end_date,
      completionPercentage: row.completion_percentage,
      actualCompletionDate: row.actual_completion_date,
      isRepeat: row.is_repeat === 1,
      repeatInterval: row.repeat_interval,
      repeatUnit: row.repeat_unit,
      repeatEndDate: row.repeat_end_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private static transformTodo(row: any): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      dueDate: row.due_date,
      priority: row.priority,
      status: row.status,
      completedAt: row.completed_at,
      isRepeat: row.is_repeat === 1,
      repeatInterval: row.repeat_interval,
      repeatUnit: row.repeat_unit,
      repeatEndDate: row.repeat_end_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// 导出单例
export const localApi = LocalApiService;

// 导出类以便直接使用
export const localApiService = LocalApiService;
