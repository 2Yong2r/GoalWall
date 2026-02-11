import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DB_NAME = 'goalwall.db';
const STORAGE_PREFIX = '@goalwall_db_';

let dbInstance: any = null;
let dbPromise: Promise<any> | null = null;

/**
 * Web 环境下的简化数据库实现
 * 使用 AsyncStorage 作为底层存储
 */
class WebDatabase {
  private getTableKey(tableName: string, id?: string): string {
    return id ? `${STORAGE_PREFIX}${tableName}_${id}` : `${STORAGE_PREFIX}table_${tableName}`;
  }

  private async getAllRecords(tableName: string): Promise<any[]> {
    const allKeys = await AsyncStorage.getAllKeys();
    const tableKeys = allKeys.filter(key => 
      key.startsWith(`${STORAGE_PREFIX}${tableName}_`) && 
      !key.startsWith(`${STORAGE_PREFIX}table_`)
    );
    
    if (tableKeys.length === 0) {
      return [];
    }
    
    const records = await AsyncStorage.multiGet(tableKeys);
    return records
      .filter(([, value]) => value !== null)
      .map(([, value]) => {
        try {
          return JSON.parse(value || '{}');
        } catch {
          return {};
        }
      });
  }

  private async getRecord(tableName: string, id: string): Promise<any | null> {
    const key = this.getTableKey(tableName, id);
    const value = await AsyncStorage.getItem(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  private async setRecord(tableName: string, id: string, record: any): Promise<void> {
    const key = this.getTableKey(tableName, id);
    await AsyncStorage.setItem(key, JSON.stringify(record));
  }

  private async deleteRecord(tableName: string, id: string): Promise<void> {
    const key = this.getTableKey(tableName, id);
    await AsyncStorage.removeItem(key);
  }

  private filterRecords(records: any[], whereClause: string, params: any[]): any[] {
    if (!whereClause) return records;

    console.log('[WebDatabase] filterRecords called with records:', records.length);
    console.log('[WebDatabase] filterRecords whereClause:', whereClause);
    console.log('[WebDatabase] filterRecords params:', params);

    // 解析 WHERE 子句中的条件
    const conditions: any[] = [];

    // 匹配所有 "column = ?" 或 "column = 'value'" 或 "column = "value"" 或 "column = 数字" 的模式
    // 注意：(\d+) 和 (\?) 需要放在捕获组中
    const equalsMatches = [...whereClause.matchAll(/(\w+)\s*=\s*(?:"([^"]+)"|'([^']+)'|(\d+)|(\?))/g)];
    for (const match of equalsMatches) {
      const column = match[1];
      const doubleQuoteValue = match[2]; // 双引号字符串
      const singleQuoteValue = match[3]; // 单引号字符串
      const digitValue = match[4]; // 数字字面量值
      const placeholder = match[5]; // 占位符 ?

      if (doubleQuoteValue !== undefined) {
        // 字符串字面量值（如 "pending"）
        conditions.push({ column, operator: '=', value: doubleQuoteValue });
      } else if (singleQuoteValue !== undefined) {
        // 字符串字面量值（如 'pending'）
        conditions.push({ column, operator: '=', value: singleQuoteValue });
      } else if (digitValue !== undefined) {
        // 数字字面量值（如 0, 1）
        conditions.push({ column, operator: '=', value: parseInt(digitValue, 10) });
      } else if (placeholder !== undefined) {
        // 参数占位符
        conditions.push({ column, operator: '=', paramIndex: conditions.filter(c => c.paramIndex !== undefined).length });
      }
    }

    // 匹配 "column IS NULL"
    const isNullMatches = [...whereClause.matchAll(/(\w+)\s+IS\s+NULL/gi)];
    for (const match of isNullMatches) {
      conditions.push({ column: match[1], operator: 'IS NULL' });
    }

    // 匹配 "column IS NOT NULL"
    const isNotNullMatches = [...whereClause.matchAll(/(\w+)\s+IS\s+NOT\s+NULL/gi)];
    for (const match of isNotNullMatches) {
      conditions.push({ column: match[1], operator: 'IS NOT NULL' });
    }

    // 匹配 "column <= ?"
    const lessThanOrEqualMatches = [...whereClause.matchAll(/(\w+)\s*<=\s*\?/g)];
    for (const match of lessThanOrEqualMatches) {
      conditions.push({ column: match[1], operator: '<=', paramIndex: conditions.filter(c => c.paramIndex !== undefined).length });
    }

    // 匹配 "column >= ?"
    const greaterThanOrEqualMatches = [...whereClause.matchAll(/(\w+)\s*>=\s*\?/g)];
    for (const match of greaterThanOrEqualMatches) {
      conditions.push({ column: match[1], operator: '>=', paramIndex: conditions.filter(c => c.paramIndex !== undefined).length });
    }

    console.log('[WebDatabase] Parsed conditions:', conditions);

    const filtered = records.filter(record => {
      for (const condition of conditions) {
        const columnValue = record[condition.column];
        const expectedValue = condition.paramIndex !== undefined ? params[condition.paramIndex] : condition.value;

        switch (condition.operator) {
          case '=':
            if (columnValue !== expectedValue) return false;
            break;
          case 'IS NULL':
            if (columnValue !== null && columnValue !== undefined) return false;
            break;
          case 'IS NOT NULL':
            if (columnValue === null || columnValue === undefined) return false;
            break;
          case '<=':
            if (columnValue === null || columnValue === undefined || columnValue > expectedValue) return false;
            break;
          case '>=':
            if (columnValue === null || columnValue === undefined || columnValue < expectedValue) return false;
            break;
        }
      }
      return true;
    });

    console.log('[WebDatabase] Filtered records:', filtered.length);
    return filtered;
  }

  private sortRecords(records: any[], orderByClause: string): any[] {
    if (!orderByClause) return records;
    
    // 简化的 ORDER BY 子句解析，只支持 order_num ASC
    const orderNumMatch = orderByClause.match(/order_num\s+ASC/i);
    if (orderNumMatch) {
      return records.sort((a, b) => (a.order_num || 0) - (b.order_num || 0));
    }
    
    return records;
  }

  async execAsync(sql: string): Promise<void> {
    console.log('[WebDatabase] Executing SQL:', sql.trim());
    
    const upperSql = sql.toUpperCase().trim();
    
    if (upperSql.startsWith('CREATE TABLE')) {
      const tableNameMatch = sql.match(/CREATE TABLE IF NOT EXISTS\s+(\w+)/);
      if (tableNameMatch) {
        const tableName = tableNameMatch[1];
        await AsyncStorage.setItem(this.getTableKey(tableName), '1');
      }
    } else if (upperSql.startsWith('CREATE INDEX')) {
      console.log('[WebDatabase] Index creation ignored in Web mode');
    } else if (upperSql.startsWith('DROP TABLE')) {
      const tableNameMatch = sql.match(/DROP TABLE IF EXISTS\s+(\w+)/);
      if (tableNameMatch) {
        const tableName = tableNameMatch[1];
        await AsyncStorage.removeItem(this.getTableKey(tableName));
        
        const allKeys = await AsyncStorage.getAllKeys();
        const tableKeys = allKeys.filter(key => 
          key.startsWith(`${STORAGE_PREFIX}${tableName}_`) && 
          !key.startsWith(`${STORAGE_PREFIX}table_`)
        );
        await AsyncStorage.multiRemove(tableKeys);
      }
    }
  }

  async getAllAsync(sql: string, params?: any[]): Promise<any[]> {
    console.log('[WebDatabase] getAllAsync called with SQL:', sql);
    console.log('[WebDatabase] getAllAsync params:', params);

    const tableNameMatch = sql.match(/FROM\s+(\w+)/);
    if (!tableNameMatch) {
      console.log('[WebDatabase] No table found in SQL');
      return [];
    }

    const tableName = tableNameMatch[1];
    console.log('[WebDatabase] Table name:', tableName);
    let records = await this.getAllRecords(tableName);
    console.log('[WebDatabase] Total records before filter:', records.length);

    // 解析 WHERE 子句
    const whereIndex = sql.toUpperCase().indexOf('WHERE');
    const orderByIndex = sql.toUpperCase().indexOf('ORDER BY');
    let whereClause = '';
    if (whereIndex !== -1) {
      if (orderByIndex !== -1 && orderByIndex > whereIndex) {
        whereClause = sql.substring(whereIndex + 5, orderByIndex).trim();
      } else {
        whereClause = sql.substring(whereIndex + 5).trim();
      }
    }

    console.log('[WebDatabase] WHERE clause:', whereClause);

    if (whereClause) {
      records = this.filterRecords(records, whereClause, params || []);
      console.log('[WebDatabase] Total records after filter:', records.length);
    }
    
    // 解析 ORDER BY 子句
    if (orderByIndex !== -1) {
      const orderByClause = sql.substring(orderByIndex + 9).trim();
      if (orderByClause) {
        records = this.sortRecords(records, orderByClause);
      }
    }
    
    return records;
  }

  async getFirstAsync(sql: string, params?: any[]): Promise<any | null> {
    const records = await this.getAllAsync(sql, params);
    return records.length > 0 ? records[0] : null;
  }

  async runAsync(sql: string, params?: any[]): Promise<SQLite.SQLiteRunResult> {
    console.log('[WebDatabase] Running SQL:', sql.trim());
    
    const upperSql = sql.toUpperCase().trim();
    
    if (upperSql.startsWith('INSERT')) {
      const tableNameMatch = sql.match(/INSERT INTO\s+(\w+)/);
      if (tableNameMatch && params) {
        const tableName = tableNameMatch[1];
        
        // 从 SQL 中提取列名
        const columnsMatch = sql.match(/\(([^)]+)\)\s+VALUES/i);
        const columns = columnsMatch ? columnsMatch[1].split(',').map((c: string) => c.trim()) : [];
        
        const record: any = {};
        columns.forEach((col, index) => {
          record[col] = params[index];
        });
        
        const id = record.id || Date.now().toString();
        await this.setRecord(tableName, id, record);
        
        return { lastInsertRowId: id, changes: 1 } as SQLite.SQLiteRunResult;
      }
    } else if (upperSql.startsWith('UPDATE')) {
      const tableNameMatch = sql.match(/UPDATE\s+(\w+)/);
      if (tableNameMatch) {
        const tableName = tableNameMatch[1];
        
        const whereMatch = sql.match(/WHERE\s+(\S.*)/i);
        if (whereMatch && params) {
          const whereClause = whereMatch[1];
          const idMatch = whereClause.match(/id\s*=\s*\?/);
          
          if (idMatch) {
            // 解析 SET 子句
            const setIndex = sql.toUpperCase().indexOf('SET');
            const whereIndex = sql.toUpperCase().indexOf('WHERE');
            let setClause = '';
            if (setIndex !== -1 && whereIndex !== -1 && whereIndex > setIndex) {
              setClause = sql.substring(setIndex + 3, whereIndex).trim();
            }
            
            if (setClause) {
              const setClauses = setClause.split(',');
              const idIndex = setClauses.length;
              
              const existingData = await this.getRecord(tableName, params[idIndex]);
              if (existingData) {
                setClauses.forEach((clause, index) => {
                  const key = clause.trim().split('=')[0].trim();
                  existingData[key] = params[index];
                });
                await this.setRecord(tableName, params[idIndex], existingData);
                return { changes: 1 } as SQLite.SQLiteRunResult;
              }
            }
          }
        }
      }
    } else if (upperSql.startsWith('DELETE')) {
      const tableNameMatch = sql.match(/DELETE FROM\s+(\w+)/);
      if (tableNameMatch && params) {
        const tableName = tableNameMatch[1];
        
        const whereMatch = sql.match(/WHERE\s+(\S.*)/i);
        if (whereMatch) {
          const idMatch = whereMatch[1].match(/id\s*=\s*\?/);
          if (idMatch) {
            await this.deleteRecord(tableName, params[0]);
            return { changes: 1 } as SQLite.SQLiteRunResult;
          }
        }
      }
    }
    
    return { changes: 0 } as SQLite.SQLiteRunResult;
  }

  async closeAsync(): Promise<void> {
    console.log('[WebDatabase] Closing database');
  }
}

/**
 * 获取数据库实例（单例模式）
 * Web 环境使用 AsyncStorage，移动端使用 SQLite
 */
export async function getDatabase(): Promise<any> {
  if (dbInstance) {
    console.log('[Database] Reusing existing database connection');
    return dbInstance;
  }
  
  if (dbPromise) {
    console.log('[Database] Waiting for pending database connection');
    return await dbPromise;
  }

  console.log('[Database] Opening database connection...');
  console.log('[Database] Platform:', Platform.OS);
  
  dbPromise = (async () => {
    try {
      if (Platform.OS === 'web') {
        console.log('[Database] Using Web database (AsyncStorage)');
        const db = new WebDatabase();
        dbInstance = db;
        dbPromise = null;
        return db;
      } else {
        console.log('[Database] Using mobile database (SQLite)');
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        console.log('[Database] Mobile database opened successfully');
        dbInstance = db;
        dbPromise = null;
        return db;
      }
    } catch (error) {
      console.error('[Database] Failed to open database:', error);
      console.error('[Database] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      dbPromise = null;
      throw error;
    }
  })();

  return await dbPromise;
}

/**
 * 初始化数据库
 */
export async function initDatabase(): Promise<void> {
  try {
    console.log('[Database] Initializing database...');
    const db = await getDatabase();
    console.log('[Database] Database instance obtained, creating tables...');

    await db.execAsync(`
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
    console.log('[Database] Goals table created');

    await db.execAsync(`
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
    console.log('[Database] Tasks table created');

    await db.execAsync(`
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
    console.log('[Database] Task updates table created');

    await db.execAsync(`
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
    console.log('[Database] Todos table created');

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_goals_order ON goals(order_num);
      CREATE INDEX IF NOT EXISTS idx_goals_deleted_at ON goals(deleted_at);
      CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON tasks(goal_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);
      CREATE INDEX IF NOT EXISTS idx_task_updates_task_id ON task_updates(task_id);
      CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
      CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
      CREATE INDEX IF NOT EXISTS idx_todos_deleted_at ON todos(deleted_at);
    `);
    console.log('[Database] Indexes created');

    console.log('[Database] Database initialized successfully');
  } catch (error) {
    console.error('[Database] Failed to initialize database:', error);
    console.error('[Database] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
}

/**
 * 重置数据库（用于测试）
 */
export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
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
    dbPromise = null;
  }
}
