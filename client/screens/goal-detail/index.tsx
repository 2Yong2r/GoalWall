import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, FlatList, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable, Keyboard, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import type { Goal, Task } from '@/types';

export default function GoalDetailScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ goalId: string; mode?: 'create' }>();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');

  const isCreateMode = params.mode === 'create';
  const isEditingOrCreating = isCreateMode || isEditMode;

  // 获取目标详情
  const fetchGoalDetail = useCallback(async () => {
    if (!params.goalId || isCreateMode) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/goals/${params.goalId}`);
      const result = await response.json();
      if (result.success) {
        setGoal(result.data);
        setGoalName(result.data.name);
        setGoalDescription(result.data.description || '');
      }
    } catch (error) {
      console.error('Failed to fetch goal:', error);
    } finally {
      setLoading(false);
    }
  }, [params.goalId, isCreateMode]);

  // 获取目标任务
  const fetchTasks = useCallback(async () => {
    if (!params.goalId || isCreateMode) return;

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/tasks/goal/${params.goalId}`);
      const result = await response.json();
      if (result.success) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }, [params.goalId, isCreateMode]);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      fetchGoalDetail();
      fetchTasks();
    }, [fetchGoalDetail, fetchTasks])
  );

  // 开始编辑
  const handleStartEdit = () => {
    setIsEditMode(true);
    if (goal) {
      setGoalName(goal.name);
      setGoalDescription(goal.description || '');
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (goal) {
      setGoalName(goal.name);
      setGoalDescription(goal.description || '');
    }
  };

  // 保存目标
  const handleSaveGoal = async () => {
    if (!goalName.trim()) {
      alert('请输入目标名称');
      return;
    }

    try {
      const url = isCreateMode
        ? `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/goals`
        : `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/goals/${params.goalId}`;
      const method = isCreateMode ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: goalName.trim(),
          description: goalDescription.trim() || null,
        }),
      });

      const result = await response.json();
      if (result.success) {
        if (isCreateMode) {
          router.replace('/goal-detail', { goalId: result.data.id });
        } else {
          setGoal(result.data);
          setIsEditMode(false);
        }
      }
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  };

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

  // 添加新任务
  const handleAddTask = () => {
    router.push('/task-detail', { goalId: params.goalId, mode: 'create' });
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => router.push('/task-detail', { taskId: item.id })}
    >
      {/* 主要内容：描述 */}
      <View style={styles.taskMainContent}>
        <ThemedText variant="body" color={theme.textPrimary} style={styles.taskDescription}>
          {item.description}
        </ThemedText>
        <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={styles.deleteButton}>
          <FontAwesome6 name="trash" size={16} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* 属性标签：优先级 */}
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
  );

  if (loading && !goal && !isCreateMode) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
        <View style={styles.container}>
          <ThemedText>加载中...</ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <FontAwesome6 name="arrow-left" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <ThemedText variant="h3" color={theme.textPrimary}>
              {isCreateMode ? '创建目标' : isEditMode ? '编辑目标' : '目标详情'}
            </ThemedText>
            {!isCreateMode && !isEditMode && (
              <TouchableOpacity onPress={handleStartEdit} style={styles.editButton}>
                <FontAwesome6 name="pen" size={18} color={theme.textPrimary} />
              </TouchableOpacity>
            )}
          </View>

          {/* 创建/编辑模式：显示表单 */}
          {isEditingOrCreating ? (
            <View style={styles.createForm}>
              <ThemedView level="default" style={styles.formCard}>
                <View style={styles.formGroup}>
                  <ThemedText variant="body" color={theme.textSecondary} style={styles.label}>
                    目标名称 *
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    value={goalName}
                    onChangeText={setGoalName}
                    placeholder="请输入目标名称"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>

                <View style={styles.formGroup}>
                  <ThemedText variant="body" color={theme.textSecondary} style={styles.label}>
                    目标描述
                  </ThemedText>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={goalDescription}
                    onChangeText={setGoalDescription}
                    placeholder="请输入目标描述（可选）"
                    placeholderTextColor={theme.textMuted}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {isCreateMode ? (
                  <TouchableOpacity
                    style={[styles.saveButton, styles.fullWidthButton]}
                    onPress={handleSaveGoal}
                  >
                    <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>创建目标</ThemedText>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.editButtonGroup}>
                    <TouchableOpacity
                      style={[styles.saveButton, styles.cancelEditButton]}
                      onPress={handleCancelEdit}
                    >
                      <ThemedText variant="bodyMedium" color={theme.textSecondary}>取消</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveButton, styles.saveEditButton]}
                      onPress={handleSaveGoal}
                    >
                      <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>保存</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </ThemedView>
            </View>
          ) : (
            /* 查看模式：显示目标信息和任务列表 */
            <View style={styles.detailContent}>
              {/* 目标信息 */}
              <ThemedView level="default" style={styles.goalInfoCard}>
                <View style={styles.goalHeader}>
                  <ThemedText variant="h4" color={theme.textPrimary} style={styles.goalName}>
                    {goal?.name}
                  </ThemedText>
                </View>
                {goal?.description && (
                  <ThemedText variant="body" color={theme.textSecondary} style={styles.goalDescription}>
                    {goal.description}
                  </ThemedText>
                )}
              </ThemedView>

              {/* 任务列表 */}
              <View style={styles.tasksSection}>
                <View style={styles.tasksHeader}>
                  <ThemedText variant="h4" color={theme.textPrimary}>任务列表</ThemedText>
                  <TouchableOpacity onPress={handleAddTask} style={styles.addTaskButton}>
                    <FontAwesome6 name="plus" size={16} color={theme.primary} />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={tasks}
                  renderItem={renderTaskItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.tasksList}
                  scrollEnabled={true}
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
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
