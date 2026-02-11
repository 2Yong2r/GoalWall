import express from "express";
import { goalManager } from "../storage/database";

const router = express.Router();

// 获取所有目标
router.get("/", async (req, res) => {
  try {
    const goals = await goalManager.getGoals();
    res.json({ success: true, data: goals });
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ success: false, error: "Failed to fetch goals" });
  }
});

// 获取单个目标
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await goalManager.getGoalById(id);

    if (!goal) {
      return res.status(404).json({ success: false, error: "Goal not found" });
    }

    res.json({ success: true, data: goal });
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({ success: false, error: "Failed to fetch goal" });
  }
});

// 创建目标
router.post("/", async (req, res) => {
  try {
    const goal = await goalManager.createGoal(req.body);
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({ success: false, error: "Failed to create goal" });
  }
});

// 更新目标
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await goalManager.updateGoal(id, req.body);

    if (!goal) {
      return res.status(404).json({ success: false, error: "Goal not found" });
    }

    res.json({ success: true, data: goal });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({ success: false, error: "Failed to update goal" });
  }
});

// 删除目标
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const success = await goalManager.deleteGoal(id);

    if (!success) {
      return res.status(404).json({ success: false, error: "Goal not found" });
    }

    res.json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ success: false, error: "Failed to delete goal" });
  }
});

// 批量更新目标顺序
router.post("/reorder", async (req, res) => {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, error: "Invalid orders format" });
    }

    await goalManager.updateGoalOrders(orders);
    res.json({ success: true, message: "Goal orders updated successfully" });
  } catch (error) {
    console.error("Error reordering goals:", error);
    res.status(500).json({ success: false, error: "Failed to reorder goals" });
  }
});

// 获取回收站中的目标
router.get("/trash/all", async (req, res) => {
  try {
    const goals = await goalManager.getDeletedGoals();
    res.json({ success: true, data: goals });
  } catch (error) {
    console.error("Error fetching trash goals:", error);
    res.status(500).json({ success: false, error: "Failed to fetch trash goals" });
  }
});

// 恢复目标
router.post("/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;
    const success = await goalManager.restoreGoal(id);

    if (!success) {
      return res.status(404).json({ success: false, error: "Goal not found" });
    }

    res.json({ success: true, message: "Goal restored successfully" });
  } catch (error) {
    console.error("Error restoring goal:", error);
    res.status(500).json({ success: false, error: "Failed to restore goal" });
  }
});

// 彻底删除目标
router.delete("/:id/permanent", async (req, res) => {
  try {
    const { id } = req.params;
    const success = await goalManager.permanentDeleteGoal(id);

    if (!success) {
      return res.status(404).json({ success: false, error: "Goal not found" });
    }

    res.json({ success: true, message: "Goal permanently deleted successfully" });
  } catch (error) {
    console.error("Error permanently deleting goal:", error);
    res.status(500).json({ success: false, error: "Failed to permanently delete goal" });
  }
});

export default router;
