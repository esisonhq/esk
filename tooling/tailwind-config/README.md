# @esk/tailwind-config

This package bundles TailwindCSS and its dependencies, making it easy to integrate consistent styling across your applications.

## About TailWindCSS

Tailwind CSS is a utility-first framework for building modern UIs. It provides low-level utility classes that let you style elements directly in your markup—no custom CSS required.

Learn more at the [official TailwindCSS site](https://tailwindcss.com).

## How to Use

Learn more at the [official TailwindCSS site](https://tailwindcss.com).

## New Package Setup

### 1. Install Dependencies

```bash title="Terminal"
bun add --dev @esk/tailwind-config
```

### 2. Import Styles

In your app’s `global.css`, import the base configuration:

```css title="global.css"
@import "@repo/tailwind-config";
```

### 3. Extend the Configuration (Optional)

You can customize Tailwind by creating a `tailwind.config.ts` file and extending the base config:

```typescript title="tailwind.config.ts"
import { config as baseConfig } from "@esk/tailwind-config/base";
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [baseConfig],
  theme: {
    extend: {},
  },
} satisfies Config;

export default config;
```

To use Tailwind’s `Config` type, install TailwindCSS as a dependency:

```bash title="Terminal"
bun add --dev tailwindcss
```
