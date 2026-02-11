import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, SkinType, SkinConfig } from '@/constants/theme';

const SKIN_STORAGE_KEY = '@user_skin_preference';
const DEFAULT_SKIN: SkinType = 'minimal-blue';

/**
 * 获取当前皮肤配置
 */
function getTheme(skinType: SkinType = DEFAULT_SKIN) {
  const theme = Colors[skinType];

  return {
    theme,
    skinType,
  };
}

/**
 * 皮肤切换 Hook
 */
function useTheme() {
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

  if (isLoading) {
    return {
      theme: Colors[DEFAULT_SKIN],
      skinType: DEFAULT_SKIN,
      isLoading: true,
      setSkin,
      getSkinInfo,
      getAvailableSkins,
    };
  }

  return {
    theme: Colors[skinType],
    skinType,
    isLoading: false,
    setSkin,
    getSkinInfo,
    getAvailableSkins,
  };
}

export { useTheme, SkinType, SkinConfig };
