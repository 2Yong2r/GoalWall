# 快速生成可用 APK - 完整指南

## 🎯 目标

生成一个可以在手机上正常使用的 APK 文件。

---

## 📋 前置条件

✅ 后端服务运行在 `localhost:9091`
✅ 已安装 ngrok

---

## 🚀 快速开始（5 分钟完成）

### 步骤 1：启动后端服务

```bash
cd /workspace/projects/server
pnpm run dev
```

等待看到：
```
[SERVER] Server listening at http://localhost:9091/
```

### 步骤 2：启动 ngrok（在新的终端窗口）

```bash
# 方法 A：如果 ngrok 在系统路径中
ngrok http 9091

# 方法 B：如果 ngrok 在本地目录
./ngrok http 9091

# 方法 C：如果 ngrok 在其他目录
/path/to/ngrok http 9091
```

**重要**：ngrok 会显示类似这样的信息：
```
Forwarding  https://abc123.ngrok.io -> http://localhost:9091
```

复制你的 **ngrok URL**（例如：`https://abc123.ngrok.io`）

### 步骤 3：触发 GitHub Actions 构建

有两种方法：

#### 方法 A：通过 GitHub 网页（推荐）

1. 访问：https://github.com/2Yong2r/GoalWall/actions
2. 点击左侧 "Build Android APK"
3. 点击 "Run workflow"
4. 在 "backend_url" 输入框中粘贴你的 ngrok URL
5. 点击 "Run workflow"

#### 方法 B：通过 GitHub CLI

```bash
# 替换 YOUR_NGROK_URL 为你的实际 URL
gh workflow run build-android.yml \
  --ref main \
  -f backend_url=https://abc123.ngrok.io
```

### 步骤 4：等待构建完成

1. 在 GitHub Actions 页面查看构建进度
2. 构建大约需要 10-15 分钟
3. 构建完成后会显示 ✅ 绿色勾号

### 步骤 5：下载 APK

1. 点击构建任务
2. 滚动到底部 "Artifacts" 部分
3. 下载 `app-debug-XXX.apk`
4. 传输到手机并安装

---

## 🔍 验证 APK 是否正常工作

安装后测试：

1. ✅ 打开应用
2. ✅ 尝试创建一个目标
3. ✅ 尝试创建一个任务
4. ✅ 尝试创建一个待办

**注意**：ngrok URL 需要保持运行，APK 才能正常工作！

---

## ⚠️ 常见问题

### 问题 1：ngrok 命令找不到

**解决**：

找到 ngrok 的安装位置：

```bash
# macOS
find /Applications -name "ngrok"

# Linux
find ~ -name "ngrok" -type f

# Windows (在 Git Bash 中)
find /c/Users/你的用户名 -name "ngrok.exe"
```

然后使用完整路径：

```bash
/path/to/ngrok http 9091
```

### 问题 2：构建失败，提示 "Invalid URL format"

**解决**：

确保 URL 包含 `https://`：

❌ 错误：`abc123.ngrok.io`
✅ 正确：`https://abc123.ngrok.io`

### 问题 3：APK 安装后无法创建数据

**可能原因**：

1. ngrok 停止运行
2. 后端服务停止
3. 网络连接问题

**检查方法**：

在电脑浏览器访问你的 ngrok URL + `/api/v1/health`：

```
https://abc123.ngrok.io/api/v1/health
```

应该返回：
```json
{"status":"ok"}
```

### 问题 4：ngrok URL 变化

**现象**：每次启动 ngrok 都会生成不同的 URL

**解决**：

这是 ngrok 免费版的限制，有两个方案：

1. **每次重建 APK**（免费版）
   - 停止旧的 ngrok
   - 启动新的 ngrok
   - 复制新的 URL
   - 重新触发构建

2. **使用固定域名**（付费版）
   - 升级 ngrok 到付费版
   - 配置自定义域名
   - 一次配置，永久使用

---

## 💡 进阶方案（长期使用）

### 方案 1：使用 GitHub Secrets（推荐）

如果你有稳定的生产后端，可以配置 GitHub Secrets：

1. 访问：https://github.com/2Yong2r/GoalWall/settings/secrets/actions
2. 点击 "New repository secret"
3. 添加：
   - Name: `BACKEND_URL`
   - Secret: `https://your-api.example.com`
4. 保存后，每次构建都会自动使用这个 URL

**优点**：无需每次输入 URL

### 方案 2：部署后端到公网服务

使用免费或低成本服务部署后端：

| 服务 | 免费额度 | 推荐指数 |
|------|----------|----------|
| Railway | $5 免费额度 | ⭐⭐⭐⭐⭐ |
| Render | 750 小时/月 | ⭐⭐⭐⭐ |
| Vercel | 100GB 带宽 | ⭐⭐⭐⭐⭐ |
| 自己的服务器 | 无限制 | ⭐⭐⭐ |

**优点**：URL 固定，无需 ngrok

---

## 📝 快速命令参考

```bash
# 1. 启动后端
cd /workspace/projects/server
pnpm run dev

# 2. 启动 ngrok（新终端）
ngrok http 9091

# 3. 复制 ngrok URL（例如：https://abc123.ngrok.io）

# 4. 触发构建（GitHub CLI）
gh workflow run build-android.yml -f backend_url=https://abc123.ngrok.io

# 5. 查看构建状态
gh run list --limit 1

# 6. 下载 APK（Web 界面）
# 访问：https://github.com/2Yong2r/GoalWall/actions
# 点击构建任务 → 下载 Artifacts
```

---

## ✅ 成功检查清单

完成以下所有步骤：

- [ ] 后端服务运行在 `localhost:9091`
- [ ] ngrok 已启动并显示 URL
- [ ] 复制了 ngrok URL
- [ ] 触发了 GitHub Actions 构建
- [ ] 构建完成并显示 ✅
- [ ] 下载了 APK
- [ ] APK 传输到手机
- [ ] APK 安装成功
- [ ] 可以正常创建目标、任务、待办

---

## 🎉 完成后

恭喜！你已经有了一个可以在手机上正常使用的 APK。

**下一步**：
1. 测试所有功能
2. 反馈问题（如果有）
3. 考虑部署生产后端（长期方案）

---

**需要帮助？** 查看其他文档：
- [APK_BUILD_ANALYSIS.md](./APK_BUILD_ANALYSIS.md) - 问题分析
- [APK_FIX_SOLUTION.md](./APK_FIX_SOLUTION.md) - 详细解决方案
- [MANUAL_BUILD_GUIDE.md](./MANUAL_BUILD_GUIDE.md) - 手动构建指南
