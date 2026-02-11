import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.backgroundRoot,
    },
    backButton: {
      padding: Spacing.sm,
      marginRight: Spacing.md,
    },
    headerRight: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    contentContainer: {
      padding: Spacing.lg,
      paddingBottom: Spacing['5xl'],
    },
    inputGroup: {
      marginBottom: Spacing.xl,
    },
    label: {
      marginBottom: Spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: 16,
      color: theme.textPrimary,
      backgroundColor: theme.backgroundDefault,
    },
    textArea: {
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: 16,
      color: theme.textPrimary,
      backgroundColor: theme.backgroundDefault,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    priorityContainer: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    priorityOption: {
      flex: 1,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      alignItems: 'center',
      backgroundColor: theme.backgroundDefault,
    },
    priorityOptionSelected: {},
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      backgroundColor: theme.backgroundDefault,
    },
    buttonGroup: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginTop: Spacing.xl,
    },
    button: {
      flex: 1,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
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
