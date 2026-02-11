import { getDatabase } from './index';

export interface TodoRow {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  completed_at: string | null;
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
 * 创建待办
 */
export async function createTodo(todo: {
  id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: 'high' | 'medium' | 'low';
  status?: 'pending' | 'completed';
  completed_at?: string | null;
  is_repeat?: boolean;
  repeat_interval?: number;
  repeat_unit?: string | null;
  repeat_end_date?: string | null;
}): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO todos (
      id, title, description, due_date, priority, status, completed_at,
      is_repeat, repeat_interval, repeat_unit, repeat_end_date,
      created_at, updated_at, synced_at, sync_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      todo.id,
      todo.title,
      todo.description || null,
      todo.due_date || null,
      todo.priority || 'medium',
      todo.status || 'pending',
      todo.completed_at || null,
      todo.is_repeat ? 1 : 0,
      todo.repeat_interval || 1,
      todo.repeat_unit || null,
      todo.repeat_end_date || null,
      now,
      now,
      null,
      'pending'
    ]
  );
}

/**
 * 更新待办
 */
export async function updateTodo(
  id: string,
  updates: Partial<{
    title: string;
    description: string | null;
    due_date: string | null;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'completed';
    completed_at: string | null;
    is_repeat: boolean;
    repeat_interval: number;
    repeat_unit: string | null;
    repeat_end_date: string | null;
    deleted_at: string | null;
  }>
): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.due_date !== undefined) {
    fields.push('due_date = ?');
    values.push(updates.due_date);
  }
  if (updates.priority !== undefined) {
    fields.push('priority = ?');
    values.push(updates.priority);
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.completed_at !== undefined) {
    fields.push('completed_at = ?');
    values.push(updates.completed_at);
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
    `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

/**
 * 删除待办（软删除）
 */
export async function deleteTodo(id: string): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE todos SET deleted_at = ?, updated_at = ?, sync_status = ? WHERE id = ?`,
    [now, now, 'pending', id]
  );
}

/**
 * 获取单个待办
 */
export async function getTodo(id: string): Promise<TodoRow | null> {
  const db = getDatabase();
  const result = await db.getFirstAsync<TodoRow>(
    'SELECT * FROM todos WHERE id = ? AND remote_deleted = 0',
    [id]
  );
  return result || null;
}

/**
 * 获取所有待办（未删除）
 */
export async function getAllTodos(): Promise<TodoRow[]> {
  const db = getDatabase();
  const result = await db.getAllAsync<TodoRow>(
    'SELECT * FROM todos WHERE deleted_at IS NULL AND remote_deleted = 0 ORDER BY created_at DESC'
  );
  return result;
}

/**
 * 获取即将到期的待办
 */
export async function getUpcomingTodos(days: number = 7): Promise<TodoRow[]> {
  const db = getDatabase();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const result = await db.getAllAsync<TodoRow>(
    `SELECT * FROM todos
     WHERE deleted_at IS NULL
       AND remote_deleted = 0
       AND due_date IS NOT NULL
       AND due_date <= ?
     ORDER BY due_date ASC`,
    [futureDate.toISOString()]
  );
  return result;
}

/**
 * 获取所有需要同步的待办
 */
export async function getTodosToSync(): Promise<TodoRow[]> {
  const db = getDatabase();
  const result = await db.getAllAsync<TodoRow>(
    'SELECT * FROM todos WHERE sync_status = "pending" AND remote_deleted = 0'
  );
  return result;
}

/**
 * 标记待办已同步
 */
export async function markTodoSynced(id: string, syncedAt?: string): Promise<void> {
  const db = getDatabase();
  const now = syncedAt || new Date().toISOString();

  await db.runAsync(
    `UPDATE todos SET synced_at = ?, sync_status = ? WHERE id = ?`,
    [now, 'synced', id]
  );
}

/**
 * 标记待办为已删除（来自云端）
 */
export async function markTodoRemoteDeleted(id: string): Promise<void> {
  const db = getDatabase();

  await db.runAsync(
    `UPDATE todos SET remote_deleted = 1, sync_status = ? WHERE id = ?`,
    ['synced', id]
  );
}

/**
 * 批量插入/更新待办（从云端同步）
 */
export async function upsertTodosFromCloud(todos: any[]): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  for (const todo of todos) {
    const existing = await getTodo(todo.id);

    if (existing) {
      await db.runAsync(
        `UPDATE todos SET
          title = ?,
          description = ?,
          due_date = ?,
          priority = ?,
          status = ?,
          completed_at = ?,
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
          todo.title,
          todo.description || null,
          todo.dueDate || null,
          todo.priority || 'medium',
          todo.status || 'pending',
          todo.completedAt || null,
          todo.isRepeat ? 1 : 0,
          todo.repeatInterval || 1,
          todo.repeatUnit || null,
          todo.repeatEndDate || null,
          todo.deletedAt || null,
          todo.updatedAt || now,
          now,
          'synced',
          todo.id
        ]
      );
    } else {
      await db.runAsync(
        `INSERT INTO todos (
          id, title, description, due_date, priority, status, completed_at,
          is_repeat, repeat_interval, repeat_unit, repeat_end_date,
          deleted_at, created_at, updated_at, synced_at, sync_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          todo.id,
          todo.title,
          todo.description || null,
          todo.dueDate || null,
          todo.priority || 'medium',
          todo.status || 'pending',
          todo.completedAt || null,
          todo.isRepeat ? 1 : 0,
          todo.repeatInterval || 1,
          todo.repeatUnit || null,
          todo.repeatEndDate || null,
          todo.deletedAt || null,
          todo.createdAt || now,
          todo.updatedAt || now,
          now,
          'synced'
        ]
      );
    }
  }
}
