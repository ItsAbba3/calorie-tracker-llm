// src/services/config/ConfigService.ts - EXPO VERSION
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

class ConfigService {
  // دریافت API Key از app.json
  getGroqApiKey(): string {
    const apiKey = Constants.expoConfig?.extra?.groqApiKey;

    if (apiKey && apiKey !== 'YOUR_GROQ_API_KEY_HERE') return apiKey;

    // fallback empty — prefer SecureStore stored key when available
    return '';
  }

  // Async: get stored key from SecureStore (if set), otherwise fallback to app.json
  async getStoredGroqApiKey(): Promise<string> {
    try {
      const key = await SecureStore.getItemAsync('groq_api_key');
      if (key) return key;
    } catch (e) {
      console.warn('SecureStore read failed:', e);
    }

    // fallback to app.json extra
    const fallback = Constants.expoConfig?.extra?.groqApiKey;
    return fallback && fallback !== 'YOUR_GROQ_API_KEY_HERE' ? fallback : '';
  }

  async setStoredGroqApiKey(apiKey: string): Promise<void> {
    try {
      await SecureStore.setItemAsync('groq_api_key', apiKey);
    } catch (e) {
      console.error('SecureStore write failed:', e);
      throw e;
    }
  }

  async removeStoredGroqApiKey(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('groq_api_key');
    } catch (e) {
      console.error('SecureStore delete failed:', e);
      throw e;
    }
  }

  // اطلاعات اپلیکیشن
  getAppInfo() {
    return {
      name: Constants.expoConfig?.name || 'Calorie Tracker',
      version: Constants.expoConfig?.version || '1.0.0',
      slug: Constants.expoConfig?.slug || 'calorie-tracker-app',
    };
  }

  // چک کردن حالت Development
  isDevelopment(): boolean {
    return __DEV__;
  }

  // Platform detection
  getPlatform() {
    return {
      isAndroid: Constants.platform?.android !== undefined,
      isIOS: Constants.platform?.ios !== undefined,
      isWeb: Constants.platform?.web !== undefined,
    };
  }
}

export default new ConfigService();