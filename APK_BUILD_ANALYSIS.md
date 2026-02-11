# APK 无法新建数据问题分析与解决方案

## 🔍 问题分析

### 问题现象
在手机上安装 APK 后，无法新建目标、任务、待办。

### 根本原因

**环境变量未正确设置**

在 React Native 中，`EXPO_PUBLIC_*` 环境变量在**构建时**被内联到 JS bundle 中。如果在构建 APK 时没有设置 `EXPO_PUBLIC_BACKEND_BASE_URL`，打包后的应用中该变量为 `undefined` 或空字符串，导致所有 API 请求失败。

### 现状检查

#### 1. 开发环境
```bash
# dev_run.sh 中设置的环境变量
EXPO_PUBLIC_BACKEND_BASE_URL=${COZE_PROJECT_DOMAIN_DEFAULT:-http://127.0.0.1:9091}
```

✅ 开发时使用 `http://127.0.0.1:9091`，可以正常工作

#### 2. 生产环境（APK）
❌ GitHub Actions 构建时没有设置 `EXPO_PUBLIC_BACKEND_BASE_URL`

#### 3. API 调用代码
```typescript
// 所有 API 调用都使用这个环境变量
fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/goals`)
```

如果 `EXPO_PUBLIC_BACKEND_BASE_URL` 未设置，实际请求会变成：
```typescript
fetch(`undefined/api/v1/goals`)  // ❌ 失败
```

---

## 🎯 解决方案

### 方案一：GitHub Actions 构建时设置环境变量（推荐用于生产）

修改 `.github/workflows/build-android.yml`，在构建时设置后端 API 地址：

```yaml
# 生成 Android 原生项目
- name: Prebuild Android
  run: |
    cd client
    # 设置生产环境后端地址
    export EXPO_PUBLIC_BACKEND_BASE_URL=https://your-production-api.com
    npx expo prebuild --platform android --clean
```

**优点**：
- 配置简单
- 一次配置，所有 APK 都使用同一个后端

**缺点**：
- 需要部署后端到公网
- 后端地址变更需要重新构建 APK

---

### 方案二：用户可配置后端地址（推荐用于测试/开发）

创建一个配置页面，让用户在应用启动时输入后端 API 地址。

#### 优点：
- 灵活性高，用户可以使用自己的后端
- 适合测试和开发场景
- 无需重新构建 APK

#### 缺点：
- 需要开发配置页面
- 用户体验需要优化

---

### 方案三：使用固定的测试后端（不推荐）

在应用中硬编码一个测试后端地址。

#### 缺点：
- 安全性差
- 灵活性低
- 不适合生产环境

---

## 💡 推荐实施方案

### 立即修复：方案一（GitHub Actions 构建时设置环境变量）

由于当前环境是开发/测试环境，建议使用**方案一**，并在 GitHub Actions 中设置一个可访问的后端地址。

### 长期优化：方案二（用户可配置后端地址）

未来可以添加配置页面，提供更好的灵活性。

---

## 🔧 实施步骤（方案一）

### 步骤 1：部署后端到公网（或使用已有的公网后端）

可以使用以下服务：
- Railway
- Render
- Vercel（Express 后端）
- 自己的服务器

假设部署后的后端地址为：`https://goalwall-api.example.com`

### 步骤 2：修改 GitHub Actions 工作流

编辑 `.github/workflows/build-android.yml`：

```yaml
# 生成 Android 原生项目
- name: Prebuild Android
  run: |
    cd client
    # 设置生产环境后端地址
    export EXPO_PUBLIC_BACKEND_BASE_URL=https://goalwall-api.example.com
    npx expo prebuild --platform android --clean
```

### 步骤 3：重新构建 APK

```bash
# 手动触发 GitHub Actions 构建
gh workflow run build-android.yml --ref main
```

### 步骤 4：下载并测试新 APK

下载新构建的 APK，测试是否可以正常创建数据。

---

## 🛠️ 临时测试方案

在等待后端部署期间，可以使用以下方法测试：

### 方法 1：使用 ngrok 暴露本地后端

```bash
# 安装 ngrok
# https://ngrok.com/

# 启动 ngrok
ngrok http 9091

# 获取公网地址，例如：https://abc123.ngrok.io
```

然后修改 GitHub Actions 工作流：
```yaml
export EXPO_PUBLIC_BACKEND_BASE_URL=https://abc123.ngrok.io
```

**注意**：
- ngrok 免费版地址会变化
- 适合临时测试，不适合生产环境

### 方法 2：在开发环境使用 Expo Go

如果只是测试功能，可以使用 Expo Go 连接到开发服务器，而不是构建 APK：

```bash
# 启动 Expo 开发服务器
cd client
npx expo start

# 使用 Expo Go 扫描二维码连接
```

---

## 📋 验证清单

修复后，请验证以下内容：

- [ ] APK 安装后可以创建目标
- [ ] APK 安装后可以创建任务
- [ ] APK 安装后可以创建待办
- [ ] 数据正确保存到数据库
- [ ] 可以正常刷新数据列表
- [ ] 可以正常编辑和删除数据

---

## 🐛 调试技巧

如果问题仍然存在，可以使用以下方法调试：

### 1. 查看 APK 日志

```bash
# 使用 adb 查看日志
adb logcat | grep "GoalWall"

# 或者
adb logcat | grep "EXPO_PUBLIC_BACKEND_BASE_URL"
```

### 2. 在代码中添加调试信息

```typescript
// 在 API 调用前添加日志
console.log('API URL:', process.env.EXPO_PUBLIC_BACKEND_BASE_URL);
console.log('Full URL:', `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/goals`);
```

### 3. 使用 React Native Debugger

连接真机调试，查看网络请求：
- 打开 React Native Debugger
- 连接到应用
- 查看 Network 标签
- 查看请求 URL 和响应

---

## 📚 参考文档

- [Expo 环境变量](https://docs.expo.dev/guides/environment-variables/)
- [Expo 预构建](https://docs.expo.dev/build/introduction/)
- [React Native 网络请求](https://reactnative.dev/docs/network)

---

**总结**：问题的根本原因是 `EXPO_PUBLIC_BACKEND_BASE_URL` 环境变量在构建 APK 时未设置。解决方案是在 GitHub Actions 构建时设置正确的后端 API 地址。
