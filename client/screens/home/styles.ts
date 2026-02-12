import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundRoot,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.xl,
      paddingTop: Spacing['2xl'],
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    listContent: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing['5xl'],
    },
    list: {
      flex: 1,
    },
    goalCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    goalCardActive: {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    goalTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: Spacing.sm,
    },
    dragHandle: {
      padding: Spacing.xs,
      marginRight: Spacing.sm,
    },
    goalDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: Spacing.sm,
    },
    progressSection: {
      marginTop: Spacing.sm,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.primary,
    },
    dateRange: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.sm,
    },
    dateRangeText: {
      marginLeft: Spacing.xs,
    },
    swipeDeleteButton: {
      backgroundColor: '#EF4444',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      width: 80,
      height: '100%',
      marginBottom: Spacing.md,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: Spacing['3xl'],
    },
    emptyText: {
      marginTop: Spacing.lg,
      textAlign: 'center',
    },
    // 浮动新增按钮
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
  });
};
