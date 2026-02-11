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
    backButton: {
      padding: Spacing.xs,
    },
    placeholder: {
      width: 44,
    },
    content: {
      flex: 1,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
    },
    card: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
      gap: Spacing.sm,
    },
    cardTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      flex: 1,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
    },
    statusBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
      backgroundColor: theme.primary,
    },
    cardContent: {
      gap: Spacing.sm,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    syncButton: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      marginTop: Spacing.md,
    },
    description: {
      marginBottom: Spacing.md,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: '#EF4444',
    },
    logItem: {
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
  });
};
