import { config as baseConfig } from '@esk/ui/tailwind.config';
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [baseConfig],
  theme: {
    extend: {},
  },
} satisfies Config;

export default config;
