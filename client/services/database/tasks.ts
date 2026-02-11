import { getDatabase } from './index';

export interface TaskRow {
  id: string;
  goal_id: string | null;
  description: string;
  priority: 'high' | 'medium' | 'low';
  start_date: string | null;
  end_date: string | null;
  completion_percentage: number;
  actual_completion_date: string | null;
  is_repeat: number;
  repeat_interval: number;
  repeat_unit: string | null;
  repeat_end_date: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string | null;
  synced_at: string | null;
  sync_status: 'synced' | 'pending' | 'conflict';
  remote_deleted: number;
}

/**
 * 创建任务
 */
export async function createTask(task: {
  id: string;
  goal_id?: string | null;
  description: string;
  priority?: 'high' | 'medium' | 'low';
  start_date?: string | null;
  end_date?: string | null;
  completion_percentage?: number;
  actual_completion_date?: string | null;
  is_repeat?: boolean;
  repeat_interval?: number;
  repeat_unit?: string | null;
  repeat_end_date?: string | null;
}): Promise<void> {
  try {
    console.log('[Tasks] Creating task:', task.id, task.description);
    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO tasks (
        id, goal_id, description, priority, start_date, end_date,
        completion_percentage, actual_completion_date, is_repeat,
        repeat_interval, repeat_unit, repeat_end_date,
        created_at, updated_at, synced_at, sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.goal_id || null,
        task.description,
        task.priority || 'medium',
        task.start_date || null,
        task.end_date || null,
        task.completion_percentage || 0,
        task.actual_completion_date || null,
        task.is_repeat ? 1 : 0,
        task.repeat_interval || 1,
        task.repeat_unit || null,
        task.repeat_end_date || null,
        now,
        now,
        null,
        'pending'
      ]
    );
    console.log('[Tasks] Task created successfully:', task.id);
  } catch (error) {
    console.error('[Tasks] Failed to create task:', error);
    throw error;
  }
}

/**
 * 更新任务
 */
export async function updateTask(
  id: string,
  updates: Partial<{
    goal_id: string | null;
    description: string;
    priority: 'high' | 'medium' | 'low';
    start_date: string | null;
    end_date: string | null;
    completion_percentage: number;
    actual_completion_date: string | null;
    is_repeat: boolean;
    repeat_interval: number;
    repeat_unit: string | null;
    repeat_end_date: string | null;
    deleted_at: string | null;
  }>
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.goal_id !== undefined) {
    fields.push('goal_id = ?');
    values.push(updates.goal_id);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.priority !== undefined) {
    fields.push('priority = ?');
    values.push(updates.priority);
  }
  if (updates.start_date !== undefined) {
    fields.push('start_date = ?');
    values.push(updates.start_date);
  }
  if (updates.end_date !== undefined) {
    fields.push('end_date = ?');
    values.push(updates.end_date);
  }
  if (updates.completion_percentage !== undefined) {
    fields.push('completion_percentage = ?');
    values.push(updates.completion_percentage);
  }
  if (updates.actual_completion_date !== undefined) {
    fields.push('actual_completion_date = ?');
    values.push(updates.actual_completion_date);
  }
  if (updates.is_repeat !== undefined) {
    fields.push('is_repeat = ?');
    values.push(updates.is_repeat ? 1 : 0);
  }
  if (updates.repeat_interval !== undefined) {
    fields.push('repeat_interval = ?');
    values.push(updates.repeat_interval);
  }
  if (updates.repeat_unit !== undefined) {
    fields.push('repeat_unit = ?');
    values.push(updates.repeat_unit);
  }
  if (updates.repeat_end_date !== undefined) {
    fields.push('repeat_end_date = ?');
    values.push(updates.repeat_end_date);
  }
  if (updates.deleted_at !== undefined) {
    fields.push('deleted_at = ?');
    values.push(updates.deleted_at);
  }

  fields.push('updated_at = ?');
  values.push(now);
  fields.push('sync_status = ?');
  values.push('pending');
  values.push(id);

  await db.runAsync(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

/**
 * 删除任务（软删除）
 */
export async function deleteTask(id: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE tasks SET deleted_at = ?, updated_at = ?, sync_status = ? WHERE id = ?`,
    [now, now, 'pending', id]
  );
}

/**
 * 获取单个任务
 */
export async function getTask(id: string): Promise<TaskRow | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync(
    'SELECT * FROM tasks WHERE id = ? AND remote_deleted = 0',
    [id]
  );
  return result || null;
}

/**
 * 获取所有任务（未删除）
 */
export async function getAllTasks(): Promise<TaskRow[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    'SELECT * FROM tasks WHERE deleted_at IS NULL AND remote_deleted = 0'
  );
  return result;
}

/**
 * 根据目标 ID 获取任务
 */
export async function getTasksByGoalId(goalId: string): Promise<TaskRow[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    'SELECT * FROM tasks WHERE goal_id = ? AND deleted_at IS NULL AND remote_deleted = 0',
    [goalId]
  );
  return result;
}

/**
 * 获取任务的更新记录
 */
export async function getTaskUpdates(taskId: string): Promise<any[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    'SELECT * FROM task_updates WHERE task_id = ? AND remote_deleted = 0 ORDER BY created_at DESC',
    [taskId]
  );
  return result;
}

/**
 * 获取所有需要同步的任务
 */
export async function getTasksToSync(): Promise<TaskRow[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    'SELECT * FROM tasks WHERE sync_status = "pending" AND remote_deleted = 0'
  );
  return result;
}

/**
 * 标记任务已同步
 */
export async function markTaskSynced(id: string, syncedAt?: string): Promise<void> {
  const db = await getDatabase();
  const now = syncedAt || new Date().toISOString();

  await db.runAsync(
    `UPDATE tasks SET synced_at = ?, sync_status = ? WHERE id = ?`,
    [now, 'synced', id]
  );
}

/**
 * 标记任务为已删除（来自云端）
 */
export async function markTaskRemoteDeleted(id: string): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE tasks SET remote_deleted = 1, sync_status = ? WHERE id = ?`,
    ['synced', id]
  );
}

/**
 * 批量插入/更新任务（从云端同步）
 */
export async function upsertTasksFromCloud(tasks: any[]): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  for (const task of tasks) {
    const existing = await getTask(task.id);

    if (existing) {
      await db.runAsync(
        `UPDATE tasks SET
          goal_id = ?,
          description = ?,
          priority = ?,
          start_date = ?,
          end_date = ?,
          completion_percentage = ?,
          actual_completion_date = ?,
          is_repeat = ?,
          repeat_interval = ?,
          repeat_unit = ?,
          repeat_end_date = ?,
          deleted_at = ?,
          updated_at = ?,
          synced_at = ?,
          sync_status = ?
        WHERE id = ?`,
        [
          task.goalId || null,
          task.description,
          task.priority || 'medium',
          task.startDate || null,
          task.endDate || null,
          task.completionPercentage || 0,
          task.actualCompletionDate || null,
          task.isRepeat ? 1 : 0,
          task.repeatInterval || 1,
          task.repeatUnit || null,
          task.repeatEndDate || null,
          task.deletedAt || null,
          task.updatedAt || now,
          now,
          'synced',
          task.id
        ]
      );
    } else {
      await db.runAsync(
        `INSERT INTO tasks (
          id, goal_id, description, priority, start_date, end_date,
          completion_percentage, actual_completion_date, is_repeat,
          repeat_interval, repeat_unit, repeat_end_date,
          deleted_at, created_at, updated_at, synced_at, sync_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.id,
          task.goalId || null,
          task.description,
          task.priority || 'medium',
          task.startDate || null,
          task.endDate || null,
          task.completionPercentage || 0,
          task.actualCompletionDate || null,
          task.isRepeat ? 1 : 0,
          task.repeatInterval || 1,
          task.repeatUnit || null,
          task.repeatEndDate || null,
          task.deletedAt || null,
          task.createdAt || now,
          task.updatedAt || now,
          now,
          'synced'
        ]
      );
    }
  }
}
