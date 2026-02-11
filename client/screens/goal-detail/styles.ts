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
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.lg,
    },
    backButton: {
      padding: Spacing.xs,
    },
    editButton: {
      padding: Spacing.xs,
    },
    // 创建模式表单
    createForm: {
      flex: 1,
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.lg,
    },
    formCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
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
      height: 120,
      textAlignVertical: 'top',
    },
    saveButton: {
      backgroundColor: theme.primary,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
    },
    fullWidthButton: {
      marginTop: Spacing.lg,
    },
    // 详情模式
    detailContent: {
      flex: 1,
    },
    goalInfoCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.lg,
      marginBottom: Spacing.lg,
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
    // 任务列表
    tasksSection: {
      flex: 1,
      paddingHorizontal: Spacing.xl,
    },
    tasksHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
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
      paddingBottom: Spacing.xl,
    },
    taskCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.md,
      padding: Spacing.lg,
      marginBottom: Spacing.sm,
      shadowColor: theme.primary,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    taskMainContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.xs,
    },
    taskDescription: {
      flex: 1,
      fontSize: 16,
      lineHeight: 22,
      marginRight: Spacing.sm,
    },
    taskAttributes: {
      flexDirection: 'row',
      marginBottom: Spacing.xs,
    },
    priorityTag: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
      borderRadius: BorderRadius.sm,
      alignSelf: 'flex-start',
    },
    deleteButton: {
      padding: Spacing.xs,
      marginLeft: Spacing.xs,
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
    // Modal
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
    modalSaveButton: {
      backgroundColor: theme.primary,
    },
  });
};
