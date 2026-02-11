# pnpm 版本冲突错误修复

## 错误信息

```
Error: Error: Multiple versions of pnpm specified:
  - version 9 in the GitHub Action config with the key "version"
  - version pnpm@9.0.0 in the package.json with the key "packageManager"
Remove one of these versions to avoid version mismatch errors like ERR_PNPM_BAD_PM_VERSION
```

## 错误原因

在 GitHub Actions 工作流中：
1. **工作流配置**指定了 `version: 9`
2. **package.json** 中指定了 `packageManager: "pnpm@9.0.0"`

两个版本不一致，导致冲突。

## 解决方案

### 方案 1：使用精确版本号（推荐）⭐

修改工作流，使用与 package.json 完全一致的版本号。

**修改前：**
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 9  # ← 不精确的版本号
```

**修改后：**
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: '9.0.0'  # ← 使用精确版本号，与 package.json 一致
```

### 方案 2：移除 version 参数

让 pnpm/action-setup 自动从 package.json 读取版本。

**修改前：**
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 9
```

**修改后：**
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  # ← 移除 version 参数，自动使用 package.json 中的版本
```

### 方案 3：修改 package.json（不推荐）

修改 package.json 中的版本号，使其更通用。

**修改前：**
```json
{
  "packageManager": "pnpm@9.0.0"
}
```

**修改后：**
```json
{
  "packageManager": "pnpm@9"
}
```

**不推荐原因**：
- 破坏了精确版本控制
- 可能导致不同环境使用不同的 pnpm 版本
- 不符合最佳实践

## 项目中的配置

### package.json（根目录）

```json
{
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "pnpm": ">=9.0.0"
  }
}
```

### 工作流文件（修复后）

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: '9.0.0'  # ← 与 package.json 一致
```

## 版本号对比

| 格式 | 说明 | 示例 |
|------|------|------|
| `9` | 主版本号（通用） | 可能安装 9.0.0, 9.1.0, 9.9.9 |
| `9.0.0` | 精确版本号 | 只安装 9.0.0 |
| `^9.0.0` | 兼容版本号 | 安装 9.x.x（不小于 9.0.0） |
| `~9.0.0` | 补丁版本兼容 | 安装 9.0.x（不小于 9.0.0） |

## 推荐做法

### 1. 在 package.json 中使用精确版本

```json
{
  "packageManager": "pnpm@9.0.0"  // ✅ 精确版本
}
```

### 2. 在 CI/CD 中使用相同的精确版本

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: '9.0.0'  // ✅ 与 package.json 一致
```

### 3. 或者移除 version 参数

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  // ✅ 自动读取 package.json 中的版本
```

## 验证修复

### 步骤 1：提交修复

```bash
cd /workspace/projects
git add .github/workflows/build-android.yml
git commit -m "fix: Use exact pnpm version 9.0.0 to match package.json"
git push
```

### 步骤 2：检查构建状态

1. 访问 GitHub 仓库
2. 点击 "Actions" 标签
3. 查看最新的构建
4. 检查是否还有版本冲突错误

### 步骤 3：下载 APK

如果构建成功：
1. 点击构建任务
2. 在 "Artifacts" 部分下载 APK

## 其他相关的 pnpm 错误

### ERR_PNPM_BAD_PM_VERSION

**错误信息**：
```
ERR_PNPM_BAD_PM_VERSION
```

**原因**：
pnpm 版本不符合 package.json 中的要求。

**解决方案**：
- 使用精确的 pnpm 版本
- 或更新 package.json 中的版本要求

### ERR_PNPM_VERSION_MISMATCH

**错误信息**：
```
ERR_PNPM_VERSION_MISMATCH
```

**原因**：
安装的 pnpm 版本与 package.json 中的版本不匹配。

**解决方案**：
- 重新安装 pnpm
- 使用正确的版本号

## 最佳实践

### 1. 使用精确版本号

✅ **推荐：**
```json
{
  "packageManager": "pnpm@9.0.0"
}
```

❌ **不推荐：**
```json
{
  "packageManager": "pnpm@9"
}
```

### 2. 在 CI/CD 中保持一致

✅ **推荐：**
```yaml
- uses: pnpm/action-setup@v4
  with:
    version: '9.0.0'  # 与 package.json 一致
```

❌ **不推荐：**
```yaml
- uses: pnpm/action-setup@v4
  with:
    version: 9  # 不精确
```

### 3. 定期更新依赖

定期检查和更新 pnpm 版本，但要在 CI/CD 和 package.json 中保持同步。

## 完整修复示例

### package.json

```json
{
  "name": "my-project",
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "pnpm": ">=9.0.0"
  }
}
```

### .github/workflows/build.yml

```yaml
jobs:
  build:
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - uses: pnpm/action-setup@v4
        with:
          version: '9.0.0'  # ← 精确版本

      - name: Install dependencies
        run: pnpm install
```

## 总结

修复 pnpm 版本冲突的关键：

1. ✅ 使用精确的版本号（如 `9.0.0` 而不是 `9`）
2. ✅ 在 CI/CD 和 package.json 中保持一致
3. ✅ 或者移除 CI/CD 中的 version 参数，自动读取
4. ✅ 避免使用不精确的版本号

---

**修复后，重新推送代码即可！** 🚀
