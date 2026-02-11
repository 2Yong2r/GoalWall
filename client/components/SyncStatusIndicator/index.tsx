import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { syncManager } from '@/services/sync';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function SyncStatusIndicator() {
  const { theme } = useTheme();
  const [status, setStatus] = React.useState(syncManager.getState());

  React.useEffect(() => {
    const unsubscribe = syncManager.subscribe((newState) => {
      setStatus(newState);
    });

    return unsubscribe;
  }, []);

  const getStatusColor = () => {
    switch (status.status) {
      case 'syncing':
        return theme.primary;
      case 'success':
        return theme.success;
      case 'error':
        return theme.error;
      default:
        return theme.textMuted;
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'syncing':
        return 'rotate';
      case 'success':
        return 'check-circle';
      case 'error':
        return 'exclamation-circle';
      default:
        return 'cloud';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'syncing':
        return '同步中...';
      case 'success':
        if (status.lastSyncTime) {
          return `上次同步：${formatDistanceToNow(new Date(status.lastSyncTime), {
            addSuffix: true,
            locale: zhCN,
          })}`;
        }
        return '已同步';
      case 'error':
        return status.errorMessage || '同步失败';
      default:
        return '等待同步';
    }
  };

  if (status.status === 'idle') {
    return null;
  }

  return (
    <View style={styles.container}>
      <FontAwesome6
        name={getStatusIcon() as any}
        size={12}
        color={getStatusColor()}
        style={styles.icon}
      />
      <ThemedText
        variant="caption"
        color={getStatusColor()}
        style={styles.text}
      >
        {getStatusText()}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {},
  text: {
    fontSize: 12,
  },
});
