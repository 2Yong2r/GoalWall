# 版本发布索引

## 已发布版本

| 版本 | 发布日期 | 类型 | 大小 | 状态 | SHA256 |
|------|----------|------|------|------|--------|
| 0.5.0 | 2026-02-11 | minor | 2.7 MB | ✅ 已发布 | 57014eef1b5bf263064336b96323d2506e416eb25e2509732a7df4845dc7bcb8 |

## 最新版本

**版本 0.5.0** (2026-02-11)

### 主要特性
- 重构目标详情页面，统一创建和编辑交互
- 移除编辑 Modal，直接切换模式
- 添加 KeyboardAvoidingView 优化键盘交互
- 页面标题动态变化

### 下载
- **压缩包**: `v0.5.0.tar.gz`
- **校验和**: `v0.5.0.tar.gz.sha256`

### 文档
- [README.md](./v0.5.0/README.md) - 版本详细说明
- [SUMMARY.md](./v0.5.0/SUMMARY.md) - 打包总结
- [PACKAGE_REPORT.md](./v0.5.0/PACKAGE_REPORT.md) - 打包报告
- [release-info.json](./v0.5.0/release-info.json) - 技术信息

## 部署指南

### 快速部署
```bash
# 1. 验证校验和
sha256sum -c v0.5.0.tar.gz.sha256

# 2. 解压
tar -xzf v0.5.0.tar.gz

# 3. 部署 Web 版本
cp -r v0.5.0/web/* /your/web/server/path/
```

### 验证部署
```bash
# 检查 index.html 是否存在
ls /your/web/server/path/index.html

# 检查静态资源
ls /your/web/server/path/_expo/static/js/web/
```

## 版本兼容性

| 版本 | 数据库兼容 | 向后兼容 | 备注 |
|------|------------|----------|------|
| 0.5.0 | ✅ 完全兼容 | ✅ 是 | 无需数据库迁移 |

## 常见问题

### Q: 如何验证下载文件的完整性？
A: 使用 SHA256 校验和验证：
```bash
sha256sum -c v0.5.0.tar.gz.sha256
```

### Q: 如何重新构建特定版本？
A: 使用版本目录中的构建脚本：
```bash
cd v0.5.0
./build.sh
```

### Q: Web 版本需要什么环境？
A: 现代浏览器（Chrome、Firefox、Safari、Edge 最新版本）

### Q: 如何部署到生产环境？
A: 参考 [PACKAGE_REPORT.md](./v0.5.0/PACKAGE_REPORT.md) 中的部署方式

## 维护说明

### 添加新版本
1. 创建新版本目录：`mkdir v0.x.0`
2. 导出 Web 版本：`npx expo export`
3. 生成文档和校验和
4. 更新本索引文件

### 版本命名规则
- 主版本号：重大功能变更或不兼容修改
- 次版本号：新功能或重要改进
- 修订号：Bug 修复或小改进

### 归档策略
- 保留最近 5 个版本
- 保留所有主版本（0.x, 1.x, 2.x...）
- 归档过期版本到 cold storage

---

**最后更新**: 2026-02-11
**维护者**: 开发团队
