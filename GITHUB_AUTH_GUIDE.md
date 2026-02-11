# GitHub 认证问题解决方案

## 问题原因

错误信息：`remote: Invalid username or token. Password authentication is not supported for Git operations.`

**原因**：GitHub 已停止支持密码认证，只支持以下方式：
- Personal Access Token (PAT)
- SSH 密钥
- GitHub CLI

---

## 解决方案 1：使用 Personal Access Token（推荐）⭐

### 步骤 1：创建 Personal Access Token

1. 登录 GitHub
2. 点击右上角头像 → Settings（设置）
3. 左侧菜单最下方 → Developer settings（开发者设置）
4. Personal access tokens → Tokens (classic)
5. 点击 "Generate new token (classic)"（生成新令牌）
6. 填写信息：
   - **Note**：输入描述，如 "Git Access"
   - **Expiration**：选择过期时间（推荐 30 天或 90 天）
   - **Select scopes**：勾选以下权限：
     - ✅ `repo`（完整的仓库访问权限）
     - ✅ `workflow`（GitHub Actions 权限）
7. 点击 "Generate token"（生成令牌）
8. **重要**：复制生成的 token（只显示一次！）

### 步骤 2：使用 Token 认证

#### 方式 A：修改远程仓库 URL（推荐）

```bash
cd /workspace/projects

# 查看当前远程仓库
git remote -v

# 修改远程仓库 URL（使用 token）
git remote set-url origin https://<TOKEN>@github.com/你的用户名/你的仓库名.git

# 推送代码
git push -u origin main
```

**示例：**
```bash
# 假设你的 token 是：ghp_xxxxxxxxxxxx
# 用户名是：zhangsan
# 仓库名是：my-app

git remote set-url origin https://ghp_xxxxxxxxxxxx@github.com/zhangsan/my-app.git
git push -u origin main
```

#### 方式 B：使用 Credential Helper（永久保存）

```bash
# 配置 Git 使用 token
git config --global credential.helper store

# 第一次推送时会提示输入用户名和密码
# 用户名：你的 GitHub 用户名
# 密码：你的 Personal Access Token

git push -u origin main
```

#### 方式 C：每次推送时输入（最安全）

```bash
# 推送时会提示输入用户名和密码
# 用户名：你的 GitHub 用户名
# 密码：你的 Personal Access Token

git push -u origin main
```

---

## 解决方案 2：使用 SSH 密钥（更安全）⭐⭐

### 步骤 1：生成 SSH 密钥

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 或使用 RSA（兼容性更好）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 按提示操作：
# - 保存路径：直接回车（使用默认路径）
# - 密码：可以留空（直接回车）
# - 确认密码：直接回车
```

### 步骤 2：查看并复制公钥

```bash
# 查看公钥
cat ~/.ssh/id_ed25519.pub

# 或
cat ~/.ssh/id_rsa.pub
```

复制输出的内容（从 `ssh-ed25519` 开始到邮箱结束）。

### 步骤 3：添加 SSH 密钥到 GitHub

1. 登录 GitHub
2. 点击右上角头像 → Settings
3. 左侧菜单 → SSH and GPG keys
4. 点击 "New SSH key"（新建 SSH 密钥）
5. **Title**：输入描述，如 "My Computer"
6. **Key**：粘贴刚才复制的公钥内容
7. 点击 "Add SSH key"

### 步骤 4：测试 SSH 连接

```bash
# 测试 SSH 连接
ssh -T git@github.com

# 成功时会看到：
# Hi username! You've successfully authenticated...
```

### 步骤 5：修改远程仓库 URL 为 SSH

```bash
cd /workspace/projects

# 查看当前远程仓库
git remote -v

# 修改为 SSH URL
git remote set-url origin git@github.com:你的用户名/你的仓库名.git

# 推送代码
git push -u origin main
```

---

## 解决方案 3：使用 GitHub CLI（最简单）⭐⭐⭐

### 步骤 1：安装 GitHub CLI

```bash
# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# 或使用 snap
sudo snap install gh
```

### 步骤 2：登录 GitHub

```bash
# 登录 GitHub
gh auth login

# 按提示操作：
# 1. What account do you want to log into? → GitHub.com
# 2. What is your preferred protocol for Git operations? → HTTPS
# 3. Authenticate Git with your GitHub credentials? → Yes
# 4. How would you like to authenticate GitHub CLI? → Login with a web browser
# 5. 按一次 Enter 复制代码
# 6. 在浏览器中打开 https://github.com/login/device
# 7. 输入代码并授权
```

### 步骤 3：推送代码

```bash
cd /workspace/projects
git push -u origin main
```

---

## 解决方案 4：使用环境变量（临时）

```bash
# 设置环境变量
export GIT_USERNAME="你的GitHub用户名"
export GIT_TOKEN="你的Personal_Access_Token"

# 使用环境变量推送
git push https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/你的用户名/你的仓库名.git
```

---

## 快速对比

| 方案 | 安全性 | 便利性 | 推荐度 |
|------|--------|--------|--------|
| Personal Access Token | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| SSH 密钥 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| GitHub CLI | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 环境变量 | ⭐⭐ | ⭐⭐ | ⭐⭐ |

---

## 推荐方案

### 🥇 最推荐：GitHub CLI
- ✅ 最简单
- ✅ 官方支持
- ✅ 安全性高
- ✅ 一次登录，永久有效

### 🥈 备选：SSH 密钥
- ✅ 最安全
- ✅ 无需输入密码
- ✅ 适合开发者

### 🥉 简单：Personal Access Token
- ✅ 配置简单
- ✅ 适合快速使用
- ⚠️ 需要定期更新 token

---

## 详细步骤：推荐方案

### 方案 A：使用 GitHub CLI（最简单）

```bash
# 1. 安装 GitHub CLI
sudo snap install gh

# 2. 登录
gh auth login

# 按提示操作：
# - 选择 GitHub.com
# - 选择 HTTPS
# - 选择浏览器登录
# - 复制代码到浏览器

# 3. 推送代码
cd /workspace/projects
git push -u origin main
```

### 方案 B：使用 Personal Access Token（最常用）

```bash
# 1. 在 GitHub 创建 Personal Access Token
# 访问：https://github.com/settings/tokens
# 生成 token 并复制

# 2. 修改远程仓库 URL
cd /workspace/projects
git remote set-url origin https://你的TOKEN@github.com/你的用户名/你的仓库名.git

# 3. 推送代码
git push -u origin main
```

### 方案 C：使用 SSH 密钥（最安全）

```bash
# 1. 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 查看公钥
cat ~/.ssh/id_ed25519.pub

# 3. 添加到 GitHub
# 访问：https://github.com/settings/ssh/new
# 粘贴公钥

# 4. 测试连接
ssh -T git@github.com

# 5. 修改远程仓库 URL
cd /workspace/projects
git remote set-url origin git@github.com:你的用户名/你的仓库名.git

# 6. 推送代码
git push -u origin main
```

---

## 常见问题

### Q: Token 过期了怎么办？
A: 重新生成新的 token，替换旧 token。

### Q: SSH 连接失败？
A: 检查密钥是否正确添加到 GitHub，测试连接：`ssh -T git@github.com`

### Q: 忘记密码/token？
A: 重新生成 token 或重新配置 SSH 密钥。

### Q: 如何查看当前配置？
A: 运行 `git remote -v` 查看远程仓库 URL。

---

## 下一步

选择一种方案后：

1. **配置认证**
2. **测试连接**
3. **推送代码**
4. **触发 GitHub Actions 构建**
5. **下载 APK**

祝你成功！🚀
