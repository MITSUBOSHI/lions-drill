import type { CapacitorConfig } from '@capacitor/cli';
import team from './src/config/team.config.json';

const config: CapacitorConfig = {
  appId: team.capacitor.appId,
  appName: team.capacitor.appName,
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;
