import express from "express";

const router = express.Router();

/**
 * 清除Web端本地数据的说明
 * 注意：此端点只是返回清除数据的方法，实际清除需要在客户端执行
 * 因为Web端数据存储在浏览器的localStorage中
 */
router.get("/instructions", (req, res) => {
  res.json({
    success: true,
    message: "清除Web端本地数据的说明",
    instructions: {
      method1: "使用调试页面",
      steps: [
        "在浏览器中访问 /debug 页面",
        "点击 '清空本地数据' 按钮",
        "确认清除操作"
      ],
      method2: "使用浏览器控制台",
      code: `
// 在浏览器控制台执行以下代码：
Object.keys(localStorage)
  .filter(key => key.startsWith('@goalwall_db_'))
  .forEach(key => localStorage.removeItem(key));
location.reload();
      `,
      method3: "使用清除脚本",
      note: "访问 /scripts/clear-web-data.html 页面"
    }
  });
});

export default router;
