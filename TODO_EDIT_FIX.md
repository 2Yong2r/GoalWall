# 待办事项编辑修复说明

## 问题现象
- 编辑待办时，不选择时间可以正常保存
- 选择时间后保存时报错：`no such column: start_time`

## 问题原因
数据库表结构与代码中的字段名不一致：
- 代码中使用 `start_time` 和 `end_time`
- 旧数据库表使用 `due_date`

## 解决方案

### 方案 1：刷新页面（推荐）
在浏览器中刷新页面，系统会自动执行数据迁移，将旧数据格式转换为新的格式。

### 方案 2：手动重置数据库（如果方案 1 无效）
在浏览器控制台中执行以下代码：

```javascript
// 1. 重置数据库
const STORAGE_PREFIX = '@goalwall_db_';
const allKeys = await AsyncStorage.getAllKeys();
const dbKeys = allKeys.filter(key => key.startsWith(STORAGE_PREFIX));
await AsyncStorage.multiRemove(dbKeys);
console.log('数据库已重置');

// 2. 刷新页面
location.reload();
```

### 方案 3：检查迁移日志
在浏览器控制台中查看迁移日志：
```javascript
// 查看迁移日志
console.log('[Database] Migration logs');
```

如果看到以下日志，说明迁移成功：
- `[Database] Migrating Web database...`
- `[Database] Found X todo records to migrate`
- `[Database] Migrated X todo records`

## 修复内容
1. **自动迁移逻辑**：
   - Web 环境：自动迁移 AsyncStorage 中的旧数据
   - 移动环境：自动添加新列并迁移旧数据
   
2. **迁移规则**：
   - 将 `due_date` 字段迁移到 `end_time`
   - 添加 `start_time` 字段（默认为 null）
   - 删除旧的 `due_date` 字段

3. **数据兼容**：
   - 旧数据没有设置时间时，新字段会自动设置为 null
   - 迁移是幂等的，可以安全地重复执行

## 验证
修复后，请验证以下功能：
1. 创建待办，设置开始时间和结束时间，保存
2. 编辑待办，修改开始时间和结束时间，保存
3. 编辑待办，清除时间，保存
4. 在待办列表中查看时间显示格式（HH:mm - HH:mm）

## 技术细节
- 迁移逻辑在 `client/services/database/index.ts` 中实现
- 每次 `initDatabase()` 时都会检查并执行必要的迁移
- 迁移不会删除 `due_date` 字段，以避免数据丢失
- Web 环境使用 AsyncStorage，移动环境使用 SQLite
