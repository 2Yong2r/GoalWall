# GitHub Actions 缓存错误修复指南

## 错误信息

```
Some specified paths were not resolved, unable to cache dependencies.
```

## 错误原因

这个错误通常由以下原因引起：

1. **缓存路径不存在**：`cache-dependency-path` 指定的文件不存在
2. **缓存配置冲突**：`actions/setup-node` 的缓存与手动缓存冲突
3. **路径格式问题**：Windows 和 Linux 路径格式不同

## 解决方案

### 修改 1：移除 setup-node 的缓存配置

**修改前：**
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # ← 这个配置可能导致问题
    cache-dependency-path: client/package-lock.json  # ← 路径可能不存在
```

**修改后：**
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # 移除缓存配置
```

### 修改 2：使用独立的缓存步骤

**新增 Node 缓存步骤：**
```yaml
- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: |
      client/node_modules
      ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('client/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**新增 Expo 缓存步骤：**
```yaml
- name: Cache Expo
  uses: actions/cache@v4
  with:
    path: |
      ~/.expo
      ~/.expo-shared
    key: ${{ runner.os }}-expo-${{ hashFiles('client/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-expo-
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

      # 移除缓存配置，避免路径问题
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      # 保留 Gradle 缓存（这个通常没问题）
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      # 使用独立的缓存步骤
      - name: Cache node modules
        uses: actions/cache@v4
        with:
          path: |
            client/node_modules
            ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('client/package-lock.json') }}

      - name: Install dependencies
        run: |
          cd client
          npm ci

      - name: Cache Expo
        uses: actions/cache@v4
        with:
          path: |
            ~/.expo
            ~/.expo-shared
          key: ${{ runner.os }}-expo-${{ hashFiles('client/package-lock.json') }}

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

      - name: Upload Release APK
        uses: actions/upload-artifact@v4
        with:
          name: app-release
          path: client/android/app/build/outputs/apk/release/app-release.apk
```

## 其他可能的问题和解决方案

### 问题 1：package-lock.json 不存在

**解决方案：生成 package-lock.json**
```bash
cd /workspace/projects/client
npm install  # 生成 package-lock.json
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### 问题 2：缓存键冲突

**解决方案：使用时间戳作为缓存键的一部分**
```yaml
- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: client/node_modules
    key: ${{ runner.os }}-node-${{ github.sha }}
```

### 问题 3：禁用所有缓存（最简单）

如果缓存问题持续存在，可以暂时禁用所有缓存：

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

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          # 移除 cache: 'gradle'

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

      # ... 其他步骤
```

## 验证修复

### 步骤 1：提交修复

```bash
cd /workspace/projects
git add .github/workflows/build-android.yml
git commit -m "Fix GitHub Actions cache error"
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

## 预防措施

### 1. 确保 package-lock.json 存在

```bash
cd /workspace/projects/client
# 如果没有 package-lock.json，运行：
npm install

# 提交到仓库
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### 2. 使用相对路径

在缓存配置中，始终使用相对路径：
```yaml
path: |
  client/node_modules  # ✅ 相对路径
  ~/node_modules  # ✅ 绝对路径（用户主目录）
  /home/runner/node_modules  # ❌ 硬编码路径
```

### 3. 检查文件是否存在

在缓存前确保文件存在：
```yaml
- name: Check package-lock.json exists
  run: |
    if [ ! -f "client/package-lock.json" ]; then
      echo "Error: package-lock.json not found"
      exit 1
    fi

- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: client/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('client/package-lock.json') }}
```

## 常见错误和解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|----------|
| `path not found` | 缓存路径不存在 | 检查路径是否正确 |
| `cache key not found` | 缓存键未匹配 | 检查 hashFiles 路径 |
| `cache size exceeded` | 缓存大小超限 | 减少缓存内容 |
| `unable to cache` | 缓存服务异常 | 重试构建 |

## 总结

修复 GitHub Actions 缓存错误的关键点：

1. ✅ 移除 `actions/setup-node` 的 `cache` 配置
2. ✅ 使用独立的 `actions/cache@v4` 步骤
3. ✅ 确保缓存路径存在
4. ✅ 使用正确的缓存键格式
5. ✅ 必要时禁用缓存

---

**修复后，重新推送代码触发构建即可！** 🚀
