import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform, Pressable, FlatList, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { RepeatConfigInput, type RepeatConfig } from '@/components/RepeatConfigInput';
import { createStyles } from './styles';
import type { Task, TaskUpdate } from '@/types';
import { localApiService } from '@/services/api';

export default function TaskDetailScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ taskId?: string; goalId?: string; mode?: 'create' }>();

  const isCreateMode = params.mode === 'create';

  const [task, setTask] = useState<Task | null>(null);
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // 表单数据
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState('0');
  const [repeatConfig, setRepeatConfig] = useState<RepeatConfig>({
    isRepeat: false,
    repeatInterval: 1,
    repeatUnit: 'day',
    repeatEndDate: null,
  });

  // 获取任务详情（使用本地 API）
  const fetchTaskDetail = useCallback(async () => {
    if (!params.taskId) return;

    setLoading(true);
    try {
      const taskData = await localApiService.getTask(params.taskId);
      if (!taskData) {
        throw new Error('Task not found');
      }
      setTask(taskData);
      setDescription(taskData.description);
      setPriority((taskData.priority as 'high' | 'medium' | 'low') || 'medium');
      setCompletionPercentage(String(taskData.completionPercentage));
      setStartDate(taskData.startDate ? new Date(taskData.startDate) : null);
      setEndDate(taskData.endDate ? new Date(taskData.endDate) : null);
      // 加载重复配置
      setRepeatConfig({
        isRepeat: taskData.isRepeat || false,
        repeatInterval: taskData.repeatInterval || 1,
        repeatUnit: taskData.repeatUnit || 'day',
        repeatEndDate: taskData.repeatEndDate ? new Date(taskData.repeatEndDate) : null,
      });
    } catch (error) {
      console.error('Failed to fetch task:', error);
      Alert.alert('错误', '获取任务详情失败');
    } finally {
      setLoading(false);
    }
  }, [params.taskId]);

  // 获取更新记录（使用本地 API）
  const fetchUpdates = useCallback(async () => {
    if (!params.taskId) return;

    try {
      const updatesData = await localApiService.getTaskUpdates(params.taskId);
      setUpdates(updatesData);
    } catch (error) {
      console.error('Failed to fetch updates:', error);
    }
  }, [params.taskId]);

  useFocusEffect(
    useCallback(() => {
      if (!isCreateMode) {
        fetchTaskDetail();
        fetchUpdates();
      }
    }, [isCreateMode, fetchTaskDetail, fetchUpdates])
  );

  // 保存任务（使用本地 API）
  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert('提示', '请输入任务描述');
      return;
    }

    try {
      const taskData: any = {
        description: description.trim(),
        priority: priority,
        completionPercentage: parseInt(completionPercentage) || 0,
        isRepeat: repeatConfig.isRepeat,
        repeatInterval: repeatConfig.repeatInterval,
        repeatUnit: repeatConfig.repeatUnit,
        repeatEndDate: repeatConfig.repeatEndDate ? repeatConfig.repeatEndDate.toISOString() : null,
      };

      if (params.goalId) {
        taskData.goalId = params.goalId;
      }

      if (startDate) {
        taskData.startDate = startDate.toISOString();
      }

      if (endDate) {
        taskData.endDate = endDate.toISOString();
      }

      console.log('[TaskDetail] Creating task with data:', taskData);

      if (isCreateMode) {
        const newTask = await localApiService.createTask(taskData);
        console.log('[TaskDetail] Task created successfully:', newTask.id);
        router.back();
      } else {
        const updatedTask = await localApiService.updateTask(params.taskId!, taskData);
        setTask(updatedTask);
        await fetchUpdates(); // 刷新更新记录
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      Alert.alert('错误', '保存任务失败');
    }
  };

  // 删除任务（使用本地 API）
  const handleDelete = async () => {
    if (!params.taskId || isCreateMode) {
      router.back();
      return;
    }

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
              await localApiService.deleteTask(params.taskId!);
              Alert.alert('成功', '任务已删除，云端同步中...');
              router.back();
            } catch (error) {
              console.error('Failed to delete task:', error);
              Alert.alert('错误', '删除任务失败');
            }
          },
        },
      ]
    );
  };

  // 快捷设置完成百分比
  const handleQuickProgress = (value: number) => {
    setCompletionPercentage(String(value));
  };

  // 日期选择器处理
  const handleStartDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (event.type === 'set' && date) {
      setStartDate(date);
    }
  };

  const handleEndDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (event.type === 'set' && date) {
      setEndDate(date);
    }
  };

  const renderUpdateItem = ({ item }: { item: TaskUpdate }) => (
    <View style={styles.updateItem}>
      <View style={styles.updateLeft}>
        <ThemedText variant="caption" color={theme.textMuted}>
          {new Date(item.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>
      <View style={styles.updateRight}>
        <ThemedText variant="caption" color={theme.textSecondary} numberOfLines={2}>
          {item.updateContent}
        </ThemedText>
      </View>
    </View>
  );

  if (loading && !task && !isCreateMode) {
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
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <FontAwesome6 name="arrow-left" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <ThemedText variant="h3" color={theme.textPrimary}>
              {isCreateMode ? '创建任务' : '任务详情'}
            </ThemedText>
            {!isCreateMode && (
              <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                <FontAwesome6 name="trash" size={18} color={theme.error} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* 任务信息表单 */}
            <ThemedView level="default" style={styles.formCard}>
              <View style={styles.formGroup}>
                <ThemedText variant="body" color={theme.textSecondary} style={styles.label}>
                  任务描述 *
                </ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="请输入任务描述"
                  placeholderTextColor={theme.textMuted}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText variant="body" color={theme.textSecondary} style={styles.label}>
                  优先级
                </ThemedText>
                <View style={styles.prioritySelector}>
                  {(['high', 'medium', 'low'] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityButton,
                        priority === p && styles.priorityButtonActive,
                        priority === p && { backgroundColor: p === 'high' ? '#F97316' : p === 'medium' ? '#3B82F6' : '#9CA3AF' },
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <ThemedText
                        variant="caption"
                        color={priority === p ? '#FFFFFF' : theme.textSecondary}
                      >
                        {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <ThemedText variant="body" color={theme.textSecondary} style={styles.label}>
                  开始日期
                </ThemedText>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <FontAwesome6 name="calendar" size={16} color={theme.primary} />
                  <ThemedText variant="body" color={startDate ? theme.textPrimary : theme.textMuted} style={styles.dateText}>
                    {startDate ? startDate.toLocaleDateString() : '选择开始日期'}
                  </ThemedText>
                </TouchableOpacity>
                {Platform.OS === 'ios' ? (
                  // iOS：使用 Modal 包装
                  showStartDatePicker && (
                    <Modal
                      transparent={true}
                      visible={showStartDatePicker}
                      animationType="slide"
                    >
                      <View style={styles.datePickerModal}>
                        <View style={styles.datePickerModalContent}>
                          <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowStartDatePicker(false)}
                          >
                            <ThemedText variant="bodyMedium" color={theme.primary}>取消</ThemedText>
                          </TouchableOpacity>
                          <DateTimePicker
                            value={startDate || new Date()}
                            mode="date"
                            onChange={handleStartDateChange}
                            style={{ width: '100%' }}
                          />
                          <TouchableOpacity
                            style={[styles.datePickerButton, styles.datePickerConfirmButton]}
                            onPress={() => setShowStartDatePicker(false)}
                          >
                            <ThemedText variant="bodyMedium" color={theme.primary}>确认</ThemedText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
                  )
                ) : Platform.OS === 'web' ? (
                  // Web：始终渲染，使用样式控制显示
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="compact"
                    onChange={handleStartDateChange}
                    style={{ display: showStartDatePicker ? 'flex' : 'none', marginTop: 10 }}
                  />
                ) : (
                  // Android：条件渲染
                  showStartDatePicker && (
                    <DateTimePicker
                      value={startDate || new Date()}
                      mode="date"
                      onChange={handleStartDateChange}
                    />
                  )
                )}
              </View>

              <View style={styles.formGroup}>
                <ThemedText variant="body" color={theme.textSecondary} style={styles.label}>
                  结束日期
                </ThemedText>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <FontAwesome6 name="calendar" size={16} color={theme.primary} />
                  <ThemedText variant="body" color={endDate ? theme.textPrimary : theme.textMuted} style={styles.dateText}>
                    {endDate ? endDate.toLocaleDateString() : '选择结束日期'}
                  </ThemedText>
                </TouchableOpacity>
                {Platform.OS === 'ios' ? (
                  // iOS：使用 Modal 包装
                  showEndDatePicker && (
                    <Modal
                      transparent={true}
                      visible={showEndDatePicker}
                      animationType="slide"
                    >
                      <View style={styles.datePickerModal}>
                        <View style={styles.datePickerModalContent}>
                          <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowEndDatePicker(false)}
                          >
                            <ThemedText variant="bodyMedium" color={theme.primary}>取消</ThemedText>
                          </TouchableOpacity>
                          <DateTimePicker
                            value={endDate || new Date()}
                            mode="date"
                            onChange={handleEndDateChange}
                            style={{ width: '100%' }}
                          />
                          <TouchableOpacity
                            style={[styles.datePickerButton, styles.datePickerConfirmButton]}
                            onPress={() => setShowEndDatePicker(false)}
                          >
                            <ThemedText variant="bodyMedium" color={theme.primary}>确认</ThemedText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
                  )
                ) : Platform.OS === 'web' ? (
                  // Web：始终渲染，使用样式控制显示
                  <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display="compact"
                    onChange={handleEndDateChange}
                    style={{ display: showEndDatePicker ? 'flex' : 'none', marginTop: 10 }}
                  />
                ) : (
                  // Android：条件渲染
                  showEndDatePicker && (
                    <DateTimePicker
                      value={endDate || new Date()}
                      mode="date"
                      onChange={handleEndDateChange}
                    />
                  )
                )}
              </View>

              <View style={styles.formGroup}>
                <ThemedText variant="body" color={theme.textSecondary} style={styles.label}>
                  完成百分比: {completionPercentage}%
                </ThemedText>
                <TextInput
                  style={styles.input}
                  value={completionPercentage}
                  onChangeText={setCompletionPercentage}
                  placeholder="0-100"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <View style={styles.quickProgress}>
                  {[0, 25, 50, 75, 100].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.progressButton,
                        parseInt(completionPercentage) === value && styles.progressButtonActive,
                      ]}
                      onPress={() => handleQuickProgress(value)}
                    >
                      <ThemedText
                        variant="caption"
                        color={parseInt(completionPercentage) === value ? theme.buttonPrimaryText : theme.textSecondary}
                      >
                        {value}%
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 重复设置 */}
              <RepeatConfigInput
                value={repeatConfig}
                onChange={setRepeatConfig}
              />
            </ThemedView>

            {/* 保存按钮 */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
                {isCreateMode ? '创建任务' : '保存'}
              </ThemedText>
            </TouchableOpacity>

            {/* 更新记录 */}
            {!isCreateMode && updates.length > 0 && (
              <ThemedView level="default" style={styles.updatesCard}>
                <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
                  更新记录
                </ThemedText>
                <FlatList
                  data={updates}
                  renderItem={renderUpdateItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </ThemedView>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
