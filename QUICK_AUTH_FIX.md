# GitHub 认证错误快速解决 ⚡

## 错误信息
```
remote: Invalid username or token. Password authentication is not supported for Git operations.
```

## 原因
GitHub 已停止支持密码认证，需要使用：
- Personal Access Token (PAT)
- SSH 密钥
- GitHub CLI

---

## 🚀 三分钟快速解决

### 方案 1：使用 GitHub CLI（最简单，推荐）⭐⭐⭐

```bash
# 1. 安装 GitHub CLI
sudo snap install gh

# 2. 登录
gh auth login

# 按提示操作：
# - 选择 GitHub.com
# - 选择 HTTPS
# - 选择浏览器登录
# - 复制代码到浏览器授权

# 3. 推送代码
cd /workspace/projects
git push -u origin main
```

---

### 方案 2：使用 Personal Access Token（最常用）⭐⭐

#### 步骤 1：创建 Token

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选权限：
   - ✅ `repo`
   - ✅ `workflow`
4. 点击 "Generate token"
5. **复制 token**（只显示一次！）

#### 步骤 2：修改远程仓库 URL

```bash
cd /workspace/projects

# 将 <TOKEN> 替换为你的 token
# 将 <username> 替换为你的用户名
# 将 <repo> 替换为你的仓库名

git remote set-url origin https://<TOKEN>@github.com/<username>/<repo>.git

# 推送代码
git push -u origin main
```

**示例：**
```bash
git remote set-url origin https://ghp_xxxxxxxxxxxx@github.com/zhangsan/my-app.git
git push -u origin main
```

---

### 方案 3：使用 SSH 密钥（最安全）⭐⭐⭐

```bash
# 1. 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"
# 按回车使用默认设置

# 2. 查看公钥
cat ~/.ssh/id_ed25519.pub
# 复制输出内容

# 3. 添加到 GitHub
# 访问：https://github.com/settings/ssh/new
# 粘贴公钥，点击 Add SSH key

# 4. 测试连接
ssh -T git@github.com

# 5. 修改远程仓库 URL
cd /workspace/projects
git remote set-url origin git@github.com:<username>/<repo>.git

# 6. 推送代码
git push -u origin main
```

---

## 🎯 推荐方案

| 需求 | 推荐方案 |
|------|----------|
| **最简单** | GitHub CLI |
| **最常用** | Personal Access Token |
| **最安全** | SSH 密钥 |

---

## 💡 快速脚本（自动配置）

```bash
# 运行交互式脚本
cd /workspace/projects
chmod +x fix-git-auth.sh
./fix-git-auth.sh
```

---

## 📝 详细指南

查看完整指南：
```bash
cat /workspace/projects/GITHUB_AUTH_GUIDE.md
```

---

## ❓ 常见问题

**Q: Token 过期了怎么办？**
A: 重新生成新 token，替换旧 token。

**Q: 忘记密码/token？**
A: 重新生成 token 或配置 SSH 密钥。

**Q: 如何查看当前配置？**
A: 运行 `git remote -v`

---

## ✅ 验证成功

成功推送后，访问 GitHub 仓库：
1. 点击 "Actions" 标签
2. 查看构建状态
3. 下载 APK

---

**祝你成功！** 🚀
