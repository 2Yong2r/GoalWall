import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ToastProps {
  message: string;
  duration?: number; // 显示时长（毫秒），默认 3000ms
  visible: boolean;
  onHide?: () => void;
}

/**
 * Toast 提示组件
 * 用于显示简单的消息提示，自动淡出
 */
export function Toast({ message, duration = 3000, visible, onHide }: ToastProps) {
  const { theme } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // 显示：淡入
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 自动隐藏
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // 隐藏：立即重置透明度
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim, duration, onHide]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: theme.error },
          { opacity: fadeAnim },
        ]}
      >
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 9999,
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
