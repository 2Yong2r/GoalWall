#!/bin/bash

# APK 构建修复脚本 - 使用 ngrok 暴露本地后端
# 用途：在本地测试时使用 ngrok 暴露后端，构建可用的 APK

set -e

echo "======================================"
echo "  APK 构建修复方案（ngrok 版）"
echo "======================================"

# 检查 ngrok 是否安装
if ! command -v ngrok &> /dev/null; then
    echo "❌ 错误：ngrok 未安装"
    echo ""
    echo "请先安装 ngrok："
    echo "  1. 访问 https://ngrok.com/download"
    echo "  2. 下载并安装 ngrok"
    echo "  3. 运行 'ngrok authtoken YOUR_TOKEN' 进行认证"
    exit 1
fi

# 检查后端服务是否运行
if ! curl -s http://localhost:9091/api/v1/health > /dev/null 2>&1; then
    echo "❌ 错误：后端服务未运行"
    echo ""
    echo "请先启动后端服务："
    echo "  cd /workspace/projects/server && pnpm run dev"
    exit 1
fi

echo "✅ 后端服务运行正常"

# 启动 ngrok
echo ""
echo "启动 ngrok 暴露后端服务..."
NGROK_URL=$(ngrok http 9091 --log=stdout | grep -o 'https://[^ ]*' | head -1 &)

# 等待 ngrok 启动
sleep 5

# 获取 ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo "❌ 错误：无法获取 ngrok URL"
    exit 1
fi

echo "✅ ngrok URL: $NGROK_URL"
echo ""
echo "======================================"
echo "  开始构建 APK"
echo "======================================"
echo ""

# 进入 client 目录
cd /workspace/projects/client

# 设置环境变量
export EXPO_PUBLIC_BACKEND_BASE_URL="$NGROK_URL"

echo "使用后端地址: $EXPO_PUBLIC_BACKEND_BASE_URL"
echo ""

# 构建 APK
echo "正在生成 Android 原生项目..."
npx expo prebuild --platform android --clean

echo ""
echo "正在构建 APK..."
cd android
./gradlew assembleDebug --stacktrace

echo ""
echo "======================================"
echo "  构建完成！"
echo "======================================"
echo ""
echo "APK 文件位置："
echo "  client/android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "注意事项："
echo "  1. ngrok URL 会变化，每次需要重新构建 APK"
echo "  2. 此方案仅用于测试，不适用于生产环境"
echo "  3. ngrok 需要保持运行，APK 才能正常工作"
echo ""
echo "停止 ngrok："
echo "  pkill ngrok"
