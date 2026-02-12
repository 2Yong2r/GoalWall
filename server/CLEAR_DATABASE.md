# 数据库清除工具

## 功能说明

此工具提供清除SQL数据库中所有目标相关数据的功能，包括：
- 目标 (Goals)
- 任务 (Tasks)
- 任务更新记录 (Task Updates)

## API 端点

### 1. 获取数据库统计信息

```bash
GET /api/v1/clear-database/statistics
```

返回示例：
```json
{
  "success": true,
  "statistics": {
    "goals": 18,
    "tasks": 34,
    "taskUpdates": 14,
    "total": 66
  }
}
```

### 2. 清除所有目标数据

```bash
DELETE /api/v1/clear-database/all
```

返回示例：
```json
{
  "success": true,
  "message": "数据库清除成功",
  "statistics": {
    "goalsDeleted": 18,
    "tasksDeleted": 34,
    "taskUpdatesDeleted": 14,
    "totalDeleted": 66
  }
}
```

## 使用方法

### 方法一：使用 curl 命令

```bash
# 1. 查看当前数据统计
curl http://localhost:9091/api/v1/clear-database/statistics

# 2. 清除所有数据
curl -X DELETE http://localhost:9091/api/v1/clear-database/all

# 3. 验证数据已清除
curl http://localhost:9091/api/v1/clear-database/statistics
```

### 方法二：使用 Postman 或其他 API 测试工具

1. 设置请求地址：`http://localhost:9091/api/v1/clear-database/all`
2. 设置请求方法：`DELETE`
3. 发送请求

## 注意事项

⚠️ **重要提示**：
- 此操作将删除所有目标及其关联的任务和任务更新记录
- 删除后的数据无法恢复
- 待办 (Todos) 数据不受影响
- 建议在清除前先查看统计信息确认要删除的数据量

## 删除顺序

为了确保数据完整性，工具会按照以下顺序删除数据：

1. 先删除所有任务更新记录 (task_updates)
2. 再删除所有任务 (tasks)
3. 最后删除所有目标 (goals)

这样可以避免外键约束问题。

## 错误处理

如果删除失败，API 会返回错误信息：

```json
{
  "success": false,
  "error": "清除数据库失败",
  "message": "详细错误信息"
}
```

## 技术实现

- 使用 Drizzle ORM 执行删除操作
- 按照依赖关系顺序删除，避免外键约束错误
- 返回详细的删除统计信息
- 服务器日志记录完整的操作过程
