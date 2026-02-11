import React, { useState, useCallback, useRef } from 'react';
import { View, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { createStyles } from './styles';
import type { Task } from '@/types';

export default function AllTasksScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  // 获取所有任务
  const fetchAllTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/tasks`);
      const result = await response.json();
      if (result.success) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      fetchAllTasks();
    }, [fetchAllTasks])
  );

  // 删除任务
  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个任务吗？此操作无法撤销。',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/tasks/${taskId}`, {
                method: 'DELETE',
              });
              const result = await response.json();
              if (result.success) {
                setTasks(prev => prev.filter(t => t.id !== taskId));
              }
            } catch (error) {
              console.error('Failed to delete task:', error);
            }
          },
        },
      ]
    );
  };

  // 渲染删除操作
  const renderRightActions = (taskId: string) => {
    return (
      <TouchableOpacity
        style={styles.swipeDeleteButton}
        onPress={() => {
          swipeableRefs.current.get(taskId)?.close();
          handleDeleteTask(taskId);
        }}
      >
        <FontAwesome6 name="trash" size={20} color="white" />
        <ThemedText variant="caption" color="white" style={{ marginTop: 4 }}>删除</ThemedText>
      </TouchableOpacity>
    );
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <Swipeable
      ref={(ref) => {
        if (ref) {
          swipeableRefs.current.set(item.id, ref);
        }
      }}
      renderRightActions={() => renderRightActions(item.id)}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
      onSwipeableClose={() => {
        // 当 Swipeable 关闭时清理引用
        swipeableRefs.current.delete(item.id);
      }}
    >
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => router.push('/task-detail', { taskId: item.id })}
        activeOpacity={0.7}
      >
        {/* 主要内容：描述 */}
        <View style={styles.taskMainContent}>
          <ThemedText variant="body" color={theme.textPrimary} style={styles.taskDescription}>
            {item.description}
          </ThemedText>
        </View>

        {/* 属性标签：优先级和目标 */}
        <View style={styles.taskAttributes}>
          <View style={[
            styles.priorityTag,
            item.priority === 'high' && { backgroundColor: '#F97316' },
            item.priority === 'medium' && { backgroundColor: '#3B82F6' },
            item.priority === 'low' && { backgroundColor: '#9CA3AF' },
          ]}>
            <ThemedText variant="caption" color="#FFFFFF">
              {item.priority === 'high' ? '高优先级' : item.priority === 'medium' ? '中优先级' : '低优先级'}
            </ThemedText>
          </View>
          {item.goalId && (
            <View style={styles.goalTag}>
              <FontAwesome6 name="flag" size={12} color={theme.primary} />
              <ThemedText variant="caption" color={theme.primary}>
                关联目标
              </ThemedText>
            </View>
          )}
        </View>

      {/* 进度条 */}
      <View style={styles.taskFooter}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${item.completionPercentage}%` }]} />
        </View>
        <ThemedText variant="caption" color={theme.textMuted}>
          {item.completionPercentage}%
        </ThemedText>
      </View>

      {/* 日期信息 */}
      {(item.startDate || item.endDate) && (
        <View style={styles.dateInfo}>
          {item.startDate && (
            <ThemedText variant="caption" color={theme.textMuted}>
              开始: {new Date(item.startDate).toLocaleDateString()}
            </ThemedText>
          )}
          {item.endDate && (
            <ThemedText variant="caption" color={theme.textMuted}>
              结束: {new Date(item.endDate).toLocaleDateString()}
            </ThemedText>
          )}
        </View>
      )}
    </TouchableOpacity>
    </Swipeable>
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText variant="h2" color={theme.textPrimary}>所有任务</ThemedText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/task-detail', { mode: 'create' })}
          >
            <FontAwesome6 name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tasksList}
          scrollEventThrottle={16}
          removeClippedSubviews={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="clipboard-list" size={48} color={theme.textMuted} />
              <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
                还没有任务，点击右上角添加
              </ThemedText>
            </View>
          }
        />
      </View>
    </Screen>
  );
}
