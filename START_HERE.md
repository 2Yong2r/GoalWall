# 🎯 立即生成可用 APK - 操作步骤

## ✅ 已完成的改进

1. ✅ 优化 GitHub Actions 工作流
2. ✅ 支持输入后端 URL
3. ✅ 添加 URL 验证
4. ✅ 创建快速构建指南

---

## 🚀 接下来的步骤（3 步完成）

### 步骤 1：启动后端服务

```bash
cd /workspace/projects/server
pnpm run dev
```

等待看到：`[SERVER] Server listening at http://localhost:9091/`

**保持此终端窗口打开！**

---

### 步骤 2：启动 ngrok

**打开新的终端窗口**，运行：

```bash
# 尝试以下命令之一：

# 方法 1：如果 ngrok 在系统路径中
ngrok http 9091

# 方法 2：如果 ngrok 在本地目录
./ngrok http 9091

# 方法 3：找到 ngrok 的位置
# macOS/Linux:
find ~ -name "ngrok" -type f 2>/dev/null

# 然后使用完整路径：
/path/to/ngrok http 9091
```

**重要**：
1. ngrok 会显示类似：`Forwarding  https://abc123.ngrok.io -> http://localhost:9091`
2. **复制你的 ngrok URL**（例如：`https://abc123.ngrok.io`）
3. **保持此终端窗口打开！**

---

### 步骤 3：触发 GitHub Actions 构建

**通过 GitHub 网页（推荐）**：

1. 访问：https://github.com/2Yong2r/GoalWall/actions
2. 点击左侧 "Build Android APK"
3. 点击 "Run workflow" 按钮
4. 在 "backend_url" 输入框中粘贴你的 ngrok URL
5. 确保分支选择为 `main`
6. 点击绿色的 "Run workflow" 按钮

**或使用 GitHub CLI**：

```bash
# 替换 YOUR_NGROK_URL 为你的实际 URL
gh workflow run build-android.yml \
  --ref main \
  -f backend_url=https://abc123.ngrok.io
```

---

## ⏱️ 等待构建完成

1. 在 GitHub Actions 页面查看构建进度
2. 构建大约需要 **10-15 分钟**
3. 构建完成后会显示 ✅ 绿色勾号

---

## 📱 下载并安装 APK

1. 点击构建任务（绿色的构建）
2. 滚动到底部 "Artifacts" 部分
3. 下载 `app-debug-XXX.apk`（XXX 是构建编号）
4. 通过数据线传输到手机
5. 在手机上安装（允许安装未知来源的应用）

---

## ✅ 测试 APK

安装后测试：

1. ✅ 打开应用
2. ✅ 尝试创建一个目标
3. ✅ 尝试创建一个任务
4. ✅ 尝试创建一个待办

**重要**：
- ngrok 和后端服务必须保持运行
- 如果关闭，APK 将无法正常工作

---

## 🐛 遇到问题？

### ngrok 命令找不到

```bash
# 查找 ngrok 位置
find ~ -name "ngrok" -type f 2>/dev/null

# 使用完整路径
/path/to/ngrok http 9091
```

### 构建失败

查看构建日志，确认：
1. 后端 URL 格式正确（包含 `https://`）
2. ngrok 正在运行
3. 后端服务正在运行

### APK 无法创建数据

检查 ngrok 是否运行：

在电脑浏览器访问：
```
https://你的ngrokURL/api/v1/health
```

应该返回：`{"status":"ok"}`

---

## 📚 详细文档

- **[QUICK_APK_BUILD.md](https://github.com/2Yong2r/GoalWall/blob/main/QUICK_APK_BUILD.md)** - 5 分钟快速构建完整指南
- **[APK_BUILD_ANALYSIS.md](https://github.com/2Yong2r/GoalWall/blob/main/APK_BUILD_ANALYSIS.md)** - 问题分析
- **[APK_FIX_SOLUTION.md](https://github.com/2Yong2r/GoalWall/blob/main/APK_FIX_SOLUTION.md)** - 详细解决方案

---

## 🎉 完成！

恭喜！你现在可以生成可以在手机上正常使用的 APK 了。

**重要提示**：
- ngrok URL 每次启动都会变化
- 每次需要重新构建 APK
- 如需固定 URL，考虑部署后端到公网服务

---

**准备好开始了吗？按照上面的 3 个步骤操作即可！** 🚀
