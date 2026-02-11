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
import { localApiService } from '@/services/api';

type ViewMode = 'timeline' | 'upcoming' | 'monthly';

export default function TodosScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  // 获取待办列表（使用本地 API）
  const fetchTodos = useCallback(async (mode: ViewMode = 'timeline') => {
    setLoading(true);
    try {
      const data = await localApiService.getTodos();

      // 根据视图模式排序
      let sortedData = data;

      if (mode === 'timeline') {
        // 时间轴模式：有截止日期的按日期升序，无截止日期的排最后按标题排序
        const withDueDate = data.filter(t => t.dueDate);
        const withoutDueDate = data.filter(t => !t.dueDate);

        // 有截止日期的按日期升序排列（由近到远）
        withDueDate.sort((a, b) => {
          if (!a.dueDate || !b.dueDate) return 0;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });

        // 无截止日期的按标题拼音排序
        withoutDueDate.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));

        sortedData = [...withDueDate, ...withoutDueDate];
      } else if (mode === 'upcoming') {
        // 未来7天：仅显示截止日期在未来7天之内的待办
        const now = new Date();
        const sevenDaysLater = new Date(now);
        sevenDaysLater.setDate(now.getDate() + 7);

        // 过滤出有截止日期且在7天内的待办
        const upcomingTodos = data.filter(t => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          // 范围：今天到7天后（包含今天和第7天）
          return dueDate >= now && dueDate <= sevenDaysLater;
        });

        // 按截止日期升序排列
        upcomingTodos.sort((a, b) => {
          if (!a.dueDate || !b.dueDate) return 0;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });

        sortedData = upcomingTodos;
      }

      setTodos(sortedData);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 页面聚焦或视图模式切换时刷新数据
  useFocusEffect(
    useCallback(() => {
      fetchTodos(viewMode);
    }, [fetchTodos, viewMode])
  );

  // 切换待办状态（使用本地 API）
  const handleToggleTodo = async (todoId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;
    try {
      await localApiService.updateTodo(todoId, { status: newStatus, completedAt });
      setTodos(prev => prev.map(t =>
        t.id === todoId ? { ...t, status: newStatus, completedAt } : t
      ));
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  // 删除待办（使用本地 API）
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
              await localApiService.deleteTodo(todoId);
              setTodos(prev => prev.filter(t => t.id !== todoId));
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
        <ThemedText variant="caption" color="white" style={{ marginTop: 4 }}>删除</ThemedText>
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
      friction={2}
      rightThreshold={40}
      onSwipeableClose={() => {
        swipeableRefs.current.delete(item.id);
      }}
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

  // 日历相关辅助函数
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.getDay();
  };

  const isToday = (day: number, month: Date) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month.getMonth() === today.getMonth() &&
      month.getFullYear() === today.getFullYear()
    );
  };

  // 获取某天的待办事项
  const getTodosForDay = (day: number, month: Date): Todo[] => {
    return todos.filter(todo => {
      if (!todo.dueDate) return false;
      const todoDate = new Date(todo.dueDate);
      return (
        todoDate.getDate() === day &&
        todoDate.getMonth() === month.getMonth() &&
        todoDate.getFullYear() === month.getFullYear()
      );
    });
  };

  // 月份切换
  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // 渲染日历头部（星期）
  const renderWeekHeader = () => {
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    return (
      <View style={styles.weekHeader}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <ThemedText variant="caption" color={theme.textSecondary}>
              {day}
            </ThemedText>
          </View>
        ))}
      </View>
    );
  };

  // 渲染日历格子
  const renderCalendarCell = (day: number | null, index: number) => {
    if (day === null) {
      return <View key={index} style={styles.calendarCell} />;
    }

    const dayTodos = getTodosForDay(day, currentMonth);
    const isDayToday = isToday(day, currentMonth);

    return (
      <View
        key={index}
        style={[
          styles.calendarCell,
          isDayToday && styles.todayCell
        ]}
      >
        <View style={styles.cellHeader}>
          <ThemedText
            variant="caption"
            color={isDayToday ? theme.primary : theme.textPrimary}
            style={styles.dayNumber}
          >
            {day}
          </ThemedText>
        </View>
        <ScrollView
          style={styles.cellContent}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          {dayTodos.length > 0 ? (
            dayTodos.map((todo) => (
              <TouchableOpacity
                key={todo.id}
                style={[
                  styles.cellTodoItem,
                  todo.status === 'completed' && styles.cellTodoItemCompleted
                ]}
                onPress={() => router.push('/todo-detail', { todoId: todo.id })}
              >
                <View style={[
                  styles.cellTodoDot,
                  todo.status === 'completed' && styles.cellTodoDotCompleted,
                  todo.priority === 'high' && styles.cellTodoDotHigh,
                  todo.priority === 'medium' && styles.cellTodoDotMedium,
                  todo.priority === 'low' && styles.cellTodoDotLow,
                ]} />
                <ThemedText
                  variant="caption"
                  color={todo.status === 'completed' ? theme.textMuted : theme.textPrimary}
                  style={styles.cellTodoTitle}
                  numberOfLines={2}
                >
                  {todo.title}
                </ThemedText>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.cellEmpty} />
          )}
        </ScrollView>
      </View>
    );
  };

  // 渲染日历
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);

    // 构建日历数组（包含空白格子）
    const calendarDays: (number | null)[] = [];
    // 填充前导空白
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    // 填充日期
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }

    return (
      <View style={styles.calendarContainer}>
        {/* 月份头部 */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={handlePreviousMonth}>
            <FontAwesome6 name="chevron-left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText variant="h3" color={theme.textPrimary}>
            {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
          </ThemedText>
          <TouchableOpacity onPress={handleNextMonth}>
            <FontAwesome6 name="chevron-right" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        {renderWeekHeader()}

        {/* 日历网格 */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => renderCalendarCell(day, index))}
        </View>
      </View>
    );
  };

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
          <ThemedText variant="h2" color={theme.textPrimary}>待办事项</ThemedText>
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
        ) : viewMode === 'monthly' ? (
          // 月度日历视图
          <ScrollView style={styles.calendarScrollView}>
            {renderCalendar()}
          </ScrollView>
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
            scrollEventThrottle={16}
            removeClippedSubviews={false}
          />
        )}
      </View>
    </Screen>
  );
}
