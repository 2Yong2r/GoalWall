import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.lg,
    },
    content: {
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing["5xl"],
      gap: Spacing.md,
    },
    skinCard: {
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 2,
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    skinCardSelected: {
      borderColor: theme.primary,
      shadowColor: theme.primary,
      shadowOpacity: 0.2,
    },
    skinCardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    skinIcon: {
      width: 56,
      height: 56,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    skinIconText: {
      fontSize: 28,
    },
    skinInfo: {
      flex: 1,
    },
    selectedBadge: {
      position: 'absolute',
      top: Spacing.lg,
      right: Spacing.lg,
      width: 28,
      height: 28,
      borderRadius: BorderRadius.full,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};
