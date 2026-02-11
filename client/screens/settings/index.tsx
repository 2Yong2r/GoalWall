import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();

  const menuItems = [
    {
      icon: 'circle-info',
      title: '关于应用',
      onPress: () => {},
    },
    {
      icon: 'moon',
      title: '深色模式',
      onPress: () => {},
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
                <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </ThemedView>

          <ThemedView level="default" style={styles.section}>
            <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
              数据管理
            </ThemedText>

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

            <View style={[styles.menuItem, styles.menuItemStatic]}>
              <View style={styles.menuItemLeft}>
                <ThemedText variant="body" color={theme.textSecondary}>
                  版本
                </ThemedText>
              </View>
              <ThemedText variant="body" color={theme.textMuted}>
                1.0.0
              </ThemedText>
            </View>
          </ThemedView>
        </ScrollView>
      </View>
    </Screen>
  );
}
