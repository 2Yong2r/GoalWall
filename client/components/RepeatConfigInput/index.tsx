import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { SmartDateInput } from '@/components/SmartDateInput';
import { createStyles } from './styles';

export interface RepeatConfig {
  isRepeat: boolean;
  repeatInterval: number;
  repeatUnit: 'day' | 'week' | 'month' | 'year';
  repeatEndDate: Date | null; // null 表示永不结束
}

interface RepeatConfigInputProps {
  value: RepeatConfig;
  onChange: (config: RepeatConfig) => void;
  label?: string;
}

const REPEAT_UNITS = [
  { value: 'day', label: '天' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' },
] as const;

export function RepeatConfigInput({ value, onChange, label = '重复设置' }: RepeatConfigInputProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const toggleRepeat = () => {
    onChange({
      ...value,
      isRepeat: !value.isRepeat,
    });
  };

  const handleIntervalChange = (interval: number) => {
    onChange({
      ...value,
      repeatInterval: interval,
    });
  };

  const handleUnitChange = (unit: 'day' | 'week' | 'month' | 'year') => {
    onChange({
      ...value,
      repeatUnit: unit,
    });
  };

  const handleEndDateChange = (date: Date | null) => {
    onChange({
      ...value,
      repeatEndDate: date,
    });
  };

  const handleSmartDateChange = (isoDate: string | null) => {
    onChange({
      ...value,
      repeatEndDate: isoDate ? new Date(isoDate) : null,
    });
  };

  return (
    <ThemedView level="default" style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="body" color={theme.textPrimary}>
          {label}
        </ThemedText>
        <TouchableOpacity onPress={toggleRepeat} style={styles.switchContainer}>
          <View style={[
            styles.switch,
            value.isRepeat && styles.switchActive,
          ]}>
            <View style={[
              styles.switchHandle,
              value.isRepeat && styles.switchHandleActive,
            ]} />
          </View>
        </TouchableOpacity>
      </View>

      {value.isRepeat && (
        <View style={styles.content}>
          {/* 重复间隔 */}
          <View style={styles.repeatRow}>
            <ThemedText variant="body" color={theme.textSecondary} style={styles.rowLabel}>
              每
            </ThemedText>
            <View style={styles.numberContainer}>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => handleIntervalChange(Math.max(1, value.repeatInterval - 1))}
              >
                <FontAwesome6 name="minus" size={16} color={theme.primary} />
              </TouchableOpacity>
              <ThemedText variant="h3" color={theme.textPrimary} style={styles.numberText}>
                {value.repeatInterval}
              </ThemedText>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => handleIntervalChange(value.repeatInterval + 1)}
              >
                <FontAwesome6 name="plus" size={16} color={theme.primary} />
              </TouchableOpacity>
            </View>

            {/* 重复单位选择 */}
            <View style={styles.unitContainer}>
              {REPEAT_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitButton,
                    value.repeatUnit === unit.value && styles.unitButtonActive,
                  ]}
                  onPress={() => handleUnitChange(unit.value)}
                >
                  <ThemedText
                    variant="body"
                    color={value.repeatUnit === unit.value ? theme.buttonPrimaryText : theme.textSecondary}
                  >
                    {unit.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 结束日期 */}
          <View style={styles.endDateRow}>
            <ThemedText variant="body" color={theme.textSecondary} style={styles.rowLabel}>
              结束日期
            </ThemedText>
            <TouchableOpacity
              style={styles.endDateButton}
              onPress={() => handleEndDateChange(null)}
            >
              <FontAwesome6
                name={value.repeatEndDate === null ? 'check-circle' : 'circle'}
                size={20}
                color={value.repeatEndDate === null ? theme.primary : theme.textMuted}
              />
              <ThemedText
                variant="body"
                color={value.repeatEndDate === null ? theme.primary : theme.textMuted}
                style={styles.endDateLabel}
              >
                永不结束
              </ThemedText>
            </TouchableOpacity>
          </View>

          {value.repeatEndDate !== null && (
            <SmartDateInput
              label="选择结束日期"
              value={value.repeatEndDate.toISOString()}
              onChange={handleSmartDateChange}
            />
          )}
        </View>
      )}
    </ThemedView>
  );
}
