import express from "express";
import { todoManager } from "../storage/database";

const router = express.Router();

// 获取所有待办
router.get("/", async (req, res) => {
  try {
    const todos = await todoManager.getAllTodos();
    res.json({ success: true, data: todos });
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ success: false, error: "Failed to fetch todos" });
  }
});

// 获取待办（未完成）
router.get("/pending", async (req, res) => {
  try {
    const todos = await todoManager.getPendingTodos();
    res.json({ success: true, data: todos });
  } catch (error) {
    console.error("Error fetching pending todos:", error);
    res.status(500).json({ success: false, error: "Failed to fetch pending todos" });
  }
});

// 获取已完成
router.get("/completed", async (req, res) => {
  try {
    const todos = await todoManager.getCompletedTodos();
    res.json({ success: true, data: todos });
  } catch (error) {
    console.error("Error fetching completed todos:", error);
    res.status(500).json({ success: false, error: "Failed to fetch completed todos" });
  }
});

// 获取未来7天待办
router.get("/upcoming", async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const todos = await todoManager.getUpcomingTodos(days);
    res.json({ success: true, data: todos });
  } catch (error) {
    console.error("Error fetching upcoming todos:", error);
    res.status(500).json({ success: false, error: "Failed to fetch upcoming todos" });
  }
});

// 获取月度待办
router.get("/monthly", async (req, res) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year as string) || now.getFullYear();
    const month = parseInt(req.query.month as string) || now.getMonth() + 1;
    const todos = await todoManager.getMonthlyTodos(year, month);
    res.json({ success: true, data: todos });
  } catch (error) {
    console.error("Error fetching monthly todos:", error);
    res.status(500).json({ success: false, error: "Failed to fetch monthly todos" });
  }
});

// 获取单个待办
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await todoManager.getTodoById(id);

    if (!todo) {
      return res.status(404).json({ success: false, error: "Todo not found" });
    }

    res.json({ success: true, data: todo });
  } catch (error) {
    console.error("Error fetching todo:", error);
    res.status(500).json({ success: false, error: "Failed to fetch todo" });
  }
});

// 创建待办
router.post("/", async (req, res) => {
  try {
    const todo = await todoManager.createTodo(req.body);
    res.status(201).json({ success: true, data: todo });
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ success: false, error: "Failed to create todo" });
  }
});

// 更新待办
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await todoManager.updateTodo(id, req.body);

    if (!todo) {
      return res.status(404).json({ success: false, error: "Todo not found" });
    }

    res.json({ success: true, data: todo });
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ success: false, error: "Failed to update todo" });
  }
});

// 删除待办
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const success = await todoManager.deleteTodo(id);

    if (!success) {
      return res.status(404).json({ success: false, error: "Todo not found" });
    }

    res.json({ success: true, message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ success: false, error: "Failed to delete todo" });
  }
});

export default router;
