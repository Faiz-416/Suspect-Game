import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.suspect.game',
  appName: 'Suspect',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
