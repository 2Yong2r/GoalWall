import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.backgroundRoot,
    },
    backButton: {
      padding: Spacing.xs,
      marginRight: Spacing.sm,
    },
    headerRight: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    contentContainer: {
      padding: Spacing.md,
      paddingBottom: Spacing['5xl'],
    },
    inputGroup: {
      marginBottom: Spacing.md,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    label: {
      marginBottom: Spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      fontSize: 16,
      color: theme.textPrimary,
      backgroundColor: theme.backgroundDefault,
      minHeight: 44,
    },
    inputWithTitle: {
      flex: 1,
    },
    textArea: {
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      fontSize: 14,
      color: theme.textPrimary,
      backgroundColor: theme.backgroundDefault,
      minHeight: 60,
      textAlignVertical: 'top',
    },
    compactLabel: {
      marginBottom: Spacing.xs,
    },
    // 优先级菜单
    priorityMenu: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    priorityMenuOption: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // 优先级触发按钮（单个灰色旗子）
    priorityTrigger: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // 紧凑按钮样式
    compactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      padding: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      backgroundColor: theme.backgroundDefault,
      minHeight: 40,
    },
    compactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    compactButtonWithRepeat: {
      flex: 1,
    },
    repeatIconButton: {
      padding: Spacing.sm,
      width: 40,
      justifyContent: 'center',
    },
    compactButtonText: {
      fontSize: 14,
    },
    buttonGroup: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginTop: Spacing.lg,
    },
    button: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      minHeight: 44,
    },
    saveButton: {
      flex: 2,
    },
    deleteButton: {
      flex: 1,
      backgroundColor: '#FEE2E2',
      borderWidth: 1,
      borderColor: '#FCA5A5',
    },
  });
};
