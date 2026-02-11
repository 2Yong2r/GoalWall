# Android APK 构建方案总结

## 🎯 推荐方案（按优先级）

### 1️⃣ GitHub Actions（强烈推荐 ⭐⭐⭐⭐⭐）

**为什么推荐：**
- ✅ 完全免费
- ✅ GitHub 账户即可（大多数人都有）
- ✅ 自动化构建，每次推送代码自动构建
- ✅ 构建产物自动上传，可下载
- ✅ 无需本地配置环境

**快速开始：**
```bash
# 1. 初始化 Git 仓库（如果还没有）
cd /workspace/projects
git init
git add .
git commit -m "Initial commit"

# 2. 添加 GitHub 远程仓库
git remote add origin https://github.com/你的用户名/你的仓库.git

# 3. 推送代码（会自动触发构建）
git push -u origin main

# 4. 下载 APK
# 访问 GitHub 仓库 → Actions → 选择最近的构建 → 下载 Artifacts
```

**手动触发构建：**
1. 访问 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "Build Android APK"
4. 点击 "Run workflow" 按钮

**已配置：**
- ✅ GitHub Actions 工作流已创建：`.github/workflows/build-android.yml`
- ✅ 自动构建 Debug 和 Release APK
- ✅ 构建产物保留 30 天

---

### 2️⃣ 本地 Gradle 构建（推荐 ⭐⭐⭐⭐）

**为什么推荐：**
- ✅ 完全本地化，无需任何账户
- ✅ Android 项目已生成，可直接构建
- ✅ 提供快速构建脚本

**快速开始：**
```bash
# 使用提供的快速构建脚本
cd /workspace/projects/client
chmod +x quick-build-apk.sh
./quick-build-apk.sh
```

**手动构建：**
```bash
# 1. 安装 JDK 17
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk

# 2. 安装 Android SDK
mkdir -p ~/android-sdk
cd ~/android-sdk
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
unzip commandlinetools-linux-9477386_latest.zip
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/

export ANDROID_HOME=$HOME/android-sdk
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "ndk;25.1.8937393"

# 3. 构建 APK
cd /workspace/projects/client/android
./gradlew assembleDebug

# 4. 找到 APK
ls -lh app/build/outputs/apk/debug/app-debug.apk
```

**APK 位置：**
- Debug 版：`client/android/app/build/outputs/apk/debug/app-debug.apk`
- Release 版：`client/android/app/build/outputs/apk/release/app-release.apk`

---

### 3️⃣ Bitrise（推荐 ⭐⭐⭐⭐）

**为什么推荐：**
- ✅ 免费计划（100 分钟/月）
- ✅ GitHub 账户登录
- ✅ 友好的 UI
- ✅ 无需配置环境

**快速开始：**
1. 访问 https://www.bitrise.io/
2. 使用 GitHub 账号登录
3. 点击 "Add new app"
4. 选择你的 GitHub 仓库
5. 选择 "Android" 模板
6. 配置构建步骤：
   - npm install
   - npx expo prebuild --platform android
   - cd android && ./gradlew assembleDebug
7. 点击 "Start Build"
8. 下载构建的 APK

---

### 4️⃣ Codemagic（推荐 ⭐⭐⭐⭐）

**为什么推荐：**
- ✅ 免费计划（500 分钟/月）
- ✅ GitHub 账户登录
- ✅ 支持多种构建类型

**快速开始：**
1. 访问 https://codemagic.io/
2. 使用 GitHub 账号登录
3. 添加你的 GitHub 仓库
4. 选择 "React Native / Expo" 模板
5. 配置构建脚本：
   ```bash
   cd client
   npm install
   npx expo prebuild --platform android
   cd android
   ./gradlew assembleDebug
   ```
6. 启动构建
7. 下载 APK

---

## 📊 方案对比

| 方案 | 需要 | 免费额度 | 速度 | 难度 | 推荐度 |
|------|------|----------|------|------|--------|
| GitHub Actions | GitHub 账户 | 2000 分钟/月 | 快 | 简单 | ⭐⭐⭐⭐⭐ |
| 本地 Gradle | 无 | 无限制 | 中 | 中等 | ⭐⭐⭐⭐ |
| Bitrise | GitHub 账户 | 100 分钟/月 | 中 | 简单 | ⭐⭐⭐⭐ |
| Codemagic | GitHub 账户 | 500 分钟/月 | 中 | 简单 | ⭐⭐⭐⭐ |
| EAS Build | Expo 账户 | 有限 | 快 | 简单 | ⭐⭐⭐ |

---

## 🎓 如何选择？

### 我有 GitHub 账户，想要自动化 → **GitHub Actions**
- 免费且自动化
- 每次推送代码自动构建
- 最推荐

### 我不想用 GitHub，想要完全本地化 → **本地 Gradle 构建**
- 使用提供的快速构建脚本
- 完全本地化，无网络依赖
- 适合离线构建

### 我想要快速尝试，不想配置环境 → **Bitrise/Codemagic**
- 云端构建
- 免费计划足够使用
- 简单易用

---

## 📁 文件位置

### GitHub Actions
- 工作流文件：`.github/workflows/build-android.yml`

### 本地构建
- 快速构建脚本：`client/quick-build-apk.sh`
- Android 项目：`client/android/`

### 文档
- 完整指南：`client/ALTERNATIVE_BUILD_GUIDE.md`
- 原始指南：`client/BUILD_APK_GUIDE.md`

---

## 🚀 立即开始

### 选项 1：使用 GitHub Actions（推荐）

```bash
# 1. 初始化 Git 仓库
cd /workspace/projects
git init
git add .
git commit -m "Add Android build workflow"

# 2. 在 GitHub 创建新仓库
# 访问 https://github.com/new

# 3. 添加远程仓库
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 4. 推送代码（会自动触发构建）
git push -u origin main

# 5. 下载 APK
# 访问 GitHub 仓库 → Actions → 选择构建 → 下载 Artifacts
```

### 选项 2：使用本地构建脚本

```bash
# 运行快速构建脚本
cd /workspace/projects/client
chmod +x quick-build-apk.sh
./quick-build-apk.sh

# APK 会生成在：
# client/android/app/build/outputs/apk/debug/app-debug.apk
```

### 选项 3：手动本地构建

```bash
# 安装依赖
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk

# 构建
cd /workspace/projects/client/android
./gradlew assembleDebug

# 找到 APK
ls -lh app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 安装 APK 到手机

### 方法 1：USB 传输
```bash
# 使用 adb（如果已安装）
adb install app-debug.apk

# 或者直接传输文件
# 1. 连接手机到电脑（选择文件传输模式）
# 2. 复制 APK 文件到手机
# 3. 在手机上打开文件管理器
# 4. 点击 APK 文件安装
```

### 方法 2：网络传输
```bash
# 使用 Python HTTP 服务器
cd /workspace/projects/client/android/app/build/outputs/apk/debug
python3 -m http.server 8000

# 在手机浏览器访问：
# http://你的电脑IP:8000/app-debug.apk

# 下载并安装
```

### 方法 3：云存储
1. 上传 APK 到云盘（如 Google Drive、百度网盘）
2. 在手机上下载并安装

---

## ⚠️ 注意事项

### 启用未知来源安装
在安装 APK 前，需要在手机上启用"未知来源"安装：
- Android 8.0+：设置 → 安全 → 允许未知来源
- 或在安装时提示授权

### Debug APK vs Release APK
- **Debug APK**：用于测试，包含调试信息，体积较大
- **Release APK**：用于发布，已优化，体积较小

### 签名
- Debug APK 使用默认签名
- Release APK 需要配置签名（用于正式发布）

---

## 📞 需要帮助？

- 查看详细指南：`cat client/ALTERNATIVE_BUILD_GUIDE.md`
- 查看原始指南：`cat client/BUILD_APK_GUIDE.md`
- 查看快速脚本：`cat client/quick-build-apk.sh`

---

**祝你构建顺利！** 🎉
