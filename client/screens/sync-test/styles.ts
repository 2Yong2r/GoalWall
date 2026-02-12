import { StyleSheet, Platform } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing["5xl"],
    },
    header: {
      marginBottom: Spacing.xl,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginBottom: Spacing.lg,
    },
    syncButton: {
      flex: 1,
      backgroundColor: theme.primary,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing["2xl"],
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    syncButtonDisabled: {
      opacity: 0.6,
    },
    clearButton: {
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing["2xl"],
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    infoBox: {
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.lg,
    },
    logContainer: {
      minHeight: 400,
      maxHeight: 600,
      marginBottom: Spacing.lg,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
    },
    logTitle: {
      marginBottom: Spacing.sm,
      paddingBottom: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    logContent: {
      flex: 1,
    },
    logLine: {
      marginVertical: 2,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    debugButton: {
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing["2xl"],
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
  });
};
