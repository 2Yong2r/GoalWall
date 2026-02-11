import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';

interface VersionHistoryItem {
  version: string;
  releaseDate: string;
  description: string;
  filesModified: number;
  changeType: string;
}

interface VersionData {
  version: string;
  lastUpdated: string;
  totalFiles: number;
  thresholds: {
    minorVersionFiles: number;
    majorVersionFiles: number;
  };
  history: VersionHistoryItem[];
}

export default function VersionHistoryScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();
  const [versionData, setVersionData] = useState<VersionData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVersionHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/version`);
      const result = await response.json();
      if (result.success) {
        setVersionData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch version history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVersionHistory();
  }, [fetchVersionHistory]);

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case 'major':
        return '架构调整';
      case 'minor':
        return '新增功能';
      case 'patch':
        return '修复优化';
      default:
        return '未知';
    }
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'major':
        return theme.error;
      case 'minor':
        return theme.primary;
      case 'patch':
        return theme.success;
      default:
        return theme.textMuted;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            版本历史
          </ThemedText>
          <View style={{ width: 20 }} />
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <ThemedText variant="body" color={theme.textMuted} style={styles.loadingText}>
              加载中...
            </ThemedText>
          ) : versionData && versionData.history.length > 0 ? (
            versionData.history.map((item, index) => (
              <ThemedView key={item.version} level="default" style={styles.versionCard}>
                <View style={styles.versionHeader}>
                  <View style={styles.versionInfo}>
                    <ThemedText variant="h4" color={theme.textPrimary} style={styles.versionNumber}>
                      v{item.version}
                    </ThemedText>
                    <View style={[
                      styles.changeTypeBadge,
                      { backgroundColor: getChangeTypeColor(item.changeType) + '20' }
                    ]}>
                      <ThemedText variant="caption" color={getChangeTypeColor(item.changeType)}>
                        {getChangeTypeLabel(item.changeType)}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    {formatDate(item.releaseDate)}
                  </ThemedText>
                </View>

                <ThemedText variant="body" color={theme.textSecondary} style={styles.versionDescription}>
                  {item.description}
                </ThemedText>

                <View style={styles.versionFooter}>
                  <FontAwesome6 name="file-code" size={14} color={theme.textMuted} />
                  <ThemedText variant="caption" color={theme.textMuted}>
                    修改 {item.filesModified} 个文件
                  </ThemedText>
                </View>
              </ThemedView>
            ))
          ) : (
            <ThemedText variant="body" color={theme.textMuted} style={styles.loadingText}>
              暂无版本历史
            </ThemedText>
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}
