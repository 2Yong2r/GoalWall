import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { syncManager } from '@/services/sync';
import { createStyles } from './styles';

export default function SyncTestPage() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [logs, setLogs] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // 拦截 console.log 以捕获同步日志
  React.useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev.slice(-49), `[LOG] ${message}`]);
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev.slice(-49), `[ERROR] ${message}`]);
      originalError.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setLogs(prev => [...prev, '--- Starting sync ---']);

    try {
      await syncManager.sync();
      setLogs(prev => [...prev, '--- Sync completed ---']);
      setLastSyncTime(new Date().toLocaleTimeString());
      Alert.alert('成功', '同步完成');
    } catch (error) {
      setLogs(prev => [...prev, `--- Sync failed: ${error} ---`]);
      Alert.alert('失败', '同步失败，请查看日志');
    } finally {
      setIsSyncing(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="auto">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView level="root" style={styles.header}>
          <ThemedText variant="h3" color={theme.textPrimary}>同步测试页面</ThemedText>
          <ThemedText variant="small" color={theme.textSecondary}>
            手动触发同步并查看详细日志
          </ThemedText>
        </ThemedView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
            onPress={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText variant="smallMedium" color="#fff">立即同步</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.clearButton, { borderColor: theme.border }]}
            onPress={clearLogs}
          >
            <ThemedText variant="smallMedium" color={theme.textSecondary}>清空日志</ThemedText>
          </TouchableOpacity>
        </View>

        {lastSyncTime && (
          <ThemedView level="default" style={styles.infoBox}>
            <ThemedText variant="small" color={theme.textSecondary}>
              上次同步时间：{lastSyncTime}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView level="default" style={styles.logContainer}>
          <ThemedText variant="smallMedium" color={theme.textPrimary} style={styles.logTitle}>
            同步日志
          </ThemedText>
          <ScrollView style={styles.logContent} nestedScrollEnabled>
            {logs.length === 0 ? (
              <ThemedText variant="small" color={theme.textMuted}>
                暂无日志，点击&ldquo;立即同步&rdquo;按钮开始同步
              </ThemedText>
            ) : (
              logs.map((log, index) => (
                <ThemedText
                  key={index}
                  variant="caption"
                  color={log.startsWith('[ERROR]') ? theme.error : theme.textSecondary}
                  style={styles.logLine}
                >
                  {log}
                </ThemedText>
              ))
            )}
          </ScrollView>
        </ThemedView>

        <TouchableOpacity
          style={[styles.debugButton, { borderColor: theme.border }]}
          onPress={() => router.push('/debug')}
        >
          <ThemedText variant="smallMedium" color={theme.textSecondary}>
            返回调试页面
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}
