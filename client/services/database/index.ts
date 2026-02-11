import * as SQLite from 'expo-sqlite';

const DB_NAME = 'goalwall.db';

let dbInstance: any = null;

/**
 * 获取数据库实例（单例模式）
 * 使用异步方式初始化，避免 Web 环境下 SharedArrayBuffer 问题
 */
export async function getDatabase(): Promise<any> {
  if (!dbInstance) {
    // 使用异步 API 而不是同步 API，避免 Web 环境问题
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbInstance;
}

/**
 * 初始化数据库
 */
export async function initDatabase(): Promise<void> {
  const db = await getDatabase();

  // 创建 goals 表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      order_num INTEGER DEFAULT 0,
      deleted_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      synced_at TEXT,
      sync_status TEXT DEFAULT 'pending',
      remote_deleted BOOLEAN DEFAULT 0
    );
  `);

  // 创建 tasks 表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      goal_id TEXT,
      description TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      start_date TEXT,
      end_date TEXT,
      completion_percentage INTEGER DEFAULT 0,
      actual_completion_date TEXT,
      is_repeat BOOLEAN DEFAULT 0,
      repeat_interval INTEGER DEFAULT 1,
      repeat_unit TEXT,
      repeat_end_date TEXT,
      deleted_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      synced_at TEXT,
      sync_status TEXT DEFAULT 'pending',
      remote_deleted BOOLEAN DEFAULT 0
    );
  `);

  // 创建 task_updates 表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS task_updates (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      update_content TEXT NOT NULL,
      completion_percentage INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      synced_at TEXT,
      sync_status TEXT DEFAULT 'pending',
      remote_deleted BOOLEAN DEFAULT 0
    );
  `);

  // 创建 todos 表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'pending',
      completed_at TEXT,
      is_repeat BOOLEAN DEFAULT 0,
      repeat_interval INTEGER DEFAULT 1,
      repeat_unit TEXT,
      repeat_end_date TEXT,
      deleted_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      synced_at TEXT,
      sync_status TEXT DEFAULT 'pending',
      remote_deleted BOOLEAN DEFAULT 0
    );
  `);

  // 创建索引
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_goals_order ON goals(order_num);
    CREATE INDEX IF NOT EXISTS idx_goals_deleted_at ON goals(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON tasks(goal_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_task_updates_task_id ON task_updates(task_id);
    CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
    CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
    CREATE INDEX IF NOT EXISTS idx_todos_deleted_at ON todos(deleted_at);
  `);

  console.log('[Database] Database initialized');
}

/**
 * 重置数据库（用于测试）
 */
export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.exec(`
    DROP TABLE IF EXISTS goals;
    DROP TABLE IF EXISTS tasks;
    DROP TABLE IF EXISTS task_updates;
    DROP TABLE IF EXISTS todos;
  `);
  await initDatabase();
}

/**
 * 关闭数据库
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}
