import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import type { Goal } from '@/types';

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取目标列表
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/goals`);
      const result = await response.json();
      if (result.success) {
        setGoals(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [fetchGoals])
  );

  // 删除目标
  const handleDeleteGoal = async (id: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/goals/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setGoals(prev => prev.filter(g => g.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <TouchableOpacity
      style={styles.goalCard}
      onPress={() => router.push('/goal-detail', { goalId: item.id })}
    >
      <View style={styles.goalHeader}>
        <ThemedText variant="h4" color={theme.textPrimary}>{item.name}</ThemedText>
        <TouchableOpacity onPress={() => handleDeleteGoal(item.id)} style={styles.deleteButton}>
          <FontAwesome6 name="trash" size={16} color={theme.error} />
        </TouchableOpacity>
      </View>
      {item.description && (
        <ThemedText variant="body" color={theme.textSecondary} style={styles.goalDescription}>
          {item.description}
        </ThemedText>
      )}
    </TouchableOpacity>
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText variant="h2" color={theme.textPrimary}>我的目标</ThemedText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/goal-detail', { mode: 'create' })}
          >
            <FontAwesome6 name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={goals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchGoals} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="bullseye" size={64} color={theme.textMuted} />
              <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
                还没有目标，点击右上角创建一个吧
              </ThemedText>
            </View>
          }
        />
      </View>
    </Screen>
  );
}
