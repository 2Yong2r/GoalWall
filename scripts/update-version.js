#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 版本配置文件路径
const VERSION_FILE = path.join(__dirname, '../version.json');

// 读取版本配置
function readVersionConfig() {
  if (!fs.existsSync(VERSION_FILE)) {
    // 如果文件不存在，创建初始配置
    const initialConfig = {
      version: '0.0.0',
      lastUpdated: new Date().toISOString(),
      totalFiles: 0,
      thresholds: {
        minorVersionFiles: 5,
        majorVersionFiles: 20
      },
      history: []
    };
    fs.writeFileSync(VERSION_FILE, JSON.stringify(initialConfig, null, 2));
    return initialConfig;
  }
  return JSON.parse(fs.readFileSync(VERSION_FILE, 'utf-8'));
}

// 写入版本配置
function writeVersionConfig(config) {
  fs.writeFileSync(VERSION_FILE, JSON.stringify(config, null, 2));
}

// 解析版本号
function parseVersion(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major, minor, patch };
}

// 格式化版本号
function formatVersion(version) {
  return `${version.major}.${version.minor}.${version.patch}`;
}

// 增加版本号
function incrementVersion(currentVersion, changeType) {
  const { major, minor, patch } = parseVersion(currentVersion);

  switch (changeType) {
    case 'major':
      return { major: major + 1, minor: 0, patch: 0 };
    case 'minor':
      return { major, minor: minor + 1, patch: 0 };
    case 'patch':
    default:
      return { major, minor, patch: patch + 1 };
  }
}

// 获取修改的文件列表
function getModifiedFiles() {
  try {
    // 检查是否是 Git 仓库
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });

    // 获取已修改的文件
    const modified = execSync('git diff --name-only', { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);

    // 合并并去重
    const allModified = [...new Set([...modified, ...staged])];
    return allModified;
  } catch (error) {
    // 如果不是 Git 仓库，返回空数组
    return [];
  }
}

// 统计代码文件数量
function countCodeFiles(fileList) {
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
  return fileList.filter(file =>
    codeExtensions.some(ext => file.endsWith(ext)) &&
    !file.includes('node_modules') &&
    !file.includes('.expo') &&
    !file.includes('.coze')
  ).length;
}

// 确定版本变更类型
function determineChangeType(modifiedFileCount, totalFiles, thresholds) {
  // 检查是否有新模块创建（通过目录结构判断）
  try {
    execSync('git diff --name-only --diff-filter=A', { stdio: 'pipe' });
    // 如果有新文件添加，增加次版本号
    if (modifiedFileCount > 0) {
      return 'minor';
    }
  } catch (error) {
    // 忽略错误
  }

  // 根据文件数量判断
  if (modifiedFileCount >= thresholds.majorVersionFiles) {
    return 'major';
  } else if (modifiedFileCount >= thresholds.minorVersionFiles) {
    return 'minor';
  } else {
    return 'patch';
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const description = args[0] || '更新版本';

  // 读取当前配置
  const config = readVersionConfig();
  const currentVersion = config.version;

  // 获取修改的文件
  const modifiedFiles = getModifiedFiles();
  const modifiedCodeFiles = countCodeFiles(modifiedFiles);

  console.log('检测到修改的文件数量:', modifiedCodeFiles);

  // 确定变更类型
  let changeType = 'patch';
  if (args.includes('--major')) {
    changeType = 'major';
  } else if (args.includes('--minor')) {
    changeType = 'minor';
  } else if (modifiedCodeFiles > 0) {
    changeType = determineChangeType(modifiedCodeFiles, config.totalFiles, config.thresholds);
  } else {
    console.log('未检测到文件修改，保持当前版本');
    return;
  }

  // 计算新版本号
  const currentVersionObj = parseVersion(currentVersion);
  const newVersionObj = incrementVersion(currentVersionObj, changeType);
  const newVersion = formatVersion(newVersionObj);

  console.log(`当前版本: ${currentVersion}`);
  console.log(`变更类型: ${changeType}`);
  console.log(`新版本: ${newVersion}`);

  // 更新配置
  config.version = newVersion;
  config.lastUpdated = new Date().toISOString();

  // 添加到历史记录
  config.history.unshift({
    version: newVersion,
    releaseDate: new Date().toISOString(),
    description: description,
    filesModified: modifiedCodeFiles,
    changeType: changeType
  });

  // 只保留最近 50 条历史记录
  if (config.history.length > 50) {
    config.history = config.history.slice(0, 50);
  }

  // 保存配置
  writeVersionConfig(config);

  console.log(`\n✓ 版本已更新到 ${newVersion}`);
}

// 运行主函数
main();
