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
  pgEnum,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// 优先级枚举
export const priorityEnum = pgEnum("priority", ["high", "medium", "low"]);

// 待办状态枚举
export const todoStatusEnum = pgEnum("todo_status", ["pending", "completed"]);

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
    priority: priorityEnum("priority").notNull().default("medium"), // 优先级：high(高)、medium(中)、low(低)
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

// 待办表
export const todos = pgTable(
  "todos",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    dueDate: timestamp("due_date", { withTimezone: true, mode: 'date' }), // 到期日期
    priority: priorityEnum("priority").notNull().default("medium"), // 优先级：high(高)、medium(中)、low(低)
    status: todoStatusEnum("status").notNull().default("pending"), // 状态：pending(待办)、completed(已完成)
    completedAt: timestamp("completed_at", { withTimezone: true, mode: 'date' }), // 完成时间
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'date' }), // 软删除时间
  },
  (table) => ({
    dueDateIdx: index("todos_due_date_idx").on(table.dueDate),
    statusIdx: index("todos_status_idx").on(table.status),
    deletedAtIdx: index("todos_deleted_at_idx").on(table.deletedAt),
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
  priority: true,
  startDate: true,
  endDate: true,
  completionPercentage: true,
  actualCompletionDate: true,
});

export const updateTaskSchema = createCoercedInsertSchema(tasks)
  .pick({
    goalId: true,
    description: true,
    priority: true,
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

// Todos Zod schemas
export const insertTodoSchema = createCoercedInsertSchema(todos).pick({
  title: true,
  description: true,
  dueDate: true,
  priority: true,
  status: true,
});

export const updateTodoSchema = createCoercedInsertSchema(todos)
  .pick({
    title: true,
    description: true,
    dueDate: true,
    priority: true,
    status: true,
    completedAt: true,
  })
  .partial();

// TypeScript types
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type UpdateGoal = z.infer<typeof updateGoalSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;

export type TaskUpdate = typeof taskUpdates.$inferSelect;
export type InsertTaskUpdate = z.infer<typeof insertTaskUpdateSchema>;

export type Todo = typeof todos.$inferSelect;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
