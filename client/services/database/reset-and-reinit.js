/**
 * 数据库重置脚本
 * 使用方法：在浏览器控制台中粘贴并执行此脚本
 */

async function resetDatabase() {
  if (typeof confirm !== 'undefined') {
    if (!confirm('确定要重置数据库吗？这将删除所有数据！')) {
      return;
    }
  }

  const STORAGE_PREFIX = '@goalwall_db_';

  try {
    // 获取所有 keys
    const allKeys = await AsyncStorage.getAllKeys();

    // 过滤出数据库相关的 keys
    const dbKeys = allKeys.filter(key => key.startsWith(STORAGE_PREFIX));

    console.log('Found', dbKeys.length, 'database keys');

    // 删除所有数据库相关的 keys
    if (dbKeys.length > 0) {
      await AsyncStorage.multiRemove(dbKeys);
      console.log('Database reset successful');
      alert('数据库已重置，请刷新页面');
    } else {
      console.log('No database keys found');
      alert('未找到数据库数据');
    }
  } catch (error) {
    console.error('Failed to reset database:', error);
    alert('重置失败: ' + error.message);
  }
}

// 执行重置
resetDatabase();
