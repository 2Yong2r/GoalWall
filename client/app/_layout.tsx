import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from '@/contexts/ThemeContext';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
  // 添加其它想暂时忽略的错误或警告信息
]);

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="dark"></StatusBar>
          <Stack screenOptions={{
            // 设置所有页面的切换动画为从右侧滑入，适用于iOS 和 Android
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            // 隐藏自带的头部
            headerShown: false
          }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="goal-detail" options={{ title: "" }} />
            <Stack.Screen name="task-detail" options={{ title: "" }} />
            <Stack.Screen name="todo-detail" options={{ title: "" }} />
            <Stack.Screen name="version-history" options={{ title: "" }} />
            <Stack.Screen name="trash" options={{ title: "" }} />
            <Stack.Screen name="skin-select" options={{ title: "" }} />
          </Stack>
          <Toast />
        </GestureHandlerRootView>
      </ThemeProvider>
    </AuthProvider>
  );
}
