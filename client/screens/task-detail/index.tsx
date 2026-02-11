import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform, Pressable, FlatList } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createStyles } from './styles';
import type { Task, TaskUpdate } from '@/types';

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
  const [weight, setWeight] = useState('1');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState('0');

  // 获取任务详情
  const fetchTaskDetail = useCallback(async () => {
    if (!params.taskId || isCreateMode) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/tasks/${params.taskId}`);
      const result = await response.json();
      if (result.success) {
        setTask(result.data);
        setDescription(result.data.description);
        setWeight(String(result.data.weight));
        setCompletionPercentage(String(result.data.completionPercentage));
        setStartDate(result.data.startDate ? new Date(result.data.startDate) : null);
        setEndDate(result.data.endDate ? new Date(result.data.endDate) : null);
      }
    } catch (error) {
      console.error('Failed to fetch task:', error);
    } finally {
      setLoading(false);
    }
  }, [params.taskId, isCreateMode]);

  // 获取更新记录
  const fetchUpdates = useCallback(async () => {
    if (!params.taskId || isCreateMode) return;

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/tasks/${params.taskId}/updates`);
      const result = await response.json();
      if (result.success) {
        setUpdates(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch updates:', error);
    }
  }, [params.taskId, isCreateMode]);

  useFocusEffect(
    useCallback(() => {
      fetchTaskDetail();
      fetchUpdates();
    }, [fetchTaskDetail, fetchUpdates])
  );

  // 保存任务
  const handleSave = async () => {
    if (!description.trim()) {
      alert('请输入任务描述');
      return;
    }

    try {
      const url = isCreateMode
        ? `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/tasks`
        : `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/tasks/${params.taskId}`;
      const method = isCreateMode ? 'POST' : 'PUT';

      const body: any = {
        description: description.trim(),
        weight: parseInt(weight) || 1,
        completionPercentage: parseInt(completionPercentage) || 0,
      };

      if (params.goalId) {
        body.goalId = params.goalId;
      }

      if (startDate) {
        body.startDate = startDate.toISOString();
      }

      if (endDate) {
        body.endDate = endDate.toISOString();
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (result.success) {
        if (isCreateMode) {
          router.back();
        } else {
          setTask(result.data);
          fetchUpdates(); // 刷新更新记录
        }
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  // 删除任务
  const handleDelete = async () => {
    if (!params.taskId || isCreateMode) {
      router.back();
      return;
    }

    if (!confirm('确定要删除这个任务吗？')) return;

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/tasks/${params.taskId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        router.back();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
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
      <View style={styles.updateHeader}>
        <ThemedText variant="caption" color={theme.textMuted}>
          {new Date(item.createdAt).toLocaleString()}
        </ThemedText>
        <View style={styles.progressBadge}>
          <ThemedText variant="caption" color={theme.buttonPrimaryText}>
            {item.completionPercentage}%
          </ThemedText>
        </View>
      </View>
      <ThemedText variant="body" color={theme.textSecondary}>
        {item.updateContent}
      </ThemedText>
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
                  权重
                </ThemedText>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="1"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                />
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
                {showStartDatePicker && (
                  Platform.OS === 'ios' ? (
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
                  ) : (
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
                {showEndDatePicker && (
                  Platform.OS === 'ios' ? (
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
                  ) : (
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
            </ThemedView>

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

            {/* 保存按钮 */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
                {isCreateMode ? '创建任务' : '保存'}
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
