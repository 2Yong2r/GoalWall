import express from "express";
import { getDb } from "coze-coding-dev-sdk";
import { goals, tasks } from "../storage/database/shared/schema";
import * as schema from "../storage/database/shared/schema";

const router = express.Router();

/**
 * 生成测试数据（用于测试同步功能）
 */
router.post("/test-data", async (req, res) => {
  try {
    console.log('[TestData] Creating test data...');

    const db = await getDb(schema);
    const count = parseInt(req.query.count as string) || 5;

    // 创建测试目标
    const testGoals = [];
    for (let i = 1; i <= count; i++) {
      const goal = {
        name: `测试目标-${Date.now()}-${i}`,
        description: `这是第 ${i} 个测试目标的描述`,
        order: i,
      };
      const [insertedGoal] = await db.insert(goals).values(goal).returning();
      testGoals.push(insertedGoal);
      console.log(`[TestData] Created goal: ${insertedGoal.name}`);
    }

    // 为每个目标创建一些测试任务
    const testTasks = [];
    for (const goal of testGoals) {
      for (let j = 1; j <= 3; j++) {
        const task = {
          goalId: goal.id,
          description: `${goal.name} - 任务 ${j}`,
          priority: (j === 1 ? 'high' : j === 2 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
          completionPercentage: Math.floor(Math.random() * 100),
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        const [insertedTask] = await db.insert(tasks).values(task).returning();
        testTasks.push(insertedTask);
        console.log(`[TestData] Created task: ${insertedTask.description}`);
      }
    }

    console.log(`[TestData] Created ${testGoals.length} goals and ${testTasks.length} tasks`);

    res.json({
      success: true,
      message: "测试数据创建成功",
      data: {
        goalsCreated: testGoals.length,
        tasksCreated: testTasks.length,
        goals: testGoals,
        tasks: testTasks,
      },
    });
  } catch (error) {
    console.error('[TestData] Error creating test data:', error);
    res.status(500).json({
      success: false,
      error: "创建测试数据失败",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
