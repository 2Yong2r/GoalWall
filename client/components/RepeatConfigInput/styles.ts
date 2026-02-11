import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      gap: Spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    switchContainer: {
      padding: Spacing.sm,
    },
    switch: {
      width: 48,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.backgroundTertiary,
      position: 'relative',
    },
    switchActive: {
      backgroundColor: theme.primary,
    },
    switchHandle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.backgroundDefault,
      position: 'absolute',
      top: 2,
      left: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    switchHandleActive: {
      left: 22,
    },
    content: {
      gap: Spacing.lg,
    },
    repeatRow: {
      gap: Spacing.md,
    },
    rowLabel: {
      fontSize: 14,
    },
    numberContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
    },
    numberButton: {
      width: 36,
      height: 36,
      borderRadius: BorderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.backgroundDefault,
    },
    numberText: {
      fontSize: 24,
      fontWeight: '600',
      minWidth: 40,
      textAlign: 'center',
    },
    unitContainer: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    unitButton: {
      flex: 1,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.backgroundTertiary,
      alignItems: 'center',
    },
    unitButtonActive: {
      backgroundColor: theme.primary,
    },
    endDateRow: {
      gap: Spacing.md,
    },
    endDateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      padding: Spacing.md,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
    },
    endDateLabel: {
      fontSize: 14,
    },
  });
};
