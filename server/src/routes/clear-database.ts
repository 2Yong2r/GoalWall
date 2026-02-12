import express from "express";
import { getDb } from "coze-coding-dev-sdk";
import { goals, tasks, taskUpdates } from "../storage/database/shared/schema";
import { sql } from "drizzle-orm";
import * as schema from "../storage/database/shared/schema";

const router = express.Router();

/**
 * 清除数据库中的所有目标数据
 * 注意：此操作将删除所有目标及其关联的任务和任务更新记录
 */
router.delete("/all", async (req, res) => {
  try {
    console.log('[ClearDB] Starting database clear operation...');

    // 获取数据库实例
    const db = await getDb(schema);

    // 统计当前数据
    const [goalCount, taskCount, taskUpdateCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(goals).then(r => r[0]?.count || 0),
      db.select({ count: sql<number>`count(*)::int` }).from(tasks).then(r => r[0]?.count || 0),
      db.select({ count: sql<number>`count(*)::int` }).from(taskUpdates).then(r => r[0]?.count || 0),
    ]);

    console.log(`[ClearDB] Current data: Goals=${goalCount}, Tasks=${taskCount}, TaskUpdates=${taskUpdateCount}`);

    if (goalCount === 0 && taskCount === 0 && taskUpdateCount === 0) {
      return res.json({
        success: true,
        message: "数据库已经是空的",
        statistics: {
          goalsDeleted: 0,
          tasksDeleted: 0,
          taskUpdatesDeleted: 0,
          totalDeleted: 0,
        },
      });
    }

    // 按顺序删除：先删除 task_updates，再删除 tasks，最后删除 goals
    // 这样可以避免外键约束问题

    // 1. 删除所有任务更新记录
    console.log('[ClearDB] Deleting task updates...');
    const deletedTaskUpdates = await db.delete(taskUpdates).returning();
    const taskUpdatesDeleted = deletedTaskUpdates.length;
    console.log(`[ClearDB] Deleted ${taskUpdatesDeleted} task updates`);

    // 2. 删除所有任务
    console.log('[ClearDB] Deleting tasks...');
    const deletedTasks = await db.delete(tasks).returning();
    const tasksDeleted = deletedTasks.length;
    console.log(`[ClearDB] Deleted ${tasksDeleted} tasks`);

    // 3. 删除所有目标
    console.log('[ClearDB] Deleting goals...');
    const deletedGoals = await db.delete(goals).returning();
    const goalsDeleted = deletedGoals.length;
    console.log(`[ClearDB] Deleted ${goalsDeleted} goals`);

    const totalDeleted = goalsDeleted + tasksDeleted + taskUpdatesDeleted;

    console.log(`[ClearDB] Database clear completed. Total: ${totalDeleted}`);

    res.json({
      success: true,
      message: "数据库清除成功",
      statistics: {
        goalsDeleted,
        tasksDeleted,
        taskUpdatesDeleted,
        totalDeleted,
      },
    });
  } catch (error) {
    console.error('[ClearDB] Error clearing database:', error);
    res.status(500).json({
      success: false,
      error: "清除数据库失败",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * 获取数据库统计信息
 */
router.get("/statistics", async (req, res) => {
  try {
    const db = await getDb(schema);

    const [goalCount, taskCount, taskUpdateCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(goals).then(r => r[0]?.count || 0),
      db.select({ count: sql<number>`count(*)::int` }).from(tasks).then(r => r[0]?.count || 0),
      db.select({ count: sql<number>`count(*)::int` }).from(taskUpdates).then(r => r[0]?.count || 0),
    ]);

    res.json({
      success: true,
      statistics: {
        goals: goalCount,
        tasks: taskCount,
        taskUpdates: taskUpdateCount,
        total: goalCount + taskCount + taskUpdateCount,
      },
    });
  } catch (error) {
    console.error('[ClearDB] Error getting statistics:', error);
    res.status(500).json({
      success: false,
      error: "获取统计信息失败",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
