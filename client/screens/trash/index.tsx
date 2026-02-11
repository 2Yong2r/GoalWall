import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import type { Goal, Task } from '@/types';

type TrashItem = Goal | Task;

export default function TrashScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取回收站内容
  const fetchTrash = useCallback(async () => {
    setLoading(true);
    try {
      // 获取已删除的目标
      const goalsResponse = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/goals/trash/all`);
      const goalsResult = await goalsResponse.json();
      if (goalsResult.success) {
        setGoals(goalsResult.data);
      }

      // 获取已删除的任务
      const tasksResponse = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/tasks/trash/all`);
      const tasksResult = await tasksResponse.json();
      if (tasksResult.success) {
        setTasks(tasksResult.data);
      }
    } catch (error) {
      console.error('Failed to fetch trash:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTrash();
    }, [fetchTrash])
  );

  // 恢复目标
  const handleRestoreGoal = async (id: string) => {
    try {
      /**
       * 服务端文件：server/src/routes/goals.ts
       * 接口：POST /api/v1/goals/:id/restore
       * Path 参数：id: string
       */
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/goals/${id}/restore`, {
        method: 'POST',
      });
      const result = await response.json();
      if (result.success) {
        fetchTrash();
      }
    } catch (error) {
      console.error('Failed to restore goal:', error);
    }
  };

  // 彻底删除目标
  const handlePermanentDeleteGoal = async (id: string) => {
    Alert.alert(
      '彻底删除',
      '确定要彻底删除这个目标吗？此操作无法撤销，目标及其关联的任务将被永久删除。',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '彻底删除',
          style: 'destructive',
          onPress: async () => {
            try {
              /**
               * 服务端文件：server/src/routes/goals.ts
               * 接口：DELETE /api/v1/goals/:id/permanent
               * Path 参数：id: string
               */
              const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/goals/${id}/permanent`, {
                method: 'DELETE',
              });
              const result = await response.json();
              if (result.success) {
                fetchTrash();
              }
            } catch (error) {
              console.error('Failed to permanently delete goal:', error);
            }
          },
        },
      ]
    );
  };

  // 恢复任务
  const handleRestoreTask = async (id: string) => {
    try {
      /**
       * 服务端文件：server/src/routes/tasks.ts
       * 接口：POST /api/v1/tasks/:id/restore
       * Path 参数：id: string
       */
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/tasks/${id}/restore`, {
        method: 'POST',
      });
      const result = await response.json();
      if (result.success) {
        fetchTrash();
      }
    } catch (error) {
      console.error('Failed to restore task:', error);
    }
  };

  // 彻底删除任务
  const handlePermanentDeleteTask = async (id: string) => {
    Alert.alert(
      '彻底删除',
      '确定要彻底删除这个任务吗？此操作无法撤销。',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '彻底删除',
          style: 'destructive',
          onPress: async () => {
            try {
              /**
               * 服务端文件：server/src/routes/tasks.ts
               * 接口：DELETE /api/v1/tasks/:id/permanent
               * Path 参数：id: string
               */
              const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/tasks/${id}/permanent`, {
                method: 'DELETE',
              });
              const result = await response.json();
              if (result.success) {
                fetchTrash();
              }
            } catch (error) {
              console.error('Failed to permanently delete task:', error);
            }
          },
        },
      ]
    );
  };

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemLeft}>
          <FontAwesome6 name="flag" size={16} color={theme.primary} />
          <ThemedText variant="body" color={theme.textPrimary} style={styles.itemTitle}>
            {item.name}
          </ThemedText>
        </View>
        <ThemedText variant="caption" color={theme.textMuted}>
          目标
        </ThemedText>
      </View>
      {item.description && (
        <ThemedText variant="caption" color={theme.textSecondary} style={styles.itemDescription}>
          {item.description}
        </ThemedText>
      )}
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRestoreGoal(item.id)}
        >
          <FontAwesome6 name="rotate-left" size={16} color={theme.success} />
          <ThemedText variant="caption" color={theme.success}>恢复</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handlePermanentDeleteGoal(item.id)}
        >
          <FontAwesome6 name="ban" size={16} color={theme.error} />
          <ThemedText variant="caption" color={theme.error}>彻底删除</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemLeft}>
          <FontAwesome6 name="list-check" size={16} color={theme.primary} />
          <ThemedText variant="body" color={theme.textPrimary} style={styles.itemTitle}>
            {item.description}
          </ThemedText>
        </View>
        <ThemedText variant="caption" color={theme.textMuted}>
          任务
        </ThemedText>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRestoreTask(item.id)}
        >
          <FontAwesome6 name="rotate-left" size={16} color={theme.success} />
          <ThemedText variant="caption" color={theme.success}>恢复</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handlePermanentDeleteTask(item.id)}
        >
          <FontAwesome6 name="ban" size={16} color={theme.error} />
          <ThemedText variant="caption" color={theme.error}>彻底删除</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText variant="h2" color={theme.textPrimary}>回收站</ThemedText>
        </View>

        {goals.length === 0 && tasks.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="trash-can" size={64} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
              回收站为空
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={[...goals, ...tasks]}
            renderItem={({ item }: { item: any }) => {
              if ('name' in item) {
                return renderGoalItem({ item });
              } else {
                return renderTaskItem({ item });
              }
            }}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={goals.length > 0 ? (
              <ThemedText variant="caption" color={theme.textMuted} style={styles.sectionTitle}>
                目标 ({goals.length})
              </ThemedText>
            ) : null}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <FontAwesome6 name="trash-can" size={64} color={theme.textMuted} />
                <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
                  回收站为空
                </ThemedText>
              </View>
            }
          />
        )}
      </View>
    </Screen>
  );
}
