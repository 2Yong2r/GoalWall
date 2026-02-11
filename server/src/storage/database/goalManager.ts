import { eq, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { goals, insertGoalSchema, updateGoalSchema } from "./shared/schema";
import type { Goal, InsertGoal, UpdateGoal } from "./shared/schema";
import * as schema from "./shared/schema";

export class GoalManager {
  async createGoal(data: InsertGoal): Promise<Goal> {
    const db = await getDb(schema);
    const validated = insertGoalSchema.parse(data);
    const [goal] = await db.insert(goals).values(validated).returning();
    return goal;
  }

  async getGoals(): Promise<Goal[]> {
    const db = await getDb(schema);
    return db.select().from(goals).orderBy(sql`${goals.createdAt} DESC`);
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

  async deleteGoal(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(goals).where(eq(goals.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const goalManager = new GoalManager();
