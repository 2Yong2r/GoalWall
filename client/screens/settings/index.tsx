import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';

interface VersionData {
  version: string;
  lastUpdated: string;
  totalFiles: number;
  thresholds: {
    minorVersionFiles: number;
    majorVersionFiles: number;
  };
  history: Array<{
    version: string;
    releaseDate: string;
    description: string;
    filesModified: number;
    changeType: string;
  }>;
}

export default function SettingsScreen() {
  const { theme, skinType, getSkinInfo } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();
  const [version, setVersion] = useState<string>('加载中...');

  // 获取版本信息
  const fetchVersion = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/version`);
      const result = await response.json();
      if (result.success) {
        setVersion(result.data.version);
      }
    } catch (error) {
      console.error('Failed to fetch version:', error);
      setVersion('未知');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchVersion();
    }, [fetchVersion])
  );

  // 获取当前皮肤信息
  const currentSkin = getSkinInfo();

  const menuItems = [
    {
      icon: 'palette',
      title: '皮肤配色',
      value: currentSkin.name,
      onPress: () => router.push('/skin-select'),
    },
    {
      icon: 'bell',
      title: '通知设置',
      onPress: () => {},
    },
  ];

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText variant="h2" color={theme.textPrimary}>设置</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <ThemedView level="default" style={styles.section}>
            <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
              通用设置
            </ThemedText>

            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index !== menuItems.length - 1 && styles.menuItemBorder
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuItemIcon}>
                    <FontAwesome6 name={item.icon as any} size={18} color={theme.primary} />
                  </View>
                  <ThemedText variant="body" color={theme.textPrimary}>
                    {item.title}
                  </ThemedText>
                </View>
                <View style={styles.menuItemRight}>
                  {item.value && (
                    <ThemedText variant="small" color={theme.textMuted} style={styles.menuValue}>
                      {item.value}
                    </ThemedText>
                  )}
                  <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </ThemedView>

          <ThemedView level="default" style={styles.section}>
            <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
              数据管理
            </ThemedText>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/trash')}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                  <FontAwesome6 name="trash-can" size={18} color={theme.primary} />
                </View>
                <ThemedText variant="body" color={theme.textPrimary}>
                  回收站
                </ThemedText>
              </View>
              <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                  <FontAwesome6 name="database" size={18} color={theme.primary} />
                </View>
                <ThemedText variant="body" color={theme.textPrimary}>
                  导出数据
                </ThemedText>
              </View>
              <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </ThemedView>

          <ThemedView level="default" style={styles.section}>
            <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
              应用信息
            </ThemedText>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {}}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                  <FontAwesome6 name="circle-info" size={18} color={theme.primary} />
                </View>
                <ThemedText variant="body" color={theme.textPrimary}>
                  关于应用
                </ThemedText>
              </View>
              <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemStatic]}
              onPress={() => router.push('/version-history')}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                  <FontAwesome6 name="tag" size={18} color={theme.primary} />
                </View>
                <ThemedText variant="body" color={theme.textPrimary}>
                  版本
                </ThemedText>
              </View>
              <View style={styles.menuItemRight}>
                <ThemedText variant="body" color={theme.textMuted}>
                  {version}
                </ThemedText>
                <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
              </View>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </View>
    </Screen>
  );
}
