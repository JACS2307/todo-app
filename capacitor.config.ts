import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tunombre.todoapp',
  appName: 'todo-app',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    webContentsDebuggingEnabled: true,
  },
};

export default config;
