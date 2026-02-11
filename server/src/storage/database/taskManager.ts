import { eq, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { tasks, taskUpdates, insertTaskSchema, updateTaskSchema, insertTaskUpdateSchema } from "./shared/schema";
import type { Task, InsertTask, UpdateTask, TaskUpdate, InsertTaskUpdate } from "./shared/schema";
import * as schema from "./shared/schema";

export class TaskManager {
  async createTask(data: InsertTask): Promise<Task> {
    const db = await getDb(schema);
    const validated = insertTaskSchema.parse(data);
    const [task] = await db.insert(tasks).values(validated).returning();
    return task;
  }

  async getAllTasks(): Promise<Task[]> {
    const db = await getDb(schema);
    return db.select().from(tasks).orderBy(sql`${tasks.createdAt} DESC`);
  }

  async getTasksByGoalId(goalId: string): Promise<Task[]> {
    const db = await getDb(schema);
    return db.select().from(tasks).where(eq(tasks.goalId, goalId)).orderBy(sql`${tasks.createdAt} DESC`);
  }

  async getTaskById(id: string): Promise<Task | null> {
    const db = await getDb(schema);
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);

    if (!task) return null;

    // 获取更新记录
    const updates = await db.select().from(taskUpdates).where(eq(taskUpdates.taskId, id)).orderBy(sql`${taskUpdates.createdAt} DESC`);

    return { ...task, updates } as any;
  }

  async updateTask(id: string, data: UpdateTask): Promise<Task | null> {
    const db = await getDb(schema);
    const validated = updateTaskSchema.parse(data);

    // 如果更新了完成百分比，且与原值不同，记录更新
    const [existingTask] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);

    if (!existingTask) {
      return null;
    }

    const [task] = await db
      .update(tasks)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();

    // 记录所有字段的变化
    const changes: string[] = [];
    let completionPercentage: number | undefined = undefined;

    // 检查每个字段的变化
    if (validated.goalId !== undefined && validated.goalId !== existingTask.goalId) {
      changes.push('所属目标');
    }
    if (validated.description !== undefined && validated.description !== existingTask.description) {
      changes.push('描述');
    }
    if (validated.weight !== undefined && validated.weight !== existingTask.weight) {
      changes.push(`权重 (${existingTask.weight} → ${validated.weight})`);
    }
    if (validated.startDate !== undefined && validated.startDate !== existingTask.startDate) {
      changes.push('开始日期');
    }
    if (validated.endDate !== undefined && validated.endDate !== existingTask.endDate) {
      changes.push('结束日期');
    }
    if (validated.completionPercentage !== undefined && validated.completionPercentage !== existingTask.completionPercentage) {
      changes.push(`进度 (${existingTask.completionPercentage}% → ${validated.completionPercentage}%)`);
      completionPercentage = validated.completionPercentage;
    }
    if (validated.actualCompletionDate !== undefined && validated.actualCompletionDate !== existingTask.actualCompletionDate) {
      changes.push('实际完成日期');
    }

    // 如果有变化，创建更新记录
    if (changes.length > 0) {
      await this.addTaskUpdate({
        taskId: id,
        updateContent: changes.join(', '),
        completionPercentage: completionPercentage ?? existingTask.completionPercentage,
      });
    }

    return task;
  }

  async deleteTask(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // 任务更新记录管理
  async addTaskUpdate(data: InsertTaskUpdate): Promise<TaskUpdate> {
    const db = await getDb(schema);
    const validated = insertTaskUpdateSchema.parse(data);
    const [update] = await db.insert(taskUpdates).values(validated).returning();
    return update;
  }

  async getTaskUpdates(taskId: string): Promise<TaskUpdate[]> {
    const db = await getDb(schema);
    return db.select().from(taskUpdates).where(eq(taskUpdates.taskId, taskId)).orderBy(sql`${taskUpdates.createdAt} DESC`);
  }
}

export const taskManager = new TaskManager();
