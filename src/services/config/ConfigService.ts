// src/services/config/ConfigService.ts - EXPO VERSION
import Constants from 'expo-constants';

class ConfigService {
  // دریافت API Key از app.json
  getGroqApiKey(): string {
    const apiKey = Constants.expoConfig?.extra?.groqApiKey;
    
    if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
      console.warn('⚠️ Groq API Key not configured! Please set it in app.json');
      return '';
    }
    
    return apiKey;
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