import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Pressable, Alert } from 'react-native';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { RepeatConfigInput, type RepeatConfig } from '@/components/RepeatConfigInput';
import { createStyles } from './styles';
import type { Todo } from '@/types';
import { localApiService } from '@/services/api';

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
      } else {
        await localApiService.updateTodo(params.todoId!, todoData);
      }

      router.back();
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

  // 优先级选择
  const renderPriorityOption = (value: 'high' | 'medium' | 'low', label: string, color: string) => (
    <TouchableOpacity
      key={value}
      style={[
        styles.priorityOption,
        priority === value && styles.priorityOptionSelected,
        { borderColor: color },
        priority === value && { backgroundColor: color },
      ]}
      onPress={() => setPriority(value)}
    >
      <ThemedText
        variant="smallMedium"
        color={priority === value ? '#FFFFFF' : theme.textPrimary}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* 标题输入 */}
          <View style={styles.inputGroup}>
            <ThemedText variant="body" color={theme.textSecondary} style={styles.label}>
              标题 <ThemedText variant="caption" color={theme.textMuted}>*</ThemedText>
            </ThemedText>
            <TextInput
              style={[styles.input, { borderColor: theme.border }]}
              placeholder="请输入待办标题"
              placeholderTextColor={theme.textMuted}
              value={title}
              onChangeText={setTitle}
              autoFocus={isCreateMode}
            />
          </View>

          {/* 描述输入 */}
          <View style={styles.inputGroup}>
            <ThemedText variant="body" color={theme.textSecondary} style={styles.label}>
              描述
            </ThemedText>
            <TextInput
              style={[styles.textArea, { borderColor: theme.border }]}
              placeholder="请输入待办描述（可选）"
              placeholderTextColor={theme.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* 优先级选择 */}
          <View style={styles.inputGroup}>
            <ThemedText variant="body" color={theme.textSecondary} style={styles.label}>
              优先级
            </ThemedText>
            <View style={styles.priorityContainer}>
              {renderPriorityOption('high', '高优先级', '#F97316')}
              {renderPriorityOption('medium', '中优先级', '#3B82F6')}
              {renderPriorityOption('low', '低优先级', '#9CA3AF')}
            </View>
          </View>

          {/* 截止日期 */}
          <View style={styles.inputGroup}>
            <ThemedText variant="body" color={theme.textSecondary} style={styles.label}>
              截止日期
            </ThemedText>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <FontAwesome6 name="calendar" size={16} color={theme.textMuted} />
              <ThemedText
                variant="body"
                color={dueDate ? theme.textPrimary : theme.textMuted}
              >
                {dueDate ? dueDate.toLocaleDateString() : '选择截止日期'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* 重复设置 */}
          <RepeatConfigInput
            value={repeatConfig}
            onChange={setRepeatConfig}
          />

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
                保存
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
