# GitHub Actions 缓存错误修复指南（针对 pnpm 项目）

## 错误信息

```
Some specified paths were not resolved, unable to cache dependencies.
```

## 错误原因

1. **项目使用 pnpm 而不是 npm**：
   - 项目根目录有 `pnpm-lock.yaml` 而不是 `package-lock.json`
   - 工作流配置使用 `npm ci`，但实际包管理器是 `pnpm`

2. **缓存路径不存在**：
   - 工作流尝试缓存 `client/package-lock.json`，但该文件不存在
   - 正确的路径应该是根目录的 `pnpm-lock.yaml`

3. **缓存配置冲突**：
   - `actions/setup-node` 的缓存配置与 pnpm 不兼容

## 解决方案

### 修改 1：使用 pnpm 而不是 npm

**添加 pnpm setup 步骤：**
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 9
```

**修改缓存配置：**
```yaml
# 修改前（错误）
- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: |
      client/node_modules
      ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('client/package-lock.json') }}

# 修改后（正确）
- name: Cache pnpm dependencies
  uses: actions/cache@v4
  with:
    path: |
      ~/.pnpm-store
      client/node_modules
    key: ${{ runner.os }}-pnpm-${{ hashFiles('pnpm-lock.yaml') }}
```

**修改安装命令：**
```yaml
# 修改前（错误）
- name: Install dependencies
  run: |
    cd client
    npm ci

# 修改后（正确）
- name: Install dependencies
  run: |
    pnpm install --frozen-lockfile
```

## 完整修复后的工作流

```yaml
name: Build Android APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

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

      # ✅ 添加 pnpm setup
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      # ✅ 使用 pnpm 缓存
      - name: Cache pnpm dependencies
        uses: actions/cache@v4
        with:
          path: |
            ~/.pnpm-store
            client/node_modules
          key: ${{ runner.os }}-pnpm-${{ hashFiles('pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-

      # ✅ 使用 pnpm install
      - name: Install dependencies
        run: |
          pnpm install --frozen-lockfile

      - name: Cache Expo
        uses: actions/cache@v4
        with:
          path: |
            ~/.expo
            ~/.expo-shared
          key: ${{ runner.os }}-expo-${{ hashFiles('pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-expo-

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

      # ... 上传 APK 步骤
```

## 验证修复

### 步骤 1：提交修复

```bash
cd /workspace/projects
git add .github/workflows/build-android.yml
git commit -m "Fix: Use pnpm instead of npm for GitHub Actions"
git push
```

### 步骤 2：检查构建状态

1. 访问 GitHub 仓库
2. 点击 "Actions" 标签
3. 查看最新的构建
4. 检查是否还有缓存错误

### 步骤 3：下载 APK

如果构建成功：
1. 点击构建任务
2. 在 "Artifacts" 部分下载 APK

## 项目结构

### 使用 pnpm 的项目结构

```
/workspace/projects/
├── pnpm-lock.yaml  # ✅ pnpm 锁文件（在根目录）
├── client/
│   ├── package.json  # 客户端依赖配置
│   └── node_modules/  # 依赖安装位置
└── server/
    ├── package.json  # 服务端依赖配置
    └── node_modules/
```

### 使用 npm 的项目结构（对比）

```
/workspace/projects/
├── package-lock.json  # npm 锁文件
├── node_modules/  # 依赖安装位置
└── package.json
```

## 关键区别

| 特性 | npm | pnpm |
|------|-----|------|
| **锁文件位置** | 根目录 `package-lock.json` | 根目录 `pnpm-lock.yaml` |
| **依赖安装位置** | `node_modules/` | `node_modules/`（使用硬链接） |
| **缓存** | `~/.npm` | `~/.pnpm-store` |
| **安装命令** | `npm install` / `npm ci` | `pnpm install` |
| **工作空间** | npm workspaces | pnpm workspaces |

## 常见问题

### Q: 如何判断项目使用 pnpm 还是 npm？

**A: 检查根目录是否有以下文件：**
```bash
cd /workspace/projects
ls -la | grep lock
```

- 如果看到 `pnpm-lock.yaml` → 使用 pnpm
- 如果看到 `package-lock.json` → 使用 npm

### Q: 可以混用 npm 和 pnpm 吗？

**A: 不推荐**。应该统一使用一个包管理器，避免依赖混乱。

### Q: pnpm-lock.yaml 不存在怎么办？

**A: 生成它：**
```bash
cd /workspace/projects
pnpm install
git add pnpm-lock.yaml
git commit -m "Add pnpm-lock.yaml"
git push
```

## 修复检查清单

- [x] 检测项目使用 pnpm
- [x] 修改工作流使用 pnpm
- [x] 更新缓存路径
- [x] 更新安装命令
- [x] 提交并推送修复

## 其他可能的问题

### 问题 1：Gradle 缓存失败

**解决方案：**
```yaml
- name: Setup Java
  uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '17'
    # 移除 cache: 'gradle' 或确保缓存路径存在
```

### 问题 2：Android prebuild 失败

**解决方案：**
```yaml
- name: Prebuild Android
  run: |
    cd client
    npx expo prebuild --platform android --clean
  env:
    EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

### 问题 3：APK 构建失败

**解决方案：添加 --stacktrace 查看详细错误**
```yaml
- name: Build Debug APK
  run: |
    cd client/android
    ./gradlew assembleDebug --stacktrace
```

## 总结

修复 GitHub Actions 缓存错误的关键：

1. ✅ 确认项目使用的包管理器（pnpm 或 npm）
2. ✅ 使用对应的 setup action
3. ✅ 配置正确的缓存路径和键
4. ✅ 使用正确的安装命令
5. ✅ 确保锁文件存在

---

**修复后，重新推送代码即可触发构建！** 🚀
