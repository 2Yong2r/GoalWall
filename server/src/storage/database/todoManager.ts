import { eq, sql, isNull, isNotNull, and, or, gte, lte, between } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { todos, insertTodoSchema, updateTodoSchema } from "./shared/schema";
import type { Todo, InsertTodo, UpdateTodo } from "./shared/schema";
import * as schema from "./shared/schema";

export class TodoManager {
  async createTodo(data: InsertTodo): Promise<Todo> {
    const db = await getDb(schema);
    const validated = insertTodoSchema.parse(data);
    const [todo] = await db.insert(todos).values(validated).returning();
    return todo;
  }

  async getAllTodos(): Promise<Todo[]> {
    const db = await getDb(schema);
    return db.select().from(todos).where(isNull(todos.deletedAt)).orderBy(sql`${todos.dueDate} ASC NULLS LAST, ${todos.createdAt} DESC`);
  }

  async getTodoById(id: string): Promise<Todo | null> {
    const db = await getDb(schema);
    const [todo] = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
    return todo || null;
  }

  async updateTodo(id: string, data: UpdateTodo): Promise<Todo | null> {
    const db = await getDb(schema);
    const validated = updateTodoSchema.parse(data);

    // 如果标记为完成，设置完成时间
    const updateData: any = { ...validated, updatedAt: new Date() };
    if (validated.status === 'completed' && !validated.completedAt) {
      updateData.completedAt = new Date();
    } else if (validated.status === 'pending') {
      updateData.completedAt = null;
    }

    const [todo] = await db
      .update(todos)
      .set(updateData)
      .where(eq(todos.id, id))
      .returning();
    return todo || null;
  }

  async deleteTodo(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db
      .update(todos)
      .set({ deletedAt: new Date() })
      .where(eq(todos.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // 获取待办（未完成）
  async getPendingTodos(): Promise<Todo[]> {
    const db = await getDb(schema);
    return db.select().from(todos)
      .where(and(isNull(todos.deletedAt), eq(todos.status, 'pending')))
      .orderBy(sql`${todos.dueDate} ASC NULLS LAST, ${todos.createdAt} DESC`);
  }

  // 获取已完成
  async getCompletedTodos(): Promise<Todo[]> {
    const db = await getDb(schema);
    return db.select().from(todos)
      .where(and(isNull(todos.deletedAt), eq(todos.status, 'completed')))
      .orderBy(sql`${todos.completedAt} DESC`);
  }

  // 获取未来7天的待办
  async getUpcomingTodos(days: number = 7): Promise<Todo[]> {
    const db = await getDb(schema);
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return db.select().from(todos)
      .where(
        and(
          isNull(todos.deletedAt),
          eq(todos.status, 'pending'),
          or(
            isNull(todos.dueDate),
            and(
              gte(todos.dueDate, now),
              lte(todos.dueDate, futureDate)
            )
          )
        )
      )
      .orderBy(sql`${todos.dueDate} ASC NULLS LAST, ${todos.createdAt} DESC`);
  }

  // 获取月度待办
  async getMonthlyTodos(year: number, month: number): Promise<Todo[]> {
    const db = await getDb(schema);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return db.select().from(todos)
      .where(
        and(
          isNull(todos.deletedAt),
          or(
            isNull(todos.dueDate),
            between(todos.dueDate, startDate, endDate)
          )
        )
      )
      .orderBy(sql`${todos.dueDate} ASC NULLS LAST, ${todos.createdAt} DESC`);
  }

  // 按优先级获取待办
  async getTodosByPriority(priority: 'high' | 'medium' | 'low'): Promise<Todo[]> {
    const db = await getDb(schema);
    return db.select().from(todos)
      .where(
        and(
          isNull(todos.deletedAt),
          eq(todos.status, 'pending'),
          eq(todos.priority, priority)
        )
      )
      .orderBy(sql`${todos.dueDate} ASC NULLS LAST, ${todos.createdAt} DESC`);
  }
}

export const todoManager = new TodoManager();
