#!/bin/bash
# 版本 0.5.0 构建脚本
# 用途：重新构建该版本的 Web 打包文件

set -e

VERSION="0.5.0"
PROJECT_ROOT="/workspace/projects"
RELEASE_DIR="${PROJECT_ROOT}/releases/${VERSION}"
CLIENT_DIR="${PROJECT_ROOT}/client"

echo "=========================================="
echo "开始构建版本 ${VERSION}"
echo "=========================================="
echo ""

# 检查版本号是否匹配
CURRENT_VERSION=$(grep '"version"' ${PROJECT_ROOT}/version.json | head -n 1 | cut -d'"' -f4)
if [ "$CURRENT_VERSION" != "$VERSION" ]; then
    echo "错误：当前项目版本为 ${CURRENT_VERSION}，但构建目标为 ${VERSION}"
    echo "请先切换到版本 ${VERSION} 或修改构建脚本"
    exit 1
fi

echo "✓ 版本号验证通过: ${VERSION}"
echo ""

# 清理旧的构建文件
echo "清理旧的构建文件..."
rm -rf ${RELEASE_DIR}/web
mkdir -p ${RELEASE_DIR}/web
echo "✓ 清理完成"
echo ""

# 导出 Web 版本
echo "导出 Web 版本..."
cd ${CLIENT_DIR}
npx expo export --platform web --output-dir ${RELEASE_DIR}/web

if [ $? -eq 0 ]; then
    echo "✓ Web 版本导出成功"
else
    echo "✗ Web 版本导出失败"
    exit 1
fi

echo ""

# 生成文件清单
echo "生成文件清单..."
cd ${RELEASE_DIR}
find . -type f -exec ls -lh {} \; | awk '{print $5, $9}' > MANIFEST.txt
echo "✓ 文件清单生成完成"
echo ""

# 显示构建结果
echo "=========================================="
echo "构建完成！"
echo "=========================================="
echo ""
echo "输出目录: ${RELEASE_DIR}/"
echo ""
echo "文件列表："
ls -lh ${RELEASE_DIR}/web/
echo ""
echo "总大小:"
du -sh ${RELEASE_DIR}/web/
echo ""
echo "✓ 版本 ${VERSION} 构建成功！"
