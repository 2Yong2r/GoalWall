#!/bin/bash
# 快速设置 Android 构建环境并构建 APK

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=========================================="
echo "快速构建 Android APK"
echo "==========================================${NC}"
echo ""

# 检查 Java
if ! command -v java &> /dev/null; then
    echo -e "${YELLOW}[1/5] 未检测到 Java，正在安装 JDK 17...${NC}"
    sudo apt-get update > /dev/null 2>&1
    sudo apt-get install -y openjdk-17-jdk > /dev/null 2>&1
    echo -e "${GREEN}✓ JDK 17 安装完成${NC}"
else
    echo -e "${GREEN}[1/5] Java 已安装${NC}"
    java -version
fi
echo ""

# 检查 ANDROID_HOME
if [ -z "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}[2/5] 未检测到 Android SDK，正在安装...${NC}"
    mkdir -p ~/android-sdk
    cd ~/android-sdk

    # 下载 Command Line Tools
    if [ ! -f "cmdtools.zip" ]; then
        wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O cmdtools.zip
    fi

    # 解压并设置目录结构
    if [ ! -d "cmdline-tools/latest" ]; then
        unzip -q cmdtools.zip
        mkdir -p cmdline-tools/latest
        mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true
    fi

    # 设置环境变量
    export ANDROID_HOME=$HOME/android-sdk
    export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

    # 保存到 ~/.bashrc
    if ! grep -q "ANDROID_HOME" ~/.bashrc; then
        echo 'export ANDROID_HOME=$HOME/android-sdk' >> ~/.bashrc
        echo 'export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH' >> ~/.bashrc
    fi

    # 接受许可证
    yes | sdkmanager --licenses > /dev/null 2>&1 || true

    # 安装 SDK 组件
    sdkmanager "platform-tools" > /dev/null 2>&1
    sdkmanager "platforms;android-34" > /dev/null 2>&1
    sdkmanager "build-tools;34.0.0" > /dev/null 2>&1
    sdkmanager "ndk;25.1.8937393" > /dev/null 2>&1

    echo -e "${GREEN}✓ Android SDK 安装完成${NC}"
else
    echo -e "${GREEN}[2/5] Android SDK 已安装${NC}"
fi
echo ""

# 返回项目目录
cd /workspace/projects/client

# 检查是否已预构建
if [ ! -d "android" ]; then
    echo -e "${YELLOW}[3/5] 正在生成 Android 原生项目...${NC}"
    npx expo prebuild --platform android --clean > /dev/null 2>&1
    echo -e "${GREEN}✓ Android 原生项目已生成${NC}"
else
    echo -e "${GREEN}[3/5] Android 原生项目已存在${NC}"
fi
echo ""

# 构建 Debug APK
echo -e "${YELLOW}[4/5] 正在构建 Debug APK...${NC}"
cd android
./gradlew assembleDebug --quiet
echo -e "${GREEN}✓ Debug APK 构建完成${NC}"
echo ""

# 显示结果
echo -e "${GREEN}[5/5] 构建完成！${NC}"
echo ""
echo "=========================================="
echo "APK 文件位置："
echo "=========================================="
ls -lh app/build/outputs/apk/debug/app-debug.apk
echo ""
echo -e "${GREEN}=========================================="
echo "构建成功！${NC}"
echo "=========================================="
echo ""
echo "APK 文件：app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "下一步："
echo "1. 将 APK 文件传输到 Android 手机"
echo "2. 启用'未知来源'安装"
echo "3. 安装 APK 文件"
echo ""
