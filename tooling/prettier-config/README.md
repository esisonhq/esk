# @esk/prettier-config

This package bundles Prettier and its dependencies, making it easy to apply consistent code formatting across your applications.

## About Prettier

Code formatting refers to the consistent arrangement and styling of source code (such as indentation, spacing, line breaks, and punctuation) to make it more readable and maintainable. While formatting doesn’t affect how the code runs, it greatly improves clarity, reduces cognitive load, and helps teams collaborate more effectively.

Learn more at the [official Prettier site](https://prettier.io/).

## How to Use

Prettier will work automatically in the background of your IDE. You can also run prettier on all packages by running:

```bash title="Terminal"
bun format
```

## New Package Setup

### 1. Install Dependencies

```bash title="Terminal"
bun add --dev prettier @esk/prettier-config
```

### 2. Add Config Files

Add a `.prettierignore` file.

```bash title=".prettierignore"
**/build
**/public
```

Add a `.prettierrc.mjs` file.

```tsx title=".prettierrc.mjs"
import { config as baseConfig } from "@repo/prettier-config/base";

export default {
  ...baseConfig,
  // Add package specific overrides
};
```

### 3. IDE Configuration

If you're using VSCode, update your workspace settings to enable Prettier:

```json title=".vscode/settings.json"
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit",
    "source.organizeImports": "explicit",
    "source.sortMembers": "explicit"
  }
}
```
