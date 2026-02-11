import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { syncManager } from '@/services/sync';
import { createStyles } from './styles';

interface SyncLog {
  id: string;
  message: string;
  timestamp: string;
}

export default function SyncSettingsScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSyncInfo = useCallback(() => {
    const status = syncManager.getSyncStatus();
    setSyncStatus(status);
    setLastSyncTime(syncManager.getLastSyncTime());

    // 计算待同步数量（简单示例）
    setPendingCount(Math.floor(Math.random() * 5)); // 模拟数据

    // 加载同步日志
    setSyncLogs([
      {
        id: '1',
        message: '上次同步成功',
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  // 初始化
  useEffect(() => {
    const timer = setTimeout(() => loadSyncInfo(), 0);
    return () => clearTimeout(timer);
  }, [loadSyncInfo]);

  const handleManualSync = async () => {
    setSyncStatus('syncing');
    try {
      await syncManager.triggerSync();
      setSyncStatus('success');
      loadSyncInfo();
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Manual sync failed:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  };

  const handleClearLocalData = () => {
    // TODO: 实现清除本地数据逻辑
    console.log('Clear local data');
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return '同步中...';
      case 'success':
        return '同步成功';
      case 'error':
        return '同步失败';
      default:
        return '未同步';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return theme.primary;
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      default:
        return theme.textMuted;
    }
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome6 name="arrow-left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText variant="h3" color={theme.textPrimary}>
            同步设置
          </ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadSyncInfo} />
          }
        >
          {/* 同步状态卡片 */}
          <ThemedView level="default" style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <FontAwesome6 name="rotate" size={20} color={theme.primary} />
                <ThemedText variant="h4" color={theme.textPrimary} style={styles.cardTitle}>
                  同步状态
                </ThemedText>
              </View>
              <View style={styles.statusBadge}>
                <ThemedText variant="caption" color={theme.buttonPrimaryText}>
                  {getStatusText()}
                </ThemedText>
              </View>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <FontAwesome6 name="clock" size={16} color={theme.textMuted} />
                <ThemedText variant="body" color={theme.textSecondary}>
                  上次同步: {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : '从未同步'}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <FontAwesome6 name="cloud-arrow-up" size={16} color={theme.textMuted} />
                <ThemedText variant="body" color={theme.textSecondary}>
                  待同步数据: {pendingCount} 条
                </ThemedText>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.syncButton, { backgroundColor: theme.primary }]}
              onPress={handleManualSync}
              disabled={syncStatus === 'syncing'}
            >
              {syncStatus === 'syncing' ? (
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
                  同步中...
                </ThemedText>
              ) : (
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
                  立即同步
                </ThemedText>
              )}
            </TouchableOpacity>
          </ThemedView>

          {/* 自动同步设置 */}
          <ThemedView level="default" style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome6 name="gears" size={20} color={theme.primary} />
              <ThemedText variant="h4" color={theme.textPrimary} style={styles.cardTitle}>
                自动同步
              </ThemedText>
            </View>

            <View style={styles.cardContent}>
              <ThemedText variant="body" color={theme.textSecondary}>
                后台自动同步已启用，每 30 秒自动检查并同步数据。
              </ThemedText>
            </View>
          </ThemedView>

          {/* 数据管理 */}
          <ThemedView level="default" style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome6 name="database" size={20} color={theme.primary} />
              <ThemedText variant="h4" color={theme.textPrimary} style={styles.cardTitle}>
                数据管理
              </ThemedText>
            </View>

            <View style={styles.cardContent}>
              <ThemedText variant="body" color={theme.textSecondary} style={styles.description}>
                清除本地数据后，所有未同步的数据将丢失。请确保已同步到云端。
              </ThemedText>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearLocalData}
              >
                <FontAwesome6 name="trash" size={16} color="#EF4444" />
                <ThemedText variant="body" color="#EF4444">
                  清除本地数据
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* 同步日志 */}
          <ThemedView level="default" style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome6 name="list-ul" size={20} color={theme.primary} />
              <ThemedText variant="h4" color={theme.textPrimary} style={styles.cardTitle}>
                同步日志
              </ThemedText>
            </View>

            <View style={styles.cardContent}>
              {syncLogs.length === 0 ? (
                <ThemedText variant="body" color={theme.textMuted}>
                  暂无同步日志
                </ThemedText>
              ) : (
                syncLogs.map((log) => (
                  <View key={log.id} style={styles.logItem}>
                    <ThemedText variant="body" color={theme.textSecondary}>
                      {log.message}
                    </ThemedText>
                    <ThemedText variant="caption" color={theme.textMuted}>
                      {new Date(log.timestamp).toLocaleString()}
                    </ThemedText>
                  </View>
                ))
              )}
            </View>
          </ThemedView>
        </ScrollView>
      </View>
    </Screen>
  );
}
