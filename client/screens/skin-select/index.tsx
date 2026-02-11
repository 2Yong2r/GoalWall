import React, { useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { Colors } from '@/constants/theme';

export default function SkinSelectScreen() {
  const { theme, skinType, setSkin, getAvailableSkins } = useTheme();
  const router = useSafeRouter();
  const styles = createStyles(theme);
  const availableSkins = getAvailableSkins();

  // 皮肤切换处理
  const handleSkinSelect = async (skinId: string) => {
    await setSkin(skinId as any);
    // 返回设置页面
    router.back();
  };

  // 获取皮肤主色
  const getSkinPrimaryColor = (skinId: string) => {
    const skinColors = Colors[skinId as keyof typeof Colors] as any;
    return skinColors?.primary;
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText variant="h2" color={theme.textPrimary}>皮肤配色</ThemedText>
          <ThemedText variant="body" color={theme.textSecondary}>
            选择你喜欢的主题风格
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {availableSkins.map((skin) => {
            const primaryColor = getSkinPrimaryColor(skin.id);
            if (!primaryColor) return null;

            const isSelected = skin.id === skinType;

            return (
              <TouchableOpacity
                key={skin.id}
                style={[
                  styles.skinCard,
                  isSelected && styles.skinCardSelected,
                  { backgroundColor: theme.backgroundDefault }
                ]}
                onPress={() => handleSkinSelect(skin.id)}
              >
                <View style={styles.skinCardLeft}>
                  {/* 皮肤图标 */}
                  <View style={[
                    styles.skinIcon,
                    { backgroundColor: primaryColor }
                  ]}>
                    <ThemedText variant="h3" style={styles.skinIconText}>
                      {skin.icon}
                    </ThemedText>
                  </View>

                  {/* 皮肤信息 */}
                  <View style={styles.skinInfo}>
                    <ThemedText variant="title" color={theme.textPrimary}>
                      {skin.name}
                    </ThemedText>
                    <ThemedText variant="small" color={theme.textSecondary}>
                      {skin.description}
                    </ThemedText>
                  </View>
                </View>

                {/* 选中标记 */}
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <FontAwesome6 name="check" size={16} color={theme.buttonPrimaryText} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Screen>
  );
}
