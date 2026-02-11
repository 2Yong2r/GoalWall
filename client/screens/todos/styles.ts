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
    viewMenuButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.backgroundDefault,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      paddingTop: 80,
      paddingHorizontal: Spacing.lg,
    },
    viewMenuContainer: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      width: 180,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    viewMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      gap: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.borderLight,
    },
    viewMenuItemActive: {
      backgroundColor: theme.primary + '15',
    },
    viewMenuText: {
      flex: 1,
    },
    floatingAddButton: {
      position: 'absolute',
      right: Spacing.xl,
      bottom: Spacing['2xl'],
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    listContent: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: 80,
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
      width: '14.28%',
      backgroundColor: theme.backgroundDefault,
      minHeight: 120,
    },
    todayCell: {
      backgroundColor: theme.primary + '08',
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
      paddingVertical: 4,
      paddingHorizontal: 6,
      marginBottom: 2,
      borderRadius: 4,
    },
    cellTodoTitle: {
      fontSize: 11,
    },
    cellEmpty: {
      height: '100%',
    },
  });
};
