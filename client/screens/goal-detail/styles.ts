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
      paddingTop: Spacing['2xl'],
      paddingBottom: Spacing.lg,
    },
    backButton: {
      padding: Spacing.xs,
    },
    editButton: {
      padding: Spacing.xs,
    },
    content: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing['5xl'],
    },
    goalInfoCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.sm,
    },
    goalName: {
      flex: 1,
      marginRight: Spacing.sm,
    },
    inlineEdit: {
      padding: Spacing.xs,
    },
    goalDescription: {
      marginTop: Spacing.sm,
      fontSize: 14,
      lineHeight: 20,
    },
    tasksSection: {
      flex: 1,
    },
    tasksHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    addTaskButton: {
      width: 32,
      height: 32,
      borderRadius: BorderRadius.sm,
      backgroundColor: theme.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tasksList: {
      paddingBottom: Spacing.md,
    },
    taskCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      marginBottom: Spacing.xs,
    },
    taskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.xs,
    },
    taskLeft: {
      flex: 1,
      marginRight: Spacing.xs,
    },
    weightBadge: {
      backgroundColor: theme.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: BorderRadius.xs,
      alignSelf: 'flex-start',
      marginBottom: 2,
    },
    taskDescription: {
      fontSize: 14,
      lineHeight: 20,
    },
    deleteButton: {
      padding: 4,
    },
    taskFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.xs,
    },
    progressBarContainer: {
      flex: 1,
      height: 4,
      backgroundColor: theme.border,
      borderRadius: 2,
      marginRight: Spacing.xs,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: theme.primary,
    },
    dateInfo: {
      marginTop: Spacing.xs,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: Spacing['3xl'],
    },
    emptyText: {
      marginTop: Spacing.md,
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.backgroundRoot,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
    },
    modalContent: {
      paddingTop: Spacing.xl,
      height: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalBody: {
      flex: 1,
      padding: Spacing.lg,
    },
    modalFooter: {
      flexDirection: 'row',
      padding: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      gap: Spacing.md,
    },
    modalButton: {
      flex: 1,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.backgroundTertiary,
    },
    saveButton: {
      backgroundColor: theme.primary,
    },
    formGroup: {
      marginBottom: Spacing.lg,
    },
    label: {
      marginBottom: Spacing.sm,
    },
    input: {
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      fontSize: 16,
      color: theme.textPrimary,
      borderWidth: 1,
      borderColor: theme.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
  });
};
