// 皮肤类型定义
export type SkinType = 'minimal-blue' | 'vibrant-orange' | 'forest-green' | 'sakura-pink' | 'deep-purple';

// 皮肤配置
export const SkinConfig = {
  'minimal-blue': {
    name: '极简蓝',
    description: '简洁专业，高效专注',
    icon: '💙',
  },
  'vibrant-orange': {
    name: '活力橙',
    description: '温暖积极，激励前行',
    icon: '🧡',
  },
  'forest-green': {
    name: '森林绿',
    description: '自然治愈，平静专注',
    icon: '💚',
  },
  'sakura-pink': {
    name: '樱花粉',
    description: '柔美优雅，温馨陪伴',
    icon: '💗',
  },
  'deep-purple': {
    name: '深空紫',
    description: '神秘高端，个性十足',
    icon: '💜',
  },
};

export const Colors = {
  // 1. 极简蓝（默认）- 科技蓝，简洁专业
  'minimal-blue': {
    textPrimary: "#1C1917",
    textSecondary: "#78716c",
    textMuted: "#9CA3AF",
    primary: "#4F46E5", // Indigo-600
    accent: "#8B5CF6", // Violet-500
    success: "#10B981", // Emerald-500
    error: "#EF4444",
    backgroundRoot: "#F3F4F6", // Cool Gray-100
    backgroundDefault: "#FFFFFF",
    backgroundTertiary: "#F9FAFB",
    buttonPrimaryText: "#FFFFFF",
    tabIconSelected: "#4F46E5",
    border: "#E5E7EB",
    borderLight: "#F3F4F6",
  },
  // 2. 活力橙 - 温暖橙色，积极向上
  'vibrant-orange': {
    textPrimary: "#1C1917",
    textSecondary: "#92400E",
    textMuted: "#9CA3AF",
    primary: "#F97316", // Orange-500
    accent: "#FB923C", // Orange-400
    success: "#10B981",
    error: "#EF4444",
    backgroundRoot: "#FFF7ED", // Orange-50
    backgroundDefault: "#FFFFFF",
    backgroundTertiary: "#FFFDF7",
    buttonPrimaryText: "#FFFFFF",
    tabIconSelected: "#F97316",
    border: "#FDBA74",
    borderLight: "#FFEDD5",
  },
  // 3. 森林绿 - 自然绿色，平静专注
  'forest-green': {
    textPrimary: "#1C1917",
    textSecondary: "#3F6212",
    textMuted: "#9CA3AF",
    primary: "#059669", // Emerald-600
    accent: "#34D399", // Emerald-400
    success: "#10B981",
    error: "#EF4444",
    backgroundRoot: "#F0FDF4", // Green-50
    backgroundDefault: "#FFFFFF",
    backgroundTertiary: "#F0FDF9",
    buttonPrimaryText: "#FFFFFF",
    tabIconSelected: "#059669",
    border: "#86EFAC",
    borderLight: "#DCFCE7",
  },
  // 4. 樱花粉 - 柔美粉色，优雅温馨
  'sakura-pink': {
    textPrimary: "#1C1917",
    textSecondary: "#9F1239",
    textMuted: "#9CA3AF",
    primary: "#EC4899", // Pink-500
    accent: "#F472B6", // Pink-400
    success: "#10B981",
    error: "#EF4444",
    backgroundRoot: "#FDF2F8", // Pink-50
    backgroundDefault: "#FFFFFF",
    backgroundTertiary: "#FDF4FA",
    buttonPrimaryText: "#FFFFFF",
    tabIconSelected: "#EC4899",
    border: "#F9A8D4",
    borderLight: "#FCE7F3",
  },
  // 5. 深空紫 - 神秘紫色，高端科技
  'deep-purple': {
    textPrimary: "#1C1917",
    textSecondary: "#5B21B6",
    textMuted: "#9CA3AF",
    primary: "#7C3AED", // Violet-600
    accent: "#8B5CF6", // Violet-500
    success: "#10B981",
    error: "#EF4444",
    backgroundRoot: "#F5F3FF", // Violet-50
    backgroundDefault: "#FFFFFF",
    backgroundTertiary: "#F5F3FF",
    buttonPrimaryText: "#FFFFFF",
    tabIconSelected: "#7C3AED",
    border: "#C4B5FD",
    borderLight: "#EDE9FE",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 112,
    lineHeight: 112,
    fontWeight: "200" as const,
    letterSpacing: -4,
  },
  displayLarge: {
    fontSize: 112,
    lineHeight: 112,
    fontWeight: "200" as const,
    letterSpacing: -2,
  },
  displayMedium: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: "200" as const,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "300" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  smallMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  captionMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500" as const,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  labelTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700" as const,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  stat: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "300" as const,
  },
  tiny: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "400" as const,
  },
  navLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "500" as const,
  },
};

export type Theme = typeof Colors['minimal-blue'];
