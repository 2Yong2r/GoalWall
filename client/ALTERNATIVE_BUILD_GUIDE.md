# Android APK 构建替代方案

## 方案对比

| 方案 | 需要注册 | 环境要求 | 速度 | 推荐度 |
|------|----------|----------|------|--------|
| EAS Build | ✅ Expo 账户 | 无 | 快 | ⭐⭐⭐⭐⭐ |
| 本地 Gradle | ❌ 无 | JDK + Android SDK | 中 | ⭐⭐⭐ |
| Expo Go 开发构建 | ✅ Expo 账户 | 无 | 快 | ⭐⭐⭐⭐ |
| Bitrise | ✅ GitHub 账户 | GitHub 仓库 | 中 | ⭐⭐⭐⭐ |
| Codemagic | ✅ 账户 | 无 | 中 | ⭐⭐⭐⭐ |
| GitHub Actions | ✅ GitHub 账户 | GitHub 仓库 | 快 | ⭐⭐⭐⭐⭐ |

## 方案一：本地 Gradle 构建（推荐 - 无需注册）

### 优势
- ✅ 完全本地化，无需任何账户
- ✅ 完全控制构建过程
- ✅ 可以立即开始（Android 项目已生成）

### 劣势
- ❌ 需要安装 JDK 和 Android SDK
- ❌ 首次配置较复杂
- ❌ 占用本地磁盘空间

### 详细步骤

#### 1. 安装 JDK 17

```bash
# 方法 A：使用 apt（推荐）
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk

# 验证安装
java -version

# 方法 B：从官网下载
wget https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_linux-x64_bin.tar.gz
tar -xzf openjdk-17.0.2_linux-x64_bin.tar.gz
export JAVA_HOME=$PWD/jdk-17.0.2
export PATH=$JAVA_HOME/bin:$PATH
```

#### 2. 安装 Android SDK

```bash
# 创建 SDK 目录
mkdir -p ~/android-sdk
cd ~/android-sdk

# 下载 Android Command Line Tools
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
unzip commandlinetools-linux-9477386_latest.zip

# 创建正确的目录结构
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/

# 设置环境变量
export ANDROID_HOME=$HOME/android-sdk
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

# 添加到 ~/.bashrc（永久生效）
echo 'export ANDROID_HOME=$HOME/android-sdk' >> ~/.bashrc
echo 'export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH' >> ~/.bashrc
source ~/.bashrc

# 接受许可证
yes | sdkmanager --licenses

# 安装必要的 SDK 组件
sdkmanager "platform-tools"
sdkmanager "platforms;android-34"
sdkmanager "build-tools;34.0.0"
sdkmanager "ndk;25.1.8937393"
```

#### 3. 构建 APK

```bash
cd /workspace/projects/client/android

# 构建调试版 APK（可测试）
./gradlew assembleDebug

# 构建发布版 APK（可发布）
./gradlew assembleRelease
```

#### 4. 找到 APK 文件

```bash
# 调试版
ls -lh app/build/outputs/apk/debug/app-debug.apk

# 发布版
ls -lh app/build/outputs/apk/release/app-release.apk
```

## 方案二：GitHub Actions（推荐 - 免费且自动化）

### 优势
- ✅ 免费使用
- ✅ GitHub 账户即可
- ✅ 自动化构建
- ✅ 可下载构建产物

### 劣势
- ❌ 需要 GitHub 仓库
- ❌ 需要推送到 GitHub

### 详细步骤

#### 1. 创建 GitHub 仓库

```bash
# 如果还没有 Git 仓库
cd /workspace/projects
git init
git add .
git commit -m "Initial commit"

# 创建 GitHub 仓库后，添加远程仓库
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### 2. 创建 GitHub Actions 工作流

创建文件：`.github/workflows/build-android.yml`

```yaml
name: Build Android APK

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch: # 允许手动触发

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: client/package-lock.json

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: Install dependencies
        run: |
          cd client
          npm ci

      - name: Prebuild Android
        run: |
          cd client
          npx expo prebuild --platform android --clean

      - name: Build Debug APK
        run: |
          cd client/android
          ./gradlew assembleDebug

      - name: Build Release APK
        run: |
          cd client/android
          ./gradlew assembleRelease

      - name: Upload Debug APK
        uses: actions/upload-artifact@v4
        with:
          name: app-debug
          path: client/android/app/build/outputs/apk/debug/app-debug.apk
          retention-days: 30

      - name: Upload Release APK
        uses: actions/upload-artifact@v4
        with:
          name: app-release
          path: client/android/app/build/outputs/apk/release/app-release.apk
          retention-days: 30

      - name: Create Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v1
        with:
          files: |
            client/android/app/build/outputs/apk/debug/app-debug.apk
            client/android/app/build/outputs/apk/release/app-release.apk
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### 3. 触发构建

**方式 A：推送代码**
```bash
git add .
git commit -m "Build APK"
git push
```

**方式 B：手动触发**
1. 打开 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "Build Android APK" 工作流
4. 点击 "Run workflow"

#### 4. 下载 APK

1. 打开 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择最近的构建
4. 在 "Artifacts" 部分下载 APK

## 方案三：Bitrise（免费云构建）

### 优势
- ✅ 免费计划（100 分钟/月）
- ✅ GitHub/GitLab/Bitbucket 集成
- ✅ 无需配置环境
- ✅ 友好的 UI

### 步骤

1. 访问 https://www.bitrise.io/
2. 使用 GitHub 账号登录
3. 添加仓库
4. 选择 "Android" 模板
5. 配置构建步骤
6. 启动构建
7. 下载 APK

## 方案四：Codemagic（免费云构建）

### 优势
- ✅ 免费计划（500 分钟/月）
- ✅ GitHub/GitLab/Bitbucket 集成
- ✅ 简单易用

### 步骤

1. 访问 https://codemagic.io/
2. 使用 GitHub 账号登录
3. 添加仓库
4. 选择 "React Native / Expo" 模板
5. 配置构建步骤
6. 启动构建
7. 下载 APK

## 方案五：Docker 构建（如果 Docker 可用）

### 优势
- ✅ 隔离环境
- ✅ 可重现构建

### Dockerfile

```dockerfile
FROM node:20

# 安装 JDK
RUN apt-get update && apt-get install -y openjdk-17-jdk

# 安装 Android SDK
RUN mkdir -p /opt/android-sdk
RUN wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O /tmp/cmdtools.zip
RUN unzip -q /tmp/cmdtools.zip -d /opt/android-sdk
RUN mkdir -p /opt/android-sdk/cmdline-tools/latest
RUN mv /opt/android-sdk/cmdline-tools/* /opt/android-sdk/cmdline-tools/latest/
RUN rm /tmp/cmdtools.zip

ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

# 接受许可证并安装 SDK
RUN yes | sdkmanager --licenses || true
RUN sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "ndk;25.1.8937393"

WORKDIR /workspace
```

### 构建命令

```bash
# 构建镜像
docker build -t expo-builder .

# 运行容器并构建
docker run --rm -v /workspace/projects:/workspace expo-builder \
  bash -c "cd client && npx expo prebuild --platform android --clean && cd android && ./gradlew assembleDebug"

# 复制 APK
docker cp <container-id>:/workspace/client/android/app/build/outputs/apk/debug/app-debug.apk ./
```

## 推荐方案

### 如果你有 GitHub 账户 → GitHub Actions
- ✅ 免费
- ✅ 无需额外配置
- ✅ 自动化
- ✅ 构建产物自动上传

### 如果不想用 GitHub → 本地 Gradle 构建
- ✅ 完全本地化
- ✅ 无需任何账户
- ✅ 完全控制
- ⚠️ 需要安装 JDK 和 Android SDK

### 如果想快速尝试 → Bitrise/Codemagic
- ✅ 云构建
- ✅ 免费计划
- ✅ 简单易用
- ⚠️ 需要账户

## 快速开始脚本

### 本地构建脚本

```bash
#!/bin/bash
# setup-android-build.sh

set -e

echo "=========================================="
echo "设置 Android 构建环境"
echo "=========================================="
echo ""

# 1. 安装 JDK
echo "[1/4] 安装 JDK 17..."
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk

java -version
echo "✓ JDK 安装完成"
echo ""

# 2. 安装 Android SDK
echo "[2/4] 安装 Android SDK..."
mkdir -p ~/android-sdk
cd ~/android-sdk

wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O cmdtools.zip
unzip -q cmdtools.zip
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/
rm cmdtools.zip

export ANDROID_HOME=$HOME/android-sdk
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

echo 'export ANDROID_HOME=$HOME/android-sdk' >> ~/.bashrc
echo 'export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH' >> ~/.bashrc

yes | sdkmanager --licenses > /dev/null 2>&1
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "ndk;25.1.8937393"

echo "✓ Android SDK 安装完成"
echo ""

# 3. 返回项目目录
cd /workspace/projects/client

# 4. 构建 APK
echo "[3/4] 构建 Debug APK..."
cd android
./gradlew assembleDebug

echo "✓ Debug APK 构建完成"
echo ""

# 5. 显示 APK 位置
echo "[4/4] APK 文件位置："
ls -lh app/build/outputs/apk/debug/app-debug.apk

echo ""
echo "=========================================="
echo "构建完成！"
echo "=========================================="
```

### GitHub Actions 设置脚本

```bash
#!/bin/bash
# setup-github-actions.sh

set -e

echo "=========================================="
echo "设置 GitHub Actions 构建环境"
echo "=========================================="
echo ""

# 1. 创建 GitHub Actions 目录
mkdir -p /workspace/projects/.github/workflows

# 2. 创建工作流文件
cat > /workspace/projects/.github/workflows/build-android.yml << 'EOF'
name: Build Android APK

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: client/package-lock.json

      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: Install dependencies
        run: |
          cd client
          npm ci

      - name: Prebuild Android
        run: |
          cd client
          npx expo prebuild --platform android --clean

      - name: Build Debug APK
        run: |
          cd client/android
          ./gradlew assembleDebug

      - name: Build Release APK
        run: |
          cd client/android
          ./gradlew assembleRelease

      - name: Upload Debug APK
        uses: actions/upload-artifact@v4
        with:
          name: app-debug
          path: client/android/app/build/outputs/apk/debug/app-debug.apk
          retention-days: 30

      - name: Upload Release APK
        uses: actions/upload-artifact@v4
        with:
          name: app-release
          path: client/android/app/build/outputs/apk/release/app-release.apk
          retention-days: 30
EOF

echo "✓ GitHub Actions 工作流已创建"
echo ""

# 3. 初始化 Git 仓库（如果需要）
if [ ! -d "/workspace/projects/.git" ]; then
  echo "初始化 Git 仓库..."
  cd /workspace/projects
  git init
  git add .
  git commit -m "Initial commit: Add GitHub Actions workflow"
  echo "✓ Git 仓库已初始化"
  echo ""
fi

echo "=========================================="
echo "设置完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 在 GitHub 创建新仓库"
echo "2. 添加远程仓库：git remote add origin <your-repo-url>"
echo "3. 推送代码：git push -u origin main"
echo "4. 在 GitHub Actions 页面触发构建"
echo "5. 下载构建产物中的 APK"
```

## 总结

| 需求 | 推荐方案 |
|------|----------|
| **完全免费，无需账户** | 本地 Gradle 构建 |
| **有 GitHub 账户，想要自动化** | GitHub Actions |
| **不想配置环境，想要快速构建** | Bitrise/Codemagic |
| **需要频繁构建** | GitHub Actions |
| **需要完全控制构建** | 本地 Gradle 构建 |

## 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Bitrise 文档](https://devcenter.bitrise.io/)
- [Codemagic 文档](https://docs.codemagic.io/)
- [Gradle 构建指南](https://developer.android.com/studio/build)
