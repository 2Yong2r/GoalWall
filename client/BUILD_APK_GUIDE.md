# Android APK 构建指南

## 方法一：使用 EAS Build（推荐）

EAS Build 是 Expo 官方的云构建服务，无需本地配置 Android 环境。

### 前提条件
- Expo 账户（免费）
- 已登录 Expo CLI

### 步骤

#### 1. 登录 Expo 账户
```bash
cd /workspace/projects/client
npx expo login
```

#### 2. 配置 EAS 构建
项目已配置 `eas.json` 文件，包含以下构建配置：
- `preview` - 预览版本（APK 格式）
- `production` - 生产版本（APK 格式）

#### 3. 构建 APK

##### 预览版本（快速测试）
```bash
npx eas build --platform android --profile preview
```

##### 生产版本（正式发布）
```bash
npx eas build --platform android --profile production
```

#### 4. 下载 APK
构建完成后，EAS 会提供下载链接：
- 在浏览器中打开提供的链接
- 下载 APK 文件到本地
- 在 Android 手机上安装

### 构建时间
- 首次构建：约 15-30 分钟
- 后续构建：约 10-20 分钟

## 方法二：本地构建（需要 Android 环境）

### 前提条件
- JDK 17 或更高版本
- Android SDK
- Android Studio SDK Build-Tools 34.0.0
- Android NDK 25.1.8937393

### 步骤

#### 1. 安装依赖
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y default-jdk

# 下载 Android SDK
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
unzip commandlinetools-linux-9477386_latest.zip
sudo mv cmdline-tools /usr/local/lib/android-sdk
export ANDROID_HOME=/usr/local/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# 接受许可证
yes | sdkmanager --licenses

# 安装必要的 SDK 组件
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "ndk;25.1.8937393"
```

#### 2. 预构建项目（已完成）
```bash
cd /workspace/projects/client
npx expo prebuild --platform android --clean
```

#### 3. 构建调试版 APK
```bash
cd android
./gradlew assembleDebug
```

生成的 APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

#### 4. 构建发布版 APK
```bash
cd android
./gradlew assembleRelease
```

生成的 APK 位置：`android/app/build/outputs/apk/release/app-release.apk`

## 方法三：使用 Expo Application Services (EAS)

### 步骤

#### 1. 配置项目
确保 `eas.json` 已正确配置。

#### 2. 初始化 EAS 项目（首次使用）
```bash
npx eas build:configure
```

#### 3. 构建 APK
```bash
# 构建 APK（预览版）
npx eas build --platform android --profile preview

# 构建 APK（生产版）
npx eas build --platform android --profile production
```

## 当前环境状态

### 已完成
- ✅ Android 原生项目已生成（`/workspace/projects/client/android/`）
- ✅ EAS 配置文件已创建（`eas.json`）
- ✅ Expo 配置文件已就绪（`app.config.ts`）

### 缺失
- ❌ Java JDK（需要安装）
- ❌ Android SDK（需要安装）
- ❌ Expo 账户登录（需要登录）

## 推荐方案

**使用 EAS Build**，原因：
1. 无需配置本地 Android 环境
2. 构建速度快，使用云端资源
3. 支持持续集成
4. 免费（每月有限制）

## 构建脚本

创建自动化构建脚本：

```bash
#!/bin/bash
# build-apk.sh

echo "开始构建 Android APK..."

cd /workspace/projects/client

# 检查登录状态
if ! npx expo whoami > /dev/null 2>&1; then
    echo "请先登录 Expo 账户"
    npx expo login
fi

# 构建 APK
echo "开始 EAS 构建..."
npx eas build --platform android --profile preview

echo "构建完成！请查看提供的下载链接。"
```

## 常见问题

### Q: EAS 构建失败怎么办？
A: 检查以下内容：
1. Expo 账户是否已登录
2. `eas.json` 配置是否正确
3. 项目依赖是否完整

### Q: 本地构建报错？
A: 确保：
1. JDK 版本正确（17+）
2. Android SDK 版本正确（34.0.0）
3. 环境变量正确设置

### Q: APK 无法安装？
A: 检查：
1. Android 版本是否支持
2. 是否启用了"未知来源"安装
3. APK 是否签名

## 下一步

1. 选择构建方法（推荐 EAS Build）
2. 执行构建命令
3. 下载 APK 文件
4. 在 Android 手机上测试

## 相关文档

- [EAS Build 官方文档](https://docs.expo.dev/build/introduction/)
- [Expo 预构建文档](https://docs.expo.dev/workflow/prebuild/)
- [Android 本地构建文档](https://docs.expo.dev/build/introduction/)
