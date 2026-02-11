import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Pressable, Alert } from 'react-native';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createStyles } from './styles';
import type { Todo } from '@/types';
import { localApiService } from '@/services/api';

type RepeatConfig = {
  isRepeat: boolean;
  repeatInterval: number;
  repeatUnit: 'day' | 'week' | 'month' | 'year';
  repeatEndDate: Date | null;
};

export default function TodoDetailScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ todoId?: string; mode?: 'create' }>();

  const isCreateMode = params.mode === 'create';

  // 表单数据
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [repeatConfig, setRepeatConfig] = useState<RepeatConfig>({
    isRepeat: false,
    repeatInterval: 1,
    repeatUnit: 'day',
    repeatEndDate: null,
  });

  // 获取待办详情（使用本地 API）
  const fetchTodoDetail = useCallback(async () => {
    if (!params.todoId || isCreateMode) return;

    try {
      const todoData = await localApiService.getTodo(params.todoId);
      if (!todoData) {
        throw new Error('Todo not found');
      }
      setTitle(todoData.title);
      setDescription(todoData.description || '');
      setPriority((todoData.priority as 'high' | 'medium' | 'low') || 'medium');
      setDueDate(todoData.dueDate ? new Date(todoData.dueDate) : null);
      // 加载重复配置
      setRepeatConfig({
        isRepeat: todoData.isRepeat || false,
        repeatInterval: todoData.repeatInterval || 1,
        repeatUnit: todoData.repeatUnit || 'day',
        repeatEndDate: todoData.repeatEndDate ? new Date(todoData.repeatEndDate) : null,
      });
    } catch (error) {
      console.error('Failed to fetch todo:', error);
      Alert.alert('错误', '获取待办详情失败');
    }
  }, [params.todoId, isCreateMode]);

  // 页面加载时获取数据
  useEffect(() => {
    fetchTodoDetail();
  }, [fetchTodoDetail]);

  // 保存待办（使用本地 API）
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('提示', '请输入待办标题');
      return;
    }
    if (!priority) {
      Alert.alert('提示', '请选择优先级');
      return;
    }

    try {
      const todoData: any = {
        title: title.trim(),
        description: description.trim() || null,
        priority: priority,
        isRepeat: repeatConfig.isRepeat,
        repeatInterval: repeatConfig.repeatInterval,
        repeatUnit: repeatConfig.repeatUnit,
        repeatEndDate: repeatConfig.repeatEndDate ? repeatConfig.repeatEndDate.toISOString() : null,
      };

      if (dueDate) {
        todoData.dueDate = dueDate.toISOString();
      }

      if (isCreateMode) {
        await localApiService.createTodo(todoData);
        router.replace('/todos');
      } else {
        await localApiService.updateTodo(params.todoId!, todoData);
        router.back();
      }
    } catch (error) {
      console.error('Failed to save todo:', error);
      Alert.alert('错误', '保存待办失败');
    }
  };

  // 删除待办（使用本地 API）
  const handleDelete = async () => {
    if (!params.todoId || isCreateMode) {
      router.back();
      return;
    }

    Alert.alert(
      '确认删除',
      '确定要删除这个待办吗？此操作无法撤销。',
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
              await localApiService.deleteTodo(params.todoId!);
              Alert.alert('成功', '待办已删除，云端同步中...');
              router.back();
            } catch (error) {
              console.error('Failed to delete todo:', error);
              Alert.alert('错误', '删除待办失败');
            }
          },
        },
      ]
    );
  };

  // 日期选择器处理
  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && date) {
      setDueDate(date);
    }
  };

  // 获取优先级颜色
  const getPriorityColor = (value: 'high' | 'medium' | 'low') => {
    switch (value) {
      case 'high': return '#F97316';
      case 'medium': return '#3B82F6';
      case 'low': return '#9CA3AF';
      default: return '#9CA3AF';
    }
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <View style={{ flex: 1 }}>
        {/* 页首导航栏 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome6 name="arrow-left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText variant="h3" color={theme.textPrimary}>
            {isCreateMode ? '创建待办' : '编辑待办'}
          </ThemedText>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* 标题输入 + 优先级选择 */}
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputWithTitle, { borderColor: theme.border }]}
              placeholder="标题"
              placeholderTextColor={theme.textMuted}
              value={title}
              onChangeText={setTitle}
              autoFocus={isCreateMode}
            />
            {/* 优先级触发按钮 */}
            <TouchableOpacity
              style={styles.priorityTrigger}
              onPress={() => setShowPriorityPicker(!showPriorityPicker)}
              activeOpacity={0.7}
            >
              <FontAwesome6
                name="flag"
                size={20}
                color={getPriorityColor(priority)}
              />
            </TouchableOpacity>

            {/* 优先级菜单（绝对定位，覆盖在输入框上方） */}
            {showPriorityPicker && (
              <View style={styles.priorityMenu}>
                <TouchableOpacity
                  style={styles.priorityMenuOption}
                  onPress={() => {
                    setPriority('high');
                    setShowPriorityPicker(false);
                  }}
                >
                  <FontAwesome6 name="flag" size={20} color="#F97316" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.priorityMenuOption}
                  onPress={() => {
                    setPriority('medium');
                    setShowPriorityPicker(false);
                  }}
                >
                  <FontAwesome6 name="flag" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.priorityMenuOption}
                  onPress={() => {
                    setPriority('low');
                    setShowPriorityPicker(false);
                  }}
                >
                  <FontAwesome6 name="flag" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 备注输入 */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.textArea, { borderColor: theme.border }]}
              placeholder="备注（可选）"
              placeholderTextColor={theme.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* 截止日期 + 重复设置 */}
          <View style={styles.inputGroup}>
            <View style={styles.compactRow}>
              <TouchableOpacity
                style={[styles.compactButton, styles.compactButtonWithRepeat, { borderColor: theme.border }]}
                onPress={() => setShowDatePicker(true)}
              >
                <FontAwesome6 name="calendar" size={14} color={theme.textMuted} />
                <ThemedText
                  variant="body"
                  color={dueDate ? theme.textPrimary : theme.textMuted}
                  style={styles.compactButtonText}
                >
                  {dueDate ? dueDate.toLocaleDateString() : '截止日期'}
                </ThemedText>
              </TouchableOpacity>
              {/* 重复设置图标 */}
              <TouchableOpacity
                style={[
                  styles.compactButton,
                  styles.repeatIconButton,
                  { borderColor: repeatConfig.isRepeat ? theme.primary : theme.border }
                ]}
                onPress={() => setRepeatConfig({ ...repeatConfig, isRepeat: !repeatConfig.isRepeat })}
              >
                <FontAwesome6
                  name="rotate-right"
                  size={14}
                  color={repeatConfig.isRepeat ? theme.primary : theme.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* 按钮组 */}
          <View style={styles.buttonGroup}>
            {!isCreateMode && (
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
              >
                <ThemedText variant="body" color="#EF4444">
                  删除
                </ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <ThemedText variant="body" color={theme.buttonPrimaryText}>
                {isCreateMode ? '创建' : '保存'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

