#!/bin/bash
# GitHub 认证问题快速解决脚本

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================="
echo "GitHub 认证问题快速解决"
echo "==========================================${NC}"
echo ""

echo -e "${YELLOW}检测到认证错误：${NC}"
echo -e "${RED}remote: Invalid username or token. Password authentication is not supported for Git operations.${NC}"
echo ""
echo -e "${GREEN}GitHub 已停止支持密码认证，请选择以下解决方案：${NC}"
echo ""
echo "1) 使用 Personal Access Token (PAT) - 推荐"
echo "2) 使用 SSH 密钥 - 最安全"
echo "3) 使用 GitHub CLI - 最简单"
echo "4) 查看详细指南"
echo ""
read -p "请选择方案 (1/2/3/4): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}=========================================="
        echo "方案 1：使用 Personal Access Token"
        echo "==========================================${NC}"
        echo ""
        echo "请按以下步骤操作："
        echo ""
        echo "1. 登录 GitHub"
        echo "2. 访问：https://github.com/settings/tokens"
        echo "3. 点击 'Generate new token (classic)'"
        echo "4. 勾选 'repo' 和 'workflow' 权限"
        echo "5. 点击 'Generate token'"
        echo "6. 复制生成的 token（只显示一次！）"
        echo ""
        read -p "按回车键继续，然后粘贴你的 token: "
        read -p "请输入你的 Personal Access Token: " token
        read -p "请输入你的 GitHub 用户名: " username
        read -p "请输入你的仓库名: " repo_name

        echo ""
        echo -e "${YELLOW}正在配置 Git...${NC}"

        # 修改远程仓库 URL
        cd /workspace/projects
        git remote set-url origin https://${token}@github.com/${username}/${repo_name}.git

        echo -e "${GREEN}✓ 远程仓库 URL 已更新${NC}"
        echo ""
        echo "现在可以推送代码了："
        echo -e "${BLUE}git push -u origin main${NC}"
        echo ""
        ;;

    2)
        echo ""
        echo -e "${GREEN}=========================================="
        echo "方案 2：使用 SSH 密钥"
        echo "==========================================${NC}"
        echo ""
        echo "1. 生成 SSH 密钥"
        ssh-keygen -t ed25519 -C "your_email@example.com"

        echo ""
        echo -e "${YELLOW}2. 查看公钥${NC}"
        echo "请复制以下公钥："
        echo ""
        cat ~/.ssh/id_ed25519.pub
        echo ""

        read -p "按回车键继续，然后添加公钥到 GitHub..."

        echo ""
        echo "3. 添加 SSH 密钥到 GitHub"
        echo "   - 访问：https://github.com/settings/ssh/new"
        echo "   - 粘贴上面的公钥"
        echo "   - 点击 'Add SSH key'"
        echo ""

        read -p "添加完成后按回车键继续..."

        echo ""
        echo -e "${YELLOW}4. 测试 SSH 连接${NC}"
        ssh -T git@github.com || true

        read -p "请输入你的 GitHub 用户名: " username
        read -p "请输入你的仓库名: " repo_name

        echo ""
        echo -e "${YELLOW}正在配置 Git...${NC}"

        # 修改远程仓库 URL 为 SSH
        cd /workspace/projects
        git remote set-url origin git@github.com:${username}/${repo_name}.git

        echo -e "${GREEN}✓ 远程仓库 URL 已更新为 SSH${NC}"
        echo ""
        echo "现在可以推送代码了："
        echo -e "${BLUE}git push -u origin main${NC}"
        echo ""
        ;;

    3)
        echo ""
        echo -e "${GREEN}=========================================="
        echo "方案 3：使用 GitHub CLI"
        echo "==========================================${NC}"
        echo ""
        echo "1. 安装 GitHub CLI"

        # 检查是否已安装
        if command -v gh &> /dev/null; then
            echo -e "${GREEN}✓ GitHub CLI 已安装${NC}"
            gh --version
        else
            echo "正在安装 GitHub CLI..."
            sudo snap install gh || sudo apt-get install -y gh
        fi

        echo ""
        echo "2. 登录 GitHub"
        echo "运行以下命令："
        echo -e "${BLUE}gh auth login${NC}"
        echo ""
        echo "按提示操作："
        echo " - 选择 GitHub.com"
        echo " - 选择 HTTPS"
        echo " - 选择浏览器登录"
        echo " - 复制代码到浏览器"
        echo ""

        read -p "登录完成后按回车键..."

        echo ""
        echo -e "${GREEN}✓ 配置完成${NC}"
        echo ""
        echo "现在可以推送代码了："
        echo -e "${BLUE}git push -u origin main${NC}"
        echo ""
        ;;

    4)
        echo ""
        echo -e "${GREEN}=========================================="
        echo "详细指南"
        "==========================================${NC}"
        echo ""
        cat /workspace/projects/GITHUB_AUTH_GUIDE.md
        echo ""
        ;;

    *)
        echo -e "${RED}无效的选择${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}=========================================="
echo "配置完成！"
echo "==========================================${NC}"
echo ""
echo "下一步："
echo "1. 推送代码：git push -u origin main"
echo "2. 访问 GitHub Actions 下载 APK"
echo ""
