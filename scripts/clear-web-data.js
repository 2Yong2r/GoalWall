/**
 * 清除Web端本地数据脚本
 * 此脚本会清除存储在localStorage中的所有目标、任务和待办数据
 */

const path = require('path');
const fs = require('fs');

console.log('===== Web端数据清除工具 =====\n');

// 检查Web数据库存储目录
const webDbDir = path.join(__dirname, '..', 'client', '.expo', 'web');

console.log('1. 检查Web数据库目录...');
console.log(`   目录路径: ${webDbDir}`);

if (!fs.existsSync(webDbDir)) {
    console.log('   ✓ Web数据库目录不存在，无需清除');
    process.exit(0);
}

console.log('   ✓ Web数据库目录存在');

// 查找所有localStorage相关的文件
console.log('\n2. 扫描localStorage文件...');
const files = fs.readdirSync(webDbDir, { withFileTypes: true });

let localStorageFiles = [];
let totalFiles = 0;

for (const file of files) {
    if (file.isDirectory()) {
        const subDir = path.join(webDbDir, file.name);
        try {
            const subFiles = fs.readdirSync(subDir);
            for (const subFile of subFiles) {
                if (subFile.includes('localStorage') || subFile.includes('goalwall')) {
                    const filePath = path.join(subDir, subFile);
                    localStorageFiles.push(filePath);
                    console.log(`   - 找到: ${filePath}`);
                    totalFiles++;
                }
            }
        } catch (e) {
            // 忽略无法读取的目录
        }
    } else if (file.name.includes('localStorage') || file.name.includes('goalwall')) {
        const filePath = path.join(webDbDir, file.name);
        localStorageFiles.push(filePath);
        console.log(`   - 找到: ${filePath}`);
        totalFiles++;
    }
}

if (localStorageFiles.length === 0) {
    console.log('   ✓ 未找到localStorage数据文件，无需清除');
    process.exit(0);
}

console.log(`\n   共找到 ${localStorageFiles.length} 个文件需要清除`);

// 清除文件
console.log('\n3. 开始清除数据文件...');
let clearedCount = 0;

for (const filePath of localStorageFiles) {
    try {
        const stats = fs.statSync(filePath);
        const fileSizeKB = (stats.size / 1024).toFixed(2);

        // 删除文件
        fs.unlinkSync(filePath);
        console.log(`   ✓ 已清除: ${path.basename(filePath)} (${fileSizeKB} KB)`);
        clearedCount++;
    } catch (error) {
        console.log(`   ✗ 清除失败: ${path.basename(filePath)} - ${error.message}`);
    }
}

console.log(`\n4. 清除完成！`);
console.log(`   总计: ${localStorageFiles.length} 个文件`);
console.log(`   成功: ${clearedCount} 个`);
console.log(`   失败: ${localStorageFiles.length - clearedCount} 个`);

// 检查其他可能的缓存目录
console.log('\n5. 检查其他缓存目录...');
const cacheDirs = [
    path.join(__dirname, '..', 'client', '.expo', 'shared'),
    path.join(__dirname, '..', 'client', 'node_modules', '.cache'),
];

for (const cacheDir of cacheDirs) {
    if (fs.existsSync(cacheDir)) {
        console.log(`   - 找到缓存目录: ${cacheDir}`);
        console.log(`   ℹ️  如需彻底清除，可以手动删除此目录`);
    }
}

console.log('\n===== 清除完成 =====');
console.log('\n提示: 请刷新浏览器页面以清除内存中的数据');
