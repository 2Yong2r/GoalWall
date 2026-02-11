import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { createStyles } from './styles';
import type { Goal, Task } from '@/types';

interface GoalWithStats extends Goal {
  progress: number;
  startDate: Date | null;
  endDate: Date | null;
  taskCount: number;
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsWithStats, setGoalsWithStats] = useState<GoalWithStats[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

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

  // 获取所有任务
  const fetchAllTasks = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/tasks`);
      const result = await response.json();
      if (result.success) {
        setAllTasks(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }, []);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      fetchGoals();
      fetchAllTasks();
    }, [fetchGoals, fetchAllTasks])
  );

  // 计算每个目标的统计数据
  React.useEffect(() => {
    const newGoalsWithStats = goals.map(goal => {
      const goalTasks = allTasks.filter(t => t.goalId === goal.id);

      if (goalTasks.length === 0) {
        return {
          ...goal,
          progress: 0,
          startDate: null,
          endDate: null,
          taskCount: 0,
        } as GoalWithStats;
      }

      // 计算进度（简单平均：各任务进度总和 / 任务数）
      const progress = goalTasks.length > 0
        ? Math.round(goalTasks.reduce((sum, task) => sum + task.completionPercentage, 0) / goalTasks.length)
        : 0;

      // 计算日期范围
      const startDates = goalTasks
        .map(t => t.startDate)
        .filter((d): d is string => d !== null)
        .map(d => new Date(d).getTime());

      const endDates = goalTasks
        .map(t => t.endDate)
        .filter((d): d is string => d !== null)
        .map(d => new Date(d).getTime());

      const startDate = startDates.length > 0 ? new Date(Math.min(...startDates)) : null;
      const endDate = endDates.length > 0 ? new Date(Math.max(...endDates)) : null;

      return {
        ...goal,
        progress,
        startDate,
        endDate,
        taskCount: goalTasks.length,
      } as GoalWithStats;
    });
    setGoalsWithStats(newGoalsWithStats);
  }, [goals, allTasks]);

  // 删除目标
  const handleDeleteGoal = async (id: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个目标吗？此操作无法撤销。',
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
          },
        },
      ]
    );
  };

  // 拖拽完成后保存新的顺序
  const handleDragEnd = async ({ data }: { data: GoalWithStats[] }) => {
    setGoalsWithStats(data);

    // 保存新的顺序到后端
    const orders = data.map((item, index) => ({
      id: item.id,
      order: index + 1,
    }));

    try {
      /**
       * 服务端文件：server/src/routes/goals.ts
       * 接口：POST /api/v1/goals/reorder
       * Body 参数：orders: { id: string, order: number }[]
       */
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/goals/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders }),
      });
      const result = await response.json();
      if (result.success) {
        // 重新获取目标列表以更新原始 goals 数据
        fetchGoals();
      }
    } catch (error) {
      console.error('Failed to update goal orders:', error);
    }
  };

  // 渲染删除操作
  const renderRightActions = (goalId: string) => {
    return (
      <TouchableOpacity
        style={styles.swipeDeleteButton}
        onPress={() => {
          swipeableRefs.current.get(goalId)?.close();
          handleDeleteGoal(goalId);
        }}
      >
        <FontAwesome6 name="trash" size={20} color="white" />
        <ThemedText variant="caption" color="white" style={{ marginTop: 4 }}>删除</ThemedText>
      </TouchableOpacity>
    );
  };

  const renderGoalItem = ({ item, drag, isActive }: RenderItemParams<GoalWithStats>) => (
    <Swipeable
      ref={(ref) => {
        if (ref) {
          swipeableRefs.current.set(item.id, ref);
        }
      }}
      renderRightActions={() => renderRightActions(item.id)}
      overshootRight={false}
    >
      <ScaleDecorator>
        <TouchableOpacity
          style={[
            styles.goalCard,
            isActive && styles.goalCardActive,
          ]}
          onPress={() => router.push('/goal-detail', { goalId: item.id })}
          onLongPress={drag}
          activeOpacity={0.7}
        >
          <View style={styles.goalHeader}>
            <View style={styles.goalTitleContainer}>
              <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
                <FontAwesome6 name="grip-lines" size={20} color={theme.textMuted} />
              </TouchableOpacity>
              <ThemedText variant="h4" color={theme.textPrimary}>{item.name}</ThemedText>
            </View>
          </View>
        {item.description && (
          <ThemedText variant="body" color={theme.textSecondary} style={styles.goalDescription}>
            {item.description}
          </ThemedText>
        )}

        {/* 进度条 */}
        {item.taskCount > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <ThemedText variant="caption" color={theme.textMuted}>
                {item.taskCount} 个任务
              </ThemedText>
              <ThemedText variant="caption" color={theme.primary}>
                {item.progress}%
              </ThemedText>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
            </View>
          </View>
        )}

        {/* 日期范围 */}
        {(item.startDate || item.endDate) && (
          <View style={styles.dateRange}>
            <FontAwesome6 name="calendar-days" size={14} color={theme.textMuted} />
            {item.startDate && item.endDate ? (
              <ThemedText variant="caption" color={theme.textMuted} style={styles.dateRangeText}>
                {item.startDate.toLocaleDateString()} - {item.endDate.toLocaleDateString()}
              </ThemedText>
            ) : item.startDate ? (
              <ThemedText variant="caption" color={theme.textMuted} style={styles.dateRangeText}>
                开始: {item.startDate.toLocaleDateString()}
              </ThemedText>
            ) : item.endDate ? (
              <ThemedText variant="caption" color={theme.textMuted} style={styles.dateRangeText}>
                结束: {item.endDate.toLocaleDateString()}
              </ThemedText>
            ) : null}
          </View>
        )}
      </TouchableOpacity>
    </ScaleDecorator>
    </Swipeable>
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

        <DraggableFlatList
          data={goalsWithStats}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.id}
          onDragEnd={handleDragEnd}
          activationDistance={10}
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
