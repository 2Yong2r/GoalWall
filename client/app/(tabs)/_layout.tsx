import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.backgroundRoot,
          borderTopColor: theme.border,
          // 移动端：标准高度 50px + 底部安全区
          // Web端：固定60px，无需安全区
          height: Platform.OS === 'web' ? 60 : 50 + insets.bottom,
          // 移动端：内容区域底部 padding 防止内容被遮挡
          paddingBottom: Platform.OS === 'web' ? 0 : insets.bottom,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarItemStyle: {
          // **Web 兼容性强制规范**：Web 端必须显式指定 item 高度，防止 Tab Bar 高度塌陷或图标显示异常
          height: Platform.OS === 'web' ? 60 : undefined,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '目标',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="flag" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="todos"
        options={{
          title: '待办',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="list-check" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="gear" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
