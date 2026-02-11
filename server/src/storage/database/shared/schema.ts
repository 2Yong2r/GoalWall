import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// 目标表
export const goals = pgTable(
  "goals",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    order: integer("order").default(0).notNull(), // 排序顺序
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'date' }), // 软删除时间
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }),
  },
  (table) => ({
    nameIdx: index("goals_name_idx").on(table.name),
    orderIdx: index("goals_order_idx").on(table.order),
    deletedAtIdx: index("goals_deleted_at_idx").on(table.deletedAt),
  })
);

// 任务表
export const tasks = pgTable(
  "tasks",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    goalId: varchar("goal_id", { length: 36 }), // 关联的目标ID，可为null（独立任务）
    description: text("description").notNull(),
    weight: integer("weight").default(1).notNull(), // 权重
    startDate: timestamp("start_date", { withTimezone: true, mode: 'date' }), // 开始日期
    endDate: timestamp("end_date", { withTimezone: true, mode: 'date' }), // 结束日期
    completionPercentage: integer("completion_percentage").default(0).notNull(), // 完成百分比 (0-100)
    actualCompletionDate: timestamp("actual_completion_date", { withTimezone: true, mode: 'date' }), // 实际完成日期
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'date' }), // 软删除时间
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }),
  },
  (table) => ({
    goalIdIdx: index("tasks_goal_id_idx").on(table.goalId),
    deletedAtIdx: index("tasks_deleted_at_idx").on(table.deletedAt),
  })
);

// 任务更新记录表
export const taskUpdates = pgTable(
  "task_updates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    taskId: varchar("task_id", { length: 36 }).notNull(), // 关联的任务ID
    updateContent: text("update_content").notNull(), // 更新内容
    completionPercentage: integer("completion_percentage").default(0).notNull(), // 更新时的完成百分比
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    taskIdIdx: index("task_updates_task_id_idx").on(table.taskId),
    createdAtIdx: index("task_updates_created_at_idx").on(table.createdAt),
  })
);

// 使用 createSchemaFactory 配置 date coercion
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

// Goals Zod schemas
export const insertGoalSchema = createCoercedInsertSchema(goals).pick({
  name: true,
  description: true,
  order: true,
});

export const updateGoalSchema = createCoercedInsertSchema(goals)
  .pick({
    name: true,
    description: true,
    order: true,
  })
  .partial();

// Tasks Zod schemas
export const insertTaskSchema = createCoercedInsertSchema(tasks).pick({
  goalId: true,
  description: true,
  weight: true,
  startDate: true,
  endDate: true,
  completionPercentage: true,
  actualCompletionDate: true,
});

export const updateTaskSchema = createCoercedInsertSchema(tasks)
  .pick({
    goalId: true,
    description: true,
    weight: true,
    startDate: true,
    endDate: true,
    completionPercentage: true,
    actualCompletionDate: true,
  })
  .partial();

// Task Updates Zod schemas
export const insertTaskUpdateSchema = createCoercedInsertSchema(taskUpdates).pick({
  taskId: true,
  updateContent: true,
  completionPercentage: true,
});

// TypeScript types
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type UpdateGoal = z.infer<typeof updateGoalSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;

export type TaskUpdate = typeof taskUpdates.$inferSelect;
export type InsertTaskUpdate = z.infer<typeof insertTaskUpdateSchema>;
