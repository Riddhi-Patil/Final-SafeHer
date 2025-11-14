import { StyleSheet } from 'react-native';

// Theme configuration
export const theme = {
  colors: {
    primary: '#6C4AE2', // Purple
    accent: '#FF5E8A', // Pink accent / alerts
    danger: '#FF5E8A', // Use pink for alerts per spec
    background: '#FFF5FA', // Soft Pink
    surface: '#FFFFFF',
    text: '#321B5D', // Deep Violet
    secondaryText: '#9B90A8',
    error: '#FF5E8A',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
    light: '#F5E5F0',
    dark: '#1F1039',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontFamily: {
      regular: 'System', // Replace with Poppins/Inter if available
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      small: 12,
      medium: 16,
      large: 20,
      xlarge: 24,
      xxlarge: 32,
    },
  },
  gradients: {
    sos: ['#FF8DB3', '#C47CFF'], // 180deg approximation top->bottom
  }
};

// Common styles
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  sosButton: {
    backgroundColor: theme.colors.error,
    borderRadius: 999,
    width: 86,
    height: 86,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.medium,
  },
  heading: {
    fontSize: theme.typography.fontSize.xlarge,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  subheading: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
});