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
    content: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing['5xl'],
    },
    loadingText: {
      textAlign: 'center',
      marginTop: Spacing['3xl'],
    },
    versionCard: {
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
    },
    versionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.sm,
    },
    versionInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    versionNumber: {
      fontSize: 18,
    },
    changeTypeBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: BorderRadius.xs,
    },
    versionDescription: {
      marginBottom: Spacing.sm,
      lineHeight: 20,
    },
    versionFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
  });
};
