import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { syncManager } from '@/services/sync';

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

  // 只在非 idle 状态显示图标
  if (status.status === 'idle') {
    return null;
  }

  return (
    <View style={styles.container}>
      <FontAwesome6
        name={getStatusIcon() as any}
        size={18}
        color={getStatusColor()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
