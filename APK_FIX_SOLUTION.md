# APK 新建数据失败问题 - 完整解决方案

## 📋 问题概述

**现象**：在手机上安装 APK 后，无法新建目标、任务、待办。

**根本原因**：`EXPO_PUBLIC_BACKEND_BASE_URL` 环境变量在构建 APK 时未设置，导致所有 API 请求失败。

---

## 🔍 问题原因详解

### React Native 环境变量机制

在 Expo/React Native 中，`EXPO_PUBLIC_*` 环境变量在**构建时**被内联到 JavaScript Bundle 中：

```typescript
// 开发环境
fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/goals`)
// 实际请求：fetch('http://127.0.0.1:9091/api/v1/goals')

// 生产环境（未设置变量）
fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/goals`)
// 实际请求：fetch('undefined/api/v1/goals') ❌ 失败
```

### 当前配置分析

| 环境 | 后端地址 | 状态 |
|------|----------|------|
| 开发（Expo Go） | `http://127.0.0.1:9091` | ✅ 正常 |
| 生产（APK） | 未设置 | ❌ 失败 |

---

## 🎯 解决方案（按推荐顺序）

### ✅ 方案 1：GitHub Secrets 配置后端地址（推荐用于生产）

**适用场景**：有稳定的公网后端服务

**步骤**：

1. **部署后端到公网**
   - 使用 Railway、Render、Vercel 等服务
   - 或使用自己的服务器
   - 假设地址为：`https://goalwall-api.example.com`

2. **配置 GitHub Secrets**
   - 进入仓库：https://github.com/2Yong2r/GoalWall/settings/secrets/actions
   - 点击 "New repository secret"
   - 添加：
     - Name: `BACKEND_URL`
     - Secret: `https://goalwall-api.example.com`

3. **构建 APK**
   ```bash
   # 手动触发构建
   gh workflow run build-android.yml --ref main
   ```

**优点**：
- 配置简单，一次设置长期有效
- 适合生产环境
- 后端地址变更只需更新 Secret

**缺点**：
- 需要部署后端到公网

---

### ✅ 方案 2：本地构建 + ngrok（推荐用于测试）

**适用场景**：本地测试，无需部署后端

**步骤**：

1. **安装 ngrok**
   - 访问 https://ngrok.com/download
   - 下载并安装
   - 运行 `ngrok authtoken YOUR_TOKEN` 进行认证

2. **启动本地后端**
   ```bash
   cd /workspace/projects/server && pnpm run dev
   ```

3. **使用脚本构建 APK**
   ```bash
   cd /workspace/projects
   ./build-apk-with-ngrok.sh
   ```

**优点**：
- 无需部署后端
- 快速测试
- 适合开发阶段

**缺点**：
- ngrok URL 会变化，每次需要重新构建
- 不适合生产环境

---

### ✅ 方案 3：修改 GitHub Actions 临时地址（仅用于紧急测试）

**适用场景**：紧急测试，快速验证

**步骤**：

1. **编辑工作流文件**
   ```bash
   # 编辑 .github/workflows/build-android.yml
   # 找到这一行（约 77 行）：
   echo "url=https://your-api.example.com" >> $GITHUB_OUTPUT

   # 修改为临时测试地址（例如 ngrok 地址）：
   echo "url=https://abc123.ngrok.io" >> $GITHUB_OUTPUT
   ```

2. **提交并推送**
   ```bash
   git add .github/workflows/build-android.yml
   git commit -m "temp: 临时设置后端地址用于测试"
   git push
   ```

3. **触发构建**
   ```bash
   gh workflow run build-android.yml --ref main
   ```

**优点**：
- 快速验证问题

**缺点**：
- 不安全（URL 暴露在代码中）
- 不适合长期使用

---

## 🚀 快速修复（推荐立即执行）

### 使用 ngrok 本地测试（5 分钟）

1. **安装并启动 ngrok**
   ```bash
   # 安装 ngrok（如果已安装跳过）
   # https://ngrok.com/download

   # 启动 ngrok
   ngrok http 9091
   ```

2. **获取公网地址**
   - ngrok 会显示类似：`https://abc123.ngrok.io`

3. **修改 GitHub Actions**
   ```bash
   # 编辑 .github/workflows/build-android.yml
   # 修改第 77 行：
   echo "url=https://abc123.ngrok.io" >> $GITHUB_OUTPUT
   ```

4. **提交并构建**
   ```bash
   git add .github/workflows/build-android.yml
   git commit -m "fix: 设置临时后端地址用于测试"
   git push

   # 触发构建
   gh workflow run build-android.yml --ref main
   ```

5. **下载并测试**
   - 构建完成后下载 APK
   - 安装到手机测试

---

## 📚 相关文档

- [APK_BUILD_ANALYSIS.md](./APK_BUILD_ANALYSIS.md) - 详细问题分析
- [MANUAL_BUILD_GUIDE.md](./MANUAL_BUILD_GUIDE.md) - 手动构建指南
- [build-apk-with-ngrok.sh](./build-apk-with-ngrok.sh) - 本地构建脚本

---

## ✅ 验证清单

修复后，请验证：

- [ ] APK 安装后可以创建目标
- [ ] APK 安装后可以创建任务
- [ ] APK 安装后可以创建待办
- [ ] 数据正确保存到数据库
- [ ] 可以正常刷新数据列表

---

## 🐛 故障排查

### 问题 1：构建失败

**检查**：
```bash
# 查看构建日志
gh run view <run-id> --log

# 常见错误：
# - 后端 URL 格式错误（需要包含 http:// 或 https://）
# - ngrok 未运行
# - 后端服务未启动
```

### 问题 2：APK 安装后仍然失败

**检查**：
```bash
# 查看设备日志
adb logcat | grep "GoalWall"

# 或
adb logcat | grep "EXPO_PUBLIC_BACKEND_BASE_URL"
```

**可能原因**：
- 后端 URL 不正确
- 后端服务未启动
- 网络连接问题

### 问题 3：ngrok URL 变化

**解决**：
- ngrok 免费版 URL 会变化
- 使用 ngrok 专业版（固定 URL）
- 或使用 GitHub Secrets 配置固定后端地址

---

## 💡 最佳实践

1. **生产环境**
   - 使用 GitHub Secrets 配置后端 URL
   - 部署后端到稳定的公网服务
   - 使用 HTTPS 保障安全

2. **测试环境**
   - 使用 ngrok 本地测试
   - 或使用测试环境的后端服务

3. **开发环境**
   - 使用 Expo Go + 本地后端
   - 无需频繁构建 APK

---

**总结**：问题已定位并提供了三个解决方案。推荐使用 GitHub Secrets 配置后端地址（方案 1）或 ngrok 本地测试（方案 2）。
