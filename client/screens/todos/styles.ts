import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.lg,
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewModeContainer: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
      gap: Spacing.sm,
    },
    viewModeButton: {
      flex: 1,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.backgroundDefault,
      alignItems: 'center',
    },
    viewModeButtonActive: {
      backgroundColor: theme.primary,
    },
    listContent: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xl,
      gap: Spacing.md,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
    },
    emptyText: {
      marginTop: Spacing.md,
      textAlign: 'center',
    },
    todoCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      gap: Spacing.sm,
    },
    todoCardCompleted: {
      opacity: 0.6,
    },
    todoMainContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.md,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    todoContent: {
      flex: 1,
    },
    todoTitle: {
      fontSize: 16,
      fontWeight: '600',
    },
    todoTitleCompleted: {
      textDecorationLine: 'line-through',
    },
    todoDescription: {
      marginTop: Spacing.xs,
    },
    todoRightContent: {
      alignItems: 'flex-end',
      gap: Spacing.xs,
    },
    priorityTag: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
    },
    priorityHigh: {
      backgroundColor: '#F97316',
    },
    priorityMedium: {
      backgroundColor: '#3B82F6',
    },
    priorityLow: {
      backgroundColor: '#9CA3AF',
    },
    deleteButton: {
      padding: Spacing.xs,
    },
    todoDueDate: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginLeft: 36,
      paddingTop: Spacing.xs,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    swipeDeleteButton: {
      backgroundColor: '#EF4444',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      width: 80,
      height: '100%',
    },
    // 日历样式
    calendarScrollView: {
      flex: 1,
    },
    calendarContainer: {
      flex: 1,
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    monthHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 4,
      minHeight: 36,
    },
    weekHeader: {
      flexDirection: 'row',
      paddingBottom: 4,
    },
    weekDayCell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 4,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      flex: 1,
    },
    calendarCell: {
      width: `${100 / 7}%`,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.backgroundDefault,
      minHeight: 120,
      boxSizing: 'border-box',
    },
    todayCell: {
      borderWidth: 2,
      borderColor: theme.primary,
    },
    cellHeader: {
      paddingVertical: 4,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.backgroundTertiary,
    },
    dayNumber: {
      fontWeight: '600',
      fontSize: 12,
    },
    cellContent: {
      flex: 1,
      padding: 4,
    },
    cellTodoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      padding: 4,
      marginBottom: 2,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: 4,
    },
    cellTodoItemCompleted: {
      opacity: 0.5,
    },
    cellTodoDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      flexShrink: 0,
    },
    cellTodoDotCompleted: {
      opacity: 0.4,
    },
    cellTodoDotHigh: {
      backgroundColor: '#F97316',
    },
    cellTodoDotMedium: {
      backgroundColor: '#3B82F6',
    },
    cellTodoDotLow: {
      backgroundColor: '#9CA3AF',
    },
    cellTodoTitle: {
      flex: 1,
      fontSize: 10,
      lineHeight: 12,
    },
    cellEmpty: {
      height: '100%',
    },
  });
};
