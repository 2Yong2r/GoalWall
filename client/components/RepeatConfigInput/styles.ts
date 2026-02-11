import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme, compact: boolean = false) => {
  const padding = compact ? Spacing.sm : Spacing.lg;
  const gap = compact ? Spacing.sm : Spacing.lg;
  const switchWidth = compact ? 40 : 48;
  const switchHeight = compact ? 24 : 28;
  const switchHandleSize = compact ? 20 : 24;

  return StyleSheet.create({
    container: {
      padding: padding,
      borderRadius: BorderRadius.lg,
      gap: gap,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    switchContainer: {
      padding: Spacing.xs,
    },
    switch: {
      width: switchWidth,
      height: switchHeight,
      borderRadius: switchHeight / 2,
      backgroundColor: theme.backgroundTertiary,
      position: 'relative',
    },
    switchActive: {
      backgroundColor: theme.primary,
    },
    switchHandle: {
      width: switchHandleSize,
      height: switchHandleSize,
      borderRadius: switchHandleSize / 2,
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
      left: switchWidth - switchHandleSize - 2,
    },
    content: {
      gap: gap,
    },
    repeatRow: {
      gap: compact ? Spacing.xs : Spacing.md,
    },
    rowLabel: {
      fontSize: compact ? 12 : 14,
    },
    numberContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
      padding: compact ? Spacing.xs : Spacing.sm,
    },
    numberButton: {
      width: compact ? 32 : 36,
      height: compact ? 32 : 36,
      borderRadius: BorderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.backgroundDefault,
    },
    numberText: {
      fontSize: compact ? 20 : 24,
      fontWeight: '600',
      minWidth: 30,
      textAlign: 'center',
    },
    unitContainer: {
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    unitButton: {
      flex: 1,
      paddingVertical: compact ? Spacing.xs : Spacing.sm,
      paddingHorizontal: compact ? Spacing.sm : Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.backgroundTertiary,
      alignItems: 'center',
    },
    unitButtonActive: {
      backgroundColor: theme.primary,
    },
    endDateRow: {
      gap: compact ? Spacing.xs : Spacing.md,
    },
    endDateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      padding: compact ? Spacing.sm : Spacing.md,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
    },
    endDateLabel: {
      fontSize: compact ? 12 : 14,
    },
  });
};
