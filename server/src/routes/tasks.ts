import express from "express";
import { taskManager } from "../storage/database";

const router = express.Router();

// 获取所有任务
router.get("/", async (req, res) => {
  try {
    const tasks = await taskManager.getAllTasks();
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, error: "Failed to fetch tasks" });
  }
});

// 获取目标任务
router.get("/goal/:goalId", async (req, res) => {
  try {
    const { goalId } = req.params;
    const tasks = await taskManager.getTasksByGoalId(goalId);
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Error fetching tasks by goal:", error);
    res.status(500).json({ success: false, error: "Failed to fetch tasks" });
  }
});

// 获取单个任务
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await taskManager.getTaskById(id);

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ success: false, error: "Failed to fetch task" });
  }
});

// 创建任务
router.post("/", async (req, res) => {
  try {
    const task = await taskManager.createTask(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ success: false, error: "Failed to create task" });
  }
});

// 更新任务
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await taskManager.updateTask(id, req.body);

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ success: false, error: "Failed to update task" });
  }
});

// 删除任务
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const success = await taskManager.deleteTask(id);

    if (!success) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ success: false, error: "Failed to delete task" });
  }
});

// 获取回收站中的任务
router.get("/trash/all", async (req, res) => {
  try {
    const tasks = await taskManager.getDeletedTasks();
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Error fetching trash tasks:", error);
    res.status(500).json({ success: false, error: "Failed to fetch trash tasks" });
  }
});

// 恢复任务
router.post("/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;
    const success = await taskManager.restoreTask(id);

    if (!success) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    res.json({ success: true, message: "Task restored successfully" });
  } catch (error) {
    console.error("Error restoring task:", error);
    res.status(500).json({ success: false, error: "Failed to restore task" });
  }
});

// 彻底删除任务
router.delete("/:id/permanent", async (req, res) => {
  try {
    const { id } = req.params;
    const success = await taskManager.permanentDeleteTask(id);

    if (!success) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    res.json({ success: true, message: "Task permanently deleted successfully" });
  } catch (error) {
    console.error("Error permanently deleting task:", error);
    res.status(500).json({ success: false, error: "Failed to permanently delete task" });
  }
});

// 获取任务更新记录
router.get("/:id/updates", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = await taskManager.getTaskUpdates(id);
    res.json({ success: true, data: updates });
  } catch (error) {
    console.error("Error fetching task updates:", error);
    res.status(500).json({ success: false, error: "Failed to fetch task updates" });
  }
});

export default router;
