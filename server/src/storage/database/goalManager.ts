import { eq, sql, isNull, isNotNull } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { goals, insertGoalSchema, updateGoalSchema } from "./shared/schema";
import type { Goal, InsertGoal, UpdateGoal } from "./shared/schema";
import * as schema from "./shared/schema";

export class GoalManager {
  async createGoal(data: InsertGoal): Promise<Goal> {
    const db = await getDb(schema);
    const validated = insertGoalSchema.parse(data);

    // 如果没有提供 order 字段，设置为当前最大 order + 1
    if (validated.order === undefined || validated.order === 0) {
      const allGoals = await db.select().from(goals).where(isNull(goals.deletedAt)).orderBy(sql`${goals.order} DESC`).limit(1);
      const maxOrder = allGoals.length > 0 ? (allGoals[0].order || 0) : 0;
      validated.order = maxOrder + 1;
    }

    const [goal] = await db.insert(goals).values(validated).returning();
    return goal;
  }

  async getGoals(): Promise<Goal[]> {
    const db = await getDb(schema);
    // 只返回未被删除的目标
    return db.select().from(goals).where(isNull(goals.deletedAt)).orderBy(sql`${goals.order} ASC`);
  }

  async getGoalById(id: string): Promise<Goal | null> {
    const db = await getDb(schema);
    const [goal] = await db.select().from(goals).where(eq(goals.id, id)).limit(1);
    return goal || null;
  }

  async updateGoal(id: string, data: UpdateGoal): Promise<Goal | null> {
    const db = await getDb(schema);
    const validated = updateGoalSchema.parse(data);
    const [goal] = await db
      .update(goals)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(goals.id, id))
      .returning();
    return goal || null;
  }

  // 软删除目标
  async deleteGoal(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db
      .update(goals)
      .set({ deletedAt: new Date() })
      .where(eq(goals.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // 获取回收站中的目标
  async getDeletedGoals(): Promise<Goal[]> {
    const db = await getDb(schema);
    return db.select().from(goals).where(isNotNull(goals.deletedAt)).orderBy(sql`${goals.deletedAt} DESC`);
  }

  // 恢复目标
  async restoreGoal(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db
      .update(goals)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(eq(goals.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // 彻底删除目标
  async permanentDeleteGoal(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(goals).where(eq(goals.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateGoalOrders(orders: { id: string; order: number }[]): Promise<void> {
    const db = await getDb(schema);

    // 批量更新目标顺序
    for (const item of orders) {
      await db
        .update(goals)
        .set({ order: item.order, updatedAt: new Date() })
        .where(eq(goals.id, item.id));
    }
  }
}

export const goalManager = new GoalManager();
