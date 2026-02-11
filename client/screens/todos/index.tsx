import React, { useState, useCallback, useRef } from 'react';
import { View, TouchableOpacity, FlatList, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { createStyles } from './styles';
import type { Todo } from '@/types';

type ViewMode = 'timeline' | 'upcoming' | 'monthly';

export default function TodosScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  // 获取待办列表
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/todos`;
      if (viewMode === 'upcoming') {
        url += '/upcoming?days=7';
      } else if (viewMode === 'monthly') {
        const now = new Date();
        url += `/monthly?year=${now.getFullYear()}&month=${now.getMonth() + 1}`;
      }
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setTodos(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  // 页面聚焦或视图模式切换时刷新数据
  useFocusEffect(
    useCallback(() => {
      fetchTodos();
    }, [fetchTodos])
  );

  // 切换待办状态
  const handleToggleTodo = async (todoId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, completedAt }),
      });
      const result = await response.json();
      if (result.success) {
        setTodos(prev => prev.map(t =>
          t.id === todoId ? { ...t, status: newStatus, completedAt } : t
        ));
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  // 删除待办
  const handleDeleteTodo = async (todoId: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个待办吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/todos/${todoId}`, {
                method: 'DELETE',
              });
              const result = await response.json();
              if (result.success) {
                setTodos(prev => prev.filter(t => t.id !== todoId));
              }
            } catch (error) {
              console.error('Failed to delete todo:', error);
            }
          },
        },
      ]
    );
  };

  // 获取优先级标签样式
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      case 'low': return styles.priorityLow;
      default: return styles.priorityLow;
    }
  };

  // 获取优先级文本
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '低';
    }
  };

  // 渲染删除操作
  const renderRightActions = (todoId: string) => {
    return (
      <TouchableOpacity
        style={styles.swipeDeleteButton}
        onPress={() => {
          swipeableRefs.current.get(todoId)?.close();
          handleDeleteTodo(todoId);
        }}
      >
        <FontAwesome6 name="trash" size={20} color="white" />
        <ThemedText variant="caption" color="white">删除</ThemedText>
      </TouchableOpacity>
    );
  };

  // 渲染待办项
  const renderTodoItem = ({ item }: { item: Todo }) => (
    <Swipeable
      ref={(ref) => {
        if (ref) {
          swipeableRefs.current.set(item.id, ref);
        }
      }}
      renderRightActions={() => renderRightActions(item.id)}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[
          styles.todoCard,
          item.status === 'completed' && styles.todoCardCompleted
        ]}
        onPress={() => router.push('/todo-detail', { todoId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.todoMainContent}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              item.status === 'completed' && styles.checkboxChecked
            ]}
            onPress={() => handleToggleTodo(item.id, item.status)}
            activeOpacity={0.7}
          >
            {item.status === 'completed' && (
              <FontAwesome6 name="check" size={14} color="white" />
            )}
          </TouchableOpacity>

          <View style={styles.todoContent}>
            <ThemedText
              variant="body"
              color={item.status === 'completed' ? theme.textMuted : theme.textPrimary}
              style={[
                styles.todoTitle,
                item.status === 'completed' && styles.todoTitleCompleted
              ]}
            >
              {item.title}
            </ThemedText>
            {item.description && (
              <ThemedText
                variant="caption"
                color={theme.textMuted}
                style={styles.todoDescription}
                numberOfLines={2}
              >
                {item.description}
              </ThemedText>
            )}
          </View>

          <View style={styles.todoRightContent}>
            <View style={[styles.priorityTag, getPriorityStyle(item.priority)]}>
              <ThemedText variant="caption" color="#FFFFFF">
                {getPriorityText(item.priority)}
              </ThemedText>
            </View>
          </View>
        </View>

        {item.dueDate && (
          <View style={styles.todoDueDate}>
            <FontAwesome6 name="calendar" size={12} color={theme.textMuted} />
            <ThemedText variant="caption" color={theme.textMuted}>
              {new Date(item.dueDate).toLocaleDateString()}
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    </Swipeable>
  );

  // 渲染视图模式切换按钮
  const renderViewModeButtons = () => (
    <View style={styles.viewModeContainer}>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'timeline' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('timeline')}
      >
        <ThemedText
          variant="caption"
          color={viewMode === 'timeline' ? theme.buttonPrimaryText : theme.textSecondary}
        >
          时间轴
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'upcoming' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('upcoming')}
      >
        <ThemedText
          variant="caption"
          color={viewMode === 'upcoming' ? theme.buttonPrimaryText : theme.textSecondary}
        >
          未来7天
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'monthly' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('monthly')}
      >
        <ThemedText
          variant="caption"
          color={viewMode === 'monthly' ? theme.buttonPrimaryText : theme.textSecondary}
        >
          月度
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText variant="h2" color={theme.textPrimary}>待办</ThemedText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/todo-detail', { mode: 'create' })}
          >
            <FontAwesome6 name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {renderViewModeButtons()}

        {loading ? (
          <View style={styles.centerContainer}>
            <ThemedText variant="body" color={theme.textMuted}>加载中...</ThemedText>
          </View>
        ) : todos.length === 0 ? (
          <View style={styles.centerContainer}>
            <FontAwesome6 name="clipboard-list" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
              暂无待办事项
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={todos}
            renderItem={renderTodoItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Screen>
  );
}
