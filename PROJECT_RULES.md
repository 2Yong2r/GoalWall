# 项目规则文件

> **重要说明**：本文件记录了在对话中发现的重要规则和最佳实践，请所有开发工作严格遵循。每次更新项目时，请检查并遵守这些规则。

## 数据库相关

### Schema 变更规范
- **强制要求**：修改 `server/src/storage/database/shared/schema.ts` 后，**必须**执行以下命令同步到数据库：
  ```bash
  coze-coding-ai db upgrade
  ```
- **禁止行为**：跳过数据库同步命令，否则会导致运行时错误
- **更新时间**：2026-02-11

## API 规范

### 路径前缀
- **强制要求**：所有 Express 后端 API 路径**必须**使用统一前缀 `/api/v1`
- **完整格式**：`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/{resource}`
- **禁止行为**：使用其他前缀或不使用前缀
- **示例**：
  - ✅ 正确：`/api/v1/todos`
  - ❌ 错误：`/todos`、`/api/v2/todos`

### API 调用注释规范
- **强制要求**：前端每个 fetch 请求前**必须**添加注释，说明服务端接口信息
- **注释格式**：
  ```typescript
  /**
   * 服务端文件：server/src/index.ts
   * 接口：GET /api/v1/tasks
   * Query 参数：status?: 'todo' | 'doing' | 'done'
   */
  ```
- **目的**：确保前端传递的参数与后端 API 期望一致

## 前后端分离规范

### 数据交互
- **禁止 Mock 数据**：前端**必须**调用真实的后端 API 接口获取数据
- **禁止占位符**：不得使用 Mock 数据、硬编码数据、模拟响应、本地假数据替代真实接口调用
- **禁止 TODO 注释**：凡是要实现的功能，**必须**完整交付，不能用 TODO 注释或占位代码

### 文件传输
- **前端上传**：必须使用 FormData，不能通过 JSON body 传递 Base64
- **使用工具**：必须使用 `@/utils` 中的 `createFormDataFile` 函数
- **后端处理**：使用 multer 接收得到 buffer
- **返回 URL**：如果需要公网访问，必须上传到对象存储并返回签名 URL

## 图片/媒体展示规范

### 禁止行为
- **禁止使用失效服务**：via.placeholder.com 已不可用
- **禁止伪装图片**：
  - 禁止使用「图标 + 文字」组合伪装成图片
  - 禁止使用「纯色/渐变色块 + 描述文字」伪装成图片
  - 禁止使用「空 View 容器 + 占位提示」伪装成图片

### 正确做法
```tsx
// ✅ 必须使用真实组件渲染
<Image source={{ uri: imageUrl }} style={styles.image} />
```

## 页面开发规范

### 开发顺序（强制）
```
1. 先创建 screens 页面  →  确保页面组件可正常渲染
2. 再创建 app 路由文件  →  re-export screens
3. 最后修改 layout 配置 →  添加 Tabs.Screen（如需 Tab）
```

### 路由文件格式
- **强制要求**：路由文件内容仅包含 re-export
- **格式**：
  ```tsx
  export { default } from "@/screens/{pageName}";
  ```

## 交互规范

### 左滑删除（统一方式）
- **强制要求**：目标、任务、待办列表的删除操作**必须**使用左滑方式
- **实现方式**：使用 `react-native-gesture-handler` 的 `Swipeable` 组件
- **删除按钮**：红色背景 (#EF4444)，带垃圾桶图标和"删除"文字
- **禁止行为**：使用点击删除按钮或其他删除方式

### 待办列表交互
- **点击条目**：进入待办编辑页面
- **点击圆圈图标**：标记完成/未完成

## 依赖使用规范

### expo-file-system
- **强制要求**：
  - 必须使用 `/legacy` 路径
  - 必须采用静态 import（文件顶部）
  - 使用 `as any` 绕过类型检查
- **示例**：
  ```tsx
  import * as FileSystem from 'expo-file-system/legacy';
  const content = await (FileSystem as any).readAsStringAsync(fileUri);
  ```

### 禁止动态导入
- **前后端均禁止**：使用 `import()` 或 `require()` 动态加载 JS/TS 依赖
- **必须使用**：文件顶部的静态 `import` 语句
- **服务端**：使用 ES Module 模式，不支持 CommonJS 的 `require()`

### 客户端静态资源引用
- **必须使用**：`require('...')` 方式引入 assets 下的本地图片
- **禁止行为**：使用相对路径字符串当作 `uri` 来引用本地文件

### 依赖包替换（强制）
**必须使用 Expo 官方库**的场景：

| 禁止使用 ❌ | 必须使用 ✅ | 功能 |
|------------|------------|------|
| `window.*` / `document.*` | RN 原生 API 或 Expo SDK | 浏览器 API |
| `localStorage` / `sessionStorage` | `@react-native-async-storage/async-storage` | 本地存储 |
| `react-native-haptic-feedback` | `expo-haptics` | 触觉反馈 |
| `@react-native-clipboard/clipboard` | `expo-clipboard` | 剪贴板 |
| `react-native-fast-image` | `expo-image` | 图片组件 |
| `react-native-audio-recorder-player` | `expo-av` | 录音/播放 |
| `react-native-permissions` | Expo 各模块自带的权限 API | 权限申请 |
| `react-native-chart-kit` | `react-native-gifted-charts` | 图表组件 |

## 瀑布流布局规范

### 宽高比要求
- **强制要求**：瀑布流数据的图片宽高比 **必须**在 0.7~1.4 之间随机生成
- **禁止行为**：全部使用 1:1 方图
- **目的**：验证交错排列的视觉效果

## 版本管理规范

### 版本号格式
- **格式要求**：采用 `x.x.x` 格式（主版本号.次版本号.修订号）
- **开发阶段**：当前处于开发阶段，主版本号固定为 `0`
- **版本号格式**：`0.x.x`
- **示例**：
  - ✅ 正确：`0.1.0`、`0.2.3`、`0.10.5`
  - ❌ 错误：`1.0.0`（开发阶段禁止）、`v0.1.0`（不要带前缀）

### 版本号含义
- **主版本号（0）**：项目处于开发阶段，尚未正式发布
- **次版本号**：新增功能或重大变更（如新增待办模块：0.1.0 → 0.2.0）
- **修订号**：Bug 修复或小改动（如修复删除功能：0.2.0 → 0.2.1）

### 升级时机
- **次版本号升级**：新增主要功能模块、重大架构调整
- **修订号升级**：Bug 修复、UI 调整、性能优化
- **主版本号升级**：项目正式发布 1.0.0 版本（当前阶段禁止）

## 环境变量规范

### 工作目录
- **位置**：`/workspace/projects/`
- **禁止修改**：绝对禁止修改或删除 `/workspace/projects/.coze` 文件

### 后端访问域名
- **环境变量**：`EXPO_PUBLIC_BACKEND_BASE_URL`
- **禁止修改**：绝对禁止使用 `export` 等命令进行修改
- **获取方式**：`echo $EXPO_PUBLIC_BACKEND_BASE_URL`
- **使用方式**：React Native 前端调用时直接使用 `process.env.EXPO_PUBLIC_BACKEND_BASE_URL`

## 文件操作规范

### 临时文件目录
- **默认目录**：`/tmp`（如果用户未指定目录）
- **禁止操作**：写入用户指定目录以外的位置

## 路由一致性规范

### Tabs 导航
- **强制要求**：`app/index.tsx` 优先级高于 `(tabs)/index.tsx`
- **删除规则**：当有 `(tabs)/index.tsx` 时，必须删除 `app/index.tsx`
- **路由文件**：`name` 必须与文件名完全一致

## 更新日志

- **2026-02-11**：创建初始规则文件，记录数据库更新、API 规范、前后端分离、图片展示、页面开发、交互、依赖使用等重要规则
- **2026-02-11**：添加版本管理规范，明确采用 0.x.x 格式，主版本号固定为 0
