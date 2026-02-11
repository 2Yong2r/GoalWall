import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, SkinType, SkinConfig } from '@/constants/theme';

const SKIN_STORAGE_KEY = '@user_skin_preference';
const DEFAULT_SKIN: SkinType = 'minimal-blue';

interface ThemeContextType {
  theme: typeof Colors['minimal-blue'];
  skinType: SkinType;
  isLoading: boolean;
  setSkin: (skin: SkinType) => Promise<void>;
  getSkinInfo: () => { name: string; description: string; icon: string };
  getAvailableSkins: () => Array<{ id: SkinType; name: string; description: string; icon: string }>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [skinType, setSkinTypeState] = useState<SkinType>(DEFAULT_SKIN);
  const [isLoading, setIsLoading] = useState(true);

  // 加载保存的皮肤偏好
  useEffect(() => {
    loadSkinPreference();
  }, []);

  /**
   * 从 AsyncStorage 加载皮肤偏好
   */
  const loadSkinPreference = async () => {
    try {
      const savedSkin = await AsyncStorage.getItem(SKIN_STORAGE_KEY);
      if (savedSkin && Object.keys(Colors).includes(savedSkin)) {
        setSkinTypeState(savedSkin as SkinType);
      }
    } catch (error) {
      console.error('Failed to load skin preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 保存皮肤偏好到 AsyncStorage
   */
  const setSkin = async (newSkin: SkinType) => {
    try {
      await AsyncStorage.setItem(SKIN_STORAGE_KEY, newSkin);
      setSkinTypeState(newSkin);
    } catch (error) {
      console.error('Failed to save skin preference:', error);
    }
  };

  /**
   * 获取当前皮肤信息
   */
  const getSkinInfo = () => {
    return SkinConfig[skinType];
  };

  /**
   * 获取所有可用皮肤列表
   */
  const getAvailableSkins = () => {
    return Object.entries(SkinConfig).map(([key, value]) => ({
      id: key as SkinType,
      name: value.name,
      description: value.description,
      icon: value.icon,
    }));
  };

  const value = {
    theme: isLoading ? Colors[DEFAULT_SKIN] : Colors[skinType],
    skinType,
    isLoading,
    setSkin,
    getSkinInfo,
    getAvailableSkins,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * 使用主题 Hook
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { SkinType, SkinConfig };
