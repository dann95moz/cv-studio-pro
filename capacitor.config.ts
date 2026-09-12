import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cvstudio.pro',
  appName: 'CV Studio Pro',
  webDir: 'dist',
  backgroundColor: '#080b12',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Keyboard: {
      resize: 'none',
      style: 'DARK',
    },
  },
};

export default config;
