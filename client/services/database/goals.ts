import { getDatabase } from './index';

export interface GoalRow {
  id: string;
  name: string;
  description: string | null;
  order_num: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string | null;
  synced_at: string | null;
  sync_status: 'synced' | 'pending' | 'conflict';
  remote_deleted: number;
}

/**
 * 创建目标
 */
export async function createGoal(goal: {
  id: string;
  name: string;
  description?: string | null;
  order?: number;
}): Promise<void> {
  try {
    console.log('[Goals] Creating goal:', goal.id, goal.name);
    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO goals (id, name, description, order_num, created_at, updated_at, synced_at, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        goal.id,
        goal.name,
        goal.description || null,
        goal.order || 0,
        now,
        now,
        null,
        'pending'
      ]
    );
    console.log('[Goals] Goal created successfully:', goal.id);
  } catch (error) {
    console.error('[Goals] Failed to create goal:', error);
    throw error;
  }
}

/**
 * 更新目标
 */
export async function updateGoal(
  id: string,
  updates: Partial<{
    name: string;
    description: string | null;
    order: number;
    deleted_at: string | null;
  }>
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.order !== undefined) {
    fields.push('order_num = ?');
    values.push(updates.order);
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
    `UPDATE goals SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

/**
 * 删除目标（软删除）
 */
export async function deleteGoal(id: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE goals SET deleted_at = ?, updated_at = ?, sync_status = ? WHERE id = ?`,
    [now, now, 'pending', id]
  );
}

/**
 * 获取单个目标
 */
export async function getGoal(id: string): Promise<GoalRow | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync(
    'SELECT * FROM goals WHERE id = ? AND remote_deleted = 0',
    [id]
  );
  return result || null;
}

/**
 * 获取所有目标（未删除）
 */
export async function getAllGoals(): Promise<GoalRow[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    'SELECT * FROM goals WHERE deleted_at IS NULL AND remote_deleted = 0 ORDER BY order_num ASC'
  );
  return result;
}

/**
 * 获取所有需要同步的目标
 */
export async function getGoalsToSync(): Promise<GoalRow[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    'SELECT * FROM goals WHERE sync_status = "pending" AND remote_deleted = 0'
  );
  return result;
}

/**
 * 标记目标已同步
 */
export async function markGoalSynced(id: string, syncedAt?: string): Promise<void> {
  const db = await getDatabase();
  const now = syncedAt || new Date().toISOString();

  await db.runAsync(
    `UPDATE goals SET synced_at = ?, sync_status = ? WHERE id = ?`,
    [now, 'synced', id]
  );
}

/**
 * 标记目标为已删除（来自云端）
 */
export async function markGoalRemoteDeleted(id: string): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE goals SET remote_deleted = 1, sync_status = ? WHERE id = ?`,
    ['synced', id]
  );
}

/**
 * 批量插入/更新目标（从云端同步）
 */
export async function upsertGoalsFromCloud(goals: any[]): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  for (const goal of goals) {
    // 检查是否已存在
    const existing = await getGoal(goal.id);

    if (existing) {
      // 更新
      await db.runAsync(
        `UPDATE goals SET
          name = ?,
          description = ?,
          order_num = ?,
          deleted_at = ?,
          updated_at = ?,
          synced_at = ?,
          sync_status = ?
        WHERE id = ?`,
        [
          goal.name,
          goal.description || null,
          goal.order || 0,
          goal.deletedAt || null,
          goal.updatedAt || now,
          now,
          'synced',
          goal.id
        ]
      );
    } else {
      // 插入
      await db.runAsync(
        `INSERT INTO goals (id, name, description, order_num, deleted_at, created_at, updated_at, synced_at, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          goal.id,
          goal.name,
          goal.description || null,
          goal.order || 0,
          goal.deletedAt || null,
          goal.createdAt || now,
          goal.updatedAt || now,
          now,
          'synced'
        ]
      );
    }
  }
}
