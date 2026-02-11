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

    // 如果完成百分比发生变化，且新的百分比大于0，则创建更新记录
    if (validated.completionPercentage !== undefined &&
        validated.completionPercentage !== existingTask.completionPercentage &&
        validated.completionPercentage > 0) {
      await this.addTaskUpdate({
        taskId: id,
        updateContent: `进度更新至 ${validated.completionPercentage}%`,
        completionPercentage: validated.completionPercentage,
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
